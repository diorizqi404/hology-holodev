# LLM Integration and Data Inventory v0.3

## Jawaban singkat untuk tim

Data yang RembukTani kumpulkan saat ini:

1. **Lahan:** nama, koordinat, provinsi, kabupaten/kota, kecamatan, desa/kelurahan, ADM4 terverifikasi, dan sumber lokasi.
2. **Konteks tanaman:** komoditas, varietas, fase pertumbuhan, tanggal tanam, dan status aktif.
3. **BMKG canonical evidence:** waktu analisis/target, deskripsi cuaca, suhu, kelembapan, angin, arah angin, tutupan awan, jarak pandang, provenance, freshness, quality, dan penanda mock/live.
4. **Field Pulse:** keberadaan air (`present/limited/none/unknown`), aliran irigasi (`flowing/limited/not_flowing/unknown`), pelapor, dan waktu observasi.
5. **Jejak keputusan:** decision case, assessment version, faktor, data yang hilang, keterbatasan, alternatif, review opsional, keputusan manusia, evidence snapshot, dan Decision Brief.

Data yang **tidak** dimiliki dan tidak boleh diklaim: sensor tanah, NDVI/Sentinel, debit air, curah hujan kumulatif, dosis pupuk, diagnosis hama, jadwal pintu air, atau prediksi hasil panen.

## Arsitektur hybrid

```text
BMKG canonical + Crop Context + Field Pulse
                  ↓
 deterministic assessment + rule mapping
                  ↓
      fixed action catalog alternatives
                  ↓
 Gemini explanation-only layer (opsional)
                  ↓
 backend exact-ID + safety validation
                  ↓
 assessment + unranked action options
                  ↓
 review opsional → keputusan akhir manusia
```

LLM tidak mengganti evidence normalizer, freshness policy, atau keputusan manusia. Jika key, jaringan, timeout, schema, atau safety validation gagal, hasil deterministic dipakai dan kegagalan tidak menghasilkan narasi palsu.

## Model

Default implementasi adalah `gemini-3.5-flash`: model Flash stabil yang tersedia untuk key proyek, cepat, mendukung structured JSON, dan cocok untuk demo interaktif. Model dapat diganti melalui `LLM_MODEL` tanpa mengubah route atau UI. API key hanya berada di backend dan tidak dikirim ke browser.

## Guardrail output

- Bahasa Indonesia sederhana.
- Action ID dan title selalu berasal dari fixed catalog, tanpa ranking.
- LLM hanya boleh memperjelas description dan rationale; summary assessment dibuat engine deterministik.
- Tidak boleh membuat data baru.
- Tidak boleh memberi dosis, volume, durasi, jadwal presisi, diagnosis, atau jaminan hasil.
- Saat evidence tidak cukup, rule engine hanya memberikan opsi tunda.
- Setiap output disimpan bersama `rule_version` model dan evidence yang mendasarinya.
