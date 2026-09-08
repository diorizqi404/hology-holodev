import { ArrowRight, AtSign, KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { AuthShell } from "../components/auth/AuthShell";
import { authApi } from "../lib/auth";

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    if (!email.includes("@")) { setMessage("Masukkan alamat email yang valid."); return; }
    setLoading(true); setMessage("");
    try {
      const result = await authApi.forgotPassword(email);
      setSuccess(true); setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tautan reset gagal dikirim.");
    } finally { setLoading(false); }
  }

  return <AuthShell title="Lupa Password">
    <section className="rounded-2xl bg-[#213014] p-5 text-white shadow-sm">
      <span className="flex size-11 items-center justify-center rounded-xl bg-[#85c254] text-[#15240a]"><KeyRound size={22} /></span>
      <h1 className="mt-4 font-display text-2xl font-bold">Pulihkan akses akun</h1>
      <p className="mt-2 font-display text-sm leading-6 text-[#bacda5]">Kami akan mengirim tautan aman untuk membuat kata sandi baru.</p>
    </section>
    <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      <AuthField name="email" type="email" label="Email Akun" icon={<AtSign size={20} />} placeholder="nama@email.com" autoComplete="email" />
      <button disabled={loading || success} className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] font-semibold disabled:opacity-60">{loading ? "Mengirim…" : success ? "Email telah dikirim" : "Kirim Tautan Reset"}<ArrowRight size={18} /></button>
      {message && <p role="status" className={`rounded-xl p-3 text-sm ${success ? "bg-[#e9fcb5] text-[#364c23]" : "bg-[#fff0ed] text-[#9f2d2d]"}`}>{message}</p>}
      <Link to="/login" className="block text-center text-sm font-semibold underline decoration-[#85c254]">Kembali ke Login</Link>
    </form>
  </AuthShell>;
}
