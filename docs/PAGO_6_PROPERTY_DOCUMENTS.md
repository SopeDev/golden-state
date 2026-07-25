# Pago 6 — Property progress documents (private)

Admin uploads project progress files to the **private** R2 bucket. Only investors with an `Investment` on that property (and admins) can list/open them.

## Document kinds

- `CONSTRUCTION_PHOTOS`
- `CONTRACT`
- `FINANCIAL_REPORT`
- `PERMIT`
- `PROGRESS_UPDATE`
- `OTHER`

## Surfaces

- Admin: property editor → Progress documents (existing properties only)
- Investor: portfolio → Project documents panel (grouped by kind, newest first)

## APIs

- `POST/GET /api/admin/properties/[id]/documents`
- `DELETE /api/admin/properties/[id]/documents/[docId]`
- `GET /api/investor/properties/[propertyId]/documents`
- `GET /api/property-documents/[id]` (stream; private bucket)
