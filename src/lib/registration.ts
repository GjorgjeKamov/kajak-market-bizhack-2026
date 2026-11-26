// Pure rules for auto-saved registrations (shared by server and tests).
export type Consents = { phone_public?: boolean | undefined; contact_ack?: boolean | undefined; contact_share?: boolean | undefined };

export const CONSENT_MARK = "[[CONSENT_ANSWERED]]";

const has = (v: unknown) => typeof v === "string" ? v.trim().length > 0 : v != null;

/** Essential info still missing. Empty list = registration is completed. Silence is never consent. */
export function missingFields(
  mode: "sell" | "buy",
  p: { full_name?: string | null; location?: string | null; phone?: string | null },
  items: number,
  consents: Consents,
): string[] {
  const m: string[] = [];
  if (!has(p.full_name)) m.push("full_name");
  if (mode === "sell" && !has(p.location)) m.push("location");
  if (!has(p.phone)) m.push("phone");
  if (items < 1) m.push(mode === "sell" ? "products" : "requests");
  if (mode === "sell") {
    if (consents.phone_public === undefined) m.push("consent_phone_public");
    if (consents.contact_ack === undefined) m.push("consent_contact_ack");
  } else if (consents.contact_share === undefined) m.push("consent_contact_share");
  return m;
}

/** Phone is only ever shown to buyers with explicit consent on an approved, completed, real profile. */
export function publicPhone(pr: { phone: string | null; phone_public_consent: boolean; status: string; registration_status: string; is_test: boolean }) {
  return pr.phone_public_consent && pr.status === "approved" && pr.registration_status === "completed" && !pr.is_test ? pr.phone : null;
}

export async function hashToken(token: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
