import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";

const noteText = `[NOTA KEPUTUSAN REMBUKTANI]
Lahan: Blok Tirto A3 (0.45 Ha) - Padi Fase Berbunga
Bukti Cuaca BMKG: 24°C, Cerah Berawan, Angin 4 km/j (Aman)
Kondisi Petak: Air macak-macak (sedikit)
Keputusan Disetujui: OPSI B - Tunda pemupukan 24 jam hingga jadwal air masuk desa lusa pagi.
Tindakan Mandor: Koordinasi pembukaan pintu air sekunder B3 pukul 06.00 WIB besok.
Penanggung Jawab: Pak Subardi (Mandor Lapangan)`;

export function CommunicationSection() {
  const [copied, setCopied] = useState(false);

  const copyNote = async () => {
    try {
      await navigator.clipboard.writeText(noteText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Section className="bg-stone-50 py-12 sm:py-14">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <Reveal className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wide text-lime-800">
            Komunikasi Kelompok Tani
          </p>
          <h2 className="font-display text-2xl font-bold text-lime-950 sm:text-3xl">
            Keputusan yang mudah dibaca dan dibagikan.
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 sm:text-base">
            Hasil pertimbangan langsung tersusun dalam format ringkas tanpa
            basa-basi teknis. Siap ditempel di papan posko tani atau dikirim
            instan ke grup obrolan.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={copyNote}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold tracking-tight text-lime-950 shadow-sm transition-colors hover:bg-stone-50"
            >
              {copied ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
              {copied ? "Tersalin" : "Salin Teks Ringkasan"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(noteText)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-500/20 px-4 py-3 text-sm font-semibold tracking-tight text-lime-950 transition-colors hover:bg-green-500/30"
            >
              <Share2 className="size-3.5 text-teal-600" aria-hidden />
              Bagikan ke WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
            <div className="flex flex-col gap-2 border-b border-stone-300/30 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-sm font-bold tracking-wide text-lime-950">
                [NOTA KEPUTUSAN REMBUKTANI]
              </p>
              <p className="font-mono text-sm text-neutral-500">
                Tgl: 24 Okt 2025 • 06:45
              </p>
            </div>
            <div className="flex flex-col gap-2 py-4 font-mono text-sm leading-5 text-lime-900">
              <p>
                <span className="font-bold">Lahan:</span> Blok Tirto A3 (0.45
                Ha) - Padi Fase Berbunga
              </p>
              <p>
                <span className="font-bold">Bukti Cuaca BMKG:</span> 24°C, Cerah
                Berawan, Angin 4 km/j (Aman)
              </p>
              <p>
                <span className="font-bold">Kondisi Petak:</span> Air
                macak-macak (sedikit)
              </p>
              <p>
                <span className="font-bold">Keputusan Disetujui:</span> OPSI B -
                Tunda pemupukan 24 jam hingga jadwal air masuk desa lusa pagi.
              </p>
              <p>
                <span className="font-bold">Tindakan Mandor:</span> Koordinasi
                pembukaan pintu air sekunder B3 pukul 06.00 WIB besok.
              </p>
              <p>
                <span className="font-bold">Penanggung Jawab:</span> Pak Subardi
                (Mandor Lapangan)
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-stone-300/30 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs text-neutral-500">
                ID Log: RT-MLG-2025-08492
              </p>
              <p className="font-mono text-xs text-neutral-500">
                Terverifikasi Mandiri
              </p>
            </div>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}
