import { describe, expect, it } from "vitest";
import { missingFields, publicPhone, hashToken } from "./registration";

const seller = { full_name: "Petar", location: "Strumica", phone: "+38900000001" };
describe("registration completion", () => {
  it("seller is complete when declining public phone (private registration)", () => {
    expect(missingFields("sell", seller, 1, { phone_public: false, contact_ack: false })).toEqual([]);
  });
  it("unanswered consent is never treated as consent", () => {
    expect(missingFields("sell", seller, 1, {})).toEqual(["consent_phone_public", "consent_contact_ack"]);
  });
  it("seller without products stays incomplete", () => {
    expect(missingFields("sell", seller, 0, { phone_public: true, contact_ack: true })).toEqual(["products"]);
  });
  it("buyer needs name, phone, a request and the sharing answer", () => {
    expect(missingFields("buy", { full_name: "Ana" }, 0, {})).toEqual(["phone", "requests", "consent_contact_share"]);
    expect(missingFields("buy", { full_name: "Ana", phone: "+389" + "70000000" }, 1, { contact_share: false })).toEqual([]);
  });
});
describe("public phone", () => {
  const base = { phone: "+38900000001", phone_public_consent: true, status: "approved", registration_status: "completed", is_test: false };
  it("shown only with consent + approval + completed", () => {
    expect(publicPhone(base)).toBe("+38900000001");
    expect(publicPhone({ ...base, phone_public_consent: false })).toBeNull();
    expect(publicPhone({ ...base, status: "pending" })).toBeNull();
    expect(publicPhone({ ...base, registration_status: "incomplete" })).toBeNull();
  });
});
describe("session token", () => {
  it("hash is stable and not the token", async () => {
    const h = await hashToken("abc");
    expect(h).toHaveLength(64);
    expect(h).toBe(await hashToken("abc"));
    expect(h).not.toContain("abc");
  });
});
