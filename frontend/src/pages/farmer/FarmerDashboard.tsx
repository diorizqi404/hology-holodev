import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronRight, CloudSun, FileCheck2, History, Leaf, Menu, Plus, RefreshCw, Sprout, UserCircle2, Warehouse, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getUser } from "../../lib/auth";
import { farmerApi, type ApiCropContext, type ApiDecisionCase, type ApiDecisionRecord, type ApiEvidence, type ApiLand } from "../../services/farmer-api";
import { WeatherStatus } from "../../components/farmer/WeatherStatus";
import { LogoutButton } from "../../components/auth/LogoutButton";

const heroImage = "https://www.figma.com/api/mcp/asset/3b17483f-6278-487e-b29e-3726fe9fcd12.png";
const fieldImages = ["https://www.figma.com/api/mcp/asset/864611c8-3b58-4444-8606-6186e6a5b233.png", "https://www.figma.com/api/mcp/asset/9b5fa1e3-c8f4-47b4-9d19-270f04e08bb6.png"];
type DashboardData = { lands: ApiLand[]; crops: Record<string, ApiCropContext | null>; cases: ApiDecisionCase[]; evidence: ApiEvidence[]; decisions: ApiDecisionRecord[] };
type FilterKey = "all" | "attention" | "flowering" | "vegetative";
type ForecastSlot = { weather_desc?: string; t?: number; target_time_utc?: string; target_time_local?: string };
const stages: Record<ApiCropContext["growth_stage"], string> = { vegetative: "Fase Vegetatif", flowering: "Fase Berbunga", ripening: "Fase Pematangan", unknown: "Fase belum diketahui" };
const pendingStatuses = new Set<ApiDecisionCase["status"]>(["draft", "collecting_evidence", "assessed", "review_pending", "ready_for_decision"]);
const formatDate = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const greeting = () => { const hour = new Date().getHours(); return hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam"; };
const forecastFrom = (item?: ApiEvidence): ForecastSlot | null => {
  const canonical = item?.payload as { forecast_slots?: ForecastSlot[]; payload?: { forecast_slots?: ForecastSlot[] } } | undefined;
  const slots = canonical?.forecast_slots ?? canonical?.payload?.forecast_slots;
  return slots?.find((slot) => new Date(slot.target_time_utc ?? slot.target_time_local ?? 0).getTime() >= Date.now()) ?? slots?.[0] ?? null;
};
const fetchDashboardData = async (): Promise<DashboardData> => {
  const [lands, cases, decisions] = await Promise.all([farmerApi.listLands(), farmerApi.listDecisionCases(), farmerApi.listDecisionRecords()]);
  const cropEntries = await Promise.all(lands.map(async (land) => [land.id, await farmerApi.getActiveCrop(land.id).catch(() => null)] as const));
  const evidenceGroups = await Promise.all(cases.map((item) => farmerApi.listEvidence(item.id).catch(() => [])));
  return { lands, cases, decisions, crops: Object.fromEntries(cropEntries), evidence: evidenceGroups.flat() };
};

function NavItem({ icon: Icon, label, active = false }: { icon: typeof Warehouse; label: string; active?: boolean }) {
  return <span className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${active ? "bg-[#213014] text-white" : "text-[#44483f] hover:bg-[#edf4dc]"}`}><Icon size={18} /><span className="text-sm font-semibold">{label}</span></span>;
}

export function FarmerDashboard() {
  const user = getUser();
  const displayName = user?.display_name || user?.displayName || "Sahabat Tani";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData>({ lands: [], crops: {}, cases: [], evidence: [], decisions: [] });
  const loadDashboard = useCallback(async () => {
    setState("loading"); setError("");
    try {
      setData(await fetchDashboardData()); setState("ready");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Dashboard belum dapat dimuat"); setState("error"); }
  }, []);
  useEffect(() => {
    let active = true;
    fetchDashboardData().then((result) => { if (active) { setData(result); setState("ready"); } }).catch((reason: unknown) => {
      if (active) { setError(reason instanceof Error ? reason.message : "Dashboard belum dapat dimuat"); setState("error"); }
    });
    return () => { active = false; };
  }, []);

  const latestEvidenceByLand = useMemo(() => {
    const result: Record<string, ApiEvidence> = {};
    for (const item of data.evidence.filter((entry) => entry.type === "bmkg_forecast")) {
      const landId = data.cases.find((decisionCase) => decisionCase.id === item.decision_case_id)?.land_id;
      if (landId && (!result[landId] || item.collected_at > result[landId].collected_at)) result[landId] = item;
    }
    return result;
  }, [data.cases, data.evidence]);
  const pendingByLand = useMemo(() => new Set(data.cases.filter((item) => pendingStatuses.has(item.status)).map((item) => item.land_id)), [data.cases]);
  const counts: Record<FilterKey, number> = { all: data.lands.length, attention: data.lands.filter((land) => !data.crops[land.id] || pendingByLand.has(land.id)).length, flowering: data.lands.filter((land) => data.crops[land.id]?.growth_stage === "flowering").length, vegetative: data.lands.filter((land) => data.crops[land.id]?.growth_stage === "vegetative").length };
  const filters: { key: FilterKey; label: string }[] = [{ key: "all", label: "Semua Petak Aktif" }, { key: "attention", label: "Perlu Tindakan" }, { key: "flowering", label: "Fase Berbunga" }, { key: "vegetative", label: "Fase Vegetatif" }];
  const visibleLands = data.lands.filter((land) => activeFilter === "all" || (activeFilter === "attention" ? !data.crops[land.id] || pendingByLand.has(land.id) : data.crops[land.id]?.growth_stage === activeFilter));
  const primaryLand = data.lands[0];
  const primaryEvidence = primaryLand ? latestEvidenceByLand[primaryLand.id] : undefined;
  const primaryRegion = primaryLand ? [primaryLand.village || primaryLand.district, primaryLand.regency].filter(Boolean).join(", ") : "Belum ada wilayah";
  const latestDecision = data.decisions[0];
  const latestCase = latestDecision ? data.cases.find((item) => item.id === latestDecision.decision_case_id) : undefined;
  const latestLand = latestCase ? data.lands.find((land) => land.id === latestCase.land_id) : undefined;

  return <div className="min-h-screen min-w-[300px] bg-[#f3f3ec] text-[#15240a]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div><div className="mb-6 flex items-center justify-between px-2"><div className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white"><Leaf size={15} className="text-[#85c254]" /> REMBUKTANI</div><button className="md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={20} /></button></div>
        <Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold"><Plus size={16} /> Tambah Lahan</Link>
        <nav className="space-y-1"><Link to="/farmer/dashboard"><NavItem icon={Warehouse} label="Beranda" active /></Link><Link to="/farmer/lands"><NavItem icon={Sprout} label="Lahan" /></Link><Link to="/farmer/history"><NavItem icon={History} label="Riwayat" /></Link><Link to="/farmer/profile"><NavItem icon={UserCircle2} label="Profil" /></Link></nav>
      </div>
      <div className="space-y-4 px-1"><div className="rounded-xl bg-[#e9fcb5] p-3"><p className="mb-2 text-xs font-bold">Cuaca lahan terdekat</p><WeatherStatus preferredLandId={primaryLand?.id} /></div>
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={15} /></div><div><p className="max-w-36 truncate text-xs font-bold">{displayName}</p><p className="text-xs text-[#44483f]">{user?.role === "reviewer" ? "Reviewer" : "Petani"}</p></div></div><LogoutButton compact /></div></div>
    </aside>
    <div className="md:pl-[260px]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#deded4]/60 bg-[#fafaf6]/90 px-4 shadow-sm backdrop-blur-xl sm:px-8"><button className="md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22} /></button><span className="max-w-[55%] truncate rounded bg-[#e4f6b0] px-2 py-1 text-xs font-semibold">Wilayah: {primaryRegion}</span><div className="flex items-center gap-3"><span className="hidden sm:flex"><WeatherStatus preferredLandId={primaryLand?.id} /></span><Bell size={17} /><UserCircle2 size={20} /></div></header>
      <main className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-8 lg:py-10">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative min-h-[288px] overflow-hidden rounded-2xl bg-[#15240a] shadow-xl"><img src={heroImage} alt="Lanskap pertanian" className="absolute inset-0 size-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-[#15240a]/90 via-[#15240a]/35 to-transparent" /><div className="relative flex min-h-[288px] flex-col justify-end p-6 sm:p-8"><div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#98cf6a]"><span className="rounded-full bg-[#85c254]/20 px-3 py-1.5">● {primaryEvidence ? `BMKG ${primaryEvidence.is_mock ? "Demo" : "Resmi"}` : "Menunggu sinkronisasi BMKG"}</span>{primaryEvidence?.observed_at && <span>· Diperbarui {formatDate(primaryEvidence.observed_at)}</span>}</div><p className="text-base text-[#bacda5]">{greeting()}, {displayName}</p><h1 className="mt-1 max-w-2xl font-display text-3xl font-extrabold text-white sm:text-4xl">Lahan mana yang ingin Anda tinjau?</h1><p className="mt-2 max-w-xl text-sm text-[#deded4]/90">Pilih petak untuk memeriksa bukti yang tersedia dan memulai rembuk keputusan.</p></div></motion.section>
        {state === "loading" && <div className="grid gap-6 lg:grid-cols-2" aria-label="Memuat dashboard"><div className="h-96 animate-pulse rounded-2xl bg-[#deded4]" /><div className="h-96 animate-pulse rounded-2xl bg-[#deded4]" /></div>}
        {state === "error" && <div role="alert" className="rounded-2xl border border-[#b98532]/30 bg-white p-6"><h2 className="font-display text-xl font-bold">Dashboard belum dapat dimuat</h2><p className="mt-1 text-sm text-[#56652e]">{error}</p><button onClick={() => void loadDashboard()} className="mt-4 flex items-center gap-2 rounded-xl bg-[#15240a] px-4 py-3 text-sm font-semibold text-white"><RefreshCw size={16} /> Coba lagi</button></div>}
        {state === "ready" && <DashboardContent data={data} visibleLands={visibleLands} filters={filters} counts={counts} activeFilter={activeFilter} setActiveFilter={setActiveFilter} crops={data.crops} pendingByLand={pendingByLand} latestEvidenceByLand={latestEvidenceByLand} latestDecision={latestDecision} latestLand={latestLand} />}
      </main>
    </div>
  </div>;
}

type ContentProps = { data: DashboardData; visibleLands: ApiLand[]; filters: { key: FilterKey; label: string }[]; counts: Record<FilterKey, number>; activeFilter: FilterKey; setActiveFilter: (key: FilterKey) => void; crops: Record<string, ApiCropContext | null>; pendingByLand: Set<string>; latestEvidenceByLand: Record<string, ApiEvidence>; latestDecision?: ApiDecisionRecord; latestLand?: ApiLand };
function DashboardContent({ data, visibleLands, filters, counts, activeFilter, setActiveFilter, crops, pendingByLand, latestEvidenceByLand, latestDecision, latestLand }: ContentProps) {
  return <><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{filters.map((filter) => <button key={filter.key} onClick={() => setActiveFilter(filter.key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${activeFilter === filter.key ? "bg-[#213014] text-[#85c254]" : "bg-[#fafaf6] text-[#44483f]"}`}>{filter.label} ({counts[filter.key]})</button>)}</div><span className="flex w-fit items-center gap-2 rounded-xl bg-[#e9fcb5] px-3 py-2 text-xs font-semibold"><Warehouse size={14} /> {data.lands.length} petak dari database</span></div>
    {data.lands.length === 0 ? <div className="rounded-2xl bg-white p-8 text-center"><Sprout className="mx-auto text-[#4f8a45]" size={34} /><h2 className="mt-3 font-display text-xl font-bold">Belum ada lahan aktif</h2><p className="mt-1 text-sm text-[#56652e]">Tambahkan lahan agar konteks tanaman dan bukti BMKG dapat ditampilkan.</p><Link to="/farmer/lands/new" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#85c254] px-5 py-3 text-sm font-semibold"><Plus size={16} /> Tambah Lahan</Link></div> : visibleLands.length === 0 ? <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#56652e]">Tidak ada lahan yang sesuai filter ini.</div> : <div className="grid gap-6 lg:grid-cols-2">{visibleLands.map((land, index) => <LandCard key={land.id} land={land} crop={crops[land.id]} evidence={latestEvidenceByLand[land.id]} attention={!crops[land.id] || pendingByLand.has(land.id)} index={index} />)}</div>}
    <section className="space-y-4 pt-2"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#213014] text-[#98cf6a]"><FileCheck2 size={20} /></div><div><h2 className="font-display text-xl font-bold">Keputusan Terbaru</h2><p className="text-sm text-[#44483f]">Jejak keputusan manusia dari database</p></div></div>{latestDecision ? <article className="rounded-2xl bg-[#fafaf6] p-5 shadow-sm"><div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-md bg-[#d8eaa5] px-2 py-1 font-bold">{latestLand?.name ?? "Lahan"}</span><span>{formatDate(latestDecision.created_at)}</span><span className="rounded-full bg-[#4f8a45]/15 px-2 py-1 font-semibold text-[#4f8a45]">✓ Keputusan manusia</span>{latestDecision.is_mock && <span className="rounded-full bg-[#f3e6ca] px-2 py-1 font-semibold text-[#6d4c16]">Data demo/mock</span>}</div><h3 className="mt-3 font-display text-xl font-semibold">{latestDecision.decision_text}</h3>{latestDecision.reason && <p className="mt-2 text-sm text-[#56652e]">Alasan: {latestDecision.reason}</p>}</article> : <div className="rounded-2xl bg-white p-5 text-sm text-[#56652e]">Belum ada keputusan yang tercatat. Riwayat akan muncul setelah petani mengonfirmasi keputusan.</div>}</section></>;
}

