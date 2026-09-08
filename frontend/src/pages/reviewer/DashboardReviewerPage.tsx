import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight, Bell, ChevronRight, CloudSun, Leaf, Menu,
    UserCircle2, Warehouse, History,
    CheckCircle2, ClipboardCheck, ChevronDown, AlertTriangle,
    X
} from "lucide-react";
import { getUser } from "../../lib/auth";
import { reviewerApi, type ApiReviewerDashboard } from "../../lib/reviewer-api";
import { LogoutButton } from "../../components/auth/LogoutButton";

// Komponen Navigasi Sidebar
function NavItem({ icon: Icon, label, active = false }: { icon: typeof Warehouse; label: string; active?: boolean }) {
    return (
        <button className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 ${active ? "bg-[#1c2a13] text-white shadow-md" : "text-[#44483f] hover:bg-[#edf4dc]"
            }`}>
            <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
            <span className={active ? "font-display text-sm font-bold" : "text-sm font-semibold"}>
                {label}
            </span>
        </button>
    );
}

export function DashboardReviewerPage() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [data, setData] = useState<ApiReviewerDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const user = getUser();

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const result = await reviewerApi.getDashboard();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Gagal memuat dashboard");
            } finally {
                setIsLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    return (
        // MASTER WRAPPER
        <div className="min-h-screen min-w-[300px] bg-[#f3f3ec] text-[#15240a] font-sans overflow-hidden flex">

            {/* Overlay Mobile Sidebar */}
            {mobileNavOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            {/* SIDEBAR STANDAR */}
            <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <div>
                    <div className="mb-8 flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white">
                            <Leaf size={15} className="text-[#85c254]" /> REMBUKTANI
                        </div>
                        <button className="md:hidden text-[#44483f] hover:text-[#15240a] transition-colors" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        <Link to={`/reviewer/dashboard`}><NavItem active icon={Warehouse} label="Beranda" /></Link>
                        <Link to={`/reviewer/review`}><NavItem icon={ClipboardCheck} label="Review Masuk" /></Link>
                        <Link to={`/reviewer/history`}><NavItem icon={History} label="Riwayat" /></Link>
                        <Link to={`/reviewer/profile`}><NavItem icon={UserCircle2} label="Profil" /></Link>
                    </nav>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-[#e9fcb5] p-3 text-xs">
                        <span className="size-2.5 rounded-full bg-[#b98532] shrink-0" />
                        <div>
                            <p className="font-bold text-[#15240a]">Sinkronisasi BMKG</p>
                            <p className="text-[10px] text-[#44483f]">{data?.weather ? `${data.weather.condition} ${data.weather.temp}°C` : "Belum ada bukti cuaca"}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0d1b03] text-white">
                                <UserCircle2 size={15} />
                            </div>
                            <div>
                                <p className="max-w-[100px] truncate text-xs font-bold text-[#15240a]">{data?.reviewer_name || user?.display_name || "Reviewer"}</p>
                                <p className="text-[10px] text-[#666a60]">Reviewer</p>
                            </div>
                        </div>
                        <LogoutButton compact />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-[260px]">
                {/* TOPBAR STANDAR */}
                <header className="fixed top-0 left-0 right-0 md:left-[260px] z-30 flex h-14 shrink-0 items-center justify-between bg-[#f3f3ec]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8 border-b border-[#deded4]/40">          <div className="flex items-center gap-3">
                    <button className="rounded-md p-1.5 transition-colors hover:bg-black/5 md:hidden" onClick={() => setMobileNavOpen(true)}>
                        <Menu size={20} />
                    </button>
                    <span className="truncate rounded bg-[#e9fcb5] px-2.5 py-1 text-[10px] font-bold text-[#213014] sm:text-xs">
                        Wilayah: {data?.region || "Belum ada wilayah"}
                    </span>
                </div>
                    <div className="flex items-center gap-3 sm:gap-5">
                        <span className="hidden items-center gap-1.5 text-xs font-medium text-[#44483f] sm:flex">
                            {data?.weather && <><CloudSun size={16} /> {data.weather.condition} {data.weather.temp}°C</>}
                        </span>
                        <Bell size={18} className="cursor-pointer text-[#44483f] transition hover:text-[#15240a]" />
                        <div className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#0d1b03] text-white">
                            <UserCircle2 size={14} />
                        </div>
                    </div>
                </header>

                {/* CONTENT BODY */}
                <main className="mx-auto w-full max-w-[1200px] space-y-6 px-4 pb-6 pt-20 sm:px-8 lg:pb-8 lg:pt-20">
                    {isLoading ? (
                        <div className="animate-pulse space-y-8">
                            <div className="h-10 w-64 bg-white/60 rounded-xl mb-4"></div>
                            <div className="h-32 w-full bg-white/60 rounded-3xl"></div>
                            <div className="h-40 w-full bg-white/60 rounded-2xl"></div>
                        </div>
                    ) : error ? (
                        <div className="rounded-xl bg-[#fff1f2] border border-[#fecdd3] p-4 text-[#9f1239] font-semibold text-sm">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Hero Section */}
                            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight text-[#15240a]">
                                    Selamat datang, {data?.reviewer_name || user?.display_name || "Reviewer"}
                                </h1>
                                <p className="mt-3 text-xs sm:text-sm text-[#44483f] leading-relaxed max-w-2xl">
                                    Ada beberapa permintaan pertimbangan yang membutuhkan perhatian Anda sebelum petani mengambil keputusan penanganan air dan pemupukan.
                                </p>
                            </div>

                            {/* Summary Highlight Card */}
                            <div className="mb-10 rounded-3xl bg-[#f5f8ea] p-5 sm:p-7 shadow-sm border border-[#e2e8d3] animate-in fade-in duration-700 delay-100">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e9fcb5] text-[#56652e] border border-[#d9f59b]">
                                            <ClipboardCheck size={24} />
                                        </div>
                                        <div>
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fef08a]/60 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-[#a16207] mb-2">
                                                <div className="size-1.5 rounded-full bg-[#ca8a04] animate-pulse"></div> Menunggu Tinjauan
                                            </div>
                                            <h2 className="text-lg sm:text-xl font-bold text-[#15240a] mb-1.5">
                                                {data?.stats.pending_count || 0} Permintaan Pertimbangan Menunggu
                                            </h2>
                                            <p className="text-[11px] sm:text-xs text-[#666a60] leading-relaxed max-w-xl">
                                                Periksa data lapangan, bukti BMKG, dan isian Field Pulse untuk memberikan saran objektif bagi petani sebelum keputusan akhir ditetapkan.
                                            </p>
                                        </div>
                                    </div>
                                    <Link to={`/reviewer/review`} className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-[#1c2a13] px-5 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[#2d421b] shadow-md">
                                        Mulai Tinjau Sekarang <ChevronDown size={16} />
                                    </Link>
                                </div>
                            </div>

                            {/* Section 1: Permintaan Review Masuk */}
                            <div className="mb-10 animate-in fade-in duration-700 delay-200">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-[#15240a]">Permintaan Review Masuk</h3>
                                        <p className="text-[10px] sm:text-xs text-[#666a60] mt-1">Tinjau laporan berkala & rekomendasi yang diajukan petani</p>
                                    </div>
                                    <Link to="/reviewer/review" className="text-[10px] sm:text-xs font-bold text-[#15240a] hover:text-[#85c254] flex items-center gap-1 transition-colors">
                                        Lihat Semua di Review Masuk <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {data?.pending_reviews.length === 0 ? (
                                        <div className="rounded-2xl border border-[#deded4]/60 bg-white p-8 text-center text-sm font-semibold text-[#666a60]">
                                            Tidak ada antrean review masuk saat ini.
                                        </div>
                                    ) : (
                                        data?.pending_reviews.map((review) => (
                                            <div key={review.review_id} className="group rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-[#deded4]/60 transition-all hover:border-[#85c254]/50 hover:shadow-md">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-semibold text-[#666a60]">
                                                        <span className="text-[#15240a]">{review.land_name} • {review.crop_name}</span>
                                                        <span className="hidden sm:inline text-[#deded4]">|</span>
                                                        <span>{review.growth_stage}</span>
                                                    </div>
                                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fef08a]/40 px-2.5 py-1 text-[9px] font-bold text-[#a16207]">
                                                        <div className="size-1.5 rounded-full bg-[#ca8a04]"></div> Menunggu Pertimbangan
                                                    </div>
                                                </div>

                                                <p className="text-[10px] sm:text-xs text-[#666a60] mb-2">Pemilik: {review.farmer_name} ({review.location})</p>
                                                <h4 className="text-sm sm:text-base font-bold text-[#15240a] mb-4 leading-snug">
                                                    {review.decision_type}
                                                </h4>

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex flex-wrap items-center gap-2.5">
                                                        {review.evidence.bmkg && (
                                                            <span className="flex items-center gap-1.5 rounded-lg bg-[#fafaf6] border border-[#deded4]/50 px-2.5 py-1.5 text-[9px] sm:text-[10px] text-[#44483f]">
                                                                <CloudSun size={12} className="text-[#85c254]" /> BMKG: {review.evidence.bmkg.condition} {review.evidence.bmkg.temp}°C
                                                            </span>
                                                        )}
                                                        {review.evidence.field_pulse && (
                                                            <span className="flex items-center gap-1.5 rounded-lg bg-[#fff1f2] border border-[#fecdd3]/50 px-2.5 py-1.5 text-[9px] sm:text-[10px] text-[#9f1239]">
                                                                <AlertTriangle size={12} className="text-[#e11d48]" /> Field Pulse: "{review.evidence.field_pulse.condition}"
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link to={`/reviewer/review/${review.review_id}`} className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#85c254] px-4 py-2.5 text-[10px] sm:text-xs font-bold text-[#15240a] transition-colors hover:bg-[#98cf6a]">
                                                        Lihat & Beri Pertimbangan <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Review Terbaru yang Diselesaikan */}
                            <div className="mb-10 animate-in fade-in duration-700 delay-300">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-[#15240a]">Review Terbaru yang Diselesaikan</h3>
                                    </div>
                                    <Link to="/reviewer/history" className="text-[10px] sm:text-xs font-bold text-[#15240a] hover:text-[#85c254] flex items-center gap-1 transition-colors">
                                        Lihat Riwayat Review <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {data?.completed_reviews.map((history) => (
                                        <div key={history.review_id} className="group flex flex-col sm:flex-row sm:items-start gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-[#deded4]/60 transition-all hover:border-[#85c254]/30">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2.5 text-[10px] sm:text-xs font-bold text-[#15240a] mb-1">
                                                    {history.land_name} • {history.farmer_name} <span className="font-normal text-[#666a60]">{history.village}</span>
                                                    <span className="inline-flex items-center rounded bg-[#e9fcb5] px-2 py-0.5 text-[9px] font-bold text-[#3f6212]">
                                                        Selesai {history.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] sm:text-xs text-[#44483f] italic leading-relaxed mt-2 bg-[#fafaf6] p-3 rounded-xl border border-[#deded4]/40">
                                                    "{history.comment}"
                                                </p>
                                            </div>
                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#deded4]/50">
                                                <span className="text-[9px] sm:text-[10px] text-[#a4a99d] mb-1.5">{new Date(history.responded_at).toLocaleDateString("id-ID")}</span>
                                                <Link to="/reviewer/history" className="text-[10px] sm:text-xs font-bold text-[#15240a] hover:text-[#85c254] flex items-center gap-1 transition-colors">
                                                    Detail Saran & Keputusan <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
