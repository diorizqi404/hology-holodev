# Crop Context Rule Mapping

Crop Context memperjelas konteks kasus, tetapi tidak secara otomatis menciptakan
risiko atau rekomendasi.

## Aturan v0.2

| Kondisi | Faktor yang diizinkan | Yang dilarang |
|---|---|---|
| Crop Context tidak ada | `active_crop_context` pada `missing_evidence` | Mengasumsikan komoditas/fase |
| `crop` tersedia | Tampilkan sebagai konteks kasus | Mengubah crop menjadi risk score |
| `stage` tersedia tanpa curated rule | Tampilkan sebagai metadata dengan limitation | `flowering = high risk` |
| Stage + observasi lokal tersedia | Boleh menghasilkan faktor deskriptif setelah rule dan sumber disetujui | Prescription otomatis |

Pola rule yang dapat diterima di versi berikutnya:

```text
IF crop_stage = flowering
AND field_pulse.water_presence = limited
THEN factor = "fase tanaman dan observasi air perlu dibahas"
```

Faktor tersebut tetap bukan keputusan, bukan label bahaya, dan tidak boleh
menghasilkan opsi peringkat. Rule baru wajib mempunyai ID stabil, sumber teknis,
limitation, fixture, expected result, dan review domain sebelum diaktifkan.
