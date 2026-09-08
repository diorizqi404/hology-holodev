import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ACTION_CATALOG } from '../../dist/infrastructure/reasoning/action-catalog.js';
import { LlmReasoningEnhancer } from '../../dist/infrastructure/reasoning/llm-reasoning-enhancer.js';
import { WaterReasoningEngine } from '../../dist/infrastructure/reasoning/water-reasoning-engine.js';

const evaluatedAt = '2026-09-07T08:00:00.000Z';
const cropContext = {
  cropContextId: 'CROP-QA-001',
  cropName: 'Padi Sawah',
  varietyName: 'Inpari 32 HDB',
  growthStage: 'flowering',
  plantingDate: '2026-07-01',
};
const bmkgEvidence = {
  evidence_id: 'BMKG-QA-001',
  temporal: { analysis_time: '2026-09-07T06:00:00.000Z' },
  payload: {
    forecast_slots: [{
      target_time_utc: '2026-09-07T09:00:00.000Z',
      target_time_local: '2026-09-07 16:00:00',
      weather_desc: 'Berawan',
      t: 27,
      hu: 80,
      ws: 2,
      wd: 'E',
      tcc: 70,
      vs_text: 'baik',
    }],
  },
};
const completeInput = {
  decisionCaseId: 'CASE-QA-001',
  evaluatedAt,
  cropContext,
  bmkg: { evidenceId: 'BMKG-QA-001', evidence: bmkgEvidence, delivery: 'live' },
  fieldPulse: {
    evidenceId: 'FIELD-QA-001',
    observedAt: '2026-09-07T07:55:00.000Z',
    waterPresence: 'limited',
    irrigationFlow: 'not_flowing',
  },
};
const engine = new WaterReasoningEngine();
const ids = (assessment) => assessment.actionOptions.map((option) => option.optionId);

test('catalog IDs are unique and contain no ranking or prescription parameters', () => {
  assert.equal(new Set(ACTION_CATALOG.map((item) => item.optionId)).size, ACTION_CATALOG.length);
  assert.deepEqual(ACTION_CATALOG.map((item) => item.optionId), [
    'OPT-VERIFY-FIELD',
    'OPT-COLLECT-WATER-SOURCE',
    'OPT-REQUEST-REVIEW',
    'OPT-DEFER',
  ]);
});

test('executable catalog stays synchronized with the canonical JSON contract', () => {
  const canonical = JSON.parse(readFileSync(new URL('../../../data/evidence/v0.2/ACTION_OPTIONS_v0.2.json', import.meta.url), 'utf8'));
  assert.equal(canonical.ranking, null);
  assert.equal(canonical.prescriptive_parameters, false);
  assert.deepEqual(canonical.options.map((option) => ({
    id: option.option_id,
    allowedStates: option.allowed_states,
    triggerFactors: option.trigger_factors,
  })), ACTION_CATALOG.map((option) => ({
    id: option.optionId,
    allowedStates: option.allowedStates,
    triggerFactors: option.triggerFactors,
  })));
});

test('complete evidence maps limited water to safe catalog alternatives', () => {
  const result = engine.evaluate(completeInput);
  assert.equal(result.contextState, 'context_available');
  assert.equal(result.confidence, 'medium');
  assert.deepEqual(ids(result), ['OPT-VERIFY-FIELD', 'OPT-COLLECT-WATER-SOURCE', 'OPT-REQUEST-REVIEW']);
  assert.deepEqual(result.actionSelection, { source: 'rule_catalog', ranking: null });
  assert.equal(result.recommendation.recommendedOptionId, null);
});

test('cached delivery does not automatically mean stale evidence', () => {
  const result = engine.evaluate({ ...completeInput, bmkg: { ...completeInput.bmkg, delivery: 'cached' } });
  assert.equal(result.contextState, 'context_available');
  assert.equal(result.confidence, 'medium');
  assert.deepEqual(ids(result), ['OPT-VERIFY-FIELD', 'OPT-COLLECT-WATER-SOURCE', 'OPT-REQUEST-REVIEW']);
});

