# Audit AI/Data Pascamerge — 5 September 2026

**Auditor:** AI/Data Engineer  
**Basis audit:** `origin/dev` commit `408f202`  
**Riwayat integrasi:** PR #5 masuk melalui `3cf5067`, backend PR #7 masuk
melalui `d942cf6`, dan `dev` digabung ke `main` melalui PR #8 (`b61c282`).  
**Status:** implementasi fondasi kuat, tetapi belum sepenuhnya conformant terhadap
contract pack AI/Data v0.2.

## 1. Ringkasan eksekutif

Backend sudah mengimplementasikan alur utama yang sesuai arah produk:

```text
Land → active Crop Context → Decision Case
     → BMKG + Field Pulse evidence
     → deterministic assessment + alternatives
     → human Decision Record → deterministic Decision Brief
```

Bagian yang sudah baik meliputi normalisasi field BMKG terdokumentasi, provenance,
attribution, pemisahan evidence dan assessment, dukungan `unknown` pada Field
Pulse, alternatives-only, evidence linking, serta snapshot/audit field untuk
keputusan manusia.

Namun integrasi belum boleh disebut final. Ada empat gap prioritas tinggi:

1. stale/expired BMKG masih dapat dianggap tersedia oleh reasoning;
2. stable action-option ID dari AI/Data tidak dipertahankan ke persistence;
3. failure belum menjadi `assessment_unavailable` yang eksplisit;
4. constraint satu Decision Record per kasus bertabrakan dengan mekanisme
   `supersedes_record_id` untuk revisi.

Audit ini tidak mengubah implementasi backend. Dokumen ini menjadi bahan review
bersama AI/Data, Full-stack, dan PM/Tech Lead/UI-UX.

## 2. Source of truth dan konteks

Urutan referensi yang dipakai:

1. `docs/role/LAPORAN_KONTEKS_PROYEK_REMBUKTANI_v0.2.md`;
2. `docs/M2-AI-Data-v0.2/`;
3. `data/evidence/v0.2/`;
4. implementasi backend pada `backend/src/`;
5. migration dan OpenAPI backend.

Boundary yang harus tetap dijaga:

- BMKG adalah external forecast evidence, bukan kondisi air aktual lahan;
- Field Pulse adalah observasi, bukan label risiko;
- reasoning tidak membuat keputusan akhir;
- M2 tidak memakai ranking, angka risiko 0–100, atau threshold agronomis tanpa
  sumber tervalidasi;
- Decision Brief deterministic, bukan LLM bebas;
- missing/stale/failure tidak boleh menghasilkan fakta atau rekomendasi palsu.

## 3. Peta folder dan nama file penting

### A. Kontrak dan dokumentasi AI/Data

| File | Fungsi | Pembaca utama |
|---|---|---|
| `docs/M2-AI-Data-v0.2/BMKG_DATA_DICTIONARY.md` | Arti, tipe, dan penggunaan field BMKG | Full-stack, PM |
| `docs/M2-AI-Data-v0.2/BMKG_TO_CANONICAL_MAPPING.md` | Mapping raw BMKG ke canonical evidence | Backend |
| `docs/M2-AI-Data-v0.2/FIELD_PULSE_CONTRACT_v0.2.md` | Label UI, enum, unknown semantics | Backend, UI/UX |
| `docs/M2-AI-Data-v0.2/HOL86_RECONCILIATION_v0.2.md` | Relasi Land/Crop/Case/Evidence | Backend, Tech Lead |
| `docs/M2-AI-Data-v0.2/HOL87_REASONING_BASELINE_v0.2.md` | Semantik reasoning deterministic | Backend, PM |
| `docs/M2-AI-Data-v0.2/EVIDENCE_FRESHNESS_POLICY_v0.2.md` | Current/stale/unavailable | Backend, UI |
| `docs/M2-AI-Data-v0.2/CURATED_SOURCE_PACK_v0.2.md` | Sumber dan limitation setiap rule | PM, reviewer |
| `docs/M2-AI-Data-v0.2/ACTION_OPTIONS_v0.2.md` | Opsi bounded dan stable ID | Backend, UI |
| `docs/M2-AI-Data-v0.2/EXPLANATION_CONTRACT_v0.2.md` | Data terstruktur untuk ringkasan/brief | Backend, UI/UX |
| `docs/M2-AI-Data-v0.2/HANDOFF_FULLSTACK.md` | Input/output dan joint gates | Full-stack |

