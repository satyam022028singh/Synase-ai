// @ts-check
import { api, ApiError, createIdempotencyKey, normalizeWorkflowEvents } from "./api.js";

const app = document.querySelector("#app");
const state = {
  authenticated: true,
  user: null,
  workspaces: [],
  workspaceId: "ws_synase",
  projects: [],
  projectId: "prj_platform",
  dashboard: null,
  repositories: [],
  assets: [],
  conversations: [],
  messages: [],
  analysisRequests: [],
  workflows: [],
  workflowId: "",
  workflowTasks: [],
  workflowEvents: [],
  streamState: "idle",
  mcpOverview: null,
  mcpRequests: [],
  mcpTrace: [],
  mcpRequestId: "",
  mcpModels: [],
  mcpTools: [],
  mcpServers: [],
  mcpDirectories: [],
  requirements: [],
  productFeatures: [],
  productStrategy: null,
  roadmapItems: [],
  productTab: new URLSearchParams(location.search).get("productTab") || "requirements",
  devopsSummary: null,
  findings: [],
  devopsRecommendations: [],
  dependencies: [],
  testSuggestions: [],
  deploymentPlans: [],
  devopsTab: new URLSearchParams(location.search).get("devopsTab") || "overview",
  contextItems: [],
  memoryResults: [],
  retrievalHistory: [],
  knowledgeGraph: null,
  contextQuery: "",
  reports: [],
  reportId: "",
  reportDetail: null,
  approvals: [],
  approvalId: "",
  approvalDetail: null,
  conversationId: "",
  analysisTab: new URLSearchParams(location.search).get("tab") || "conversation",
  members: [],
  repositoryDetailId: "",
  repositorySnapshots: [],
  repositoryTree: [],
  inputTab: "file",
  loading: true,
  sidebarOpen: false,
  toast: "",
  error: ""
};

const routes = {
  dashboard: "/app/dashboard",
  projects: "/app/projects",
  createProject: "/app/projects/create",
  members: "/app/workspaces/ws_synase/members",
  workspaceSettings: "/app/workspaces/ws_synase/settings"
};

const projectRoute = (segment) => `/app/projects/${state.projectId || "prj_platform"}/${segment}`;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

function currentPath() {
  const queryRoute = new URLSearchParams(location.search).get("route");
  return queryRoute || location.hash.slice(1) || routes.dashboard;
}

function navigate(path) {
  history.replaceState(null, "", `${location.pathname}${location.search}#${path}`);
  state.sidebarOpen = false;
  render();
}

function isActive(path, prefix = false) {
  const cur = currentPath();
  if (path === routes.projects) {
    return cur === "/app/projects" || cur === "/app/projects/create";
  }
  if (path === "/app/activity" && (cur === "/app/activity" || cur === "/app/audit")) return true;
  return prefix ? cur.startsWith(path) : cur === path;
}

function toast(message) {
  state.toast = message;
  render();
  setTimeout(() => {
    state.toast = "";
    render();
  }, 2800);
}

function initials(name = "User") {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function status(value) {
  return `<span class="status ${escapeHtml(value)}">${escapeHtml(value.replaceAll("_", " "))}</span>`;
}

function formatBytes(bytes = 0) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function loading() {
  return `<div class="loading"><div><div class="spinner"></div><div>Loading authoritative state…</div></div></div>`;
}

function pageHeader(eyebrow, title, description, action = "") {
  return `<div class="breadcrumbs"><span>SYNASE AI</span><span>/</span><b>${escapeHtml(title)}</b></div>
    <header class="page-header">
      <div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(title)}</h1><p class="page-copy">${escapeHtml(description)}</p></div>
      ${action}
    </header>`;
}

function brandMarkSvg() {
  return `<svg class="brand-mark-svg" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="pGradA" x1="0%" y1="0%" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#2563eb"/></linearGradient>
      <linearGradient id="pGradB" x1="1" y1="0%" x2="0" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient>
      <linearGradient id="pGradC" x1="0%" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#818cf8"/></linearGradient>
    </defs>
    <g stroke-linejoin="round" stroke-linecap="round">
      <path d="M50 6 L92 78 L76 78 L42 20 L50 6 Z" fill="url(#pGradA)" fill-opacity="0.25" stroke="#38bdf8" stroke-width="2.2" />
      <path d="M92 78 L8 78 L16 64 L76 64 L76 78 Z" fill="url(#pGradB)" fill-opacity="0.28" stroke="#22d3ee" stroke-width="2.2" />
      <path d="M8 78 L50 6 L58 20 L24 78 L8 78 Z" fill="url(#pGradC)" fill-opacity="0.22" stroke="#818cf8" stroke-width="2.2" />
      <path d="M42 20 L58 20 L30 68 L74 68 L66 54 L38 54 L50 34" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" fill="none" />
    </g>
  </svg>`;
}

function navLink(path, icon, label, prefix = false, disabled = false) {
  return `<button class="nav-link ${isActive(path, prefix) ? "active" : ""}" data-route="${disabled ? "" : path}" ${disabled ? 'aria-disabled="true" title="Planned for a later phase"' : ""}>
    <span class="nav-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(label)}</span>
  </button>`;
}

function shell(content) {
  const workspaceOptions = state.workspaces.map((workspace) => `<option value="${workspace.id}" ${workspace.id === state.workspaceId ? "selected" : ""}>${escapeHtml(workspace.name)}</option>`).join("");
  const projectOptions = state.projects.map((project) => `<option value="${project.id}" ${project.id === state.projectId ? "selected" : ""}>${escapeHtml(project.name)}</option>`).join("");
  return `<div class="shell">
    <aside class="sidebar ${state.sidebarOpen ? "open" : ""}" aria-label="Primary navigation">
      <a class="brand" href="#${routes.dashboard}" data-route="${routes.dashboard}">
        <span class="brand-mark" aria-hidden="true">${brandMarkSvg()}</span>
        <span class="brand-copy"><strong>SYNASE AI</strong><span>Decision intelligence</span></span>
      </a>
      <nav>
        <div class="nav-section">
          <div class="nav-label">Workspace</div>
          ${navLink(routes.dashboard, "⌂", "Dashboard")}
          ${navLink(routes.projects, "◇", "Projects")}
          ${navLink(projectRoute("repository"), "⌘", "Repository")}
          ${navLink(projectRoute("inputs"), "＋", "Inputs")}
          ${navLink(projectRoute("analysis"), "↳", "Conversation & Analysis")}
          ${navLink(projectRoute("runs"), "▶", "Execution Runs")}
          ${navLink(routes.members, "◎", "Members")}
        </div>
        <div class="nav-section">
          <div class="nav-label">Intelligence</div>
          ${navLink("/app/intelligence/product", "P", "Product Intelligence")}
          ${navLink("/app/intelligence/devops", "D", "DevOps Intelligence")}
          ${navLink("/app/mcp/overview", "M", "MCP V2", true)}
          ${navLink("/app/context/overview", "C", "Context", true)}
          ${navLink("/app/knowledge/graph", "K", "Knowledge Graph")}
        </div>
        <div class="nav-section">
          <div class="nav-label">Outputs</div>
          ${navLink("/app/reports", "R", "Reports", true)}
          ${navLink("/app/approvals", "A", "Approvals")}
        </div>
        <div class="nav-section">
          <div class="nav-label">System</div>
          ${navLink("/app/integrations", "⊞", "Integrations")}
          ${navLink("/app/activity", "↗", "Activity & Audit", true)}
          ${navLink(routes.workspaceSettings, "⚙", "Settings")}
        </div>
      </nav>
    </aside>
    <div class="main-wrap">
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn mobile-menu" data-action="toggle-menu" aria-label="Open navigation">☰</button>
          <select class="context-select" id="workspace-switcher" aria-label="Current workspace">${workspaceOptions}</select>
          <select class="context-select project-context" id="project-switcher" aria-label="Current project">${projectOptions}</select>
        </div>
        <div class="topbar-actions">
          <button class="search-trigger" data-action="search" aria-label="Open command palette"><span>⌕</span><span>Search workspace</span><kbd>⌘ K</kbd></button>
          <button class="icon-btn" data-action="notifications" aria-label="Notifications">○</button>
          <button class="avatar" data-action="profile" aria-label="Open user menu">${initials(state.user?.displayName)}</button>
        </div>
      </header>
      <main id="main" class="content">${content}</main>
    </div>
    ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
  </div>`;
}

function metricCard(metric) {
  return `<article class="metric ${metric.tone || ""}">
    <div class="metric-label">${escapeHtml(metric.label)}</div>
    <div class="metric-value">${escapeHtml(metric.value)}</div>
    <div class="metric-note">${escapeHtml(metric.trend || "")}</div>
  </article>`;
}

function projectRows(projects, compact = false) {
  if (!projects.length) return `<div class="empty"><div><div class="empty-icon">◇</div><h2>No projects found</h2><p>Create a project or adjust your filters. Empty states always explain the next action.</p></div></div>`;
  if (compact) return `<div class="project-list">${projects.slice(0, 5).map((project) => `
    <button class="project-row" data-route="/app/projects/${project.id}/overview">
      <div><div class="project-title"><span class="project-glyph"></span>${escapeHtml(project.name)}</div><p class="project-desc">${escapeHtml(project.description)}</p></div>
      ${status(project.lifecycleStatus)}
    </button>`).join("")}</div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>Project</th><th>Status</th><th>Role</th><th>Updated</th><th></th></tr></thead>
    <tbody>${projects.map((project) => `<tr>
      <td><strong>${escapeHtml(project.name)}</strong><br><span class="small">${escapeHtml(project.description)}</span></td>
      <td>${status(project.lifecycleStatus)}</td><td>${escapeHtml(project.role.replaceAll("_", " "))}</td>
      <td>${new Date(project.updatedAt).toLocaleDateString()}</td>
      <td><button class="button ghost" data-route="/app/projects/${project.id}/overview">Open</button></td>
    </tr>`).join("")}</tbody></table></div>`;
}

function dashboardPage() {
  if (!state.dashboard) return loading();
  const workspace = state.workspaces.find((item) => item.id === state.workspaceId);
  return `${pageHeader("Workspace overview", `Good afternoon, ${state.user?.displayName?.split(" ")[0] || "Satyam"}`, `A clear view of ${workspace?.name || "your workspace"}. Metrics unavailable in Phase 2 are intentionally not fabricated.`, `<button class="button primary" data-route="${routes.createProject}">＋ New project</button>`)}
    <section class="metrics" aria-label="Workspace metrics">${state.dashboard.metrics.map(metricCard).join("")}</section>
    <section class="dashboard-grid">
      <article class="card"><div class="card-head"><div><h2>Active projects</h2><span class="small subtle">${state.dashboard.projects.length} in current workspace</span></div><button class="button ghost" data-route="${routes.projects}">View all</button></div>
        <div class="card-body">${projectRows(state.dashboard.projects, true)}</div>
      </article>
      <article class="card"><div class="card-head"><div><h2>Recent activity</h2><span class="small subtle">Mock contract events</span></div></div>
        <div class="card-body activity-list">${state.dashboard.activity.map((item) => `<div class="activity"><strong>${escapeHtml(item.actor)}</strong> ${escapeHtml(item.action)} <strong>${escapeHtml(item.target)}</strong><time>${escapeHtml(item.occurredAt)}</time></div>`).join("")}</div>
      </article>
    </section>`;
}

function projectsPage() {
  return `${pageHeader("Project workspace", "Projects", "Create, filter, and enter projects without coupling the frontend to database tables.", `<button class="button primary" data-route="${routes.createProject}">＋ New project</button>`)}
    <div class="toolbar">
      <input class="field-inline search" id="project-search" type="search" placeholder="Search projects" aria-label="Search projects">
      <select class="field-inline" id="project-status" aria-label="Filter project status">
        <option value="">All lifecycle states</option><option>active</option><option>draft</option><option>paused</option><option>completed</option><option>archived</option>
      </select>
    </div>
    <div id="project-results">${projectRows(state.projects)}</div>`;
}

function createProjectPage() {
  return `${pageHeader("Project workspace", "Create project", "Start with a small, typed contract. Repository and ingestion setup remain outside this phase.")}
    <section class="card form-card">
      <div class="alert">This build uses the deterministic mock adapter. A successful response represents contract behavior—not a live backend write.</div>
      <form id="create-project-form">
        <div class="form-grid">
          <div class="field full"><label for="project-workspace">Workspace</label><select id="project-workspace" name="workspaceId" required>${state.workspaces.map((w) => `<option value="${w.id}" ${w.id === state.workspaceId ? "selected" : ""}>${escapeHtml(w.name)}</option>`).join("")}</select></div>
          <div class="field full"><label for="project-name">Project name</label><input id="project-name" name="name" required maxlength="80" placeholder="e.g. Decision Intelligence Console"><small>Required · 80 characters maximum</small></div>
          <div class="field full"><label for="project-description">Description</label><textarea id="project-description" name="description" maxlength="360" placeholder="What is this project?"></textarea></div>
          <div class="field full"><label for="project-goal">Goal</label><textarea id="project-goal" name="goal" maxlength="360" placeholder="What outcome should this project drive?"></textarea></div>
        </div>
        <div id="form-message"></div>
        <div class="form-actions"><button type="button" class="button ghost" data-route="${routes.projects}">Cancel</button><button type="submit" class="button primary">Create project</button></div>
      </form>
    </section>`;
}

function projectOverviewPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "This project does not exist or is not available in the selected workspace.");
  state.projectId = project.id;
  return `${pageHeader("Project overview", project.name, "Structured project context with honest availability states.", `<button class="button" data-route="/app/projects/${project.id}/settings">Project settings</button>`)}
    <article class="card overview-hero">
      <div><div class="cluster">${status(project.lifecycleStatus)}<span class="status">${escapeHtml(project.role.replaceAll("_", " "))}</span></div>
        <p class="page-copy">${escapeHtml(project.description || "No description provided.")}</p>
        <div class="overview-meta"><span>Goal<b>${escapeHtml(project.goal || "Not defined")}</b></span><span>Workspace<b>${escapeHtml(state.workspaces.find((w) => w.id === project.workspaceId)?.name || "Unknown")}</b></span><span>Updated<b>${new Date(project.updatedAt).toLocaleDateString()}</b></span></div>
      </div>
    </article>
    <section class="placeholder-grid" aria-label="Future project modules">
      <article class="placeholder"><h3>Repository</h3><p>Connection and snapshot data becomes available in Phase 3. No repository state is simulated here.</p><button class="button" disabled>Not available</button></article>
      <article class="placeholder"><h3>Analysis runs</h3><p>Workflow creation and SSE execution views begin in later phases. Progress is never faked.</p><button class="button" disabled>Not available</button></article>
      <article class="placeholder"><h3>Decision reports</h3><p>Reports and approval state are intentionally withheld until their contracted phase.</p><button class="button" disabled>Not available</button></article>
    </section>`;
}

function projectSettingsPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Settings cannot be loaded for an unavailable project.");
  return `${pageHeader("Project administration", `${project.name} settings`, "Edit safe project metadata. Membership and destructive changes remain authoritative server actions.")}
    <section class="dashboard-grid">
      <article class="card form-card"><form id="project-settings-form" data-project-id="${project.id}">
        <div class="field"><label for="settings-name">Project name</label><input id="settings-name" name="name" value="${escapeHtml(project.name)}" required></div>
        <div class="field"><label for="settings-description">Description</label><textarea id="settings-description" name="description">${escapeHtml(project.description)}</textarea></div>
        <div class="form-actions"><button class="button primary" type="submit">Save changes</button></div>
      </form></article>
      <article class="card"><div class="card-head"><h2>Danger zone</h2></div><div class="card-body"><p class="page-copy">Archive and delete are disabled until their backend semantics, restoration behavior, and ownership safeguards are frozen.</p><button class="button danger" disabled>Archive project</button></div></article>
    </section>`;
}

function membersPage() {
  return `${pageHeader("Workspace administration", "Workspace members", "Manage roles through explicit, non-optimistic mutations. This route is provisional.", `<button class="button primary" data-action="invite">＋ Invite member</button>`)}
    <div class="alert">Provisional route: workspace member URLs must be approved before backend integration.</div>
    <div class="table-wrap"><table><thead><tr><th>Member</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead><tbody>
      ${state.members.map((member) => `<tr><td><strong>${escapeHtml(member.name)}</strong><br>${escapeHtml(member.email)}</td><td>${escapeHtml(member.role)}</td><td>${escapeHtml(member.joinedAt)}</td><td>${status("active")}</td></tr>`).join("")}
    </tbody></table></div>`;
}

function workspaceSettingsPage() {
  const workspace = state.workspaces.find((item) => item.id === state.workspaceId);
  return `${pageHeader("Workspace administration", "Workspace settings", "Workspace defaults and destructive behavior remain permission-aware and contract-driven.")}
    <div class="alert">Provisional route. Ownership transfer, archive, and deletion safeguards must be frozen before activation.</div>
    <section class="card form-card"><form id="workspace-settings-form">
      <div class="form-grid">
        <div class="field full"><label for="workspace-name">Workspace name</label><input id="workspace-name" value="${escapeHtml(workspace?.name)}" disabled><small>Read-only in this frontend-only build.</small></div>
        <div class="field full"><label for="workspace-description">Description</label><textarea id="workspace-description" disabled>${escapeHtml(workspace?.description)}</textarea></div>
      </div>
      <div class="form-actions"><button type="button" class="button" disabled>Save changes</button></div>
    </form></section>`;
}

function repositoryPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Repository context cannot be loaded for an unavailable project.");
  state.projectId = project.id;
  const detail = state.repositories.find((item) => item.id === state.repositoryDetailId);
  return `${pageHeader("Project context", "Repository", `Connect and inspect repositories for ${project.name}. Sync actions are explicit mock operations.`, `<button class="button primary" data-action="toggle-repo-form">＋ Connect repository</button>`)}
    <div class="alert">Mock adapter active. Provider authorization, source retrieval, scanning, and synchronization are not live.</div>
    <section id="repo-form-panel" class="card form-card hidden-panel">
      <form id="connect-repository-form">
        <div class="form-grid">
          <div class="field"><label for="repo-provider">Provider</label><select id="repo-provider" name="provider" required><option value="github">GitHub</option><option value="gitlab">GitLab</option><option value="bitbucket">Bitbucket</option><option value="local">Local</option></select></div>
          <div class="field"><label for="repo-branch">Default branch</label><input id="repo-branch" name="defaultBranch" value="main"></div>
          <div class="field full"><label for="repo-path">Repository path</label><input id="repo-path" name="fullName" placeholder="organization/repository" required><small>Do not enter provider tokens or credentials.</small></div>
        </div>
        <div id="repo-form-message"></div>
        <div class="form-actions"><button class="button primary" type="submit">Connect mock repository</button></div>
      </form>
    </section>
    ${state.repositories.length ? `<div class="table-wrap"><table><thead><tr><th>Repository</th><th>Provider</th><th>Branch</th><th>Connection</th><th>Last sync</th><th></th></tr></thead><tbody>
      ${state.repositories.map((repository) => `<tr>
        <td><strong>${escapeHtml(repository.fullName)}</strong><br><span class="small">${escapeHtml(repository.visibility)}</span></td>
        <td>${escapeHtml(repository.provider)}</td><td><code>${escapeHtml(repository.defaultBranch)}</code></td><td>${status(repository.connectionStatus)}</td>
        <td>${repository.lastSyncedAt ? new Date(repository.lastSyncedAt).toLocaleString() : "Never"}</td>
        <td><div class="cluster"><button class="button ghost" data-action="repo-detail" data-repository-id="${repository.id}">Inspect</button><button class="button" data-action="repo-sync" data-repository-id="${repository.id}" ${repository.connectionStatus !== "connected" ? "disabled" : ""}>Sync</button></div></td>
      </tr>`).join("")}</tbody></table></div>` : `<section class="card empty"><div><div class="empty-icon">⌘</div><h2>No repositories connected</h2><p>Connect a repository to provide project source context. Provider credentials are never collected by this mock.</p><button class="button primary" data-action="toggle-repo-form">Connect repository</button></div></section>`}
    ${detail ? `<section class="card repository-detail">
      <div class="card-head"><div><h2>${escapeHtml(detail.fullName)}</h2><span class="small subtle">Snapshot and tree preview</span></div><button class="icon-btn" data-action="close-repo-detail" aria-label="Close repository detail">×</button></div>
      <div class="detail-grid">
        <div class="card-body"><h3>Snapshots</h3>${state.repositorySnapshots.length ? `<div class="snapshot-list">${state.repositorySnapshots.map((snapshot) => `<div class="snapshot"><code>${escapeHtml(snapshot.commitSha)}</code><span>${escapeHtml(snapshot.branch)} · ${snapshot.fileCount} files · ${formatBytes(snapshot.totalBytes)}</span>${status(snapshot.scanStatus)}</div>`).join("")}</div>` : `<p class="page-copy">No snapshots are available.</p>`}</div>
        <div class="card-body tree-panel"><h3>Lazy tree preview</h3>${state.repositoryTree.length ? `<ul class="tree-list">${state.repositoryTree.map((node) => `<li><span aria-hidden="true">${node.type === "directory" ? "▾" : "·"}</span><code>${escapeHtml(node.path)}</code>${node.byteSize ? `<small>${formatBytes(node.byteSize)}</small>` : ""}</li>`).join("")}</ul>` : `<p class="page-copy">Tree data is unavailable.</p>`}</div>
      </div>
    </section>` : ""}`;
}

function assetState(asset) {
  const blocked = asset.securityScanStatus === "blocked";
  return `<div class="state-stack">${status(asset.processingStatus)}${status(asset.securityScanStatus)}${blocked ? `<span class="small danger-text">Security blocked</span>` : ""}</div>`;
}

function inputComposer(projectId) {
  const tabs = [
    ["file", "File upload"],
    ["text", "Text"],
    ["url", "URL"],
    ["repository", "Repository"]
  ];
  return `<section class="card composer">
    <div class="input-tabs" role="tablist">${tabs.map(([key, label]) => `<button class="input-tab ${state.inputTab === key ? "active" : ""}" role="tab" aria-selected="${state.inputTab === key}" data-action="input-tab" data-tab="${key}">${label}</button>`).join("")}</div>
    <div class="card-body">
      ${state.inputTab === "file" ? `<form id="file-input-form">
        <label class="dropzone" for="asset-file"><span class="drop-icon">⇧</span><strong>Select a multimodal file</strong><span>PDF, DOCX, PPTX, CSV, spreadsheets, images, audio, video, logs, or code archives · mock limit 50 MB</span><input id="asset-file" name="file" type="file" required></label>
        <div class="option-row"><label><input type="checkbox" name="ocr"> OCR when applicable</label><label><input type="checkbox" name="extractTables"> Extract tables</label><label><input type="checkbox" name="profileData"> Profile structured data</label></div>
        <div id="input-form-message"></div><div class="form-actions"><button class="button primary" type="submit">Run mock upload sequence</button></div>
      </form>` : ""}
      ${state.inputTab === "text" ? `<form id="text-input-form"><div class="field"><label for="text-title">Title</label><input id="text-title" name="title" placeholder="Context note"></div><div class="field"><label for="text-content">Text context</label><textarea id="text-content" name="text" required placeholder="Paste trusted project context"></textarea></div><div id="input-form-message"></div><div class="form-actions"><button class="button primary" type="submit">Add text context</button></div></form>` : ""}
      ${state.inputTab === "url" ? `<form id="url-input-form"><div class="field"><label for="source-url">URL</label><input id="source-url" name="url" type="url" required placeholder="https://example.com/spec"><small>External content is treated as untrusted until processed.</small></div><div id="input-form-message"></div><div class="form-actions"><button class="button primary" type="submit">Add URL</button></div></form>` : ""}
      ${state.inputTab === "repository" ? `<div class="empty compact-empty"><div><div class="empty-icon">⌘</div><h2>Use connected repositories</h2><p>Repository-based inputs use the project repository inventory. No provider credentials are exposed here.</p><button class="button" data-route="/app/projects/${projectId}/repository">Open repositories</button></div></div>` : ""}
    </div>
  </section>`;
}

function inputsPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Inputs cannot be loaded for an unavailable project.");
  state.projectId = project.id;
  return `${pageHeader("Project context", "Multimodal inputs", `Add and track trusted project context for ${project.name}. The route and all processing are explicitly provisional/mock.`, "")}
    <div class="alert">Provisional route · Mock adapter active. Selected file contents never leave this browser build; only metadata is added to fixtures.</div>
    ${inputComposer(projectId)}
    <section class="asset-section">
      <div class="section-title"><div><h2>Input inventory</h2><p class="small subtle">${state.assets.length} active items</p></div><select id="asset-status-filter" class="field-inline" aria-label="Filter processing status"><option value="">All processing states</option><option>received</option><option>scanning</option><option>extracting</option><option>indexing</option><option>ready</option><option>warning</option><option>failed</option></select></div>
      <div id="asset-results">${assetTable(state.assets, projectId)}</div>
    </section>`;
}

function contextOptions(items, selected = []) {
  return items.map((item) => `<option value="${item.id}" ${selected.includes(item.id) ? "selected" : ""}>${escapeHtml(item.name || item.fullName)}</option>`).join("");
}

function messageThread() {
  if (!state.conversationId) return `<div class="empty"><div><div class="empty-icon">💬</div><h2>Select a conversation</h2><p>Choose an active project conversation or create a new one.</p></div></div>`;
  if (!state.messages.length) return `<div class="empty"><div><div class="empty-icon">＋</div><h2>No messages yet</h2><p>Add project context or start a typed analysis request.</p></div></div>`;
  return `<div class="message-thread">${state.messages.map((message) => `
    <article class="message ${message.role}">
      <div class="message-meta"><span>${escapeHtml(message.role)}</span>${message.mock ? `<b>Mock receipt</b>` : ""}<time>${new Date(message.createdAt).toLocaleString()}</time></div>
      <p>${escapeHtml(message.text || "")}</p>
      ${(message.assetIds?.length || message.repositoryIds?.length) ? `<div class="message-refs">${message.assetIds.map((id) => `<span>Asset · ${escapeHtml(state.assets.find((item) => item.id === id)?.name || id)}</span>`).join("")}${message.repositoryIds.map((id) => `<span>Repository · ${escapeHtml(state.repositories.find((item) => item.id === id)?.fullName || id)}</span>`).join("")}</div>` : ""}
      <div class="message-status">${status(message.status)}</div>
    </article>`).join("")}</div>`;
}

function conversationWorkspace(projectId) {
  const active = state.conversations.find((item) => item.id === state.conversationId);
  return `<div class="conversation-layout">
    <aside class="conversation-sidebar card">
      <div class="card-head"><div><h2>Conversations</h2><span class="small subtle">${state.conversations.length} sessions</span></div><button class="icon-btn" data-action="toggle-conversation-form" aria-label="New conversation">＋</button></div>
      <form id="new-conversation-form" class="mini-form hidden-panel"><input name="title" placeholder="Conversation title" required><button class="button primary" type="submit">Create</button></form>
      <div class="conversation-list">${state.conversations.length ? state.conversations.map((session) => `<button class="conversation-item ${session.id === state.conversationId ? "active" : ""}" data-action="select-conversation" data-conversation-id="${session.id}"><strong>${escapeHtml(session.title || "Untitled")}</strong><span>${escapeHtml(session.status)} · ${new Date(session.updatedAt).toLocaleDateString()}</span></button>`).join("") : `<div class="card-body small muted">No conversation sessions.</div>`}</div>
    </aside>
    <section class="card conversation-main">
      <div class="card-head"><div><h2>${escapeHtml(active?.title || "Conversation")}</h2><span class="small subtle">Project-scoped context discussion</span></div>${active ? status(active.status) : ""}</div>
      ${messageThread()}
      ${active ? `<form id="message-form" class="message-composer">
        <div class="field"><label for="message-text">Message</label><textarea id="message-text" name="text" required placeholder="Describe the product or engineering decision to explore"></textarea></div>
        <div class="attachment-grid">
          <div class="field"><label for="message-assets">Asset references</label><select id="message-assets" name="assetIds" multiple>${contextOptions(state.assets)}</select></div>
          <div class="field"><label for="message-repositories">Repository references</label><select id="message-repositories" name="repositoryIds" multiple>${contextOptions(state.repositories)}</select></div>
        </div>
        <div id="conversation-form-message"></div>
        <div class="form-actions"><span class="small subtle">Mock adapter: no AI response will run.</span><button class="button primary" type="submit">Send message</button></div>
      </form>` : ""}
    </section>
  </div>`;
}

