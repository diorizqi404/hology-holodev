import { Bell, BookOpenText, ChevronRight, CloudSun, History, Home, Leaf, LogOut, MapPin, Plus, Sprout, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hero from "../assets/images/hero.jpg";
import { apiFetch, clearAuth, getUser } from "../lib/auth";

type Land = {
  id: string;
  name: string;
  description?: string;
  village?: string;
  district?: string;
  regency?: string;
};

export function HomePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [lands, setLands] = useState<Land[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<Land[]>("/lands")
      .then((items) => { if (active) { setLands(items); setStatus("ready"); } })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Data lahan gagal dimuat");
        setStatus("error");
        if (reason instanceof Error && reason.message.includes("Sesi berakhir")) navigate("/login", { replace: true });
      });
    return () => { active = false; };
  }, [navigate]);

  const displayName = user?.display_name || user?.displayName || "Sahabat Tani";

  return (
    <div className="min-h-screen bg-white text-[#15240a]">
      <div className="mx-auto min-h-screen w-full max-w-[390px] bg-[#f3f3ec] pb-28 pt-16 shadow-[0_0_40px_rgba(21,36,10,0.06)]">
        <header className="fixed inset-x-0 top-0 z-30 mx-auto flex h-16 w-full max-w-[390px] items-center justify-between bg-[#f3f3ec]/90 px-4 backdrop-blur-xl">
          <div className="flex h-7 items-center gap-1 rounded-xl bg-[#0d1b03] px-3 text-white shadow-md"><Leaf size={16} fill="#85c254" className="text-[#85c254]" /><span className="text-[10px] font-semibold tracking-[.12em]">REMBUKTANI</span></div>
          <div className="flex items-center gap-1"><button className="flex size-11 items-center justify-center rounded-full" aria-label="Notifikasi"><Bell size={20} /></button><button onClick={() => { clearAuth(); navigate("/login", { replace: true }); }} className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white" aria-label="Keluar"><LogOut size={14} /></button></div>
        </header>

        <main>
          <section className="space-y-3 px-4 pb-3 pt-2">
            <div className="flex items-start justify-between">
              <div><div className="flex items-center gap-2"><h1 className="font-display text-xl font-semibold tracking-[-.025em]">Selamat Pagi,</h1><span className="inline-flex items-center gap-1 rounded-full bg-[#b4f580] px-2 py-0.5 text-xs font-semibold text-[#3b7105]"><span className="size-1.5 rounded-full bg-[#75b84a]" />Aktif</span></div><p className="mt-0.5 text-sm font-semibold text-[#56652e]">{displayName}</p></div>
              <div className="flex size-11 items-center justify-center rounded-full bg-[#364c23] text-white shadow-sm"><UserRound size={22} /></div>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-[#fafaf6] p-3 shadow-[0_2px_8px_-1px_rgba(21,36,10,0.06)]">
              <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#337ea9]/15 text-[#337ea9]"><CloudSun size={21} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">Cuaca lahan akan tampil otomatis</p><p className="truncate font-display text-sm text-[#364c23]">BMKG aktif setelah lokasi lahan tersedia</p></div></div><span className="shrink-0 rounded-md bg-[#deded4]/50 px-2 py-1 text-[10px] font-semibold text-[#56652e]">BMKG</span>
            </div>
          </section>

          <section className="space-y-3 px-4 pt-2">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><h2 className="font-display text-lg font-bold">Lahan Saya</h2>{lands.length > 0 && <span className="rounded-full bg-[#364c23]/10 px-2 py-0.5 text-xs font-semibold text-[#364c23]">{lands.length} Petak Aktif</span>}</div>{lands.length > 1 && <button className="text-sm font-semibold text-[#364c23]">Lihat Semua</button>}</div>

            {status === "loading" && <div className="space-y-3" aria-label="Memuat lahan"><div className="h-44 animate-pulse rounded-xl bg-[#deded4]" /><div className="h-28 animate-pulse rounded-xl bg-white" /></div>}
            {status === "error" && <div className="rounded-xl border border-amber-600/20 bg-amber-50 p-4"><p className="font-semibold">Data lahan belum dapat dimuat</p><p className="mt-1 font-display text-sm text-[#56652e]">{error}</p><button onClick={() => window.location.reload()} className="mt-3 rounded-lg bg-[#15240a] px-3 py-2 text-sm font-semibold text-white">Coba lagi</button></div>}
            {status === "ready" && lands.length === 0 && <div className="rounded-2xl bg-white p-6 text-center shadow-sm"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#e9fcb5]"><Sprout size={27} /></span><h3 className="mt-3 font-display text-lg font-bold">Belum ada lahan</h3><p className="mt-1 font-display text-sm leading-5 text-[#56652e]">Tambahkan petak pertama agar cuaca BMKG dan alur keputusan dapat dimulai.</p><button className="mt-4 inline-flex h-12 items-center gap-2 rounded-xl bg-[#85c254] px-5 font-semibold shadow-sm"><Plus size={18} />Tambah Lahan</button></div>}
            {status === "ready" && lands.map((land, index) => <LandCard key={land.id} land={land} attention={index === 0} />)}
          </section>

          <section className="mt-6 px-4"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">Keputusan Terbaru</h2><span className="text-xs font-semibold text-[#56652e]">Jejak keputusan manusia</span></div><div className="mt-3 rounded-xl bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-[#e9fcb5]"><BookOpenText size={20} /></span><div><p className="text-sm font-semibold">Belum ada risalah terbaru</p><p className="font-display text-xs text-[#75786e]">Riwayat muncul setelah keputusan dikonfirmasi.</p></div></div></div></section>
          <section className="mt-6 px-4"><div className="flex gap-3 rounded-xl bg-[#15240a] p-3 text-white shadow-md"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#85c254]/20 text-[#85c254]"><CirclePrinciple /></span><div><p className="text-xs font-bold tracking-[.05em] text-[#85c254]">PRINSIP REMBUKTANI</p><p className="mt-0.5 font-display text-sm leading-5 text-white/90">Data memberi bahan pertimbangan, putusan akhir tetap di tangan petani.</p></div></div></section>
        </main>

        <nav className="fixed inset-x-0 bottom-3 z-30 mx-auto flex w-[calc(100%-32px)] max-w-[358px] items-center justify-between rounded-full bg-[#15240a]/95 px-3 py-2 text-white shadow-[0_12px_32px_rgba(21,36,10,.28)] backdrop-blur-xl" aria-label="Navigasi utama">
          <NavItem active icon={<Home size={19} />} label="Beranda" /><NavItem icon={<MapPin size={19} />} label="Lahan" /><button className="flex size-12 items-center justify-center rounded-full bg-[#85c254] text-[#15240a] shadow-[0_4px_7px_rgba(133,194,84,.45)]" aria-label="Tambah lahan"><Plus size={21} /></button><NavItem icon={<History size={19} />} label="Riwayat" /><NavItem icon={<UserRound size={20} />} label="Profil" />
        </nav>
      </div>
    </div>
  );
}

function LandCard({ land, attention }: { land: Land; attention: boolean }) {
  const location = [land.village || land.district, land.regency].filter(Boolean).join(" • ") || "Lokasi belum dilengkapi";
  return <article className="overflow-hidden rounded-xl bg-white shadow-[0_4px_16px_-2px_rgba(21,36,10,.08)]"><div className="relative h-44 bg-[#213014]"><img src={hero} alt="Petak lahan" className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#15240a]/90 via-[#15240a]/25 to-transparent" />{attention && <span className="absolute left-3 top-3 rounded-full bg-[#b98532] px-2.5 py-1 text-xs font-semibold text-white">△ Perlu Review</span>}<div className="absolute inset-x-3 bottom-3 text-white"><h3 className="font-display text-xl font-bold">{land.name}</h3><p className="flex items-center gap-1 font-display text-sm text-white/90"><MapPin size={13} />{location}</p></div></div><div className="space-y-3 p-4"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#e9fcb5] px-2.5 py-1 text-xs font-medium">Data tanaman belum lengkap</span></div><div className="flex items-center justify-between rounded-lg bg-[#fafaf6] px-3 py-2 text-xs font-semibold text-[#56652e]"><span>BMKG siap diperbarui</span><span className="text-[#b98532]">Perlu tinjauan</span></div><button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] font-semibold">Tinjau Kondisi Lahan <ChevronRight size={18} /></button></div></article>;
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) { return <button className={`flex min-w-[54px] flex-col items-center gap-0.5 py-1 text-xs font-semibold ${active ? "text-[#85c254]" : "text-white/70"}`}>{icon}<span>{label}</span></button>; }
function CirclePrinciple() { return <Leaf size={20} />; }
