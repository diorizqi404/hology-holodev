import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { AuthShell } from "../components/auth/AuthShell";
import { authApi, saveAuth } from "../lib/auth";

const STORAGE_KEY = "rembuktani.phone-verification.v1";

function pendingPhone(): string {
  try {
    return (JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as { phone?: string }).phone ?? "";
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return "";
  }
}

export function VerifyPhonePage() {
  const navigate = useNavigate();
  const [phone] = useState(pendingPhone);
  const [message, setMessage] = useState(phone ? `Kode dikirim ke WhatsApp ${phone}.` : "Sesi verifikasi tidak ditemukan. Silakan daftar kembali.");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = String(new FormData(event.currentTarget).get("token") ?? "").replace(/\D/g, "");
    if (!phone) return navigate("/register", { replace: true });
    if (!/^\d{6}$/.test(token)) return setMessage("Masukkan kode verifikasi 6 angka.");
    setLoading(true);
    try {
      const result = await authApi.verifyPhone(phone, token);
      saveAuth(result.session, result.user, true);
      sessionStorage.removeItem(STORAGE_KEY);
      navigate(result.user.role === "reviewer" ? "/reviewer/dashboard" : "/farmer/dashboard", { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Verifikasi gagal");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!phone || loading) return;
    setLoading(true);
    try {
      const result = await authApi.resendPhoneVerification(phone);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kode gagal dikirim ulang");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Verifikasi Nomor">
      <section className="relative mb-5 overflow-hidden rounded-2xl bg-[#213014] p-5 text-white shadow-sm">
        <div className="absolute -bottom-6 -right-6 size-32 rounded-full bg-[#85c254]/10 blur-xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#15240a]/60 px-2.5 py-1 text-xs font-semibold tracking-[.02em] text-[#98cf6a]"><MessageCircle size={13} /> WhatsApp</span><h2 className="mt-2 font-display text-2xl font-bold tracking-[-.025em]">Verifikasi nomor Anda</h2><p className="mt-1 font-display text-[15px] leading-[22px] text-[#bacda5]">Masukkan kode 6 angka yang<br />dikirim ke WhatsApp.</p></div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#15240a] text-[#98cf6a]"><ShieldCheck size={24} /></div>
        </div>
      </section>
      <form className="space-y-4 rounded-2xl bg-white p-5 shadow-sm" onSubmit={submit} noValidate>
        <AuthField name="token" label="Kode Verifikasi WhatsApp" icon={<ShieldCheck size={19} />} placeholder="6 angka" autoComplete="one-time-code" />
        <button type="submit" disabled={loading} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#85c254] font-semibold shadow-md transition hover:bg-[#94d162] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15240a]">{loading ? "Memverifikasi…" : "Verifikasi"} <ArrowRight size={17} /></button>
        <button type="button" disabled={!phone || loading} onClick={resend} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#f3f3ec] font-display text-sm font-semibold disabled:opacity-50">Kirim ulang kode WhatsApp</button>
        {message && <p className="rounded-lg bg-[#f3f3ec] p-3 font-display text-sm text-[#364c23]" role="status">{message}</p>}
      </form>
    </AuthShell>
  );
}
