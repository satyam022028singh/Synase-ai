// @ts-check
/**
 * SYNASE AI — Setting Row Component
 * Renders individual setting entries with Antigravity styling, scope precedence badges, and policy locks.
 */

import { escapeHtml } from "../../shared/components/ui.js";

/**
 * @param {import("../types.d.ts").EffectiveSetting} effective
 * @param {import("../types.d.ts").SettingDefinition} [definition]
 * @returns {string}
 */
export function settingRow(effective, definition) {
  const id = effective.id;
  const label = definition ? definition.label : id;
  const description = definition ? definition.description : "";
  const type = definition ? definition.type : "string";
  const isLocked = Boolean(effective.isLocked);
  const scope = effective.sourceScope || "system";
  const isOverridden = effective.isOverridden;

  let controlHtml = "";

  if (type === "boolean") {
    const isChecked = Boolean(effective.value);
    controlHtml = `
      <label class="toggle-switch" title="${isLocked ? "Setting is locked by policy" : "Toggle " + escapeHtml(label)}">
        <input
          type="checkbox"
          data-action="settings-toggle-change"
          data-setting-id="${escapeHtml(id)}"
          ${isChecked ? "checked" : ""}
          ${isLocked ? "disabled" : ""}
        />
        <span class="toggle-slider"></span>
      </label>
    `;
  } else if (type === "enum" && definition?.options) {
    const optionsHtml = definition.options
      .map(
        (opt) =>
          `<option value="${escapeHtml(String(opt.value))}" ${String(opt.value) === String(effective.value) ? "selected" : ""}>${escapeHtml(opt.label)}</option>`
      )
      .join("");
    controlHtml = `
      <select
        class="settings-select"
        data-action="settings-select-change"
        data-setting-id="${escapeHtml(id)}"
        ${isLocked ? "disabled" : ""}
      >
        ${optionsHtml}
      </select>
    `;
  } else if (type === "number") {
    controlHtml = `
      <input
        type="number"
        class="settings-input"
        data-action="settings-input-change"
        data-setting-id="${escapeHtml(id)}"
        value="${escapeHtml(String(effective.value ?? 0))}"
        ${isLocked ? "disabled" : ""}
      />
    `;
  } else {
    controlHtml = `
      <input
        type="text"
        class="settings-input"
        data-action="settings-input-change"
        data-setting-id="${escapeHtml(id)}"
        value="${escapeHtml(String(effective.value ?? ""))}"
        ${isLocked ? "disabled" : ""}
      />
    `;
  }

  const scopeBadge = `<span class="scope-badge ${isOverridden ? "is-overridden" : ""} ${isLocked ? "is-locked" : ""}">
    ${escapeHtml(scope.toUpperCase())}
  </span>`;

  const lockBadge = isLocked
    ? `<span class="setting-locked-badge" title="${escapeHtml(effective.lockReason || "Locked by system policy")}">
        🔒 LOCKED
      </span>`
    : "";

  return `<div class="setting-row" data-setting-row="${escapeHtml(id)}">
    <div class="setting-info">
      <div class="setting-label-wrap">
        <span class="setting-label">${escapeHtml(label)}</span>
        ${scopeBadge}
        ${lockBadge}
      </div>
      <p class="setting-description">${escapeHtml(description)}</p>
    </div>
    <div class="setting-control">
      ${controlHtml}
    </div>
  </div>`;
}
