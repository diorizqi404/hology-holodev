import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Database,
  FileSearch,
  Leaf,
  Menu,
  Settings,
  Sprout,
  UserCircle2,
  Warehouse,
  X,
  CloudSun,
} from "lucide-react";
import { readLandDraft, updateLandDraft } from "../../lib/land-draft";

type LocationMethod = "satellite" | "device" | "village";

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col justify-between bg-[#fafaf6] p-5 shadow-[0_1px_4px_rgba(21,36,10,0.05)] transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div>
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 rounded-xl bg-[#15240a]/80 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-white">
            <Leaf size={15} className="text-[#85c254]" /> REMBUKTANI
          </div>
          <button className="md:hidden" onClick={onClose} aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>
        
        <a
          href="/farmer/lands"
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#85c254] px-4 py-3 text-sm font-semibold text-[#15240a] shadow-sm hover:bg-[#98cf6a]"
        >
          <span className="text-lg leading-none">+</span> Tambah Lahan
        </a>
        
        <nav className="space-y-1">
          <a
            href="/farmer/dashboard"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#44483f] hover:bg-[#edf4dc]"
          >
            <Warehouse size={18} /> Beranda
          </a>
          <a
            href="/farmer/lands"
            className="flex w-full items-center gap-3 rounded-xl bg-[#213014] px-4 py-3 font-display text-sm font-bold text-white"
          >
            <Sprout size={18} /> Lahan
          </a>
          <a href="/farmer/history" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#44483f] hover:bg-[#edf4dc]">
            <FileSearch size={18} /> Riwayat
          </a>
          <a href="/farmer/profile" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#44483f] hover:bg-[#edf4dc]">
            <UserCircle2 size={18} /> Profil
          </a>
        </nav>
      </div>

      <div className="space-y-4 px-1">
        <div className="flex items-center gap-3 rounded-xl bg-[#e9fcb5] p-3">
          <span className="size-2.5 rounded-full bg-[#85c254]" />
          <div>
            <p className="text-xs font-bold">Sinkronisasi BMKG</p>
            <p className="text-xs text-[#44483f]">Aktif setelah ADM4 terverifikasi</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white">
              <UserCircle2 size={15} />
            </div>
            <div>
              <p className="text-xs font-bold">Akun aktif</p>
              <p className="text-xs text-[#44483f]">Data dari sesi login</p>
            </div>
          </div>
          <Settings size={18} className="text-[#44483f]" />
        </div>
      </div>
    </aside>
  );
}

