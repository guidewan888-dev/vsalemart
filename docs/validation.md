# Validation — orange commerce expansion

- TypeScript `tsc --noEmit`: passed.
- Next.js 16.3.4 production build (webpack): passed, all route families compiled.
- ESLint: no errors; advisory warnings concern native image tags and full-page auth navigation.
- Isolated PostgreSQL/PGlite integration: 18 checks passed, covering:
  - Server totals and inclusive VAT; stale totals reject and roll back inventory.
  - Idempotent order retries; duplicate lines cannot oversell.
  - Customer row isolation and staff-only operations.
  - Cancellation restores inventory exactly once.
  - Submitted slips block cancellation/duplicate submission; approval and shipment transitions.
  - Customer cannot self-approve wholesale access; approved wholesale prices are server-calculated.
  - Null commit flags cannot bypass stock reservation.
  - Accepted quotations are consumed once.
  - Invoice snapshots and idempotent document issuance; owner isolation.
  - Expiration releases unpaid stock once and cannot be run by customers.
  - Variant and parent stock reserve/restore together; weight shipping; required variant selection.

The sandbox does not expose `/proc` RSS memory telemetry. The build used a scratch-only Node shim to approximate memory telemetry via V8; application compilation and TypeScript checks were not bypassed. This shim is not included in the repository or production configuration.

No production database changes, Supabase Auth/SMTP checks, payment-provider tests, real shipping transactions, or browser end-to-end/visual QA were performed. Apply the migration and run the staging rollout in deployment-runbook.md before production launch.
