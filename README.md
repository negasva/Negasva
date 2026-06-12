This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. Server-only
secrets (no `NEXT_PUBLIC_` prefix) must never be exposed to the browser.

## Keeping Supabase awake (free tier)

Supabase pauses free projects after ~7 days of inactivity. To avoid that
without upgrading to Pro, this app exposes a server-side keep-alive endpoint
that runs a real read query against the database:

```
GET /api/keepalive
```

- It uses the **service role key** (server-only) to run an authentic
  `SELECT` against the existing `prices` table — no inserts, no side effects.
- It responds `200 { "ok": true, ... }` only if the Supabase query actually
  succeeded; on failure it returns `503 { "ok": false }`.
- Responses are `Cache-Control: no-store`, so every ping truly hits the DB.

### Setup

1. In your hosting provider (Vercel), set `SUPABASE_SERVICE_ROLE_KEY`
   (and optionally `KEEPALIVE_SECRET`) as environment variables.
2. Create an **UptimeRobot** HTTP(s) monitor:
   - **URL:** `https://<your-domain>/api/keepalive`
     (if you set `KEEPALIVE_SECRET`, append `?token=<your-secret>`)
   - **Interval:** every 5–15 minutes (well within the free plan).
   - UptimeRobot treats `200 OK` as "up", so it keeps pinging and the
     project stays active.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
