import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Footer } from "./Footer";
import { useLang } from "@/lib/i18n";

export function LegalPage({ title, banner, loading, notice, children }: { title: string; banner?: string | undefined; loading?: boolean; notice?: string | undefined; children: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link to="/" className="text-sm font-extrabold text-primary">KAJAK.MARKET</Link>
        <h1 className="mt-8 text-3xl font-bold text-primary">{title}</h1>
        {loading && <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{t.translating}</p>}
        {notice && !loading && <div className="mt-3 rounded-2xl border border-primary p-4 text-sm">{notice}</div>}
        {banner ? <div className="mt-2 rounded-2xl bg-secondary p-4 text-sm">{banner}</div> : null}
        <div className="mt-8 space-y-5 leading-relaxed [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
