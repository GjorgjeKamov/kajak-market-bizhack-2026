# KAJAK.MARKET

**Event:** BizHack AI Marketing Hackathon, Budapest, November 24–26, 2026
**Live site:** https://kajak.market (production; not connected to this repository copy)
**Licence:** MIT for the hackathon source code; see [LICENSE](LICENSE) for scope.

## The business challenge

Small farmers, livestock farmers and producers in Macedonia struggle to reach buyers. Many are
private individuals with no website, no company and little time for forms. Buyers (shops,
restaurants, individuals) have no easy way to find who produces what, how much, when and at what price.
Manual onboarding by phone is slow and does not scale.

## The AI-powered solution

KAJAK.MARKET replaces forms with a short conversation, typed or spoken, in the visitor's language.
An AI assistant turns the conversation into a structured profile and connects buyers to matching
approved producers.

- **Seller onboarding**: name, city or village, phone, products (quantity produced, quantity for
  sale, unit, season, price, currency, delivery). No company documents, tax or VAT numbers are asked.
- **Buyer onboarding**: name, phone, what they need, how much, where and when, target price. Company is optional.
- **Voice input**: recorded audio is transcribed (`openai/gpt-transcribe` through the Lovable AI Gateway) and never stored by the app.
- **Multilingual**: 20 static UI dictionaries; language = manual choice > hosting country header > browser > English. A language picker works mid-conversation without losing data.
- **Automatic saving**: every turn updates one profile per chat session (only the SHA-256 of a random device token is stored), so incomplete registrations can resume on the same device and are visible to the admin. Incomplete ones are deleted after 30 days of inactivity.
- **Structured extraction**: keeps explicit currencies (MKD/EUR, денари/евра, €), separates produced vs. for-sale quantities, keeps units, asks when unclear, never invents amounts; corrections apply per product.
- **Matching**: only approved, non-test, completed producers; prices compared only in the same currency (no conversion).
- **Privacy and consent**: explicit Yes/No buttons (seller public phone, buyer contact sharing). Silence is never consent. Phones are shown only with consent. Privacy request form (phone or email). Admin role only via pre-approved invite. Anonymous visitors have no direct table access (RLS); all writes go through validated server functions.
- **Admin dashboard** (`/admin`): approve, deactivate, edit, delete, REAL/TEST labels, CSV export, legal translation review.

## Technology stack

TanStack Start v1 (React 19, SSR, server functions) · Vite 7 · Tailwind CSS v4 · shadcn/ui ·
Supabase-compatible Postgres + Auth (Lovable Cloud in production) · Drizzle migrations ·
Lovable AI Gateway (`@lovable.dev/ai-gateway`; chat model `openai/gpt-5.6-luna`) · Zod · Vitest ·
Cloudflare Workers-compatible build.

## Prerequisites

- Bun ≥ 1.1 (or Node 20+ with npm)
- Your own **separate test** Supabase project (cloud or `supabase start` locally). Never production.
- Your own Lovable AI Gateway API key (`LOVABLE_API_KEY`). Without it the UI loads but the chat and voice features return "AI unavailable". There is no fake AI mode.

## Installation

```sh
git clone https://github.com/<your-org>/kajak-market-bizhack-2026.git
cd kajak-market-bizhack-2026
bun install
cp .env.example .env     # then fill in TEST values only
```

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | browser | test project URL + publishable key |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | server | same test project |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | admin client used by server functions |
| `LOVABLE_API_KEY` | server only | AI chat and transcription |
| `LOVABLE_DB_MIGRATION_URL` | CLI only | Postgres URL of the test DB for migrations |

The defaults in `.env.example` are placeholders; with them the app cannot reach any database.

### Database setup

Migrations in `drizzle/migrations/` target a Supabase database (they use `auth.users`, `auth.uid()` and the `anon`/`authenticated`/`service_role` roles).

```sh
# Option A: drizzle-kit
bunx drizzle-kit migrate
# Option B: psql, in order
for f in drizzle/migrations/0*.sql; do psql "$LOVABLE_DB_MIGRATION_URL" -f "$f"; done
```

### Synthetic sample data (test environment only)

```sh
psql "$LOVABLE_DB_MIGRATION_URL" -f seed/sample_data.sql
```

18 fictional producers (45 products, MKD and EUR prices, varied seasons and quantities) and 10
fictional buyers with one request each. All names are invented, emails use `example.com`/`example.org`,
phones are non-contactable `+38900000xxx` placeholders. Nothing was copied or anonymised from real
records. Rows use `is_test = false` so they appear in matching **inside the test database**.
See [seed/MATCHING_SCENARIOS.md](seed/MATCHING_SCENARIOS.md) for 10 scenarios.

### Admin account (test)

Insert your test email into `public.admin_invites`, sign up at `/admin`, confirm the email, then sign in.
`claim_first_admin()` grants the role only to a confirmed, invited email.

## Running and testing

```sh
bun run dev        # http://localhost:8080 (or the port Vite prints)
bun run test       # unit tests (registration rules, matching, currencies, language, routing)
bun run build      # production build
```

## Lovable-specific dependencies

- `@lovable.dev/vite-tanstack-config` – Vite preset (TanStack Start, Tailwind, Cloudflare target).
- `@lovable.dev/ai-gateway` – AI calls; needs `LOVABLE_API_KEY`. Replacing it with another provider requires editing `src/lib/market.server.ts` and the transcription call in `src/lib/market.functions.ts`.
- `src/integrations/supabase/*` – generated clients; work with any Supabase project via the env variables above.

## Known limitations

- Prices are never converted between currencies; mixed-currency requests do not use price in ranking.
- Country detection relies on hosting headers (e.g. `cf-ipcountry`); locally it falls back to the browser language.
- Legal texts are drafted for the operator in Macedonia; translations are shown only after admin approval.
- Contact between buyer and seller happens outside the platform; no payments or deal tracking.
- AI extraction can make mistakes; the assistant asks for clarification but an admin review step remains.

## Results

### 1. Recorded marketplace activity (production, excluding records marked as test)

As supplied by the team, **November 26, 2026, 10:30 CET**:

| Metric | Value |
|---|---:|
| Registered producers | 44 |
| Approved producers | 43 |
| Agricultural product listings | 157 |
| Registered buyers | 3 |
| Recorded buyer–producer matches | 7 |
| Initiated registrations | 86 |
| Incomplete registrations | 39 |

**November 26, 2026, 10:49 CET:** 3,698 recorded website visits (visits/sessions, not unique visitors).

A "match" is a system-suggested connection; **no completed sales are claimed or tracked.**

### 2. Measured registration times (latest supplied figures)

- Average seller registration: **6 min 7 s**
- Average buyer registration: **3 min 36 s**

### 3. Controlled test results

Unit tests in `src/lib/*.test.ts` and `src/test/` cover completion rules, consent handling, currency normalisation and same-currency matching. Controlled test chats during development were marked as test data and are excluded from the figures above.

### 4. Illustrative projections

Any comparison to manual onboarding is an estimate only. A 15-minute manual onboarding baseline
will be included only once confirmed by the challenge owner.

## Provenance

Developed during the hackathon in Lovable (first application commit 2026-11-25 08:53 UTC, built on a template
created 2026-11-23). The full development history is kept in a private repository and can be
shown to the jury on request. This public copy starts with a clean history and contains no production configuration or customer data.
