import { describe, expect, it } from "vitest";
import { CHAT_MODEL, stripKeywords, withConsentButtons } from "./market.server";

describe("registration chat cost rules", () => {
  it("uses the low-cost model with no expensive fallback", () => {
    expect(CHAT_MODEL).toBe("openai/gpt-5.6-luna");
  });
  it("server adds Yes/No consent buttons once the phone is known and consent is unanswered", () => {
    expect(withConsentButtons("Saved.", ["consent_phone_public"], true)).toContain("[[CONSENT]]");
  });
  it("model cannot show consent buttons before a phone number exists", () => {
    expect(withConsentButtons("Saved. [[CONSENT]]", ["phone", "consent_phone_public"], false)).not.toContain("[[CONSENT]]");
  });
  it("no consent buttons after consent was answered", () => {
    expect(withConsentButtons("Done [[CONSENT]]", [], true)).not.toContain("[[CONSENT]]");
  });
  it("buyer search keywords are never appended twice", () => {
    expect(stripKeywords("Watermelon (watermelon, лубеници, lubenici) (watermelon, лубеници)")).toBe("Watermelon");
  });
});

import { normalizeCurrency } from "./market.server";
describe("currency is preserved, never guessed", () => {
  it("denars map to MKD", () => { for (const c of ["денари", "ден", "den", "MKD"]) expect(normalizeCurrency(c)).toBe("MKD"); });
  it("euros map to EUR", () => { for (const c of ["евра", "€", "evra", "EUR"]) expect(normalizeCurrency(c)).toBe("EUR"); });
  it("missing currency stays empty", () => { expect(normalizeCurrency(null)).toBeNull(); });
});
