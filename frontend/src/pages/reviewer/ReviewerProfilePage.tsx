import { useState, useEffect } from "react";
import {
  Bell, CloudSun, Leaf, Menu, 
  UserCircle2, Warehouse, History,
  ClipboardCheck, X, MapPin, ShieldCheck, User, 
  FileText, HelpCircle, Edit2, Check, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../../components/auth/LogoutButton";
import { reviewerApi, type ApiReviewerDashboard, type ApiReviewerProfile } from "../../lib/reviewer-api";

// Komponen Navigasi Sidebar (Standar)
function NavItem({ icon: Icon, label, active = false }: { icon: typeof Warehouse; label: string; active?: boolean }) {
  return (
    <button className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300 ${
      active ? "bg-[#1c2a13] text-white shadow-md" : "text-[#44483f] hover:bg-[#edf4dc]"
    }`}>
      <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
      <span className={active ? "font-display text-sm font-bold" : "text-sm font-semibold"}>
        {label}
      </span>
    </button>
  );
}

export function ReviewerProfilePage() {  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<ApiReviewerProfile | null>(null);
  const [dashboard, setDashboard] = useState<ApiReviewerDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    Promise.all([reviewerApi.getProfile(), reviewerApi.getDashboard()])
      .then(([profileResult, dashboardResult]) => { setProfile(profileResult); setDashboard(dashboardResult); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Gagal memuat profil"));
    return () => clearTimeout(timer);
  }, []);

  const displayName = profile?.display_name || "Reviewer";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "RV";

  return (
    // MASTER WRAPPER
    <div className="min-h-screen min-w-[300px] bg-[#f3f3ec] text-[#15240a] font-sans overflow-hidden flex relative">
      
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
            <Link to={`/reviewer/dashboard`}><NavItem icon={Warehouse} label="Beranda" /></Link>
            <Link to={`/reviewer/review`}><NavItem icon={ClipboardCheck} label="Review Masuk" /></Link>
            <Link to={`/reviewer/history`}><NavItem icon={History} label="Riwayat" /></Link>
            <Link to={`/reviewer/profile`}><NavItem active icon={UserCircle2} label="Profil" /></Link>
          </nav>
        </div>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#e9fcb5] p-3 text-xs">
            <span className="size-2.5 rounded-full bg-[#85c254] shrink-0" />
            <div>
              <p className="font-bold text-[#15240a]">Sinkronisasi BMKG</p>
              <p className="text-[10px] text-[#56652e]">Data cuaca aktif</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0d1b03] text-white">
                <UserCircle2 size={15} />
              </div>
              <div>
                <p className="max-w-[100px] truncate text-xs font-bold text-[#15240a]">{displayName}</p>
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
              Wilayah: {dashboard?.region || "Belum ada wilayah"}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden items-center gap-1.5 text-xs font-medium text-[#44483f] sm:flex">
              <CloudSun size={16} /> {dashboard?.weather ? `${dashboard.weather.condition} ${dashboard.weather.temp}°C` : "Cuaca belum tersedia"}
            </span>
            <Bell size={18} className="cursor-pointer text-[#44483f] transition hover:text-[#15240a]" />
            <div className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#0d1b03] text-white">
              <UserCircle2 size={14} />
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl pt-14">
            
            {/* Header Section */}
            <div className={`mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight text-[#15240a]">
                Profil Reviewer
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#666a60] leading-relaxed max-w-2xl">
                Identitas dan peran Anda sebagai penasihat terpercaya (Trusted Advisor) bagi petani di RembukTani.
              </p>
            </div>

            {/* Profile Hero Card */}
            <div className={`mb-6 rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-[#deded4]/60 transition-all delay-100 duration-700 ease-out flex flex-col md:flex-row md:items-center justify-between gap-6 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                {/* Avatar with Badge */}
                <div className="relative shrink-0">
                  <div className="flex size-20 sm:size-24 items-center justify-center rounded-[24px] bg-[#1c2a13] text-2xl sm:text-3xl font-display font-bold text-white shadow-inner">
                    {initials}
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full bg-white">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#85c254] text-[#15240a] shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#15240a]">{displayName}</h2>
                    <span className="inline-flex items-center rounded-md bg-[#e9fcb5] px-2.5 py-1 text-[10px] font-bold text-[#3f6212]">
                      <div className="size-1.5 rounded-full bg-[#85c254] mr-1.5"></div> Penyuluh Terverifikasi
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#44483f] mb-1.5">Reviewer RembukTani</p>
                  <p className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#a4a99d]">
                    <MapPin size={14} /> {dashboard?.region || "Wilayah belum tersedia"}
                  </p>
                </div>
              </div>

              {/* Rujukan Mandiri Alert Box */}
              <div className="rounded-2xl bg-[#fafaf6] border border-[#deded4]/50 p-4 max-w-sm md:text-right shrink-0 self-start md:self-center">
                <div className="flex md:justify-end items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#666a60] mb-1.5">
                  <Lock size={14} className="text-[#a4a99d]" /> Rujukan Mandiri Petani
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#a4a99d] leading-relaxed">
                  Masukan Anda membantu petani menentukan tindakan tanpa mengganti hak keputusannya.
                </p>
              </div>
            </div>

            {/* Grid Detail Profil */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8 transition-all delay-200 duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              
              {/* Left Column: Informasi Reviewer */}
              <div className="rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-[#deded4]/60">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#deded4]/50">
                  <h3 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#15240a] uppercase">
                    <FileText size={16} className="text-[#666a60]" /> Informasi Reviewer
                  </h3>
                  <span className="text-[10px] text-[#a4a99d]">Data Pokok</span>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-[#deded4]/30 pb-4">
                    <span className="text-xs sm:text-sm text-[#666a60]">Nama</span>
                    <span className="text-sm sm:text-base font-bold text-[#15240a] text-right">{displayName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-[#deded4]/30 pb-4">
                    <span className="text-xs sm:text-sm text-[#666a60]">Peran</span>
                    <span className="text-sm sm:text-base font-bold text-[#15240a] text-right">{profile?.role === "reviewer" ? "Reviewer" : "-"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-[#deded4]/30 pb-4">
                    <span className="text-xs sm:text-sm text-[#666a60]">Wilayah</span>
                    <span className="text-sm sm:text-base font-bold text-[#15240a] text-right">{dashboard?.region || "Belum tersedia"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 pt-1">
                    <span className="text-xs sm:text-sm text-[#666a60] pt-1">Keahlian</span>
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 text-[10px] sm:text-xs font-bold text-[#166534]">
                        <div className="size-1.5 rounded-full bg-[#22c55e]"></div> Reviewer Terverifikasi
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#f3f3ec] border border-[#deded4] px-3 py-1 text-[10px] sm:text-xs font-semibold text-[#44483f]">
                        {dashboard?.stats.pending_count ?? 0} review menunggu
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Tentang Reviewer */}
              <div className="rounded-3xl bg-white p-5 sm:p-8 shadow-sm border border-[#deded4]/60">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#deded4]/50">
                  <h3 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#15240a] uppercase">
                    <User size={16} className="text-[#666a60]" /> Tentang Reviewer
                  </h3>
                </div>

                <div className="rounded-2xl bg-[#fafaf6] border border-[#deded4]/50 p-5 mb-6 relative">
                  <span className="absolute -top-3 -left-1 text-4xl text-[#deded4] font-serif leading-none">"</span>
                  <p className="text-sm font-semibold text-[#44483f] italic leading-relaxed relative z-10">
                    Membantu petani memahami kondisi lahan dan memberikan pertimbangan berdasarkan informasi yang tersedia.
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#666a60] leading-relaxed mb-8">
                  Sebagai pendamping pertanian, fokus utama adalah memperkaya sudut pandang petani saat menghadapi ketidakpastian cuaca atau keterbatasan air, tanpa memaksakan keputusan.
                </p>

                <div className="mt-auto flex items-center gap-2.5 text-[10px] sm:text-xs font-semibold text-[#56652e]">
                  <ShieldCheck size={16} className="text-[#85c254] shrink-0" />
                  Keputusan akhir tetap milik petani.
                </div>
              </div>

            </div>

            {/* Action Buttons Section */}
            {error && <p className="mb-4 text-xs font-semibold text-[#9f1239]">{error}</p>}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#deded4]/50 pt-8 transition-all delay-300 duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              
              <div className="flex w-full sm:w-auto items-center gap-3">
                <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-[#85c254] px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-[#15240a] shadow-sm transition hover:bg-[#98cf6a]">
                  <Edit2 size={16} /> Edit Profil
                </button>
                <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-white border border-[#deded4] px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-[#44483f] transition hover:bg-[#fafaf6]">
                  <HelpCircle size={16} /> Bantuan
                </button>
              </div>

              <div className="w-full sm:w-auto"><LogoutButton/></div>

            </div>

            {/* Footer Text */}
            <p className={`mt-10 text-center text-[9px] sm:text-[10px] text-[#a4a99d] transition-all delay-500 duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              RembukTani Decision Support Layer • Profil penasihat ditujukan membangun transparansi dan kepercayaan bagi petani binaan.
            </p>
            
            <div className="h-10"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