test('partial Field Pulse requests verification and keeps defer available', () => {
  const result = engine.evaluate({
    ...completeInput,
    fieldPulse: { ...completeInput.fieldPulse, irrigationFlow: 'unknown' },
  });
  assert.equal(result.contextState, 'needs_verification');
  assert.deepEqual(ids(result), ['OPT-VERIFY-FIELD', 'OPT-COLLECT-WATER-SOURCE', 'OPT-REQUEST-REVIEW', 'OPT-DEFER']);
});

for (const [name, patch] of [
  ['BMKG missing', { bmkg: undefined }],
  ['Field Pulse missing', { fieldPulse: undefined }],
  ['Field Pulse timestamp is in the future', { fieldPulse: { ...completeInput.fieldPulse, observedAt: '2026-09-08T08:00:00.000Z' } }],
]) {
  test(`${name} abstains and exposes only OPT-DEFER`, () => {
    const result = engine.evaluate({ ...completeInput, ...patch });
    assert.equal(result.contextState, 'insufficient_evidence');
    assert.equal(result.confidence, 'low');
    assert.deepEqual(ids(result), ['OPT-DEFER']);
  });
}

test('crop context is used neutrally and unknown stage remains explicit', () => {
  const result = engine.evaluate({ ...completeInput, cropContext: { ...cropContext, growthStage: 'unknown' } });
  assert.ok(result.factors.includes('Crop context: Padi Sawah; growth stage: unknown'));
  assert.ok(result.explanation.unknownItems.some((item) => item.code === 'crop_growth_stage_unknown'));
  assert.ok(result.factors.every((factor) => !/risk|risiko|gagal panen/i.test(factor)));
});

test('invalid evaluation timestamp is rejected', () => {
  assert.throws(() => engine.evaluate({ ...completeInput, evaluatedAt: 'invalid' }), /ISO timestamp/);
});

test('512 evidence combinations preserve safety and catalog invariants', () => {
  const waterValues = ['present', 'limited', 'none', 'unknown'];
  const flowValues = ['flowing', 'limited', 'not_flowing', 'unknown'];
  const growthStages = ['vegetative', 'flowering', 'ripening', 'unknown'];
  const catalogIds = new Set(ACTION_CATALOG.map((item) => item.optionId));
  let evaluated = 0;
  for (const hasBmkg of [true, false]) {
    for (const waterPresence of waterValues) {
      for (const irrigationFlow of flowValues) {
        for (const futureTimestamp of [false, true]) {
          for (const growthStage of growthStages) {
            for (const hasCropContext of [true, false]) {
              const result = engine.evaluate({
                ...completeInput,
                bmkg: hasBmkg ? completeInput.bmkg : undefined,
                cropContext: hasCropContext ? { ...cropContext, growthStage } : undefined,
                fieldPulse: {
                  ...completeInput.fieldPulse,
                  observedAt: futureTimestamp ? '2026-09-08T08:00:00.000Z' : completeInput.fieldPulse.observedAt,
                  waterPresence,
                  irrigationFlow,
                },
              });
              const resultIds = ids(result);
              assert.equal(new Set(resultIds).size, resultIds.length);
              assert.ok(resultIds.every((id) => catalogIds.has(id)));
              assert.equal(result.actionSelection.ranking, null);
              assert.equal(result.recommendation.recommendedOptionId, null);
              if (!hasCropContext) assert.ok(result.missingEvidence.includes('crop_context'));
              if (result.contextState === 'insufficient_evidence') assert.deepEqual(resultIds, ['OPT-DEFER']);
              evaluated += 1;
            }
          }
        }
      }
    }
  }
  assert.equal(evaluated, 512);
});

