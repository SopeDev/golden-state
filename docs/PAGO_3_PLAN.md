# Pago 3 — execution plan (aligned to adjustments)

## Contract baseline vs overrides

From `docs/PLAN_ENTREGA_10_PAGOS.md`, **Pago 3** originally included: first **Home** landing, **FAQ**, **contact**, navigation/footer cleanup, bilingual behavior, **finished vs in-development** project UX, and **initial language by location**.

**Overrides:**

| Original item | Decision |
|----------------|----------|
| Home page | Creative/section requirements supplied later. Until then: minimal placeholder or existing `messages/*/Home` only. |
| Proyectos terminados vs en desarrollo | **Out of scope** — no lifecycle filters on public listing. |
| Idioma inicial por ubicación | **In scope** — enable next-intl `Accept-Language` detection; persist user's manual choice in `NEXT_LOCALE` cookie; manual choice always wins. |
| FAQ + Contact + working nav | **In scope**. |
| Language toggle placement | **Moved to footer** for a more institutional/premium feel (removed from primary nav and mobile drawer). |

## 1) Property types

Five categories; Prisma keeps **`BUILD_TO_SELL`** and **`BUILD_TO_RENT`**; add **`FLIPHOUSE`**, **`MEX_TO_US`**, **`US_TO_MEX`**.

UI copy: **Build to Sell**, **Build to Rent** everywhere (no “buy to build” for the rent type).

## 2) `/projects` + `/projects/[slug]`

- `/projects` — all properties; generic hero.
- `/projects/{slug}` — filtered by `PropertyType`; type-specific hero via `Projects.headers.*`.

Slugs: `build-to-sell`, `build-to-rent`, `fliphouses`, `mex-to-us`, `us-to-mex`.

## 3) Navigation and footer

Single **Projects** dropdown: All + one link per type. Legacy paths (`/fliphouses`, `/buytorent`, `/buytobuild`, `/mexicotous`) redirect to new URLs (`/buytobuild` → `/projects/build-to-rent`).

## 4) FAQ and Contact

FAQ: public page + `PageContent` FAQ + fallbacks in `messages`.  
Contact: page + form + API (email or logging).

## 4.5) Language behavior

- Enable automatic locale detection via `Accept-Language` (next-intl `localeDetection`).
- Persist user's manual choice in the `NEXT_LOCALE` cookie; manual selection always wins on subsequent visits.
- Move `LocaleToggle` out of `NavMenu` (desktop + mobile drawer) into `Footer.jsx` next to the legal/copyright row.

## 5) Home page

Deferred until client brief (not part of this implementation batch when excluded).

## 6) QA

Filtered routes return correct types; invalid slug → 404; nav/footer localized; Prisma migrate after enum changes.

## Suggested implementation order

1. Enum + migration + seed + admin + badges  
2. `projectTypes` + `[slug]` + `ProjectsClient`  
3. Nav + footer + redirects  
4. FAQ + Contact  
5. Locale auto-detection + footer language toggle relocation  
