# Handoff AI/Data v0.2 ke Full-stack

## Contract yang diberikan

- BMKG integration contract (`BMKG_INTEGRATION_CONTRACT_v0.1.md`);
- canonical evidence semantic index (`CANONICAL_EVIDENCE_SCHEMA_v0.1.md`);
- confidence strength-of-basis semantics (`CONFIDENCE_SEMANTICS.md`);
- action catalog dengan ID stabil dan metadata UI/API (`ACTION_OPTIONS_CATALOG.md`);
- crop-context rule boundary (`CROP_CONTEXT_RULE_MAPPING.md`);
- cached/mock integration gates (`ADDITIONAL_INTEGRATION_TEST_SCENARIOS.md`);
- BMKG documented-field dictionary dan contoh struktur live;
- mapping raw BMKG ke canonical evidence;
- Field Pulse enum + unknown semantics;
- proposal `Land → CropContext → DecisionCase`;
- source freshness states;
- deterministic ruleset dan T1–T8 expectations;
- supplemental T7 stale-cache dan T8 Field Pulse confirmation scenarios;
- stable action option IDs;
- explanation fields untuk UI/Decision Brief.

## Keputusan implementasi yang perlu direview bersama

1. Bentuk persistence untuk Land, CropContext version, dan DecisionCase snapshot.
2. Raw payload storage/reference dan retention.
3. Adapter behavior ketika sebagian slot malformed atau analysis time bercampur.
4. Cache metadata (`fetched_at`, live failure, cache selected) dan UI delivery flag.
5. Location resolver output dan bukti bahwa kode resolver kompatibel dengan `adm4` BMKG.
6. Apakah backend menerima alias HOL-86 v0.1 selama migration window.

## Data yang masih dibutuhkan dari Full-stack

- sample adapter output dari target `adm4` demo;
- hasil spike location point/name → `adm4`;
- cache TTL/selection behavior yang benar-benar diterapkan;
- draft API dan persistence schema;
- error codes untuk upstream unavailable dan normalization failure.

## Acceptance checks integrasi

- Adapter hanya mengandalkan field BMKG yang didokumentasikan.
- BMKG attribution tersedia bagi UI.
- Raw missing tidak diubah menjadi default value.
- Unknown Field Pulse dapat disimpan.
- Assessment dapat unavailable/abstained.
- Tidak ada ranking, numeric risk score, atau final decision otomatis.
- Decision Record menyimpan snapshot/references dan tidak silent overwrite.
- Stable `option_id` dipertahankan saat persistence; UUID hanya row identifier.
- `official/external_api/is_mock=false` dan `official_mock/fixture/is_mock=true`.
- Delivery `live|cached` tidak disamakan dengan freshness.
- Crop stage tidak otomatis menjadi risk label.
- Confidence tidak ditampilkan sebagai probabilitas atau persentase.

## Minimum response yang dikonsumsi frontend

```text
status, context_state, confidence
factors[], missing_evidence[], limitations[]
action_options[] (stable option_id)
recommendation.recommended_option_id = null
evaluated_at, ruleset_version
bmkg_delivery, bmkg_freshness, field_pulse_freshness
```

Jika engine/validation gagal, backend mengembalikan atau menyimpan
`assessment_unavailable` tanpa action option. Jika evidence utama tidak cukup,
hasilnya `insufficient_evidence` dan abstained, bukan HTTP success dengan fakta
buatan.

## Commands sebelum integrasi

```text
python data/evidence/v0.2/validate_contract_pack_v0_2.py
python data/evidence/v0.2/test_reasoning_v0_2.py
```

Keduanya harus PASS sebelum backend mengganti projection/schema.
