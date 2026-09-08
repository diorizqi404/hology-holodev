# AI Reasoning Scenario Test Report v0.4

Tanggal: 7 September 2026  
Branch: `dev`  
Runner: `npm run test:ai-contract`

## Outcome

Status: **PASS — 16/16 contract tests**.

Selain 16 test cases utama, satu test menjalankan 512 kombinasi evidence untuk
memastikan invariant keselamatan tetap berlaku pada variasi input.

## Coverage

| Area | Skenario | Hasil |
|---|---|---|
| Action catalog | ID unik dan fixed catalog | PASS |
| Contract drift | JSON canonical identik dengan catalog backend | PASS |
| Complete evidence | BMKG + Field Pulse + Crop Context | PASS |
| Cached delivery | Cached tidak otomatis dianggap stale | PASS |
| Limited evidence | Field Pulse parsial memicu verification-safe options | PASS |
| Insufficient evidence | BMKG tidak tersedia | PASS |
| Insufficient evidence | Field Pulse tidak tersedia | PASS |
| Temporal validity | Observasi masa depan ditolak sebagai current evidence | PASS |
| Crop Context | Fase masuk reasoning secara netral | PASS |
| Input validation | Timestamp evaluasi invalid ditolak | PASS |
| Combination matrix | 512 kombinasi BMKG, air, aliran, waktu, crop | PASS |
| LLM disabled | Baseline deterministik dipertahankan | PASS |
| Action injection | Unknown action ID dari LLM ditolak | PASS |
| Prescription guard | Bahasa mengarahkan dan durasi numerik ditolak | PASS |
| Provider resilience | 503 membuka cooldown, tidak retry-loop | PASS |
| Explanation-only | ID, title, order, dan summary engine dipertahankan | PASS |

## Exhaustive invariants

Setiap satu dari 512 kombinasi harus memenuhi:

- seluruh action ID berasal dari fixed catalog;
- tidak ada duplicate action ID;
- `ranking=null`;
- `recommendedOptionId=null`;
- missing Crop Context dinyatakan eksplisit;
- state `insufficient_evidence` hanya menghasilkan `OPT-DEFER`.

Dimensi kombinasi:

- BMKG tersedia/tidak tersedia;
- water presence: `present`, `limited`, `none`, `unknown`;
- irrigation flow: `flowing`, `limited`, `not_flowing`, `unknown`;
- waktu Field Pulse valid/masa depan;
- growth stage: `vegetative`, `flowering`, `ripening`, `unknown`;
- Crop Context tersedia/tidak tersedia.

## Reproduction

```powershell
cd backend
npm run test:ai-contract
```

Suite melakukan production build terlebih dahulu, lalu menjalankan contract test
langsung dengan Node. Tidak membutuhkan API key, login, jaringan, atau mutasi
Supabase.

## Scope boundary

Suite ini tidak mengubah schema, RLS, policy, auth, storage, atau data Supabase.
Live-provider test tetap terpisah agar CI dan developer lokal tetap deterministik.

Live smoke test yang tidak melakukan persistence dapat dijalankan dengan:

```powershell
cd backend
npm run test:ai-live
```
