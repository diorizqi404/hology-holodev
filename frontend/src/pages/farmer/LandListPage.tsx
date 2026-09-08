import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Activity, Bell, CheckCircle2, ChevronRight, CloudSun, Database, History, Leaf, MapPin, Menu, Plus, ShieldCheck, Sprout, Thermometer, UserCircle2, Warehouse, X } from "lucide-react";
import { Link } from "react-router-dom";
import { farmerApi, type ApiCropContext, type ApiEvidence, type ApiLand, type ApiProfile } from "../../services/farmer-api";
import { WeatherStatus } from "../../components/farmer/WeatherStatus";
import { LogoutButton } from "../../components/auth/LogoutButton";

const fieldImages = [
    "https://www.figma.com/api/mcp/asset/864611c8-3b58-4444-8606-6186e6a5b233.png",
    "https://www.figma.com/api/mcp/asset/9b5fa1e3-c8f4-47b4-9d19-270f04e08bb6.png",
];
type LandView = { land: ApiLand; crop: ApiCropContext | null; evidence: ApiEvidence | null };
type Forecast = { weather_desc?: string; t?: number; target_time_utc?: string; target_time_local?: string };
const stage: Record<ApiCropContext["growth_stage"], string> = { vegetative: "Vegetatif", flowering: "Berbunga", ripening: "Pematangan", unknown: "Belum diketahui" };

const forecast = (evidence: ApiEvidence | null): Forecast | undefined => {
    const payload = evidence?.payload as { forecast_slots?: Forecast[]; payload?: { forecast_slots?: Forecast[] } } | undefined;
    const slots = payload?.forecast_slots ?? payload?.payload?.forecast_slots;
    return slots?.find((slot) => new Date(slot.target_time_utc ?? slot.target_time_local ?? 0).getTime() >= Date.now()) ?? slots?.[0];
};
const areaOf = (land: ApiLand) => land.description?.match(/Perkiraan luas:\s*([^|]+)/i)?.[1]?.trim() ?? "Belum dicatat";
const numericArea = (land: ApiLand) => Number.parseFloat(areaOf(land)) || 0;

