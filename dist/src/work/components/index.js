// @ts-check
/* Chat & Work presentation pieces.

   Views emit intent through data-action / data-route only. No listeners are
   attached here; app/main.js owns the single delegated handler. */

import { state } from "../../shared/state/store.js";
import { escapeHtml } from "../../shared/components/ui.js";
import { LAYERS, CAPABILITIES, EFFORTS, STARTERS, layerById, capabilityById, effortById } from "../constants.js";

const ARTIFACT_GLYPH = {
  report: "▤",
  code: "</>",
  doc: "≡",
  spec: "◇",
  image: "◫"
};

/**
 * @param {{id?: string, role?: string, text?: string, createdAt?: string, layer?: string, capability?: string, effort?: string, artifactId?: string, mock?: boolean}} message
 * @returns {string}
 */
export function workBubble(message) {
  const isUser = message.role === "user";
  const layer = message.layer ? layerById(message.layer) : null;
  const capability = message.capability ? capabilityById(message.capability) : null;
  const effort = message.effort ? effortById(message.effort) : null;
  const tags = [layer, capability, effort && effort.id !== "auto" ? effort : null]
    .filter(Boolean)
    .map((tag) => `<span class="work-tag">${escapeHtml(tag.label)}</span>`)
    .join("");
  return `<article class="work-msg ${isUser ? "is-user" : "is-assistant"}" data-work-message="${escapeHtml(message.id)}">
    <div class="work-msg-head">
      <span class="work-msg-who">${isUser ? "You" : "SYNASE AI"}</span>
      ${tags}
    </div>
    <div class="work-msg-body">${escapeHtml(message.text).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</div>
    ${
      message.artifactId
        ? `<button class="work-artifact-card" data-action="work-open-artifact" data-artifact="${escapeHtml(message.artifactId)}">
             <span class="work-artifact-kind">${ARTIFACT_GLYPH.report}</span>
             <span><strong>Draft artifact attached</strong><small>Mock content · not confirmed state</small></span>
             <span class="work-artifact-open">Open →</span>
           </button>`
        : ""
    }
    ${message.mock ? `<p class="work-mock-tag">Mock fixture · no model, tool, or network call</p>` : ""}
  </article>`;
}

/**
 * Empty session state.
 * @returns {string}
 */
export function workEmptyState() {
  const starters = STARTERS.map(
    (starter) => `<button class="work-starter" data-action="work-starter" data-starter="${escapeHtml(starter.id)}">
        <span class="work-starter-glyph">${starter.glyph}</span>
        <span><strong>${escapeHtml(starter.label)}</strong><small>${escapeHtml(starter.action)}</small></span>
      </button>`
  ).join("");
  return `<div class="work-empty">
    <h2>What would you like to do?</h2>
    <p class="work-empty-copy">Pick a layer or an agent capability, then describe the decision you need. Everything is a deterministic mock until a backend exists.</p>
    <div class="work-starters">${starters}</div>
  </div>`;
}

/**
 * The Agent Mode menu.
 *
 * The "+" control is Agent Mode and nothing else: the five capabilities.
 * Layer and effort are chosen on their own chips, so a session that is
 * already scoped to Product or DevOps cannot re-pick its layer from here.
 *
 * @param {"agent" | "layer" | "effort"} kind
 * @returns {string}
 */
export function workMenu(kind) {
  if (state.workMenu !== kind) return "";

  if (kind === "effort") {
    const rows = EFFORTS.map((effort) =>
      `<button class="work-menu-item ${state.workEffort === effort.id ? "is-selected" : ""}" data-action="work-effort" data-effort="${effort.id}" role="menuitemradio" aria-checked="${state.workEffort === effort.id}">
        <span class="work-menu-copy-inline">${escapeHtml(effort.description)}</span>
        <span class="work-menu-title">${escapeHtml(effort.label)}</span>
        ${state.workEffort === effort.id ? '<span class="work-menu-check" aria-hidden="true">✓</span>' : ""}
      </button>`
    );
    return `<div class="work-menu is-effort" role="menu" aria-label="Effort">${rows.join("")}</div>`;
  }

  if (kind === "layer") {
    const rows = LAYERS.map((layer) =>
      `<button class="work-menu-item ${state.workLayer === layer.id ? "is-selected" : ""}" data-action="work-layer" data-layer="${layer.id}" role="menuitemradio" aria-checked="${state.workLayer === layer.id}">
        <span class="work-menu-glyph">${layer.glyph}</span>
        <span><span class="work-menu-title">${escapeHtml(layer.label)}</span><span class="work-menu-copy">${escapeHtml(layer.description)}</span></span>
        ${state.workLayer === layer.id ? '<span class="work-menu-check" aria-hidden="true">✓</span>' : ""}
      </button>`
    );
    return `<div class="work-menu is-layer" role="menu" aria-label="Layer">${rows.join("")}</div>`;
  }

  /* Agent Mode: the five capabilities, nothing else. */
  const rows = CAPABILITIES.map((capability) =>
    `<button class="work-menu-item ${state.workCapability === capability.id ? "is-selected" : ""}" data-action="work-capability" data-capability="${capability.id}" role="menuitemradio" aria-checked="${state.workCapability === capability.id}">
      <span class="work-menu-glyph">${capability.glyph}</span>
      <span><span class="work-menu-title">${escapeHtml(capability.label)}</span><span class="work-menu-copy">${escapeHtml(capability.description)}</span></span>
      ${state.workCapability === capability.id ? '<span class="work-menu-check" aria-hidden="true">✓</span>' : ""}
    </button>`
  );
  return `<div class="work-menu is-agent" role="menu" aria-label="Agent Mode">
    <div class="work-menu-heading">Agent Mode</div>
    ${rows.join("")}
  </div>`;
}