### B. Artefak executable AI/Data

| File | Fungsi |
|---|---|
| `data/evidence/v0.2/bmkg_canonical_evidence.schema.json` | Schema canonical BMKG |
| `data/evidence/v0.2/bmkg_canonical_example.json` | Contoh evidence live-normalized |
| `data/evidence/v0.2/reasoning_io.schema.json` | Contract input/output reasoning |
| `data/evidence/v0.2/ruleset_water_v0.2.json` | Rule dan safety flags |
| `data/evidence/v0.2/ACTION_OPTIONS_v0.2.json` | Registry stable action-option ID |
| `data/evidence/v0.2/fixtures/` | Skenario deterministic T1–T8 |
| `data/evidence/v0.2/expected_results.json` | Expected state setiap skenario |
| `data/evidence/v0.2/reasoning_engine_v0_2.py` | Reference engine, bukan service production |
| `data/evidence/v0.2/validate_contract_pack_v0_2.py` | Contract/invariant checks |
| `data/evidence/v0.2/test_reasoning_v0_2.py` | Determinism dan scenario checks |

### C. Implementasi backend hasil merge

| File/folder | Konteks data |
|---|---|
| `backend/src/infrastructure/bmkg/bmkg-client.ts` | Fetch, timeout, retry BMKG |
| `backend/src/infrastructure/bmkg/bmkg-normalizer.ts` | Raw → canonical BMKG |
| `backend/src/infrastructure/bmkg/bmkg-adapter.ts` | Live-first dan cache fallback |
| `backend/src/infrastructure/cache/` | Cache memory dan Supabase |
| `backend/src/infrastructure/reasoning/` | Types dan engine TypeScript |
| `backend/src/domain/types.ts` | Model persistence/domain |
| `backend/src/domain/repositories/` | Akses Land/Crop/Case/Evidence/Assessment/Decision |
| `backend/src/routes/api.ts` | Orkestrasi endpoint end-to-end |
| `backend/migrations/001_init_rembuktani_schema.sql` | Physical schema awal |
| `backend/migrations/002_decision_record_audit_and_assessment_evidence.sql` | Snapshot, supersedes, assessment-evidence |
| `backend/docs/openapi.yaml` | Kontrak HTTP untuk frontend |
| `backend/tests/unit/bmkg-adapter.test.ts` | Test adapter/normalizer/cache |
| `backend/tests/unit/reasoning.test.ts` | Test reasoning backend |

## 4. Audit kesesuaian

| Area | Status | Bukti/temuan |
|---|---|---|
| Land, Crop Context, Decision Case terpisah | **Sesuai** | Entity, FK, repository, dan route tersedia |
| BMKG documented fields only | **Sesuai** | Normalizer memetakan field dictionary dan menyimpan raw payload terpisah |
| `adm4` request/response verification | **Sesuai** | Response `adm4` harus sama dengan request |
| BMKG attribution dan provenance | **Sesuai** | `source.name`, documentation URL, fetch time, request URI, raw reference tersedia |
| Malformed/mixed BMKG payload | **Sesuai** | Malformed slots diberi warning; mixed `analysis_date` ditolak |
| Field Pulse observational enum | **Sesuai** | `present/limited/none/unknown` dan `flowing/limited/not_flowing/unknown` |
| Unknown sebagai jawaban valid | **Sesuai** | Unknown menghasilkan `needs_verification`, bukan dipaksa menjadi fakta |
| No autonomous final decision | **Sesuai** | Recommendation selalu alternatives-only/null; Decision Record authority human |
| No agronomic score/threshold | **Sesuai** | Tidak ditemukan risk score atau konversi cuaca → kondisi air |
| BMKG freshness | **Belum sesuai** | Reasoning hanya mengecek object ada; target forecast dan expiry tidak dievaluasi |
| Field Pulse freshness | **Belum sesuai** | Dibandingkan dengan evaluation time, belum dengan waktu mulai Decision Case |
| Crop Context in reasoning | **Belum sesuai** | Crop context tersimpan pada case tetapi tidak menjadi input/kelengkapan reasoning |
| Stable action-option IDs | **Belum sesuai** | Engine memakai ID berbeda; DB hanya menyimpan UUID tanpa contract `option_id` |
| Reasoning failure state | **Belum sesuai** | Exception menjadi HTTP error; belum menghasilkan/persist `assessment_unavailable` |
| Explanation contract persistence | **Sebagian** | Response punya explanation, tetapi assessment DB hanya menyimpan ringkasan/array |
| Decision Brief completeness | **Sebagian** | Deterministic dan human-safe, tetapi belum membawa missing evidence, limitation, source/time |
| Evidence actually used | **Sebagian** | Route menautkan seluruh evidence kasus, bukan hanya evidence yang dipilih engine |
| Decision revision semantics | **Konflik** | `supersedes_record_id` tersedia tetapi `decision_case_id UNIQUE` mencegah record revisi kedua |
| Cache implementation | **Sebagian** | Supabase cache memfilter expiry, tetapi default runtime memakai process-local cache |
| Backend contract tests | **Sebagian** | Hanya 3 reasoning tests; belum mem-port T1–T8 dan contract-negative cases |

