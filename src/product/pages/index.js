// @ts-check
/* Product Intelligence: requirements, prioritisation, strategy, roadmap. */
import { state } from "../../shared/state/store.js";
import { routes } from "../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml,
  provenance
} from "../../shared/components/ui.js";
export function requirementsView() {
  return `<div class="table-wrap"><table><thead><tr><th>ID / Requirement</th><th>Type</th><th>Priority</th><th>Status</th><th>Evidence / impact</th><th>Provenance</th></tr></thead><tbody>${state.requirements.map((item) => `<tr><td><strong>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</strong><br><span class="small">${escapeHtml(item.rationale || "")}</span></td><td>${escapeHtml(item.type)}</td><td>${status(item.priority)}</td><td>${status(item.status)}</td><td>${escapeHtml(item.evidence.join(", "))}<br><span class="small">${escapeHtml(item.architectureImpact || "—")}</span></td><td>${provenance(item)}</td></tr>`).join("")}</tbody></table></div>`;
}

export function prioritizationView() {
  return `<div class="priority-grid">${state.productFeatures.map((feature) => `<article class="card priority-card"><div class="card-body"><div class="catalog-head"><span class="rank">#${feature.priorityRank}</span>${provenance(feature)}</div><h2>${escapeHtml(feature.title)}</h2><p>${escapeHtml(feature.rationale)}</p><div class="score-grid"><span>Value<b>${feature.businessValue}</b></span><span>Impact<b>${feature.impact}</b></span><span>Effort<b>${feature.effort}</b></span><span>Risk<b>${feature.risk}</b></span></div><div class="cluster">${status(feature.status)}</div></div></article>`).join("")}</div>`;
}

export function strategyView() {
  const item = state.productStrategy;
  if (!item) return notFound("Strategy unavailable","No strategy aggregate is available for this project.");
  return `<div class="dashboard-grid"><article class="card"><div class="card-head"><h2>Strategic objective</h2>${provenance(item)}</div><div class="card-body"><p class="strategy-objective">${escapeHtml(item.objective)}</p><h3>Principles</h3><ul class="clean-list">${item.principles.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul></div></article><article class="card"><div class="card-head"><h2>Known risks</h2></div><div class="card-body"><ul class="clean-list risk-list">${item.risks.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul></div></article></div>`;
}

export function roadmapView() {
  return `<div class="roadmap">${state.roadmapItems.map((item) => `<article class="roadmap-item"><span class="roadmap-seq">${item.sequence}</span><div><div class="cluster"><b>${escapeHtml(item.release)}</b>${status(item.status)}</div><h2>${escapeHtml(item.milestone)}</h2><p>${escapeHtml(item.startDate || "—")} → ${escapeHtml(item.endDate || "—")}</p><small>Dependencies: ${escapeHtml(item.dependencies.join(", ") || "None")}</small></div></article>`).join("")}</div>`;
}

export function productIntelligencePage() {
  const tabs = [["requirements","Requirements"],["prioritization","Prioritization"],["strategy","Strategy"],["roadmap","Roadmap"]];
  return `${pageHeader("Product intelligence", "Product decisions", "Structure requirements, feature priorities, strategy, and roadmap with evidence and explicit suggestion provenance.", `<button class="button primary" data-action="product-mock" data-product-action="${state.productTab}">Run mock ${state.productTab}</button>`)}
    <div class="alert">Mock Product Intelligence. Suggestions are clearly separated from confirmed project state; no AI workflow is running.</div>
    <div class="input-tabs page-tabs">${tabs.map(([key,label]) => `<button class="input-tab ${state.productTab===key?"active":""}" data-action="product-tab" data-tab="${key}">${label}</button>`).join("")}</div>
    ${state.productTab === "requirements" ? requirementsView() : state.productTab === "prioritization" ? prioritizationView() : state.productTab === "strategy" ? strategyView() : roadmapView()}`;
}
