import {
  CloudSun,
  Droplets,
  ShieldCheck,
  Thermometer,
  Wind,
} from "lucide-react";
import { Section } from "../layout/Section";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

const metrics = [
  {
    label: "Kondisi Cuaca",
    value: "Cerah Berawan",
    hint: "Peluang hujan 15%",
    icon: CloudSun,
    iconClass: "text-orange-400",
  },
  {
    label: "Suhu Udara",
    value: "24°C",
    hint: "Min 21°C / Maks 30°C",
    icon: Thermometer,
    iconClass: "text-orange-700",
  },
  {
    label: "Kelembapan",
    value: "85%",
    hint: "Kondisi lembap pagi",
    icon: Droplets,
    iconClass: "text-cyan-700",
  },
  {
    label: "Kecepatan Angin",
    value: "4 km/jam",
    hint: "Arah Timur → Barat",
    icon: Wind,
    iconClass: "text-lime-900",
  },
];

export function AutoIntelSection() {
  return (
    <Section className="bg-stone-50 py-12 sm:py-14">
      <div className="flex flex-col items-center gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Kecerdasan Otomatis"
            eyebrowClassName="text-cyan-700"
            title="Informasi luar, tanpa perlu diketik ulang."
            description="Penyuluh dan mandor tidak perlu mencari-cari laporan BMKG atau menyalin angka koordinat. RembukTani mengumpulkannya secara otomatis setiap jam."
          />
        </Reveal>

        <Reveal className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex flex-col gap-4 border-b border-stone-300/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-700">
                <CloudSun className="size-6 text-white" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-lime-950 sm:text-xl">
                    Stasiun BMKG Karangploso
                  </h3>
                  <span className="rounded-sm bg-cyan-700/10 px-2 py-0.5 text-xs font-bold tracking-tight text-cyan-700">
                    Sumber Resmi BMKG
                  </span>
                </div>
                <p className="text-sm text-stone-500">
                  Pembaruan: Hari ini, 06.00 WIB • Radius 12.4 km dari Blok Tirto
                  A3
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold tracking-tight text-lime-700">
              <ShieldCheck className="size-3.5" aria-hidden />
              Data Terhubung
            </div>
          </div>

          <div className="mt-4 grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl bg-stone-100 px-3 py-3"
              >
                <p className="text-xs font-semibold tracking-tight text-neutral-500">
                  {m.label}
                </p>
                <div className="mt-1 flex items-start gap-1">
                  <m.icon className={`mt-0.5 size-4 shrink-0 ${m.iconClass}`} aria-hidden />
                  <p className="font-display text-lg font-bold leading-6 text-lime-950">
                    {m.value}
                  </p>
                </div>
                <p className="mt-1 text-sm text-lime-900">{m.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-xl bg-lime-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime-700" aria-hidden />
              <p className="text-sm leading-relaxed text-lime-950 sm:text-base">
                <span className="font-semibold tracking-tight">
                  Kelayakan Semprot: AMAN.
                </span>{" "}
                Angin di bawah 8 km/jam, evaporasi rendah sebelum pukul 10.00
                WIB.
              </p>
            </div>
            <span className="shrink-0 self-start rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-tight text-lime-900 shadow-sm sm:self-center">
              Otomatis
            </span>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
