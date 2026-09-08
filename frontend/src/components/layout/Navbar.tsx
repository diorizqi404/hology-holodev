import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Sprout, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "../ui/Button";

const navLinks = [
  { href: "#beranda", label: "Beranda" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#fitur", label: "Fitur" },
  { href: "#tentang", label: "Tentang" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 shadow ${
        scrolled || open
          ? "border-b border-lime-950/5 bg-stone-50/95 backdrop-blur-md"
          : "bg-stone-50/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:h-20 sm:px-4 md:px-6 lg:px-8">
        <a href="#beranda" className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-lime-950 px-2.5 text-lime-400 shadow-md">
            <Sprout className="size-4 shrink-0" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-50">
              RembukTani
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-xl p-1 lg:flex" aria-label="Utama">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 transition-colors ${
                index === 0
                  ? "bg-lime-200 font-display text-base font-bold text-lime-950"
                  : "text-sm font-semibold tracking-tight text-stone-700 hover:bg-stone-100"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link to="/login">
            <Button variant="secondary" className="min-h-9 px-3 py-2">
              Masuk
            </Button>
          </Link>
          <Link to="/register">
            <Button className="min-h-9 px-3 py-2">Daftar</Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg bg-lime-950 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-lime-950/5 bg-stone-50 lg:hidden"
            aria-label="Mobile"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-3 py-4 sm:px-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-lime-950 hover:bg-lime-100"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="soft" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">Daftar</Button>
                </Link>
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
