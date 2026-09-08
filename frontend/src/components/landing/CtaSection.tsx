import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Section } from "../layout/Section";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";

export function CtaSection() {
  return (
    <Section id="cta" className="bg-stone-50 py-12 sm:py-14">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-lime-950 p-6 shadow-2xl sm:p-10 lg:p-12">
          <div
            className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-lime-400/10 blur-3xl sm:size-80"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-10 -right-10 size-64 rounded-full bg-lime-900/40 blur-3xl sm:size-80"
            aria-hidden
          />

          <div className="relative z-10 flex max-w-2xl flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-tight text-lime-400">
              <Sparkles className="size-3 text-lime-400" aria-hidden />
              Uji Coba Lapangan Bebas Biaya
            </span>
            <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              Mulai dari satu lahan Anda hari ini.
            </h2>
            <p className="text-sm leading-relaxed text-stone-300 sm:text-base">
              Daftarkan petak sawah pertama Anda dan buktikan betapa ringannya
              mengambil keputusan bercocok tanam yang terukur bersama kelompok
              tani Anda.
            </p>
            <div className="pt-2">
              <Link to="/register">
                <Button variant="accent" className="px-6 py-4 text-base font-bold">
                  Daftar Kelompok Tani
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-2 pt-2 text-sm text-stone-300 sm:flex-row sm:gap-4">
              <span>• Tanpa biaya langganan untuk Gapoktan</span>
              <span>• Kompatibel browser HP standar</span>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
