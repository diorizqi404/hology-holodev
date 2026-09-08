import {
  ArrowRight,
  CloudSun,
  Droplets,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "../ui/Button";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";
import { Section } from "../layout/Section";
import { fadeUp, staggerContainer } from "../../lib/animations";

import hero from "../../assets/images/hero.jpg";

const stats = [
  {
    label: "DATA VALID",
    value: "100% Terbuka",
    hint: "Tanpa skor rahasia",
  },
  {
    label: "WAKTU INPUT",
    value: "< 30 Detik",
    hint: "Cukup sentuhan jempol",
  },
  {
    label: "FORMAT HASIL",
    value: "Ringkas WA",
    hint: "Siap musyawarah",
  },
];

const storyboard = [
  {
    stage: "Tahap 01",
    title: "Lahan Muncul",
    desc: "Foto udara petak sawah tampil jernih dengan kontur irigasi.",
    accent: "text-lime-900",
  },
  {
    stage: "Tahap 02",
    title: "Pin Petak",
    desc: "Penanda Blok Tirto A3 terdeteksi dengan fase padi berbunga.",
    accent: "text-lime-900",
  },
  {
    stage: "Tahap 03",
    title: "Data BMKG",
    desc: "Kartu cuaca masuk: Cerah Berawan, 24°C, angin tenang 4 km/j.",
    accent: "text-cyan-700",
  },
  {
    stage: "Tahap 04",
    title: "Field Pulse",
    desc: "Petani mengetuk 1 opsi: genangan air petak saat ini 'Sedikit'.",
    accent: "text-lime-900",
  },
  {
    stage: "Tahap 05",
    title: "Koneksi Bukti",
    desc: "Cuaca + air petak digabung menjadi 'Kondisi Perlu Ditinjau'.",
    accent: "text-orange-400",
  },
  {
    stage: "Tahap 06",
    title: "Opsi Manusia",
    desc: "Petani memilih Opsi B, mencetak bukti keputusan resmi.",
    accent: "text-lime-300",
    dark: true,
  },
];

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="beranda"
      className="overflow-hidden bg-gradient-to-b from-stone-50 via-stone-100 to-stone-100 pb-10 pt-24 sm:pb-12 sm:pt-28"
    >
      <motion.div
        className="flex flex-col gap-8 lg:gap-10"
        variants={reduceMotion ? undefined : staggerContainer}
        initial={reduceMotion ? undefined : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <motion.div
          className="flex flex-wrap items-center gap-2 sm:gap-3"
          variants={fadeUp}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-lime-200 px-3 py-1 text-xs font-semibold tracking-tight text-lime-950">
            <span className="size-2 rounded-full bg-lime-400" aria-hidden />
            Kedaulatan Petani Mandiri
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-tight text-lime-900">
            <ShieldCheck className="size-3.5 text-lime-400" aria-hidden />
            Keputusan akhir tetap dibuat oleh Anda
          </span>
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div className="flex flex-col gap-5 sm:gap-6" variants={fadeUp}>
            <h1 className="font-display text-[1.75rem] font-extrabold leading-tight text-lime-950 min-[360px]:text-3xl sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Informasi lahan menjadi keputusan yang lebih jelas.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-stone-700 sm:text-lg sm:leading-7">
              RembukTani membantu menggabungkan informasi cuaca, kondisi
              lapangan, dan konteks tanaman agar keputusan lebih mudah dipahami
              tanpa asumsi buta.
            </p>
            <div>
              <Link to="/register">
                <Button variant="accent" className="px-5 py-3.5 text-base">
                  Mulai dengan RembukTani
                  <ArrowRight className="size-3.5" aria-hidden />
                </Button>
              </Link>
            </div>

            <Stagger className="grid grid-cols-1 gap-3 pt-2 min-[400px]:grid-cols-3">
              {stats.map((item) => (
                <StaggerItem key={item.label}>
                  <div className="rounded-xl bg-white px-3 pb-5 pt-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-tight text-lime-800">
                      {item.label}
                    </p>
                    <p className="font-display text-lg font-bold text-lime-950">
                      {item.value}
                    </p>
                    <p className="pt-0.5 text-sm text-neutral-500">{item.hint}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </motion.div>

          <motion.div variants={fadeUp}>
            <HeroPreviewCard />
          </motion.div>
        </div>

        <Reveal className="rounded-2xl bg-white px-4 pb-6 pt-8 shadow-md sm:px-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-lime-800">
                Arsitektur Transisi UI
              </p>
              <h3 className="font-display text-lg font-bold text-lime-950 sm:text-xl">
                Storyboard 6-Tahap Alur Keputusan
              </h3>
            </div>
            <p className="max-w-sm text-sm text-stone-500">
              Membimbing petani dari observasi satelit, cuaca BMKG, hingga
              otorisasi final di tangan manusia.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {storyboard.map((step) => (
              <div
                key={step.stage}
                className={`flex flex-col gap-2 rounded-xl px-3 pb-6 pt-3 ${
                  step.dark ? "bg-lime-950 shadow-sm" : "bg-stone-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold tracking-tight ${step.accent}`}>
                    {step.stage}
                  </span>
                </div>
                <p
                  className={`font-display text-lg font-bold ${
                    step.dark ? "text-white" : "text-lime-950"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-sm leading-5 ${
                    step.dark ? "text-stone-300" : "text-neutral-500"
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </motion.div>
    </Section>
  );
}

function HeroPreviewCard() {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-2xl bg-lime-950 shadow-xl sm:min-h-[420px] lg:min-h-[460px]">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(160deg, #3f6212 0%, #1a2e05 45%, #14532d 100%), radial-gradient(circle at 30% 40%, rgba(163,230,53,0.25), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-lime-950 via-lime-950/40 to-transparent" />

      <div style={{ backgroundImage: `url(${hero})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }} className="relative z-10 flex h-full min-h-[340px] flex-col justify-between gap-4 p-4 sm:min-h-[420px] sm:p-6 lg:min-h-[460px]">
          <div className="absolute inset-0 bg-black/40" />
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-lime-950/80 px-3 py-2 backdrop-blur-md">
            <MapPin className="size-3.5 shrink-0 text-lime-400" aria-hidden />
            <div>
              <p className="text-xs font-bold tracking-tight text-white">
                Blok Tirto A3
              </p>
              <p className="text-sm text-stone-300">Kepanjen, Kab. Malang</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-cyan-700/90 px-3 py-2 backdrop-blur-md">
            <CloudSun className="size-3.5 shrink-0 text-white" aria-hidden />
            <div>
              <p className="text-xs font-bold tracking-tight text-white">
                BMKG: 24°C
              </p>
              <p className="text-sm text-white/80">Cerah Berawan • Lembap 85%</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-lime-950/90 px-3 py-2 backdrop-blur-md sm:gap-3 sm:px-4">
            <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-tight text-lime-400">
              <Droplets className="size-3.5" aria-hidden />
              Air: Sedikit
            </span>
            <span className="text-neutral-500" aria-hidden>
              •
            </span>
            <span className="text-xs font-bold tracking-tight text-orange-400">
              Kondisi Perlu Ditinjau
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-white/95 p-3 shadow-xl backdrop-blur-md sm:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-lime-400" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-wide text-lime-800">
                Rekomendasi Opsi Lapangan
              </p>
            </div>
            <span className="rounded-sm bg-lime-200 px-2 py-0.5 text-xs font-semibold tracking-tight text-lime-900">
              3 Pilihan Valid
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
            {[
              { label: "Opsi A", value: "Pupuk NPK Siang", active: true },
              { label: "Opsi B (Saran)", value: "Tunda 24 Jam", active: false },
              { label: "Opsi C", value: "Rembuk Petak", active: false },
            ].map((opt) => (
              <div
                key={opt.label}
                className={`rounded-lg p-2 ${
                  opt.active ? "bg-lime-200" : "bg-lime-100"
                }`}
              >
                <p className="text-xs font-bold tracking-tight text-lime-950">
                  {opt.label}
                </p>
                <p className="text-sm text-lime-900">{opt.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
