# Canonical Evidence Schema v0.1

**Status:** normative semantic index; backend tidak boleh menebak field.

**Version alignment:** HOL-86 canonical contract + AI/Data v0.2 projection.

## Envelope bersama

Setiap evidence memiliki identitas, tipe, referensi lahan dan kasus, provenance,
waktu observasi/target, payload asli atau referensinya, serta status kualitas yang
menjelaskan basisnya. Evidence tidak boleh menyimpan keputusan manusia sebagai
fakta sumber.

## 1. BMKG external evidence

Struktur executable: `data/evidence/v0.2/bmkg_canonical_evidence.schema.json`.

```text
evidence_id, evidence_type=climate_external
land_ref, decision_case_ref
source, provenance, location, temporal, quality
payload.analysis_time, payload.forecast_slots[]
```

BMKG hanya menjelaskan prakiraan atmosfer. Ia bukan observasi air petak.

## 2. Field Pulse evidence

Kontrak rinci: `FIELD_PULSE_CONTRACT_v0.2.md`.

```text
water_presence: present | limited | none | unknown
irrigation_flow: flowing | limited | not_flowing | unknown
observed_at: date-time
```

`unknown` adalah jawaban valid. Nilai tersebut tidak boleh dikonversi menjadi
label risiko.

## 3. Crop Context evidence

Snapshot minimal reasoning:

```text
crop_context_id
land_id
crop
stage (optional until a curated rule exists)
recorded_at
```

Crop stage adalah konteks, bukan risk label. Ketiadaan active crop context harus
muncul sebagai `missing_evidence`, bukan diisi dengan asumsi.

## Reasoning projection

Input/output executable berada di `data/evidence/v0.2/reasoning_io.schema.json`.
Projection boleh lebih ringkas daripada record persistence, tetapi wajib membawa
ID evidence, waktu evaluasi, waktu mulai kasus, freshness/delivery, dan field yang
benar-benar dipakai. Assessment hanya boleh menautkan evidence yang dipakai.
