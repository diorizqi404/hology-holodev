import assert from 'node:assert/strict';
import test from 'node:test';
import { WaterReasoningEngine } from '../../src/infrastructure/reasoning/water-reasoning-engine.js';
import type { ReasoningInput } from '../../src/infrastructure/reasoning/reasoning.types.js';
import type { BmkgCanonicalEvidence } from '../../src/infrastructure/bmkg/bmkg.types.js';

const bmkgEvidence = {
  evidence_id: 'EVD-BMKG-001',
  evidence_type: 'climate_external',
  land_ref: { land_id: 'LAND-001' },
  decision_case_ref: { decision_case_id: 'CASE-001' },
  source: { category: 'official', name: 'BMKG', attribution_required: true, documentation_url: 'https://data.bmkg.go.id/prakiraan-cuaca/' },
  provenance: { collection_mode: 'external_api', is_mock: false, fetched_at: '2026-09-05T08:00:00Z', request: { uri: 'https://example.test' }, raw_payload_ref: 'bmkg://test' },
  location: { administrative: { adm1: '35', adm2: '35.07', adm3: '35.07.13', adm4: '35.07.13.1010', province: 'Jawa Timur', regency: 'Malang', district: 'Kepanjen', village: 'Kepanjen' }, source_point: { lat: -8, lon: 112 }, timezone: 'Asia/Jakarta' },
  temporal: { analysis_time: '2026-09-05T00:00:00.000Z', first_target_time: '2026-09-05T09:00:00.000Z', last_target_time: '2026-09-05T09:00:00.000Z' },
  quality: { level: 'unknown', basis: 'test' },
  payload: { analysis_time: '2026-09-05T00:00:00.000Z', forecast_slots: [{ target_time_utc: '2026-09-05T09:00:00.000Z', target_time_local: '2026-09-05 16:00:00', t: 30, hu: 70, weather_desc: 'Cerah', weather_desc_en: 'Sunny', ws: 5, wd: 'E', tcc: 20, vs_text: '> 10 km' }] },
} as BmkgCanonicalEvidence;

const baseInput: ReasoningInput = {
  decisionCaseId: 'CASE-001',
  evaluatedAt: '2026-09-05T08:15:00Z',
  cropContext: { cropContextId: 'CROP-001', cropName: 'Padi Sawah', varietyName: 'Inpari 32 HDB', growthStage: 'flowering' },
  bmkg: { evidenceId: 'EVD-BMKG-001', evidence: bmkgEvidence, delivery: 'live' },
  fieldPulse: { evidenceId: 'EVD-FIELD-001', observedAt: '2026-09-05T08:10:00Z', waterPresence: 'limited', irrigationFlow: 'not_flowing' },
};

test('returns context_available with alternatives only for complete evidence', () => {
  const result = new WaterReasoningEngine().evaluate(baseInput);
  assert.equal(result.contextState, 'context_available');
  assert.equal(result.confidence, 'medium');
  assert.equal(result.recommendation.recommendedOptionId, null);
  assert.equal(result.actionSelection.source, 'rule_catalog');
  assert.equal(result.actionSelection.ranking, null);
  assert.deepEqual(result.actionOptions.map((option) => option.optionId), [
    'OPT-VERIFY-FIELD',
    'OPT-COLLECT-WATER-SOURCE',
    'OPT-REQUEST-REVIEW',
  ]);
  assert.ok(result.factors.some((factor) => factor.includes('growth stage: flowering')));
});

test('keeps unknown field observations valid and requests verification', () => {
  const result = new WaterReasoningEngine().evaluate({
    ...baseInput,
    fieldPulse: { ...baseInput.fieldPulse!, irrigationFlow: 'unknown' },
  });
  assert.equal(result.contextState, 'needs_verification');
  assert.ok(result.explanation.unknownItems.some((item) => item.code === 'irrigation_flow_unknown'));
});

test('abstains when BMKG evidence is unavailable', () => {
  const result = new WaterReasoningEngine().evaluate({
    ...baseInput,
    bmkg: undefined,
  });
  assert.equal(result.contextState, 'insufficient_evidence');
  assert.ok(result.missingEvidence.includes('bmkg_forecast'));
  assert.deepEqual(result.actionOptions.map((option) => option.optionId), ['OPT-DEFER']);
});
