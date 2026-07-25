# Pago 5.1 — Funding vs project progress

Operational addendum to [PAGO_5_PLAN.md](PAGO_5_PLAN.md).

## Product rules (locked)

| Topic | Decision |
|-------|----------|
| Raise target | `Property.price` (UI: investment goal) |
| Funded amount | Always `SUM(Investment.amount)` for that property |
| Overfunding | Not allowed |
| Lifecycle | **Funding → Funded → Planning → In progress → Completed** (strict) |
| At 100% raised | Status becomes **`FUNDED`** (auto when sum ≥ goal while in `FUNDING`) |
| Enter Planning | **Admin only**, manual flip from `FUNDED` |
| Construction `%` | Only meaningful in Planning / In progress / Completed |

## Two meters

- **Funding:** funded / goal (+ %) on `FUNDING` and `FUNDED`
- **Project progress:** existing `progressPercent` + dates on execution statuses

## Status enum

`FUNDING` | `FUNDED` | `PLANNING` | `IN_PROGRESS` | `COMPLETED`

## Guards

- Creating/updating an investment must not push sum above `price`
- Cannot move to Planning / In progress / Completed from Funding/Funded unless fully funded
- Sync: `FUNDING` → `FUNDED` when sum ≥ goal; `FUNDED` → `FUNDING` if sum drops below goal
