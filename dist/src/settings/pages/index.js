// @ts-check
/**
 * SYNASE AI — Settings Control Plane Master Page
 * Standalone full-page view with dedicated top navigation bar, clean white content canvas,
 * unclustered layout, and direct return navigation to the console.
 */

import { state } from "../../shared/state/store.js";
import { escapeHtml, initials } from "../../shared/utils/format.js";
import { brandMarkSvg } from "../../shared/components/ui.js";
import { themeToggleMarkup } from "../../shared/services/theme.js";
import {
  settingsSidebar,
  settingsHeader,
  renderSectionContent,
  settingsModalContainer
} from "../components/index.js";

/**
 * Renders the top navigation chrome for the standalone settings experience.
 * @returns {string}
 */
export function settingsTopNav() {
  const user = state.user || { displayName: "Alex Turner" };
  return `<header class="settings-topbar">
    <div class="settings-topbar-left">
      <a class="settings-topbar-brand" href="#/app/dashboard" data-route="/app/dashboard" title="Return to Console">
        <span class="settings-topbar-brand-mark" aria-hidden="true">${brandMarkSvg()}</span>
        <span>SYNASE AI</span>
      </a>
      <span class="settings-topbar-divider">/</span>
      <span class="settings-topbar-pill">SETTINGS</span>
    </div>
    <div class="settings-topbar-center">
      <button class="settings-back-btn" data-route="/app/dashboard" type="button">
        ← Back to Console
      </button>
    </div>
    <div class="settings-topbar-actions">
      ${themeToggleMarkup()}
      <button class="settings-topbar-avatar" data-action="profile" title="${escapeHtml(user.displayName)}">${initials(user.displayName)}</button>
    </div>
  </header>`;
}

/**
 * Renders the standalone Settings Control Plane page view.
 * @param {string} [sectionId]
 * @returns {string}
 */
export function settingsControlPlanePage(sectionId) {
  const activeSection = sectionId || state.settingsSection || "general";
  state.settingsSection = activeSection;

  return `
    <div class="settings-standalone">
      ${settingsTopNav()}
      <div class="settings-layout">
        ${settingsSidebar(activeSection)}
        <main class="settings-main" id="settings-main" aria-label="Settings content">
          ${settingsHeader(activeSection)}
          <div class="settings-content-body">
            ${renderSectionContent(activeSection)}
          </div>
        </main>
      </div>
      ${settingsModalContainer()}
    </div>
  `;
}
