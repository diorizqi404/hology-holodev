import { Eye, Scale, UserCheck } from "lucide-react";
import { Section } from "../layout/Section";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

const principles = [
  {
    icon: Eye,
    title: "1. Sumber Terlihat Jelas",
    desc: "Setiap angka cuaca berasal dari stasiun BMKG teridentifikasi. Tidak ada angka gaib atau rekomendasi misterius tanpa atribusi ilmiah.",
    darkIcon: false,
  },
  {
    icon: Scale,
    title: "2. Ketidakpastian Tidak Disembunyikan",
    desc: "Jika data satelit berawan atau prakiraan cuaca memiliki probabilitas rendah, kami sampaikan apa adanya. Petani berhak tahu batasan risiko.",
    darkIcon: false,
  },
  {
    icon: UserCheck,
    title: "3. Keputusan Tetap Milik Manusia",
    desc: "Alat kami berhenti pada menyajikan perbandingan opsi. Tanggung jawab, hak pilih, dan kedaulatan tanah berada 100% di tangan Anda.",
    darkIcon: true,
  },
];

export function PrinciplesSection() {
  return (
    <Section id="tentang" className="bg-stone-100 py-12 sm:py-14">
      <div className="flex flex-col items-center gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Etika & Kedaulatan"
            title="Tiga Prinsip yang Kami Pegang Teguh"
            description="RembukTani dibangun bukan untuk menggantikan kebijaksanaan petani sepuh, melainkan memperkuat pertimbangan dengan sains terbuka."
          />
        </Reveal>

        <Stagger className="grid w-full gap-4 md:grid-cols-3 md:gap-6">
          {principles.map((p) => (
            <StaggerItem key={p.title} className="h-full">
              <article className="flex h-full flex-col gap-4 rounded-2xl bg-white px-5 pb-10 pt-6 shadow-sm sm:p-6">
                <div
                  className={`flex size-12 items-center justify-center rounded-xl ${
                    p.darkIcon ? "bg-lime-950" : "bg-lime-200"
                  }`}
                >
                  <p.icon
                    className={`size-5 ${
                      p.darkIcon ? "text-lime-400" : "text-lime-950"
                    }`}
                    aria-hidden
                  />
                </div>
                <h3 className="font-display text-xl font-bold text-lime-950">
                  {p.title}
                </h3>
                <p className="text-base leading-5 text-stone-700">{p.desc}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
