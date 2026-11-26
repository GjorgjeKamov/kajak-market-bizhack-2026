import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The banner rule is what this file checks, so the surrounding app chrome is stubbed out.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/components/market/Footer", () => ({ Footer: () => null }));
vi.mock("@/lib/i18n", () => ({ useLang: () => ({ t: { translating: "Translating…" } }) }));

import { LegalPage } from "@/components/market/LegalPage";
import { LEGAL, LEGAL_REVIEWED, publicBanner } from "@/lib/legal-texts";

const DRAFT = "Draft pending legal review. The English text is the original.";

describe("Legal page draft banner", () => {
  it("hides the draft banner now that legal review is confirmed", () => {
    expect(LEGAL_REVIEWED.privacy).toBe(true);
    expect(LEGAL_REVIEWED.terms).toBe(true);
    const { container } = render(
      <LegalPage title="Privacy Policy" banner={publicBanner("privacy", LEGAL.privacy.text)}>
        body
      </LegalPage>,
    );
    expect(screen.queryByText(DRAFT)).toBeNull();
    expect(container.querySelector(".bg-secondary")).toBeNull();
    expect(container.textContent).toContain("Privacy Policy");
  });

  it("shows the banner again for a document still pending review", () => {
    const saved = { ...LEGAL_REVIEWED };
    try {
      LEGAL_REVIEWED.privacy = false;
      expect(publicBanner("privacy", { banner: DRAFT })).toBe(DRAFT);
      const { container } = render(
        <LegalPage title="Privacy Policy" banner={publicBanner("privacy", { banner: DRAFT })}>
          body
        </LegalPage>,
      );
      expect(screen.getByText(DRAFT)).toBeTruthy();
    } finally {
      Object.assign(LEGAL_REVIEWED, saved);
    }
  });

  it("hides a translated banner too, so no empty box remains", () => {
    const translated = { banner: "Tervet, jogi ülevaatus ootel. Ingliskeelne tekst on originaal." };
    const { container } = render(
      <LegalPage title="Privaatsuspoliitika" banner={publicBanner("privacy", translated)}>
        body
      </LegalPage>,
    );
    expect(screen.queryByText(translated.banner)).toBeNull();
    expect(container.querySelector(".bg-secondary")).toBeNull();
  });

  it("keeps every document text and version untouched", () => {
    expect(LEGAL.privacy.version).toBe("2026-11-6");
    expect(LEGAL.terms.version).toBe("2026-11-4");
    expect(LEGAL.consent.version).toBe("2026-11-4");
    expect(LEGAL.privacy.text.banner).toBe(DRAFT);
    expect(LEGAL.terms.text.banner).toBe(DRAFT);
  });
});
