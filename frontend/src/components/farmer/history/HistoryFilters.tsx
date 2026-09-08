interface HistoryFiltersProps {
  selectedPlot: string;
  selectedSeason: string;
  search: string;
  onPlotChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const plots = [
  "Semua Petak (14)",
  "Blok Tirto A3 (5)",
  "Petak Bawah Timur #04 (4)",
  "Petak Sawah Barat (3)",
  "Blok Timur Rawa 02 (2)",
];

export default function HistoryFilters({
  selectedPlot,
  selectedSeason,
  search,
  onPlotChange,
  onSeasonChange,
  onSearchChange,
}: HistoryFiltersProps) {
  return (
    <section className="rounded-2xl bg-white p-4 sm:p-5 shadow-[0_2px_6px_rgba(21,36,10,0.04)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* Plot filter */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-xs font-semibold text-[#44483f]">
            Petak:
          </span>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {plots.map((plot) => {
              const active = selectedPlot === plot;

              return (
                <button
                  key={plot}
                  type="button"
                  onClick={() => onPlotChange(plot)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-[#364c23] text-white shadow-sm"
                      : "bg-[#f3f3ec] text-[#15240a] hover:bg-[#e9fcb5]"
                  }`}
                >
                  {plot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Season */}
        <div className="grid shrink-0 grid-cols-2 rounded-xl bg-[#f3f3ec] p-1">
          {["Gadu 2026", "Rendengan 2025/2026"].map((season) => {
            const active =
              selectedSeason === season ||
              (season === "Gadu 2026" && selectedSeason === "Gadu 2026");

            return (
              <button
                key={season}
                type="button"
                onClick={() => onSeasonChange(season)}
                className={`min-h-12 rounded-lg px-3 text-[10px] font-semibold leading-3 transition-all duration-200 sm:min-w-[110px] ${
                  active
                    ? "bg-white font-bold text-[#15240a] shadow-sm"
                    : "text-[#44483f] hover:bg-white/60"
                }`}
              >
                {season === "Gadu 2026" ? (
                  <>
                    Musim Tanam
                    <br />
                    Gadu 2026 (Aktif)
                  </>
                ) : (
                  <>
                    Musim
                    <br />
                    Rendengan
                    <br />
                    2025/2026
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#75786e]">
          ⌕
        </span>

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nomor risalah (#RT-...), tindakan, atau varietas..."
          className="h-12 w-full rounded-xl border-0 bg-[#f3f3ec] pl-11 pr-4 text-sm text-[#15240a] outline-none transition-all duration-200 placeholder:text-[#75786e] focus:bg-white focus:ring-2 focus:ring-[#85c254]/50"
        />
      </div>
    </section>
  );
}