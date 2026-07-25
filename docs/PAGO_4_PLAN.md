# Pago 4 — Registration, activation, and accredited verification

Operational plan (EN). Client-facing summary lives in [PLAN_ENTREGA_10_PAGOS.md](PLAN_ENTREGA_10_PAGOS.md) § Pago 4.

---

## Product rules (confirmed + updated)

| Topic | Decision |
|--------|----------|
| View projects | **Public** — no account required |
| Signup | Email/password **or** Google OAuth; investor **questionnaire** after email verification |
| Account activation | **1)** confirm email → **2)** complete profile → **3)** admin approves in panel |
| Rejected accounts | No rejection email; logged-in users see `/account/rejected`; fresh sign-in blocked |
| Accredited investor | Documents stored in DB; admin reviews in user panel |
| Accreditation entry points | **Two:** (a) **Invest Now** on property page, (b) **My Account** → start/resubmit accreditation |
| Google OAuth | **Same gates** as email/password |
| My Account (active investors) | Profile basics, change password (credentials), accreditation status + upload |

Public browsing: `/projects`, `/properties/[investmentId]` — no gating.

---

## Data model

**User** (investors): `accountStatus`, email verification fields, `profile` (JSON questionnaire), `accreditedStatus`, password reset fields. Default `type: INVESTOR` on public registration.

**InvestorDocument**: `userId`, `kind`, `fileUrl`, `fileName`, `mimeType`, `uploadedAt`.

**InvestmentIntent** (stub): audit when user starts invest flow from a property before Pago 7.

Migration: `prisma/migrations/20260601120000_pago4_user_auth/`

---

## User journeys

### A. Email/password registration

1. `/register` (email + password) → `PENDING_EMAIL` → verification email
2. Auto sign-in → `/register/check-email`
3. Click email link → `/register/verified`
4. `/account/complete-profile` (questionnaire) → `PENDING_ADMIN` + admin notify email
5. `/account/pending` while waiting
6. Admin approves → `ACTIVE` + approval email → dashboard/portfolio
7. Admin rejects → `REJECTED` → `/account/rejected` (no email)

### B. Google registration

1. Google OAuth → new user `PENDING_EMAIL` or `PENDING_ADMIN` (if Google email verified)
2. `/account/complete-profile` if questionnaire incomplete
3. Same pending → approve/reject path as above

### C. Accredited investor (after `ACTIVE`)

1. **Entry A:** property page → **Invest Now** → `/properties/[investmentId]/invest`
2. **Entry B:** `/dashboard/account` → accreditation section → `/dashboard/account/accreditation`
3. Self-certify + upload docs → `PENDING_REVIEW` (+ optional `InvestmentIntent` when from property)
4. Admin approves/rejects accredited status in `/admin/users`
5. If `APPROVED` → invest CTA advances to **placeholder** until Pago 7 (deposit / real `Investment`)

### D. Password

- Forgot / reset (logged out): `/forgot-password`, `/reset-password`
- Change while logged in: **My Account → Security** (credentials users only)

---

## Routes & APIs

### Investor-facing screens

| Area | Path | Status |
|------|------|--------|
| Register | `/register` | Done |
| Check email | `/register/check-email` | Done |
| Email verified | `/register/verified` | Done |
| Verify failed | `/register/verify-failed` | Done |
| Complete profile | `/account/complete-profile` | Done |
| Pending admin | `/account/pending` | Done |
| Rejected | `/account/rejected` | Done |
| Login | `/login` | Done |
| Forgot / reset password | `/forgot-password`, `/reset-password` | Done |
| Dashboard | `/dashboard` | Done (hub; My Account card pending) |
| Portfolio | `/dashboard/portfolio` | Done |
| **My Account** | `/dashboard/account` | Done |
| **Accreditation (standalone)** | `/dashboard/account/accreditation` | Done |
| Invest / accreditation (property) | `/properties/[investmentId]/invest` | Done (needs shared form refactor) |

### APIs

| API | Status |
|-----|--------|
| `POST /api/auth/register` | Done |
| `GET /api/auth/verify-email` | Done |
| `POST /api/auth/resend-verification` | Done |
| `POST /api/auth/complete-profile` | Done |
| `POST /api/auth/forgot-password` | Done |
| `POST /api/auth/reset-password` | Done |
| NextAuth `[...nextauth]` (credentials + Google, session fields) | Done |
| `GET/POST /api/investor/accreditation` | Done |
| `GET /api/investor/account` | Done |
| `PATCH /api/investor/profile` | Done |
| `POST /api/investor/change-password` | Done |
| `POST /api/admin/users/[id]/account-status` | Done |
| `POST /api/admin/users/[id]/accredited-status` | Done |
| `GET /api/admin/users/pending-count` | Done |

