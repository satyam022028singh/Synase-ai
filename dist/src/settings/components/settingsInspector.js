// @ts-check
/**
 * SYNASE AI — Settings Context & Intelligence Inspector Rail
 * Dynamically repopulates wide screen space with real-time scope precedence,
 * domain telemetry metrics, governance actions, and security policy tenets.
 */

import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";

/**
 * Returns contextual domain telemetry, active stats, and governance rules.
 * @param {string} sectionId
 */
function getDomainTelemetry(sectionId) {
  switch (sectionId) {
    case "ai-models":
      return {
        badge: "GATEWAY ARMED",
        badgeClass: "is-active",
        metrics: [
          { label: "Primary Model", value: "Gemini 1.5 Pro" },
          { label: "Fallback Engine", value: "Claude 3.5 Sonnet" },
          { label: "Active Gateways", value: "4 Connected" },
          { label: "Median Latency", value: "198ms" }
        ],
        tenet: "Invariant 01: Shipped adapter contacts no external provider or model. All execution runs against deterministic mock domain services."
      };
    case "connectors":
      return {
        badge: "SYNC HEALTHY",
        badgeClass: "is-active",
        metrics: [
          { label: "Providers", value: "GitHub, Linear, Slack" },
          { label: "Sync Cadence", value: "Every 15 min" },
          { label: "Last Sync", value: "4m ago" },
          { label: "Auth Separation", value: "Invariant 05 Active" }
        ],
        tenet: "Invariant 05: Authorization, connection, health, and synchronization are four independent states."
      };
    case "developer":
      return {
        badge: "ZERO SECRETS STORED",
        badgeClass: "is-secure",
        metrics: [
          { label: "Active API Keys", value: "2 Keys" },
          { label: "Key Reveal Policy", value: "One-Time Only" },
          { label: "Rate Limit Quota", value: "1,200 req/min" },
          { label: "Wire Tracing", value: "Enabled (Dev)" }
        ],
        tenet: "Invariant 19: Full API key tokens are shown once on creation receipt and never persisted or queryable via list methods."
      };
    case "security":
    case "vault":
      return {
        badge: "HARDENED",
        badgeClass: "is-secure",
        metrics: [
          { label: "MFA Enforcement", value: "Strict" },
          { label: "Idle Session Timeout", value: "30 Minutes" },
          { label: "Audit Immutability", value: "Enforced" },
          { label: "Secret Exposure", value: "Zero (Inv-02)" }
        ],
        tenet: "Invariant 02 & 03: No secret reaches a display model or projection. Metadata is recursively redacted."
      };
    case "automations":
      return {
        badge: "DAEMON RUNNING",
        badgeClass: "is-active",
        metrics: [
          { label: "Scheduled Jobs", value: "3 Active" },
          { label: "Max Concurrency", value: "4 Tasks" },
          { label: "Next Scheduled", value: "In 12m" },
          { label: "Mutation Idempotency", value: "Required" }
        ],
        tenet: "Invariant 08: Every mutation requires an idempotency key and replays the first receipt on retry."
      };
    case "usage":
      return {
        badge: "WITHIN QUOTA",
        badgeClass: "is-active",
        metrics: [
          { label: "Tokens Used", value: "1.42M / 5.00M" },
          { label: "Storage Consumed", value: "128 MB / 1 GB" },
          { label: "API Calls (Today)", value: "3,842 calls" },
          { label: "Cost Projection", value: "$42.50 / $100" }
        ],
        tenet: "Resource thresholds trigger proactive throttling before hitting hard provider rate limits."
      };
    default:
      return {
        badge: "CONTROL PLANE LIVE",
        badgeClass: "is-active",
        metrics: [
          { label: "Workspace Tier", value: "Enterprise" },
          { label: "Active Role", value: "Admin (Full Access)" },
          { label: "Precedence Order", value: "7 Scopes Deterministic" },
          { label: "Schema Version", value: "v1.12.0" }
        ],
        tenet: "Invariant 24: Strict hierarchical scope precedence ensures reproducible configuration overrides without state drift."
      };
  }
}

/**
 * Renders the responsive side inspector rail on viewports with dynamic space available.
 * @param {string} sectionId
 * @returns {string}
 */
