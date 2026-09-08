import { AlertTriangle, CloudRain, Droplets, Leaf, ShieldAlert } from "lucide-react";
import { Section } from "../layout/Section";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

const factors = [
  {
    icon: Droplets,
    title: "Faktor Air Lapangan",
    desc: "Tercatat: Macak-macak (sedikit). Belum cukup untuk melarutkan NPK tabur secara merata.",
    badge: "Input Petani",
    badgeClass: "text-lime-900",
    iconClass: "text-cyan-700",
  },
  {
    icon: CloudRain,
    title: "Faktor Cuaca BMKG",
    desc: "Peluang hujan ringan 24 jam ke depan 40%. Tidak ada badai berbahaya.",
    badge: "BMKG Resmi",
    badgeClass: "text-cyan-700",
    iconClass: "text-cyan-700",
  },
  {
    icon: Leaf,
    title: "Faktor Fase Pertumbuhan",
    desc: "Padi memasuki fase bunting tua / pembentukan malai (HST 68). Pupuk susulan dibutuhkan segera.",
    badge: "Profil Lahan",
    badgeClass: "text-lime-800",
    iconClass: "text-orange-400",
  },
];

export function TransparencySection() {
  return (
    <Section className="bg-stone-50 py-12 sm:py-14">
      <div className="flex flex-col items-center gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Transparansi Logika"
            title="Bukan hanya hasil. Tunjukkan juga alasannya."
            description="Kami menolak kotak hitam (black-box AI). Anda melihat secara gamblang faktor yang dihitung, faktor yang belum pasti, dan batasan risikonya."
          />
        </Reveal>

        <Reveal className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-md sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 shrink-0 text-orange-400" aria-hidden />
              <h3 className="font-display text-lg font-bold text-lime-950 sm:text-xl">
                Ringkasan Kondisi Petak Saat Ini
              </h3>
            </div>
            <span className="self-start rounded-full bg-lime-200 px-3 py-1 text-xs font-bold tracking-tight text-lime-900">
              Status: Kondisi Perlu Ditinjau
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {factors.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-2 rounded-xl bg-stone-100 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <f.icon className={`mt-0.5 size-4 shrink-0 ${f.iconClass}`} aria-hidden />
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-lime-950">
                      {f.title}
                    </p>
                    <p className="text-sm leading-5 text-stone-500">{f.desc}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs font-bold tracking-tight ${f.badgeClass}`}
                >
                  {f.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-lime-100 p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-lime-900" aria-hidden />
            <p className="text-sm leading-5 text-lime-900">
              <span className="font-bold">Batasan Sistem:</span> Jika irigasi
              desa terlambat masuk lebih dari 48 jam, pupuk yang ditabur hari
              ini berisiko menguap. Pertimbangkan alternatif penundaan 1 hari.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