Uploads: Cloudflare R2 (private bucket for investor docs; public bucket for property images). Dev defaults to `public/uploads/` unless `STORAGE_DRIVER=r2`. See README “File storage (R2)”.

---

## Transactional email

| Email | When | Status |
|-------|------|--------|
| Verification | After register | Done |
| Password reset | Forgot password | Done |
| Account approved | Admin approves account | Done |
| Admin alert (pending investor) | Profile completed | Done |
| Profile submitted (to user) | — | **Removed** (by design) |
| Account rejected | — | **Not sent** (by design) |
| Accreditation submit/approve/reject | — | **Deferred** (optional Pago 8) |

Branded HTML, logo inline, EN/ES by user locale at send time.

---

## Auth gates & routing

| Status | Sign-in (new) | Dashboard / portfolio |
|--------|---------------|------------------------|
| `PENDING_EMAIL` | Blocked (credentials) | Blocked → check email |
| `PENDING_ADMIN` | Allowed | Blocked → `/account/pending` |
| `ACTIVE` | Full | Full (requires completed profile) |
| `REJECTED` | Blocked | Blocked → `/account/rejected` (if session still valid) |

Session JWT: `accountStatus`, `accreditedStatus`, `profileComplete`, `emailVerified`, `provider`.

- Session **refreshed from DB** on each read (approval/rejection without re-login)
- Middleware + layout guards on `/dashboard/*`
- Nav resolves dashboard/portfolio hrefs to correct onboarding path

---

## Admin (Pago 4 scope)

| Capability | Status |
|------------|--------|
| User queue filters (pending email, pending approval, accreditation review) | Done |
| View investor questionnaire profile | Done |
| Approve / reject **account** | Done |
| View uploaded investor documents | Done |
| Approve / reject **accredited** status + internal note | Done |

---

## Implementation status summary

### Done

- Full onboarding: register → verify → complete profile → pending → approve/reject
- Branded transactional emails (verification, reset, approval, admin notify)
- Google OAuth with same gates
- Dashboard + portfolio gating
- Invest Now gating + property-linked accreditation upload
- Admin account + accreditation review
- Rejected account page (no reason shown; contact CTA)
- Live session status sync
- EN/ES copy for Pago 4 screens
- Sticky footer layout (site min-height without per-page empty scroll)

- My Account hub, standalone accreditation page, profile/password APIs
- Dashboard + nav links to My Account
- Shared `AccreditationForm` (property invest + account paths)

### Pending (close Pago 4)

- Invest Now UX polish for all `accreditedStatus` states
- QA pass on staging + `prisma migrate deploy`

### Explicitly out of scope (later payments)

| Item | Payment |
|------|---------|
| Deposit / wire confirmation | Pago 7 |
| Creating `Investment` rows from investor UI | Pago 7 |
| Secure investor doc CDN / signed downloads | Pago 6 |
| Project progress % on listings / portfolio | Pago 5 |
| Notification center + project update emails | Pago 8 |
| Financial history, distributions, reinvest UI | Pago 9 |
| Edit full questionnaire after onboarding | Not planned (contact us) |
| Replace individual accreditation docs before review | Not planned (v2) |

---

## Env / ops

- `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Email: `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Production SMTP: licensed Workspace **user** (or alias), not Groups
- Optional: `ADMIN_NOTIFY_EMAIL` — comma-separated override for admin alerts (when set, replaces `admin@goldenstatecapitalmgt.com`; use personal Gmail in dev)

---

## QA checklist

- [x] Public can open projects without login
- [x] Email signup → verify → complete profile → admin pending → approve → dashboard
- [x] Google signup → questionnaire → pending admin → same path
- [x] Pending cannot access portfolio (middleware + layout)
- [x] Rejected user sees `/account/rejected` (not pending) when session active
- [x] Rejected user blocked on fresh sign-in
- [x] Invest click → accreditation upload → admin approve → invest placeholder
- [x] EN/ES for onboarding screens
- [x] My Account: profile edit, change password, accreditation from account
- [ ] Accreditation resubmit after `REJECTED` accredited status
- [ ] `prisma migrate deploy` on staging/prod
