import { farmerApi, type ApiAssessmentResult, type ApiCropContext, type ApiDecisionCase, type ApiEvidence, type ApiLand } from "../services/farmer-api";

export type WorkflowData = { land: ApiLand; crop: ApiCropContext; decisionCase: ApiDecisionCase; evidence: ApiEvidence[]; result: ApiAssessmentResult };
export const workflowKey = (landId: string) => `rembuktani.workflow:${landId}`;
export const saveWorkflow = (landId: string, patch: Record<string, unknown>) => { const key=workflowKey(landId); const current=JSON.parse(sessionStorage.getItem(key)||"{}"); sessionStorage.setItem(key,JSON.stringify({...current,...patch})); };
export const readWorkflow = (landId: string): Record<string, unknown> => { try{return JSON.parse(sessionStorage.getItem(workflowKey(landId))||"{}")}catch{return {}} };

const assessmentRequests = new Map<string, Promise<WorkflowData>>();

async function loadAssessment(landId:string):Promise<WorkflowData>{
  const [land,crop,cases]=await Promise.all([farmerApi.getLand(landId),farmerApi.getActiveCrop(landId),farmerApi.listDecisionCases()]);
  const rememberedCaseId=String(readWorkflow(landId).case_id||"");
  let decisionCase=cases.find(x=>x.id===rememberedCaseId&&x.land_id===landId&&x.status!=="decided")||cases.filter(x=>x.land_id===landId&&x.status!=="decided").sort((a,b)=>b.updated_at.localeCompare(a.updated_at))[0];
  if(!decisionCase) decisionCase=await farmerApi.createDecisionCase({land_id:landId,crop_context_id:crop.id,decision_type:"water_management"});
  let evidence=await farmerApi.listEvidence(decisionCase.id);
  let evidenceChanged=false;
  const fieldPulse: Record<string, unknown> = (() => { try { return JSON.parse(sessionStorage.getItem(`field-pulse:${landId}`) || "{}"); } catch { return {}; } })();
  const fieldPulsePending = Object.keys(fieldPulse).length > 0;
  if(!evidence.some(x=>x.type==="bmkg_forecast")&&land.adm4_code){await farmerApi.refreshBmkg(decisionCase.id);evidenceChanged=true;}
  if(fieldPulsePending){const profile=await farmerApi.getProfile();const workflow=readWorkflow(landId);await farmerApi.createFieldPulse(decisionCase.id,{water_presence:String(fieldPulse.water_presence||"unknown"),irrigation_flow:String(fieldPulse.irrigation_flow||"unknown"),water_trend:workflow.water_trend?String(workflow.water_trend):undefined,reported_by:profile.display_name,observed_at:new Date().toISOString(),notes:String(fieldPulse.irrigation_note||"")||undefined,is_mock:false});evidenceChanged=true;}
  evidence=await farmerApi.listEvidence(decisionCase.id); let result:ApiAssessmentResult;
  const attemptKey=`rembuktani.llm-attempt:${decisionCase.id}`;
  const assessAndRemember=async()=>{const assessed=await farmerApi.assess(decisionCase.id);const status=await farmerApi.getReasoningStatus();sessionStorage.setItem(attemptKey,status.instance_id);return assessed};
  if(evidenceChanged){result=await assessAndRemember()}else try{result=await farmerApi.getAssessment(decisionCase.id);const status=await farmerApi.getReasoningStatus();if(status.mode==="llm_enhanced"&&!result.assessment.rule_version?.includes(status.model||"+llm")&&sessionStorage.getItem(attemptKey)!==status.instance_id)result=await assessAndRemember()}catch{result=await assessAndRemember()}
  saveWorkflow(landId,{case_id:decisionCase.id,assessment_id:result.assessment.id}); sessionStorage.removeItem(`field-pulse:${landId}`); return {land,crop,decisionCase,evidence,result};
}

export function ensureAssessment(landId:string):Promise<WorkflowData>{
  const current = assessmentRequests.get(landId);
  if (current) return current;
  const request = loadAssessment(landId).finally(() => assessmentRequests.delete(landId));
  assessmentRequests.set(landId, request);
  return request;
}
