import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUp, Mic, Square, Loader2, Sprout, RotateCcw } from "lucide-react";
import { CONSENT_MARK } from "@/lib/registration";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { chatTurn, transcribe } from "@/lib/market.functions";
import { LangPicker } from "@/components/market/Footer";
import { useLegal } from "@/lib/use-legal";

export const Route = createFileRoute("/chat/$mode")({
  beforeLoad: ({ params }) => {
    if (params.mode !== "sell" && params.mode !== "buy") throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: params.mode === "sell" ? "Sell your produce — KAJAK.MARKET" : "Find producers — KAJAK.MARKET" },
      { name: "description", content: params.mode === "sell" ? "Register your farm products in a short conversation." : "Tell us what you need and get matched with real producers in Macedonia." },
      { property: "og:title", content: params.mode === "sell" ? "Sell on KAJAK.MARKET" : "Buy on KAJAK.MARKET" },
      { property: "og:description", content: "Agricultural marketplace in Macedonia — just a conversation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Chat,
});

type Msg = { role: "user" | "assistant"; content: string };

function Chat() {
  const { mode } = Route.useParams() as { mode: "sell" | "buy" };
  const { t, lang } = useLang();
  const consent = useLegal("consent", lang);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<"idle" | "recording" | "transcribing">("idle");
  const [voiceNote, setVoiceNote] = useState(false);
  const [consents, setConsents] = useState<{ phone_public?: boolean; contact_ack?: boolean; contact_share?: boolean }>({});
  const startedAt = useRef<number | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const token = useRef<string>("");
  const storeKey = `kajak-chat-${mode}`;
  // Resume an unfinished conversation on this device. The token is the only key to the saved profile.
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(storeKey) ?? "null") as { token?: string; messages?: Msg[]; consents?: typeof consents; startedAt?: number } | null;
      if (raw?.token && /^[a-f0-9]{64}$/.test(raw.token)) {
        token.current = raw.token; setMessages(raw.messages ?? []); setConsents(raw.consents ?? {}); startedAt.current = raw.startedAt ?? null;
        return;
      }
    } catch { /* ignore broken storage */ }
    newToken();
  }, [storeKey]);
  function newToken() {
    const b = crypto.getRandomValues(new Uint8Array(32));
    token.current = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  }
  useEffect(() => {
    if (!token.current || messages.length === 0) return;
    localStorage.setItem(storeKey, JSON.stringify({ token: token.current, messages: messages.slice(-80), consents, startedAt: startedAt.current }));
  }, [messages, consents, storeKey]);
  function restart() {
    localStorage.removeItem(storeKey); newToken(); setMessages([]); setConsents({}); startedAt.current = null;
  }

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);
  useEffect(() => { if (!busy) taRef.current?.focus(); }, [busy]);

  async function send(override?: string, cons = consents) {
    const content = (override ?? text).trim();
    if (!content || busy) return;
    startedAt.current ??= Date.now();
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next); if (!override) setText(""); setVoiceNote(false); setBusy(true);
    try {
      const res = await chatTurn({ data: { mode, lang, sessionToken: token.current, consents: cons, elapsedSec: (Date.now() - startedAt.current) / 1000, messages: next.slice(-80) } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e) {
      const msg = e instanceof Error && e.message.includes("RATE_LIMIT") ? t.rate : t.error;
      toast.error(msg);
      setMessages(messages); if (!override) setText(content);
    } finally { setBusy(false); }
  }

  async function toggleRec() {
    if (rec === "recording") { recorder.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setRec("transcribing");
        try {
          const type = mr.mimeType || "audio/webm";
          const fd = new FormData();
          fd.append("file", new File(chunks, `voice.${type.includes("mp4") ? "mp4" : "webm"}`, { type }));
          fd.append("lang", lang === "en" ? "" : lang);
          const { text: tx } = await transcribe({ data: fd });
          setText((p) => (p ? p + " " : "") + tx);
          setVoiceNote(true);
          taRef.current?.focus();
        } catch { toast.error(t.error); }
        finally { setRec("idle"); }
      };
      mr.start(); recorder.current = mr; setRec("recording");
    } catch { toast.error(t.micFail); }
  }

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to="/" aria-label={t.back} className="rounded-full p-2 text-primary hover:bg-secondary"><ArrowLeft className="size-5" /></Link>
        <Link to="/" className="text-sm font-extrabold tracking-tight text-primary">KAJAK.MARKET</Link>
        <div className="flex items-center gap-1">
          {messages.length > 0 && <button type="button" onClick={restart} aria-label="New conversation" className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><RotateCcw className="size-4" /></button>}
          <LangPicker placement="down" compact />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 py-6">
          {messages.length === 0 && (
            <div className="pt-[18vh] text-center">
              <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{t.hello}</h1>
              <p className="mx-auto mt-6 max-w-md text-xs text-muted-foreground">
                {consent.t.notice} <Link to="/privacy" className="underline">{t.privacy}</Link>.
              </p>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" && m.content.startsWith(CONSENT_MARK) ? (
              <ConsentAnswer key={i} mode={mode} raw={m.content.slice(CONSENT_MARK.length)} t={consent.t} />
            ) : m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-3xl bg-primary px-4 py-2.5 text-primary-foreground">{m.content}</div>
            ) : (
              <div key={i} className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Sprout className="size-4" /></span>
                <div className="prose prose-sm max-w-none text-foreground [&_a]:text-primary [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold"><ReactMarkdown>{m.content.replace("[[CONSENT]]", "")}</ReactMarkdown>
                  {m.content.includes("[[CONSENT]]") && i === messages.length - 1 && !busy && (
                    <ConsentCard mode={mode} t={consent.t} onDone={(c) => { setConsents(c); void send(CONSENT_MARK + JSON.stringify(c), c); }} />
                  )}</div>
              </div>
            ),
          )}
          {busy && (
            <div className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary"><Sprout className="size-4" /></span>
              <span className="flex gap-1">{[0, 1, 2].map((d) => <span key={d} className="typing-dot size-2 rounded-full bg-primary" style={{ animationDelay: `${d * 0.15}s` }} />)}</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>
      <div className="px-4 pb-4">
        <div className="mx-auto max-w-2xl">
          {voiceNote && <p className="mb-2 text-center text-xs text-muted-foreground">{t.reviewVoice}</p>}
          <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex items-end gap-2 rounded-3xl border border-input bg-background p-2 shadow-soft focus-within:border-primary">
            <textarea
              ref={taRef} value={text} rows={1} maxLength={4000} placeholder={rec === "transcribing" ? t.transcribing : t.placeholder}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground field-sizing-content"
            />
            <button type="button" onClick={toggleRec} disabled={rec === "transcribing"} aria-label={rec === "recording" ? t.stop : t.record}
              className={`flex size-10 shrink-0 items-center justify-center rounded-full transition ${rec === "recording" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-primary hover:bg-accent"}`}>
              {rec === "transcribing" ? <Loader2 className="size-5 animate-spin" /> : rec === "recording" ? <Square className="size-4" /> : <Mic className="size-5" />}
            </button>
            <button type="submit" disabled={!text.trim() || busy} aria-label={t.send}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition disabled:opacity-40">
              {busy ? <Loader2 className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConsentAnswer({ mode, raw, t }: { mode: "sell" | "buy"; raw: string; t: ConsentT }) {
  let c: Record<string, boolean> = {};
  try { c = JSON.parse(raw); } catch { /* ignore */ }
  const items = mode === "sell" ? [["phone_public", t.phonePublic, t.phonePublicNo], ["contact_ack", t.contactAck, t.contactAckNo]] : [["contact_share", t.buyerShare, t.buyerShareNo]];
  return (
    <div className="ml-auto max-w-[85%] space-y-1 rounded-3xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
      {items.filter(([k]) => c[k!] !== undefined).map(([k, yes, no]) => <p key={k}><strong>{c[k!] ? t.yes : t.no}</strong> — {c[k!] ? yes : no}</p>)}
    </div>
  );
}

type ConsentT = { phonePublicNo: string; contactAckNo: string; buyerShareNo: string; phonePublic: string; contactAck: string; buyerShare: string; yes: string; no: string; confirm: string };
function ConsentCard({ mode, t, onDone }: { mode: "sell" | "buy"; t: ConsentT; onDone: (c: Record<string, boolean>) => void }) {
  const items = mode === "sell" ? [["phone_public", t.phonePublic], ["contact_ack", t.contactAck]] : [["contact_share", t.buyerShare]];
  const [v, setV] = useState<Record<string, boolean>>({});
  return (
    <div className="not-prose mt-3 flex flex-col gap-3 rounded-2xl border border-border bg-secondary p-4">
      {items.map(([k, label]) => (
        <div key={k} className="flex flex-col gap-2">
          <p className="text-sm text-foreground">{label}</p>
          <div className="flex gap-2">
            {[true, false].map((b) => (
              <button key={String(b)} type="button" onClick={() => setV((p) => ({ ...p, [k!]: b }))}
                className={`min-w-20 rounded-full px-4 py-2 text-sm font-semibold transition ${v[k!] === b ? "bg-primary text-primary-foreground" : "bg-background text-primary border border-input"}`}>
                {b ? t.yes : t.no}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" disabled={items.some(([k]) => v[k!] === undefined)} onClick={() => onDone(v)}
        className="self-start rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">{t.confirm}</button>
    </div>
  );
}
