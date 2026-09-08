import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Bell, Check, CircleHelp, History, Leaf, Menu, Sprout, UserCircle2, Warehouse, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { farmerApi, type ApiCropContext, type ApiLand } from "../../services/farmer-api";
import { getUser } from "../../lib/auth";
import { LogoutButton } from "../../components/auth/LogoutButton";
import { WeatherStatus } from "../../components/farmer/WeatherStatus";

const options = [
  { id: "none", title: "Kering / Retak Rambut", description: "Tanah mulai merekah halus, tidak ada lapisan genangan air sama sekali.", icon: "◌", image: "https://www.figma.com/api/mcp/asset/12f5b2d3-4a7a-47ec-a5d7-e14e8d7c3d41.png", label: "Retak" },
  { id: "limited", title: "Macak-macak (1 – 2 cm)", description: "Tanah becek hampir basah, genangan tipis setinggi mata kaki bawah.", icon: "◌", image: "https://www.figma.com/api/mcp/asset/864611c8-3b58-4444-8606-6186e6a5b233.png", label: "1–2 cm" },
  { id: "present", title: "Tergenang Dalam (>5 cm)", description: "Air melimpah menutupi seluruh permukaan tanah dan pangkal batang padi.", icon: "≋", image: "https://www.figma.com/api/mcp/asset/9b5fa1e3-c8f4-47b4-9d19-270f04e08bb6.png", label: ">5 cm" },
  { id: "unknown", title: "Tidak Tahu / Belum Cek Langsung", description: "Bukan kesalahan. Sistem akan mendasarkan analisis pada telemetri cuaca dan jadwal subak.", icon: "?", image: "", label: "" },
] as const;

