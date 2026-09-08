import { useState } from "react";
import { Check, CircleAlert, ShieldCheck } from "lucide-react";
import { Section } from "../layout/Section";
import { SectionHeading } from "../ui/SectionHeading";
import { Button } from "../ui/Button";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

type OptionId = "A" | "B" | "C";

const options: Array<{
  id: OptionId;
  badge: string;
  timing: string;
  title: string;
  desc: string;
  pros: Array<{ text: string; tone: "good" | "warn" | "muted" }>;
  cta: string;
  recommended?: boolean;
}> = [
  {
    id: "A",
    badge: "OPSI A",
    timing: "Segera",
    title: "Tabur NPK Sesuai Dosis Pagi Ini",
    desc: "Lakukan pemupukan susulan 75 kg NPK/ha sebelum pukul 10.00 WIB mumpung angin tenang dan tanah lembap.",
    pros: [
      { text: "Nutrisi terserap sebelum malai pecah", tone: "good" },
      { text: "Perlu pastikan air tidak surut total besok", tone: "warn" },
    ],
    cta: "Pilih Opsi A",
  },
  {
    id: "B",
    badge: "OPSI B",
    timing: "Optimal",
    title: "Tunda 24 Jam Hingga Irigasi Masuk",
    desc: "Tunggu air giliran lusa pagi menggenang 2–3 cm, baru tabur pupuk susulan agar larut sempurna tanpa risiko terbakar matahari.",
    pros: [
      { text: "Efisiensi penyerapan pupuk maksimal", tone: "good" },
      { text: "Biaya terhindar dari pemborosan", tone: "good" },
    ],
    cta: "Pilih Opsi B (Disarankan)",
    recommended: true,
  },
  {
    id: "C",
    badge: "OPSI C",
    timing: "Musyawarah",
    title: "Rembuk Lapangan dengan Mandor Gapoktan",
    desc: "Minta penyesuaian pintu air blok sekunder bersama ketua kelompok tani sebelum memutuskan pembelian sak pupuk tambahan.",
    pros: [
      { text: "Kesepakatan aman antarpemilik petak", tone: "good" },
      { text: "Memerlukan waktu temu 1-2 jam", tone: "muted" },
    ],
    cta: "Pilih Opsi C",
  },
];

export function DecisionOptionsSection() {
  const [selected, setSelected] = useState<OptionId>("B");
  const [confirmed, setConfirmed] = useState(false);

  const active = options.find((o) => o.id === selected)!;

  return (
    <Section className="bg-stone-100 py-12 sm:py-14">
      <div className="flex flex-col items-center gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Titik Puncak Interaksi"
            eyebrowClassName="text-lime-900"
            title="Teknologi membantu. Manusia memutuskan."
            description="Pilihlah opsi yang paling sesuai dengan ketersediaan tenaga kerja, modal, dan kondisi rembuk warga di sekitar petak Anda."
          />
        </Reveal>

        <Stagger className="grid w-full gap-4 md:grid-cols-3 md:gap-6">
          {options.map((opt) => {
            const isActive = selected === opt.id;
            return (
              <StaggerItem key={opt.id} className="h-full">
                <article
                  className={`relative flex h-full flex-col justify-between rounded-2xl bg-white p-5 shadow-sm sm:p-6 ${
                    isActive ? "shadow-md ring-2 ring-lime-400" : ""
                  }`}
                >
                  {opt.recommended ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-950 px-3 py-0.5 text-xs font-bold tracking-tight text-lime-400 shadow-sm">
                      Rekomendasi Berimbang
                    </span>
                  ) : null}
                  <div className={`flex flex-col gap-3 ${opt.recommended ? "pt-3" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-sm px-2 py-0.5 text-xs font-bold tracking-tight text-lime-950 ${
                          opt.recommended ? "bg-lime-300" : "bg-stone-100"
                        }`}
                      >
                        {opt.badge}
                      </span>
                      <span
                        className={`text-xs font-semibold tracking-tight ${
                          opt.recommended
                            ? "font-bold text-lime-800"
                            : "text-neutral-500"
                        }`}
                      >
                        {opt.timing}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-lime-950">
                      {opt.title}
                    </h3>
                    <p className="text-sm leading-5 text-stone-700">{opt.desc}</p>
                    <ul className="flex flex-col gap-1 pt-2">
                      {opt.pros.map((p) => (
                        <li key={p.text} className="flex items-start gap-1">
                          {p.tone === "warn" ? (
                            <CircleAlert
                              className="mt-0.5 size-3.5 shrink-0 text-yellow-600"
                              aria-hidden
                            />
                          ) : (
                            <Check
                              className={`mt-0.5 size-3 shrink-0 ${
                                p.tone === "muted"
                                  ? "text-neutral-500"
                                  : "text-lime-500"
                              }`}
                              aria-hidden
                            />
                          )}
                          <span
                            className={`text-xs font-semibold tracking-tight ${
                              p.tone === "warn"
                                ? "text-yellow-600"
                                : p.tone === "muted"
                                  ? "text-neutral-500"
                                  : opt.recommended
                                    ? "text-lime-500"
                                    : "text-lime-900"
                            }`}
                          >
                            {p.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(opt.id);
                        setConfirmed(false);
                      }}
                      className={`flex min-h-11 w-full items-center justify-center rounded-xl py-3 text-sm font-bold tracking-tight text-lime-950 transition-colors ${
                        opt.recommended
                          ? "bg-lime-400 shadow-sm hover:bg-lime-300"
                          : "bg-lime-200 hover:bg-lime-300"
                      }`}
                    >
                      {opt.cta}
                    </button>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="w-full max-w-3xl rounded-2xl bg-lime-950 p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime-400">
                <ShieldCheck className="size-4 text-lime-950" aria-hidden />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">
                  Status Otorisasi Keputusan
                </p>
                <p className="text-sm text-stone-300">
                  Pilihan aktif: Opsi {active.id} ({active.title})
                </p>
              </div>
            </div>
            <span className="self-start rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-tight text-lime-400">
              Mandor: Pak Subardi
            </span>
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm leading-5 text-stone-300">
              Dengan menekan konfirmasi, ringkasan bukti beserta tanggal dan nama
              penanggung jawab akan dikompilasi menjadi dokumen brief resmi.
            </p>
            <Button
              variant="accent"
              className="shrink-0 px-6 py-3 text-base font-bold"
              onClick={() => setConfirmed(true)}
            >
              <Check className="size-3.5" aria-hidden />
              {confirmed ? "Keputusan Tercatat" : "Konfirmasi Keputusan"}
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
