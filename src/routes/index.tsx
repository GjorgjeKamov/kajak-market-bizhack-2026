import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Footer } from "@/components/market/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KAJAK.MARKET — Sell or buy farm produce in Macedonia" },
      { name: "description", content: "A marketplace without listings or forms. Farmers and buyers in Macedonia connect through a simple conversation." },
      { property: "og:title", content: "KAJAK.MARKET" },
      { property: "og:description", content: "Sell or buy farm produce in Macedonia — just a conversation." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kajak.market" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://kajak.market" }],
  }),
  component: Home,
});

function Choice({ mode, title, sub }: { mode: "sell" | "buy"; title: string; sub: string }) {
  return (
    <Link to="/chat/$mode" params={{ mode }} className="group flex flex-1 items-center justify-between gap-4 rounded-3xl border border-border bg-secondary p-6 text-left transition hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-soft sm:p-8">
      <div>
        <div className="text-lg font-extrabold tracking-wide sm:text-xl">{title}</div>
        <div className="mt-2 text-sm opacity-80">{sub}</div>
      </div>
      <ArrowRight className="size-6 shrink-0 transition group-hover:translate-x-1" />
    </Link>
  );
}

function Home() {
  const { t } = useLang();
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16">
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-primary sm:text-7xl">KAJAK.MARKET</h1>
        <p className="mt-6 text-center text-lg text-muted-foreground sm:text-xl">{t.question}</p>
        <div className="mt-12 flex w-full flex-col gap-4 sm:flex-row">
          <Choice mode="sell" title={t.sell} sub={t.sellSub} />
          <Choice mode="buy" title={t.buy} sub={t.buySub} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