test('disabled LLM always preserves deterministic assessment', async () => {
  const baseline = engine.evaluate(completeInput);
  const result = await new LlmReasoningEnhancer(undefined, 'gemini-test', false).enhance(completeInput, baseline, null);
  assert.equal(result.generation?.mode, 'deterministic_fallback');
  assert.deepEqual(result.actionOptions, baseline.actionOptions);
  assert.equal(result.summary, baseline.summary);
});

async function withMockFetch(responseFactory, run) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = responseFactory;
  try { return await run(); } finally { globalThis.fetch = originalFetch; }
}

const geminiResponse = (payload, status = 200) => new Response(JSON.stringify(payload), { status });
const candidate = (value) => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }] });

test('LLM cannot inject an action outside the rule-selected exact ID set', async () => {
  const baseline = engine.evaluate(completeInput);
  const explanations = baseline.actionOptions.map((option) => ({ option_id: option.optionId, description: 'Bahasa netral.', rationale: 'Berdasarkan bukti tercatat.' }));
  explanations.push({ option_id: 'OPT-PUMP-NOW', description: 'Nyalakan pompa.', rationale: 'Model memilih tindakan.' });
  const result = await withMockFetch(
    async () => geminiResponse(candidate({ explanations })),
    () => new LlmReasoningEnhancer('test-key', 'gemini-test', true).enhance(completeInput, baseline, null),
  );
  assert.equal(result.generation?.mode, 'deterministic_fallback');
  assert.deepEqual(result.actionOptions, baseline.actionOptions);
});

test('prescriptive language or numeric duration is rejected', async () => {
  const baseline = engine.evaluate(completeInput);
  const explanations = baseline.actionOptions.map((option) => ({ option_id: option.optionId, description: 'Sebaiknya pompa selama 2 jam.', rationale: 'Air terbatas.' }));
  const result = await withMockFetch(
    async () => geminiResponse(candidate({ explanations })),
    () => new LlmReasoningEnhancer('test-key', 'gemini-test', true).enhance(completeInput, baseline, null),
  );
  assert.equal(result.generation?.mode, 'deterministic_fallback');
  assert.deepEqual(result.actionOptions, baseline.actionOptions);
});

test('provider failure opens cooldown and avoids a repeated provider call', async () => {
  const baseline = engine.evaluate(completeInput);
  let calls = 0;
  const enhancer = new LlmReasoningEnhancer('test-key', 'gemini-test', true);
  await withMockFetch(async () => { calls += 1; return geminiResponse({ error: 'unavailable' }, 503); }, async () => {
    const first = await enhancer.enhance(completeInput, baseline, null);
    const second = await enhancer.enhance(completeInput, baseline, null);
    assert.equal(first.generation?.mode, 'deterministic_fallback');
    assert.match(second.generation?.fallbackReason ?? '', /cooldown/);
  });
  assert.equal(calls, 1);
});

test('valid LLM explanation preserves rule-selected IDs, titles, order, and deterministic summary', async () => {
  const baseline = engine.evaluate(completeInput);
  const explanations = baseline.actionOptions.map((option) => ({
    option_id: option.optionId,
    description: 'Opsi ini membantu petani meninjau informasi yang sudah tercatat.',
    rationale: 'Konteks berasal dari evidence yang tersedia dan masih memiliki keterbatasan.',
  }));
  const result = await withMockFetch(
    async () => geminiResponse(candidate({ explanations })),
    () => new LlmReasoningEnhancer('test-key', 'gemini-test', true).enhance(completeInput, baseline, null),
  );
  assert.equal(result.generation?.mode, 'llm_enhanced');
  assert.equal(result.summary, baseline.summary);
  assert.deepEqual(ids(result), ids(baseline));
  assert.deepEqual(result.actionOptions.map((option) => option.title), baseline.actionOptions.map((option) => option.title));
  assert.match(result.rulesetVersion, /explanation-only$/);
});
