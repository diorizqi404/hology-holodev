import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../lib/auth";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    const { serverRevoked } = await authApi.logout();
    navigate(`/login?loggedOut=1${serverRevoked ? "" : "&localOnly=1"}`, { replace: true });
  };

  return <>
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={compact
        ? "flex size-9 items-center justify-center rounded-lg text-[#56652e] transition hover:bg-red-50 hover:text-red-700"
        : "flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"}
      aria-label="Keluar dari akun"
      title="Keluar dari akun"
    >
      <LogOut size={17}/>{!compact && "Keluar dari akun"}
    </button>

    {confirming && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1b03]/60 p-4 backdrop-blur-sm" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-sm rounded-2xl bg-[#fafaf6] p-6 text-[#15240a] shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-widest text-red-700">KONFIRMASI SESI</p><h2 id="logout-title" className="mt-1 font-display text-2xl font-bold">Keluar dari RembukTani?</h2></div><button type="button" onClick={() => setConfirming(false)} disabled={busy} aria-label="Batalkan logout" className="rounded-lg p-2 hover:bg-[#edf4dc]"><X size={19}/></button></div>
        <p className="mt-3 text-sm leading-6 text-[#56652e]">Sesi akun dan data proses yang belum disahkan di perangkat ini akan dibersihkan. Data lahan dan keputusan yang sudah tersimpan tetap aman.</p>
        <div className="mt-6 flex gap-3"><button type="button" onClick={() => setConfirming(false)} disabled={busy} className="flex-1 rounded-xl bg-[#edf4dc] px-4 py-3 text-sm font-bold disabled:opacity-50">Batal</button><button type="button" onClick={() => void logout()} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><LogOut size={16}/>{busy ? "Mengakhiri…" : "Ya, keluar"}</button></div>
      </section>
    </div>}
  </>;
}
