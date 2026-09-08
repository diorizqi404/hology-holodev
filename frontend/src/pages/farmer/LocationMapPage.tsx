import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleMarker, MapContainer, Polygon, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { ArrowLeft, Bell, Check, Crosshair, Layers3, Leaf, Map as MapIcon, MapPin, Menu, Navigation, UserCircle2, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { readLandDraft, updateLandDraft } from "../../lib/land-draft";
import { farmerApi } from "../../services/farmer-api";
import { getUser } from "../../lib/auth";
import { WeatherStatus } from "../../components/farmer/WeatherStatus";
import { LogoutButton } from "../../components/auth/LogoutButton";

type Point = [number, number];
const DEFAULT_POSITION: Point = [-7.926976124, 112.6130137732];
const coordinate = (value: unknown, fallback: number) => {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

type Boundary = { village?: string; district?: string; regency?: string; province?: string; adm4Candidate?: string };

function MapInteractions({ position, drawing, onPick }: { position: Point; drawing: boolean; onPick: (point: Point) => void }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.7 }); }, [map, position]);
  useMapEvents({ click: (event) => { if (drawing) onPick([event.latlng.lat, event.latlng.lng]); } });
  return null;
}

const centerOf = (points: Point[]): Point => points.length ? [points.reduce((sum, point) => sum + point[0], 0) / points.length, points.reduce((sum, point) => sum + point[1], 0) / points.length] : DEFAULT_POSITION;
const areaOf = (points: Point[]) => {
  if (points.length < 3) return 0;
  const center = centerOf(points);
  const latScale = 111.32;
  const lonScale = 111.32 * Math.cos((center[0] * Math.PI) / 180);
  return Math.abs(points.reduce((sum, point, index) => { const next = points[(index + 1) % points.length]; return sum + point[1] * lonScale * next[0] * latScale - next[1] * lonScale * point[0] * latScale; }, 0) / 2);
};

