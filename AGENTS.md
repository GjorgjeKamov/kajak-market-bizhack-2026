<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## KAJAK.MARKET architecture
- Chat agent lives in src/lib/market.server.ts: one low-cost model call per message (update-profile tool carries assistant_reply; a 2nd call only on save errors, first completion or buyer results), static instructions for prompt caching, and a structured APP STATE (saved profile + missing fields) plus a short recent-history window instead of the full chat; the server, not the model, decides when consent buttons show and completes registrations — to keep AI cost low without losing data; all public writes go through server functions in src/lib/market.functions.ts using the admin client after zod validation — anonymous visitors have no table access via RLS.
- Matching only returns approved, non-test producers and exposes phone only when phone_public_consent is true, so the AI never sees contacts it may not show.
- Each chat has a random 256-bit token kept in the visitor's localStorage; the server stores only its SHA-256 (session_hash) and upserts the same producer/buyer by it, replacing product/request lists, so auto-save never duplicates and nobody can reach another profile.
- Completion rules live in src/lib/registration.ts (missingFields/publicPhone); DB triggers block approving incomplete producers and force legacy session-less inserts to have required fields.
- Admin access = `admin` row in public.user_roles; `claim_first_admin()` grants it only to a confirmed email listed in public.admin_invites (no client access), so visitors cannot self-promote.
- Legal/consent texts live in src/lib/legal-texts.ts (versioned English source); visitors only see translations with status 'approved' in public.legal_translations for the current version, otherwise English — so unreviewed AI legal text is never presented as official.
- UI strings are static in src/lib/i18n-dicts.ts (no runtime translation); language = manual choice (localStorage) > hosting country header (cf-ipcountry) > browser > English.
