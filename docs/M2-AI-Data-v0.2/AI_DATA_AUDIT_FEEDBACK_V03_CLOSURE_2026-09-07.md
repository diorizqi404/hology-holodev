# AI/Data Audit Feedback v0.3 — Closure

Tanggal verifikasi: 7 September 2026  
Branch: `dev`

Dokumen feedback diperlakukan sebagai checklist review. Implementasi diverifikasi
terhadap source code dan kontrak RembukTani; tidak ada perubahan schema, RLS,
policy, auth, atau data Supabase.

## Keputusan arsitektur

Alur final adalah:

`Evidence -> deterministic Assessment -> Rule Mapping -> Action Catalog -> Action Alternatives -> Human Decision`

LLM berada setelah rule mapping dan hanya menjadi lapisan penjelasan. LLM menerima
assessment serta action yang sudah dipilih engine. Validator menolak respons bila
LLM menambah, menghapus, mengganti, atau mengubah ID action. Title katalog juga
selalu dipertahankan oleh kode, bukan dipercayakan kepada model.

## Closure matrix

| Temuan audit | Status | Implementasi |
|---|---|---|
| Boundary action generation | CLOSED | `action-catalog.ts` dan `mapActions()` memilih opsi deterministik. |
| LLM role limitation | CLOSED | Summary dibuat engine; output LLM hanya explanation untuk ID yang telah dipilih rules. |
| Action contract | CLOSED | Empat ID stabil, trigger factors, allowed states, ranking `null`. |
| Backend integration | CLOSED | Assessment tetap berisi factors/limitations; action response membawa UUID row dan `catalog_option_id`. |
| Crop Context integration | CLOSED | Crop name dan growth stage masuk input engine serta factors secara netral, tanpa risk inference. |
| Evidence traceability | CLOSED | Existing assessment-evidence links dan explanation source refs dipertahankan. |
| Abstention | CLOSED | `insufficient_evidence` hanya menghasilkan `OPT-DEFER`. |
| Human authority | CLOSED | `recommendedOptionId=null`; decision record tetap dibuat manusia. |

## Action rules

- `water_limited_or_irrigation_not_flowing` memunculkan verifikasi lapangan dan
  pengumpulan konteks sumber air.
- `important_information_missing` memunculkan pengumpulan/verifikasi informasi.
- `human_review_useful` memunculkan review pihak tepercaya.
- `insufficient_evidence` hanya memunculkan `OPT-DEFER`; tidak ada tindakan spesifik.

Urutan array adalah display order, bukan ranking.

## LLM enforcement

- Exact set equality diterapkan antara `rule_selected_actions[].optionId` dan
  `explanations[].option_id`.
- Duplicate, missing, atau unknown ID menyebabkan deterministic fallback.
- Frasa preskriptif seperti `disarankan`, `sebaiknya`, `segera`, `wajib`, dosis,
  volume, dan durasi ditolak.
- Kegagalan provider membuka circuit breaker satu menit; baseline tetap tersedia.

## Verification

- Backend production build: PASS.
- Backend demo typecheck: PASS.
- Compiled unit/contract tests: 6/6 PASS.
- Live Gemini contract test: PASS; mode `llm_enhanced` dan action ID/title identik
  sebelum dan setelah lapisan LLM.
- Supabase mutation: NONE.

## Acceptance checklist

- [x] Assessment contract final
- [x] Action catalog final
- [x] Action generation rule final
- [x] LLM tidak menentukan action
- [x] Evidence traceability tersedia
- [x] Backend response contract sesuai
- [x] Frontend contract sesuai
- [x] Crop context masuk reasoning
- [x] Error state dan deterministic fallback tersedia
