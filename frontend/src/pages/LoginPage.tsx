import { 
  Leaf, LogIn, ShieldCheck, CheckCircle2, CloudRain, 
  Activity, Radio, Tractor, UserSquare2, Lock, Eye, EyeOff, Check 
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { authApi, saveAuth, getUser } from "../lib/auth"; // <-- Import getUser ditambahkan

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified") === "1";
  const loggedOut = searchParams.get("loggedOut") === "1";
  const localOnlyLogout = searchParams.get("localOnly") === "1";

  useEffect(() => {
    // 1. Cek recovery password (Reset Password)
    const recovery = new URLSearchParams(window.location.hash.slice(1));
    if (recovery.get("type") === "recovery" && recovery.get("access_token")) {
      navigate(`/reset-password${window.location.hash}`, { replace: true });
      return;
    }

    // 2. CEK JIKA SUDAH LOGIN (Mencegah user yang sudah login mengakses halaman login)
    // Menggunakan fungsi getUser() dari auth.ts Anda agar lebih bersih dan aman
    const user = getUser();
    if (user) {
      if (user.role === "reviewer") {
        navigate("/reviewer/dashboard", { replace: true });
      } else {
        navigate("/farmer/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identity = String(form.get("identity") ?? "").trim();
    const password = String(form.get("password") ?? "");
    
    if (!identity || !password) {
      setMessage("Nomor WhatsApp/email dan kata sandi wajib diisi.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const result = await authApi.login(identity, password);
      saveAuth(result.session, result.user, form.get("remember") === "on");
      
      // LOGIKA REDIRECT BERDASARKAN ROLE
      const userRole = result.user.role;
      
      let defaultDest = "/farmer/dashboard";
      if (userRole === "reviewer") {
        defaultDest = "/reviewer/dashboard";
      }

      // Jika ada location.state.from (misal dia terlempar dari halaman tertentu), kembalikan ke sana.
      // Jika tidak, gunakan defaultDest berdasarkan role.
      const destination = (location.state as { from?: string } | null)?.from || defaultDest;
      navigate(destination, { replace: true });
      
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login gagal, silakan periksa kredensial Anda.");
    } finally { 
      setLoading(false); 
    }
  }

  return (
    // Menggunakan min-h-screen agar tidak terpotong saat buka keyboard di HP
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#fafaf6] text-[#15240a] font-sans">
      
      {/* LEFT COLUMN - Hero Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-[#1c2a13] text-white p-8 xl:p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay" 
            alt="Sawah" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#15240a]/80 via-[#15240a]/50 to-[#15240a]"></div>
        </div>

        <div className="relative z-10 flex justify-between items-center w-full">
          <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-bold tracking-widest border border-white/10">
            <Leaf size={14} className="text-[#85c254]" /> REMBUKTANI
          </div>
          <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2 text-[10px] xl:text-xs font-bold border border-white/10 text-[#d9f59b]">
            <CheckCircle2 size={14} className="text-[#85c254]" /> Jaringan Tani Nasional
          </div>
        </div>

        <div className="relative z-10 w-full mx-auto mb-10 xl:mb-16">
          <h3 className="text-[#85c254] font-bold text-[10px] xl:text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
            <Leaf size={14} /> Ekosistem Presisi Tani
          </h3>
          <h1 className="text-4xl xl:text-[3rem] font-display font-bold leading-[1.1] mb-6">
            Kedaulatan musyawarah dan keputusan di tangan petani.
          </h1>
          <p className="text-sm xl:text-base text-[#d1d5c9] leading-relaxed mb-8 max-w-md">
            Platform terintegrasi yang menyatukan bukti agrometeorologi BMKG dengan kearifan lokal kelompok tani untuk langkah lapangan yang akurat.
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2.5 text-[10px] xl:text-xs font-semibold border border-white/10">
              <CloudRain size={14} className="text-[#3b82f6]" /> Bukti Otentik BMKG
            </span>
            <span className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2.5 text-[10px] xl:text-xs font-semibold border border-white/10">
              <Activity size={14} className="text-[#85c254]" /> Field Pulse Sederhana
            </span>
            <span className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-2.5 text-[10px] xl:text-xs font-semibold border border-white/10 mt-1">
              <ShieldCheck size={14} className="text-[#d97706]" /> Keputusan Mandor Berdaulat
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-[10px] xl:text-xs text-[#d1d5c9] font-medium">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-[#85c254] animate-pulse"></div>
            Stasiun Lapangan Subak Jatiluwih: Siap Tanam
          </div>
          <div>28°C • Kelembapan 82%</div>
        </div>
      </div>

      {/* RIGHT COLUMN - Login Form */}
      <div className="flex-1 flex flex-col justify-center relative p-6 sm:p-10 lg:p-16 xl:p-24 bg-[#fafaf6]">
        
        <div className="absolute top-6 right-6 lg:top-8 lg:right-10 flex items-center gap-2 rounded-full bg-white border border-[#deded4]/60 px-3.5 py-1.5 text-[10px] font-bold text-[#15240a] shadow-sm">
          <Radio size={12} className="text-[#85c254]" /> Mode Lapangan Aktif
        </div>

        <div className="flex lg:hidden items-center gap-2 mb-10 w-fit rounded-full bg-[#15240a] px-3 py-1.5 text-[10px] font-bold tracking-widest text-white">
          <Leaf size={12} className="text-[#85c254]" /> REMBUKTANI
        </div>

        <div className="max-w-[400px] w-full mx-auto">
          <div className="flex size-12 items-center justify-center rounded-[14px] bg-[#1c2a13] text-[#85c254] mb-6 shadow-md">
            <Tractor size={24} strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#15240a] mb-2">
            Selamat datang kembali
          </h1>
          <p className="text-[13px] sm:text-sm text-[#666a60] mb-8 leading-relaxed">
            Masuk ke RembukTani untuk mengelola keputusan petak Anda.
          </p>

          <form onSubmit={submit} noValidate className="space-y-5">
            {verified && (
              <p className="rounded-xl border border-[#bbf7d0]/60 bg-[#f0fdf4] p-3 text-xs font-semibold text-[#166534]" role="status">
                Email berhasil dikonfirmasi. Silakan masuk dengan akun Anda.
              </p>
            )}
            {loggedOut && (
              <p className="rounded-xl border border-[#bbf7d0]/60 bg-[#f0fdf4] p-3 text-xs font-semibold text-[#166534]" role="status">
                {localOnlyLogout ? "Anda sudah keluar dari perangkat ini. Server autentikasi tidak terjangkau, sehingga sesi server akan berakhir sesuai masa berlakunya." : "Anda berhasil keluar. Sesi perangkat dan sesi server telah diakhiri."}
              </p>
            )}

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#15240a] mb-2">
                Nomor WhatsApp atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#a4a99d]">
                  <UserSquare2 size={18} strokeWidth={1.8} />
                </div>
                <input
                  name="identity"
                  type="text"
                  placeholder="Contoh: 081234567890 atau nama@poktan.id"
                  className="w-full rounded-xl border border-[#deded4]/80 bg-white py-3.5 pl-11 pr-4 text-xs sm:text-sm text-[#15240a] outline-none transition-all hover:border-[#85c254]/50 focus:border-[#85c254] focus:ring-4 focus:ring-[#85c254]/10 placeholder:text-[#a4a99d]"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#15240a] mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[#a4a99d]">
                  <Lock size={18} strokeWidth={1.8} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded-xl border border-[#deded4]/80 bg-white py-3.5 pl-11 pr-12 text-xs sm:text-sm text-[#15240a] outline-none transition-all hover:border-[#85c254]/50 focus:border-[#85c254] focus:ring-4 focus:ring-[#85c254]/10 placeholder:text-[#a4a99d]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#a4a99d] hover:text-[#15240a] transition-colors outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex size-4 items-center justify-center rounded border border-[#deded4] bg-white transition-colors group-hover:border-[#85c254]">
                  <input name="remember" type="checkbox" defaultChecked className="peer sr-only" />
                  <div className="absolute inset-0 rounded bg-[#85c254] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                    <Check size={12} className="text-[#15240a]" strokeWidth={3} />
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#666a60]">Ingat saya di perangkat ini</span>
              </label>
              <Link to="/forgot-password" className="text-[10px] sm:text-[11px] font-bold text-[#15240a] hover:text-[#85c254] transition-colors">
                Lupa Kata Sandi?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#85c254] py-3.5 text-xs sm:text-sm font-bold text-[#15240a] shadow-[0_4px_14px_rgba(133,194,84,0.3)] transition-all hover:bg-[#98cf6a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(133,194,84,0.4)] disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {loading ? "Memeriksa akun…" : "Masuk"} <LogIn size={16} className="ml-1" />
            </button>

            {message && (
              <p className="mt-4 rounded-lg bg-[#fff1f2] border border-[#fecdd3]/60 p-3 text-[11px] sm:text-xs font-semibold text-[#9f1239] text-center" role="status">
                {message}
              </p>
            )}
          </form>

          <div className="flex items-center gap-3 my-8">
            <span className="h-px flex-1 bg-[#deded4]"></span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#a4a99d] uppercase tracking-widest">ATAU</span>
            <span className="h-px flex-1 bg-[#deded4]"></span>
          </div>

          <div className="text-center text-[11px] sm:text-xs text-[#666a60]">
            Belum punya akun? <Link to="/register" className="font-bold text-[#15240a] underline decoration-[#deded4] underline-offset-4 hover:decoration-[#85c254] transition-colors ml-1">Daftar</Link>
          </div>
        </div>

        <div className="mt-auto pt-12 lg:pt-16 text-center text-[9px] text-[#a4a99d]">
          Sistem Kedaulatan Petani Indonesia • Aksesibilitas Terstandar Lapangan
        </div>
      </div>
    </div>
  );
}
