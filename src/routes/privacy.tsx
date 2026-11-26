import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { LegalPage } from "@/components/market/LegalPage";
import { publicBanner } from "@/lib/legal-texts";
import { submitPrivacyRequest } from "@/lib/market.functions";
import { useLang } from "@/lib/i18n";
import { useLegal } from "@/lib/use-legal";


export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — KAJAK.MARKET" },
      { name: "description", content: "How KAJAK.MARKET collects, uses and protects personal information, and how to withdraw consent." },
      { property: "og:title", content: "Privacy Policy — KAJAK.MARKET" },
      { property: "og:description", content: "How KAJAK.MARKET handles your personal information." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { lang, t: ui } = useLang();
  const { t, loading, approved } = useLegal("privacy", lang);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"withdraw_consent" | "correction" | "deletion" | "access_portability">("withdraw_consent");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    if (!phone.trim() && !email.trim()) { toast.error(t.fail); setBusy(false); return; }
    const sessionTokens = ["sell", "buy"].flatMap((m) => { try { const tk = (JSON.parse(localStorage.getItem(`kajak-chat-${m}`) ?? "null") as { token?: string } | null)?.token; return tk ? [tk] : []; } catch { return []; } });
    try { await submitPrivacyRequest({ data: { phone: phone.trim() || null, email: email.trim() || null, request_type: type, details, sessionTokens } }); toast.success(t.ok); setPhone(""); setEmail(""); setDetails(""); }
    catch { toast.error(t.fail); }
    finally { setBusy(false); }
  }
  return (
    <LegalPage title={t.title} banner={publicBanner("privacy", t)} loading={loading} notice={approved ? undefined : ui.englishOnly}>
      <ReactMarkdown>{t.body}</ReactMarkdown>
      <form onSubmit={submit} className="space-y-3 rounded-3xl border border-border p-5">
        <h2 className="!mt-0">{t.formTitle}</h2>
        <p className="!my-0 text-sm text-muted-foreground">{t.contactHint}</p>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phone} className="w-full rounded-full border border-input px-4 py-2.5 outline-none focus:border-primary" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} className="w-full rounded-full border border-input px-4 py-2.5 outline-none focus:border-primary" />
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full rounded-full border border-input bg-background px-4 py-2.5">
          <option value="withdraw_consent">{t.withdraw}</option><option value="correction">{t.correction}</option><option value="deletion">{t.deletion}</option><option value="access_portability">{t.portability}</option>
        </select>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} placeholder={t.details} className="w-full rounded-2xl border border-input px-4 py-2.5 outline-none focus:border-primary" />
        <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground disabled:opacity-50">{t.submit}</button>
      </form>
    </LegalPage>
  );
}
