import { config } from '../../config.js';
import type { CropContext } from '../../domain/types.js';
import type { ReasoningAssessment, ReasoningInput } from './reasoning.types.js';

type LlmOutput = { explanations: Array<{ option_id: string; description: string; rationale: string }> };
export type EnhancedAssessment = ReasoningAssessment & { generatedSummary?: string; generatedFactors?: string[]; generatedMissingEvidence?: string[]; generatedLimitations?: string[] };

const schema = {
  type: 'object', required: ['explanations'],
  properties: {
    explanations: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'object', required: ['option_id','description','rationale'], properties: { option_id: { type: 'string' }, description: { type: 'string' }, rationale: { type: 'string' } } } },
  },
};

const forbidden = /\b(\d+(?:[.,]\d+)?\s*(?:liter|l\/s|mm|kg|gram|jam|menit|hari|ml|ton|cm)|pasti|dijamin|disarankan|sebaiknya|segera|wajib|harus memompa|semprot|dosis)\b/i;
const clean = (value: unknown, max: number): string => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
function validate(value: unknown, allowedOptionIds: string[]): LlmOutput {
  if (!value || typeof value !== 'object') throw new Error('LLM output is not an object');
  const candidate=value as Partial<LlmOutput>;
  if (!Array.isArray(candidate.explanations) || candidate.explanations.length !== allowedOptionIds.length) throw new Error('LLM explanation count is invalid');
  const explanations=candidate.explanations.map(item=>({option_id:clean(item?.option_id,120),description:clean(item?.description,360),rationale:clean(item?.rationale,360)}));
  const returnedIds=explanations.map(item=>item.option_id);
  if(new Set(returnedIds).size!==returnedIds.length||allowedOptionIds.some(id=>!returnedIds.includes(id))||returnedIds.some(id=>!allowedOptionIds.includes(id))) throw new Error('LLM changed rule-selected action IDs');
  if(explanations.some(item=>!item.description||!item.rationale||forbidden.test(`${item.description} ${item.rationale}`))) throw new Error('LLM explanation failed safety validation');
  return {explanations};
}

export class LlmReasoningEnhancer {
  private retryAfter = 0;
  constructor(private readonly apiKey=config.llmApiKey, private readonly model=config.llmModel, private readonly enabled=config.llmEnabled) {}
  async enhance(input:ReasoningInput, baseline:ReasoningAssessment, crop:CropContext|null):Promise<EnhancedAssessment>{
    if(!this.enabled||!this.apiKey)return {...baseline,generation:{mode:'deterministic_fallback',fallbackReason:'LLM belum dikonfigurasi'}};
    if(Date.now()<this.retryAfter)return {...baseline,generation:{mode:'deterministic_fallback',provider:'google-gemini',model:this.model,fallbackReason:'LLM cooldown setelah kegagalan sebelumnya'}};
    try{
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8_000);
      const safeInput={crop:crop?{crop_name:crop.crop_name,variety_name:crop.variety_name,growth_stage:crop.growth_stage,planting_date:crop.planting_date}:null,bmkg:input.bmkg?{source:'BMKG',delivery:input.bmkg.delivery,analysis_time:input.bmkg.evidence.temporal.analysis_time,forecast_slots:input.bmkg.evidence.payload.forecast_slots.slice(0,8)}:null,field_pulse:input.fieldPulse?{water_presence:input.fieldPulse.waterPresence,irrigation_flow:input.fieldPulse.irrigationFlow,water_trend:input.fieldPulse.waterTrend,observed_at:input.fieldPulse.observedAt}:null,assessment:{context_state:baseline.contextState,confidence:baseline.confidence,factors:baseline.factors,missing_evidence:baseline.missingEvidence,limitations:baseline.limitations},rule_selected_actions:baseline.actionOptions};
      const prompt=`Anda adalah lapisan penjelasan RembukTani. Jelaskan opsi ruleset berdasarkan tiga jawaban Field Pulse, konteks tanaman, dan bukti yang tersedia. Jangan mengubah assessment, memilih tindakan, atau membuat keputusan. Hasil bukan diagnosis maupun instruksi wajib. Jangan menciptakan data, dosis, volume, durasi, jadwal presisi, atau klaim kepastian. Kembalikan tepat satu explanation untuk setiap option_id; jangan mengubah option_id/title, menambah, menghapus, atau mengurutkan opsi. Keputusan akhir milik petani.\nDATA=${JSON.stringify(safeInput)}`;
      const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':this.apiKey},signal:controller.signal,body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.2,maxOutputTokens:3000,responseMimeType:'application/json',responseSchema:schema}})}).finally(()=>clearTimeout(timeout));
      if(!response.ok)throw new Error(`Gemini HTTP ${response.status}`);const body=await response.json() as {candidates?:Array<{content?:{parts?:Array<{text?:string}>}}>};const text=body.candidates?.[0]?.content?.parts?.[0]?.text;if(!text)throw new Error('Gemini returned no structured text');const generated=validate(JSON.parse(text),baseline.actionOptions.map(option=>option.optionId));
      const explanationById=new Map(generated.explanations.map(item=>[item.option_id,item]));
      return {...baseline,actionOptions:baseline.actionOptions.map(option=>({...option,description:explanationById.get(option.optionId)?.description??option.description,rationale:explanationById.get(option.optionId)?.rationale??option.rationale})),rulesetVersion:`${baseline.rulesetVersion}+${this.model}+explanation-only`,generation:{mode:'llm_enhanced',provider:'google-gemini',model:this.model}};
    }catch(error){this.retryAfter=Date.now()+60_000;return {...baseline,generation:{mode:'deterministic_fallback',provider:'google-gemini',model:this.model,fallbackReason:error instanceof Error?error.message:'LLM gagal'}};}
  }
}
