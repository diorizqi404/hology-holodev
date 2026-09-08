import { ArrowLeft, ArrowRight, Bell, Check, ChevronRight, Cloud, FileText, History, Leaf, Menu, Sprout, UserCircle2, Users, Warehouse, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorCard, LoadingCard } from "../../components/farmer/WorkflowLayout";
import { getUser } from "../../lib/auth";
import { ensureAssessment, type WorkflowData } from "../../lib/decision-workflow";
import { WeatherStatus } from "../../components/farmer/WeatherStatus";
import { LogoutButton } from "../../components/auth/LogoutButton";
import { farmerApi, type ApiTrustedReview } from "../../services/farmer-api";
import { useEffect, useState, type ReactNode } from "react";

export function OptionalReviewPage() {
  const { landId = "" } = useParams();
  const user = getUser();
  const [data, setData] = useState<WorkflowData>();
  const [reviews, setReviews] = useState<ApiTrustedReview[]>([]);
  const [error, setError] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!landId) return;
    ensureAssessment(landId)
      .then(async (nextData) => {
        setData(nextData);
        setReviews(await farmerApi.listReviews(nextData.decisionCase.id));
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Data gagal dimuat"));
  }, [landId]);

  const hasPendingReview = reviews.some((review) => review.status === "pending") || data?.decisionCase.status === "review_pending";

  return <div className="min-h-screen bg-[#f5f5ef] text-[#15240a]">
    {mobileNavOpen && <button type="button" className="fixed inset-0 z-30 bg-[#15240a]/30 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between border-r border-[#e4e5dc] bg-[#fbfbf8] p-5 transition-transform duration-300 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div>
        <div className="mb-6 flex items-center justify-between px-2">
          <Link to="/farmer/dashboard" className="flex items-center gap-1.5 rounded-lg bg-[#68735a] px-2.5 py-1.5 text-[9px] font-bold tracking-[0.13em] text-white"><Leaf size={13} className="fill-[#a9de74] text-[#a9de74]" />REMBUKTANI</Link>
          <button type="button" className="rounded-lg p-1.5 md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Tutup menu"><X size={20} /></button>
        </div>
        <Link to="/farmer/lands/new" className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#83c64f] px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-[#74b542]"><span className="text-lg leading-none">+</span> Tambah Lahan</Link>
        <nav className="space-y-1">
          <SideLink to="/farmer/dashboard" icon={<Warehouse size={16} />} label="Beranda" />
          <SideLink to="/farmer/lands" icon={<Sprout size={16} />} label="Lahan" active />
          <SideLink to="/farmer/history" icon={<History size={16} />} label="Riwayat" />
          <SideLink to="/farmer/profile" icon={<UserCircle2 size={16} />} label="Profil" />
        </nav>
      </div>
      <div className="space-y-4 px-0.5">
        <div className="rounded-lg bg-[#e9fcb5] px-3 py-2.5"><div className="flex items-center gap-1.5 text-[10px] font-bold"><span className="size-1.5 rounded-full bg-[#83c64f]" />Sinkronisasi BMKG</div><p className="mt-0.5 pl-3 text-[10px] text-[#56652e]">Data cuaca aktif</p></div>
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-full bg-[#15240a] text-white"><UserCircle2 size={16} /></span><div><p className="text-[10px] font-bold">{user?.display_name || user?.displayName || "Sahabat Tani"}</p><p className="text-[9px] text-[#7b8174]">Petani</p></div></div><LogoutButton compact /></div>
      </div>
    </aside>

    <div className="md:pl-[260px]">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e4e5dc] bg-[#fbfbf8]/95 px-4 backdrop-blur sm:px-8">
        <button type="button" className="rounded-lg p-1.5 md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu"><Menu size={21} /></button>
        <span className="max-w-[58%] truncate rounded bg-[#e5f7af] px-2 py-1 text-[10px] font-semibold">Wilayah: {data ? [data.land.village, data.land.regency].filter(Boolean).join(", ") : "Memuat wilayah"}</span>
        <div className="flex items-center gap-4"><span className="hidden sm:block"><WeatherStatus preferredLandId={landId} /></span><Bell size={16} /><Link to="/farmer/profile" className="flex size-7 items-center justify-center rounded-full bg-[#15240a] text-white" aria-label="Buka profil"><UserCircle2 size={15} /></Link></div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 pb-6 pt-5 sm:px-8">
        <div className="flex items-center gap-1.5 text-[10px] text-[#657052]"><span>Lahan</span><ChevronRight size={12} /><span>{data?.land.name || "Memuat lahan"}</span><ChevronRight size={12} /><b>Rembuk & Konsultasi Pilihan</b></div>
        <div className="mt-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f8b5] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#426f25]"><span className="size-1.5 rounded-full bg-[#62a83c]" />MUSYAWARAH MANDIRI</span><h1 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.045em] sm:text-[34px]">Apakah Anda Perlu Meminta Masukan Tambahan?</h1><p className="mt-1.5 max-w-3xl text-sm leading-5 text-[#60675b]">Musyawarah adalah ikhtiar pendukung. Anda dapat meminta tinjauan cepat dari Penyuluh Pertanian Lapangan (PPL) atau langsung mengesahkan tindakan sawah secara mandiri.</p></div>

        {error ? <div className="mt-5"><ErrorCard message={error} /></div> : !data ? <div className="mt-5"><LoadingCard /></div> : <>
          <div className="mt-5 grid max-w-[860px] gap-5 md:grid-cols-2">
            <section className="flex min-h-[296px] flex-col rounded-2xl bg-white p-5 shadow-[0_3px_14px_rgba(21,36,10,0.09)]"><div className="flex items-start justify-between"><span className="flex size-9 items-center justify-center rounded-xl bg-[#e9fcb5] text-[#456c2d]"><Users size={19} /></span><span className="rounded-full bg-[#f1f3ee] px-2.5 py-1 text-[9px] font-medium text-[#777d73]">{hasPendingReview ? "Menunggu review" : "Didiskusikan"}</span></div><h2 className="mt-4 font-display text-lg font-bold">Minta Pertimbangan</h2><p className="mt-1.5 text-[11px] leading-4 text-[#6b7066]">Dapatkan masukan dari pihak terpercaya sebelum membuat keputusan.</p><div className="mt-4 rounded-lg border border-[#e6e8e2] bg-[#f5f6f2] p-3"><p className="text-[9px] font-bold tracking-wide text-[#525a4c]">YANG AKAN DITERUSKAN KE REVIEWER:</p><ul className="mt-1.5 space-y-1 text-[9px] text-[#47513f]"><ReviewItem label="Kondisi lahan aktual" /><ReviewItem label="Informasi cuaca terkini (BMKG)" /><ReviewItem label="Analisis RembukTani" /></ul></div><Link to={`/farmer/lands/${landId}/select-reviewer`} className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-[#15240a] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#294218]">Minta Review <ArrowRight size={15} /></Link></section>
            <section className="flex min-h-[296px] flex-col rounded-2xl bg-white p-5 shadow-[0_3px_14px_rgba(21,36,10,0.09)]"><div className="flex items-start justify-between"><span className="flex size-9 items-center justify-center rounded-xl bg-[#e9fcb5] text-[#456c2d]"><FileText size={18} /></span><span className="rounded-full bg-[#e9fcb5] px-2.5 py-1 text-[9px] font-medium text-[#476d2d]">Mandiri</span></div><h2 className="mt-4 font-display text-lg font-bold">Buat Keputusan Sendiri</h2><p className="mt-1.5 text-[11px] leading-4 text-[#6b7066]">Tentukan langkah berdasarkan pengalaman dan kondisi lapangan Anda.</p><div className="mt-4 flex gap-2 rounded-lg border border-[#e6e8e2] bg-[#f5f6f2] p-3 text-[9px] leading-4 text-[#4a5444]"><Cloud size={13} className="mt-0.5 shrink-0" /><p><b>Otoritas manusia penuh:</b> Rekomendasi sistem hanyalah pertimbangan; petani tetap memiliki keputusan final yang disimpan dalam riwayat lahan.</p></div><Link to={`/farmer/lands/${landId}/final-decision`} className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-[#83c64f] px-4 py-3 text-xs font-bold text-[#15240a] transition hover:bg-[#74b542]">Buat Keputusan <FileText size={14} /></Link></section>
          </div>
          <div className="mt-7 flex flex-col justify-between gap-3 rounded-lg bg-white/75 px-4 py-3 text-[10px] text-[#687062] sm:flex-row sm:items-center"><span className="flex items-center gap-2"><Leaf size={14} className="text-[#83c64f]" />Penyuluh lapangan dapat melihat log keputusan Anda sewaktu-waktu di dasbor kelompok tani.</span><Link to={`/farmer/lands/${landId}/action-alternatives`} className="inline-flex items-center gap-1 font-semibold text-[#536d39]"><ArrowLeft size={13} />Kembali ke Perbandingan Opsi</Link></div>
        </>}
      </main>
    </div>
  </div>;
}

function ReviewItem({ label }: { label: string }) {
  return <li className="flex items-center gap-1.5"><Check size={11} className="rounded-full bg-[#d7f2ae] p-[1px] text-[#528832]" />{label}</li>;
}

function SideLink({ to, icon, label, active = false }: { to: string; icon: ReactNode; label: string; active?: boolean }) {
  return <Link to={to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[#203413] text-white" : "text-[#3e463b] hover:bg-[#eff3e7]"}`}>{icon}{label}</Link>;
}
