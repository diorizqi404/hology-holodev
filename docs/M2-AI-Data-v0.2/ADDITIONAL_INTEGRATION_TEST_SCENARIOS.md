# Additional Integration Test Scenarios

Skenario executable berada di `data/evidence/v0.2/fixtures/` dan dijalankan oleh
`test_reasoning_v0_2.py` serta `validate_contract_pack_v0_2.py`.

## BMKG cached

Input: fetch live gagal, cache tersedia, target forecast belum lewat.

Expected: assessment tetap dapat berjalan; `bmkg_delivery=cached` dan
`bmkg_freshness=current`. Delivery tidak boleh dipakai sebagai freshness.

Input tambahan: cache tersedia tetapi seluruh target sudah lewat.

Expected: `bmkg_delivery=cached`, `bmkg_freshness=stale`, assessment abstain bila
tidak ada forecast current.

## Mock protection

Input: `source.category=official_mock`, `collection_mode=fixture`, `is_mock=true`.

Expected: schema menerima dan marker mock tetap `true` setelah validasi/projection.

Negative gates:

- `official + external_api + is_mock=true` ditolak;
- `official_mock + fixture + is_mock=false` ditolak;
- fixture tidak pernah diberi provenance live;
- mock tidak boleh ditampilkan sebagai data BMKG live.
