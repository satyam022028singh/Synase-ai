// @ts-check
/* Chat & Work views.

   The chat surface is a standalone full-screen page, deliberately outside the
   console shell: signing in or pressing Start Now opens only the chat canvas,
   with no platform sidebar or topbar. "Work" is the existing workspace
   dashboard, which stays inside the shell, and the header toggle moves between
   the two. */

import { state } from "../../shared/state/store.js";
import { escapeHtml, brandMarkSvg } from "../../shared/components/ui.js";
import { themeToggleMarkup } from "../../shared/services/theme.js";
import { initials } from "../../shared/utils/format.js";
import {
  workBubble,
  workEmptyState,
  workMenu,
  workComposerChips,
  workRepositoryBanner,
  workArtifactPanel
} from "../components/index.js";

/**
 * Minimal chrome for the standalone chat page.
 * @returns {string}
 */
function chatHeader() {
  return `<header class="chat-topbar">
    <a class="chat-brand" href="#/app/chat" data-route="/app/chat">
      <span class="chat-brand-mark" aria-hidden="true">${brandMarkSvg()}</span>
      <strong>SYNASE AI</strong>
    </a>
    <div class="chat-tabs" role="tablist" aria-label="Switch surface">
      <button class="chat-tab is-active" role="tab" aria-selected="true" aria-current="page">Chat</button>
      <button class="chat-tab" data-route="/app/dashboard" role="tab" aria-selected="false">Work</button>
    </div>
    <div class="chat-topbar-actions">
      ${themeToggleMarkup()}
      <span class="chat-avatar" title="${escapeHtml(state.user?.displayName || "User")}">${initials(state.user?.displayName)}</span>
    </div>
  </header>`;
}

/**
 * Session switcher, kept as a slim rail because losing session history would be
 * a regression, but visually independent of the platform sidebar.
 * @returns {string}
 */
function sessionRail() {
  const sessions = state.workSessions
    .map(
      (session) => `<button class="chat-session ${session.id === state.workSessionId ? "is-active" : ""}" data-route="/app/chat/${escapeHtml(session.id)}">
        <span class="chat-session-title">${escapeHtml(session.title)}</span>
        <span class="chat-session-meta">${escapeHtml(session.layer || session.capability || "chat")} · ${escapeHtml(session.effort)}</span>
      </button>`
    )
    .join("");
  return `<nav class="chat-rail" aria-label="Sessions">
    <button class="chat-new" data-action="work-new">＋ <span>New session</span></button>
    <div class="chat-session-list">${sessions || `<p class="chat-session-empty">No sessions yet.</p>`}</div>
  </nav>`;
}

/**
 * @returns {string}
 */
export function chatPage() {
  const active = state.workSessions.find((item) => item.id === state.workSessionId);
  const mode = active?.mode || state.workMode;
  const threads = state.workMessages.map(workBubble).join("");

  return `<div class="chat-page">
    ${sessionRail()}
    <div class="chat-main">
      ${chatHeader()}
      <div class="chat-thread" id="work-thread">
        ${threads || workEmptyState()}
      </div>
      <div class="chat-composer-area">
        ${workRepositoryBanner(state.workRepository)}
        <form class="chat-composer" id="work-composer-form">
          <div class="chat-composer-row">
            <button type="button" class="chat-plus" data-action="work-open-menu" data-menu="agent" aria-label="Agent Mode" aria-expanded="${state.workMenu === "agent"}">＋</button>
            <input class="chat-input" id="work-input" name="text" autocomplete="off" placeholder="${escapeHtml(
              mode === "work" ? "Describe the decision you need" : "Ask anything"
            )}" value="${escapeHtml(state.workComposer)}" />
            <button type="button" class="chat-tool" data-action="work-thinking" aria-pressed="${state.workThinking}" title="Extended reasoning draft">Think</button>
            <button type="button" class="chat-tool is-icon" data-action="work-mic" title="Voice input is not available in the mock">🎙</button>
            <button type="submit" class="chat-send" aria-label="Send">↑</button>
          </div>
          <div class="chat-chips">
            ${workComposerChips()}
            ${workMenu("agent")}
            ${workMenu("layer")}
            ${workMenu("effort")}
          </div>
        </form>
        <p class="chat-disclaimer">SYNASE AI can make mistakes. Everything here is a deterministic mock: no model, tool, or external system is called.</p>
      </div>
    </div>
    ${workArtifactPanel()}
  </div>`;
}