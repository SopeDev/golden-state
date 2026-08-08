This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

## Invest meeting links (post-accreditation)

Accredited investors schedule a call before wiring. Bank details are **never** shown in-app or emailed.

| Env var | Purpose |
|---------|---------|
| `NEXT_PUBLIC_INVEST_WHATSAPP_PHONE` | WhatsApp number with country code, digits only (e.g. `15205551234`) |

## File storage (R2)

Investor accreditation documents and property images are stored on **Cloudflare R2** in production (Vercel’s filesystem is read-only).

| Env var | Purpose |
|---------|---------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_PRIVATE` | Private bucket for investor docs (no public access) |
| `R2_BUCKET_PUBLIC` | Public bucket for property images |
| `R2_PUBLIC_BASE_URL` | Public base URL for the public bucket (R2 custom domain or `https://pub-….r2.dev`) |
| `STORAGE_DRIVER` | Optional: `local` (force disk under `public/uploads`), `r2` (force R2 even in dev). Production always uses R2 unless `STORAGE_DRIVER=local`. |

Investor docs are never exposed as public URLs. Preview/download goes through `GET /api/investor-documents/[id]` (admin or owning investor only).

Local development defaults to writing under `public/uploads/` so you can work without R2 credentials.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Set the R2 env vars above in the Vercel project, then redeploy.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
