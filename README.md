# Project Union HQ

Consulting engagement management tool for **Designers Guild** — built for the Project Union engagement. McKinsey-style deliverable interface covering diagnostics, scenario modelling, strategy pillars, recommendations, and a 2-year plan.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (Postgres via `@supabase/supabase-js`)
- **Tailwind CSS v4** with custom design tokens
- **xlsx** for Excel import/export
- **Anthropic Claude** for the built-in strategy chat panel

---

## 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migration:
   ```
   supabase/migrations/20240101000000_project_union.sql
   ```
   This creates all tables and seeds illustrative data for Designers Guild.
3. From **Project Settings → API**, copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role)

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Anthropic keys

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to the Engagement Calendar.

---

## 3. Vercel Deployment

1. Push this repo to GitHub.
2. Import into [Vercel](https://vercel.com/new).
3. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` → your Vercel deployment URL (e.g. `https://project-union.vercel.app`)
4. Deploy. Vercel will detect Next.js automatically.

---

## Modules

| Module | Audience | Path |
|--------|----------|------|
| Engagement Calendar | Internal | `/calendar` |
| Diagnostic Tree | Internal | `/tree` |
| Workstream Explorer | Internal | `/workstream` |
| Scenario Modeller | **Client** | `/scenarios` |
| Strategy Pillars | **Client** | `/pillars` |
| Recommendations | **Client** | `/recommendations` |
| 2-Year Plan | **Client** | `/plan` |

The Claude chat panel is always visible on the right (collapsible). It has live access to all Supabase data and can create tasks, options, and recommendations via `<action>` blocks.

---

## Excel Import/Export

- **Diagnostic Tree → Import**: `.xlsx` with columns `node` (label) and `value` — upserts by label match.
- **Diagnostic Tree → Export**: downloads all tree nodes as `.xlsx`.

---

## Environment Variables Reference

See `.env.example` for all required variables.
