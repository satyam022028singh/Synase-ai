# SYNASE AI

[![Phase 12 validation](https://github.com/satyam022028singh/Synase-ai/actions/workflows/phase11-validate.yml/badge.svg)](https://github.com/satyam022028singh/Synase-ai/actions/workflows/phase11-validate.yml)

**AI-Powered Product and DevOps Decision Intelligence Platform — frontend prototype, Phases 0–12.**

SYNASE AI is a decision-intelligence workspace for turning project context, repository evidence, workflows, model/tool traces, findings, recommendations, reports, and human approvals into reviewable engineering decisions. It is not a generic chatbot or a database browser.

> **Current release:** `0.12.0`  
> **Validation:** 64 tests passed, 0 failed; production build passed  
> **Runtime mode:** deterministic mock-backed frontend  
> **Backend status:** not connected

## Contents

- [Product overview](#product-overview)
- [Implemented scope](#implemented-scope)
- [Architecture](#architecture)
- [Safety guarantees](#safety-guarantees)
- [Quick start](#quick-start)
- [Routes](#routes)
- [Repository layout](#repository-layout)
- [Testing and validation](#testing-and-validation)
- [Backend integration boundary](#backend-integration-boundary)
- [Known contract gaps](#known-contract-gaps)
- [Build artifacts](#build-artifacts)

For detailed setup, local serving, troubleshooting, and deployment guidance, see **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)**.

## Product overview

The frontend organizes SYNASE AI around workspace and project context. Its major surfaces answer:

- What is happening?
- What evidence supports it?
- What requires attention?
- What decision is recommended?
- What has been approved?
- What has actually executed?

The implementation deliberately distinguishes:

- AI-proposed information from confirmed project state
- operational activity from immutable audit projections
- authorization from connection health and synchronization
- approval from downstream execution
- browser transfer progress from backend processing state
- mock receipts from real external actions

## Implemented scope

| Phase | Capability | Status |
| --- | --- | --- |
| 0 | API contract foundation | Implemented |
| 1 | Design system and application shell | Implemented |
| 2 | Auth, workspace, and projects | Mock-backed |
| 3 | Repository and multimodal input | Mock-backed |
| 4 | Conversation and analysis requests | Mock-backed |
| 5 | Workflow and SSE state handling | Mock-backed |
| 6 | MCP V2 observability and discovery | Mock-backed |
| 7 | Product Intelligence | Mock-backed |
| 8 | DevOps Intelligence | Mock-backed |
| 9 | Context and Knowledge | Mock-backed |
| 10 | Reports and human-in-the-loop approvals | Mock-backed |
| 11 | Integrations, Activity, and Audit | Mock-backed |
| 12 | Dashboard, backend-integration readiness, and QA | Implemented and validated |

### Phase 12 highlights

- Responsive workspace decision-intelligence dashboard
- Cross-domain attention queue for approvals, workflows, findings, context, and integrations
- Project portfolio and authoritative workflow-state summaries
- Report and approval summaries with explicit `Executed: No` semantics
- Operational activity preview kept separate from audit
- Integration-readiness checks for adapter mode, base URL, authentication, aggregates, SSE, and uploads
- Central mock/live adapter service boundary
- Fail-closed live configuration
- Safe read-only `GET /api/v1/dashboard` contract
- Request ID propagation, timeout, cancellation, normalized errors, and response-shape validation
- Recursive secret redaction and raw header/payload omission
- Responsive dashboard behavior at desktop, tablet, and mobile widths

## Architecture

```text
Route
  → page composition
  → feature components and hooks
  → domain service interface
  → mock or live adapter
  → shared HTTP/SSE transport
  → /api/v1
```

Core rules:

- Browser-facing APIs remain domain-oriented under `/api/v1`.
- Frontend domain models do not mirror PostgreSQL tables.
- Mock and live implementations share service boundaries.
- Adapter selection belongs at the composition root.
- Pages do not need to understand transport details.
- Unsafe mutations do not automatically retry.
- High-impact actions do not use optimistic success.
- Cross-domain production pages require backend aggregate endpoints rather than browser-side relational reconstruction.
- Workflow SSE uses authoritative event/snapshot state; elapsed time is never presented as execution progress.

The project is currently a static HTML/CSS/JavaScript frontend with JavaScript type checking annotations and `.d.ts` domain declarations. It intentionally has no runtime package dependency.

## Safety guarantees

The mock build:

- contacts no external provider
- imports no external records
- exposes no passwords, tokens, API keys, cookies, authorization headers, MFA secrets, or secret-manager values
- does not execute AI workflows, repository changes, pull requests, CI/CD operations, infrastructure actions, publication, or deployment
- does not infer authorization from a connect action
- does not infer execution from approval
- does not claim backend connectivity because the frontend builds successfully

Sensitive metadata is recursively redacted. Raw request/response payloads and headers are omitted from safe audit and integration projections.

## Quick start

### Requirements

- Node.js 24 recommended; modern Node.js with `node:test` support is required
- npm
- Python 3 is optional and used only for the example static server
- Git, if cloning from GitHub

### Run locally

```bash
git clone https://github.com/satyam022028singh/Synase-ai.git
cd Synase-ai
npm test
npm run build
python3 -m http.server 4173 -d dist
```

Open [http://localhost:4173](http://localhost:4173).

There are currently no third-party package dependencies, so an install step is not required for the checked-in build scripts. See the [startup guide](./STARTUP_GUIDE.md) for alternatives and troubleshooting.

## Routes

The prototype uses hash-based navigation so it can run from any static file server.

### Workspace and project

- `#/app/dashboard`
- `#/app/projects`
- `#/app/projects/create`
- `#/app/projects/:projectId/overview`
- `#/app/projects/:projectId/repository`
- `#/app/projects/:projectId/inputs` — provisional
- `#/app/projects/:projectId/analysis` — provisional
- `#/app/projects/:projectId/runs`
- `#/app/projects/:projectId/context`
- `#/app/projects/:projectId/knowledge`
- `#/app/projects/:projectId/reports`
- `#/app/projects/:projectId/integrations`
- `#/app/projects/:projectId/settings`

### Intelligence and orchestration

- `#/app/intelligence/product`
- `#/app/intelligence/devops`
- `#/app/mcp/overview`
- `#/app/mcp/executions`
- `#/app/mcp/tools`
- `#/app/mcp/models`
- `#/app/mcp/discovery`
- `#/app/context/overview`
- `#/app/context/memory`
- `#/app/context/history`
- `#/app/knowledge/graph`

### Outputs and system

- `#/app/reports`
- `#/app/reports/:reportId`
- `#/app/approvals`
- `#/app/integrations`
- `#/app/activity`
- `#/app/audit` — provisional

A `?route=/app/...` query parameter is also recognized by the prototype and takes precedence over the hash route.

## Repository layout

```text
.
├── .github/workflows/      # Validation and packaging workflow
├── dist/                   # Generated production build
├── scripts/build.mjs       # Dependency-free build and manifest generation
├── src/
│   ├── api.js              # Core deterministic domain adapter
│   ├── app.js              # Application shell and Phases 0–10 UI
│   ├── phase11-api.js      # Integrations/activity/audit contracts
│   ├── phase11.js          # Phase 11 views
│   ├── phase11.css         # Phase 11 responsive styles
│   ├── phase11-types.d.ts  # Phase 11 declarations
│   ├── phase12-api.js      # Dashboard and integration-readiness service
│   ├── phase12.js          # Phase 12 dashboard overlay
│   ├── phase12.css         # Phase 12 responsive styles
│   ├── phase12-types.d.ts  # Phase 12 declarations
│   ├── styles.css          # Shared shell and design system
│   └── types.d.ts          # Core domain declarations
├── test/                   # Node contract tests
├── index.html              # Static application entry
├── phase12-validation.json # Authoritative latest validation result
└── package.json
```

## Testing and validation

Run the complete contract suite:

```bash
npm test
```

Build the static production output:

```bash
npm run build
```

The build script:

1. recreates `dist/`
2. copies the application entry and source assets
3. generates SHA-256 hashes and byte sizes
4. writes `dist/build-manifest.json`

The Phase 12 GitHub Actions workflow runs the full tests and build, records `phase12-validation.json`, creates the source/build package, and commits generated outputs back to `main`.

Latest validated result:

```json
{
  "phase": 12,
  "testsPassed": 64,
  "testsFailed": 0,
  "productionBuild": "passed",
  "backendConnected": false,
  "externalSystemsContactedByMock": false,
  "secretValuesExposed": false,
  "downstreamActionsExecuted": false
}
```

Representative dashboard QA covered `1440×900`, `1024×768`, and `390×844` with reduced motion enabled and found no console errors, horizontal viewport overflow, or clipped controls. This was a representative dashboard-harness check, not a complete integrated-browser repository regression.

## Backend integration boundary

The shipped composition uses the deterministic mock service.

`src/phase12-api.js` also exposes `createPhase12Service({ mode, baseUrl, fetchImpl, timeoutMs })` for the live integration boundary. Live mode:

- fails when the base URL is missing
- requires HTTPS except for `localhost`/`127.0.0.1`
- performs only the documented read-only dashboard request
- sends `Accept: application/json` and `X-Request-ID`
- uses `credentials: "include"` without handling raw credentials in application models
- supports cancellation and timeout
- normalizes network, HTTP, cancellation, and malformed-response failures
- validates the dashboard response shape

The current application does not automatically enable live mode from an environment variable. Live composition should only be wired after authentication/session and dashboard aggregate contracts are frozen.

## Known contract gaps

The following remain intentionally unresolved:

- login, registration, recovery, logout, renewal, and callback contracts
- complete DTO/nullability/error schemas
- pagination strategy and mutation idempotency policy
- workspace dashboard/search/report/approval/integration/activity aggregate endpoints
- active workspace/project context encoding
- permission and capability fields beyond roles
- SSE authentication, event envelope, replay, heartbeat, and retention semantics
- signed-upload initiation/completion details
- realtime transport outside workflow SSE
- notification delivery
- API compatibility and deprecation policy
- security-grade audit retention and completeness

Do not infer these behaviors from fixtures or UI copy.

## Build artifacts

- `dist/` — generated static production build
- `dist/build-manifest.json` — asset sizes and SHA-256 digests
- `phase12-validation.json` — validation evidence

Clone the repository to obtain the complete project. Generated ZIP archives are intentionally not committed.

## Project status

Phases 0–12 are implemented and validated as a frontend-only deterministic build. The next step is authoritative backend contract resolution and controlled live integration—not representing mocks as production behavior.
