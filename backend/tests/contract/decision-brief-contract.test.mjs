import assert from 'node:assert/strict';
import test from 'node:test';
import { formatDecisionBrief } from '../../dist/infrastructure/sharing/decision-brief-formatter.js';

const decisionCase = { id: 'case-1', decision_type: 'water_management' };
const decisionRecord = {
  id: 'record-1',
  decision_type: 'selected_option',
  decision_text: 'Minta pertimbangan pihak tepercaya',
  reason: 'Perlu verifikasi lapangan',
};

test('decision brief preserves the trusted human review', () => {
  const content = formatDecisionBrief({
    decisionCase,
    decisionRecord,
    trustedReviews: [{ reviewerName: 'Pak Aril', status: 'modify', comment: 'Periksa pintu air.' }],
  });
  assert.match(content, /Review manusia \(Pak Aril · modify\): Periksa pintu air\./);
});

test('decision brief stays valid when no trusted review was requested', () => {
  const content = formatDecisionBrief({ decisionCase, decisionRecord });
  assert.doesNotMatch(content, /Review manusia/);
});
