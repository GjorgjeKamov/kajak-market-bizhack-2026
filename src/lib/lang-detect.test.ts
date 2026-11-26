import { describe, it, expect } from "vitest";
import { pickLanguage } from "./lang-detect";

describe("pickLanguage", () => {
  it("Macedonia -> Macedonian", () => expect(pickLanguage({ country: "MK", browser: ["en-US"] })).toBe("mk"));
  it("Macedonia with Albanian browser -> Albanian", () => expect(pickLanguage({ country: "MK", browser: ["sq-AL"] })).toBe("sq"));
  it("Hungary -> Hungarian", () => expect(pickLanguage({ country: "HU", browser: ["en"] })).toBe("hu"));
  it("Austria -> German", () => expect(pickLanguage({ country: "AT" })).toBe("de"));
  it("Kosovo -> Albanian", () => expect(pickLanguage({ country: "XK" })).toBe("sq"));
  it("Switzerland French browser -> French", () => expect(pickLanguage({ country: "CH", browser: ["fr-CH"] })).toBe("fr"));
  it("no country -> browser language", () => expect(pickLanguage({ country: null, browser: ["it-IT"] })).toBe("it"));
  it("unsupported everything -> English", () => expect(pickLanguage({ country: "JP", browser: ["ja"] })).toBe("en"));
  it("manual choice beats location", () => expect(pickLanguage({ stored: "de", country: "MK" })).toBe("de"));
});
