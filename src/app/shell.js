// @ts-check
/* Application chrome: sidebar, topbar, workspace/project switchers, toast.
   This is the only place that renders navigation, so every route group appears
   in exactly one place. */

import { state } from "../shared/state/store.js";
import { escapeHtml, initials } from "../shared/utils/format.js";
import { brandMarkSvg } from "../shared/components/ui.js";
import { themeToggleMarkup } from "../shared/services/theme.js";
import { routes, projectRoute, isActive } from "./paths.js";

/**
 * @param {string} path
 * @param {string} icon
 * @param {string} label
 * @param {boolean} [prefix]
 * @param {boolean} [disabled]
 * @returns {string}
 */
export function navLink(path, icon, label, prefix = false, disabled = false) {
  return `<button class="nav-link ${isActive(path, prefix) ? "active" : ""}" data-route="${disabled ? "" : path}" ${disabled ? 'aria-disabled="true" title="Planned for a later phase"' : ""}>
    <span class="nav-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(label)}</span>
  </button>`;
}

/**
 * Wraps a page body in the persistent chrome.
 * @param {string} content
 * @returns {string}
 */
export function shell(content) {
  const workspaceOptions = state.workspaces
    .map(
      (workspace) =>
        `<option value="${workspace.id}" ${workspace.id === state.workspaceId ? "selected" : ""}>${escapeHtml(workspace.name)}</option>`
    )
    .join("");
  const projectOptions = state.projects
    .map(
      (project) =>
        `<option value="${project.id}" ${project.id === state.projectId ? "selected" : ""}>${escapeHtml(project.name)}</option>`
    )
    .join("");
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
          ${themeToggleMarkup()}
          <button class="avatar" data-action="profile" aria-label="Open user menu">${initials(state.user?.displayName)}</button>
        </div>
      </header>
      <main id="main" class="content">${content}</main>
    </div>
    ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
  </div>`;
}