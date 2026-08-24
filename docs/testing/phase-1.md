# Phase 1 automation suite

Phase 1 contains 18 tests: five browser E2E, eleven Cypress API tests, and two Vitest tests. The P0/P1/P2 matrix remains the long-term source of truth.

## Browser E2E

| ID | Test | Primary inventory coverage |
| --- | --- | --- |
| E2E-01 | Credential registration, verification, login, profile completion, and pending approval | Registration and onboarding state progression |
| E2E-02 | Admin approval followed by accreditation submission and approval | Account/accreditation review and protected-area access |
| E2E-03 | Investment request, receipt submission, admin deposit confirmation, and portfolio holding | Investment/deposit vertical journey and portfolio rendering |
| E2E-04 | Return credit followed by investor cash-out and admin confirmation with bank notice | Wallet reservation, cash-out review, receipt integration |
| E2E-05 | Investor reinvestment followed by admin confirmation | Wallet-to-contribution vertical journey |

## Cypress API

| ID | Test | Primary inventory coverage |
| --- | --- | --- |
| API-01 | Admin/operator authorization matrix | Role and granular permission enforcement |
| API-02 | Investor onboarding/protected-route access matrix | Anonymous and investor-state redirects |
| API-03 | Registration and verification safeguards | Duplicate registration, token validity, email failure cleanup |
| API-04 | Accreditation authorization and resubmission integrity | Active-account rule, uploads, partial resubmission |
| API-05 | Investment validation and cancellation state machine | Accreditation, minimum, capacity, closure, cancellation |
| API-06 | Deposit validation and ownership | Receipt, amount, minimum, capacity, investor scope |
| API-07 | Deposit confirmation atomicity, idempotency, and stale capacity | One contribution, completed intent, overfund prevention |
| API-08 | Wallet reservation invariant across request types | Available/reserved/confirmed arithmetic and released funds |
| API-09 | Cash-out review state machine and receipt authorization | Required notice, idempotency, ownership |
| API-10 | Reinvestment confirmation atomicity and stale capacity | One contribution, wallet consumption, review-time validation |
| API-11 | Return distribution and voiding invariant | Credit eligibility, one-time void, nonnegative wallet |

## Vitest

| ID | Test | Primary inventory coverage |
| --- | --- | --- |
| UNIT-01 | Wallet balance and void eligibility tables | Core financial formula and edge values |
| UNIT-02 | Onboarding/access decisions and operator permission normalization | Redirect matrix and permission dependency |

## Deliberate Phase 1 exclusions

Google OAuth, exhaustive permission-by-permission duplication, broad public-page regression, true simultaneous database transactions, full email content, and complete bilingual duplication remain in the long-term inventory. Private property-document ownership is the highest-priority P0 follow-up not represented by a dedicated Phase 1 test.
