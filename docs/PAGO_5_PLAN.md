# Pago 5 — Project status and progress

Operational plan (EN). Client-facing summary lives in [PLAN_ENTREGA_10_PAGOS.md](PLAN_ENTREGA_10_PAGOS.md) § Pago 5.

---

## Product rules (confirmed — adjust as we go)

| Topic | Decision |
|--------|----------|
| Project lifecycle | **Planning** → **In progress** → **Completed** |
| Progress | Integer **0–100%**, admin-editable |
| Dates | Optional **start date**, **target completion**, **completed at** |
| Public listings | Show status + progress on project cards and property detail |
| Portfolio | Show status + progress for properties the investor holds |
| Filters | Soft: distinguish completed vs in-course on listings (sections or badges first; filters optional) |
| Home Track Record | Keep using `COMPLETED`; planning/in-progress stay in live opportunities |

---

## Data model

**Property** additions:

| Field | Type | Notes |
|-------|------|--------|
| `status` | `PropertyStatus` | Expand enum: `PLANNING`, `IN_PROGRESS`, `COMPLETED` |
| `progressPercent` | `Int` | Default `0`, clamp 0–100 |
| `startDate` | `DateTime?` | Optional |
| `targetCompletionDate` | `DateTime?` | Optional |
| `completedAt` | `DateTime?` | Optional; set when marking completed if empty |

Migration: `migrations/YYYYMMDDHHMMSS_pago5_property_progress/`

---

## Surfaces

### Admin

- Property editor: status select (3 values), progress %, date fields
- List pills / filters include Planning
- APIs create/update persist new fields

### Public / investor

| Area | What shows |
|------|------------|
| `PropertyCard` | Status badge + progress bar |
| Property detail sidebar | Status, %, dates |
| Portfolio rows | Status + % |
| Home | Unchanged logic (IN_PROGRESS / COMPLETED queries; planning excluded from live unless we include it later) |

---

## Implementation order

1. Schema + migration + seed defaults
2. Shared helpers (`propertyStatusUi`) + Progress UI
3. Admin editor + APIs
4. PropertyCard + detail
5. Portfolio
6. EN/ES copy
7. QA

---

## Out of scope (later payments)

| Item | Payment |
|------|---------|
| Secure project document uploads / downloads | Pago 6 (done) |
| Investment assignment / deposits | Pago 7 (done) |
| Push notifications when progress changes | Pago 8 closed without a dedicated inbox; see [PLAN_ENTREGA_10_PAGOS.md](PLAN_ENTREGA_10_PAGOS.md) |

---

## QA checklist

- [ ] Admin can set planning / in progress / completed + % + dates
- [ ] Cards and detail show status and progress
- [ ] Portfolio shows progress for held properties
- [ ] Completed home track record still works
- [ ] EN/ES labels for statuses
- [ ] Migration applies cleanly on existing data (`IN_PROGRESS` / `COMPLETED` preserved; new fields default)
