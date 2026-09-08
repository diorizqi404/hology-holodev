import type { AssessmentContextState, ReasoningAssessment } from './reasoning.types.js';

export type ActionTrigger =
  | 'always'
  | 'important_information_missing'
  | 'water_limited_or_irrigation_not_flowing'
  | 'human_review_useful';

export type ActionCatalogItem = ReasoningAssessment['actionOptions'][number] & {
  allowedStates: AssessmentContextState[];
  triggerFactors: ActionTrigger[];
};

export const ACTION_CATALOG: readonly ActionCatalogItem[] = [
  {
    optionId: 'OPT-VERIFY-FIELD',
    title: 'Periksa kembali kondisi lahan',
    description: 'Ulangi pengamatan lokal yang relevan untuk kasus aktif.',
    rationale: 'Mengurangi informasi lokal yang belum diketahui atau perlu konfirmasi.',
    allowedStates: ['context_available', 'needs_verification'],
    triggerFactors: ['water_limited_or_irrigation_not_flowing', 'important_information_missing'],
  },
  {
    optionId: 'OPT-COLLECT-WATER-SOURCE',
    title: 'Konfirmasi kondisi sumber air',
    description: 'Catat kondisi atau alokasi sumber air tanpa menetapkan volume atau durasi.',
    rationale: 'Melengkapi konteks air yang belum tersedia.',
    allowedStates: ['context_available', 'needs_verification'],
    triggerFactors: ['water_limited_or_irrigation_not_flowing', 'important_information_missing'],
  },
  {
    optionId: 'OPT-REQUEST-REVIEW',
    title: 'Minta pertimbangan pihak tepercaya',
    description: 'Bagikan evidence kepada reviewer atau penyuluh untuk telaah manusia.',
    rationale: 'Menambah konteks ketika evidence terbatas atau perlu konfirmasi.',
    allowedStates: ['context_available', 'needs_verification'],
    triggerFactors: ['human_review_useful'],
  },
  {
    optionId: 'OPT-DEFER',
    title: 'Tunda perubahan',
    description: 'Tunda perubahan tindakan sampai informasi cukup.',
    rationale: 'Menjaga abstention saat dasar keputusan belum memadai.',
    allowedStates: ['needs_verification', 'insufficient_evidence'],
    triggerFactors: ['always'],
  },
] as const;

export function mapActions(
  state: AssessmentContextState,
  triggers: ReadonlySet<ActionTrigger>,
): ReasoningAssessment['actionOptions'] {
  return ACTION_CATALOG
    .filter((item) => item.allowedStates.includes(state))
    .filter((item) => item.triggerFactors.includes('always') || item.triggerFactors.some((trigger) => triggers.has(trigger)))
    .map(({ optionId, title, description, rationale }) => ({ optionId, title, description, rationale }));
}
