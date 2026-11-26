import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL, type LegalDoc } from "./legal-texts";

type Texts<D extends LegalDoc> = { -readonly [K in keyof (typeof LEGAL)[D]["text"]]: string };

// Returns the admin-approved translation for the current version, else the official English text.
export function useLegal<D extends LegalDoc>(doc: D, lang: string) {
  const src = LEGAL[doc];
  const en = src.text as unknown as Texts<D>;
  const [state, setState] = useState<{ lang: string; t: Texts<D>; approved: boolean }>({ lang: "en", t: en, approved: true });
  useEffect(() => {
    if (lang === "en") { setState({ lang, t: en, approved: true }); return; }
    let off = false;
    const key = `kajak-legal:${doc}:${src.version}:${lang}`;
    const cached = sessionStorage.getItem(key);
    if (cached) { const c = JSON.parse(cached); setState({ lang, t: c ? { ...en, ...c } : en, approved: !!c }); return; }
    supabase.from("legal_translations").select("content").eq("doc", doc).eq("lang", lang).eq("version", src.version).eq("status", "approved").maybeSingle()
      .then(({ data }) => {
        const c = (data?.content as Record<string, string> | undefined) ?? null;
        sessionStorage.setItem(key, JSON.stringify(c));
        if (!off) setState({ lang, t: c ? { ...en, ...c } as Texts<D> : en, approved: !!c });
      });
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, lang]);
  return { t: state.t, approved: state.approved, loading: state.lang !== lang, version: src.version };
}
