# CollabPro

Real-time team collaboration platform (documents + boards + tasks). This
repository is currently in the **Foundations phase**: routing, design system,
and deploy pipeline only — no auth, database, or real-time backend yet.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui-style
components · Prisma/PostgreSQL (planned) · Socket.io (planned) · Redis
(planned) · NextAuth.js (planned)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the result.

## Routes

| Route                    | Purpose                                   |
| ------------------------- | ------------------------------------------ |
| `/`                        | Landing page                              |
| `/login`, `/signup`        | Auth placeholders (no AppShell)           |
| `/dashboard`                | Workspace overview                        |
| `/documents/[id]`           | Document editor placeholder               |
| `/settings`                 | Organization/team settings                |
| `/settings/audit-logs`      | Audit log placeholder                     |
| `/health`                   | Renders data fetched from `/api/health`   |
| `/api/health`               | Health check route handler (mock data)    |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values before connecting
a database or auth provider:

```bash
cp .env.example .env.local
```

None of these are required to run the Foundations-phase app locally — they
exist for the phases that follow (DB, auth, real-time).

## Deploy

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
   Vercel auto-detects the Next.js framework — no build configuration needed.
3. Before the first deploy (or any time after, under **Project → Settings →
   Environment Variables**), add the variables listed in `.env.example`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production URL, e.g. `https://your-app.vercel.app`)
   - `REDIS_URL`

   These aren't required for the Foundations phase to build and deploy
   successfully, but adding them now avoids a redeploy later.
4. Click **Deploy**. Vercel will build and give you a preview URL immediately,
   plus a production URL on the default branch.
5. Every subsequent push to the connected branch triggers a new deployment
   automatically.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
