# RembukTani --- AI/Data Engineer Review & Improvement Report v0.1

## Tujuan

Dokumen ini adalah hasil audit implementasi AI/Data RembukTani.

Fokus audit:

-   kesesuaian dengan product boundary;
-   evidence architecture;
-   BMKG mapping;
-   reasoning;
-   rubric/scoring;
-   explainability;
-   integration readiness.

------------------------------------------------------------------------

# Executive Summary

Status:

**READY FOR ITERATION, NOT READY FOR FINAL INTEGRATION**

Secara konsep AI/Data sudah sesuai dengan arah RembukTani.

Yang harus dipertahankan:

-   decision-support boundary;
-   evidence separation;
-   deterministic reasoning;
-   abstention behavior;
-   human final decision;
-   no ranked recommendation.

Yang perlu diperbaiki sebelum backend integration:

1.  BMKG Integration Contract.
2.  Canonical Evidence Schema.
3.  Confidence Semantics.
4.  Action Option Catalog.
5.  Crop Context Rule Mapping.
6.  Additional Integration Test Scenario.

------------------------------------------------------------------------

# A. Yang Sudah Bagus dan Harus Dipertahankan

## 1. Decision Boundary

Model yang benar:

    Evidence
    ↓
    Assessment
    ↓
    Action Alternatives
    ↓
    Human Decision

Bukan:

    Data
    ↓
    AI
    ↓
    Final Recommendation

AI/Data tidak boleh:

-   membuat keputusan final;
-   menentukan tindakan wajib;
-   membuat prescription irigasi;
-   menggantikan keputusan manusia.

------------------------------------------------------------------------

## 2. Evidence Architecture

Pertahankan pemisahan:

    External Evidence
    +
    Local Observation
    +
    Crop Context
    ↓
    Assessment

Evidence utama:

-   BMKG Forecast;
-   Field Pulse;
-   Crop Context.

------------------------------------------------------------------------

## 3. Field Pulse Contract

Sudah benar karena merupakan observasi.

Contoh:

    water_presence:

    present
    limited
    none
    unknown

dan:

    irrigation_flow:

    flowing
    limited
    not_flowing
    unknown

Jangan mengubahnya menjadi risk label.

------------------------------------------------------------------------

## 4. Abstention

Sistem harus bisa mengatakan:

"Informasi belum cukup."

Jangan memaksa output.

------------------------------------------------------------------------

## 5. Tidak Menggunakan Numeric Risk Score

Jangan gunakan:

    Risk Score 82%

Gunakan basis penilaian:

-   sufficient;
-   limited;
-   insufficient.

Confidence bukan probabilitas.

------------------------------------------------------------------------

# B. Perbaikan Wajib

# P0 --- BMKG Integration Contract

Buat:

    BMKG_INTEGRATION_CONTRACT_v0.1.md

Dokumen harus menjelaskan:

  BMKG Field     Canonical Field     Digunakan
  -------------- ------------------- -----------
  t              temperature.value   Ya
  hu             humidity.value      Ya
  weather_desc   weather.condition   Ya
  ws             wind.speed          Optional

Flow:

    BMKG Raw
    ↓
    Normalizer
    ↓
    Canonical Evidence
    ↓
    Reasoning

------------------------------------------------------------------------

# P0 --- Canonical Evidence Schema

Buat:

    CANONICAL_EVIDENCE_SCHEMA_v0.1.md

Definisikan:

-   BMKG evidence;
-   Field Pulse evidence;
-   Crop Context evidence.

Backend tidak boleh menebak struktur.

------------------------------------------------------------------------

# P0 --- Confidence Semantics

Buat:

    CONFIDENCE_SEMANTICS.md

Confidence bukan probabilitas.

Definisi:

## Sufficient Basis

    BMKG tersedia
    +
    Field Pulse tersedia
    +
    Crop Context tersedia

## Limited Basis

    Sebagian evidence tersedia
    atau ada informasi belum diketahui

## Insufficient Basis

    Evidence utama tidak tersedia

------------------------------------------------------------------------

# P1 --- Action Option Catalog

Buat:

    ACTION_OPTIONS_CATALOG.md

Setiap action harus memiliki:

-   id;
-   title;
-   description;
-   rationale.

Contoh:

``` json
{
"id":"OPT_VERIFY_FIELD",
"title":"Verifikasi kondisi air",
"description":"Periksa kembali kondisi sumber air",
"reason":"Informasi lokal belum cukup"
}
```

Jangan ada:

-   best option;
-   rank;
-   recommended score.

------------------------------------------------------------------------

# P1 --- Crop Context Rule Mapping

Buat:

    CROP_CONTEXT_RULE_MAPPING.md

Crop stage tidak boleh langsung menjadi risk.

Contoh salah:

    flowering = high risk

Contoh benar:

    IF flowering
    AND water limited

    THEN

    factor:
    fase tanaman membutuhkan perhatian terhadap kondisi air

------------------------------------------------------------------------

# P1 --- Tambahan Test Scenario

Tambahkan:

## BMKG Cached

Input:

    BMKG live gagal
    cache tersedia

Expected:

    assessment tetap berjalan
    freshness=cached

------------------------------------------------------------------------

## Mock Protection

Input:

    is_mock=true

Expected:

    data tetap ditandai mock

Tidak boleh dianggap live.

------------------------------------------------------------------------

# C. Tidak Perlu Dibuat Sekarang

Jangan menambah:

-   ML model;
-   LLM agent;
-   RAG;
-   vector database;
-   satellite prediction;
-   yield prediction.

Masalah utama RembukTani bukan kurang kompleksitas model.

Masalah utama:

    Evidence
    ↓
    Interpretation
    ↓
    Decision Support

------------------------------------------------------------------------

# D. Checklist Handoff ke Backend

Dokumen wajib:

    [ ] BMKG Integration Contract

    [ ] Canonical Evidence Schema

    [ ] Confidence Semantics

    [ ] Action Option Catalog

    [ ] Crop Context Rule Mapping

Output wajib:

    [ ] BMKG normalized payload

    [ ] Evidence schema

    [ ] Assessment schema

    [ ] Action option schema

    [ ] Error behavior

    [ ] Test fixtures

------------------------------------------------------------------------

# Final Review

## Pertahankan

✅ Decision-support boundary\
✅ Evidence separation\
✅ Field Pulse model\
✅ Abstention\
✅ Explainability\
✅ Deterministic reasoning

## Perbaiki

🔴 BMKG mapping contract\
🔴 Canonical evidence contract\
🔴 Confidence semantics

🟠 Action catalog\
🟠 Crop mapping\
🟠 Integration scenarios

------------------------------------------------------------------------

# Kesimpulan

AI/Data RembukTani sudah berada pada arah yang benar.

Prioritas berikutnya bukan membuat AI lebih kompleks.

Prioritasnya adalah membuat kontrak data dan reasoning cukup jelas
sehingga:

AI/Data → Backend → Frontend

memiliki pemahaman yang sama.

Target:

    Evidence masuk jelas
    ↓
    Reasoning dapat dijelaskan
    ↓
    Backend dapat menyimpan
    ↓
    Frontend dapat menampilkan
    ↓
    Manusia tetap membuat keputusan
