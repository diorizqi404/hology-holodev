# RembukTani — AI/Data Contract Pack v0.2

**Tanggal:** 3 September 2026  
**Status:** executable contract; audit v0.3 closed dan scenario matrix lulus
**Source of truth:** `docs/role/LAPORAN_KONTEKS_PROYEK_REMBUKTANI_v0.2.md`

Paket ini merekonsiliasi baseline HOL-86/HOL-87 v0.1 dengan produk berbasis
lahan dan BMKG Public Forecast API aktual.

## Isi

- `BMKG_DATA_DICTIONARY.md`
- `FIELD_PULSE_CONTRACT_v0.2.md`
- `HOL86_RECONCILIATION_v0.2.md`
- `BMKG_TO_CANONICAL_MAPPING.md`
- `EVIDENCE_FRESHNESS_POLICY_v0.2.md`
- `HOL87_REASONING_BASELINE_v0.2.md`
- `CURATED_SOURCE_PACK_v0.2.md`
- `EXPLANATION_CONTRACT_v0.2.md`
- `ACTION_OPTIONS_v0.2.md`
- `CROSS_ROLE_REVIEW.md`
- `HANDOFF_FULLSTACK.md`
- `TEST_REPORT.md`
- `AI_DATA_POST_MERGE_AUDIT_2026-09-05.md`
- `BMKG_INTEGRATION_CONTRACT_v0.1.md`
- `CANONICAL_EVIDENCE_SCHEMA_v0.1.md`
- `CONFIDENCE_SEMANTICS.md`
- `ACTION_OPTIONS_CATALOG.md`
- `CROP_CONTEXT_RULE_MAPPING.md`
- `ADDITIONAL_INTEGRATION_TEST_SCENARIOS.md`
- `AI_DATA_REVIEW_CLOSURE_2026-09-06.md`
- `AI_DATA_AUDIT_FEEDBACK_V03_CLOSURE_2026-09-07.md`
- `AI_REASONING_SCENARIO_TEST_REPORT_v0.4.md`

Artefak executable berada di `data/evidence/v0.2/`.

`bmkg_canonical_example.json` adalah object evidence untuk boundary adapter →
Evidence Service. Input engine memakai projection ringkas dari object tersebut;
projection ini tidak mengubah atau menghapus raw evidence tersimpan.

Backend dapat memulai dengan dua pemeriksaan kontrak:

```text
python data/evidence/v0.2/validate_contract_pack_v0_2.py
python data/evidence/v0.2/test_reasoning_v0_2.py
```

Suite kontrak TypeScript/backend terbaru:

```text
cd backend
npm run test:ai-contract
```

## Boundary

- BMKG forecast adalah external evidence, bukan kondisi air aktual lahan.
- Field Pulse adalah observasi user, bukan label risiko.
- Engine deterministic dapat abstain dan tidak memilih keputusan akhir.
- Tidak ada threshold agronomis, risk score 0–100, atau ranking opsi.
