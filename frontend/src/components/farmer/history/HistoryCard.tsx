import type { HistoryItem } from "../../../pages/farmer/HistoryPage";

interface HistoryCardProps {
  item: HistoryItem;
  index: number;
}

export default function HistoryCard({
  item,
  index,
}: HistoryCardProps) {
  const isActive = item.active;

  return (
    <article
      style={{
        animationDelay: `${index * 70}ms`,
      }}
      className={`group relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(21,36,10,0.06)] animate-[fadeUp_.45s_ease-out_both] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(21,36,10,0.09)] sm:p-5`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#85c254]" />
      )}

      {/* ================= MOBILE ================= */}
      <div className="space-y-5 md:hidden">
        {/* Date */}
        <div>
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="h-2 w-1.5 rounded-full bg-[#b98532]" />
            )}

            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold">
              {item.date}
            </h3>
          </div>

          <p className="mt-1 text-xs font-semibold text-[#44483f]">
            ◷ {item.time}
          </p>
        </div>

        {/* Plot */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#364c23]">
            Petak Lahan
          </p>

          <div className="mt-1 flex items-start gap-2">
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold">
              {item.plot}
            </h3>

            <span className="rounded bg-[#f3f3ec] px-2 py-1 text-[10px] font-medium text-[#364c23]">
              {item.area}
              <br />
              Ha
            </span>
          </div>

          <p className="mt-1 text-sm text-[#44483f]">
            {item.variety} · {item.phase}
          </p>
        </div>

        {/* Decision */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#364c23]">
            Keputusan Sah Petani
          </p>

          <div className="flex gap-2">
            <span className="text-sm">▧</span>

            <div>
              <p className="text-sm font-semibold leading-5">
                "{item.decision}"
              </p>

              <p className="mt-2 text-xs font-semibold text-[#44483f]">
                {item.detail}
              </p>
            </div>
          </div>
        </div>

        {/* Evidence */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#364c23]">
            Pilar Bukti & Reviewer
          </p>

          <p className="text-xs font-semibold">◉ {item.evidence}</p>
          <p className="mt-1 text-xs font-semibold text-[#44483f]">
            ♧ {item.reviewer}
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-3 border-t border-[#f3f3ec] pt-4">
          <StatusBadge status={item.status} />

          <a
            href={`/farmer/history/${item.id}`}
            className="rounded-xl bg-[#f3f3ec] px-4 py-2 text-xs font-semibold transition-all duration-200 hover:bg-[#e9fcb5] active:scale-95"
          >
            Lihat Risalah →
          </a>
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-4">
        {/* Date */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="h-2 w-1.5 rounded-full bg-[#b98532]" />
            )}

            <p className="font-['Plus_Jakarta_Sans'] text-lg font-bold leading-6">
              {item.date}
            </p>
          </div>

          <p className="mt-1 text-xs font-semibold text-[#44483f]">
            ◷ {item.time}
          </p>
        </div>

        {/* Plot */}
        <div className="col-span-2">
          <div className="flex items-start gap-2">
            <div>
              <p className="font-['Plus_Jakarta_Sans'] text-lg font-bold leading-6">
                {item.plot}
              </p>

              <p className="mt-1 text-sm leading-5 text-[#44483f]">
                {item.variety} · {item.phase}
              </p>
            </div>

            <span className="shrink-0 rounded bg-[#f3f3ec] px-2 py-1 text-[10px] font-medium leading-4 text-[#364c23]">
              {item.area}
              <br />
              Ha
            </span>
          </div>
        </div>

        {/* Decision */}
        <div className="col-span-4">
          <div className="flex gap-2">
            <span className="mt-1 text-sm">▧</span>

            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-[20px]">
                "{item.decision}"
              </p>

              <p className="mt-2 text-xs font-semibold leading-4 text-[#44483f]">
                {item.detail}
              </p>
            </div>
          </div>

        </div>

        {/* Evidence */}
        <div className="col-span-2 space-y-2">
          <p className="text-xs font-semibold leading-4">
            ◉ {item.evidence}
          </p>

          <p className="text-xs font-semibold leading-4 text-[#44483f]">
            ♧ {item.reviewer}
          </p>
        </div>

        {/* Status */}
        <div className="col-span-2 flex flex-col items-end justify-between gap-4">
          <StatusBadge
            status={item.status}
            reference={item.reference}
          />

          <div className="flex items-center gap-2">
            {isActive && (
              <a
                href={`/farmer/history/${item.id}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f3ec] text-sm transition-all duration-200 hover:bg-[#e9fcb5] active:scale-95"
                aria-label="Buka risalah"
              >
                ↗
              </a>
            )}

            <a
              href={`/farmer/history/${item.id}`}
              className="rounded-xl bg-[#15240a] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#364c23] active:scale-95"
            >
              Lihat Risalah →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
  reference,
}: {
  status: HistoryItem["status"];
  reference?: string;
}) {
  if (status === "Sah Dicatat") {
    return (
      <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#e9fcb5] px-3 py-1 text-[10px] font-bold leading-4 text-[#15240a]">
        ✓
        <span>
          Sah Dicatat
          {reference && (
            <>
              <br />
              ({reference})
            </>
          )}
        </span>
      </span>
    );
  }

  if (status === "Terealisasi di Lapangan") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e9fcb5] px-3 py-1 text-[10px] font-bold leading-4 text-[#15240a]">
        ✓ Terealisasi di Lapangan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e9fcb5] px-3 py-1 text-[10px] font-bold text-[#15240a]">
      ✓ Selesai
    </span>
  );
}
