# SYNASE AI — Project Brain

Generated knowledge graph for the SYNASE AI frontend. This is the map you read before
touching code, and the map you regenerate after you change it.

```bash
npm run brain          # remeasure the source tree and rewrite brain/
npm run brain:query    # explore the graph
```

`brain/graph.json` is derived, not authored. Never edit it directly. Change
`scripts/brain-data.mjs` (the semantic layer) or the measurement step in
`scripts/brain-extract.mjs`, then regenerate. That way the map cannot quietly
disagree with the code.

---

## 1. What this project is

A static, dependency-free decision-intelligence frontend. It turns project context,
repository evidence, workflow and model/tool traces, findings, reports, and human
approvals into reviewable engineering decisions. It is not a chatbot and not a
database browser.

Every surface runs against deterministic mock domain services. **No backend is
connected and no external provider is contacted.** That is the single most important
fact about the current codebase: the product is fully designed and the server is
entirely absent.

Measured shape at generation time:

| Measure | Value |
| --- | --- |
| Version | `0.12.0` |
| Source lines (src + index.html) | 2,813 |
| Test lines | 332 |
| Contract tests | 64 |
| Declared types across three `.d.ts` files | 96 |
| Mock fixture collections in `db` | 39 |
| Routes | 33 |
| Domain service methods | 87 across 3 services |
| Typed entities | 47, plus 7 with no interface at all |
| Safety invariants | 18 |
| Known contract gaps | 12 |
| Structural risks | 10 |

---

## 2. Architecture: six layers

```
Route
  → page composition          L0  src/app.js, src/phase11.js, src/phase12.js
  → view templates            L1  same modules, pure string builders
  → domain service interface  L2  src/api.js, src/phase11-api.js, src/phase12-api.js
  → mock or live adapter      L3  mock ships; live fails closed
  → shared HTTP/SSE transport L4  only exercised by tests today
  → /api/v1                   L5  does not exist
```

Two rules explain most of the codebase:

- **Frontend domain models do not mirror persistence tables.** If a view needs a
  joined shape, an aggregate endpoint should provide it, not the browser.
- **Adapter selection belongs at the composition root.** Views never learn whether
  they are talking to a mock or a server.

### The three services

| Service | File | Scope | Methods | Fixture |
| --- | --- | --- | --- | --- |
| `mockApi` | `src/api.js` | Phases 0–10 | 74 | `db`, 39 collections |
| `phase11Api` | `src/phase11-api.js` | Integrations, activity, audit | 11 | module-private arrays + `receipts` Map |
| `phase12Api` | `src/phase12-api.js` | Dashboard aggregate, readiness | 2 | frozen `dashboard` fixture |

`phase12Api` is the only service with a live adapter factory,
`createPhase12Service({ mode, baseUrl, fetchImpl, timeoutMs })`. Phases 0–11 have no
live path whatsoever. Live mode is never enabled from an environment variable, and
`src/api.js` exports a `liveApi` that always throws and has no caller.

---

## 3. Routing: one router, two late usurpers

`src/app.js:737` owns `renderPage()` and resolves all 33 routes. Three auth routes
render without the shell; everything else is wrapped in `shell()`.

Path resolution order: `?route=` query parameter → `location.hash` → `/app/dashboard`.
Navigation uses `history.replaceState`, so the back button does not walk your history.

Then two modules take over the DOM from outside the router:

- `src/phase11.js` claims `/app/integrations`, `/app/activity`, `/app/audit`
- `src/phase12.js` claims `/app/dashboard`

Both do it with a `MutationObserver` on `document.body` that re-asserts ownership of
`#main`. This is the mechanism behind `rsk-01` below: which dashboard you get depends
on script load order, not on a declared contract. It works, and it is the main piece
of structural debt in the project.

---

## 4. Domain model

Fourteen capability areas, each with fixtures, service methods, and a rendering view:

**Workspace** — `Workspace`, `WorkspaceMember`, `Project`, `ProjectMember`. Projects
are the unit of scoping for nearly everything else.

**Input** — `Repository`, `RepositorySnapshot`, `Asset`, `UploadInitiationResponse`.
Security scan status is deliberately separate from processing status; a blocked scan
is not a processing state.

**Conversation** — `ConversationSession`, `ConversationMessage`, `AnalysisRequest`.
Submitting an analysis returns a queued receipt, never a running workflow.

**Execution** — `WorkflowRun`, `WorkflowTask`, `WorkflowEvent`. Progress comes from
authoritative events, never from elapsed time. `db.workflowScripts` holds scripted
demo events that advance only when the user explicitly asks.

**MCP observability** — `McpRequest`, `McpTraceStage`, `McpModel`, `McpTool`,
`McpServer`, plus untyped directories and discovery runs. Three models ship as catalog
metadata: Claude Sonnet (200k, active), GPT reasoning (128k, active), Local evaluator
(32k, disabled). None is ever called.

