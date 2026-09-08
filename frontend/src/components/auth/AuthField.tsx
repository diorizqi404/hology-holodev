import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ReactNode;
  hint?: ReactNode;
  error?: string;
  onToggleVisibility?: () => void;
};

export function AuthField({
  label,
  icon,
  hint,
  error,
  onToggleVisibility,
  type,
  ...props
}: AuthFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 flex min-h-[20px] items-center justify-between gap-3 text-sm font-semibold tracking-[0.01em]">
        <span>{label}</span>
        {hint}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-[#56652e]" aria-hidden="true">
          {icon}
        </span>
        <input
          {...props}
          type={type}
          aria-invalid={Boolean(error)}
          className={`h-[54px] w-full rounded-xl bg-white pl-12 ${onToggleVisibility ? "pr-12" : "pr-4"} font-display text-base text-[#15240a] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none ring-1 transition placeholder:text-[#75786e]/60 focus:ring-2 focus:ring-[#85c254] ${error ? "ring-red-500" : "ring-[#15240a]/[0.04]"}`}
        />
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-[#56652e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#85c254]"
            aria-label={type === "password" ? "Tampilkan kata sandi" : "Sembunyikan kata sandi"}
          >
            {type === "password" ? <Eye size={21} /> : <EyeOff size={21} />}
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-xs font-medium text-red-700" role="alert">{error}</span>}
    </label>
  );
}
