import { Leaf, MapPinned, Touchpad, Vote } from "lucide-react";
import { Section } from "../layout/Section";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

const steps = [
  {
    n: "01",
    title: "Pilih Lahan",
    desc: "Tentukan petak sawah yang sedang Anda kelola dari daftar blok kelompok tani Anda.",
    chip: "Contoh: Blok Tirto A3",
    chipClass: "bg-stone-100 text-lime-800",
    icon: MapPinned,
  },
  {
    n: "02",
    title: "Bukti Masuk Otomatis",
    desc: "Sistem menarik data BMKG resmi, estimasi kelembapan, dan kalender vegetasi tanaman secara instan.",
    chip: null,
    icon: Leaf,
  },
  {
    n: "03",
    title: "Input Kondisi Lapang",
    desc: "Cukup konfirmasi hal yang hanya tampak di tanah: apakah air masih menggenang? Ada hama terlihat?",
    chip: "1-2 Sentuhan jempol",
    chipClass: "bg-lime-100 text-lime-900",
    icon: Touchpad,
  },
  {
    n: "04",
    title: "Buat Keputusan",
    desc: "Tinjau 3 alternatif solusi logis, ambil tindakan, dan bagikan ringkasan tertulis ke grup WhatsApp tani.",
    chip: "Otoritas milik Anda",
    chipClass: "bg-lime-950 text-lime-300",
    darkChip: true,
    icon: Vote,
  },
];

export function StepsSection() {
  return (
    <Section id="cara-kerja" className="bg-stone-50 py-12 sm:py-14">
      <div className="flex flex-col gap-8">
        <Reveal className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-wide text-lime-800">
              Alur Sederhana
            </p>
            <h2 className="font-display text-2xl font-bold text-lime-950 sm:text-3xl">
              Empat Langkah Menuju Keputusan
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-stone-700 sm:text-base">
            Dirancang untuk jari yang terkena lumpur dan mata yang terpapar terik
            matahari sawah. Cepat, jelas, dan manusiawi.
          </p>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <StaggerItem key={step.n} className="h-full">
              <article className="flex h-full flex-col justify-between rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-lime-950">
                    <span className="font-display text-lg font-bold text-lime-400">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-lime-950">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-5 text-stone-700">{step.desc}</p>
                </div>
                {step.chip ? (
                  <div className="pt-4">
                    <div
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold tracking-tight ${step.chipClass}`}
                    >
                      <step.icon className="size-3" aria-hidden />
                      {step.chip}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4" />
                )}
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
