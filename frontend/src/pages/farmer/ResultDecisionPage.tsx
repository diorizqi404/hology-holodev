import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Bell, CheckCircle2, CloudRain, Database, History, Leaf, Menu, Sprout, UserCircle2, Users, Warehouse, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErrorCard, LoadingCard } from "../../components/farmer/WorkflowLayout";
import { ensureAssessment, readWorkflow, type WorkflowData } from "../../lib/decision-workflow";
import { farmerApi, type ApiTrustedReview } from "../../services/farmer-api";
import { getUser } from "../../lib/auth";

export function ResultDecisionPage() {
  const { landId = "" } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [data, setData] = useState<WorkflowData>();
  const [reviews, setReviews] = useState<ApiTrustedReview[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const workflow = readWorkflow(landId);

  useEffect(() => {
    if (!landId) return;
    ensureAssessment(landId).then(async (nextData) => {
      setData(nextData);
      setReviews(await farmerApi.listReviews(nextData.decisionCase.id));
    }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Hasil keputusan gagal dimuat"));
  }, [landId]);

  const selectedAction = data?.result.options.find((option) => option.id === workflow.option_id)
    ?? data?.result.options.find((option) => option.id === data.decisionCase.selected_action_option_id)
    ?? data?.result.options.find((option) => option.title === workflow.option_title);
  const completedReview = reviews.find((review) => review.status !== "pending");
  const hasReviewRequest = Boolean(workflow.reviewer_id || data?.decisionCase.status === "review_pending" || reviews.length);
  const isReviewPending = hasReviewRequest && !completedReview;
  const reviewerName = completedReview?.reviewer?.display_name || String(workflow.reviewer_name || "Pendamping Tepercaya");
  const reviewerRole = completedReview?.reviewer?.role || String(workflow.reviewer_role || "Pendamping Lapangan");
  const location = data ? [data.land.village, data.land.regency].filter(Boolean).join(", ") : "Memuat wilayah";

  const confirm = async () => {
    if (!data) return;
    setSaving(true);
    setError("");
    const decisionText = selectedAction?.title || String(workflow.option_title || data.result.assessment.summary);
    try {
      const record = await farmerApi.createDecision(data.decisionCase.id, {
        assessment_id: data.result.assessment.id,
        selected_action_option_id: selectedAction?.id,
        decision_type: selectedAction ? "selected_option" : "custom",
        decision_text: decisionText,
        reason: selectedAction?.rationale || selectedAction?.description || data.result.assessment.summary,
        assessment_snapshot: data.result.assessment as unknown as Record<string, unknown>,
        evidence_snapshot: { count: data.evidence.length, types: data.evidence.map((item) => item.type) },
        evidence_ids: data.evidence.map((item) => item.id),
      });
      await farmerApi.createBrief(record.id);
      navigate(`/farmer/lands/${landId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Keputusan gagal disimpan");
    } finally {
      setSaving(false);
    }
  };

  return <div className="min-h-screen bg-[#f3f3ec] text-[#15240a]">{mobileNavOpen && <button type="button" className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" />}<Sidebar userName={user?.display_name || user?.displayName || "Pak Slamet"} mobileNavOpen={mobileNavOpen} closeMenu={() => setMobileNavOpen(false)} /><div className="md:ml-[260px]"><header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#deded4]/50 bg-[#f3f3ec]/90 px-4 backdrop-blur-md sm:px-8"><button type="button" className="rounded-md p-1.5 md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={20} /></button><span className="truncate rounded bg-[#e9fcb5] px-2.5 py-1 text-[10px] font-bold sm:text-xs">Wilayah: {location}</span><div className="flex items-center gap-4"><span className="hidden text-xs sm:block">☁ Cerah Berawan 28°C</span><Bell size={17} /><UserCircle2 size={18} /></div></header><main className="mx-auto max-w-[900px] px-4 pb-28 pt-6 sm:px-8"><Link to={`/farmer/lands/${landId}/final-decision`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#56652e]"><ArrowLeft size={14} />Kembali ke Keputusan Akhir</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5f803e]">Hasil tinjauan keputusan</p><h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em]">Keputusan Akhir Dibuat Oleh Anda</h1><p className="mt-2 text-sm text-[#666a60]">Ringkasan keputusan berdasarkan data lahan, evidence, action option, dan review dari database.</p></div><span className="rounded-full bg-white px-3 py-2 text-xs font-bold shadow-sm">{isReviewPending ? "Dalam Review" : "Siap Disahkan"}</span></div>{error && <div className="mt-5"><ErrorCard message={error} /></div>}{!data ? <div className="mt-5"><LoadingCard /></div> : <div className="mt-5 space-y-4"><section className="rounded-2xl border border-[#314b24] bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-[#e6f6d5] text-[#355d26]"><CheckCircle2 size={18} /></span><div><p className="text-[10px] uppercase tracking-wide text-[#77806f]">Pilihan tindakan final</p><h2 className="mt-1 text-lg font-bold">{selectedAction?.title || workflow.option_title || "Pilihan tindakan dari assessment"}</h2></div></div><div className="mt-4 rounded-xl bg-[#f7f8f4] p-4"><p className="text-[10px] font-bold text-[#777d73]">RINCIAN DARI DATA ANALISIS</p><p className="mt-2 text-sm leading-6 text-[#4a5444]">{selectedAction?.description || data.result.assessment.summary}</p><p className="mt-2 text-xs leading-5 text-[#687062]">Dasar pilihan: {selectedAction?.rationale || data.result.assessment.summary}</p></div></section><section className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e8] pb-3"><h2 className="flex items-center gap-2 text-sm font-bold"><span className={`size-2 rounded-full ${isReviewPending ? "bg-[#c58a1b]" : "bg-[#85c254]"}`} />Pertimbangan dari Pendamping Tepercaya</h2><span className="rounded-full bg-[#fff5d6] px-2 py-1 text-[10px] font-bold text-[#a16207]">{isReviewPending ? "Dalam Review" : hasReviewRequest ? "Masukan Baru Masuk" : "Tidak Diminta"}</span></div>{isReviewPending ? <div className="mt-4 rounded-xl border border-dashed border-[#deded4] bg-[#fafbf7] p-4"><p className="font-bold text-sm">{reviewerName}</p><p className="mt-1 text-xs text-[#73796f]">{reviewerRole} belum memberikan saran teknis lapangan.</p></div> : completedReview ? <div className="mt-4 rounded-xl border border-[#eadfb9] bg-[#fffdf2] p-4"><p className="text-xs font-bold">{reviewerName} <span className="font-normal text-[#777d73]">· {reviewerRole}</span></p><p className="mt-3 text-sm italic leading-6 text-[#4a4d3b]">“{completedReview.comment || "Reviewer menyetujui tindakan yang dipilih."}”</p></div> : <p className="mt-4 text-xs text-[#73796f]">Tidak ada pendamping yang diminta untuk keputusan ini.</p>}</section><section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-sm font-bold">Ringkasan Kondisi Terkini Lahan</h2><p className="mt-1 text-xs text-[#777d73]">{location} · {data.crop.crop_name} · fase {data.crop.growth_stage}</p><div className="mt-4 grid gap-3 sm:grid-cols-4"><DataTile icon={<CloudRain size={15} />} label="Cuaca BMKG" value={data.evidence.some((item) => item.type === "bmkg_forecast") ? "Tersedia" : "Belum tersedia"} /><DataTile icon={<Database size={15} />} label="Field Pulse" value={data.evidence.some((item) => item.type === "field_pulse") ? "Tersedia" : "Belum tersedia"} /><DataTile icon={<Leaf size={15} />} label="Tanaman" value={data.crop.crop_name} /><DataTile icon={<Users size={15} />} label="Evidence" value={`${data.evidence.length} data`} /></div></section></div>}<div className="mt-5 flex justify-end"><button type="button" disabled={saving} onClick={() => void confirm()} className="flex items-center gap-2 rounded-xl bg-[#85c254] px-5 py-3 text-sm font-bold text-[#15240a] disabled:opacity-50">{saving ? "Menyimpan…" : "Sahkan & Simpan ke Buku Petak"}<ArrowRight size={16} /></button></div></main></div></div>;
}
function DataTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-xl border border-[#e4e8df] bg-[#fafbf7] p-3"><span className="text-[#47762f]">{icon}</span><p className="mt-2 text-[10px] text-[#6d7764]">{label}</p><p className="mt-1 text-xs font-bold">{value}</p></div>; }
function Sidebar({ userName, mobileNavOpen, closeMenu }: { userName: string; mobileNavOpen: boolean; closeMenu: () => void }) { return <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-sm transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}><div><div className="mb-7 flex items-center justify-between px-2"><Link to="/farmer/dashboard" className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white"><Leaf size={15} className="text-[#85c254]" />REMBUKTANI</Link><button type="button" className="md:hidden" onClick={closeMenu} aria-label="Tutup menu"><X size={20} /></button></div><Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold">+ Tambah Lahan</Link><nav className="space-y-1"><SideLink to="/farmer/dashboard" icon={<Warehouse size={18} />} label="Beranda" /><SideLink to="/farmer/lands" icon={<Sprout size={18} />} label="Lahan" active /><SideLink to="/farmer/history" icon={<History size={18} />} label="Riwayat" /><SideLink to="/farmer/profile" icon={<UserCircle2 size={18} />} label="Profil" /></nav></div><div className="space-y-4"><div className="rounded-xl bg-[#e9fcb5] p-3"><p className="text-xs font-bold">● Sinkronisasi BMKG</p><p className="pl-3 text-[10px] text-[#56652e]">Data cuaca aktif</p></div><div className="flex items-center gap-2 px-1"><span className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white"><UserCircle2 size={15} /></span><div><p className="text-xs font-bold">{userName}</p><p className="text-[10px] text-[#666a60]">Ketua Poktan</p></div></div></div></aside>; }
function SideLink({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) { return <Link to={to} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active ? "bg-[#1c2a13] text-white" : "text-[#44483f] hover:bg-[#edf4dc]"}`}>{icon}{label}</Link>; }