## 5. Temuan prioritas

### P0 — wajib diselesaikan sebelum menyebut integrasi final

#### P0.1 Reasoning dapat memakai forecast stale/expired

`WaterReasoningEngine` menggunakan keberadaan `input.bmkg` sebagai `hasBmkg`.
Tidak ada pemeriksaan bahwa masih ada `target_time_utc >= evaluatedAt`, tidak ada
state `bmkg_freshness`, dan route assessment tidak menolak evidence berstatus
`expired`. Akibatnya assessment dapat menjadi `context_available` dengan forecast
yang seluruh slot waktunya sudah lewat.

**Perlu:** port semantics T7, pilih forecast slot berdasarkan waktu evaluasi, dan
hasilkan current/stale/unavailable secara eksplisit.

#### P0.2 Stable action-option contract terputus

Registry AI/Data mendefinisikan `OPT-VERIFY-FIELD`,
`OPT-COLLECT-WATER-SOURCE`, `OPT-REQUEST-REVIEW`, dan `OPT-DEFER`. Engine backend
menghasilkan ID lain seperti `OPT-CHECK-WATER`, tetapi route hanya menyimpan
title/description/rationale/display order. Stable semantic ID hilang setelah
persistence.

**Perlu:** tambahkan kolom semantic `option_id`/`option_code`, pakai registry yang
disepakati, dan pertahankan UUID hanya sebagai row identifier.

#### P0.3 Failure semantics belum eksplisit

Contract AI/Data mensyaratkan `assessment_unavailable` dan abstention jika engine
gagal. Engine backend hanya mempunyai return type `status: "available"`; error
akan ditangani route sebagai error umum dan assessment failure tidak tercatat.

**Perlu:** discriminated result available/insufficient/unavailable, tanpa action
option pada execution failure, serta error code API yang stabil.

#### P0.4 Revision Decision Record tertahan constraint

Migration kedua menambah `supersedes_record_id`, tetapi migration awal menetapkan
`decision_records.decision_case_id UNIQUE`. Dengan constraint itu satu kasus
tidak dapat mempunyai record revisi kedua yang menunjuk record sebelumnya.

**Perlu:** sepakati apakah Decision Record benar-benar immutable-singleton atau
revision chain. Jika revision chain dipilih, ganti uniqueness dengan aturan satu
record aktif/final per chain tanpa menghapus histori.

### P1 — selesaikan sebelum demo end-to-end dinyatakan siap

1. Masukkan snapshot Crop Context ke `ReasoningInput`; jika tidak ada, assessment
   harus mencatat `active_crop_context` sebagai missing evidence.
2. Bandingkan `fieldPulse.observedAt` dengan `decisionCase.created_at`, bukan hanya
   dengan `evaluatedAt`; implementasikan T8 confirmation semantics.
3. Jangan menetapkan semua cached evidence sebagai stale dan semua live evidence
   sebagai fresh. Delivery (`live/cached`) berbeda dari freshness
   (`current/stale/unavailable`).
4. Saat assessment, pilih latest evidence per type secara eksplisit dan link hanya
   evidence yang benar-benar dipakai. Jangan menautkan seluruh histori evidence.
5. Persist explanation codes/source references atau sediakan reproducible
   projection agar GET assessment tidak kehilangan penjelasan dari response awal.
