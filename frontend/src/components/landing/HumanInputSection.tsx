import { useState } from "react";
import { Droplets, HelpCircle, Info, Waves } from "lucide-react";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";

const waterOptions = [
  { id: "enough", label: "Ada (Cukup)", hint: "> 3 cm", icon: Waves },
  { id: "little", label: "Sedikit", hint: "Macak-macak", icon: Droplets },
  { id: "none", label: "Tidak Ada", hint: "Kering retak", icon: Waves },
  { id: "unsure", label: "Tidak Yakin", hint: "Belum cek", icon: HelpCircle },
];

const scheduleOptions = [
  { id: "today", label: "Sore Ini", hint: "Pukul 16.00" },
  { id: "later", label: "Besok Lusa", hint: "Jadwal Gapoktan" },
  { id: "unknown", label: "Belum Ditentukan", hint: "Tergantung debit" },
];

export function HumanInputSection() {
  const [water, setWater] = useState("little");
  const [schedule, setSchedule] = useState("later");

  return (
    <Section className="bg-stone-100 py-12 sm:py-14">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <Reveal className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wide text-lime-800">
            Sentuhan Manusia Minimal
          </p>
          <h2 className="font-display text-2xl font-bold text-lime-950 sm:text-3xl">
            Cukup beri tahu kondisi yang hanya Anda yang tahu.
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 sm:text-base">
            Satelit dan sensor tidak bisa mengendus bau tanah atau melihat
            genangan di bawah rumpun daun. Kami hanya mengajukan pertanyaan yang
            bermakna dan praktis.
          </p>
          <div className="rounded-xl bg-lime-200 p-4">
            <div className="mb-1 flex items-center gap-1">
              <Info className="size-3.5 text-lime-900" aria-hidden />
              <p className="text-sm font-bold tracking-tight text-lime-950">
                Prinsip Kejujuran Data
              </p>
            </div>
            <p className="text-sm leading-5 text-lime-900">
              &quot;Tidak tahu&quot; juga merupakan jawaban yang valid di
              RembukTani. Kami tidak pernah memaksa asumsi yang berisiko
              merugikan panen Anda.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal delay={0.05}>
            <article className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-xs font-bold tracking-tight text-neutral-500">
                  Pulse Pertanyaan 1 Dari 2
                </p>
                <p className="text-xs font-bold tracking-tight text-lime-700">
                  Wajib
                </p>
              </div>
              <h3 className="mb-4 font-display text-lg font-bold text-lime-950 sm:text-xl">
                Apakah masih ada genangan air di petak saat ini?
              </h3>
              <div
                className="grid grid-cols-2 gap-2 sm:gap-3"
                role="radiogroup"
                aria-label="Kondisi genangan air"
              >
                {waterOptions.map((opt) => {
                  const selected = water === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setWater(opt.id)}
                      className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 transition-all duration-200 ${
                        selected
                          ? "bg-lime-300 shadow-[0_0_0_2px_#15240a]"
                          : "bg-stone-100 hover:bg-stone-200/80"
                      }`}
                    >
                      <opt.icon className="size-4 text-lime-950" aria-hidden />
                      <span className="text-center text-sm font-bold tracking-tight text-lime-950">
                        {opt.label}
                      </span>
                      <span
                        className={`text-center text-sm ${
                          selected ? "text-lime-900" : "text-neutral-500"
                        }`}
                      >
                        {opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.1}>
            <article className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-xs font-bold tracking-tight text-neutral-500">
                  Pulse Pertanyaan 2 Dari 2
                </p>
                <p className="text-xs font-semibold tracking-tight text-lime-800">
                  Opsional
                </p>
              </div>
              <h3 className="mb-4 font-display text-lg font-bold text-lime-950 sm:text-xl">
                Kapan jadwal giliran irigasi masuk ke petak Anda?
              </h3>
              <div
                className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3"
                role="radiogroup"
                aria-label="Jadwal irigasi"
              >
                {scheduleOptions.map((opt) => {
                  const selected = schedule === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSchedule(opt.id)}
                      className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-3 transition-all duration-200 ${
                        selected
                          ? "bg-lime-300 shadow-[0_0_0_2px_#15240a]"
                          : "bg-stone-100 hover:bg-stone-200/80"
                      }`}
                    >
                      <span className="text-sm font-bold tracking-tight text-lime-950">
                        {opt.label}
                      </span>
                      <span
                        className={`text-sm ${
                          selected ? "text-lime-900" : "text-neutral-500"
                        }`}
                      >
                        {opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
