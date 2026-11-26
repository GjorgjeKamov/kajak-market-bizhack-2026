import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DICTS, LANGS, type Dict } from "./i18n-dicts";
import { pickLanguage } from "./lang-detect";
import { detectCountry } from "./market.functions";

export { LANGS };
const en = DICTS["en"]!;
const KEY = "kajak-lang"; // only set on manual choice

const Ctx = createContext<{ lang: string; setLang: (l: string) => void; t: Dict }>({ lang: "en", setLang: () => {}, t: en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const browser = navigator.languages?.length ? navigator.languages : [navigator.language];
    if (stored && DICTS[stored]) { setLangState(stored); return; }
    setLangState(pickLanguage({ browser }));
    let cancelled = false;
    detectCountry()
      .then(({ country }) => { if (!cancelled && !localStorage.getItem(KEY)) setLangState(pickLanguage({ country, browser })); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (l: string) => { setLangState(l); localStorage.setItem(KEY, l); };
  return <Ctx.Provider value={{ lang, setLang, t: DICTS[lang] ?? en }}>{children}</Ctx.Provider>;
}
export const useLang = () => useContext(Ctx);
