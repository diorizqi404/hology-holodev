import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "lime" | "cyan" | "amber" | "demo" | "dark";
  className?: string;
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-stone-100 text-stone-700",
  lime: "bg-lime-200 text-lime-900",
  cyan: "bg-cyan-700/10 text-cyan-700",
  amber: "bg-amber-100 text-amber-800",
  demo: "bg-orange-100 text-orange-800",
  dark: "bg-lime-950 text-lime-300",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
