import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LANGS, useLang } from "@/lib/i18n";

export function LangPicker({ placement = "up", compact = false }: { placement?: "up" | "down"; compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const current = LANGS.find(([c]) => c === lang)?.[1] ?? "English";
  const list = LANGS.filter(([c, n]) => !q || n.toLowerCase().includes(q.toLowerCase()) || c.includes(q.toLowerCase()));
  return (
    <div ref={box} className="relative">
      <button type="button" aria-label={t.language} aria-expanded={open} onClick={() => { setOpen(!open); setQ(""); }}
        className={compact ? "flex h-9 items-center gap-1 rounded-full px-2 text-xs text-primary hover:bg-secondary" : "flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-foreground hover:border-primary"}>
        <Globe className={compact ? "size-4" : "size-3.5 text-primary"} /><span className={compact ? "hidden uppercase sm:inline" : ""}>{compact ? lang : current}</span>
      </button>
      {open && (
        <div className={`absolute z-50 w-60 max-w-[calc(100vw-2rem)] rounded-2xl ${placement === "up" ? "bottom-full left-1/2 mb-2 -translate-x-1/2" : "right-0 top-full mt-2"} border border-border bg-background p-2 shadow-soft`}>
          <input autoFocus={typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchLang}
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); if (e.key === "Enter" && list[0]) { setLang(list[0][0]); setOpen(false); } }}
            className="mb-1 w-full rounded-full border border-input px-3 py-1.5 text-base text-foreground outline-none focus:border-primary sm:text-sm" />
          <ul role="listbox" className="max-h-[50vh] overflow-y-auto overscroll-contain">
            {list.map(([c, n]) => (
              <li key={c}>
                <button type="button" role="option" aria-selected={c === lang} onClick={() => { setLang(c); setOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left sm:py-1.5 text-sm text-foreground hover:bg-secondary">
                  {n}{c === lang && <Check className="size-3.5 text-primary" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="flex flex-wrap items-center justify-center gap-4 py-6 text-xs text-muted-foreground">
      <LangPicker />
      <Link to="/privacy" className="hover:text-primary">{t.privacy}</Link>
      <Link to="/terms" className="hover:text-primary">{t.terms}</Link>
    </footer>
  );
}
