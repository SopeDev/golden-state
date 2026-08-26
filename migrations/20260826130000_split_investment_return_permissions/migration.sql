-- Preserve existing operator access while splitting the former broad financial
-- view permission into independent Investments and Returns sections.
UPDATE "User"
SET "operatorPermissions" = "operatorPermissions"::jsonb || '["VIEW_RETURN_ACTIVITY"]'::jsonb
WHERE "type" = 'OPERATOR'
  AND "operatorPermissions"::jsonb @> '["VIEW_FINANCIAL_ACTIVITY"]'::jsonb
  AND NOT "operatorPermissions"::jsonb @> '["VIEW_RETURN_ACTIVITY"]'::jsonb;
