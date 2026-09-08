import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, AtSign, Bike, CheckCircle2, CloudRain, Leaf, LockKeyhole, Radio, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { authApi, saveAuth } from "../lib/auth";
import heroImage from "../assets/images/hero.jpg";

type Role = "farmer" | "reviewer";

export function RegisterPage() {
  const [role, setRole] = useState<Role>("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    const displayName = String(form.get("name") ?? "").trim();
    const identity = String(form.get("identity") ?? "").trim();
    if (!displayName || !identity || password.length < 8) return setError("Lengkapi data dan gunakan kata sandi minimal 8 karakter.");
    if (password !== confirmation) return setError("Konfirmasi kata sandi belum sama.");
    if (!form.get("consent")) return setError("Persetujuan penggunaan dan perlindungan data wajib dipilih.");
    setLoading(true);
    setError("");
    try {
      const result = await authApi.register({ displayName, identity, password, role });
      if (result.session) {
        saveAuth(result.session, result.user, true);
        navigate(role === "reviewer" ? "/reviewer/dashboard" : "/farmer/dashboard", { replace: true });
      } else if (result.verificationChannel === "whatsapp" && result.verificationTarget) {
        sessionStorage.setItem("rembuktani.phone-verification.v1", JSON.stringify({ phone: result.verificationTarget }));
        navigate("/verify-phone", { replace: true });
      } else {
        setError("Akun dibuat. Periksa email untuk verifikasi, lalu masuk.");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Pendaftaran gagal");
    } finally { setLoading(false); }
  }

  return <div className="min-h-screen w-full bg-[#f3f3ec] text-[#15240a] lg:flex">
    <section className="relative hidden min-h-screen overflow-hidden bg-[#15240a] text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-10 xl:p-12"><img src={heroImage} alt="Lanskap persawahan" className="absolute inset-0 size-full object-cover opacity-40 mix-blend-luminosity" /><div className="absolute inset-0 bg-gradient-to-b from-[#15240a]/75 via-[#15240a]/55 to-[#15240a]" /><div className="relative z-10 flex items-center justify-between"><span className="flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em]"><Leaf size={13} className="text-[#85c254]" />REMBUKTANI</span><span className="flex items-center gap-1.5 rounded-full bg-[#85c254]/15 px-3 py-1.5 text-[10px] font-semibold text-[#b8e67e]"><CheckCircle2 size={13} /> Jaringan Tani Nasional</span></div><div className="relative z-10 max-w-xl"><p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a8db69]"><Leaf size={14} /> Ekosistem Presisi Tani</p><h2 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.045em] xl:text-5xl">Kedaulatan musyawarah dan keputusan di tangan petani.</h2><p className="mt-5 max-w-md text-sm leading-6 text-[#d3ddcd]">Platform terintegrasi yang menyatukan bukti agrometeorologi BMKG dengan kearifan lokal kelompok tani untuk langkah lapangan yang akurat.</p><div className="mt-6 flex flex-wrap gap-2"><Feature icon={<CloudRain size={13} />} label="Bukti Otentik BMKG" /><Feature icon={<Radio size={13} />} label="Field Pulse Sederhana" /><Feature icon={<ShieldCheck size={13} />} label="Keputusan Mandor Berdaulat" /></div></div><div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-[10px] text-[#cdd8c8]"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#85c254]" />Stasiun Lapangan Subak Jatiluwih: Siap Tanam</span><span>28°C · Kelembapan 82%</span></div></section>
    <section className="relative flex min-h-screen flex-1 flex-col justify-center bg-[#fafaf6] px-5 py-8 sm:px-10 lg:px-14 xl:px-24"><span className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold shadow-sm"><Radio size={12} className="text-[#85c254]" /> Registrasi Cepat 1 Menit</span><div className="mx-auto w-full max-w-[520px]"><div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-[#213014] text-[#85c254] lg:hidden"><Bike size={21} /></div><div className="mb-6"><div className="mb-4 hidden size-10 items-center justify-center rounded-xl bg-[#213014] text-[#85c254] lg:flex"><Bike size={21} /></div><h1 className="font-display text-2xl font-bold tracking-[-0.035em] sm:text-3xl">Buat akun Rembuk Tani</h1><p className="mt-1 text-sm text-[#666a60]">Masuk ke RembukTani untuk mengelola keputusan petak Anda.</p></div><form className="space-y-4" onSubmit={submit} noValidate><fieldset><legend className="mb-2 text-xs font-bold">Pilih Peran Anda di RembukTani</legend><div className="space-y-2"><RoleCard selected={role === "farmer"} onClick={() => setRole("farmer")} icon={<Bike size={18} />} title="Petani / Ketua Kelompok Tani" description="Untuk pemilik petak sawah, penggarap, dan ketua poktan yang mengelola giliran air, catatan lahan, dan keputusan tindakan sawah." badge="PRAKTISI LAPANGAN" /><RoleCard selected={role === "reviewer"} onClick={() => setRole("reviewer")} icon={<UsersRound size={18} />} title="Reviewer / Ahli Pertanian" description="Untuk Penyuluh Pertanian Lapangan (PPL), akademisi, atau pakar agrikultur yang memberikan masukan objektif dan tinjauan rekomendasi." badge="KONSULTASI & VALIDASI" /></div></fieldset><input type="hidden" name="role" value={role} /><div className="grid gap-3 sm:grid-cols-2"><AuthField name="name" label="Nama Lengkap" icon={<UserRound size={16} />} placeholder="Pak Slamet / Ibu Sri" autoComplete="name" /><AuthField name="identity" label="Nomor WhatsApp atau Email" icon={<AtSign size={17} />} placeholder="0812-XXXX-XXXX atau nama@email.com" autoComplete="username" /></div><p className="-mt-1 flex items-center gap-1.5 text-[10px] text-[#697260]"><ShieldCheck size={13} className="text-[#6da63e]" />Pemberitahuan cuaca darurat BMKG dapat dikirim via WhatsApp gratis.</p><div className="grid gap-3 sm:grid-cols-2"><AuthField name="password" label="Kata Sandi" icon={<LockKeyhole size={16} />} placeholder="Min. 8 karakter" type={showPassword ? "text" : "password"} autoComplete="new-password" onToggleVisibility={() => setShowPassword((value) => !value)} /><AuthField name="confirmation" label="Konfirmasi Kata Sandi" icon={<ShieldCheck size={16} />} placeholder="Ulangi kata sandi" type={showConfirmation ? "text" : "password"} autoComplete="new-password" onToggleVisibility={() => setShowConfirmation((value) => !value)} /></div><label className="flex items-start gap-2 text-xs leading-5 text-[#596052]"><input name="consent" type="checkbox" className="mt-1 size-4 shrink-0 accent-[#85c254]" /><span>Saya menyetujui ketentuan penggunaan dan prinsip perlindungan data petani.</span></label><button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] text-sm font-bold shadow-[0_4px_14px_rgba(133,194,84,0.28)] transition hover:bg-[#98cf6a] disabled:cursor-wait disabled:opacity-70">{loading ? "Membuat akun…" : "Daftar Akun RembukTani"}<ArrowRight size={16} /></button>{error && <p className="rounded-lg bg-[#fff1f2] p-3 text-xs font-semibold text-[#9f1239]" role="status">{error}</p>}</form><div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-[#deded4]" /><span className="text-[9px] font-bold tracking-widest text-[#a4a99d]">ATAU</span><span className="h-px flex-1 bg-[#deded4]" /></div><p className="text-center text-xs text-[#666a60]">Sudah punya akun? <Link to="/login" className="font-bold underline decoration-[#85c254] underline-offset-4">Masuk</Link></p><p className="mt-8 text-center text-[9px] text-[#a4a99d]">Sistem Kedaulatan Petani Indonesia · Aksesibilitas Terstandar Lapangan</p></div></section>
  </div>;
}

function Feature({ icon, label }: { icon: ReactNode; label: string }) { return <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-2 text-[10px] font-semibold text-[#e0e8da]">{icon}{label}</span>; }
function RoleCard({ selected, onClick, icon, title, description, badge }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; description: string; badge: string }) { return <button type="button" role="radio" aria-checked={selected} onClick={onClick} className={`relative flex w-full gap-3 rounded-xl p-3 text-left transition ${selected ? "border-2 border-[#85c254] bg-[#e9fcb5]/60" : "border border-[#c5c8bc] bg-[#fafaf6] hover:border-[#85c254]/60"}`}><span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-[#15240a] text-[#98cf6a]" : "bg-[#15240a]/10 text-[#364c23]"}`}>{icon}</span><span className="min-w-0 pr-5"><span className="flex flex-wrap items-center gap-1.5 text-xs font-bold">{title}<span className="rounded-full bg-[#85c254]/25 px-1.5 py-0.5 text-[8px]">{badge}</span></span><span className="mt-1 block text-[10px] leading-4 text-[#596052]">{description}</span></span><span className={`absolute right-3 top-3 flex size-4 items-center justify-center rounded-full border-2 ${selected ? "border-[#15240a]" : "border-[#c5c8bc]"}`}>{selected && <span className="size-2 rounded-full bg-[#15240a]" />}</span></button>; }