/**
 * Active selections, shown as chips inside the composer. Each chip opens the
 * menu it owns rather than sharing the Agent Mode menu.
 * @returns {string}
 */
export function workComposerChips() {
  const chips = [];
  chips.push(`<button class="work-chip is-layer" data-action="work-open-menu" data-menu="layer" title="Change layer">
    <span>${state.workLayer ? layerById(state.workLayer)?.glyph || "◇" : "◇"}</span>${escapeHtml(state.workLayer ? layerById(state.workLayer)?.label || state.workLayer : "Choose layer")}<b aria-hidden="true">⌄</b>
  </button>`);
  if (state.workCapability) {
    const capability = capabilityById(state.workCapability);
    if (capability) {
      chips.push(`<button class="work-chip" data-action="work-clear" data-clear="capability" title="Clear capability"><span>${capability.glyph}</span>${escapeHtml(capability.label)}<b aria-hidden="true">×</b></button>`);
    }
  }
  const effort = effortById(state.workEffort) || EFFORTS[0];
  chips.push(`<button class="work-chip is-effort" data-action="work-open-menu" data-menu="effort" title="Change effort"><span aria-hidden="true">◐</span>${escapeHtml(effort.label)} effort<b aria-hidden="true">⌄</b></button>`);
  /* the artifact panel is collapsible, so it needs a way back when hidden */
  if (state.workArtifacts.length) {
    chips.push(`<button class="work-chip is-artifacts ${state.workArtifactsOpen ? "is-on" : ""}" data-action="work-toggle-artifacts" aria-pressed="${state.workArtifactsOpen}" title="${state.workArtifactsOpen ? "Collapse" : "Open"} the artifact panel">
      <span aria-hidden="true">▤</span>Artifacts · ${state.workArtifacts.length}<b aria-hidden="true">${state.workArtifactsOpen ? "×" : "⌃"}</b>
    </button>`);
  }
  return chips.join("");
}

/**
 * @param {{fullName?: string, connected?: boolean}} repository
 * @returns {string}
 */
export function workRepositoryBanner(repository) {
  if (!state.workLayer) return "";
  if (repository?.connected) {
    return `<div class="work-connect is-connected"><span class="work-connect-dot"></span><span>Connected to <strong>${escapeHtml(repository.fullName || "GitHub")}</strong> · mock, nothing imported</span></div>`;
  }
  return `<div class="work-connect"><span class="work-connect-dot"></span><span>Connect your GitHub to give ${escapeHtml(
    layerById(state.workLayer)?.label || "this layer"
  )} real repository evidence</span><button class="work-connect-btn" data-action="work-connect-github">Connect</button><span class="work-badge">NEW</span></div>`;
}

/**
 * Right-hand artifact panel. Collapsible: the close button only hides it, the
 * selection is kept so reopening restores the same artifact.
 * @returns {string}
 */
export function workArtifactPanel() {
  if (!state.workArtifacts.length) return "";
  if (!state.workArtifactsOpen) return "";
  const active =
    state.workArtifacts.find((item) => item.id === state.workArtifactId) ||
    state.workArtifacts[state.workArtifacts.length - 1];
  const tabs = state.workArtifacts
    .map(
      (item) => `<button class="work-artifact-tab ${item.id === active.id ? "is-active" : ""}" data-action="work-open-artifact" data-artifact="${escapeHtml(item.id)}">
        <span class="work-artifact-kind">${ARTIFACT_GLYPH[item.kind] || "≡"}</span>${escapeHtml(item.title)}
      </button>`
    )
    .join("");

  return `<aside class="work-artifacts" aria-label="Artifacts">
    <div class="work-artifacts-head">
      <h2>Artifacts <span class="work-artifact-count">${state.workArtifacts.length}</span></h2>
      <button class="icon-btn" data-action="work-close-artifacts" aria-label="Collapse the artifact panel" title="Collapse artifacts">×</button>
    </div>
    <div class="work-artifact-tabs">${tabs}</div>
    <div class="work-artifact-body">
      <h3>${escapeHtml(active.title)}</h3>
      <p class="work-artifact-meta">
        <span class="proposal">AI suggestion · ${Math.round((active.confidence || 0) * 100)}%</span>
        <span class="small subtle">mock · not confirmed state</span>
      </p>
      <pre class="work-artifact-content">${escapeHtml(active.content)}</pre>
      <p class="work-artifact-foot">Executed: No · External contacted: No · Model invoked: No</p>
    </div>
  </aside>`;
}