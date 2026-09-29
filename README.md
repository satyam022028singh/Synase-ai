# SYNASE AI frontend — Phases 0–11

Implemented frontend foundation through mock-backed Integrations + Activity + Audit.

## Run

```bash
npm test
npm run build
python3 -m http.server 4173 -d dist
```

Open `http://localhost:4173`.

## Phase 11

- Available integration providers remain separate from project connections
- Project-scoped connection, authorization, health, capability, synchronization, and run projections
- Explicit idempotent mock connect, disconnect, health-check, and sync receipts
- Project-scoped activity feed with actor, action, target, source, domain, timestamp, and outcome
- Read-only immutable audit-event projection with safe resource references and request/correlation identifiers
- Recursive credential and payload redaction
- Responsive integration, activity, audit-table, and audit-detail surfaces
- Explicit provisional global/project route semantics

## Implemented foundations

- Domain API abstraction and normalized errors
- Deterministic mock adapters and typed domain models
- Responsive SYNASE AI design tokens and application shell
- Auth, workspace, projects, repository, multimodal input, conversation, analysis, workflows, SSE, MCP V2, product and DevOps intelligence, context, knowledge, reports, HITL, integrations, activity, and audit projections
- Accessible loading, empty, error, retry, forbidden, and not-found patterns where applicable
- Contract tests and build manifest

## Important

The live backend and external providers are intentionally not connected. All Phase 11 provider, connection, health, synchronization, activity, and audit data is deterministic mock data. Mock actions contact no external service, import no records, expose no credentials, and never imply integration, repository, CI/CD, infrastructure, publication, or deployment execution. Global aggregation, provider authorization callbacks, notification delivery, audit retention/completeness, and the dedicated audit route remain unresolved/provisional.
