# Golden State testing architecture

## Purpose and coverage source

The P0/P1/P2 risk matrix is the coverage inventory. It describes intended long-term coverage; it is not a requirement to automate every row immediately. Phase 1 implements the smaller risk-weighted suite in `phase-1.md` and keeps traceability back to that inventory.

Tests must not weaken authentication, authorization, validation, financial rules, or production behavior. A failing test is classified before any production change is considered:

1. application defect;
2. test defect;
3. incorrect test data or setup;
4. environment or configuration problem; or
5. intentional behavior that conflicts with the coverage inventory.

Application defects are reported separately. Production code is changed only when intended behavior is unambiguous from existing requirements and code.

## Test layers

### Cypress browser E2E

Use a real browser when the value comes from proving that frontend and backend work together: routing, forms, uploads, visible state, role-specific navigation, and a small number of critical vertical journeys.

Browser tests cover registration/onboarding, approval/accreditation, investment-to-deposit, cash-out, and reinvestment. Setup that is not under test is performed programmatically. A test does not repeat onboarding merely to obtain an accredited investor.

### Cypress API tests

Use `cy.request()` for deployed-route behavior that benefits from exercising NextAuth cookies, middleware, route handlers, serialization, and the database. This is the default layer for authorization, validation, state transitions, idempotency, ownership, stale-capacity safeguards, and financial invariants.

API tests may create prerequisites through Node tasks backed by test-only factories. The operation under test must still go through the public application API.

### Unit and integration tests outside Cypress

Use Vitest for pure decision logic and calculations. Phase 1 directly tests wallet arithmetic, route/access decisions, and permission normalization here. Tests that require a browser, Next.js middleware runtime, or authenticated HTTP route belong in Cypress instead.

## Repository layout

```text
cypress/
  e2e/
    browser/                 # vertical UI journeys
    api/                     # cy.request route tests
  fixtures/
    files/                   # small valid/invalid upload samples
  support/
    commands.js              # domain-level Cypress commands
    e2e.js                   # global Cypress setup
  factories/                 # serializable fixture builders, no DB connection
tests/
  unit/                      # Vitest pure logic tests
  support/                   # Vitest-only helpers
scripts/testing/
  db.cjs                     # Cypress task entry points and DB cleanup
  factories.cjs              # test-only Prisma factories
docs/testing/
  README.md
  phase-1.md
  defect-log.md
```

Specs use `<domain>.cy.js`; pure tests use `<module>.test.js`. Test titles use observable behavior:

```text
describe('deposit confirmation')
it('creates one contribution and rejects a repeated confirmation')
```

Avoid titles based solely on implementation details such as “calls update method.” Phase IDs are documented in `phase-1.md`, not embedded in every title.

## Selectors

Use selectors in this order:

1. accessible role and stable accessible name (`findByRole`, `findByLabelText`);
2. semantic native selector such as an input `name` when it is part of the form contract;
3. `data-cy` for dynamic rows, icon-only controls, status-dependent actions, charts, or ambiguous translated controls.

`data-cy` values describe purpose, not styling or translated text: `user-status-select`, `deposit-confirm`, `wallet-available`. Dynamic entities use a stable prefix and identifier only when the identifier is known to the test. Tests must not depend on Tailwind classes, DOM depth, generated IDs, or incidental copy.

Adding `data-cy` is allowed because inert data attributes do not create test-specific production behavior. Prefer improving an accessible label when that also improves the product.

## Authentication and sessions

- `cy.loginByCredentials(user)` signs in through the real NextAuth credentials endpoint and is wrapped by `cy.session()` using role, user ID, and `sessionEpoch` in the cache key.
- A browser test uses the login UI only when login itself is the behavior under test.
- Tests that change account status, permissions, credentials, or `sessionEpoch` must establish a fresh session afterward and must not reuse the old cache key.
- API authorization tests explicitly use anonymous, investor, operator, and admin cookie jars. They must not bypass middleware by importing route handlers directly.
- Secrets and fixed production credentials never appear in specs. Factory-created passwords come from the test environment.

## Test identities and roles

Every test receives unique users under a reserved domain, for example `case-<run>-<counter>@e2e.invalid`. Factories support:

- investor account states: unverified, profile-incomplete, pending approval, rejected, active/non-accredited, active/pending accreditation, and active/accredited;
- admin;
- operator with an explicit permission set.

Tests never depend on development seed accounts. User IDs, property IDs, and request IDs are returned by factories and passed explicitly.

## Database lifecycle and isolation