function LandCard({ land, crop, evidence, attention, index }: { land: ApiLand; crop: ApiCropContext | null; evidence?: ApiEvidence; attention: boolean; index: number }) {
  const forecast = forecastFrom(evidence); const location = [land.village || land.district, land.regency].filter(Boolean).join(", ") || "Lokasi belum lengkap";
  return <motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className="overflow-hidden rounded-2xl bg-[#fafaf6] shadow-sm"><div className="relative h-48"><img src={fieldImages[index % fieldImages.length]} alt={`Lahan ${land.name}`} className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#15240a]/80 via-transparent to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-[#15240a]/85 px-3 py-1 text-xs font-semibold text-white">{location}</span><div className="absolute inset-x-4 bottom-3 text-white"><p className="text-[11px] font-bold tracking-widest text-[#98cf6a]">{land.location_source === "bmkg_verified" ? "LOKASI BMKG TERVERIFIKASI" : "LOKASI TERSIMPAN"}</p><h3 className="font-display text-2xl font-bold">{land.name}</h3></div></div><div className="space-y-4 p-5"><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-lg bg-[#def0ab] px-3 py-1.5">{crop ? [crop.crop_name, crop.variety_name].filter(Boolean).join(" · ") : "Konteks tanaman belum diisi"}</span>{crop && <span className="rounded-lg bg-[#e4f6b0] px-3 py-1.5">{stages[crop.growth_stage]}</span>}</div><div className="flex gap-3 rounded-xl bg-[#e9fcb5] p-3"><CloudSun size={18} className="shrink-0 text-[#4f8a45]" /><div><p className="text-xs font-bold">{forecast ? `${forecast.weather_desc ?? "Prakiraan tersedia"}${typeof forecast.t === "number" ? ` · ${forecast.t}°C` : ""}` : "Bukti BMKG belum tersedia"}</p><p className="text-xs text-[#44483f]">{evidence ? `${evidence.freshness_status ?? "kesegaran belum dinilai"} · ${evidence.is_mock ? "data demo/mock" : "sumber resmi BMKG"}` : land.adm4_code ? `ADM4 ${land.adm4_code} siap disinkronkan saat rembuk` : "Lengkapi kode wilayah BMKG"}</p></div></div><div className="flex items-center justify-between gap-3"><span className={`text-xs font-semibold ${attention ? "text-[#b98532]" : "text-[#4f8a45]"}`}>● {attention ? "Perlu ditinjau" : "Konteks siap"}</span><Link to={`/farmer/lands/${land.id}`} className="flex items-center gap-2 rounded-xl bg-[#85c254] px-4 py-2.5 text-sm font-semibold">Tinjau Kondisi <ChevronRight size={16} /></Link></div></div></motion.article>;
}
