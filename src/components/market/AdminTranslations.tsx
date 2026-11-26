import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL, LEGAL_REVIEWED, type LegalDoc } from "@/lib/legal-texts";
import { LANGS } from "@/lib/i18n-dicts";
import { translateTexts } from "@/lib/market.functions";

const btn = "rounded-full px-3 py-1.5 text-xs font-semibold";
type Row = { id: string; status: string; content: Record<string, string>; approved_at: string | null } | null;

export function AdminTranslations() {
  const [doc, setDoc] = useState<LegalDoc>("privacy");
  const [lang, setLang] = useState("mk");
  const [row, setRow] = useState<Row>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [overview, setOverview] = useState<{ doc: string; lang: string; status: string; version: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const src = LEGAL[doc];
  const en = src.text as Record<string, string>;

  const load = useCallback(async () => {
    const [{ data }, all] = await Promise.all([
      supabase.from("legal_translations").select("id,status,content,approved_at").eq("doc", doc).eq("lang", lang).eq("version", src.version).maybeSingle(),
      supabase.from("legal_translations").select("doc,lang,status,version"),
    ]);
    setRow(data as Row); setDraft(((data?.content as Record<string, string>) ?? {}));
    setOverview(all.data ?? []);
  }, [doc, lang, src.version]);
  useEffect(() => { void load(); }, [load]);

  async function generate() {
    setBusy(true);
    try { setDraft(await translateTexts({ data: { lang, version: `${doc}-${src.version}`, texts: en } })); toast.success("AI draft created — review it before approving."); }
    catch { toast.error("Could not generate a draft."); } finally { setBusy(false); }
  }
  async function save(status: "draft" | "approved") {
    if (status === "approved" && !confirm("Approve this translation as the official version shown to visitors?")) return;
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("legal_translations").upsert({
      doc, lang, version: src.version, content: draft, status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
      approved_by: status === "approved" ? u.user?.id ?? null : null, updated_at: new Date().toISOString(),
    }, { onConflict: "doc,lang,version" });
    if (error) toast.error(error.message); else { toast.success(status === "approved" ? "Approved and published." : "Draft saved."); void load(); }
  }

  const statusOf = (d: string, l: string) => overview.find((o) => o.doc === d && o.lang === l && o.version === LEGAL[d as LegalDoc].version)?.status;
  return (
    <div className="mt-4 space-y-4 text-sm">
      <p className="text-muted-foreground">Visitors only see translations you approve. Until then they see the official English text with a note. Changing the English text means a new version, which needs a new approval.</p>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LEGAL) as LegalDoc[]).map((d) => <button key={d} onClick={() => setDoc(d)} className={`${btn} ${doc === d ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>{d}</button>)}
        <span className="self-center text-xs text-muted-foreground">version {src.version}</span>
        <span className="self-center text-xs text-muted-foreground">draft banner on public pages: {LEGAL_REVIEWED[doc] ? "hidden — legally reviewed" : "shown — pending review"}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LANGS.filter(([c]) => c !== "en").map(([c, n]) => {
          const st = statusOf(doc, c);
          return <button key={c} onClick={() => setLang(c)} className={`${btn} border ${lang === c ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{n}{st === "approved" ? " ✓" : st === "draft" ? " ·draft" : ""}</button>;
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <strong>Status: {row ? (row.status === "approved" ? `approved ${row.approved_at ? new Date(row.approved_at).toLocaleDateString() : ""}` : "draft (not shown to visitors)") : "none"}</strong>
        <button disabled={busy} onClick={generate} className={`${btn} bg-secondary text-primary`}>{busy ? "Generating…" : "Generate AI draft"}</button>
        <button disabled={!Object.keys(draft).length} onClick={() => save("draft")} className={`${btn} border border-primary text-primary`}>Save draft</button>
        <button disabled={Object.keys(en).some((k) => !draft[k]?.trim())} onClick={() => save("approved")} className={`${btn} bg-primary text-primary-foreground`}>Approve</button>
      </div>
      {Object.keys(en).map((k) => (
        <div key={k} className="grid gap-2 sm:grid-cols-2">
          <div><div className="text-xs font-semibold text-muted-foreground">{k} — English</div><div className="whitespace-pre-wrap rounded-2xl bg-secondary p-3">{en[k]}</div></div>
          <div><div className="text-xs font-semibold text-muted-foreground">{k} — {lang}</div>
            <textarea value={draft[k] ?? ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} rows={Math.min(20, Math.max(2, Math.ceil((en[k]?.length ?? 0) / 60)))} className="w-full rounded-2xl border border-input p-3 outline-none focus:border-primary" /></div>
        </div>
      ))}
    </div>
  );
}
