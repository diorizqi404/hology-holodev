import { Check, ChevronRight } from "lucide-react";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";

const bullets = [
  "Terintegrasi koordinat petak kelompok tani",
  "Pelacakan fase tanaman otomatis (Vegetatif → Berbunga → Masak)",
  "Riwayat pemupukan dan irigasi tersimpan rapi",
];

export function SpatialSection() {
  return (
    <Section className="bg-stone-100 py-12 sm:py-14">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <Reveal className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wide text-lime-800">
            Fondasi Spasial
          </p>
          <h2 className="font-display text-2xl font-bold text-lime-950 sm:text-3xl">
            Mulai dari lahan Anda.
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 sm:text-base">
            Setiap petak memiliki riwayat, sumber air, dan fase hidup tanaman
            yang berbeda. RembukTani menempatkan lahan fisik Anda sebagai titik
            tolak seluruh pertimbangan.
          </p>
          <ul className="flex flex-col gap-2 pt-2">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-lime-400" aria-hidden />
                <span className="text-sm font-semibold tracking-tight text-lime-900">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-md sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-tight text-lime-800">
                  Petak Terdaftar #044
                </p>
                <h3 className="font-display text-2xl font-bold text-lime-950">
                  Blok Tirto A3
                </h3>
                <p className="text-sm text-stone-500">
                  Kelurahan Mangunrejo, Kepanjen, Malang • Luas 0.45 Ha
                </p>
              </div>
              <span className="rounded-full bg-lime-200 px-3 py-1 text-xs font-bold tracking-tight text-lime-900">
                Padi Inpari 32
              </span>
            </div>

            <div className="grid gap-3 min-[400px]:grid-cols-3">
              <MetricCard
                label="Fase Sekarang"
                value="Berbunga"
                meta="Hari Ke-68 HST"
                metaClass="text-lime-800"
              />
              <MetricCard
                label="Kebutuhan Air"
                value="Tinggi"
                meta="Perlu macak-macak"
                metaClass="text-cyan-700"
              />
              <MetricCard
                label="Jadwal Terdekat"
                value="Pemupukan 3"
                meta="Jendela: 48 Jam"
                metaClass="text-yellow-600"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-lime-200 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex size-12 shrink-0 items-center justify-center">
                  <div className="absolute inset-1 rounded-full outline outline-[5px] outline-offset-[-2px] outline-white" />
                  <div className="absolute inset-1 rounded-full outline outline-[5px] outline-offset-[-2px] outline-lime-400" />
                  <span className="relative z-10 text-xs font-bold text-lime-950">
                    72%
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight text-lime-950">
                    Kelembapan Tanah Optimal
                  </p>
                  <p className="text-sm text-lime-900">
                    Sesuai standar tanaman padi fase pembentukan bulir
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-lime-900" aria-hidden />
            </div>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}

function MetricCard({
  label,
  value,
  meta,
  metaClass,
}: {
  label: string;
  value: string;
  meta: string;
  metaClass: string;
}) {
  return (
    <div className="rounded-xl bg-stone-100 p-3">
      <p className="text-xs font-semibold tracking-tight text-neutral-500">
        {label}
      </p>
      <p className="font-display text-lg font-bold text-lime-950">{value}</p>
      <p className={`text-sm ${metaClass}`}>{meta}</p>
    </div>
  );
}
