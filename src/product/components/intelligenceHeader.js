// @ts-check
import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";

/**
 * Renders the top navigation header and section switchers for Product Intelligence.
 * @param {string} currentSection
 * @param {string} [activeAction]
 * @returns {string}
 */
export function intelligenceHeader(currentSection = "overview", activeAction = "") {
  const sections = [
    { id: "overview", label: "Overview", icon: "⌗" },
    { id: "requirements", label: "Requirements", icon: "≡" },
    { id: "prioritization", label: "Prioritization", icon: "⌥" },
    { id: "strategy", label: "Strategy", icon: "◎" },
    { id: "roadmap", label: "Roadmap", icon: "↦" },
    { id: "decisions", label: "Decisions & Trace", icon: "⚑" }
  ];

  return `
    <div class="breadcrumbs">
      <span>SYNASE AI</span>
      <span>/</span>
      <span>Intelligence</span>
      <span>/</span>
      <b>Product Layer</b>
    </div>

    <header class="page-header product-header">
      <div>
        <div class="eyebrow">Product Intelligence · Layer P</div>
        <h1>Product Intelligence</h1>
        <p class="page-copy">
          Evidence-grounded requirements, multi-criteria prioritization, strategic intent, and dependency-validated roadmaps.
        </p>
      </div>

      <div class="product-header-actions">
        <button class="button" data-action="product-modal" data-modal="new_requirement">
          <span>＋</span> New Requirement
        </button>
        <button class="button primary" data-action="product-mock" data-product-action="${escapeHtml(currentSection)}">
          Run Analysis (${escapeHtml(currentSection)})
        </button>
      </div>
    </header>

    <div class="alert product-banner">
      <div class="product-banner-badge">MOCK MODE</div>
      <div class="product-banner-text">
        <strong>Authoritative Project Isolation:</strong> AI suggestions carry distinct provenance and are visually separated from confirmed records. No external model, tool, or pipeline is executed.
      </div>
    </div>

    <nav class="page-tabs product-nav-strip" aria-label="Product Sections">
      ${sections
        .map(
          (sec) => `
        <button
          class="input-tab ${currentSection === sec.id ? "active" : ""}"
          data-action="product-section"
          data-section="${sec.id}"
          data-tab="${sec.id}"
        >
          <span class="product-nav-icon">${sec.icon}</span>
          ${sec.label}
        </button>
      `
        )
        .join("")}
    </nav>
  `;
}