- Tests require a dedicated PostgreSQL database identified by `TEST_DATABASE_URL`. The harness refuses destructive reset when the URL does not visibly identify a test database.
- Cypress launches the application with `DATABASE_URL=$TEST_DATABASE_URL` and a test-specific `NEXTAUTH_SECRET`.
- `beforeEach` resets only test-owned rows and recreates prerequisites. Suite order is irrelevant.
- Cleanup follows foreign-key order inside a transaction. Static lookup rows may be recreated after reset.
- No test reads data created by another test. No IDs, cookies, or aliases are shared across specs.
- Factories use explicit values and fixed UTC timestamps where time affects behavior.
- Parallel workers must use separate database schemas/databases or a unique worker namespace. Phase 1 runs serially until worker-specific databases are configured.

The database helper is infrastructure, not a hidden application endpoint. There is no test-only HTTP route in the production application.

## Factories and fixtures

Factories return the created records and accept overrides. Defaults must satisfy current schema constraints without hiding important values. Financial factories require explicit amounts; property factories require explicit goal/minimum when those affect the assertion.

Prefer a small vocabulary:

- `createUser({ role, accountStatus, accreditedStatus, permissions })`
- `createProperty({ price, minInvestment, status, fundedAmount })`
- `createInvestmentIntent(...)`
- `createDepositRequest(...)`
- `createContribution(...)`
- `createReturnDistribution(...)`
- `createWalletRequest(...)`

Upload fixtures are tiny, valid files committed under `cypress/fixtures/files`. Invalid-type fixtures are plain text with an explicit MIME type. Files contain no personal data.

## Cypress commands and API helpers

Custom commands represent repeated domain actions, not individual clicks:

- `cy.loginByCredentials(user)`
- `cy.createScenario(name, overrides)`
- `cy.resetTestData()`
- `cy.apiRequest({ actor, method, url, body, failOnStatusCode })`
- `cy.uploadFixture(selector, fixture, mimeType)`

Commands yield their subject/result and avoid mutable global state. Assertions remain in specs so failures identify the violated behavior.

Request helpers normalize JSON and multipart calls but do not automatically accept error statuses. Expected failures set `failOnStatusCode: false` explicitly and assert both status and lack of persisted side effects.

## Email and external services

Email delivery, Google OAuth, and Cloudflare R2 are external boundaries.

- The test application uses a local email capture adapter or the existing development mail behavior. Verification tokens are obtained from the test database; tests do not poll a real inbox.
- Tests assert that state is correct and, where valuable, that a captured message has the intended recipient/category. They do not assert provider-specific HTML.
- Google OAuth is excluded from Phase 1. Credentials authentication covers application session behavior without automating a third-party login screen.
- Private storage uses a local test storage directory or a stubbed S3-compatible boundary. Authorization tests still download through application receipt/document routes.
- No test contacts Resend, SMTP, Google, or production R2. Network calls outside the local application are blocked during tests.

Service substitution is configured through environment variables and existing service boundaries. It must not add a production-accessible testing bypass.

## Localization

English is the default execution locale. Each vertical flow uses locale-aware route helpers rather than hard-coded unprefixed paths. Spanish receives a focused smoke path for routing, form labels, and redirect locale preservation; the full financial state matrix is not duplicated in both languages.

Assertions prefer roles, labels, stable status values, and `data-cy`. When user-visible translation is the behavior, assert the localized text directly.

## Waiting and synchronization

Arbitrary `cy.wait(number)` calls are prohibited. Synchronize using:

- `cy.intercept()` aliases for browser-triggered requests;
- URL assertions after navigation;
- visible enabled/disabled states;
- eventual assertions on a specific API response or DOM state;
- task completion for database setup.

Animations may be disabled globally in Cypress CSS. Retryable Cypress assertions handle rendering latency; increasing global timeouts is a last resort.

## Reliability rules

- Tests run independently and in any order.
- Each test owns all mutable data it uses.
- Assertions cover both response/UI and durable side effects for financial transitions.
- Idempotency tests assert record counts, not only error messages.
- Race safeguards are tested by changing capacity or wallet state between request creation and review. True concurrent transactions require a separate worker-aware database harness.
- Time, locale, and generated identifiers are controlled by helpers where relevant.
- Retries may be enabled in CI for diagnostics, but a pass only on retry is treated as flaky and investigated.
- `it.only`, skipped P0 tests, arbitrary waits, and production credentials fail review.

## Execution

The intended commands are:

```bash
npm run test:unit
npm run test:e2e:api
npm run test:e2e:browser
npm run test:e2e
```

CI provisions the test database, applies migrations, starts the application with test environment variables, and then runs the selected Cypress group. Local commands follow the same path.
