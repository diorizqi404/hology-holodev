const stats = [
  {
    title: "Total Keputusan Sah",
    value: "14",
    suffix: "Risalah",
    icon: "▤",
    iconBg: "bg-[#e9fcb5]",
  },
  {
    title: "Terealisasi di Lapangan",
    value: "13",
    suffix: "(92.8%)",
    icon: "✓",
    iconBg: "bg-[#b4f580]",
    suffixClass: "text-[#4f8a45]",
  },
  {
    title: "Menunggu Jam Eksekusi",
    value: "1",
    suffix: "Tunda Sore",
    icon: "⌛",
    iconBg: "bg-[#ffdeab]",
    suffixClass: "text-[#b98532]",
  },
  {
    title: "Verifikasi PPL Dinas",
    value: "100%",
    suffix: "Sesuai SOP",
    icon: "♢",
    iconBg: "bg-[#d5e9bf]",
  },
];

export default function HistoryStats() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <article
          key={stat.title}
          style={{
            animationDelay: `${index * 70}ms`,
          }}
          className="group flex min-h-[112px] items-center gap-4 rounded-2xl bg-white px-5 py-6 shadow-[0_2px_4px_rgba(21,36,10,0.05)] animate-[fadeUp_.45s_ease-out_both] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(21,36,10,0.08)]"
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg ${stat.iconBg}`}
          >
            {stat.icon}
          </div>

          <div>
            <p className="text-xs font-semibold leading-4 tracking-[0.24px] text-[#44483f]">
              {stat.title}
            </p>

            <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold tracking-tight">
                {stat.value}
              </span>

              <span
                className={`text-sm font-semibold ${
                  stat.suffixClass ?? "text-[#44483f]"
                }`}
              >
                {stat.suffix}
              </span>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}