**Product intelligence** — `Requirement`, `ProductFeature`, roadmap items, and an
untyped strategy aggregate. Provenance distinguishes `confirmed` from `ai_suggested`.

**DevOps intelligence** — `Finding`, `DevOpsRecommendation`, `DeploymentPlan`, plus
untyped dependencies, test suggestions, and a summary aggregate.

**Context and knowledge** — `ContextItem` (sensitivity + trust), `MemoryResult`
(ranked, no embeddings), `RetrievalRecord`, and a `KnowledgeGraph` whose edges
reference projected nodes only and hide store details behind a `backend-only` boundary.

**Outputs** — `DecisionReport`, `ReportExportArtifact`, `Approval`. Publication
requires approval. An approval decision never executes anything.

**Integrations, activity, audit** — providers and connections are separate resources;
authorization, connection, health, and sync are four independent states. Activity is
operational history; audit is an immutable read-only projection. No service exposes an
audit mutation, and the suite asserts that.

**Dashboard** — a workspace aggregate fixture that is explicitly labeled
`selected_project_mock` with `aggregateContractStatus: "unresolved"`, because the real
aggregate endpoint does not exist.

### Three shapes named `ActivityItem`

This is worth knowing before you import it:

| Declared in | Shape | Served by |
| --- | --- | --- |
| `src/types.d.ts` | flat `actor: string` | `mockApi.getDashboard` |
| `src/phase11-types.d.ts` | `actor` object + `target` object + domain/outcome/source | `phase11Api.listActivity` |
| `src/phase12-types.d.ts` | flat `actor` + `audit: false` | `phase12Api.getDashboard` |

One concept, three incompatible contracts, and a name collision across two type
modules. If you build a real backend, collapse these into one envelope first.

### Seven entities with no interface

`devopsSummary`, `productStrategy`, `dependencies`, `testSuggestions`, `mcpDirectories`,
`discoveryRuns`, `workflowScripts` are served by real methods and rendered by real
views, but exist in no `.d.ts` file. They are the most likely source of silent drift
when a real backend arrives. They are tagged `entity-untyped` in the graph.

---

## 5. The 18 invariants

These are the project's actual product. Each is asserted by a test rather than
documented and hoped for.

1. Mock mode contacts no external provider, directory, server, or model
2. No secret reaches a display model or audit projection
3. Sensitive metadata is redacted recursively; raw headers and bodies are omitted, not truncated
4. Approval is not execution — `executed` and `downstreamExecuted` stay false
5. Connect is not authorization; authorization, connection, health, sync are four states
6. Elapsed time is never presented as workflow progress
7. A mock receipt is not a real action
8. Every mutation requires an idempotency key and replays the first receipt on retry
9. Unsafe mutations are never silently retried
10. No optimistic success on approvals, publications, or syncs
11. Domain models are not persistence models
12. Activity is not audit
13. Project scoping is enforced — cross-project ids are rejected as not found
14. AI-proposed is not confirmed state
15. A green build is never presented as backend connectivity
16. Live mode fails closed on missing base URL, unsafe scheme, or malformed response
17. Audit is read-only; no mutation surface exists
18. Every interpolated value is escaped before reaching `innerHTML`

Query them all with `npm run brain:query invariant`.

---

## 6. The 12 gaps

These are deliberately unresolved, and the README says so plainly. Do not infer them
from fixtures or UI copy.

| Gap | Blocks |
| --- | --- |
| `gap-01` Authentication and session contracts | L5 |
| `gap-02` Complete DTO and error schemas | L5, `phase12Api` |
| `gap-03` Pagination and mutation idempotency policy | L5, `phase12Api` |
| `gap-04` Workspace aggregate endpoints | L5, `phase12Api` |
| `gap-05` Active workspace/project context encoding | L5 |
| `gap-06` Permissions beyond roles | L5 |
| `gap-07` SSE envelope, auth, replay, retention | L5 |
| `gap-08` Signed upload flow | L5 |
| `gap-09` Realtime transport outside workflow SSE | L5 |
| `gap-10` Notification delivery | L5 |
| `gap-11` API compatibility and deprecation policy | L5 |
| `gap-12` Security-grade audit retention | L5 |

The frontend currently ships with `state.authenticated = true` hardcoded in
`src/app.js:6`. That is the shape of `gap-01`.

---

## 7. The 10 risks

Run `npm run brain:query risk` for full detail. The ones that will bite first:

**`rsk-01` Two owners of `/app/dashboard` (high).** `src/app.js:745` renders
`dashboardPage()`; `src/phase12.js:34` overwrites `#main` via `MutationObserver`.
Resolution depends on script load order. Any refactor of either file can silently
change which dashboard ships.