6. Lengkapi Decision Brief dengan dasar, informasi belum diketahui, source/time,
   dan limitations sesuai template PM/UX.
7. Validasi bahwa `crop_context_id` milik `land_id` pada pembuatan Decision Case.
8. Tinjau `quality_status: "high"` pada Field Pulse. Observasi user yang lengkap
   tidak otomatis berarti akurasi tinggi; simpan basis kualitas atau gunakan
   istilah kelengkapan yang tidak mengklaim akurasi.

### P2 — hardening setelah kontrak bersama dikunci

1. Wire `SupabaseBmkgCache` ke composition root untuk deployment yang membutuhkannya.
2. Port T1–T8 ke TypeScript dan tambahkan negative canonical/schema tests.
3. Kunci consistency `official ↔ external_api ↔ is_mock:false` dan
   `official_mock ↔ fixture ↔ is_mock:true`.
4. Validasi canonical evidence pada boundary sebelum persistence/reasoning.
5. Hilangkan atau batasi endpoint generik yang memungkinkan assessment/action
   option manual melewati registry dan engine contract.

## 6. Struktur data penting yang harus dipertahankan

### Canonical BMKG evidence

```text
identity
├── evidence_id
├── land_ref.land_id
└── decision_case_ref.decision_case_id

source/provenance
├── source = BMKG + attribution
├── collection_mode + is_mock
├── fetched_at + request.uri
└── raw_payload_ref

location
├── adm1..adm4 + labels
├── source_point.lat/lon
└── timezone

temporal/payload
├── analysis_time
├── first/last target time
└── forecast_slots[]
```

Jangan menyalin BMKG `weather_desc`, suhu, atau kelembapan menjadi kesimpulan
ketersediaan air lahan. Kondisi air aktual hanya berasal dari Field Pulse atau
local evidence lain yang jelas provenance-nya.

### Reasoning projection

Projection minimal yang perlu disejajarkan backend:

```text
evaluation_time
decision_case_started_at
active_crop_context
bmkg
├── evidence_id
├── delivery
├── analysis_time
├── fetched_at
└── target_times[]
field_pulse
├── evidence_id
├── water_presence
├── irrigation_flow
└── observed_at
```

Output harus membedakan `available`, `insufficient_evidence`, dan
`assessment_unavailable`, disertai factors, missing evidence, limitations,
stable action-option IDs, recommendation null, ruleset version, serta source
references.

## 7. Verifikasi yang dijalankan

| Command | Hasil |
|---|---|
| `python data/evidence/v0.2/validate_contract_pack_v0_2.py` | **PASS** |
| `python data/evidence/v0.2/test_reasoning_v0_2.py` | **PASS — T1–T8** |
| `npm run build` pada `backend/` | **PASS** |
| `npm run typecheck:demo` pada `backend/` | **PASS** |
| `npm test` pada `backend/` | **Belum terverifikasi lokal** — launcher `tsx` gagal pada `uv_os_get_passwd ENOMEM` |

Catatan: proses `npm test` mengembalikan exit code 0 meskipun launcher mencetak
fatal error. Karena itu output ini **tidak boleh dicatat sebagai test PASS**.
CI perlu dipastikan gagal bila test runner tidak benar-benar memulai test.

## 8. Urutan tindak lanjut yang disarankan

```text
1. AI/Data + Full-stack lock freshness dan stable option ID
2. Backend perbaiki P0.1–P0.4
3. Port T1–T8 + negative gates ke TypeScript
4. PM/UX lock explanation dan Decision Brief template
5. Jalankan contract tests + backend tests + end-to-end demo
6. Catat keputusan final dan version bump bila breaking
```

## 9. Kesimpulan

Hasil merge adalah kemajuan besar dan arahnya benar, tetapi status paling jujur
adalah **implementation-ready foundation with contract gaps**, bukan final
AI/Data conformance. Tidak perlu menambah ML atau sumber data baru. Nilai inovasi
RembukTani justru datang dari penggabungan evidence yang jujur, input lapangan
minimal, ketidakpastian yang terlihat, dan keputusan manusia yang dapat diaudit.

Empat P0 di atas harus menjadi merge gate berikutnya agar aplikasi bukan hanya
terlihat cerdas, tetapi juga aman, transparan, dan benar-benar berguna.
