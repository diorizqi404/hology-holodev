import { useState, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Bell, CloudSun, Leaf, Menu, 
  Sprout, UserCircle2, Warehouse, History,
  ClipboardCheck, AlertTriangle, Check, X,
  MapPin, Droplets, Info, FileText, Circle, CheckCircle2,
  Send
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { reviewerApi, type ApiReviewerReviewDetail } from "../../lib/reviewer-api";
import { getUser } from "../../lib/auth";
import { LogoutButton } from "../../components/auth/LogoutButton";

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

export function ReviewDetailPage() {  
  const { reviewId = "" } = useParams();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState("tambahan"); // 'jelas', 'tambahan', 'lain'
  const [noteText, setNoteText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<ApiReviewerReviewDetail | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    reviewerApi.getReviewDetail(reviewId).then((result) => {
      setData(result);
      const savedDraft = sessionStorage.getItem(`rembuktani.review-draft.${reviewId}`);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft) as { selectedDecision?: string; noteText?: string };
          if (draft.selectedDecision) setSelectedDecision(draft.selectedDecision);
          if (typeof draft.noteText === "string") setNoteText(draft.noteText);
        } catch { sessionStorage.removeItem(`rembuktani.review-draft.${reviewId}`); }
      } else if (result.prior_review?.comment) setNoteText(result.prior_review.comment);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Gagal memuat detail review"));
    return () => clearTimeout(timer);
  }, [reviewId]);

  const submitReview = async () => {
    if (!data || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      await reviewerApi.submitReview(data.case_id, {
        status: selectedDecision === "jelas" ? "approve" : "modify",
        assessment_id: data.assessment?.id,
        comment: noteText.trim() || undefined,
      });
      sessionStorage.removeItem(`rembuktani.review-draft.${reviewId}`);
      setIsModalOpen(false);
      navigate("/reviewer/history", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Pertimbangan gagal dikirim");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewerName = getUser()?.display_name || "Reviewer";
  const farmerName = data?.farmer.name || "Petani";
  const landName = data?.land.name || "Lahan";
  const location = data?.land.location || "Lokasi belum tersedia";
  const cropLabel = data?.crop ? [data.crop.name, data.crop.variety].filter(Boolean).join(" ") : "Tanaman belum dicatat";
  const plantingDays = data?.crop?.planting_date && data.submitted_at
    ? Math.max(0, Math.floor((new Date(data.submitted_at).getTime() - new Date(data.crop.planting_date).getTime()) / 86400000))
    : null;

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

      {/* MODAL KONFIRMASI (NEW) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-[520px] rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            
            <div className="flex gap-4 sm:gap-5">
              <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full bg-[#e9fcb5] text-[#56652e]">
                <Send size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#15240a]">Kirim Pertimbangan?</h2>
                <p className="mt-2 text-xs sm:text-sm text-[#666a60] leading-relaxed">
                  Pertimbangan Anda akan dikirim langsung kepada {farmerName} sebagai bahan rujukan sebelum mengambil keputusan.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#fafaf6] p-4 sm:p-5 border border-[#deded4]/60">
              <p className="text-[10px] sm:text-xs text-[#44483f]">
                <strong className="text-[#15240a]">Lahan:</strong> {landName} • {farmerName} ({location})
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded bg-[#e9fcb5] px-2.5 py-1 text-[10px] font-bold text-[#213014]">
                <Check size={12} strokeWidth={3} /> 
                {selectedDecision === "jelas" ? "Informasi sudah cukup jelas" : selectedDecision === "tambahan" ? "Perlu informasi tambahan" : "Catatan agronomis khusus"}
              </div>
              
              <div className="mt-5 pt-4 border-t border-[#deded4]/50">
                <h4 className="text-[9px] font-bold tracking-widest text-[#666a60] uppercase mb-2">Catatan Anda:</h4>
                <p className="text-xs sm:text-sm text-[#44483f] italic leading-relaxed">
                  "{noteText || "Tidak ada catatan tambahan."}"
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2.5 text-[10px] sm:text-[11px] font-medium text-[#666a60]">
              <Info size={16} className="text-[#a4a99d] shrink-0" />
              <p>Keputusan akhir tindakan tetap berada di tangan petani pemilik lahan.</p>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto rounded-xl border border-[#deded4] bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-[#44483f] transition hover:bg-[#fafaf6]"
              >
                Periksa Lagi
              </button>
              <button 
                onClick={submitReview}
                disabled={isSubmitting}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#85c254] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#15240a] transition hover:bg-[#98cf6a] shadow-md"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Sekarang"} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
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
            <Link to={`/reviewer/review`}><NavItem active icon={ClipboardCheck} label="Review Masuk" /></Link>
            <Link to={`/reviewer/history`}><NavItem icon={History} label="Riwayat" /></Link>
            <Link to={`/reviewer/profile`}><NavItem icon={UserCircle2} label="Profil" /></Link>
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
                <p className="max-w-[100px] truncate text-xs font-bold text-[#15240a]">{reviewerName}</p>
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
              Wilayah: {location}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden items-center gap-1.5 text-xs font-medium text-[#44483f] sm:flex">
              <CloudSun size={16} /> {data?.evidence.bmkg ? `${data.evidence.bmkg.condition} ${data.evidence.bmkg.temp}°C` : "Cuaca belum tersedia"}
            </span>
            <Bell size={18} className="cursor-pointer text-[#44483f] transition hover:text-[#15240a]" />
            <div className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-[#0d1b03] text-white">
              <UserCircle2 size={14} />
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl pt-14">
            
            {/* Header Section */}
            <div className={`mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              <button onClick={() => navigate("/reviewer/review")} className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-[#666a60] transition hover:text-[#15240a] mb-5">
                <ArrowLeft size={14} /> Kembali ke Antrean Review
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-[#666a60] mb-2">
                    <FileText size={14} /> Permintaan Review #{data?.case_id.slice(0, 8).toUpperCase() || "-"}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-tight text-[#15240a]">
                    Tinjauan Pertimbangan: {landName}
                  </h1>
                  <p className="mt-2 text-xs sm:text-sm text-[#44483f] leading-relaxed max-w-2xl">
                    Pahami konteks lahan dan bukti lapangan sebelum memberikan pertimbangan bagi {farmerName}.
                  </p>
                </div>
                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#fef08a]/40 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-[#a16207]">
                  <div className="size-2 rounded-full bg-[#ca8a04]"></div> Menunggu Pertimbangan
                </div>
              </div>
            </div>

            {/* Grid Layout (Left: Info, Right: Form) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
              
              {/* LEFT COLUMN: Data Lahan & Bukti */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                
                {/* Bagian 1: Informasi Lahan */}
                <div className={`transition-all delay-100 duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#15240a] uppercase">
                      <div className="size-2 rounded-full bg-[#85c254]"></div> Informasi Lahan
                    </h2>
                    <span className="text-[10px] sm:text-[11px] text-[#a4a99d]">Diajukan {data ? new Date(data.submitted_at).toLocaleString("id-ID") : "-"}</span>
                  </div>
                  
                  <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-[#deded4]/60 flex flex-col sm:flex-row gap-4 sm:gap-5">
                    {/* Gambar Lahan/Peta */}
                    <div className="relative h-32 sm:h-auto sm:w-40 shrink-0 overflow-hidden rounded-xl bg-[#2a3a22]">
                       <img src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=400" alt="Peta Lahan" className="w-full h-full object-cover opacity-80" />
                       <div className="absolute bottom-2 left-2 right-2 rounded bg-black/60 backdrop-blur-md px-2 py-1 text-[9px] text-white flex items-center gap-1">
                          <MapPin size={10} className="text-[#85c254]" /> {location}
                       </div>
                    </div>
                    {/* Detail Teks */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-[#15240a]">{landName}</h3>
                          <span className="rounded bg-[#e9fcb5] px-2 py-0.5 text-[9px] font-bold text-[#3f6212]">Petak Sekunder</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-[#666a60]">Pemilik: <strong className="text-[#15240a]">{farmerName}</strong></p>
                      </div>
                      <div className="rounded-lg bg-[#fafaf6] px-3 py-2 text-[10px] sm:text-xs text-[#44483f] flex items-center gap-2 border border-[#deded4]/40">
                        <Sprout size={14} className="text-[#85c254]" /> {cropLabel} — {data?.crop?.growth_stage || "unknown"}{plantingDays !== null ? ` (HST ${plantingDays})` : ""}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-[#666a60] flex items-center gap-1.5">
                        <span className="font-semibold">Koordinat:</span> {data?.land.latitude ?? "-"}, {data?.land.longitude ?? "-"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Bukti Lapangan */}
                <div className={`transition-all delay-200 duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#666a60] uppercase">
                      <div className="size-2 rounded-full bg-[#666a60]"></div> Informasi Pendukung (Bukti Lapangan)
                    </h2>
                    <span className="text-[10px] sm:text-[11px] text-[#a4a99d]">3 Parameter Sinkron</span>
                  </div>

                  <div className="space-y-4">
                    {/* Cuaca BMKG */}
                    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-[#deded4]/60">
                      <h3 className="text-xs sm:text-sm font-bold text-[#15240a] mb-3">Cuaca BMKG</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-[#fafaf6] p-3 rounded-xl border border-[#deded4]/40">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-semibold text-[#44483f]">
                          <span className="flex items-center gap-1.5"><CloudSun size={14} className="text-[#d97706]" /> {data?.evidence.bmkg?.condition || "Belum tersedia"}</span>
                          <span className="text-[#deded4] hidden sm:inline">•</span>
                          <span>{data?.evidence.bmkg ? `${data.evidence.bmkg.temp}°C` : "-"}</span>
                          <span className="text-[#deded4] hidden sm:inline">•</span>
                          <span>Kelembapan {data?.evidence.bmkg?.humidity ?? "-"}%</span>
                        </div>
                        <button className="text-[10px] font-bold text-[#85c254] hover:text-[#56652e]">Lihat Detail ˅</button>
                      </div>
                      <div className="flex justify-between text-[9px] sm:text-[10px] text-[#666a60]">
                        <span>Pembaruan: {data?.evidence.bmkg?.target_time ? new Date(data.evidence.bmkg.target_time).toLocaleString("id-ID") : "-"}</span>
                        <span>Angin: {data?.evidence.bmkg?.wind_speed ?? "-"} km/j</span>
                        <span>Sumber: {data?.evidence.bmkg?.source || "BMKG"}</span>
                      </div>
                    </div>

                    {/* Kondisi Lapangan */}
                    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-[#deded4]/60">
                      <h3 className="text-xs sm:text-sm font-bold text-[#15240a] mb-3">Kondisi Lapangan</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-semibold text-[#15240a] mb-4">
                        <span className="flex items-center gap-1.5 rounded-lg bg-[#fff1f2] px-2.5 py-1.5 text-[#9f1239]">
                          <Droplets size={12} /> Air: {data?.evidence.field_pulse?.water_presence || "Belum tersedia"}
                        </span>
                        <span className="text-[#deded4]">•</span>
                        <span className="flex items-center gap-1.5 rounded-lg bg-[#fffbeb] px-2.5 py-1.5 text-[#92400e]">
                          Irigasi: {data?.evidence.field_pulse?.irrigation_flow || "Belum tersedia"}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#666a60] italic leading-relaxed pl-3 border-l-2 border-[#deded4]">
                        "{data?.evidence.field_pulse?.notes || "Belum ada catatan lapangan."}"
                      </p>
                    </div>

                    {/* Kebutuhan Tanaman */}
                    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-[#deded4]/60">
                      <h3 className="text-xs sm:text-sm font-bold text-[#15240a] mb-3">Kebutuhan Tanaman</h3>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-[#15240a] mb-3">
                        <Sprout size={14} className="text-[#85c254]" /> {cropLabel} <span className="text-[#deded4] mx-1">•</span> Fase {data?.crop?.growth_stage || "unknown"}
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#44483f] leading-relaxed">
                        <strong className="text-[#15240a]">Catatan Agronomi:</strong> {data?.assessment?.summary || "Assessment belum tersedia."}
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Kondisi & Form */}
              <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                
                {/* Ringkasan Kondisi (Yellow Theme) */}
                <div className={`rounded-2xl bg-[#fffcf3] p-5 sm:p-6 shadow-sm border border-[#fde68a]/60 transition-all delay-300 duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#a16207] uppercase">
                      <div className="size-2 rounded-full bg-[#ca8a04]"></div> Ringkasan Kondisi
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef08a]/40 px-2 py-0.5 text-[9px] font-bold text-[#a16207]">
                      <div className="size-1.5 rounded-full bg-[#ca8a04]"></div> Kondisi perlu ditinjau
                    </span>
                  </div>
                  
                  <p className="text-[11px] sm:text-xs text-[#92400e] leading-relaxed mb-5">
                    {data?.assessment?.summary || "Assessment belum tersedia untuk kasus ini."}
                  </p>

                  <h3 className="text-[10px] font-bold tracking-widest text-[#a16207] uppercase mb-3">Kenapa?</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 border border-[#fde68a]/40">
                      <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#15240a]">
                        <Droplets size={12} className="text-[#a4a99d]" /> {data?.assessment?.factors[0] || "Kondisi lapangan perlu ditinjau"}
                      </span>
                      <span className="rounded bg-[#fef08a]/40 px-2 py-0.5 text-[9px] font-bold text-[#a16207]">Observasi Petani</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 border border-[#fde68a]/40">
                      <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#15240a]">
                        <CloudSun size={12} className="text-[#a4a99d]" /> Informasi cuaca tersedia
                      </span>
                      <span className="rounded bg-[#eff6ff] px-2 py-0.5 text-[9px] font-bold text-[#1d4ed8]">BMKG</span>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl bg-[#fef08a]/20 p-3 border border-[#fde68a]/60">
                      <AlertTriangle size={14} className="text-[#ca8a04] shrink-0 mt-0.5" />
                      <p className="text-[10px] sm:text-[11px] text-[#92400e] leading-relaxed">
                        <strong className="text-[#a16207]">Yang belum diketahui:</strong> {data?.assessment?.missing_evidence.join("; ") || "Tidak ada kekurangan bukti yang dicatat."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Pertimbangan Anda */}
                <div className={`rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-[#deded4]/60 transition-all delay-400 duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                  <h2 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#15240a] mb-2">
                    <div className="size-2 rounded-full bg-[#85c254]"></div> Pertimbangan Anda (PPL Pendamping)
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#666a60] leading-relaxed mb-5">
                    Pilih arah pertimbangan dan tambahkan catatan spesifik untuk petani.
                  </p>

                  {/* Radio Options */}
                  <div className="space-y-3 mb-6">
                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${selectedDecision === "jelas" ? "bg-[#fafaf6] border-[#85c254] ring-1 ring-[#85c254]" : "bg-white border-[#deded4]/60 hover:border-[#85c254]/50"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="decision" className="hidden" onChange={() => setSelectedDecision("jelas")} />
                        <div className="flex items-center justify-center">
                          {selectedDecision === "jelas" ? <CheckCircle2 size={18} className="text-[#85c254]" /> : <Circle size={18} className="text-[#deded4]" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold ${selectedDecision === "jelas" ? "text-[#15240a]" : "text-[#44483f]"}`}>Informasi sudah cukup jelas</span>
                      </div>
                      <span className="text-[10px] text-[#a4a99d] hidden sm:block">Tidak ada catatan mendesak</span>
                    </label>

                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${selectedDecision === "tambahan" ? "bg-[#fafaf6] border-[#85c254] ring-1 ring-[#85c254]" : "bg-white border-[#deded4]/60 hover:border-[#85c254]/50"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="decision" className="hidden" onChange={() => setSelectedDecision("tambahan")} />
                        <div className="flex items-center justify-center">
                          {selectedDecision === "tambahan" ? <CheckCircle2 size={18} className="text-[#85c254]" /> : <Circle size={18} className="text-[#deded4]" />}
                        </div>
                        <div>
                          <span className={`block text-xs sm:text-sm font-bold ${selectedDecision === "tambahan" ? "text-[#15240a]" : "text-[#44483f]"}`}>Perlu informasi tambahan</span>
                          <span className="block text-[10px] sm:text-[11px] text-[#666a60] mt-0.5">Disarankan konfirmasi kondisi fisik saluran/pintu air</span>
                        </div>
                      </div>
                      {selectedDecision === "tambahan" && (
                        <span className="hidden sm:flex items-center gap-1 rounded bg-[#e9fcb5] px-2 py-1 text-[9px] font-bold text-[#213014]">
                          <Check size={10} /> Pilihan Anda
                        </span>
                      )}
                    </label>

                    <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${selectedDecision === "lain" ? "bg-[#fafaf6] border-[#85c254] ring-1 ring-[#85c254]" : "bg-white border-[#deded4]/60 hover:border-[#85c254]/50"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="decision" className="hidden" onChange={() => setSelectedDecision("lain")} />
                        <div className="flex items-center justify-center">
                          {selectedDecision === "lain" ? <CheckCircle2 size={18} className="text-[#85c254]" /> : <Circle size={18} className="text-[#deded4]" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold ${selectedDecision === "lain" ? "text-[#15240a]" : "text-[#44483f]"}`}>Saya memiliki catatan lain</span>
                      </div>
                      <span className="text-[10px] text-[#a4a99d] hidden sm:block">Tuliskan saran khusus</span>
                    </label>
                  </div>

                  {/* Textarea */}
                  <div className="mb-6">
                    <label htmlFor="catatan" className="block text-[10px] sm:text-xs font-bold text-[#15240a] mb-2">
                      Catatan Pertimbangan untuk Petani:
                    </label>
                    <textarea 
                      id="catatan"
                      rows={4}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full rounded-xl bg-[#fafaf6] p-3 sm:p-4 text-xs sm:text-sm text-[#15240a] outline-none border border-[#deded4]/80 focus:border-[#85c254] focus:ring-4 focus:ring-[#85c254]/10 resize-none transition-all"
                      placeholder="Tuliskan catatan Anda di sini..."
                    />
                  </div>

                  {/* Disclaimer Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer group mb-8">
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-[#deded4] bg-white group-hover:border-[#85c254] transition-colors">
                      <Check size={12} className="text-white" /> 
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-[#666a60] leading-relaxed">
                      Pertimbangan Anda akan dibaca langsung oleh {farmerName} sebagai bahan rujukan sebelum mengambil keputusan akhir.
                    </p>
                  </label>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="flex w-full flex-1 items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3.5 text-xs sm:text-sm font-bold text-[#15240a] transition-all hover:bg-[#98cf6a] shadow-md hover:shadow-lg order-1 sm:order-none"
                    >
                      Kirim Pertimbangan <ArrowRight size={16} />
                    </button>
                    <button onClick={() => sessionStorage.setItem(`rembuktani.review-draft.${reviewId}`, JSON.stringify({ selectedDecision, noteText }))} className="flex w-full sm:w-auto shrink-0 items-center justify-center rounded-xl bg-white border border-[#deded4] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#44483f] transition hover:bg-[#fafaf6] order-2 sm:order-none">
                      Simpan Draf
                    </button>
                  </div>

                  {error && <p className="mt-4 text-[10px] sm:text-xs font-semibold text-[#9f1239]">{error}</p>}

                </div>

              </div>
            </div>

            <div className="h-10"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
