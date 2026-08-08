# Pago 6 — Post-accreditation invest flow

No in-platform payments. Wire details are shared only on call / in person.

## Investor path

1. Accredited → `/properties/[id]/invest`
2. Enter intended amount (min $5,000) and choose **Video call**, **Phone call**, or **In person** (all open WhatsApp with that preference) → `InvestmentIntent` = `MEETING_REQUESTED`
   - Opening WhatsApp does **not** confirm a meeting; ops confirm in WhatsApp
   - Investor can track status under **My account → Investment requests** (also linked from Dashboard)
   - Emails: investor confirmation + admin alert
3. Admin (Investments → Meeting requests) clicks **Approve for investment** → `AWAITING_WIRE`
   - Email: investor notified to confirm deposit (no wire details in email)
4. Investor sees **Confirm your deposit** step → amount + receipt
5. Admin confirms deposit → `FundingContribution` + portfolio

Deposit submit is blocked in the API unless intent status is `AWAITING_WIRE`.

## Admin path

- **Investments → Meeting requests**: **Approve for investment** (`AWAITING_WIRE`) / cancel
- **Deposit queue**: confirm/reject; view receipt
- **Add deposit + “Confirm now”**: live-call shortcut (creates contribution immediately)
- **Contributions**: assign investor or manual capital

## Env

- `NEXT_PUBLIC_INVEST_WHATSAPP_PHONE` (digits + country code)
