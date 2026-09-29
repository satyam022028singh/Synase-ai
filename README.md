# SYNASE AI frontend — Phases 0–5

Implemented frontend foundation, design system/application shell, mock-backed Auth + Workspace + Projects, Repository, Multimodal Input, Conversation, Analysis Requests, Workflow Runs, and SSE state handling.

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
- Honest future-phase placeholders
- Mock contract tests and build manifest

## Important

The live backend is intentionally not connected. Authentication, route finalization, pagination, signed-upload fields, provider authorization, message retry, analysis options, and SSE authentication/replay contracts remain unresolved. Mock event playback is explicitly labeled and user-triggered; it never represents live AI execution.