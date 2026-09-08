import { motion, useReducedMotion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "soft";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-lime-950 text-white shadow-[0px_2px_6px_0px_rgba(21,36,10,0.12)] hover:bg-lime-900",
  secondary:
    "bg-transparent text-lime-950 hover:bg-lime-100/60",
  ghost:
    "bg-transparent text-stone-700 hover:bg-stone-100",
  accent:
    "bg-lime-400 text-lime-950 shadow-md hover:bg-lime-300",
  soft:
    "bg-lime-200 text-lime-950 hover:bg-lime-300",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl px-4 py-2.5
        text-sm font-semibold tracking-tight
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        min-h-11
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}
