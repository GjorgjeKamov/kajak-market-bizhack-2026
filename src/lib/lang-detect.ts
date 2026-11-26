// Pure language-selection logic (shared by client and tests).
export const SUPPORTED = ["en","mk","sq","sr","bg","el","tr","hr","sl","sk","cs","pl","ro","hu","de","fr","it","es","pt","nl"] as const;
export type Lang = (typeof SUPPORTED)[number];

// Country -> local languages (first = default for multilingual countries).
export const COUNTRY_LANGS: Record<string, Lang[]> = {
  MK: ["mk", "sq"], HU: ["hu"], DE: ["de"], AT: ["de"], LI: ["de"], CH: ["de", "fr", "it"],
  FR: ["fr"], MC: ["fr"], BE: ["nl", "fr", "de"], LU: ["fr", "de"], IT: ["it"], SM: ["it"],
  AL: ["sq"], XK: ["sq", "sr"], RS: ["sr"], ME: ["sr"], BA: ["hr", "sr"], BG: ["bg"],
  GR: ["el"], CY: ["el", "tr"], TR: ["tr"], HR: ["hr"], SI: ["sl"], SK: ["sk"], CZ: ["cs"],
  PL: ["pl"], RO: ["ro"], MD: ["ro"], ES: ["es"], MX: ["es"], AR: ["es"], PT: ["pt"], BR: ["pt"],
  NL: ["nl"], GB: ["en"], US: ["en"], IE: ["en"], AU: ["en"], NZ: ["en"], CA: ["en", "fr"],
};

const isLang = (l: string): l is Lang => (SUPPORTED as readonly string[]).includes(l);
const base = (l: string) => {
  const b = l.toLowerCase().split(/[-_]/)[0] ?? "";
  return b === "bs" || b === "sh" ? "hr" : b;
};

export function pickLanguage(opts: { stored?: string | null; country?: string | null; browser?: readonly string[] }): Lang {
  if (opts.stored && isLang(opts.stored)) return opts.stored;
  const browser = (opts.browser ?? []).map(base);
  const local = opts.country ? COUNTRY_LANGS[opts.country.toUpperCase()] : undefined;
  if (local?.length) return local.find((l) => browser.includes(l)) ?? local[0]!;
  return (browser.find(isLang) as Lang | undefined) ?? "en";
}
