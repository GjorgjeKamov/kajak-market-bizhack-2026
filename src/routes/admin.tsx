import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminTranslations } from "@/components/market/AdminTranslations";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — KAJAK.MARKET" },
      { name: "description", content: "KAJAK.MARKET administration." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Admin — KAJAK.MARKET" },
      { property: "og:description", content: "Administration area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const btn = "rounded-full px-3 py-1 text-xs font-semibold";
const input = "w-full rounded-full border border-input px-4 py-2.5 outline-none focus:border-primary";

function Login() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  async function go(signup: boolean) {
    setBusy(true);
    const r = signup ? await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin + "/admin" } }) : await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (r.error) toast.error(r.error.message); else if (signup && !r.data.session) toast.success("Check your email to confirm the account.");
  }
  return (
    <div className="mx-auto mt-24 max-w-sm space-y-3 px-5">
      <h1 className="text-2xl font-bold text-primary">Admin sign in</h1>
      <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={input} type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={busy} onClick={() => go(false)} className="flex-1 rounded-full bg-primary py-2.5 font-semibold text-primary-foreground">Sign in</button>
        <button disabled={busy} onClick={() => go(true)} className="flex-1 rounded-full bg-secondary py-2.5 font-semibold text-primary">Create account</button>
      </div>
      <p className="text-xs text-muted-foreground">Only pre-approved administrator emails get access, after confirming the email address.</p>
    </div>
  );
}