export function LandListPage() {
    const [profile, setProfile] = useState<ApiProfile>();
    const [items, setItems] = useState<LandView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        Promise.all([farmerApi.getProfile(), farmerApi.listLands(), farmerApi.listDecisionCases()]).then(async ([nextProfile, lands, cases]) => {
            setProfile(nextProfile);
            const views = await Promise.all(lands.map(async (land) => {
                const crop = await farmerApi.getActiveCrop(land.id).catch(() => null);
                const landCases = cases.filter((item) => item.land_id === land.id).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
                let evidence: ApiEvidence | null = null;
                for (const decisionCase of landCases) {
                    const list = await farmerApi.listEvidence(decisionCase.id).catch(() => []);
                    evidence = list.find((entry) => entry.type === "bmkg_forecast") ?? null;
                    if (evidence) break;
                }
                return { land, crop, evidence };
            }));
            setItems(views);
        }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Data lahan gagal dimuat")).finally(() => setLoading(false));
    }, []);

    const shown = useMemo(() => items.filter(({ crop, evidence }) => filter === "all" || (filter === "attention" && (!crop || !evidence)) || crop?.growth_stage === filter), [items, filter]);
    const totalArea = items.reduce((sum, item) => sum + numericArea(item.land), 0);
    const verified = items.filter(({ land }) => land.location_source === "bmkg_verified").length;
    const weatherReady = items.filter(({ evidence }) => Boolean(evidence)).length;
    const averageTemperature = items.map(({ evidence }) => forecast(evidence)?.t).filter((value): value is number => typeof value === "number");
    const average = averageTemperature.length ? (averageTemperature.reduce((sum, value) => sum + value, 0) / averageTemperature.length).toFixed(1) : "—";
    const filters = [["all", `Semua (${items.length})`], ["vegetative", `Vegetatif (${items.filter(({ crop }) => crop?.growth_stage === "vegetative").length})`], ["flowering", `Berbunga (${items.filter(({ crop }) => crop?.growth_stage === "flowering").length})`], ["attention", `Perlu ditinjau (${items.filter(({ crop, evidence }) => !crop || !evidence).length})`]];

    return <div className="min-h-screen bg-[#f3f3ec] text-[#15240a]">
        {mobileNavOpen && <button className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" />}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
            <div>
                <div className="mb-6 flex items-center justify-between px-2"><div className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white"><Leaf size={15} className="text-[#85c254]" /> REMBUKTANI</div><button className="md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={20} /></button></div>
                <Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold"><Plus size={16} /> Tambah Lahan</Link>
                <nav className="space-y-1"><SideLink to="/farmer/dashboard" icon={<Warehouse size={18} />} label="Beranda" /><SideLink to="/farmer/lands" icon={<Sprout size={18} />} label="Lahan" active /><SideLink to="/farmer/history" icon={<History size={18} />} label="Riwayat" /><SideLink to="/farmer/profile" icon={<UserCircle2 size={18} />} label="Profil" /></nav>
            </div>
            <div className="space-y-4 px-1"><div className="rounded-xl bg-[#e9fcb5] p-3"><p className="mb-2 text-xs font-bold">Cuaca lahan terdekat</p><WeatherStatus preferredLandId={items[0]?.land.id} /></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={15} /></div><div><p className="max-w-36 truncate text-xs font-bold">{profile?.display_name || "Memuat profil…"}</p><p className="text-xs text-[#44483f]">Petani</p></div></div><LogoutButton compact /></div></div>
        </aside>
        <div className="md:pl-[260px]">
            <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#deded4]/60 bg-[#fafaf6]/90 px-4 shadow-sm backdrop-blur-xl sm:px-8 md:left-[260px]"><button className="md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22} /></button><span className="max-w-[55%] truncate rounded bg-[#e4f6b0] px-2 py-1 text-xs font-semibold">Wilayah: {items[0] ? [items[0].land.village, items[0].land.regency].filter(Boolean).join(", ") : "Belum ada wilayah"}</span><div className="flex items-center gap-3"><span className="hidden sm:flex"><WeatherStatus preferredLandId={items[0]?.land.id} /></span><Bell size={17} /><UserCircle2 size={20} /></div></header>
            <main className="mx-auto max-w-[1240px] space-y-5 px-4 pb-24 pt-24 sm:px-8">
                <section className="relative min-h-[190px] overflow-hidden rounded-2xl bg-[#15240a] shadow-sm"><img src={fieldImages[0]} alt="Lanskap sawah" className="absolute inset-0 size-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-r from-[#15240a]/90 via-[#15240a]/45 to-transparent" /><div className="relative flex min-h-[190px] flex-col justify-end p-6 text-white sm:p-8"><div className="mb-2 flex flex-wrap gap-2 text-[10px] font-semibold text-[#b8dd72]"><span className="rounded-full bg-[#85c254]/20 px-3 py-1">● Data lahan aktif</span><span>· {weatherReady} lahan dengan bukti cuaca</span></div><h1 className="font-display text-3xl font-bold sm:text-4xl">Daftar Seluruh Lahan Terdaftar</h1><p className="mt-2 max-w-xl text-xs leading-5 text-[#d9e7cb]">Kelola petak sawah aktif, pantau kondisi telemetri cuaca, dan lihat riwayat rembuk keputusan.</p></div></section>
                <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{filters.map(([id, label]) => <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-3 py-2 text-[10px] font-bold sm:text-xs ${filter === id ? "bg-[#15240a] text-white" : "bg-white text-[#44483f]"}`}>{label}</button>)}</div><Link to="/farmer/lands/new" className="flex items-center gap-2 rounded-xl bg-[#85c254] px-4 py-2.5 text-xs font-bold"><Plus size={15} />Tambah Lahan Baru</Link></div>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={<Database size={17} />} label="Total lahan" value={`${totalArea ? totalArea.toFixed(2) : "—"} Ha`} detail={`${items.length} petak tersimpan`} /><Summary icon={<Sprout size={17} />} label="Status vegetasi" value={items.length ? `${items.filter(({ crop }) => crop).length}/${items.length} aktif` : "—"} detail="Konteks tanaman" /><Summary icon={<Thermometer size={17} />} label="Rata-rata suhu" value={average === "—" ? "Belum tersedia" : `${average}°C`} detail="Forecast BMKG tersedia" /><Summary icon={<ShieldCheck size={17} />} label="Stasiun BMKG" value={verified ? `${verified} terverifikasi` : "Belum tersedia"} detail={`${weatherReady}/${items.length} punya bukti cuaca`} /></section>
                {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                {loading ? <div className="h-72 animate-pulse rounded-2xl bg-white" /> : <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{shown.map(({ land, crop, evidence }, index) => <LandCard key={land.id} land={land} crop={crop} evidence={evidence} image={fieldImages[index % fieldImages.length]} />)}<AddLandCard />{shown.length === 0 && <p className="rounded-2xl bg-white p-8 text-sm">Tidak ada lahan pada filter ini.</p>}</section>}
                <section className="max-w-[330px] rounded-2xl bg-[#102606] p-5 text-white shadow-sm"><span className="rounded-full bg-[#85c254] px-2 py-1 text-[10px] font-bold text-[#15240a]">Ringkasan petak</span><h2 className="mt-4 font-display text-xl font-bold">Pantau kondisi sebelum rembuk</h2><p className="mt-2 text-xs leading-5 text-[#d9e7cb]">Gunakan data lahan, konteks tanaman, dan bukti cuaca yang benar-benar tersedia sebelum mengambil keputusan.</p><Link to="/farmer/history" className="mt-5 flex items-center gap-2 text-xs font-bold text-[#b8dd72]">Lihat riwayat keputusan <ChevronRight size={14} /></Link></section>
            </main><footer className="fixed bottom-0 left-0 right-0 z-20 hidden border-t border-[#c8df9c] bg-[#e9fcb5] px-6 py-3 text-xs lg:left-[208px] lg:flex lg:items-center lg:justify-between"><span className="flex items-center gap-2 ml-10"><CheckCircle2 size={16} className="text-[#4f8a45]" />Seluruh data petak berasal dari database dan evidence yang tersimpan.</span><span className="flex items-center gap-2 text-[#4f8a45]"><Activity size={14} />Status jaringan: aktif</span></footer>
        </div>
    </div>;
}

function LandCard({ land, crop, evidence, image }: { land: ApiLand; crop: ApiCropContext | null; evidence: ApiEvidence | null; image: string }) { const weather = forecast(evidence); const location = [land.village, land.district, land.regency].filter(Boolean).join(", ") || "Lokasi belum tersedia"; const attention = !crop || !evidence; return <article className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="relative h-40"><img src={image} alt={`Lahan ${land.name}`} className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#15240a]/85 to-transparent" /><span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${attention ? "bg-[#b98532] text-white" : "bg-[#85c254] text-[#15240a]"}`}>{attention ? "● Perlu ditinjau" : "● Siap ditinjau"}</span><div className="absolute inset-x-4 bottom-3 text-white"><p className="text-[10px] text-[#d9e7cb]">Petak terdaftar</p><h2 className="font-display text-2xl font-bold">{land.name}</h2></div></div><div className="space-y-3 p-4"><div className="flex items-start justify-between gap-2 text-xs"><span className="flex gap-2"><MapPin size={14} className="shrink-0 text-[#4f8a45]" />{location}</span><span className="text-right text-[#666a60]">{areaOf(land)}</span></div><div className="flex items-center justify-between rounded-xl bg-[#e9fcb5] p-3 text-[10px]"><span><b className="block">Varietas tanaman</b>{crop ? [crop.crop_name, crop.variety_name].filter(Boolean).join(" · ") : "Belum diisi"}<small className="mt-1 block text-[#56652e]">{crop ? `Fase ${stage[crop.growth_stage]}` : "Konteks belum tersedia"}</small></span><Sprout size={18} className="text-[#4f8a45]" /></div><div className="flex items-center justify-between rounded-xl bg-[#f3f3ec] p-3 text-[10px]"><span className="flex items-center gap-2"><CloudSun size={16} className="text-[#b98532]" />{weather ? `${weather.weather_desc || "Prakiraan tersedia"}${typeof weather.t === "number" ? ` · ${weather.t}°C` : ""}` : "Bukti BMKG belum tersedia"}</span>{evidence && <span className="rounded bg-[#e4f6b0] px-2 py-1 font-bold text-[#4f8a45]">BMKG</span>}</div><div className="grid grid-cols-2 gap-2"><Link to={`/farmer/lands/${land.id}/review`} className="flex items-center justify-center gap-1 rounded-xl bg-[#15240a] px-3 py-2.5 text-[10px] font-bold text-white">Tinjau kondisi <ChevronRight size={13} /></Link><Link to={`/farmer/lands/${land.id}`} className="flex items-center justify-center rounded-xl bg-[#f3f3ec] px-3 py-2.5 text-[10px] font-bold">Detail lahan</Link></div></div></article>; }
function AddLandCard() { return <Link to="/farmer/lands/new" className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-[#e9fcb5] p-6 text-center hover:bg-[#def0ab]"><span className="flex size-12 items-center justify-center rounded-full bg-[#d8eaa5] text-[#4f8a45]"><Plus size={24} /></span><h2 className="mt-4 font-display text-xl font-bold">Daftarkan Petak Baru</h2><p className="mt-2 max-w-[210px] text-xs leading-5 text-[#56652e]">Petakan koordinat dan lengkapi konteks tanaman untuk memulai rembuk.</p><span className="mt-5 rounded-lg bg-[#15240a] px-4 py-2 text-xs font-bold text-white">Mulai pemetaan</span></Link>; }
function Summary({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) { return <article className="rounded-xl bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-[#e4f6b0] text-[#4f8a45]">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-wide text-[#666a60]">{label}</p><p className="mt-1 font-display text-lg font-bold">{value}</p><p className="mt-1 text-[10px] text-[#56652e]">{detail}</p></div></div></article>; }
function SideLink({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) { return <Link to={to} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-[#213014] text-white" : "text-[#44483f] hover:bg-[#edf4dc]"}`}>{icon}{label}</Link>; }
