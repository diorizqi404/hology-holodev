# BMKG Integration Contract v0.1

**Status:** normative compatibility contract for the v0.2 implementation

**Executable schema:** `data/evidence/v0.2/bmkg_canonical_evidence.schema.json`

## Boundary

```text
BMKG raw response -> BMKG normalizer -> canonical external evidence -> reasoning projection
```

Raw payload tetap disimpan melalui `raw_payload_ref`. Normalizer tidak boleh
mengubah prakiraan cuaca menjadi kesimpulan kondisi air, risiko, atau tindakan.

## Mapping minimum

| BMKG field | Canonical field | Pemakaian |
|---|---|---|
| `t` | `payload.forecast_slots[].t` | Ya, konteks cuaca |
| `hu` | `payload.forecast_slots[].hu` | Ya, konteks cuaca |
| `weather_desc` | `payload.forecast_slots[].weather_desc` | Ya, deskripsi prakiraan |
| `ws` | `payload.forecast_slots[].ws` | Opsional |
| `local_datetime`/`utc_datetime` | target time canonical | Ya, freshness |
| `analysis_date` | `temporal.analysis_time` dan `payload.analysis_time` | Ya, provenance temporal |

Mapping lengkap, satuan, null behavior, dan field yang sengaja tidak digunakan
berada di `BMKG_DATA_DICTIONARY.md` dan `BMKG_TO_CANONICAL_MAPPING.md`.

## Invariant

- kode `adm4` respons harus cocok dengan request;
- `analysis_time <= fetched_at`;
- target time diurutkan dan dipakai untuk menentukan freshness;
- `official + external_api` wajib `is_mock=false`;
- `official_mock + fixture` wajib `is_mock=true`;
- kegagalan live boleh memakai cache, tetapi `delivery=cached` tidak otomatis
  berarti `freshness=stale`;
- attribution BMKG dan referensi raw payload wajib dipertahankan.

## Error behavior

Malformed slot diberi warning dan dilewati. Payload campuran, lokasi tidak cocok,
atau tidak memiliki slot valid ditolak. Jika live gagal dan cache valid tersedia,
assessment boleh berjalan dengan `bmkg_delivery=cached`. Jika tidak ada evidence
yang dapat dipakai, reasoning harus abstain.
