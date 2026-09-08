# AI/Data v0.2 Test Report

**Diperbarui:** 6 September 2026
**Commands:**

```text
python data/evidence/v0.2/validate_contract_pack_v0_2.py
python data/evidence/v0.2/test_reasoning_v0_2.py
```

## Result

```text
T1_NORMAL: PASS
T2_FIELD_PULSE_UNKNOWN: PASS
T3_BMKG_UNAVAILABLE: PASS
T4_CACHED_BMKG: PASS
T5_CONFLICTING_LOCAL_OBSERVATION: PASS
T6_REASONING_FAILURE: PASS
T7_CACHED_BMKG_STALE: PASS
T8_FIELD_PULSE_NEEDS_CONFIRMATION: PASS
8 scenarios passed; same input + evaluation time = same output
```

Seluruh JSON pada `data/evidence/v0.2/` juga berhasil diparse dan input/output
setiap skenario lolos JSON Schema draft 2020-12. Test memastikan:

- output repeatable untuk input dan evaluation time yang sama;
- confidence `high` tidak digunakan;
- `recommended_option_id` selalu null;
- missing BMKG menyebabkan abstention;
- unknown Field Pulse tetap valid tetapi meminta verifikasi;
- reasoning failure tidak menghasilkan assessment palsu.

Contract-pack validation juga memastikan canonical BMKG example lolos schema,
urutan timestamp valid, option ID unik, scenario/expected result 8/8 lengkap,
serta safety flags ruleset tetap terkunci.

## Contract validation result

```text
BMKG canonical schema: PASS
Canonical temporal/provenance invariants: PASS
Mock provenance protection: PASS
Action option registry invariants: PASS
Scenario/expected-result coverage: PASS (8/8)
Ruleset safety invariants: PASS
```

Mock protection mencakup positive fixture semantics dan negative gates untuk
kombinasi provenance yang tidak konsisten. Action-option validation juga
mewajibkan `option_id`, `title`, `description`, dan `rationale` terisi.