function analysisComposer(projectId) {
  return `<section class="card form-card analysis-form-card">
    <div class="alert">Submitting creates a mock queued receipt only. Intent detection, orchestration, model/tool work, validation, confidence, and report generation do not run in Phase 4.</div>
    <form id="analysis-request-form">
      <div class="form-grid">
        <div class="field full"><label for="analysis-text">Analysis request</label><textarea id="analysis-text" name="requestText" required placeholder="Review the architecture implications of this PRD"></textarea></div>
        <div class="field"><label for="analysis-type">Request type</label><select id="analysis-type" name="requestType" required><option value="architecture_review">Architecture review</option><option value="requirement_analysis">Requirement analysis</option><option value="repository_review">Repository review</option><option value="risk_assessment">Risk assessment</option><option value="security_analysis">Security analysis</option><option value="testing_plan">Testing plan</option></select></div>
        <div class="field"><label for="analysis-priority">Priority</label><select id="analysis-priority" name="priority"><option value="low">Low</option><option value="normal" selected>Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
        <div class="field"><label for="analysis-strategy">Execution strategy</label><select id="analysis-strategy" name="executionStrategy"><option value="sequential">Sequential</option><option value="parallel">Parallel</option><option value="hybrid" selected>Hybrid</option></select></div>
        <div class="field"><label for="analysis-conversation">Conversation</label><select id="analysis-conversation" name="conversationId"><option value="">No linked conversation</option>${state.conversations.map((item) => `<option value="${item.id}" ${item.id === state.conversationId ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></div>
        <div class="field"><label for="analysis-assets">Assets</label><select id="analysis-assets" name="assetIds" multiple>${contextOptions(state.assets)}</select><small>Use Ctrl/Cmd to select multiple.</small></div>
        <div class="field"><label for="analysis-repositories">Repositories</label><select id="analysis-repositories" name="repositoryIds" multiple>${contextOptions(state.repositories)}</select><small>References only; no source is fetched.</small></div>
      </div>
      <div id="analysis-form-message"></div>
      <div class="form-actions"><button class="button primary" type="submit">Create analysis request</button></div>
    </form>
  </section>`;
}

function requestHistory() {
  if (!state.analysisRequests.length) return `<section class="card empty"><div><div class="empty-icon">↳</div><h2>No analysis requests</h2><p>Create a typed request. Phase 5 will later provide workflow execution views.</p></div></section>`;
  return `<div class="table-wrap"><table><thead><tr><th>Request</th><th>Type</th><th>Priority</th><th>Status</th><th>Receipt</th><th></th></tr></thead><tbody>${state.analysisRequests.map((request) => `<tr>
    <td><strong>${escapeHtml(request.requestText)}</strong><br><span class="small">${new Date(request.createdAt).toLocaleString()}${request.mock ? " · Mock" : ""}</span></td>
    <td>${escapeHtml(request.requestType.replaceAll("_", " "))}</td><td>${escapeHtml(request.priority)}</td><td>${status(request.status)}</td>
    <td><code>${escapeHtml(request.id)}</code><br><span class="small">${escapeHtml(request.workflowId || "No workflow")}</span></td>
    <td>${["received","validated","queued","processing"].includes(request.status) ? `<button class="button ghost" data-action="cancel-request" data-request-id="${request.id}">Cancel</button>` : ""}</td>
  </tr>`).join("")}</tbody></table></div>`;
}

function analysisPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Conversation and analysis cannot be loaded for an unavailable project.");
  state.projectId = project.id;
  const tabs = [["conversation","Conversation"],["compose","New analysis"],["history","Request history"]];
  return `${pageHeader("Decision workspace", "Conversation & analysis", `Organize project context and create typed analysis requests for ${project.name}. Workflow execution begins in Phase 5.`)}
    <div class="alert">Provisional route · Mock adapter active. No AI model, agent, tool, workflow, validation, confidence, or report generation is running.</div>
    <div class="input-tabs page-tabs" role="tablist">${tabs.map(([key,label]) => `<button class="input-tab ${state.analysisTab === key ? "active" : ""}" role="tab" aria-selected="${state.analysisTab === key}" data-action="analysis-tab" data-tab="${key}">${label}</button>`).join("")}</div>
    ${state.analysisTab === "conversation" ? conversationWorkspace(projectId) : state.analysisTab === "compose" ? analysisComposer(projectId) : requestHistory()}`;
}

function workflowList() {
  return `<div class="run-list">${state.workflows.map((workflow) => `<button class="run-item ${workflow.id === state.workflowId ? "active" : ""}" data-action="select-workflow" data-workflow-id="${workflow.id}">
    <span>${status(workflow.status)}<b>${escapeHtml(workflow.id)}</b></span><small>${escapeHtml(workflow.currentStage || "Not started")} · ${workflow.progressPercent}%</small>
  </button>`).join("")}</div>`;
}

function workflowDetail() {
  const workflow = state.workflows.find((item) => item.id === state.workflowId);
  if (!workflow) return `<section class="card empty"><div><div class="empty-icon">▶</div><h2>Select a workflow</h2><p>Choose a run to inspect its authoritative snapshot and event history.</p></div></section>`;
  const terminal = ["completed","failed","cancelled"].includes(workflow.status);
  return `<section class="workflow-detail">
    <article class="card run-summary">
      <div class="card-head"><div><h2>${escapeHtml(workflow.id)}</h2><span class="small subtle">Request ${escapeHtml(workflow.requestId)} · ${escapeHtml(workflow.executionStrategy)}</span></div><div class="cluster">${status(workflow.status)}<span class="connection ${state.streamState}">${escapeHtml(state.streamState)}</span></div></div>
      <div class="card-body">
        <div class="progress-head"><span>${escapeHtml(workflow.currentStage || "Not started").replaceAll("_"," ")}</span><b>${workflow.progressPercent}%</b></div>
        <div class="progress-track" aria-label="Authoritative workflow progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${workflow.progressPercent}" role="progressbar"><span style="width:${workflow.progressPercent}%"></span></div>
        <div class="control-bar">
          <button class="button" data-action="workflow-control" data-control="${workflow.status === "paused" ? "resume" : "pause"}" ${terminal ? "disabled" : ""}>${workflow.status === "paused" ? "Resume" : "Pause"}</button>
          <button class="button danger" data-action="workflow-control" data-control="cancel" ${terminal ? "disabled" : ""}>Cancel</button>
          <button class="button primary" data-action="next-mock-event" ${terminal ? "disabled" : ""}>Emit next mock event</button>
        </div>
        <p class="small subtle">Mock playback is user-triggered. No model, tool, agent, or backend workflow is running.</p>
      </div>
    </article>
    <div class="workflow-grid">
      <article class="card"><div class="card-head"><h2>Tasks</h2><span class="small subtle">${state.workflowTasks.length} tasks</span></div><div class="task-list">${state.workflowTasks.map((task) => `<div class="task-row"><span class="task-seq">${task.sequence}</span><div><strong>${escapeHtml(task.name)}</strong><small>${escapeHtml(task.layer)} · ${task.progressPercent}%</small></div>${status(task.status)}</div>`).join("")}</div></article>
      <article class="card"><div class="card-head"><h2>Event stream</h2><button class="button ghost" data-action="toggle-stream">${state.streamState === "open" ? "Disconnect" : "Connect mock stream"}</button></div><div class="event-list">${state.workflowEvents.slice().reverse().map((event) => `<div class="event-row"><span>${event.sequence}</span><div><strong>${escapeHtml(event.eventType)}</strong><small>${escapeHtml(event.payload.stage || event.payload.status || "event")}</small></div><time>${new Date(event.occurredAt).toLocaleTimeString()}</time></div>`).join("")}</div></article>
    </div>
  </section>`;
}

function runsPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Workflow runs cannot be loaded for an unavailable project.");
  state.projectId = project.id;
  return `${pageHeader("Workflow execution", "Execution runs", `Inspect authoritative workflow snapshots and explicit mock SSE playback for ${project.name}.`)}
    <div class="alert">Mock SSE test harness. Events advance only when you click “Emit next mock event”; no live AI execution is represented.</div>
    <div class="runs-layout"><aside class="card"><div class="card-head"><div><h2>Runs</h2><span class="small subtle">${state.workflows.length} workflows</span></div></div>${workflowList()}</aside>${workflowDetail()}</div>`;
}

function mcpTabs(view) {
  const tabs = [["overview","Overview"],["executions","Executions"],["tools","Tools"],["models","Models"],["discovery","Discovery"]];
  return `<div class="input-tabs page-tabs">${tabs.map(([key,label]) => `<button class="input-tab ${view === key ? "active" : ""}" data-route="/app/mcp/${key}">${label}</button>`).join("")}</div>`;
}

function mcpOverviewView() {
  const metrics = [
    { label: "Requests", value: String(state.mcpOverview?.requestCount ?? "—"), trend: "Mock catalog", tone: "neutral" },
    { label: "Completed / cached", value: String(state.mcpOverview?.completedCount ?? "—"), trend: "Trace metadata", tone: "positive" },
    { label: "Avg. confidence", value: state.mcpOverview ? `${Math.round(state.mcpOverview.averageConfidence * 100)}%` : "—", trend: "Normalized 0–1", tone: "neutral" },
    { label: "Healthy servers", value: String(state.mcpOverview?.healthyServers ?? "—"), trend: `${state.mcpServers.length} known`, tone: "warning" }
  ];
  return `<section class="metrics">${metrics.map(metricCard).join("")}</section>
    <div class="dashboard-grid"><article class="card"><div class="card-head"><h2>Recent MCP requests</h2><button class="button ghost" data-route="/app/mcp/executions">View traces</button></div><div class="card-body">${mcpRequestTable(state.mcpRequests.slice(0,5))}</div></article>
    <article class="card"><div class="card-head"><h2>Inventory</h2></div><div class="card-body inventory-list"><div><span>Models</span><b>${state.mcpModels.length}</b></div><div><span>Tools</span><b>${state.mcpTools.length}</b></div><div><span>Servers</span><b>${state.mcpServers.length}</b></div><div><span>Directories</span><b>${state.mcpDirectories.length}</b></div></div></article></div>`;
}

function mcpRequestTable(requests) {
  return `<div class="mcp-request-list">${requests.map((request) => `<button class="mcp-request ${request.id === state.mcpRequestId ? "active" : ""}" data-action="select-mcp-request" data-request-id="${request.id}"><div><strong>${escapeHtml(request.id)}</strong><span>${escapeHtml(request.detectedLayer || "unknown")} · ${escapeHtml(request.payloadFormat)}</span></div>${status(request.status)}<b>${Math.round(request.confidence * 100)}%</b></button>`).join("")}</div>`;
}

function mcpExecutionsView() {
  const request = state.mcpRequests.find((item) => item.id === state.mcpRequestId);
  return `<div class="mcp-layout"><aside class="card"><div class="card-head"><h2>Requests</h2></div>${mcpRequestTable(state.mcpRequests)}</aside>
    <section class="card"><div class="card-head"><div><h2>${escapeHtml(request?.id || "Select a request")}</h2><span class="small subtle">${request ? `${request.detectedLayer} layer · validation ${request.validationStatus}` : ""}</span></div>${request ? status(request.status) : ""}</div>
    <div class="trace-list">${state.mcpTrace.map((stage) => `<div class="trace-stage"><span class="trace-seq">${stage.sequence}</span><div><strong>${escapeHtml(stage.chamber.replaceAll("_"," "))}</strong><p>${escapeHtml(stage.summary)}</p></div><div>${status(stage.status)}<small>${stage.durationMs ? `${stage.durationMs} ms` : "—"}</small></div></div>`).join("")}</div>
    ${request ? `<div class="safe-payload"><b>Safe trace metadata</b><code>{ layer: \"${escapeHtml(request.detectedLayer)}\", format: \"${escapeHtml(request.payloadFormat)}\", credentials: \"[REDACTED]\" }</code></div>` : ""}</section></div>`;
}

function mcpCatalogView(kind) {
  const models = kind === "models";
  const items = models ? state.mcpModels : state.mcpTools;
  return `<div class="catalog-grid">${items.map((item) => `<article class="card catalog-card"><div class="card-body"><div class="catalog-head"><span class="catalog-glyph">${models ? "M" : "T"}</span>${status(item.availabilityStatus)}</div><h2>${escapeHtml(item.name)}</h2><p>${models ? `${escapeHtml(item.provider)} · ${item.contextWindow?.toLocaleString() || "—"} context` : `${escapeHtml(item.type)} · ${(item.capabilities || []).join(", ")}`}</p><div class="small subtle">Safe catalog metadata only</div></div></article>`).join("")}</div>`;
}

function mcpDiscoveryView() {
  return `<div class="workflow-grid"><article class="card"><div class="card-head"><h2>Directories</h2></div><div class="discovery-list">${state.mcpDirectories.map((directory) => `<div class="discovery-row"><div><strong>${escapeHtml(directory.name)}</strong><span>${escapeHtml(directory.type)} · ${escapeHtml(directory.healthStatus)}</span></div>${status(directory.status)}<button class="button" data-action="discover-directory" data-directory-id="${directory.id}" ${directory.status !== "active" ? "disabled" : ""}>Discover</button></div>`).join("")}</div></article>
    <article class="card"><div class="card-head"><h2>Servers</h2></div><div class="discovery-list">${state.mcpServers.map((server) => `<div class="discovery-row"><div><strong>${escapeHtml(server.name)}</strong><span>${escapeHtml(server.transportType)} · ${server.toolCount} tools</span></div>${status(server.healthStatus)}<button class="button ghost" data-action="server-health" data-server-id="${server.id}">Health check</button></div>`).join("")}</div></article></div>`;
}

function mcpPage(view = "overview") {
  return `${pageHeader("MCP V2", view === "overview" ? "MCP observability" : `MCP ${view}`, "Inspect safe execution metadata, catalogs, routing traces, validation, confidence, discovery, and server health.")}
    <div class="alert">Mock MCP workspace. No directory, server, model, agent, or tool is contacted, and credentials never enter frontend display models.</div>
    ${mcpTabs(view)}
    ${view === "overview" ? mcpOverviewView() : view === "executions" ? mcpExecutionsView() : view === "tools" ? mcpCatalogView("tools") : view === "models" ? mcpCatalogView("models") : mcpDiscoveryView()}`;
}

function provenance(item) {
  return item.provenance === "ai_suggested" ? `<span class="proposal">AI suggestion${item.confidence ? ` · ${Math.round(item.confidence*100)}%` : ""}</span>` : `<span class="confirmed">Confirmed state</span>`;
}

function requirementsView() {
  return `<div class="table-wrap"><table><thead><tr><th>ID / Requirement</th><th>Type</th><th>Priority</th><th>Status</th><th>Evidence / impact</th><th>Provenance</th></tr></thead><tbody>${state.requirements.map((item) => `<tr><td><strong>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</strong><br><span class="small">${escapeHtml(item.rationale || "")}</span></td><td>${escapeHtml(item.type)}</td><td>${status(item.priority)}</td><td>${status(item.status)}</td><td>${escapeHtml(item.evidence.join(", "))}<br><span class="small">${escapeHtml(item.architectureImpact || "—")}</span></td><td>${provenance(item)}</td></tr>`).join("")}</tbody></table></div>`;
}

function prioritizationView() {
  return `<div class="priority-grid">${state.productFeatures.map((feature) => `<article class="card priority-card"><div class="card-body"><div class="catalog-head"><span class="rank">#${feature.priorityRank}</span>${provenance(feature)}</div><h2>${escapeHtml(feature.title)}</h2><p>${escapeHtml(feature.rationale)}</p><div class="score-grid"><span>Value<b>${feature.businessValue}</b></span><span>Impact<b>${feature.impact}</b></span><span>Effort<b>${feature.effort}</b></span><span>Risk<b>${feature.risk}</b></span></div><div class="cluster">${status(feature.status)}</div></div></article>`).join("")}</div>`;
}

function strategyView() {
  const item = state.productStrategy;
  if (!item) return notFound("Strategy unavailable","No strategy aggregate is available for this project.");
  return `<div class="dashboard-grid"><article class="card"><div class="card-head"><h2>Strategic objective</h2>${provenance(item)}</div><div class="card-body"><p class="strategy-objective">${escapeHtml(item.objective)}</p><h3>Principles</h3><ul class="clean-list">${item.principles.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul></div></article><article class="card"><div class="card-head"><h2>Known risks</h2></div><div class="card-body"><ul class="clean-list risk-list">${item.risks.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul></div></article></div>`;
}

function roadmapView() {
  return `<div class="roadmap">${state.roadmapItems.map((item) => `<article class="roadmap-item"><span class="roadmap-seq">${item.sequence}</span><div><div class="cluster"><b>${escapeHtml(item.release)}</b>${status(item.status)}</div><h2>${escapeHtml(item.milestone)}</h2><p>${escapeHtml(item.startDate || "—")} → ${escapeHtml(item.endDate || "—")}</p><small>Dependencies: ${escapeHtml(item.dependencies.join(", ") || "None")}</small></div></article>`).join("")}</div>`;
}

function productIntelligencePage() {
  const tabs = [["requirements","Requirements"],["prioritization","Prioritization"],["strategy","Strategy"],["roadmap","Roadmap"]];
  return `${pageHeader("Product intelligence", "Product decisions", "Structure requirements, feature priorities, strategy, and roadmap with evidence and explicit suggestion provenance.", `<button class="button primary" data-action="product-mock" data-product-action="${state.productTab}">Run mock ${state.productTab}</button>`)}
    <div class="alert">Mock Product Intelligence. Suggestions are clearly separated from confirmed project state; no AI workflow is running.</div>
    <div class="input-tabs page-tabs">${tabs.map(([key,label]) => `<button class="input-tab ${state.productTab===key?"active":""}" data-action="product-tab" data-tab="${key}">${label}</button>`).join("")}</div>
    ${state.productTab === "requirements" ? requirementsView() : state.productTab === "prioritization" ? prioritizationView() : state.productTab === "strategy" ? strategyView() : roadmapView()}`;
}

function findingsTable(items = state.findings) {
  return `<div class="table-wrap"><table><thead><tr><th>Finding</th><th>Type</th><th>Severity</th><th>Affected location</th><th>Status</th></tr></thead><tbody>${items.map((item) => `<tr><td><strong>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</strong><br><span class="small">${escapeHtml(item.evidence)}</span></td><td>${escapeHtml(item.type)}</td><td>${status(item.severity)}</td><td>${escapeHtml(item.affectedLocation || "—")}</td><td>${status(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}

function devopsOverview() {
  const s = state.devopsSummary || {};
  const metrics = [["Architecture",s.architectureScore],["Code quality",s.qualityScore],["Security",s.securityScore],["Deployment readiness",s.deploymentReadiness]];
  return `<section class="metrics">${metrics.map(([label,value]) => metricCard({label,value:value == null?"—":`${Math.round(value*100)}%`,trend:"Mock evidence aggregate",tone:value<.7?"warning":"positive"})).join("")}</section>
    <div class="dashboard-grid"><article class="card"><div class="card-head"><h2>Open engineering findings</h2></div><div class="card-body">${findingsTable(state.findings)}</div></article><article class="card"><div class="card-head"><h2>Recommendations</h2></div><div class="card-body recommendation-list">${state.devopsRecommendations.map((item)=>`<div class="recommendation"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.rationale)}</p><div class="cluster">${status(item.priority)}${status(item.approvalStatus)}<span class="proposal">Not executed</span></div></div>`).join("")}</div></article></div>`;
}

function devopsDependencies() {
  return `<div class="table-wrap"><table><thead><tr><th>Dependency</th><th>Category</th><th>Version</th><th>Risk</th><th>Status</th></tr></thead><tbody>${state.dependencies.map((item)=>`<tr><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.currentVersion)}</td><td>${status(item.risk)}</td><td>${status(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}
function devopsTesting() {
  return `<div class="catalog-grid">${state.testSuggestions.map((item)=>`<article class="card catalog-card"><div class="card-body"><div class="catalog-head"><span class="catalog-glyph">T</span>${status(item.status)}</div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.type)} testing</p><div class="cluster">${status(item.priority)}<span class="proposal">Suggestion · not executed</span></div></div></article>`).join("")}</div>`;
}
function devopsDeployment() {
  return `<div class="catalog-grid">${state.deploymentPlans.map((plan)=>`<article class="card deployment-card"><div class="card-head"><div><h2>${escapeHtml(plan.title)}</h2><span class="small subtle">Plan only · never executed</span></div>${status(plan.status)}</div><div class="card-body"><div class="deployment-steps">${plan.steps.map((step)=>`<div><span>${step.sequence}</span><strong>${escapeHtml(step.title)}</strong>${status(step.status)}</div>`).join("")}</div><div class="alert">Approval required: ${plan.approvalRequired ? "Yes" : "No"}. Executed: No.</div></div></article>`).join("")}</div>`;
}

function devopsIntelligencePage() {
  const tabs = [["overview","Overview"],["architecture","Architecture"],["quality","Quality"],["security","Security"],["dependencies","Dependencies"],["testing","Testing"],["risk","Risk"],["deployment","Deployment"]];
  let body = devopsOverview();
  if (["architecture","quality","security","risk"].includes(state.devopsTab)) body = findingsTable(state.findings.filter((item)=> state.devopsTab==="risk" || item.type === state.devopsTab || (state.devopsTab==="quality" && item.type==="testing")));
  if (state.devopsTab === "dependencies") body = devopsDependencies();
  if (state.devopsTab === "testing") body = devopsTesting();
  if (state.devopsTab === "deployment") body = devopsDeployment();
  return `${pageHeader("DevOps intelligence", "Engineering decisions", "Review architecture, quality, security, dependencies, testing, risk, and deployment plans with evidence.", `<button class="button primary" data-action="devops-mock" data-devops-domain="${state.devopsTab}">Run mock ${state.devopsTab}</button>`)}
    <div class="alert">Mock DevOps Intelligence. Findings and plans are evidence fixtures; no code, CI/CD, infrastructure, or deployment action is executed.</div>
    <div class="input-tabs page-tabs">${tabs.map(([key,label])=>`<button class="input-tab ${state.devopsTab===key?"active":""}" data-action="devops-tab" data-tab="${key}">${label}</button>`).join("")}</div>${body}`;
}

function contextTabs(active) {
  const tabs = [["overview","Context explorer"],["memory","Memory"],["history","Retrieval history"]];
  return `<div class="input-tabs page-tabs">${tabs.map(([key,label])=>`<button class="input-tab ${active===key?"active":""}" data-route="/app/context/${key}">${label}</button>`).join("")}</div>`;
}

function contextOverviewPage() {
  return `${pageHeader("Shared context", "Context explorer", "Inspect project-scoped context with sensitivity, trust, source, and processing state.", `<button class="button primary" data-action="context-mock" data-context-action="reindex">Run mock reindex</button>`)}
    <div class="alert">Mock context projection. ChromaDB, object storage, and source systems remain backend-only and are not contacted.</div>
    ${contextTabs("overview")}
    <div class="table-wrap"><table><thead><tr><th>Context item</th><th>Type / source</th><th>Scope</th><th>Sensitivity</th><th>Trust</th><th>Status</th></tr></thead><tbody>${state.contextItems.map((item)=>`<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="small">${escapeHtml(item.id)}</span></td><td>${escapeHtml(item.type)}<br><span class="small">${escapeHtml(item.source)}</span></td><td>${status(item.scope)}</td><td>${status(item.sensitivity)}</td><td>${status(item.trustLevel)}</td><td>${status(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}

function memoryPage() {
  const results = state.memoryResults;
  return `${pageHeader("Shared context", "Memory", "Search safe project memory projections with explicit relevance, source, sensitivity, and trust.")}
    <div class="alert">Mock semantic retrieval. No embedding vector, Chroma collection, or raw storage identifier is exposed.</div>
    ${contextTabs("memory")}
    <form id="memory-search-form" class="search-panel"><label for="memory-query">Search project memory</label><div class="search-row"><input id="memory-query" name="query" value="${escapeHtml(state.contextQuery)}" placeholder="Try: API boundaries"><button class="button primary" type="submit">Search mock memory</button></div></form>
    <div class="memory-grid">${results.map((item)=>`<article class="card memory-card"><div class="card-body"><div class="cluster">${status(item.trustLevel)}${status(item.sensitivity)}<span class="score">${Math.round(item.relevance*100)}% relevance</span></div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.excerpt)}</p><small>Source: ${escapeHtml(item.sourceContextId)}</small></div></article>`).join("") || `<section class="card empty compact-empty"><div><h2>No matching memory</h2><p>Try a broader project-scoped query.</p></div></section>`}</div>`;
}

function retrievalHistoryPage() {
  return `${pageHeader("Shared context", "Retrieval history", "Review ranked retrieval evidence without exposing embeddings or internal store identifiers.")}
    <div class="alert">History is a safe API projection. Scores support review and are not represented as certainty.</div>
    ${contextTabs("history")}
    <div class="history-list">${state.retrievalHistory.map((record)=>`<article class="card retrieval-card"><div class="card-head"><div><h2>${escapeHtml(record.query)}</h2><span class="small">${new Date(record.createdAt).toLocaleString()}</span></div>${status(record.status)}</div><div class="card-body">${record.items.map((item)=>`<div class="retrieval-row"><span class="rank">${item.rank}</span><div><strong>${escapeHtml(item.memoryId)}</strong><p>${escapeHtml(item.reason)}</p></div><span class="score">${Math.round(item.score*100)}%</span></div>`).join("")}</div></article>`).join("")}</div>`;
}

function knowledgeGraphPage() {
  const graph = state.knowledgeGraph;
  const nodeById = new Map((graph?.nodes || []).map((node)=>[node.id,node]));
  return `${pageHeader("Knowledge", "Knowledge graph", "Inspect project relationships as a safe domain projection with an accessible textual representation.", `<button class="button primary" data-action="context-mock" data-context-action="graph_sync">Run mock graph sync</button>`)}
    <div class="alert">${escapeHtml(graph?.storageBoundary || "Knowledge graph unavailable.")} No Neo4j credentials, queries, or internal IDs are exposed.</div>
    <section class="graph-layout"><article class="card"><div class="card-head"><div><h2>Relationship map</h2><span class="small">${graph?.nodes?.length || 0} nodes · ${graph?.edges?.length || 0} relationships</span></div>${status(graph?.status || "warning")}</div><div class="card-body graph-canvas" aria-hidden="true">${(graph?.nodes||[]).map((node,index)=>`<div class="graph-node node-${index+1}"><span>${escapeHtml(node.type)}</span><strong>${escapeHtml(node.label)}</strong></div>`).join("")}</div></article>
    <article class="card"><div class="card-head"><h2>Accessible relationships</h2></div><div class="card-body relationship-list">${(graph?.edges||[]).map((edge)=>`<div><strong>${escapeHtml(nodeById.get(edge.sourceId)?.label || edge.sourceId)}</strong><span>${escapeHtml(edge.type.replaceAll("_"," "))}</span><strong>${escapeHtml(nodeById.get(edge.targetId)?.label || edge.targetId)}</strong></div>`).join("")}</div></article></section>`;
}

function confidence(value = 0) {
  const percent = Math.round(value * 100);
  const label = value >= .85 ? "High" : value >= .65 ? "Moderate" : "Low";
  return `<div class="confidence" aria-label="${label} confidence, ${percent} percent"><div><span style="width:${percent}%"></span></div><b>${percent}%</b><small>${label}</small></div>`;
}

function reportsPage() {
  return `${pageHeader("Decision outputs", "Decision reports", "Review project-scoped reports, evidence, confidence, decisions, and approval state.", `<button class="button primary" data-action="generate-report">Generate mock receipt</button>`)}
    <div class="alert">Provisional global route using the selected project. Generation creates a queued mock receipt only; no AI workflow or report generation runs.</div>
    <div class="report-grid">${state.reports.map((report)=>`<article class="card report-card"><div class="card-head"><div><span class="small">${escapeHtml(report.type.replaceAll("_"," "))} · v${report.version}</span><h2>${escapeHtml(report.title)}</h2></div>${status(report.status)}</div><div class="card-body"><p>${escapeHtml(report.summary)}</p>${confidence(report.confidence)}<div class="report-meta"><span>Approval</span>${status(report.approvalStatus)}</div><button class="button" data-route="/app/reports/${report.id}">Review report</button></div></article>`).join("") || `<section class="card empty"><div><h2>No reports</h2><p>No report artifacts exist for this project.</p></div></section>`}</div>`;
}

function reportDetailPage(reportId) {
  const report = state.reportDetail?.id === reportId ? state.reportDetail : state.reports.find((item)=>item.id===reportId);
  if (!report) return notFound("Report not found", "This report is outside the selected project or does not exist.");
  return `${pageHeader("Decision report", report.title, `${report.type.replaceAll("_"," ")} · Version ${report.version}`, `<div class="cluster"><button class="button" data-action="export-report" data-report-id="${report.id}">Mock export</button><button class="button primary" data-action="publish-report" data-report-id="${report.id}">Publish receipt</button></div>`)}
    <div class="alert">Report content is a deterministic fixture. Export and publication return receipts only; no binary is generated and nothing is published.</div>
    <section class="report-hero card"><div class="card-body"><div class="report-summary"><div><span class="small">Summary</span><p>${escapeHtml(report.summary)}</p></div>${confidence(report.confidence)}</div><div class="cluster">${status(report.status)}${status(report.approvalStatus)}<span class="proposal">v${report.version}</span></div></div></section>
    <div class="report-detail-grid"><div class="report-sections">${[...report.sections].sort((a,b)=>a.sequence-b.sequence).map((section)=>`<article class="card"><div class="card-head"><span class="section-index">${section.sequence}</span><h2>${escapeHtml(section.title)}</h2></div><div class="card-body"><p>${escapeHtml(section.content)}</p></div></article>`).join("")}</div>
    <aside class="report-aside"><article class="card"><div class="card-head"><h2>Evidence & references</h2></div><div class="card-body reference-list">${report.references.map((ref)=>`<div><strong>${escapeHtml(ref.label)}</strong><span>${escapeHtml(ref.sourceType)} · ${escapeHtml(ref.sourceId)}</span>${status(ref.trustLevel)}</div>`).join("")}</div></article></aside></div>
    <h2 class="section-title">Decisions</h2><div class="decision-grid">${report.decisions.map((decision)=>`<article class="card decision-card"><div class="card-body"><div class="cluster">${status(decision.impact)}${status(decision.status)}<span class="proposal">${escapeHtml(decision.provenance.replaceAll("_"," "))}</span></div><h2>${escapeHtml(decision.title)}</h2><p>${escapeHtml(decision.rationale)}</p>${confidence(decision.confidence)}<div class="alert">Executed: No</div></div></article>`).join("")}</div>`;
}

function approvalsPage() {
  const selected = state.approvalDetail || state.approvals.find((item)=>item.id===state.approvalId) || state.approvals[0];
  return `${pageHeader("Human approval", "Approval queue", "Review high-impact requests and record explicit human decisions without implying downstream execution.")}
    <div class="alert">Provisional global route using the selected project. Approval changes authorization state only; it never proves that code, CI/CD, infrastructure, publication, or deployment executed.</div>
    <div class="approval-layout"><section class="card"><div class="card-head"><div><h2>Requests</h2><span class="small">${state.approvals.filter((item)=>item.status==="pending").length} pending</span></div></div><div class="approval-list">${state.approvals.map((item)=>`<button class="approval-row ${selected?.id===item.id?"active":""}" data-action="select-approval" data-approval-id="${item.id}"><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.type.replaceAll("_"," "))} · ${escapeHtml(item.risk)} risk</span></div>${status(item.status)}</button>`).join("")}</div></section>
    ${selected ? `<section class="card approval-detail"><div class="card-head"><div><span class="small">${escapeHtml(selected.type.replaceAll("_"," "))}</span><h2>${escapeHtml(selected.title)}</h2></div>${status(selected.status)}</div><div class="card-body"><p>${escapeHtml(selected.rationale)}</p><dl class="detail-list"><div><dt>Requested by</dt><dd>${escapeHtml(selected.requestedBy)}</dd></div><div><dt>Requested</dt><dd>${new Date(selected.requestedAt).toLocaleString()}</dd></div><div><dt>Risk</dt><dd>${escapeHtml(selected.risk)}</dd></div><div><dt>Executed</dt><dd>No</dd></div></dl>
      ${selected.status==="pending" ? `<form id="approval-decision-form"><input type="hidden" name="approvalId" value="${selected.id}"><div class="field"><label for="approval-rationale">Decision rationale</label><textarea id="approval-rationale" name="rationale" placeholder="Record why this decision is appropriate"></textarea></div><div class="cluster"><button class="button success" name="decision" value="approve">Approve</button><button class="button danger" name="decision" value="reject">Reject</button><button type="button" class="button ghost" data-action="cancel-approval" data-approval-id="${selected.id}">Cancel request</button></div></form>` : `<div class="alert">Decision recorded. Downstream executed: No.</div>`}
      <h3>Comments</h3><div class="comment-list">${selected.comments.map((comment)=>`<div><strong>${escapeHtml(comment.author)}</strong><p>${escapeHtml(comment.text)}</p><span>${new Date(comment.createdAt).toLocaleString()}</span></div>`).join("") || `<p class="subtle">No comments.</p>`}</div>
      <form id="approval-comment-form"><input type="hidden" name="approvalId" value="${selected.id}"><div class="search-row"><input name="text" placeholder="Add review context" required><button class="button" type="submit">Add mock comment</button></div></form></div></section>` : ""}</div>`;
}

function assetTable(assets, projectId) {
  if (!assets.length) return `<section class="card empty"><div><div class="empty-icon">＋</div><h2>No inputs yet</h2><p>Add a file, text block, URL, or connected repository.</p></div></section>`;
  return `<div class="table-wrap"><table><thead><tr><th>Input</th><th>Type/source</th><th>Size</th><th>Processing / security</th><th>Extraction</th><th></th></tr></thead><tbody>
    ${assets.map((asset) => `<tr>
      <td><strong>${escapeHtml(asset.name)}</strong><br><span class="small">${new Date(asset.createdAt).toLocaleString()}</span></td>
      <td>${escapeHtml(asset.inputType)}<br><span class="small">${escapeHtml(asset.sourceType)}</span></td><td>${formatBytes(asset.byteSize)}</td>
      <td>${assetState(asset)}</td><td>${status(asset.extractionStatus)}</td>
      <td><div class="cluster">${["received","scanning","extracting","indexing"].includes(asset.processingStatus) ? `<button class="button" data-action="advance-asset" data-asset-id="${asset.id}" title="User-triggered mock transition">Advance demo</button>` : ""}<button class="button ghost" data-action="delete-asset" data-asset-id="${asset.id}">Remove</button></div></td>
    </tr>`).join("")}</tbody></table></div>`;
}

function notFound(title, copy) {
  return `<section class="card empty"><div><div class="empty-icon">?</div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(copy)}</p><button class="button primary" data-route="${routes.dashboard}">Return to dashboard</button></div></section>`;
}

function authPage(kind) {
  const config = {
    login: { title: "Welcome back", copy: "Sign in to access your projects and decision workspace.", button: "Sign In to Workspace →" },
    register: { title: "Create your account", copy: "Set up access to SYNASE AI.", button: "Create account" },
    forgot: { title: "Recover access", copy: "We’ll send recovery instructions if the account exists.", button: "Send instructions" }
  }[kind];
  return `<div class="auth-layout">
    <section class="auth-art">
      <div style="display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; margin-bottom:24px;">
        <a class="brand" href="landing.html">
          <span class="brand-mark">${brandMarkSvg()}</span>
          <span class="brand-copy"><strong>SYNASE AI</strong><span>Decision intelligence</span></span>
        </a>
        <a href="landing.html" style="font-size:12px; font-weight:600; color:var(--muted); display:flex; align-items:center; gap:6px;">← Back to Home</a>
      </div>
      <div class="auth-message">
        <div class="eyebrow" style="color:var(--cyan); letter-spacing:0.12em;">ENGINEERING DECISION PLATFORM</div>
        <h1 style="margin: 14px 0 16px;">Clear engineering decisions from idea to <span style="background:linear-gradient(135deg, var(--cyan), var(--primary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">production.</span></h1>
        <p>Connect your repositories, project specs, and team priorities. SYNASE AI audits system architecture, spots deployment risks, and provides verified decisions before you ship.</p>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-top: 28px;" class="auth-how-grid">
          <div style="padding:14px; border:1px solid var(--border); border-radius:12px; background:rgba(10,18,36,0.65); backdrop-filter:blur(8px);">
            <div style="font-size:10px; font-family:monospace; color:var(--muted); font-weight:700; margin-bottom:4px;">01 CONNECT</div>
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">Code &amp; Specs</div>
            <div style="font-size:11px; color:var(--muted); line-height:1.4;">Securely inspects code repositories, PRDs, and task lists.</div>
            <div style="font-size:10px; font-family:monospace; color:var(--cyan); margin-top:8px; font-weight:600;">● Code Sync: Ready</div>
          </div>
          <div style="padding:14px; border:1px solid var(--border); border-radius:12px; background:rgba(10,18,36,0.65); backdrop-filter:blur(8px);">
            <div style="font-size:10px; font-family:monospace; color:var(--muted); font-weight:700; margin-bottom:4px;">02 ANALYZE</div>
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">Smart Review</div>
            <div style="font-size:11px; color:var(--muted); line-height:1.4;">Evaluates code architecture, dependencies, and coverage.</div>
            <div style="font-size:10px; font-family:monospace; color:var(--primary); margin-top:8px; font-weight:600;">● Analysis: Active</div>
          </div>
          <div style="padding:14px; border:1px solid var(--border); border-radius:12px; background:rgba(10,18,36,0.65); backdrop-filter:blur(8px);">
            <div style="font-size:10px; font-family:monospace; color:var(--muted); font-weight:700; margin-bottom:4px;">03 DELIVER</div>
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">Verified Action</div>
            <div style="font-size:11px; color:var(--muted); line-height:1.4;">Recommendations, risk alerts, and ready-to-use rollout plans.</div>
            <div style="font-size:10px; font-family:monospace; color:var(--positive); margin-top:8px; font-weight:600;">● Security: Verified</div>
          </div>
        </div>
      </div>
      <div style="font-size:11px; color:var(--subtle); display:flex; gap:16px; position:relative; z-index:2; margin-top:24px;">
        <span>SOC 2 Type II Certified</span><span>•</span><span>Enterprise Security</span><span>•</span><span>Private &amp; Encrypted</span>
      </div>
    </section>
    <main class="auth-panel"><section class="auth-card">
      <div class="eyebrow" style="color:var(--cyan);">Secure workspace access</div><h2>${config.title}</h2><p class="page-copy">${config.copy}</p>
      <form id="auth-form" data-kind="${kind}">
        ${kind === "register" ? `<div class="field"><label for="auth-name">Full name</label><input id="auth-name" name="name" autocomplete="name" required placeholder="Alex Turner"></div>` : ""}
        <div class="field"><label for="auth-email">Work Email</label><input id="auth-email" name="email" type="email" autocomplete="email" value="${kind === "login" ? "alex.turner@company.com" : ""}" placeholder="name@company.com" required></div>
        ${kind !== "forgot" ? `<div class="field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" value="${kind === "login" ? "••••••••••••" : ""}" autocomplete="${kind === "login" ? "current-password" : "new-password"}" minlength="8" required></div>` : ""}
        <div id="auth-message"></div>
        <button class="button primary" type="submit" style="width:100%; margin-top:16px; padding:12px; font-weight:700; font-family:'Outfit',sans-serif;">${config.button}</button>
      </form>
      ${kind === "login" ? `
        <div style="margin: 16px 0; text-align: center; position: relative;">
          <div style="position: absolute; inset: 50% 0 0; border-top: 1px solid var(--border);"></div>
          <span style="position: relative; background: rgba(5,10,20,0.85); padding: 0 10px; font-size: 10px; font-family: monospace; color: var(--subtle); text-transform: uppercase;">or direct entry</span>
        </div>
        <button type="button" class="button" data-action="demo-login" style="width:100%; justify-content:center; background:rgba(79,140,255,0.08); border-color:rgba(79,140,255,0.3); color:var(--text); font-weight:600;">Direct Demo Workspace Entry →</button>
      ` : ""}
      <div class="auth-links">
        ${kind !== "login" ? `<a href="?route=/auth/login">Sign in</a>` : `<a href="?route=/auth/register">Create account</a>`}
        ${kind !== "forgot" ? `<a href="?route=/auth/forgot-password">Forgot password?</a>` : ""}
      </div>
      <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border); font-size:11px; text-align:center; color:var(--muted);">
        Need an enterprise account? <a href="landing.html#contact" style="color:var(--primary); font-weight:600;">Contact Us</a>
      </div>
    </section></main>
  </div>`;
}

function renderPage() {
  const path = currentPath();
  if (path.startsWith("/auth/")) {
    if (path.includes("register")) return authPage("register");
    if (path.includes("forgot")) return authPage("forgot");
    return authPage("login");
  }
  if (state.loading) return shell(loading());
  if (path === routes.dashboard) return shell(dashboardPage());
  if (path === routes.projects) return shell(projectsPage());
  if (path === routes.createProject) return shell(createProjectPage());
  if (path.includes("/workspaces/") && path.endsWith("/members")) return shell(membersPage());
  if (path.includes("/workspaces/") && path.endsWith("/settings")) return shell(workspaceSettingsPage());
  const repository = path.match(/^\/app\/projects\/([^/]+)\/repository$/);
  if (repository) return shell(repositoryPage(repository[1]));
  const inputs = path.match(/^\/app\/projects\/([^/]+)\/inputs$/);
  if (inputs) return shell(inputsPage(inputs[1]));
  const analysis = path.match(/^\/app\/projects\/([^/]+)\/analysis$/);
  if (analysis) return shell(analysisPage(analysis[1]));
  const runs = path.match(/^\/app\/projects\/([^/]+)\/runs$/);
  if (runs) return shell(runsPage(runs[1]));
  const mcp = path.match(/^\/app\/mcp(?:\/(overview|executions|tools|models|discovery))?$/);
  if (mcp) return shell(mcpPage(mcp[1] || "overview"));
  if (path === "/app/intelligence/product") return shell(productIntelligencePage());
  if (path === "/app/intelligence/devops") return shell(devopsIntelligencePage());
  if (path === "/app/context/overview") return shell(contextOverviewPage());
  if (path === "/app/context/memory") return shell(memoryPage());
  if (path === "/app/context/history") return shell(retrievalHistoryPage());
  if (path === "/app/knowledge/graph") return shell(knowledgeGraphPage());
  if (path === "/app/reports") return shell(reportsPage());
  const report = path.match(/^\/app\/reports\/([^/]+)$/);
  if (report) return shell(reportDetailPage(report[1]));
  if (path === "/app/approvals") return shell(approvalsPage());
  const overview = path.match(/^\/app\/projects\/([^/]+)\/overview$/);
  if (overview) return shell(projectOverviewPage(overview[1]));
  const settings = path.match(/^\/app\/projects\/([^/]+)\/settings$/);
  if (settings) return shell(projectSettingsPage(settings[1]));
  return shell(notFound("Page not found", "This route is not part of the completed Phase 0–2 build."));
}

function render() {
  app.innerHTML = renderPage();
  queueMicrotask(() => {
    const activeTab = document.querySelector(".page-tabs .input-tab.active");
    const strip = activeTab?.parentElement;
    if (activeTab && strip && strip.scrollWidth > strip.clientWidth) {
      strip.scrollLeft = activeTab.offsetLeft - (strip.clientWidth - activeTab.clientWidth) / 2;
    }
  });
}

async function hydrate(workspaceId = state.workspaceId) {
  state.loading = true;
  render();
  try {
    const [me, workspaces, projects, dashboard, members, mcpOverview, mcpRequests, mcpModels, mcpTools, mcpServers, mcpDirectories] = await Promise.all([
      api.getMe(), api.listWorkspaces(), api.listProjects(workspaceId), api.getDashboard(workspaceId), api.listWorkspaceMembers(),
      api.getMcpOverview(), api.listMcpRequests(), api.listMcpModels(), api.listMcpTools(), api.listMcpServers(), api.listMcpDirectories()
    ]);
    state.user = me.data;
    state.workspaces = workspaces.data;
    state.workspaceId = workspaceId;
    state.projects = projects.data;
    state.dashboard = dashboard.data;
    state.members = members.data;
    state.mcpOverview = mcpOverview.data;
    state.mcpRequests = mcpRequests.data;
    state.mcpModels = mcpModels.data;
    state.mcpTools = mcpTools.data;
    state.mcpServers = mcpServers.data;
    state.mcpDirectories = mcpDirectories.data;
    state.mcpRequestId = state.mcpRequests[0]?.id || "";
    state.mcpTrace = state.mcpRequestId ? (await api.getMcpTrace(state.mcpRequestId)).data : [];
    if (!state.projects.some((p) => p.id === state.projectId)) state.projectId = state.projects[0]?.id || "";
    if (state.projectId) {
      const [repositories, assets, conversations, requests, workflows] = await Promise.all([api.listRepositories(state.projectId), api.listAssets(state.projectId), api.listConversations(state.projectId), api.listAnalysisRequests(state.projectId), api.listWorkflows(state.projectId)]);
      state.repositories = repositories.data;
      state.assets = assets.data;
      state.conversations = conversations.data;
      state.analysisRequests = requests.data;
      state.workflows = workflows.data;
      state.workflowId = workflows.data[0]?.id || "";
      if (state.workflowId) {
        const [tasks, events] = await Promise.all([api.listWorkflowTasks(state.projectId, state.workflowId), api.listWorkflowEvents(state.projectId, state.workflowId)]);
        state.workflowTasks = tasks.data;
        state.workflowEvents = normalizeWorkflowEvents(events.data);
      }
      const [requirements, features, strategy, roadmap] = await Promise.all([api.listRequirements(state.projectId), api.listProductFeatures(state.projectId), api.getProductStrategy(state.projectId), api.listRoadmapItems(state.projectId)]);
      state.requirements = requirements.data;
      state.productFeatures = features.data;
      state.productStrategy = strategy.data;
      state.roadmapItems = roadmap.data;
      const [devopsSummary, findings, recommendations, dependencies, tests, deployments] = await Promise.all([api.getDevOpsSummary(state.projectId), api.listFindings(state.projectId), api.listDevOpsRecommendations(state.projectId), api.listDependencies(state.projectId), api.listTestSuggestions(state.projectId), api.listDeploymentPlans(state.projectId)]);
      state.devopsSummary = devopsSummary.data;
      state.findings = findings.data;
      state.devopsRecommendations = recommendations.data;
      state.dependencies = dependencies.data;
      state.testSuggestions = tests.data;
      state.deploymentPlans = deployments.data;
      const [contextItems, memory, history, graph] = await Promise.all([api.listContextItems(state.projectId), api.searchMemory(state.projectId), api.listRetrievalHistory(state.projectId), api.getKnowledgeGraph(state.projectId)]);
      state.contextItems = contextItems.data;
      state.memoryResults = memory.data;
      state.retrievalHistory = history.data;
      state.knowledgeGraph = graph.data;
      const [reports, approvals] = await Promise.all([api.listReports(state.projectId), api.listApprovals(state.projectId)]);
      state.reports = reports.data;
      state.reportId = reports.data[0]?.id || "";
      state.reportDetail = state.reportId ? (await api.getReport(state.projectId, state.reportId)).data : null;
      state.approvals = approvals.data;
      state.approvalId = approvals.data[0]?.id || "";
      state.approvalDetail = state.approvalId ? (await api.getApproval(state.projectId, state.approvalId)).data : null;
      state.conversationId = state.conversations[0]?.id || "";
      state.messages = state.conversationId ? (await api.listMessages(state.projectId, state.conversationId)).data : [];
    } else {
      state.repositories = [];
      state.assets = [];
      state.conversations = [];
      state.analysisRequests = [];
      state.messages = [];
      state.workflows = [];
      state.workflowTasks = [];
      state.workflowEvents = [];
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : "Unable to load the workspace.";
  } finally {
    state.loading = false;
    render();
  }
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest("[data-route],[data-action]") : null;
  if (!target) return;
  const route = target.getAttribute("data-route");
  if (route) {
    event.preventDefault();
    navigate(route);
    return;
  }
  const action = target.getAttribute("data-action");
  if (action === "demo-login") {
    location.href = `${location.pathname}#${routes.dashboard}`;
    hydrate();
    return;
  }
  if (action === "toggle-menu") { state.sidebarOpen = !state.sidebarOpen; render(); }
  if (action === "search") toast("Global search contract is not defined yet.");
  if (action === "notifications") toast("Notifications are not available in Phase 2.");
  if (action === "profile") toast(`${state.user?.displayName || "User"} · ${state.user?.globalRole || "member"}`);
  if (action === "invite") toast("Invitation requires the unresolved backend invitation contract.");
  if (action === "toggle-repo-form") document.querySelector("#repo-form-panel")?.classList.toggle("hidden-panel");
  if (action === "close-repo-detail") { state.repositoryDetailId = ""; state.repositorySnapshots = []; state.repositoryTree = []; render(); }
  if (action === "input-tab") { state.inputTab = target.getAttribute("data-tab") || "file"; render(); }
  if (action === "analysis-tab") { state.analysisTab = target.getAttribute("data-tab") || "conversation"; render(); }
  if (action === "toggle-conversation-form") document.querySelector("#new-conversation-form")?.classList.toggle("hidden-panel");
  if (action === "select-conversation") {
    const conversationId = target.getAttribute("data-conversation-id");
    api.listMessages(state.projectId, conversationId).then((messages) => {
      state.conversationId = conversationId;
      state.messages = messages.data;
      render();
    });
  }
  if (action === "cancel-request") {
    api.cancelAnalysisRequest(state.projectId, target.getAttribute("data-request-id")).then(async () => {
      state.analysisRequests = (await api.listAnalysisRequests(state.projectId)).data;
      toast("Analysis request cancelled by the mock adapter.");
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Cancellation failed."));
  }
  if (action === "select-workflow") {
    const workflowId = target.getAttribute("data-workflow-id");
    Promise.all([api.listWorkflowTasks(state.projectId, workflowId), api.listWorkflowEvents(state.projectId, workflowId)]).then(([tasks, events]) => {
      state.workflowId = workflowId;
      state.workflowTasks = tasks.data;
      state.workflowEvents = normalizeWorkflowEvents(events.data);
      state.streamState = "idle";
      render();
    });
  }
  if (action === "toggle-stream") {
    state.streamState = state.streamState === "open" ? "closed" : state.streamState === "closed" ? "reconnecting" : "open";
    if (state.streamState === "reconnecting") {
      Promise.all([api.getWorkflow(state.projectId, state.workflowId), api.listWorkflowEvents(state.projectId, state.workflowId)]).then(([workflow, events]) => {
        state.workflows = state.workflows.map((item) => item.id === workflow.data.id ? workflow.data : item);
        state.workflowEvents = normalizeWorkflowEvents(events.data);
        state.streamState = "open";
        toast("Mock reconnect refetched the authoritative snapshot.");
        render();
      });
    } else render();
  }
  if (action === "next-mock-event") {
    state.streamState = "open";
    api.nextMockWorkflowEvent(state.projectId, state.workflowId).then(async (result) => {
      if (!result.data.event) { toast("No further mock events."); return; }
      state.workflowEvents = normalizeWorkflowEvents([...state.workflowEvents, result.data.event]);
      state.workflows = state.workflows.map((item) => item.id === result.data.workflow.id ? result.data.workflow : item);
      if (result.data.terminal) {
        const snapshot = await api.getWorkflow(state.projectId, state.workflowId);
        state.workflows = state.workflows.map((item) => item.id === snapshot.data.id ? snapshot.data : item);
        state.streamState = "closed";
        toast("Terminal mock event received; authoritative snapshot refetched.");
      }
      render();
    });
  }
  if (action === "workflow-control") {
    api.controlWorkflow(state.projectId, state.workflowId, target.getAttribute("data-control")).then((result) => {
      state.workflows = state.workflows.map((item) => item.id === result.data.id ? result.data : item);
      toast(`Workflow ${result.data.status} in the mock adapter.`);
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Workflow control failed."));
  }
  if (action === "select-mcp-request") {
    const requestId = target.getAttribute("data-request-id");
    api.getMcpTrace(requestId).then((trace) => {
      state.mcpRequestId = requestId;
      state.mcpTrace = trace.data;
      render();
    });
  }
  if (action === "server-health") {
    api.checkMcpServerHealth(target.getAttribute("data-server-id")).then(async (result) => {
      state.mcpServers = (await api.listMcpServers()).data;
      toast(`Mock health check: ${result.data.healthStatus}. No server was contacted.`);
      render();
    });
  }
  if (action === "discover-directory") {
    api.discoverMcpDirectory(target.getAttribute("data-directory-id"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock discovery completed with ${result.data.resultsCount} fixture results.`);
    });
  }
  if (action === "product-tab") { state.productTab = target.getAttribute("data-tab") || "requirements"; render(); }
  if (action === "product-mock") {
    api.runProductMock(state.projectId, target.getAttribute("data-product-action"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock ${result.data.action} completed with no confirmed-state changes.`);
    });
  }
  if (action === "devops-tab") { state.devopsTab = target.getAttribute("data-tab") || "overview"; render(); }
  if (action === "devops-mock") {
    api.runDevOpsMock(state.projectId, target.getAttribute("data-devops-domain"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock ${result.data.domain} analysis completed. Executed actions: 0.`);
    });
  }
  if (action === "context-mock") {
    api.runContextMock(state.projectId, target.getAttribute("data-context-action"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock ${result.data.action.replaceAll("_"," ")} completed. No backend store was contacted.`);
    });
  }
  if (action === "generate-report") {
    api.generateReport(state.projectId, "final_decision_summary", { idempotencyKey: createIdempotencyKey() }).then((result)=>toast(`Queued mock receipt ${result.data.workflowId}. No report was generated.`));
  }
  if (action === "export-report") {
    api.exportReport(state.projectId, target.getAttribute("data-report-id"), "pdf", { idempotencyKey: createIdempotencyKey() }).then(()=>toast("Mock export receipt created. No binary or download URL exists."));
  }
  if (action === "publish-report") {
    api.publishReport(state.projectId, target.getAttribute("data-report-id"), { idempotencyKey: createIdempotencyKey() }).then(()=>toast("Mock publication receipt created. Nothing was published.")).catch((error)=>toast(error instanceof Error ? error.message : "Publication failed."));
  }
  if (action === "select-approval") {
    const approvalId = target.getAttribute("data-approval-id");
    api.getApproval(state.projectId, approvalId).then((result)=>{ state.approvalId = approvalId; state.approvalDetail = result.data; render(); });
  }
  if (action === "cancel-approval") {
    api.cancelApproval(state.projectId, target.getAttribute("data-approval-id"), { idempotencyKey: createIdempotencyKey() }).then(async (result)=>{
      state.approvals = (await api.listApprovals(state.projectId)).data; state.approvalDetail = result.data; toast("Approval request cancelled. No downstream action executed."); render();
    }).catch((error)=>toast(error instanceof Error ? error.message : "Cancellation failed."));
  }
  if (action === "repo-detail") {
    const repositoryId = target.getAttribute("data-repository-id");
    Promise.all([api.listRepositorySnapshots(repositoryId), api.getRepositoryTree(repositoryId)]).then(([snapshots, tree]) => {
      state.repositoryDetailId = repositoryId;
      state.repositorySnapshots = snapshots.data;
      state.repositoryTree = tree.data;
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Repository detail failed."));
  }
  if (action === "repo-sync") {
    const repositoryId = target.getAttribute("data-repository-id");
    api.syncRepository(state.projectId, repositoryId).then(async () => {
      state.repositories = (await api.listRepositories(state.projectId)).data;
      toast("Mock repository sync completed. No provider was contacted.");
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Sync failed."));
  }
  if (action === "advance-asset") {
    api.advanceAssetDemo(state.projectId, target.getAttribute("data-asset-id")).then(async () => {
      state.assets = (await api.listAssets(state.projectId)).data;
      toast("Advanced one explicit mock processing state.");
      render();
    });
  }
  if (action === "delete-asset") {
    api.deleteAsset(state.projectId, target.getAttribute("data-asset-id")).then(async () => {
      state.assets = (await api.listAssets(state.projectId)).data;
      toast("Input removed from the mock inventory.");
      render();
    });
  }
});

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target.id === "workspace-switcher") await hydrate(target.value);
  if (target.id === "project-switcher") {
    state.projectId = target.value;
    Promise.all([api.listRepositories(target.value), api.listAssets(target.value), api.listConversations(target.value), api.listAnalysisRequests(target.value), api.listWorkflows(target.value)]).then(async ([repositories, assets, conversations, requests, workflows]) => {
      state.repositories = repositories.data;
      state.assets = assets.data;
      state.conversations = conversations.data;
      state.analysisRequests = requests.data;
      state.workflows = workflows.data;
      state.workflowId = workflows.data[0]?.id || "";
      if (state.workflowId) {
        const [tasks, events] = await Promise.all([api.listWorkflowTasks(target.value, state.workflowId), api.listWorkflowEvents(target.value, state.workflowId)]);
        state.workflowTasks = tasks.data;
        state.workflowEvents = normalizeWorkflowEvents(events.data);
      } else {
        state.workflowTasks = [];
        state.workflowEvents = [];
      }
      const [requirements, features, strategy, roadmap] = await Promise.all([api.listRequirements(target.value), api.listProductFeatures(target.value), api.getProductStrategy(target.value), api.listRoadmapItems(target.value)]);
      state.requirements = requirements.data;
      state.productFeatures = features.data;
      state.productStrategy = strategy.data;
      state.roadmapItems = roadmap.data;
      const [devopsSummary, findings, recommendations, dependencies, tests, deployments] = await Promise.all([api.getDevOpsSummary(target.value), api.listFindings(target.value), api.listDevOpsRecommendations(target.value), api.listDependencies(target.value), api.listTestSuggestions(target.value), api.listDeploymentPlans(target.value)]);
      state.devopsSummary = devopsSummary.data;
      state.findings = findings.data;
      state.devopsRecommendations = recommendations.data;
      state.dependencies = dependencies.data;
      state.testSuggestions = tests.data;
      state.deploymentPlans = deployments.data;
      const [contextItems, memory, history, graph] = await Promise.all([api.listContextItems(target.value), api.searchMemory(target.value), api.listRetrievalHistory(target.value), api.getKnowledgeGraph(target.value)]);
      state.contextItems = contextItems.data;
      state.memoryResults = memory.data;
      state.retrievalHistory = history.data;
      state.knowledgeGraph = graph.data;
      const [reports, approvals] = await Promise.all([api.listReports(target.value), api.listApprovals(target.value)]);
      state.reports = reports.data;
      state.reportId = reports.data[0]?.id || "";
      state.reportDetail = state.reportId ? (await api.getReport(target.value, state.reportId)).data : null;
      state.approvals = approvals.data;
      state.approvalId = approvals.data[0]?.id || "";
      state.approvalDetail = state.approvalId ? (await api.getApproval(target.value, state.approvalId)).data : null;
      state.conversationId = conversations.data[0]?.id || "";
      state.messages = state.conversationId ? (await api.listMessages(target.value, state.conversationId)).data : [];
      navigate(`/app/projects/${target.value}/overview`);
    });
  }
  if (target.id === "project-search" || target.id === "project-status") filterProjects();
  if (target.id === "asset-status-filter") {
    const filtered = state.assets.filter((asset) => !target.value || asset.processingStatus === target.value);
    const results = document.querySelector("#asset-results");
    if (results) results.innerHTML = assetTable(filtered, state.projectId);
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.id === "project-search") filterProjects();
});

function filterProjects() {
  const search = /** @type {HTMLInputElement|null} */ (document.querySelector("#project-search"))?.value.toLowerCase() || "";
  const lifecycle = /** @type {HTMLSelectElement|null} */ (document.querySelector("#project-status"))?.value || "";
  const filtered = state.projects.filter((project) =>
    (!search || `${project.name} ${project.description}`.toLowerCase().includes(search)) &&
    (!lifecycle || project.lifecycleStatus === lifecycle)
  );
  const results = document.querySelector("#project-results");
  if (results) results.innerHTML = projectRows(filtered);
}

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  if (form.id === "approval-decision-form") {
    const values = new FormData(form);
    const decision = event.submitter instanceof HTMLButtonElement ? event.submitter.value : "";
    try {
      const result = await api.decideApproval(state.projectId, String(values.get("approvalId")), decision, String(values.get("rationale") || ""), { idempotencyKey: createIdempotencyKey() });
      state.approvals = (await api.listApprovals(state.projectId)).data;
      state.reports = (await api.listReports(state.projectId)).data;
      state.approvalDetail = result.data;
      toast(`${result.data.status} recorded. Downstream executed: No.`);
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Approval decision failed."); }
    return;
  }
  if (form.id === "approval-comment-form") {
    const values = new FormData(form);
    try {
      await api.addApprovalComment(state.projectId, String(values.get("approvalId")), String(values.get("text") || ""), { idempotencyKey: createIdempotencyKey() });
      state.approvalDetail = (await api.getApproval(state.projectId, String(values.get("approvalId")))).data;
      toast("Mock review comment added.");
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Comment failed."); }
    return;
  }
  if (form.id === "memory-search-form") {
    const query = String(new FormData(form).get("query") || "").trim();
    state.contextQuery = query;
    state.memoryResults = (await api.searchMemory(state.projectId, query)).data;
    toast(`Mock memory search returned ${state.memoryResults.length} safe result${state.memoryResults.length === 1 ? "" : "s"}.`);
    render();
    return;
  }
  if (form.id === "create-project-form") {
    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector("#form-message");
    if (button instanceof HTMLButtonElement) { button.disabled = true; button.textContent = "Creating…"; }
    try {
      const values = Object.fromEntries(new FormData(form));
      const result = await api.createProject(values, { idempotencyKey: createIdempotencyKey() });
      await hydrate(values.workspaceId);
      toast("Project created in the mock adapter.");
      navigate(`/app/projects/${result.data.id}/overview`);
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof ApiError ? `${error.message} · ${error.requestId}` : "Unable to create project.")}</div>`;
    } finally {
      if (button instanceof HTMLButtonElement) { button.disabled = false; button.textContent = "Create project"; }
    }
  }
  if (form.id === "project-settings-form") {
    const id = form.dataset.projectId;
    const values = Object.fromEntries(new FormData(form));
    try {
      await api.updateProject(id, values);
      await hydrate(state.workspaceId);
      toast("Project settings updated in the mock adapter.");
    } catch (error) { toast(error instanceof Error ? error.message : "Update failed."); }
  }
  if (form.id === "auth-form") {
    const kind = form.dataset.kind;
    const values = Object.fromEntries(new FormData(form));
    const message = form.querySelector("#auth-message");
    const button = form.querySelector('button[type="submit"]');
    if (button instanceof HTMLButtonElement) { button.disabled = true; button.textContent = "Please wait…"; }
    try {
      if (kind === "login") {
        await api.login(values);
        location.href = `${location.pathname}#${routes.dashboard}`;
        await hydrate();
      } else if (kind === "register") {
        await api.register(values);
        if (message) message.innerHTML = `<div class="alert success">Check your email to continue. This is a mock response.</div>`;
      } else {
        await api.recover(values.email);
        if (message) message.innerHTML = `<div class="alert success">If this account exists, recovery instructions have been accepted by the mock adapter.</div>`;
      }
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Authentication failed.")}</div>`;
    } finally {
      if (button instanceof HTMLButtonElement) { button.disabled = false; button.textContent = kind === "login" ? "Sign in" : kind === "register" ? "Create account" : "Send instructions"; }
    }
  }
  if (form.id === "connect-repository-form") {
    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector("#repo-form-message");
    if (button instanceof HTMLButtonElement) { button.disabled = true; button.textContent = "Connecting…"; }
    try {
      const values = Object.fromEntries(new FormData(form));
      await api.connectRepository(state.projectId, values, { idempotencyKey: createIdempotencyKey() });
      state.repositories = (await api.listRepositories(state.projectId)).data;
      toast("Repository added as pending in the mock adapter.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Unable to connect repository.")}</div>`;
    } finally {
      if (button instanceof HTMLButtonElement) { button.disabled = false; button.textContent = "Connect mock repository"; }
    }
  }
  if (form.id === "file-input-form") {
    const file = /** @type {HTMLInputElement|null} */ (form.querySelector("#asset-file"))?.files?.[0];
    const message = form.querySelector("#input-form-message");
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const inputType = ({ pdf: "pdf", csv: "csv", xlsx: "spreadsheet", xls: "spreadsheet", docx: "document", pptx: "document", png: "image", jpg: "image", jpeg: "image", mp3: "audio", wav: "audio", mp4: "video", mov: "video", log: "log", zip: "code_archive" })[extension] || "file";
    try {
      const initiated = await api.initiateUpload(state.projectId, { name: file.name, inputType, byteSize: file.size, mimeType: file.type, sourceType: "upload" }, { idempotencyKey: createIdempotencyKey() });
      await api.completeUpload(state.projectId, initiated.data.assetId);
      state.assets = (await api.listAssets(state.projectId)).data;
      toast("Mock initiate → transfer → complete sequence recorded. No file content was uploaded.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Upload failed.")}</div>`;
    }
  }
  if (form.id === "text-input-form" || form.id === "url-input-form") {
    const message = form.querySelector("#input-form-message");
    try {
      const values = Object.fromEntries(new FormData(form));
      if (form.id === "text-input-form") await api.addTextInput(state.projectId, values);
      else await api.addUrlInput(state.projectId, values);
      state.assets = (await api.listAssets(state.projectId)).data;
      toast(form.id === "text-input-form" ? "Text context added to the mock inventory." : "URL accepted by the mock adapter.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Input failed.")}</div>`;
    }
  }
  if (form.id === "new-conversation-form") {
    const values = Object.fromEntries(new FormData(form));
    try {
      const created = await api.createConversation(state.projectId, values, { idempotencyKey: createIdempotencyKey() });
      state.conversations = (await api.listConversations(state.projectId)).data;
      state.conversationId = created.data.id;
      state.messages = [];
      toast("Conversation created in the mock adapter.");
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Conversation creation failed."); }
  }
  if (form.id === "message-form") {
    const values = new FormData(form);
    const input = {
      text: values.get("text"),
      assetIds: values.getAll("assetIds"),
      repositoryIds: values.getAll("repositoryIds")
    };
    const message = form.querySelector("#conversation-form-message");
    try {
      await api.postMessage(state.projectId, state.conversationId, input, { idempotencyKey: createIdempotencyKey() });
      state.messages = (await api.listMessages(state.projectId, state.conversationId)).data;
      state.conversations = (await api.listConversations(state.projectId)).data;
      toast("Message accepted. No AI execution occurred.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Message failed.")}</div>`;
    }
  }
  if (form.id === "analysis-request-form") {
    const values = new FormData(form);
    const input = {
      requestText: values.get("requestText"),
      requestType: values.get("requestType"),
      priority: values.get("priority"),
      executionStrategy: values.get("executionStrategy"),
      conversationId: values.get("conversationId") || undefined,
      assetIds: values.getAll("assetIds"),
      repositoryIds: values.getAll("repositoryIds")
    };
    const message = form.querySelector("#analysis-form-message");
    try {
      const created = await api.createAnalysisRequest(state.projectId, input, { idempotencyKey: createIdempotencyKey() });
      state.analysisRequests = (await api.listAnalysisRequests(state.projectId)).data;
      if (message) message.innerHTML = `<div class="alert success">Mock receipt created: ${escapeHtml(created.data.id)} · workflow ${escapeHtml(created.data.workflowId)} · status ${escapeHtml(created.data.status)}. No execution started.</div>`;
      toast("Mock analysis receipt created.");
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Request failed.")}</div>`;
    }
  }
});

window.addEventListener("hashchange", render);
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    toast("Global search contract is not defined yet.");
  }
});

render();
if (!currentPath().startsWith("/auth/")) hydrate();