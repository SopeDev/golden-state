# Automation defect log

Record apparent application defects discovered while implementing or running the suite. Do not fix production behavior merely to make a test green.

| Date | Test | Classification | Evidence | Disposition |
| --- | --- | --- | --- | --- |
| 2026-08-21 | Cypress harness startup | Environment/configuration | `TEST_DATABASE_URL` is unset; harness correctly refuses to use `DATABASE_URL`. Local Docker daemon is inaccessible. | Supply an isolated PostgreSQL URL and apply migrations. |
| 2026-08-21 | `npx cypress verify` | Environment/configuration | Cypress 15.21.0 cannot load `libnspr4.so`; installing OS packages requires host administrator access. | Install Cypress Linux prerequisites on the host/CI image. |
