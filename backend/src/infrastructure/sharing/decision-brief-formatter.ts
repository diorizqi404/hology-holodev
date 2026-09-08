import type { Assessment, DecisionCase, DecisionRecord } from '../../domain/types.js';

export type DecisionBriefInput = {
  decisionCase: DecisionCase;
  decisionRecord: DecisionRecord;
  assessment?: Assessment | null;
  trustedReviews?: Array<{ reviewerName?: string | null; status: string; comment?: string | null }>;
};

const decisionLabel: Record<DecisionRecord['decision_type'], string> = {
  selected_option: 'memilih opsi tindakan',
  custom: 'mencatat tindakan khusus',
  deferred: 'menunda keputusan',
};

export const formatDecisionBrief = ({
  decisionCase,
  decisionRecord,
  assessment,
  trustedReviews = [],
}: DecisionBriefInput): string => {
  const lines = [
    'RembukTani - Decision Brief',
    '',
    `Kasus: ${decisionCase.id}`,
    `Jenis keputusan: ${decisionCase.decision_type}`,
    `Keputusan manusia: ${decisionLabel[decisionRecord.decision_type]}`,
    `Catatan keputusan: ${decisionRecord.decision_text}`,
  ];

  if (decisionRecord.reason) lines.push(`Alasan: ${decisionRecord.reason}`);
  if (assessment) {
    lines.push(`Dasar penilaian: ${assessment.basis_strength ?? 'insufficient'}`);
    lines.push(`Ringkasan assessment: ${assessment.summary}`);
  }
  for (const review of trustedReviews) {
    lines.push(`Review manusia (${review.reviewerName || 'Reviewer'} · ${review.status}): ${review.comment || 'Tidak ada catatan tambahan.'}`);
  }

  lines.push(
    '',
    'Catatan: assessment bersifat pendukung. Keputusan akhir dibuat oleh manusia.',
    `Decision record: ${decisionRecord.id}`,
  );

  return lines.join('\n');
};
