# Action Options Catalog

Registry executable: `data/evidence/v0.2/ACTION_OPTIONS_v0.2.json`.

| ID stabil | Title | Trigger | Allowed state |
|---|---|---|---|
| `OPT-VERIFY-FIELD` | Periksa kembali kondisi lahan | Air terbatas/aliran tidak mengalir atau informasi penting belum lengkap | `context_available`, `needs_verification` |
| `OPT-COLLECT-WATER-SOURCE` | Konfirmasi kondisi sumber air | Air terbatas/aliran tidak mengalir atau informasi penting belum lengkap | `context_available`, `needs_verification` |
| `OPT-REQUEST-REVIEW` | Minta pertimbangan pihak tepercaya | Review manusia berguna | `context_available`, `needs_verification` |
| `OPT-DEFER` | Tunda perubahan | Selalu tersedia pada basis lemah | `needs_verification`, `insufficient_evidence` |

ID adalah semantic contract lintas AI/Data, backend, database, dan frontend; UUID
database tetap hanya row identifier. Urutan display bukan ranking. Tidak ada best
option, recommended score, prescription, durasi irigasi, atau klaim outcome.

Engine memilih ID melalui rule mapping. LLM tidak boleh membuat, menghapus,
mengganti, atau meranking action; LLM hanya boleh memperjelas ringkasan,
description, dan rationale untuk ID yang sudah dipilih engine.
