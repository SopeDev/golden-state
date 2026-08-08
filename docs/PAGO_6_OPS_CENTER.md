# Pago 6 — Centro de operación (admin)

Assign and manage capital without touching the database. Funded amount = sum of **ACTIVE** `FundingContribution` rows (investor + manual).

## Models

### `FundingContribution` (ledger)

| Field | Notes |
|-------|--------|
| `source` | `INVESTOR` or `MANUAL` |
| `userId` | Required for investor; null for manual |
| `label` | Required for manual (e.g. “Partner wire”) |
| `status` | `ACTIVE` / `CANCELLED` (soft cancel keeps history) |
| `depositRequestId` | Set when created from a confirmed deposit |

### `DepositRequest` (wire queue)

| Status | Meaning |
|--------|---------|
| `PENDING` | Awaiting admin |
| `CONFIRMED` | Creates an `INVESTOR` contribution |
| `REJECTED` | No contribution; optional `adminNote` |

## Surfaces

- **Admin → Investments** (`/admin/investments`): contributions list + deposit queue
- **Admin → Property editor → Capital raise**: per-property ledger + quick add
- **Investor portfolio**: aggregated ACTIVE investor holdings only (manual never shown)

## APIs

- `GET/POST /api/admin/funding-contributions`
- `PATCH/DELETE /api/admin/funding-contributions/[id]` (DELETE = cancel)
- `GET/POST /api/admin/deposit-requests`
- `POST /api/admin/deposit-requests/[id]/confirm`
- `POST /api/admin/deposit-requests/[id]/reject`

## Out of scope (later)

- Investor self-serve “I deposited” UI
- Automatic emails on deposit confirm (Pago 8)
