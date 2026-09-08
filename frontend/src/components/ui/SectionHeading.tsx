type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  eyebrowClassName?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  eyebrowClassName = "text-lime-800",
  className = "",
}: SectionHeadingProps) {
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div
      className={`flex w-full max-w-2xl flex-col gap-2 ${alignClass} ${className}`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-wide ${eyebrowClassName}`}
      >
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl font-bold leading-tight text-lime-950 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-relaxed text-stone-700 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
