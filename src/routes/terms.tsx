import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { LegalPage } from "@/components/market/LegalPage";
import { publicBanner } from "@/lib/legal-texts";
import { useLang } from "@/lib/i18n";
import { useLegal } from "@/lib/use-legal";


export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — KAJAK.MARKET" },
      { name: "description", content: "Terms for using the KAJAK.MARKET agricultural marketplace in Macedonia." },
      { property: "og:title", content: "Terms of Use — KAJAK.MARKET" },
      { property: "og:description", content: "Terms for using KAJAK.MARKET." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { lang, t: ui } = useLang();
  const { t, loading, approved } = useLegal("terms", lang);
  return <LegalPage title={t.title} banner={publicBanner("terms", t)} loading={loading} notice={approved ? undefined : ui.englishOnly}><ReactMarkdown>{t.body}</ReactMarkdown></LegalPage>;
}