export function LandReviewPage() {
  const { landId = "" } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [land, setLand] = useState<ApiLand | null>(null);
  const [crop, setCrop] = useState<ApiCropContext | null>(null);
  const [selected, setSelected] = useState<(typeof options)[number]["id"]>("unknown");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([farmerApi.getLand(landId), farmerApi.getActiveCrop(landId).catch(() => null)]).then(([nextLand, nextCrop]) => {
      if (active) { setLand(nextLand); setCrop(nextCrop); }
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Data lahan gagal dimuat"); });
    return () => { active = false; };
  }, [landId]);

  const proceed = () => {
    sessionStorage.setItem(`field-pulse:${landId}`, JSON.stringify({ water_presence: selected }));
    navigate(`/farmer/lands/${landId}/irrigation`);
  };

  return <div className="min-h-screen bg-[#f3f3ec] text-[#15240a]">
    {mobileNavOpen && <button className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div><div className="mb-6 flex items-center justify-between px-2"><div className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white"><Leaf size={15} className="text-[#85c254]" /> REMBUKTANI</div><button className="md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={20}/></button></div><Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold">+ Tambah Lahan</Link><nav className="space-y-1"><SideLink to="/farmer/dashboard" icon={<Warehouse size={18}/>} label="Beranda"/><SideLink to="/farmer/lands" icon={<Sprout size={18}/>} label="Lahan" active/><SideLink to="/farmer/history" icon={<History size={18}/>} label="Riwayat"/><SideLink to="/farmer/profile" icon={<UserCircle2 size={18}/>} label="Profil"/></nav></div>
      <div className="space-y-4 px-1"><div className="rounded-xl bg-[#e9fcb5] p-3"><p className="mb-2 text-xs font-bold">Sinkronisasi BMKG</p><WeatherStatus preferredLandId={landId} /></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={15}/></div><div><p className="max-w-36 truncate text-xs font-bold">{user?.display_name || user?.displayName || "Sahabat Tani"}</p><p className="text-xs text-[#44483f]">{user?.role === "reviewer" ? "Reviewer" : "Petani"}</p></div></div><LogoutButton compact /></div></div>
    </aside>

    <div className="md:pl-[260px]"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#deded4]/60 bg-[#fafaf6]/90 px-4 shadow-sm backdrop-blur-xl sm:px-8"><button className="md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22}/></button><span className="max-w-[55%] truncate rounded bg-[#e4f6b0] px-2 py-1 text-xs font-semibold">Wilayah: {land ? [land.village, land.regency].filter(Boolean).join(", ") : "Memuat wilayah"}</span><div className="flex items-center gap-3"><span className="hidden sm:flex"><WeatherStatus preferredLandId={landId}/></span><Bell size={17}/><UserCircle2 size={20}/></div></header>
      <main className="mx-auto max-w-[900px] px-4 pb-12 py-7 sm:px-8">
        <div className="mb-5 flex items-center justify-between gap-4"><Link to={`/farmer/lands/${landId}`} className="flex items-center gap-2 text-sm font-semibold text-[#56652e]">← Kembali</Link><span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold">Pertanyaan 1 dari 3 Pertanyaan</span></div>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#deded4]"><motion.div initial={{ width: 0 }} animate={{ width: "33%" }} className="h-full rounded-full bg-[#85c254]" /></div>
        {error ? <div className="rounded-2xl bg-[#fff3df] p-4 text-sm">{error}</div> : !land ? <div className="h-80 animate-pulse rounded-2xl bg-white" /> : <>
          <div className="mb-4 flex w-fit items-center gap-2 rounded-lg bg-[#def0ab] px-3 py-1.5 text-xs font-bold"><MapPinIcon/>{land.name} · {crop ? [crop.crop_name, crop.variety_name].filter(Boolean).join(" ") : "Tanaman belum diisi"}</div>
          <section className="mb-6"><h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Bagaimana kondisi genangan air di petak saat ini?</h1><p className="mt-2 max-w-2xl text-sm text-[#44483f]">Pilih kondisi air yang Anda amati langsung di pematang petak sawah pagi ini.</p></section>
          <div className="space-y-2.5">{options.map((option, index) => <motion.button key={option.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} onClick={() => setSelected(option.id)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition sm:p-5 ${selected === option.id ? "border-[#9fca52] bg-[#e2f9a9] shadow-[0_3px_10px_rgba(133,194,84,0.2)]" : "border-transparent bg-white hover:border-[#c8df9c]"}`}><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${selected === option.id ? "bg-[#15240a] text-white" : "bg-[#e4f6b0] text-[#56652e]"}`}>{selected === option.id ? <Check size={12}/> : option.icon}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-bold">{option.title}{selected === option.id && <small className="rounded bg-[#c7e27f] px-2 py-0.5 text-[9px] font-bold">TERPILIH</small>}{selected === option.id && crop?.growth_stage === "flowering" && option.id === "limited" && <small className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-[#4f8a45]">Rekomendasi fase berbunga</small>}</span><span className="mt-1 block text-xs leading-5 text-[#56652e]">{option.description}</span></span><span className="text-sm text-[#4f8a45]">{option.id === "present" ? "≋" : option.id === "unknown" ? <CircleHelp size={15}/> : "⁙"}</span></motion.button>)}</div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{options.slice(0, 3).map((option) => <div key={option.id} className="overflow-hidden rounded-xl bg-[#e4f6b0] p-1.5"><div className="relative h-16 overflow-hidden rounded-lg bg-[#c8df9c] sm:h-20">{option.image && <img src={option.image} alt={option.title} className="size-full object-cover"/>}<span className="absolute bottom-1 left-1 rounded bg-[#15240a]/75 px-1.5 py-0.5 text-[8px] font-bold text-white">{option.label}</span></div><p className="px-1 py-1 text-[9px] font-bold sm:text-[10px]">{option.id === "none" ? "Kering / Terbatas" : option.id === "limited" ? "Macak-macak Ideal" : "Genangan Penuh"}</p></div>)}</div>
          <div className="mt-8 flex items-center justify-between gap-4"><button type="button" onClick={() => navigate(`/farmer/lands/${landId}`)} className="text-xs font-bold text-[#56652e]">Lewati Pertanyaan Ini</button><button onClick={proceed} className="flex items-center gap-2 rounded-xl bg-[#85c254] px-5 py-3 text-sm font-bold shadow-[0_5px_12px_rgba(133,194,84,0.28)]">Lanjut <ArrowRight size={17}/></button></div>
        </>}
      </main>
    </div>
  </div>;
}

function SideLink({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) { return <Link to={to} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active ? "bg-[#213014] text-white" : "text-[#44483f] hover:bg-[#edf4dc]"}`}>{icon}{label}</Link>; }
function MapPinIcon() { return <span className="text-[#4f8a45]">●</span>; }