function regLabel(r: { registration_status?: string; status?: string }, tab: string) {
  if (r.registration_status === "incomplete") return "Incomplete";
  if (tab !== "producers") return "Completed";
  return r.status === "approved" ? "Approved" : r.status === "deactivated" ? "Inactive" : "Pending approval";
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]!).filter((k) => typeof rows[0]![k] !== "object" || rows[0]![k] === null);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}
function download(name: string, rows: Record<string, unknown>[]) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" })); a.download = `${name}.csv`; a.click();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
type Tab = "producers" | "buyers" | "matches" | "consents" | "feedback" | "privacy" | "translations";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("producers");
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [real, setReal] = useState<"real" | "test" | "all">("real");
  const [status, setStatus] = useState("all");
  const [reg, setReg] = useState("all");
  const [retention, setRetention] = useState<number | null>(null);
  const [langs, setLangs] = useState<Record<string, number>>({});
  const load = useCallback(async () => {
    if (tab === "translations") return;
    const s = await supabase.from("aggregate_stats").select("*").single();
    setStats(s.data as Record<string, number>);
    const [lp, lb] = await Promise.all([supabase.from("producers").select("language").eq("is_test", false), supabase.from("buyers").select("language").eq("is_test", false)]);
    const lc: Record<string, number> = {};
    for (const r of [...(lp.data ?? []), ...(lb.data ?? [])]) { const k = r.language || "?"; lc[k] = (lc[k] ?? 0) + 1; }
    setLangs(lc);
    const rs = await supabase.from("app_settings").select("value").eq("key", "abandoned_retention_days").maybeSingle();
    setRetention(rs.data ? Number(rs.data.value) : null);
    const q =
      tab === "producers" ? supabase.from("producers").select("*, products(*)").order("created_at", { ascending: false })
      : tab === "buyers" ? supabase.from("buyers").select("*, buyer_requests(*)").order("created_at", { ascending: false })
      : tab === "consents" ? supabase.from("consent_records").select("*").order("created_at", { ascending: false })
      : tab === "matches" ? supabase.from("match_events").select("*, producers(full_name,is_test), products(name), buyer_requests(product, buyers(full_name,is_test))").order("created_at", { ascending: false })
      : tab === "feedback" ? supabase.from("feedback").select("*").order("created_at", { ascending: false })
      : supabase.from("privacy_requests").select("*").order("created_at", { ascending: false });
    const { data, error } = await q.limit(500);
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
  }, [tab]);
  useEffect(() => { void load(); }, [load]);

  const shown = rows.filter((r) => {
    const t = r.is_test ?? r.producers?.is_test ?? r.buyer_requests?.buyers?.is_test;
    if (real !== "all" && t !== undefined && t !== (real === "test")) return false;
    if (status !== "all" && tab === "producers" && r.status !== status) return false;
    if (reg !== "all" && (tab === "producers" || tab === "buyers") && regLabel(r, tab) !== reg) return false;
    return !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase());
  });
  const table = tab === "matches" ? "match_events" : tab === "consents" ? "consent_records" : tab === "privacy" ? "privacy_requests" : tab;
  async function update(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from(table as "producers").update(patch as never).eq("id", id);
    if (error) toast.error(error.message); else void load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this record permanently?")) return;
    const { error } = await supabase.from(table as "producers").delete().eq("id", id);
    if (error) toast.error(error.message); else void load();
  }
  async function withdraw(r: Row) {
    const { error } = await supabase.from("consent_records").update({ withdrawn_at: new Date().toISOString() }).eq("id", r.id);
    if (!error && r.subject_type === "producer" && r.consent_type === "phone_public") await supabase.from("producers").update({ phone_public_consent: false }).eq("id", r.subject_id);
    if (error) toast.error(error.message); else void load();
  }
  async function editField(id: string, field: string, cur: unknown) {
    const v = prompt(`New value for ${field}`, String(cur ?? ""));
    if (v !== null) await update(id, { [field]: v });
  }

  async function saveRetention() {
    const v = prompt("Delete abandoned (incomplete) registrations after how many days of inactivity?", String(retention ?? 30));
    const n = Number(v); if (!v || !Number.isInteger(n) || n < 1 || n > 3650) return;
    const { error } = await supabase.from("app_settings").upsert({ key: "abandoned_retention_days", value: n, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message); else void load();
  }
  async function purge() {
    if (!confirm(`Permanently delete incomplete registrations inactive for more than ${retention ?? 30} days?`)) return;
    const { data, error } = await supabase.rpc("purge_abandoned_registrations");
    if (error) toast.error(error.message); else { toast.success(`${data} removed`); void load(); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary">KAJAK.MARKET admin</h1>
        <button onClick={() => supabase.auth.signOut()} className={`${btn} bg-secondary text-primary`}>Sign out</button>
      </div>
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-secondary p-4"><div className="text-2xl font-bold text-primary">{k.endsWith("_seconds") ? `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}` : v}</div><div className="text-xs text-muted-foreground">{k.replaceAll("_", " ").replace(" seconds", " registration (min)")} (real)</div></div>
          ))}
          <div className="col-span-2 rounded-2xl bg-secondary p-4 sm:col-span-6"><div className="text-xs text-muted-foreground">Languages used (real registrations)</div><div className="mt-1 text-sm text-primary">{Object.entries(langs).map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"}</div></div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Abandoned incomplete registrations are kept {retention ?? 30} days after last activity.
        <button onClick={saveRetention} className={`${btn} bg-secondary text-primary`}>Change</button>
        <button onClick={purge} className={`${btn} bg-secondary text-primary`}>Delete expired now</button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["producers", "buyers", "matches", "consents", "feedback", "privacy", "translations"] as Tab[]).map((x) => (
          <button key={x} onClick={() => setTab(x)} className={`${btn} ${tab === x ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>{x}</button>
        ))}
        {tab !== "translations" && <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-full border border-input px-3 py-1 text-xs outline-none focus:border-primary" />
          <select value={real} onChange={(e) => setReal(e.target.value as "real")} className="rounded-full border border-input px-2 py-1 text-xs"><option value="real">Real only</option><option value="test">Test only</option><option value="all">All</option></select>
          {tab === "producers" && <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-input px-2 py-1 text-xs"><option value="all">Any status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="deactivated">Deactivated</option></select>}
          {(tab === "producers" || tab === "buyers") && <select value={reg} onChange={(e) => setReg(e.target.value)} className="rounded-full border border-input px-2 py-1 text-xs"><option value="all">Any registration</option><option value="Incomplete">Incomplete</option>{tab === "buyers" && <option value="Completed">Completed</option>}{tab === "producers" && <><option value="Pending approval">Pending approval</option><option value="Approved">Approved</option><option value="Inactive">Inactive</option></>}</select>}
        </>}
        <button onClick={() => download(tab, shown)} className={`${btn} ml-auto border border-primary text-primary`}>Export CSV</button>
      </div>
      {tab === "translations" ? <AdminTranslations /> : <div className="mt-4 space-y-3">
        {shown.length === 0 && <p className="text-sm text-muted-foreground">No records.</p>}
        {shown.map((r) => (
          <div key={r.id} className={`rounded-2xl border p-4 text-sm ${r.is_test ? "border-dashed border-muted-foreground/50 bg-muted/60 opacity-75" : "border-border"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                {tab === "producers" && <>
                  <div className="font-bold">{r.full_name} <span className="font-normal text-muted-foreground">· {r.location}, {r.country} · {r.producer_type}</span></div>
                  <div>📞 {r.phone} {r.phone_public_consent ? "(public consent)" : "(private)"} · calls ack: {String(r.buyer_contact_ack)} {r.email && `· ${r.email}`} · lang {r.language ?? "?"}</div>
                  {r.registration_status === "incomplete" && <div className="text-xs text-primary">Missing: {(r.missing_fields ?? []).join(", ") || "—"} · last activity {new Date(r.last_activity_at).toLocaleString()}</div>}
                  <div className="text-muted-foreground">Delivery: free={String(r.free_delivery)} {r.free_delivery_areas} · paid MK={String(r.paid_delivery_macedonia)} · export: {r.export_capability ?? "—"}</div>
                  <ul className="list-disc pl-5">{r.products?.map((p: any) => <li key={p.id}>{p.name}: {p.available_quantity ?? "?"}/{p.production_quantity ?? "?"} {p.unit} · {p.season} · {p.price} {p.currency}/{p.price_unit} {p.negotiable ? "(negotiable)" : ""}</li>)}</ul>
                </>}
                {tab === "buyers" && <>
                  <div className="font-bold">{r.full_name} <span className="font-normal text-muted-foreground">· {r.business_name} · {r.buyer_type} · {r.location}, {r.country}</span></div>
                  {r.registration_status === "incomplete" && <div className="text-xs text-primary">Missing: {(r.missing_fields ?? []).join(", ") || "—"} · last activity {new Date(r.last_activity_at).toLocaleString()}</div>}
                  <div>📞 {r.phone} {r.email && `· ${r.email}`} · share consent: {String(r.contact_share_consent)}</div>
                  <ul className="list-disc pl-5">{r.buyer_requests?.map((q: any) => <li key={q.id}>{q.product}: {q.quantity} {q.unit} → {q.delivery_location} · {q.delivery_period} · target {q.target_price} {q.currency} · recurring {String(q.recurring)} · <strong>{q.status}</strong></li>)}</ul>
                </>}
                {tab === "consents" && <div>{r.subject_type} {r.subject_id.slice(0, 8)} · <strong>{r.consent_type}</strong> = {String(r.granted)} · v{r.policy_version} · {new Date(r.created_at).toLocaleString()} {r.withdrawn_at && <span className="text-destructive">· withdrawn {new Date(r.withdrawn_at).toLocaleString()}</span>}<div className="text-muted-foreground">“{r.wording}”</div></div>}
                {tab === "matches" && <div><strong>{r.buyer_requests?.buyers?.full_name}</strong> wants {r.buyer_requests?.product} → <strong>{r.producers?.full_name}</strong> ({r.products?.name}) · score {r.score} · {new Date(r.created_at).toLocaleString()}</div>}
                {tab === "feedback" && <div>{r.message}<div className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div></div>}
                {tab === "privacy" && <div><strong>{r.request_type}</strong> · {r.phone ?? "—"} · {r.email ?? "—"} · {r.status}{r.session_hash ? " · linked to a registration on this device (verify identity by phone/email before acting)" : ""}<div>{r.details}</div></div>}
              </div>
              <div className="flex flex-wrap gap-1">
                {(tab === "producers" || tab === "buyers") && <span className={`${btn} ${r.registration_status === "incomplete" ? "border border-dashed border-primary text-primary" : "bg-secondary text-primary"}`}>{regLabel(r, tab)}</span>}
                {r.is_test !== undefined && <span className={`${btn} ${r.is_test ? "border border-dashed border-muted-foreground text-muted-foreground" : "bg-primary text-primary-foreground"}`}>{r.is_test ? "TEST · synthetic" : "REAL"}</span>}
                {tab === "producers" && <>
                  {r.status !== "approved" && r.registration_status === "completed" && <button onClick={() => update(r.id, { status: "approved" })} className={`${btn} bg-primary text-primary-foreground`}>Approve</button>}
                  {r.status !== "deactivated" && <button onClick={() => update(r.id, { status: "deactivated" })} className={`${btn} bg-secondary text-primary`}>Deactivate</button>}
                  <button onClick={() => editField(r.id, "phone", r.phone)} className={`${btn} bg-secondary text-primary`}>Edit phone</button>
                  <button onClick={() => editField(r.id, "location", r.location)} className={`${btn} bg-secondary text-primary`}>Edit location</button>
                  <button onClick={() => editField(r.id, "email", r.email)} className={`${btn} bg-secondary text-primary`}>Edit email</button>
                </>}
                {tab === "buyers" && <button onClick={() => editField(r.id, "phone", r.phone)} className={`${btn} bg-secondary text-primary`}>Edit phone</button>}
                {(tab === "producers" || tab === "buyers") && <button onClick={() => update(r.id, { is_test: !r.is_test })} className={`${btn} bg-secondary text-primary`}>Mark {r.is_test ? "real" : "test"}</button>}
                {tab === "consents" && !r.withdrawn_at && <button onClick={() => withdraw(r)} className={`${btn} bg-secondary text-primary`}>Process withdrawal</button>}
                {tab === "privacy" && r.status === "open" && <button onClick={() => update(r.id, { status: "done" })} className={`${btn} bg-primary text-primary-foreground`}>Mark done</button>}
                <button onClick={() => remove(r.id)} className={`${btn} bg-destructive text-destructive-foreground`}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("claim_first_admin").then(({ data }) => setIsAdmin(data === true));
  }, [session]);
  if (!ready) return null;
  if (!session) return <Login />;
  if (isAdmin === null) return null;
  if (!isAdmin) return (
    <div className="mx-auto mt-24 max-w-sm space-y-3 px-5 text-center">
      <p>This account has no administrator access.</p>
      <button onClick={() => supabase.auth.signOut()} className="rounded-full bg-secondary px-5 py-2 text-primary">Sign out</button>
    </div>
  );
  return <Dashboard />;
}
