# SYNASE AI frontend — Phases 0–3

Implemented frontend foundation, design system/application shell, mock-backed Auth + Workspace + Projects, Repository, and Multimodal Input.

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
- Honest future-phase placeholders
- Mock contract tests and build manifest

## Important

The live backend is intentionally not connected. Authentication, workspace/input route finalization, pagination, signed-upload fields, provider authorization, and several mutation contracts remain unresolved in the source documentation. The prototype labels mock behavior and does not simulate AI execution, repository access, or file processing.