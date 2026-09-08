import { CheckCircle2 } from "lucide-react";

const navLinks = [
  { href: "#beranda", label: "Beranda" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#fitur", label: "Fitur Utama" },
  { href: "#tentang", label: "Tentang RembukTani" },
];

export function Footer() {
  return (
    <footer className="w-full bg-lime-950 px-3 pb-8 pt-12 text-stone-300 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <p className="font-display text-xl font-bold text-white">
              RembukTani
            </p>
            <p className="max-w-xs text-sm leading-relaxed">
              Platform kecerdasan pertanian presisi untuk kelompok tani dan
              penyuluh Indonesia. Bukti otomatis, input minimal, keputusan
              manusia yang berdaya.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold tracking-tight text-lime-300">
              Navigasi
            </p>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold tracking-tight text-lime-300">
              Layanan Mandor
            </p>
            <a href="#cta" className="text-sm transition-colors hover:text-white">
              Portal Penyuluh
            </a>
            <a href="#cta" className="text-sm transition-colors hover:text-white">
              Registrasi Gapoktan
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold tracking-tight text-lime-300">
              Wilayah Operasional
            </p>
            <p className="text-sm leading-relaxed">
              Mendukung lumbung pangan nasional di Jawa, Sumatera, Sulawesi, dan
              Nusa Tenggara.
            </p>
            <div className="mt-2 flex items-center gap-2 text-lime-300">
              <CheckCircle2 className="size-4 shrink-0 text-lime-400" aria-hidden />
              <span className="text-xs font-semibold tracking-tight">
                Integrasi Data BMKG Terverifikasi
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            © 2025 RembukTani Indonesia. Hak Cipta Dilindungi.
          </p>
          <p className="text-xs font-semibold tracking-tight">
            Kedaulatan Petani Mandiri
            <span className="mx-2">•</span>
            Presisi Iklim Tropis
          </p>
        </div>
      </div>
    </footer>
  );
}
