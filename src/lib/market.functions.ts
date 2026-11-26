import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

async function limit(bucket: string, max: number, windowSec: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  const { data } = await supabaseAdmin.rpc("hit_rate_limit", { _key: `${bucket}:${ip}`, _max: max, _window_seconds: windowSec });
  if (data === true) throw new Error("RATE_LIMIT");
}

export const chatTurn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      mode: z.enum(["sell", "buy"]),
      lang: z.string().max(10),
      // Random 256-bit secret kept only on the visitor's device; the server stores just its SHA-256.
      sessionToken: z.string().regex(/^[a-f0-9]{64}$/),
      consents: z.object({ phone_public: z.boolean().optional(), contact_ack: z.boolean().optional(), contact_share: z.boolean().optional() }).default({}),
      elapsedSec: z.number().min(0).max(86400).default(0),
      messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    await limit("chat", 60, 600);
    const { runAgent, GatewayError } = await import("./market.server");
    const { hashToken } = await import("./registration");
    const sessionHash = await hashToken(data.sessionToken);
    // Cost guardrail per conversation (on top of the per-IP limit); generous for real farmers.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: over } = await supabaseAdmin.rpc("hit_rate_limit", { _key: `chat-session:${sessionHash}`, _max: 80, _window_seconds: 86400 });
    if (over === true) throw new Error("RATE_LIMIT");
    try {
      return await runAgent(data.mode, data.lang, data.messages, sessionHash, data.consents, { seconds: data.elapsedSec, turns: data.messages.filter((m) => m.role === "user").length });
    } catch (e) {
      console.error(e);
      if (e instanceof GatewayError) throw new Error("AI_UNAVAILABLE");
      throw e;
    }
  });

export const transcribe = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    if (!(d instanceof FormData)) throw new Error("Expected form data");
    const f = d.get("file");
    if (!(f instanceof Blob) || f.size === 0 || f.size > 15_000_000) throw new Error("Invalid audio");
    return { file: f, lang: String(d.get("lang") ?? "") };
  })
  .handler(async ({ data }) => {
    await limit("stt", 30, 600);
    const { transcribeAudio } = await import("@lovable.dev/ai-gateway");
    // Audio is forwarded for transcription only and never stored.
    const res = await transcribeAudio({ model: "openai/gpt-transcribe", file: data.file, ...(data.lang && data.lang.length === 2 ? { language: data.lang } : {}) });
    return { text: (res as { text?: string }).text ?? "" };
  });

export const submitPrivacyRequest = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/).nullable().default(null),
    email: z.string().trim().email().max(254).nullable().default(null),
    request_type: z.enum(["withdraw_consent", "correction", "deletion", "access_portability"]),
    details: z.string().max(2000).nullable().default(null),
    sessionTokens: z.array(z.string().regex(/^[0-9a-f]{64}$/)).max(2).default([]),
  }).refine((d) => !!d.phone || !!d.email, { message: "phone or email required" }))
  .handler(async ({ data }) => {
    await limit("privacy", 5, 3600);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashToken } = await import("./registration");
    // Fingerprint computed on the server; kept only if it matches a registration.
    // It helps admins locate the record but is never proof of identity.
    let session_hash: string | null = null;
    for (const tk of data.sessionTokens) {
      const h = await hashToken(tk);
      const [p, b] = await Promise.all([
        supabaseAdmin.from("producers").select("id").eq("session_hash", h).maybeSingle(),
        supabaseAdmin.from("buyers").select("id").eq("session_hash", h).maybeSingle(),
      ]);
      if (p.data || b.data) { session_hash = h; break; }
    }
    const { error } = await supabaseAdmin.from("privacy_requests").insert({ phone: data.phone, email: data.email, request_type: data.request_type, details: data.details, session_hash });
    if (error) throw new Error("Could not save request");
    return { ok: true };
  });

// Approximate country from hosting headers only; the IP is never stored.
export const detectCountry = createServerFn({ method: "GET" }).handler(async () => {
  const c = getRequestHeader("cf-ipcountry") ?? getRequestHeader("x-vercel-ip-country") ?? getRequestHeader("x-country-code") ?? null;
  return { country: c && /^[A-Z]{2}$/i.test(c) && c !== "XX" && c !== "T1" ? c.toUpperCase() : null };
});

const translateCache = new Map<string, Record<string, string>>();
export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator(z.object({ lang: z.string().regex(/^[a-z]{2}$/), version: z.string().max(40), texts: z.record(z.string(), z.string().max(4000)) }))
  .handler(async ({ data }) => {
    const key = `${data.lang}:${data.version}`;
    const hit = translateCache.get(key);
    if (hit) return hit;
    await limit("translate", 30, 600);
    const { generateResponse } = await import("@lovable.dev/ai-gateway");
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions: `Translate every value of the JSON object into the language with ISO code "${data.lang}". Keep keys, markdown, "KAJAK.MARKET", "KAJAK Agency" and "[TO COMPLETE...]" markers' brackets. Always write "Macedonia" in the target language as the country name (never add "North"). Return only the JSON object.`,
      input: [{ role: "user", content: JSON.stringify(data.texts) }] as never,
    });
    const text = res.output.flatMap((o) => (o.type === "message" ? o.content.map((c) => (c.type === "output_text" ? c.text : "")) : [])).join("");
    const m = text.match(/\{[\s\S]*\}/);
    const parsed = z.record(z.string(), z.string()).parse(JSON.parse(m ? m[0] : text));
    const out = Object.fromEntries(Object.keys(data.texts).map((k) => [k, parsed[k] ?? data.texts[k]!]));
    translateCache.set(key, out);
    return out;
  });
