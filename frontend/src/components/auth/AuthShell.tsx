import { ArrowLeft, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type AuthShellProps = {
  title: string;
  children: ReactNode;
};

export function AuthShell({ title, children }: AuthShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#e8ecdf] text-[#15240a] sm:px-4">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f3f3ec] pt-16 shadow-[0_0_48px_rgba(21,36,10,0.12)]">
        <header className="fixed inset-x-0 top-0 z-20 mx-auto h-16 w-full max-w-[430px] border-b border-[#15240a]/5 bg-[#f3f3ec]/90 px-4 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="-ml-1 flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#85c254]"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
            <h1 className="font-display text-lg font-semibold">{title}</h1>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#0d1b03] text-white" aria-hidden="true">
              <UserRound size={14} />
            </div>
          </div>
        </header>
        <main className="auth-content-enter px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">{children}</main>
      </div>
    </div>
  );
}
