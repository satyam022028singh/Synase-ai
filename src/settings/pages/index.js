// @ts-check
/**
 * SYNASE AI — Settings Control Plane Master Page
 * Assembles the full Settings experience with sidebar navigation, header, content sections, and modal container.
 */

import { state } from "../../shared/state/store.js";
import {
  settingsSidebar,
  settingsHeader,
  renderSectionContent,
  settingsModalContainer
} from "../components/index.js";

/**
 * Renders the Settings Control Plane page view.
 * @param {string} [sectionId]
 * @returns {string}
 */
export function settingsControlPlanePage(sectionId) {
  const activeSection = sectionId || state.settingsSection || "general";
  state.settingsSection = activeSection;

  return `
    <div class="settings-layout">
      ${settingsSidebar(activeSection)}
      <main class="settings-main" id="settings-main" aria-label="Settings content">
        ${settingsHeader(activeSection)}
        <div class="settings-content-body">
          ${renderSectionContent(activeSection)}
        </div>
      </main>
      ${settingsModalContainer()}
    </div>
  `;
}
