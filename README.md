# SYNASE AI frontend — Phases 0–12

Implemented frontend foundation through Dashboard + Backend Integration Readiness + QA.

## Run

```bash
npm test
npm run build
python3 -m http.server 4173 -d dist
```

Open `http://localhost:4173`.

## Phase 12

- Responsive workspace decision-intelligence dashboard
- Attention queue spanning approvals, workflows, findings, context, and integrations
- Project portfolio, workflow status, reports/approvals, and operational activity summaries
- Explicit selected-project mock scope while workspace aggregate contracts remain unresolved
- Central mock/live adapter boundary with fail-closed live configuration
- Safe read-only live dashboard GET contract with request IDs, timeout/cancellation, normalized errors, and response-shape validation
- Independent integration-readiness checks for adapter mode, base URL, auth, aggregates, SSE, and uploads
- Recursive secret and raw-payload omission
- Full non-execution semantics: mock mode contacts no external service, imports no records, exposes no secrets, and executes no downstream action

## Implemented foundations

- Domain API abstraction and normalized errors
- Deterministic mock adapters and typed domain models
- Responsive SYNASE AI design tokens and application shell
- Auth, workspace, projects, repository, multimodal input, conversation, analysis, workflows, SSE, MCP V2, product and DevOps intelligence, context, knowledge, reports, HITL, integrations, activity, audit, and dashboard projections
- Accessible loading, empty, error, retry, forbidden, and not-found patterns where applicable
- Contract tests and build manifest

## Important

The live backend and external providers are intentionally not connected. A passing frontend build is not evidence of backend availability, authorization, synchronization, imported data, AI execution, repository changes, CI/CD changes, infrastructure changes, publication, or deployment. Authentication/session DTOs, workspace aggregate endpoints, complete pagination/idempotency policy, SSE authentication/replay, signed-upload details, notification delivery, and API compatibility policy remain unresolved.
