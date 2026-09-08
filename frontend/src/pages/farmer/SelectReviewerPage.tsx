import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Bell, Check, ChevronRight, History, Leaf, Menu, Sprout, UserCircle2, Users, Warehouse, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErrorCard, LoadingCard } from "../../components/farmer/WorkflowLayout";
import { ensureAssessment, readWorkflow, saveWorkflow, type WorkflowData } from "../../lib/decision-workflow";
import { farmerApi, type ApiReviewerProfile, type ApiTrustedReview } from "../../services/farmer-api";
import { getUser } from "../../lib/auth";
import { WeatherStatus } from "../../components/farmer/WeatherStatus";
import { LogoutButton } from "../../components/auth/LogoutButton";

export function SelectReviewerPage() {
  const { landId = "" } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [data, setData] = useState<WorkflowData>();
  const [reviewers, setReviewers] = useState<ApiReviewerProfile[]>([]);
  const [reviews, setReviews] = useState<ApiTrustedReview[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<string>();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const chosen = readWorkflow(landId);

  useEffect(() => {
    if (!landId) return;
    Promise.all([ensureAssessment(landId), farmerApi.listReviewers()])
      .then(async ([nextData, nextReviewers]) => {
        setData(nextData);
        const newestFirst = [...nextReviewers].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
        setReviewers(newestFirst.filter((reviewer, index, all) => all.findIndex((candidate) => candidate.display_name.trim().toLocaleLowerCase("id-ID") === reviewer.display_name.trim().toLocaleLowerCase("id-ID") && candidate.role === reviewer.role) === index));
        setReviews(await farmerApi.listReviews(nextData.decisionCase.id));
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Daftar pendamping gagal dimuat"));
  }, [landId]);

  const request = async () => {
    if (!data || !selectedReviewer) return;
    setSending(true);
    setError("");
    try {
      await farmerApi.requestReview(data.decisionCase.id, {
        assessment_id: data.result.assessment.id,
        selected_action_option_id: selectedAction?.id,
        reviewer_id: selectedReviewer,
      });
      saveWorkflow(landId, {
        reviewer_id: selectedReviewer,
        reviewer_name: selected?.display_name || "Pendamping Tepercaya",
        reviewer_role: selected?.role || "reviewer",
      });
      setReviews(await farmerApi.listReviews(data.decisionCase.id));
      setSubmitted(true);
      setSuccess("Permintaan review berhasil dikirim. Mengarahkan ke keputusan akhir…");
      window.setTimeout(() => navigate(`/farmer/lands/${landId}/final-decision`), 1200);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Permintaan gagal");
    } finally {
      setSending(false);
    }
  };

  const selected = reviewers.find((reviewer) => reviewer.id === selectedReviewer);
  const selectedAction = data?.result.options.find((option) => option.id === chosen.option_id)
    ?? data?.result.options.find((option) => option.title === chosen.option_title);
  const alreadyPending = submitted || data?.decisionCase.status === "review_pending" || reviews.some((review) => review.status === "pending");
  const location = data ? [data.land.village, data.land.regency].filter(Boolean).join(", ") || "Lokasi belum lengkap" : "Memuat wilayah";

  return <div className="min-h-screen bg-[#f3f3ec] text-[#15240a]">
    {success && <div role="status" aria-live="polite" className="fixed right-4 top-4 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-[#9dcc68] bg-[#effbd2] px-4 py-3 text-xs font-semibold text-[#294218] shadow-lg"><Check className="mt-0.5 shrink-0" size={16} />{success}</div>}
    {mobileNavOpen && <button type="button" className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div><div className="mb-7 flex items-center justify-between px-2"><Link to="/farmer/dashboard" className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white"><Leaf size={15} className="text-[#85c254]" />REMBUKTANI</Link><button type="button" className="md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={20} /></button></div><Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold">+ Tambah Lahan</Link><nav className="space-y-1"><SideLink to="/farmer/dashboard" icon={<Warehouse size={18} />} label="Beranda" /><SideLink to="/farmer/lands" icon={<Sprout size={18} />} label="Lahan" active /><SideLink to="/farmer/history" icon={<History size={18} />} label="Riwayat" /><SideLink to="/farmer/profile" icon={<UserCircle2 size={18} />} label="Profil" /></nav></div>
      <div className="space-y-4"><div className="rounded-xl bg-[#e9fcb5] p-3"><p className="text-xs font-bold"><span className="mr-1.5 inline-block size-2 rounded-full bg-[#85c254]" />Sinkronisasi BMKG</p><div className="pl-4 text-[10px] text-[#56652e]"><WeatherStatus preferredLandId={landId} /></div></div><div className="flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={15} /></span><div><p className="text-xs font-bold">{user?.display_name || user?.displayName || "Sahabat Tani"}</p><p className="text-[10px] text-[#666a60]">Petani</p></div></div><LogoutButton compact /></div></div>
    </aside>

    <div className="md:ml-[260px]"><header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#deded4]/50 bg-[#f3f3ec]/90 px-4 backdrop-blur-md sm:px-8"><button type="button" className="rounded-md p-1.5 md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={20} /></button><span className="truncate rounded bg-[#e9fcb5] px-2.5 py-1 text-[10px] font-bold text-[#213014] sm:text-xs">Wilayah: {location}</span><div className="flex items-center gap-4"><span className="hidden items-center gap-1.5 text-xs font-medium sm:flex"><WeatherStatus preferredLandId={landId} /></span><Bell size={17} /><span className="flex size-7 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={14} /></span></div></header>
      <main className="mx-auto max-w-[1080px] px-4 pb-32 pt-5 sm:px-8"><div className="flex items-center gap-1.5 text-[10px] text-[#56652e]"><span>Lahan</span><ChevronRight size={12} /><span>{data?.land.name || "Memuat lahan"}</span><ChevronRight size={12} /><b>Rembuk & Konsultasi Pilihan</b></div><div className="mt-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9fcb5] px-2.5 py-1 text-[10px] font-bold text-[#496b31]"><Users size={12} /> KELOLA PENGAMBILAN KEPUTUSAN</span><h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Siapa yang ingin Anda minta pertimbangan?</h1><p className="mt-1.5 max-w-2xl text-sm leading-5 text-[#666a60]">Pilih orang yang dapat membantu memberikan masukan sebelum Anda membuat keputusan akhir.</p></div>
        {error && <div className="mt-5"><ErrorCard message={error} /></div>}
        {!data ? <div className="mt-5"><LoadingCard /></div> : <><div className="mt-6 flex items-end justify-between gap-3"><h2 className="font-display text-base font-bold">Daftar Pendamping Tepercaya di Wilayah Anda</h2><span className="hidden text-[10px] text-[#8a8e84] sm:block">Wilayah {location}</span></div><section className="mt-3 rounded-2xl bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7e8e2] pb-3"><div><p className="text-[9px] font-bold uppercase tracking-wide text-[#777d73]">Konteks lahan Anda</p><p className="mt-1 text-sm font-bold">{data.land.name} <span className="font-normal text-[#73796f]">• {location}</span></p></div><span className="rounded-full border border-[#f1d987] bg-[#fffbea] px-2.5 py-1 text-[9px] font-bold text-[#a16207]">△ Kondisi: Perlu Ditinjau</span></div><div className="pt-3"><p className="text-[9px] font-bold uppercase tracking-wide text-[#777d73]">Informasi lengkap yang akan diteruskan secara otomatis:</p><div className="mt-2 grid gap-2 sm:grid-cols-3"><EvidenceChip label="Analisis kondisi lahan tersedia" /><EvidenceChip label="Data cuaca BMKG terkini" /><EvidenceChip label="Catatan air & fase lapangan" /></div></div></section><div className="mt-3 grid gap-4 md:grid-cols-2">{reviewers.length ? reviewers.map((reviewer) => <ReviewerCard key={reviewer.id} reviewer={reviewer} selected={selectedReviewer === reviewer.id} onSelect={() => setSelectedReviewer(reviewer.id)} />) : <div className="rounded-2xl bg-white p-6 text-sm text-[#666a60] md:col-span-2">Belum ada pendamping tepercaya yang tersedia untuk lahan ini.</div>}</div></>}
      </main>
      {data && <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#deded4] bg-[#f3f3ec]/95 px-4 py-3 backdrop-blur-md md:left-[260px]"><div className="mx-auto flex max-w-[1080px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-[10px] text-[#687062]"><span className="mr-1.5 inline-block size-2 rounded-full bg-[#85c254]" />Pemberi pertimbangan terpilih: <b className="text-[#15240a]">{selected?.display_name || "Belum dipilih"}{selected ? ` (${selected.role})` : ""}</b></p><div className="flex gap-2"><Link to={`/farmer/lands/${landId}/optional-review`} className="flex-1 rounded-xl bg-white px-5 py-2.5 text-center text-xs font-bold shadow-sm sm:flex-none">Kembali</Link><button type="button" disabled={!selectedReviewer || sending || alreadyPending} onClick={() => void request()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#15240a] px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">{sending ? "Mengirim…" : alreadyPending ? "Permintaan Terkirim" : "Kirim Permintaan Review"}<ArrowRight size={14} /></button></div></div></div>}
    </div>
  </div>;
}

function EvidenceChip({ label }: { label: string }) { return <span className="flex items-center gap-1.5 rounded-lg border border-[#e2e5dd] bg-[#f7f8f4] px-2.5 py-2 text-[9px] text-[#566052]"><Check size={12} className="rounded-full bg-[#d7f2ae] p-0.5 text-[#4e8a2e]" />{label}</span>; }
function ReviewerCard({ reviewer, selected, onSelect }: { reviewer: ApiReviewerProfile; selected: boolean; onSelect: () => void }) { return <article className={`rounded-2xl border bg-white p-4 shadow-sm transition ${selected ? "border-[#213b13] ring-1 ring-[#213b13]" : "border-[#deded4] hover:border-[#85c254]"}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#dceec1] font-display text-sm font-bold text-[#496f2f]">{reviewer.display_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><h3 className="font-display text-sm font-bold">{reviewer.display_name}</h3><p className="mt-0.5 text-[10px] text-[#687062]">Pendamping pertanian · {reviewer.role}</p></div></div>{selected && <span className="rounded-full bg-[#213b13] px-2.5 py-1 text-[9px] font-bold text-white">✓ Dipilih</span>}</div><p className="mt-4 rounded-xl bg-[#f7f8f4] p-3 text-[10px] leading-4 text-[#687062]">“Membantu memberikan pertimbangan teknis sesuai kondisi lapangan dan pengalaman kelompok tani.”</p><div className="mt-4 flex items-center justify-between text-[10px] text-[#63913c]"><span><i className="mr-1 inline-block size-1.5 rounded-full bg-[#85c254]" />Aktif mendampingi kelompok</span><button type="button" onClick={onSelect} className={`rounded-lg border px-3 py-1.5 font-bold ${selected ? "border-[#213b13] text-[#213b13]" : "border-[#deded4] text-[#566052]"}`}>{selected ? "Terpilih" : "Pilih"}</button></div></article>; }
function SideLink({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) { return <Link to={to} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active ? "bg-[#1c2a13] text-white" : "text-[#44483f] hover:bg-[#edf4dc]"}`}>{icon}{label}</Link>; }