export function settingsInspectorRail(sectionId) {
  const telemetry = getDomainTelemetry(sectionId);
  const user = state.user || { displayName: "Alex Turner" };
  const ws = state.workspaces?.find((w) => w.id === state.workspaceId) || { name: "Synase Enterprise" };
  const prj = state.projects?.find((p) => p.id === state.projectId) || { name: "Platform Core" };

  return `
    <aside class="settings-inspector-rail" aria-label="Settings Context & Inspector">
      <!-- 1. Active Scope Precedence Ladder -->
      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-card-tag">HIERARCHY RESOLVER</span>
          <h3 class="inspector-card-title">Scope Precedence</h3>
        </div>
        <div class="inspector-card-body">
          <div class="scope-ladder">
            <div class="scope-ladder-step is-active" title="User scope: Highest precedence override">
              <span class="ladder-rank">1</span>
              <span class="ladder-scope">user</span>
              <span class="ladder-ctx">${escapeHtml(user.displayName)}</span>
            </div>
            <div class="scope-ladder-step">
              <span class="ladder-rank">2</span>
              <span class="ladder-scope">session</span>
              <span class="ladder-ctx">Interactive</span>
            </div>
            <div class="scope-ladder-step">
              <span class="ladder-rank">3</span>
              <span class="ladder-scope">task</span>
              <span class="ladder-ctx">Active run</span>
            </div>
            <div class="scope-ladder-step">
              <span class="ladder-rank">4</span>
              <span class="ladder-scope">agent</span>
              <span class="ladder-ctx">Autonomous</span>
            </div>
            <div class="scope-ladder-step is-active">
              <span class="ladder-rank">5</span>
              <span class="ladder-scope">project</span>
              <span class="ladder-ctx">${escapeHtml(prj.name)}</span>
            </div>
            <div class="scope-ladder-step is-active">
              <span class="ladder-rank">6</span>
              <span class="ladder-scope">workspace</span>
              <span class="ladder-ctx">${escapeHtml(ws.name)}</span>
            </div>
            <div class="scope-ladder-step is-fallback">
              <span class="ladder-rank">7</span>
              <span class="ladder-scope">system</span>
              <span class="ladder-ctx">Default Schema</span>
            </div>
          </div>
          <p class="inspector-help-text">
            Evaluation flows top-to-bottom. Higher scopes cleanly override lower scopes without mutation side-effects.
          </p>
        </div>
      </div>

      <!-- 2. Domain Telemetry & Quick Metrics -->
      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-card-tag">DOMAIN TELEMETRY</span>
          <div class="inspector-title-row">
            <h3 class="inspector-card-title">Live State</h3>
            <span class="inspector-status-badge ${escapeHtml(telemetry.badgeClass)}">${escapeHtml(telemetry.badge)}</span>
          </div>
        </div>
        <div class="inspector-card-body">
          <div class="inspector-metrics-grid">
            ${telemetry.metrics
              .map(
                (m) => `
              <div class="inspector-metric-item">
                <span class="inspector-metric-label">${escapeHtml(m.label)}</span>
                <span class="inspector-metric-value">${escapeHtml(m.value)}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>

      <!-- 3. Domain Quick Actions -->
      <div class="inspector-card">
        <div class="inspector-card-header">
          <span class="inspector-card-tag">OPERATIONS</span>
          <h3 class="inspector-card-title">Quick Actions</h3>
        </div>
        <div class="inspector-card-body">
          <div class="inspector-actions-list">
            <button
              class="inspector-action-btn"
              type="button"
              data-action="settings-reset-section-trigger"
              data-section-id="${escapeHtml(sectionId)}"
            >
              <span>↺</span>
              <span>Reset Section Defaults</span>
            </button>
            <button
              class="inspector-action-btn"
              type="button"
              data-action="settings-export-section-trigger"
              data-section-id="${escapeHtml(sectionId)}"
            >
              <span>⤓</span>
              <span>Export Domain Spec (JSON)</span>
            </button>
            <button
              class="inspector-action-btn"
              type="button"
              data-route="/app/activity"
            >
              <span>↗</span>
              <span>Audit Log History</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Governance Guardrail Tenet -->
      <div class="inspector-card is-tenet">
        <div class="inspector-card-header">
          <span class="inspector-card-tag">SYSTEM TENET</span>
          <h3 class="inspector-card-title">Policy Enforcement</h3>
        </div>
        <div class="inspector-card-body">
          <p class="inspector-tenet-text">${escapeHtml(telemetry.tenet)}</p>
        </div>
      </div>
    </aside>
  `;
}
