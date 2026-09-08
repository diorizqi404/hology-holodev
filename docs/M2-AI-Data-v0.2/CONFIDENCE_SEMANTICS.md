# Confidence Semantics

Confidence RembukTani adalah **kekuatan dasar evidence**, bukan probabilitas,
akurasi model, atau peluang keberhasilan tindakan. UI dan API dilarang mengubahnya
menjadi persentase.

| Basis | Kondisi | Output v0.2 |
|---|---|---|
| Sufficient | BMKG current, Field Pulse lengkap/current untuk kasus, dan Crop Context tersedia | `status=available`, `confidence=medium` |
| Limited | Evidence parsial, `unknown`, perlu konfirmasi, atau observasi lokal comparable berkonflik | `confidence=low`; state menjelaskan sebab |
| Insufficient | BMKG current, Field Pulse, atau Crop Context utama tidak tersedia | `status=insufficient_evidence`, `confidence=low`, abstain |
| Unavailable | Validasi/eksekusi reasoning gagal | `status=assessment_unavailable`, `confidence=unknown`, abstain |

`high` sengaja tidak diaktifkan pada ruleset v0.2 karena belum ada kalibrasi
akurasi RembukTani. Setiap output wajib menyertakan `missing_evidence`,
`limitations`, `evaluated_at`, dan `ruleset_version` agar label dapat diaudit.
