import type { ReactNode } from "react";
import { ArrowLeft, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../auth/LogoutButton";
import { WeatherStatus } from "./WeatherStatus";

export function WorkflowLayout({ landId, step, title, subtitle, children }: { landId: string; step: string; title: string; subtitle: string; children: ReactNode }) {
  return <div className="min-h-screen bg-[#f3f3ec] text-[#15240a]">
    <header className="sticky top-0 z-30 border-b border-[#deded4]/70 bg-[#fafaf6]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/farmer/dashboard" className="flex items-center gap-2 text-sm font-bold tracking-wider"><span className="flex size-8 items-center justify-center rounded-lg bg-[#15240a]"><Leaf size={17} className="text-[#85c254]"/></span>REMBUKTANI</Link>
        <div className="flex items-center gap-2 sm:gap-4"><WeatherStatus preferredLandId={landId}/><span className="rounded-full bg-[#e4f6b0] px-3 py-1 text-xs font-semibold">{step}</span><LogoutButton compact/></div>
      </div>
    </header>
    <main className="mx-auto max-w-[1100px] px-4 py-7 sm:px-8"><Link to={`/farmer/lands/${landId}`} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#56652e]"><ArrowLeft size={14}/>Kembali ke detail lahan</Link><div className="mb-7"><h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#56652e]">{subtitle}</p></div>{children}</main>
  </div>;
}
export function LoadingCard({ label = "Mengambil data terbaru…" }: { label?: string }) { return <div className="animate-pulse rounded-2xl bg-white p-8 text-sm text-[#56652e]">{label}</div>; }
export function ErrorCard({ message }: { message: string }) { return <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6"><b>Data tidak dapat dimuat</b><p className="mt-2 text-sm text-red-700">{message}</p></div>; }
