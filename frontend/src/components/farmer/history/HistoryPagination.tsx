interface HistoryPaginationProps {
  page: number;
  total: number;
  shown: number;
  onPageChange: (page: number) => void;
}

export default function HistoryPagination({
  page,
  total,
  shown,
  onPageChange,
}: HistoryPaginationProps) {
  return (
    <footer className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-[0_2px_4px_rgba(21,36,10,0.05)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-sm leading-5 text-[#44483f]">
          Menampilkan{" "}
          <strong className="font-['Plus_Jakarta_Sans'] font-bold text-[#15240a]">
            {shown}
          </strong>{" "}
          dari{" "}
          <strong className="font-['Plus_Jakarta_Sans'] font-bold text-[#15240a]">
            {total}
          </strong>{" "}
          ketetapan musim tanam ini
        </p>

        <span className="hidden h-4 w-px bg-[#c5c8bc] sm:block" />

        <div className="flex items-center gap-2 text-xs font-semibold text-[#364c23]">
          <span>⟳</span>
          <span>
            Sinkronisasi Pangkalan Data Poktan:
            <br />
            Terkini
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ${
              page === item
                ? "bg-[#15240a] text-white"
                : "bg-[#f3f3ec] text-[#15240a] hover:bg-[#e9fcb5]"
            }`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, 3))}
          className="flex h-9 items-center gap-1 rounded-lg bg-[#f3f3ec] px-3 text-xs font-semibold transition-all duration-200 hover:bg-[#e9fcb5] active:scale-95"
        >
          Selanjutnya →
        </button>
      </div>
    </footer>
  );
}