export function LocationMapPage() {
  const draft = readLandDraft();
  const navigate = useNavigate();
  const user = getUser();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [position, setPosition] = useState<Point>([coordinate(draft.latitude, DEFAULT_POSITION[0]), coordinate(draft.longitude, DEFAULT_POSITION[1])]);
  const [polygon, setPolygon] = useState<Point[]>(draft.boundaryPolygon ?? []);
  const [boundary, setBoundary] = useState<Boundary | null>(draft.locationResolved ? { village: draft.village, district: draft.district, regency: draft.regency, province: draft.province, adm4Candidate: draft.adm4Code } : null);
  const [drawing, setDrawing] = useState(false);
  const [satellite, setSatellite] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const area = useMemo(() => areaOf(polygon), [polygon]);

  const resolveLocation = async (point: Point = position) => {
    if (!Number.isFinite(point[0]) || point[0] < -90 || point[0] > 90 || !Number.isFinite(point[1]) || point[1] < -180 || point[1] > 180) {
      setError("Koordinat lokasi tidak valid. Silakan gunakan lokasi perangkat atau pilih titik di peta.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await farmerApi.resolveLocation({ lat: point[0], lon: point[1] });
      setBoundary(result.boundaryCandidate);
    } catch (cause) {
      setBoundary(null);
      setError(cause instanceof Error ? cause.message : "Nama desa belum dapat ditemukan");
    } finally { setBusy(false); }
  };

  const useGps = () => {
    if (!navigator.geolocation) { setError("Browser tidak mendukung lokasi perangkat."); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => { const point: Point = [coords.latitude, coords.longitude]; setPosition(point); setBoundary(null); setError(""); void resolveLocation(point); }, () => setError("Lokasi perangkat belum dapat dibaca."), { enableHighAccuracy: true, timeout: 10000 });
  };

  const save = async () => {
    const center = polygon.length >= 3 ? centerOf(polygon) : position;
    let resolvedBoundary = boundary;
    if (!resolvedBoundary) {
      setBusy(true);
      setError("");
      try {
        const result = await farmerApi.resolveLocation({ lat: center[0], lon: center[1] });
        resolvedBoundary = result.boundaryCandidate;
        setBoundary(resolvedBoundary);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Nama desa belum dapat ditemukan");
        return;
      } finally { setBusy(false); }
    }
    if (!resolvedBoundary) return;
    const validAdm4 = resolvedBoundary.adm4Candidate && /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(resolvedBoundary.adm4Candidate) ? resolvedBoundary.adm4Candidate : undefined;
    updateLandDraft({ latitude: center[0], longitude: center[1], boundaryPolygon: polygon.length >= 3 ? polygon : undefined, adm4Code: validAdm4, locationSource: "canonical_boundary_resolution", locationResolved: true, province: resolvedBoundary.province, regency: resolvedBoundary.regency, district: resolvedBoundary.district, village: resolvedBoundary.village });
    navigate("/farmer/lands/new/details");
  };

  return <div className="min-h-screen bg-[#f3f3ec] text-[#15240a]">
    {mobileNavOpen && <button className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div>
        <div className="mb-6 flex items-center justify-between px-2"><div className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white"><Leaf size={15} className="text-[#85c254]" /> REMBUKTANI</div><button className="md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={20}/></button></div>
        <Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold">+ Tambah Lahan</Link>
        <nav className="space-y-1"><SideLink to="/farmer/dashboard" icon={<MapIcon size={18}/>} label="Beranda"/><SideLink to="/farmer/lands" icon={<Layers3 size={18}/>} label="Lahan" active/><SideLink to="/farmer/history" icon={<Navigation size={18}/>} label="Riwayat"/><SideLink to="/farmer/profile" icon={<UserCircle2 size={18}/>} label="Profil"/></nav>
      </div>
      <div className="space-y-4 px-1"><div className="rounded-xl bg-[#e9fcb5] p-3"><p className="mb-2 text-xs font-bold">Cuaca lahan terdekat</p><WeatherStatus /></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={15}/></div><div><p className="max-w-36 truncate text-xs font-bold">{user?.display_name || user?.displayName || "Sahabat Tani"}</p><p className="text-xs text-[#44483f]">{user?.role === "reviewer" ? "Reviewer" : "Petani"}</p></div></div><LogoutButton compact /></div></div>
    </aside>

    <div className="md:pl-[260px]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#deded4]/60 bg-[#fafaf6]/90 px-4 shadow-sm backdrop-blur-xl sm:px-8"><button className="md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={22}/></button><Link to="/farmer/lands" className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/>Kembali ke Info Lahan</Link><div className="flex items-center gap-3"><span className="hidden sm:flex"><WeatherStatus /></span><Bell size={17}/><UserCircle2 size={20}/></div></header>
      <main className="mx-auto max-w-[1320px] px-4 py-5 sm:px-6 lg:px-7">
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#56652e]">Lokasi petak · langkah 2 dari 3</p><h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Tentukan Titik Lokasi Petak</h1><p className="mt-2 max-w-2xl text-sm text-[#56652e]">Klik lokasi petak atau gunakan lokasi perangkat. Nama desa akan dicari otomatis dari titik tersebut.</p></div>
        <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
          <section className="space-y-4 rounded-2xl bg-[#fafaf6] p-4 shadow-sm">
            <div className="rounded-xl border-t-4 border-[#85c254] bg-white p-4">
              <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[#e4f6b0] px-2 py-1 text-[10px] font-bold">{boundary ? "Nama desa ditemukan" : "Lokasi belum dicari"}</span><span className="font-mono text-[10px] text-[#56652e]">ID: {draft.name || "PETAK-BARU"}</span></div>
              <div className="mt-4 flex gap-3"><MapPin className="mt-1 text-[#4f8a45]" size={22}/><div><p className="font-display text-lg font-bold">{boundary?.village || "Titik belum memiliki nama"}</p><p className="text-xs text-[#666a60]">{boundary ? [boundary.district, boundary.regency, boundary.province].filter(Boolean).join(", ") : "Gunakan GPS atau klik peta"}</p></div></div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-[#f3f3ec] p-2"><b>Koordinat</b><p className="mt-1 font-mono">{position[0].toFixed(4)}, {position[1].toFixed(4)}</p></div><div className="rounded-lg bg-[#f3f3ec] p-2"><b>Luas perkiraan</b><p className="mt-1 font-mono">{area ? `${area.toFixed(2)} ha` : "Belum dihitung"}</p></div></div>
            </div>
            <button onClick={useGps} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#85c254] bg-white px-4 py-3 text-sm font-bold"><Crosshair size={17}/>Gunakan lokasi perangkat</button>
            <button onClick={() => setDrawing((value) => !value)} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${drawing ? "bg-[#213014] text-white" : "bg-[#e9fcb5]"}`}><Layers3 size={17}/>{drawing ? "Selesai menggambar batas" : "Gambar batas lahan"}</button>
            {boundary && <div className="rounded-xl bg-[#e9fcb5] p-3 text-xs"><p className="flex items-center gap-2 font-bold"><Check size={16}/>Lokasi ditemukan otomatis</p><p className="mt-1">{[boundary.village, boundary.district, boundary.regency, boundary.province].filter(Boolean).join(", ")}</p></div>}
            {error && <p role="alert" className="rounded-xl bg-[#fff3df] p-3 text-xs text-[#7d4d08]">{error}</p>}
            <button disabled={busy || polygon.length < 3 && !boundary} onClick={() => void save()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 font-bold disabled:opacity-40"><MapPin size={17}/>{busy ? "Mencari lokasi…" : "Gunakan lokasi ini"}</button>
          </section>

          <section className="relative min-h-[620px] overflow-hidden rounded-2xl shadow-md"><MapContainer center={position} zoom={14} className="h-full min-h-[620px] w-full"><TileLayer attribution="&copy; Esri" url={satellite ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}/><MapInteractions position={position} drawing={drawing} onPick={(point) => { setPolygon((current) => [...current, point]); setPosition(point); setBoundary(null); }}/>{polygon.length >= 3 && <Polygon positions={polygon} pathOptions={{ color: "#85c254", fillColor: "#85c254", fillOpacity: 0.25, weight: 3 }}><Tooltip permanent direction="center" className="font-bold">{draft.name || "Petak baru"} · {area.toFixed(2)} ha</Tooltip></Polygon>}<CircleMarker center={position} radius={8} pathOptions={{ color: "#15240a", fillColor: "#85c254", fillOpacity: 1 }}/></MapContainer><div className="absolute left-5 top-5 z-[1000] flex gap-2"><button onClick={() => setSatellite(true)} className={`rounded-lg px-3 py-2 text-xs font-bold shadow ${satellite ? "bg-[#85c254]" : "bg-white"}`}><Layers3 size={14} className="mr-1 inline"/>Satelit</button><button onClick={() => setSatellite(false)} className={`rounded-lg px-3 py-2 text-xs font-bold shadow ${!satellite ? "bg-[#85c254]" : "bg-white"}`}><MapIcon size={14} className="mr-1 inline"/>Peta jalan</button></div><div className="absolute right-5 top-5 z-[1000] rounded-lg bg-[#213014]/90 px-3 py-2 text-[10px] font-bold text-white">{drawing ? "Klik titik di peta untuk menambah batas" : "Peta satelit"}</div><div className="absolute bottom-5 left-5 z-[1000] rounded-lg bg-[#213014]/90 px-3 py-2 text-xs text-white"><span className="text-[#98cf6a]">●</span> {polygon.length} titik batas · {position[0].toFixed(4)}, {position[1].toFixed(4)}</div><div className="absolute bottom-5 right-5 z-[1000] flex flex-col gap-2"><button onClick={useGps} className="flex size-10 items-center justify-center rounded-xl bg-[#213014] text-white shadow"><Crosshair size={18}/></button><button onClick={() => setPolygon([])} className="rounded-xl bg-white px-3 py-2 text-xs font-bold shadow">Reset batas</button></div></section>
        </div>
      </main>
    </div>
  </div>;
}

function SideLink({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) { return <Link to={to} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? "bg-[#213014] text-white" : "text-[#44483f] hover:bg-[#edf4dc]"}`}>{icon}{label}</Link>; }
