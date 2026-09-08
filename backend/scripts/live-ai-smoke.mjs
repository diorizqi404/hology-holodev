import { config } from '../dist/config.js';
import { LlmReasoningEnhancer } from '../dist/infrastructure/reasoning/llm-reasoning-enhancer.js';
import { WaterReasoningEngine } from '../dist/infrastructure/reasoning/water-reasoning-engine.js';

if (!config.llmEnabled || !config.llmApiKey) {
  console.error('Live AI smoke test requires LLM_ENABLED=true and GEMINI_API_KEY.');
  process.exit(2);
}

const now = new Date().toISOString();
const input = {
  decisionCaseId: 'LIVE-SMOKE-NON-PERSISTED',
  evaluatedAt: now,
  cropContext: {
    cropContextId: 'CROP-SYNTHETIC',
    cropName: 'Padi Sawah',
    varietyName: 'Inpari 32 HDB',
    growthStage: 'flowering',
  },
  bmkg: {
    evidenceId: 'BMKG-SYNTHETIC',
    delivery: 'live',
    evidence: {
      temporal: { analysis_time: now },
      payload: {
        forecast_slots: [{
          target_time_utc: now,
          target_time_local: now,
          weather_desc: 'Berawan',
          t: 27,
          hu: 80,
          ws: 2,
          wd: 'E',
          tcc: 70,
          vs_text: 'baik',
        }],
      },
    },
  },
  fieldPulse: {
    evidenceId: 'FIELD-SYNTHETIC',
    observedAt: now,
    waterPresence: 'limited',
    irrigationFlow: 'not_flowing',
  },
};

const baseline = new WaterReasoningEngine().evaluate(input);
const result = await new LlmReasoningEnhancer().enhance(input, baseline, null);
const identity = (assessment) => assessment.actionOptions.map(({ optionId, title }) => ({ optionId, title }));
const preserved = JSON.stringify(identity(result)) === JSON.stringify(identity(baseline));
const passed = result.generation?.mode === 'llm_enhanced'
  && result.actionSelection.source === 'rule_catalog'
  && result.actionSelection.ranking === null
  && result.summary === baseline.summary
  && preserved;

console.log(JSON.stringify({
  passed,
  model: result.generation?.model ?? config.llmModel,
  mode: result.generation?.mode,
  rulesetVersion: result.rulesetVersion,
  summarySource: 'deterministic_engine',
  actionIdentityPreserved: preserved,
  actionIds: result.actionOptions.map((option) => option.optionId),
  fallbackReason: result.generation?.fallbackReason,
}, null, 2));

if (!passed) process.exit(1);
