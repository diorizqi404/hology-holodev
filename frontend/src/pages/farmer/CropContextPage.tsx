import { useState, type ReactNode } from "react";
import { Bell, Check, ChevronLeft, History, Leaf, Menu, Minus, Plus, Sprout, UserCircle2, Warehouse, Waves, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { clearLandDraft, readLandDraft } from "../../lib/land-draft";
import { farmerApi, type ApiCropContext } from "../../services/farmer-api";
import { getUser } from "../../lib/auth";
import { WeatherStatus } from "../../components/farmer/WeatherStatus";
import { LogoutButton } from "../../components/auth/LogoutButton";

const fieldImage = "https://www.figma.com/api/mcp/asset/9b5fa1e3-c8f4-47b4-9d19-270f04e08bb6.png";
const phases: { id: ApiCropContext["growth_stage"]; title: string; description: string; range: string }[] = [
  { id: "vegetative", title: "Fase Vegetatif", description: "Pembentukan anakan aktif, pertunasan, dan pembukaan helai daun baru.", range: "0 — 35 HST" },
  { id: "flowering", title: "Fase Bunting / Berbunga", description: "Pembentukan bulir dan pengisian gabah. Sangat sensitif terhadap kekurangan air dan suhu kering.", range: "36 — 65 HST" },
  { id: "ripening", title: "Fase Pematangan", description: "Pengisian cairan bulir, pengerasan gabah, dan persiapan panen raya.", range: "66 — 110 HST" },
  { id: "unknown", title: "Fase belum diketahui", description: "Gunakan bila fase tanaman belum dapat dipastikan.", range: "—" },
];

export function CropContextPage() {
  const navigate = useNavigate();
  const draft = readLandDraft();
  const user = getUser();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cropName, setCropName] = useState("Padi Sawah (Oryza sativa)");
  const [variety, setVariety] = useState("Inpari 32 HDB");
  const [phase, setPhase] = useState<ApiCropContext["growth_stage"]>("flowering");
  const [days, setDays] = useState(55);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const plantedAt = new Date();
  plantedAt.setDate(plantedAt.getDate() - days);
  const location = [draft.village, draft.district, draft.regency].filter(Boolean).join(", ") || "Lokasi tersimpan";
  const selectedPhase = phases.find((item) => item.id === phase) ?? phases[0];

  const save = async () => {
    if (!draft.name || draft.latitude === undefined || draft.longitude === undefined) {
      setError("Nama atau lokasi lahan belum lengkap.");
      return;
    }
    setSaving(true);
    setError("");
    let landId = "";
    try {
      const land = await farmerApi.createLand({
        name: draft.name,
        latitude: draft.latitude,
        longitude: draft.longitude,
        boundary_polygon: draft.boundaryPolygon,
        description: [draft.area ? `Perkiraan luas: ${draft.area}` : "", note.trim()].filter(Boolean).join(" | ") || undefined,
        province: draft.province,
        regency: draft.regency,
        district: draft.district,
        village: draft.village,
        adm4_code: draft.adm4Code,
        location_source: draft.locationSource || "client_provided",
      });
      landId = land.id;
      await farmerApi.createCrop(land.id, { crop_name: cropName, variety_name: variety, growth_stage: phase, planting_date: plantedAt.toISOString().slice(0, 10) });
      clearLandDraft();
      navigate(`/farmer/lands/${land.id}`, { replace: true });
    } catch (cause) {
      if (landId) await farmerApi.archiveLand(landId).catch(() => undefined);
      setError(cause instanceof Error ? cause.message : "Lahan gagal disimpan");
    } finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-[#f3f3ec] text-[#15240a]">
    {mobileNavOpen && <button className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div><div className="mb-6 flex items-center justify-between px-2"><div className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white"><Leaf size={15} className="text-[#85c254]" /> REMBUKTANI</div><button className="md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={20}/></button></div><Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold">+ Tambah Lahan</Link><nav className="space-y-1"><SideLink to="/farmer/dashboard" icon={<Warehouse size={18}/>} label="Beranda"/><SideLink to="/farmer/lands" icon={<Sprout size={18}/>} label="Lahan" active/><SideLink to="/farmer/history" icon={<History size={18}/>} label="Riwayat"/><SideLink to="/farmer/profile" icon={<UserCircle2 size={18}/>} label="Profil"/></nav></div>
      <div className="space-y-4 px-1"><div className="rounded-xl bg-[#e9fcb5] p-3"><p className="mb-2 text-xs font-bold">Cuaca lahan terdekat</p><WeatherStatus /></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={15}/></div><div><p className="max-w-36 truncate text-xs font-bold">{user?.display_name || user?.displayName || "Sahabat Tani"}</p><p className="text-xs text-[#44483f]">{user?.role === "reviewer" ? "Reviewer" : "Petani"}</p></div></div><LogoutButton compact /></div></div>
    </aside>
    <div className="md:pl-[260px]"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#deded4]/60 bg-[#fafaf6]/90 px-4 shadow-sm backdrop-blur-xl sm:px-8"><button className="md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22}/></button><span className="max-w-[55%] truncate rounded bg-[#e4f6b0] px-2 py-1 text-xs font-semibold">Wilayah: {location}</span><div className="flex items-center gap-3"><span className="hidden sm:flex"><WeatherStatus /></span><Bell size={17}/><UserCircle2 size={20}/></div></header>
      <main className="mx-auto max-w-[980px] px-4 py-7 sm:px-8">
        <div className="mb-5 flex items-start justify-between gap-4"><div><Link to="/farmer/lands/new/location" className="flex items-center gap-2 text-xs font-bold text-[#56652e]"><ChevronLeft size={15}/>Kembali ke Pilih Lahan</Link><h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">Informasi Tanaman & Umur Padi</h1><p className="mt-2 max-w-2xl text-sm text-[#56652e]">Menentukan kebutuhan air, keamanan pemupukan, dan ketahanan terhadap prakiraan cuaca BMKG.</p></div><span className="mt-8 hidden rounded-full bg-[#e4f6b0] px-3 py-2 text-xs font-bold md:block"><span className="text-[#85c254]">●</span> Langkah 3 dari 3</span></div>
        <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-[#e4f6b0] px-3 py-1.5 text-xs font-bold"><MapPinIcon/>Lahan: {draft.name || "Petak baru"} · {location}</div>
        <section className="relative mb-5 h-44 overflow-hidden rounded-2xl bg-[#213014] shadow-sm"><img src={fieldImage} alt="Lanskap sawah" className="size-full object-cover opacity-85"/><div className="absolute inset-0 bg-gradient-to-r from-[#15240a]/70 to-transparent"/><div className="absolute inset-x-5 bottom-4 flex items-center justify-between gap-3 text-xs font-semibold text-white"><span className="flex items-center gap-2"><Waves size={16} className="text-[#98cf6a]"/>Kondisi irigasi diisi melalui Field Pulse</span><span className="rounded-full bg-[#213014]/80 px-3 py-1">{draft.adm4Code ? `ADM4 ${draft.adm4Code}` : "Wilayah tersimpan"}</span></div></section>
        <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_-12px_rgba(21,36,10,0.18)] sm:p-8">
          <SectionTitle icon={<Sprout size={17}/>} title="1. Komoditas & Varietas"/><div className="grid gap-4 sm:grid-cols-2"><Field label="Komoditas Utama"><select value={cropName} onChange={(event) => setCropName(event.target.value)} className="mt-2 h-12 w-full rounded-xl bg-[#f3f3ec] px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#85c254]"><option>Padi Sawah (Oryza sativa)</option><option>Jagung</option><option>Kedelai</option></select></Field><Field label="Varietas Bibit"><select value={variety} onChange={(event) => setVariety(event.target.value)} className="mt-2 h-12 w-full rounded-xl bg-[#f3f3ec] px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#85c254]"><option>Inpari 32 HDB</option><option>Ciherang</option><option>IR 64</option></select></Field></div>
          <div className="my-8"><div className="flex items-start justify-between gap-3"><SectionTitle icon={<Sprout size={17}/>} title="2. Fase Pertumbuhan Saat Ini"/><span className="rounded bg-[#e4f6b0] px-2 py-1 text-[9px] font-bold text-[#4f8a45]">WAJIB KALIBRASI</span></div><p className="-mt-2 mb-4 text-xs text-[#666a60]">Pilihan fase memengaruhi kalkulasi serapan air serta peringatan cuaca ekstrem BMKG.</p><div className="space-y-2">{phases.filter((item) => item.id !== "unknown").map((item) => <button type="button" key={item.id} onClick={() => setPhase(item.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${phase === item.id ? "border-[#85c254] bg-[#e4f6b0] shadow-[0_3px_10px_rgba(133,194,84,0.18)]" : "border-transparent bg-[#f3f3ec] hover:border-[#c8df9c]"}`}><span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${phase === item.id ? "border-[#4f8a45] bg-[#85c254]" : "border-[#a4a99d] bg-white"}`}>{phase === item.id && <span className="size-1.5 rounded-full bg-white"/>}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-bold">{item.title}<small className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-[#56652e]">{item.range}</small></span><span className="mt-1 block text-xs leading-5 text-[#56652e]">{item.description}</span></span>{phase === item.id && <Check size={18} className="mt-1 shrink-0 text-[#213014]"/>}</button>)}</div></div>
          <section className="mb-8"><SectionTitle icon={<CalendarIcon/>} title="3. Estimasi Hari Setelah Tanam (HST)"/><div className="flex items-center justify-between rounded-xl bg-[#f3f3ec] p-4"><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#666a60]">Kalkulasi Kalender Tanam</p><p className="mt-1 font-display text-lg font-bold">Ditanam sekitar {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(plantedAt)}</p><p className="text-xs text-[#56652e]">Umur padi saat ini · {selectedPhase.range}</p></div><div className="flex items-center gap-3"><button type="button" onClick={() => setDays((value) => Math.max(0, value - 1))} className="rounded-lg p-2 hover:bg-white" aria-label="Kurangi HST"><Minus size={18}/></button><label className="text-center"><input type="number" min={0} max={180} step={1} value={days} onChange={(event) => { const next = event.currentTarget.valueAsNumber; if (Number.isFinite(next)) setDays(Math.min(180, Math.max(0, Math.round(next)))); }} className="w-20 rounded-lg bg-white px-2 text-center font-display text-3xl font-bold outline-none focus:ring-2 focus:ring-[#85c254]" aria-label="Hari setelah tanam"/><small className="block text-[10px] font-sans font-bold text-[#666a60]">HST</small></label><button type="button" onClick={() => setDays((value) => Math.min(180, value + 1))} className="rounded-lg p-2 hover:bg-white" aria-label="Tambah HST"><Plus size={18}/></button></div></div></section>
          <Field label="4. Catatan Pengamatan Tambahan (Opsional)"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Kondisi air di petakan, serangan hama kecil, atau catatan teknis sebelum pemupukan..." className="mt-2 min-h-28 w-full resize-y rounded-xl bg-[#f3f3ec] p-4 text-sm outline-none focus:ring-2 focus:ring-[#85c254]"/></Field>
          {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-[#deded4] pt-5 sm:flex-row"><Link to="/farmer/lands/new/location" className="flex items-center justify-center gap-2 rounded-xl bg-[#f3f3ec] px-5 py-3 text-sm font-bold"><ChevronLeft size={16}/>Kembali</Link><button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-[#85c254] px-6 py-3 text-sm font-bold shadow-[0_5px_12px_rgba(133,194,84,0.28)] disabled:opacity-50">{saving ? "Menyimpan lahan dan tanaman…" : "Simpan Lahan & Tinjau"}<Check size={17}/></button></div>
        </form>
      </main>
    </div>
  </div>;
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) { return <h2 className="flex items-center gap-2 text-sm font-bold text-[#213014]">{icon}{title}</h2>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-xs font-bold text-[#213014]">{label}{children}</label>; }
function SideLink({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) { return <Link to={to} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-[#213014] text-white" : "text-[#44483f] hover:bg-[#edf4dc]"}`}>{icon}{label}</Link>; }
function MapPinIcon() { return <span className="text-[#4f8a45]">●</span>; }
function CalendarIcon() { return <span className="text-[#56652e]">▣</span>; }
