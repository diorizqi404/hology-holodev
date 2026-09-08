import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CloudOff,
  MessageCircle,
  MousePointerClick,
  Satellite,
  Users,
} from "lucide-react";
import { Section } from "../layout/Section";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

const beforeItems = [
  {
    icon: CloudOff,
    title: "Cuaca terpisah dari jadwal tanam",
    desc: "Hujan mendadak mencuci pupuk yang baru saja ditabur dua jam lalu.",
  },
  {
    icon: Bot,
    title: 'Klaim teknologi "AI Pintar" yang kabur',
    desc: "Muncul skor persentase tanpa kejelasan sumber data atau kondisi tanah nyata.",
  },
  {
    icon: Users,
    title: "Sulit dimusyawarahkan dalam kelompok",
    desc: "Tidak ada catatan tertulis saat membagi jatah air irigasi dengan tetangga petak.",
  },
];

const afterItems = [
  {
    icon: Satellite,
    title: "Bukti otomatis masuk sendiri",
    desc: "Data satelit dan BMKG terisi otomatis tanpa perlu mengetik koordinat rumit.",
  },
  {
    icon: MousePointerClick,
    title: "Input minimal 1 kali ketukan",
    desc: "Jawab pertanyaan sederhana yang hanya diketahui petani di pematang.",
  },
  {
    icon: MessageCircle,
    title: "Bukti ringkas siap kirim ke WhatsApp",
    desc: "Format teks jernih untuk musyawarah ketua gapoktan dan penyuluh lapangan.",
  },
];

export function ContextSection() {
  return (
    <Section className="bg-stone-100 py-12 sm:py-14" id="fitur">
      <div className="flex flex-col items-center gap-8">
        <Reveal>
          <SectionHeading
            eyebrow="Konteks Nyata Pertanian"
            title="Informasi tersedia. Tapi keputusan tetap membutuhkan konteks."
            description="Petani bukan kekurangan data; petani terbebani oleh potongan informasi yang saling lepas dan tidak dapat dipertanggungjawabkan di lapangan."
          />
        </Reveal>

        <Stagger className="grid w-full gap-4 md:grid-cols-2 md:gap-6">
          <StaggerItem>
            <article className="flex h-full flex-col gap-4 rounded-2xl bg-white px-5 pb-10 pt-6 shadow-sm sm:px-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 shrink-0 text-orange-700" aria-hidden />
                <h3 className="font-display text-lg font-bold text-orange-700 sm:text-xl">
                  Sebelumnya: Terfragmentasi & Menebak
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-stone-500 sm:text-base">
                Prakiraan cuaca ada di aplikasi televisi, kondisi air dilihat
                sekilas di pematang, dan anjuran dosis pupuk diingat-ingat dari
                obrolan warung kopi kemarin malam.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                {beforeItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-xl bg-rose-200/40 p-3"
                  >
                    <item.icon
                      className="mt-0.5 size-3.5 shrink-0 text-orange-700"
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-lime-950">
                        {item.title}
                      </p>
                      <p className="text-sm leading-5 text-stone-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </StaggerItem>

          <StaggerItem>
            <article className="flex h-full flex-col gap-4 rounded-2xl bg-lime-100 p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 shrink-0 text-lime-700" aria-hidden />
                <h3 className="font-display text-lg font-bold text-lime-950 sm:text-xl">
                  Dengan RembukTani: Konteks Utuh
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-lime-900 sm:text-base">
                RembukTani menyatukan bukti otomatis dari stasiun BMKG terdekat
                dengan laporan taktil Anda, lalu menyajikannya dalam opsi yang
                dapat dipertanggungjawabkan.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                {afterItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-xl bg-white p-3"
                  >
                    <item.icon
                      className="mt-0.5 size-5 shrink-0 text-lime-500"
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-lime-950">
                        {item.title}
                      </p>
                      <p className="text-sm leading-5 text-stone-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </StaggerItem>
        </Stagger>
      </div>
    </Section>
  );
}
