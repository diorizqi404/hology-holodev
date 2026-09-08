import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export function Section({
  id,
  children,
  className = "",
  containerClassName = "",
}: SectionProps) {
  return (
    <section id={id} className={`w-full ${className}`}>
      <div
        className={`mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 ${containerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
