import { Check, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthField } from "../components/auth/AuthField";
import { AuthShell } from "../components/auth/AuthShell";
import { authApi } from "../lib/auth";

export function ResetPasswordPage() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get("access_token") || new URLSearchParams(window.location.search).get("access_token") || "";
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(accessToken ? "" : "Tautan reset tidak valid atau sudah kedaluwarsa.");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password.length < 8) { setMessage("Kata sandi minimal 8 karakter."); return; }
    if (password !== confirmation) { setMessage("Konfirmasi kata sandi belum sama."); return; }
    setLoading(true); setMessage("");
    try {
      const result = await authApi.resetPassword(accessToken, password);
      setSuccess(true); setMessage(result.message);
      window.history.replaceState(null, "", "/reset-password");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Password gagal diperbarui."); }
    finally { setLoading(false); }
  }

  return <AuthShell title="Password Baru">
    <section className="rounded-2xl bg-[#213014] p-5 text-white"><LockKeyhole className="text-[#85c254]" size={28} /><h1 className="mt-3 font-display text-2xl font-bold">Buat kata sandi baru</h1><p className="mt-2 text-sm text-[#bacda5]">Gunakan minimal 8 karakter yang mudah Anda ingat dan tidak digunakan di layanan lain.</p></section>
    <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
      {!success && <><AuthField name="password" label="Kata Sandi Baru" icon={<LockKeyhole size={19} />} type={show ? "text" : "password"} placeholder="Minimal 8 karakter" autoComplete="new-password" onToggleVisibility={() => setShow(v => !v)} /><AuthField name="confirmation" label="Konfirmasi Kata Sandi" icon={<Check size={19} />} type={show ? "text" : "password"} placeholder="Ulangi kata sandi" autoComplete="new-password" /><button disabled={loading || !accessToken} className="h-14 w-full rounded-xl bg-[#85c254] font-semibold disabled:opacity-60">{loading ? "Menyimpan…" : "Simpan Password Baru"}</button></>}
      {message && <p role="status" className={`rounded-xl p-3 text-sm ${success ? "bg-[#e9fcb5] text-[#364c23]" : "bg-[#fff0ed] text-[#9f2d2d]"}`}>{message}</p>}
      {success && <Link to="/login" className="flex h-12 items-center justify-center rounded-xl bg-[#15240a] font-semibold text-white">Masuk dengan Password Baru</Link>}
    </form>
  </AuthShell>;
}