**`rsk-05` Duplicated project hydrate cascade (medium).** `hydrate()` at
`src/app.js:788` and the project-switcher handler at `src/app.js:1039` repeat the same
seven-stage fetch. Every new domain means editing both.

**`rsk-04` `liveApi` is dead code (medium).** It throws unconditionally and nothing
can select it. Either wire it or remove it; leaving it implies a capability that does
not exist.

**`rsk-06` Asymmetric clone semantics (low).** `api.js` `page()` returns live
references into `db`, while Phase 11/12 `page()` uses `structuredClone`. List reads are
mutable, single reads are snapshots. A caller can mutate the fixture by accident.

Also: `rsk-02` duplicate `ActivityItem` export, `rsk-03` three activity shapes,
`rsk-07` CI workflow file named `phase11-validate.yml` running Phase 12, `rsk-08`
`npm run dev` needs `npm run build` first, `rsk-09` nav renders `/app/activity` as
disabled while Phase 11 serves it, `rsk-10` no lint/format/typecheck script.

---

## 8. Seven decisions that shaped the code

| Decision | Consequence you inherit |
| --- | --- |
| `dec-01` Zero runtime dependencies | No framework, no bundler, string templates everywhere. Full control of shipped bytes. |
| `dec-02` Hash routing with `?route=` override | Deployable as static files. No real browser history. |
| `dec-03` Per-phase modules, not one growing `app.js` | Phase boundaries stay legible. Cost: late modules bypass the router. |
| `dec-04` `MutationObserver` takeover (status: **debt**) | New phases integrate without router edits. This is the mechanism behind `rsk-01`. |
| `dec-05` Mock as service implementation, not fixture leak | Swapping adapters never touches views. Cost: 74 methods to keep in sync with `types.d.ts`. |
| `dec-06` Only Phase 12 has a live factory | Live integration has exactly one reviewable seam. Phases 0–11 have none. |
| `dec-07` Negative claims are asserted, not assumed | The safety story is regression-protected. Cost: the 64 tests are load-bearing for product claims. |

---

## 9. Where to go next

Phases 0–12 ship. Everything below is planned, ordered, and traces back to the gaps
it closes.

**Phase 13 — Contract registry and freeze.** Publish authoritative DTO, error,
pagination, and versioning contracts before writing any adapter code. Turns 12 gaps
into tracked documents with tests. No prerequisites. *Start here.*

**Phase 14 — Auth and session lifecycle.** Requires 13. Replaces
`state.authenticated = true` with a real session contract, adds capability fields
beyond roles, and defines active-context encoding. Closes `gap-01`, `gap-05`, `gap-06`.

**Phase 15 — Backend aggregate endpoints.** Requires 13. Real workspace-scoped
aggregates so cross-domain pages stop needing browser-side relational reconstruction;
server-side pagination. Closes `gap-04`, `gap-03`, and flips
`aggregateContractStatus` from `unresolved` to resolved.

**Phase 16 — Authoritative workflow streaming.** Requires 14. Replaces
`db.workflowScripts` with a real SSE channel carrying event and snapshot state, replay,
and heartbeat. Closes `gap-07`.

**Phase 17 — Signed input pipeline.** Requires 15. Replaces the `mock-upload:` URL
with signed initiation and completion, keeping scan and extraction as distinct states.
Closes `gap-08`.

**Phase 18 — Governed audit and notifications.** Requires 16. Append-only audit with a
stated retention policy, plus a delivery channel. Closes `gap-12`, `gap-09`, `gap-10`.

---

## 10. Working rules

1. **A mock receipt is not a feature.** Anything you add that only produces mock
   receipts should say so in the UI, as the existing surfaces do.
2. **Never claim what you cannot prove.** If a green build is the only evidence, the
   claim is "frontend builds", not "backend connected".
3. **Keep the invariant count at 18 or make it 19.** If your change breaks one, fix the
   code. If it adds a guarantee, add an invariant and a test in the same commit.
4. **Do not infer gap behavior from fixtures.** The fixtures are examples, not specs.
5. **Regenerate the brain** with `npm run brain` when you add a route, entity, service
   method, invariant, gap, or phase. The graph is a map, and a stale map is worse than
   none.
6. **Before editing a route, run `npm run brain:query trace <service-id> 2`** to see
   what depends on it.

---

## 11. Query reference

```bash
npm run brain:query stats              # totals
npm run brain:query kind               # node counts per kind
npm run brain:query layer              # the six layers and their modules
npm run brain:query route mcp/models   # route, view, matcher, service, tabs
npm run brain:query entity approval    # fixture, methods, views, caveats
npm run brain:query service            # service surfaces and their risks
npm run brain:query trace svc-p12 2    # downstream impact of a change
npm run brain:query invariant          # the 18 guarantees
npm run brain:query gap                # the 12 gaps and who plans them
npm run brain:query risk               # the 10 risks, most severe first
npm run brain:query phase              # shipped and planned phases
```