export function AddLandPage() {
  const initialDraft = readLandDraft();
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState(initialDraft.name || "");
  const [area, setArea] = useState(initialDraft.area || "");
  const [method] = useState<LocationMethod>(
    (initialDraft.locationMethod as LocationMethod) || "satellite"
  );
  const [notice, setNotice] = useState("");

  const continueToLocation = () => {
    if (!name.trim()) {
      setNotice("Nama petak perlu diisi sebelum memilih lokasi.");
      return;
    }
    updateLandDraft({ name: name.trim(), area: area.trim(), locationMethod: method });
    window.location.href = "/farmer/lands/new/location";
  };

  return (
    <div className="min-h-screen min-w-[300px] bg-[#f3f3ec] text-[#15240a]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="md:pl-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#deded4]/60 bg-[#fafaf6]/90 px-4 shadow-sm backdrop-blur-xl sm:px-8">
          <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Buka menu">
            <Menu size={22} />
          </button>
          <span className="rounded bg-[#e4f6b0] px-2 py-1 text-xs font-semibold">
            Lokasi dipilih pada langkah berikutnya
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden items-center gap-2 text-xs font-semibold text-[#44483f] sm:flex">
              <CloudSun size={18} /> BMKG setelah lokasi terverifikasi
            </span>
            <Bell size={17} className="text-[#44483f]" />
            <div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white">
              <UserCircle2 size={15} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto flex max-w-[760px] flex-col items-center px-4 py-8 sm:px-8 lg:py-12">
          <div className="w-full max-w-[680px] space-y-6">
            
            {/* Top Navigation */}
            <div className="flex items-center justify-between gap-3">
              <a href="/farmer/lands" className="flex items-center gap-2 text-sm font-semibold text-[#364c23] hover:text-[#15240a]">
                <ArrowLeft size={14} /> Kembali ke Daftar Lahan
              </a>
              <span className="flex shrink-0 items-center gap-2 rounded-full bg-[#e4f6b0] px-3 py-1 text-xs font-semibold">
                <span className="size-2 rounded-full bg-[#85c254]" /> Langkah 1 dari 3
              </span>
            </div>

            {/* Title Section */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Daftarkan Petak Sawah Baru
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#44483f]">
                Tambahkan nama petak dan tentukan metode penentuan lokasi agar sistem dapat menyelaraskan stasiun cuaca BMKG terdekat.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              onSubmit={(event) => {
                event.preventDefault();
                continueToLocation();
              }}
              className="space-y-6 rounded-3xl bg-white p-5 shadow-[0_8px_24px_-4px_rgba(21,36,10,0.06)] sm:p-8"
            >
              {/* Land Name Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="land-name" className="text-sm font-semibold">
                    Nama Petak Sawah <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <span className="text-xs text-[#44483f]">Wajib diisi</span>
                </div>
                <input
                  id="land-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNotice("");
                  }}
                  placeholder="Masukkan nama pengenal petak..."
                  className="h-13 w-full rounded-xl bg-[#f3f3ec] px-4 py-3 text-sm outline-none ring-[#85c254] placeholder:text-[#75786e] focus:ring-2"
                />
                <p className="text-xs font-semibold text-[#44483f]">
                  Contoh: Blok Tirto A3, Petak Kulon Bawah
                </p>
              </div>

              {/* Land Area Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="land-area" className="text-sm font-semibold">
                    Perkiraan Luas Lahan <span className="font-normal text-[#44483f]">(Opsional)</span>
                  </label>
                  <span className="text-xs text-[#44483f]">Bisa diubah nanti</span>
                </div>
                <div className="relative">
                  <input
                    id="land-area"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    placeholder="Misal: 0.85 Ha"
                    className="h-13 w-full rounded-xl bg-[#f3f3ec] px-4 py-3 pr-28 text-sm outline-none ring-[#85c254] placeholder:text-[#75786e] focus:ring-2"
                  />
                  <span className="absolute right-3 top-2.5 rounded-lg bg-[#e4f6b0] px-3 py-1.5 text-xs font-semibold">
                    Ha / Ubin
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#44483f]">
                  Hektar (Ha) atau Bau/Ubin
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#85c254] text-sm font-semibold text-[#15240a] shadow-[0_4px_6px_rgba(133,194,84,0.3)] transition-colors hover:bg-[#98cf6a]"
                >
                  Lanjut ke Pemilihan Lokasi <ArrowRight size={16} />
                </button>
                <a
                  href="/farmer/lands"
                  className="flex h-14 items-center justify-center rounded-xl px-6 text-sm font-semibold text-[#364c23] hover:bg-[#f3f3ec]"
                >
                  Batal
                </a>
              </div>

              {/* Notice Message */}
              {notice && (
                <p
                  role="status"
                  className={`rounded-xl px-4 py-3 text-xs font-semibold ${
                    name.trim() ? "bg-[#e9fcb5] text-[#364c23]" : "bg-[#fff0ed] text-[#9f2d2d]"
                  }`}
                >
                  {notice}
                </p>
              )}
            </motion.form>

            {/* Privacy Notice Block */}
            <div className="flex w-full items-start gap-3 rounded-xl bg-[#e9fcb5]/60 p-4 text-xs leading-5 text-[#44483f]">
              <Database size={17} className="mt-0.5 shrink-0 text-[#364c23]" />
              <p>
                <strong className="text-[#15240a]">Prinsip Privasi Data Petani:</strong> Lokasi
                petak sawah Anda hanya digunakan untuk mengambil data cuaca BMKG dan riwayat
                irigasi kelompok tani. Data kepemilikan tidak disebarluaskan.
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
