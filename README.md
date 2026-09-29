# SYNASE AI frontend — Phases 0–9

Implemented frontend foundation through mock-backed Context + Knowledge.

## Run

```bash
npm test
npm run build
python3 -m http.server 4173 -d dist
```

Open `http://localhost:4173`.

## Implemented

- Domain API abstraction and normalized errors
- Deterministic mock adapter, list envelopes, idempotent project creation contract
- TypeScript domain declaration inventory
- Responsive SYNASE AI design tokens and shell
- Accessible public/auth states
- Dashboard, projects list/search/filter, create project, project overview/settings
- Workspace switcher, project switcher, member and settings surfaces
- Repository connection, explicit mock sync, snapshots, and lazy tree preview
- Multimodal file/text/URL/repository input composer
- Initiate → mock transfer → complete upload sequence
- Distinct processing, security-scan, and extraction states
- User-triggered deterministic processing transitions
- Project-scoped conversation sessions and message thread
- Safe asset/repository context references
- Typed analysis composer and explicit queued request receipts
- Analysis request history and authoritative mock cancellation
- Workflow snapshots, tasks, ordered event history, and controls
- Explicit user-triggered mock SSE playback
- Connection, disconnect, reconnect/refetch, and terminal states
- MCP overview, execution traces, model/tool catalogs, discovery, servers, and health
- Credential-safe redacted trace metadata
- Product requirements, prioritization, strategy, and roadmap with explicit provenance
- DevOps architecture, quality, security, dependencies, testing, risk, and deployment plans
- Project-scoped context explorer with sensitivity and trust labels
- Safe memory search projections with relevance and source evidence
- Ranked retrieval history without embedding exposure
- Knowledge graph map plus an accessible relationship representation
- Honest future-phase placeholders
- Mock contract tests and build manifest

## Important

The live backend is intentionally not connected. Authentication, route finalization, pagination, signed-upload fields, provider authorization, SSE contracts, MCP payload DTOs, retrieval contracts, and graph-sync authorization remain unresolved. All MCP, context, memory, retrieval, and knowledge actions are deterministic mocks; they never contact external servers, models, tools, ChromaDB, Neo4j, or object storage.