// @ts-check
/* Application entry point.

   Owns: state hydration, data loading (including the routes the former
   phase11/phase12 plugins loaded themselves), and the one delegated event
   listener for every route group. Views and API surfaces live in the domain
   folders; this file orchestrates only. */

import { ApiError, createIdempotencyKey, normalizeWorkflowEvents } from "../shared/api/index.js";
import { workspaceApi } from "../home/workspace/api/index.js";
import { productApi } from "../product/api/index.js";
import { devopsApi } from "../devops/api/index.js";
import { mcpApi } from "../mcp/api/index.js";
import { contextApi } from "../context/api/index.js";
import { outputsApi } from "../outputs/api/index.js";
import { phase11Api, createPhase11IdempotencyKey } from "../integrations/api/client.js";
import { phase12Api } from "../home/workspace/dashboard/api.js";
import { createWorkController } from "./actions/work.js";

import { state, resetProjectScope } from "../shared/state/store.js";
import { escapeHtml } from "../shared/utils/format.js";
import { projectRows } from "../home/workspace/pages/projects.js";
import { assetTable } from "../home/workspace/pages/inputs.js";
import { initTheme } from "../shared/services/theme.js";

import { renderPage } from "./router.js";
import { routes, currentPath, navigate, isIntegrationsRoute } from "./paths.js";

const app = document.querySelector("#app");

/**
 * @param {string} message
 */
function toast(message) {
  state.toast = message;
  render();
  setTimeout(() => {
    state.toast = "";
    render();
  }, 2800);
}

export function render() {
  app.innerHTML = renderPage();
  queueMicrotask(() => {
    const activeTab = document.querySelector(".page-tabs .input-tab.active");
    const strip = activeTab?.parentElement;
    if (activeTab && strip && strip.scrollWidth > strip.clientWidth) {
      strip.scrollLeft = activeTab.offsetLeft - (strip.clientWidth - activeTab.clientWidth) / 2;
    }
  });
}

/* The Chat & Work surface has its own controller so this module stays an
   orchestrator rather than an accumulator. render/toast are injected because
   they close over the router and the shell. */
const work = createWorkController({ render, toast });

/* ── route-scoped data ────────────────────────────────────────────────
   The former phase12 dashboard and phase11 integrations pages each fetched
   their own data on route entry. That logic lives here now so there is one
   loader instead of three. */

async function loadDashboard() {
  if (currentPath() !== routes.dashboard || state.loading) return;
  state.decisionDashboardError = "";
  try {
    state.decisionDashboard = (await phase12Api.getDashboard()).data;
  } catch (error) {
    state.decisionDashboardError =
      error instanceof Error ? error.message : "Dashboard contract failed.";
  }
  render();
}

async function loadIntegrations(filters = {}) {
  const path = currentPath();
  if (!isIntegrationsRoute(path)) return;
  const routeProject = path.match(/^\/app\/projects\/([^/]+)\/integrations$/)?.[1];
  state.projectId =
    routeProject ||
    document.querySelector("#project-switcher")?.value ||
    state.projectId;
  state.integrationError = "";
  try {
    if (path.includes("integrations")) {
      const [providers, connections, runs] = await Promise.all([
        phase11Api.listIntegrationProviders(),
        phase11Api.listIntegrationConnections(state.projectId),
        phase11Api.listIntegrationRuns(state.projectId)
      ]);
      state.integrationProviders = providers.data;
      state.integrationConnections = connections.data;
      state.integrationRuns = runs.data;
    } else if (path === "/app/activity") {
      state.activity = (await phase11Api.listActivity(state.projectId, filters)).data;
    } else {
      state.auditEvents = (await phase11Api.listAuditEvents(state.projectId, filters)).data;
    }
  } catch (error) {
    state.integrationError =
      error instanceof Error ? error.message : "Mock adapter error";
  }
  render();
}

/* ── hydration ────────────────────────────────────────────────────── */

async function hydrate(workspaceId = state.workspaceId) {
  state.loading = true;
  render();
  try {
    const [
      me, workspaces, projects, members,
      mcpOverview, mcpRequests, mcpModels, mcpTools, mcpServers, mcpDirectories
    ] = await Promise.all([
      workspaceApi.getMe(),
      workspaceApi.listWorkspaces(),
      workspaceApi.listProjects(workspaceId),
      workspaceApi.listWorkspaceMembers(),
      mcpApi.getOverview(),
      mcpApi.listRequests(),
      mcpApi.listModels(),
      mcpApi.listTools(),
      mcpApi.listServers(),
      mcpApi.listDirectories()
    ]);
    state.user = me.data;
    state.workspaces = workspaces.data;
    state.workspaceId = workspaceId;
    state.projects = projects.data;
    state.members = members.data;
    state.mcpOverview = mcpOverview.data;
    state.mcpRequests = mcpRequests.data;
    state.mcpModels = mcpModels.data;
    state.mcpTools = mcpTools.data;
    state.mcpServers = mcpServers.data;
    state.mcpDirectories = mcpDirectories.data;
    state.mcpRequestId = state.mcpRequests[0]?.id || "";
    state.mcpTrace = state.mcpRequestId
      ? (await mcpApi.getTrace(state.mcpRequestId)).data
      : [];
    if (!state.projects.some((p) => p.id === state.projectId))
      state.projectId = state.projects[0]?.id || "";
    if (state.projectId) {
      await hydrateProject(state.projectId);
    } else {
      resetProjectScope();
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : "Unable to load the workspace.";
  } finally {
    state.loading = false;
    render();
  }
}

/**
 * Loads every project-scoped domain projection. Called on first load and on
 * project switch.
 * @param {string} projectId
 */
async function hydrateProject(projectId) {
  const [repositories, assets, conversations, requests, workflows] = await Promise.all([
    workspaceApi.listRepositories(projectId),
    workspaceApi.listAssets(projectId),
    workspaceApi.listConversations(projectId),
    workspaceApi.listAnalysisRequests(projectId),
    workspaceApi.listWorkflows(projectId)
  ]);
  state.repositories = repositories.data;
  state.assets = assets.data;
  state.conversations = conversations.data;
  state.analysisRequests = requests.data;
  state.workflows = workflows.data;
  state.workflowId = workflows.data[0]?.id || "";
  if (state.workflowId) {
    const [tasks, events] = await Promise.all([
      workspaceApi.listWorkflowTasks(projectId, state.workflowId),
      workspaceApi.listWorkflowEvents(projectId, state.workflowId)
    ]);
    state.workflowTasks = tasks.data;
    state.workflowEvents = normalizeWorkflowEvents(events.data);
  } else {
    state.workflowTasks = [];
    state.workflowEvents = [];
  }

  const [requirements, features, strategy, roadmap, decisions, overview] = await Promise.all([
    productApi.listRequirements(projectId),
    productApi.listProductFeatures(projectId),
    productApi.getProductStrategy(projectId),
    productApi.listRoadmapItems(projectId),
    productApi.listProductDecisions(projectId),
    productApi.getProductOverview(projectId)
  ]);
  state.requirements = requirements.data;
  state.productFeatures = features.data;
  state.productStrategy = strategy.data;
  state.roadmapItems = roadmap.data;
  state.productDecisions = decisions.data;
  state.productOverview = overview.data;

  const [devopsSummary, findings, recommendations, dependencies, tests, deployments] =
    await Promise.all([
      devopsApi.getDevOpsSummary(projectId),
      devopsApi.listFindings(projectId),
      devopsApi.listDevOpsRecommendations(projectId),
      devopsApi.listDependencies(projectId),
      devopsApi.listTestSuggestions(projectId),
      devopsApi.listDeploymentPlans(projectId)
    ]);
  state.devopsSummary = devopsSummary.data;
  state.findings = findings.data;
  state.devopsRecommendations = recommendations.data;
  state.dependencies = dependencies.data;
  state.testSuggestions = tests.data;
  state.deploymentPlans = deployments.data;

  const [contextItems, memory, history, graph] = await Promise.all([
    contextApi.listContextItems(projectId),
    contextApi.searchMemory(projectId),
    contextApi.listRetrievalHistory(projectId),
    contextApi.getKnowledgeGraph(projectId)
  ]);
  state.contextItems = contextItems.data;
  state.memoryResults = memory.data;
  state.retrievalHistory = history.data;
  state.knowledgeGraph = graph.data;

  const [reports, approvals] = await Promise.all([
    outputsApi.listReports(projectId),
    outputsApi.listApprovals(projectId)
  ]);
  state.reports = reports.data;
  state.reportId = reports.data[0]?.id || "";
  state.reportDetail = state.reportId
    ? (await outputsApi.getReport(projectId, state.reportId)).data
    : null;
  state.approvals = approvals.data;
  state.approvalId = approvals.data[0]?.id || "";
  state.approvalDetail = state.approvalId
    ? (await outputsApi.getApproval(projectId, state.approvalId)).data
    : null;

  state.conversationId = state.conversations[0]?.id || "";
  state.messages = state.conversationId
    ? (await workspaceApi.listMessages(projectId, state.conversationId)).data
    : [];
}

/* ── delegated events ─────────────────────────────────────────────── */

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element
    ? event.target.closest("[data-route],[data-action]")
    : null;
  if (!target) return;
  /* dismiss the contextual composer menu on any outside click */
  if (state.workMenu && !target.closest(".work-menu, .work-plus, .work-chip.is-effort")) {
    state.workMenu = "";
    render();
  }
  const route = target.getAttribute("data-route");
  if (route) {
    event.preventDefault();
    navigate(route);
    render();
    loadRouteData();
    return;
  }
  const action = target.getAttribute("data-action");

  /* chrome */
  if (action === "demo-login") {
    location.href = `${location.pathname}#${routes.chat}`;
    hydrate();
    return;
  }
  if (action === "toggle-menu") { state.sidebarOpen = !state.sidebarOpen; render(); }
  if (action === "search") toast("Global search contract is not defined yet.");
  if (action === "notifications") toast("Notifications are not available in Phase 2.");
  if (action === "profile") toast(`${state.user?.displayName || "User"} · ${state.user?.globalRole || "member"}`);
  if (action === "invite") toast("Invitation requires the unresolved backend invitation contract.");

  /* workspace */
  if (action === "toggle-repo-form") document.querySelector("#repo-form-panel")?.classList.toggle("hidden-panel");
  if (action === "close-repo-detail") { state.repositoryDetailId = ""; state.repositorySnapshots = []; state.repositoryTree = []; render(); }
  if (action === "input-tab") { state.inputTab = target.getAttribute("data-tab") || "file"; render(); }
  if (action === "analysis-tab") { state.analysisTab = target.getAttribute("data-tab") || "conversation"; render(); }
  if (action === "toggle-conversation-form") document.querySelector("#new-conversation-form")?.classList.toggle("hidden-panel");
  if (action === "select-conversation") {
    const conversationId = target.getAttribute("data-conversation-id");
    workspaceApi.listMessages(state.projectId, conversationId).then((messages) => {
      state.conversationId = conversationId;
      state.messages = messages.data;
      render();
    });
  }
  if (action === "cancel-request") {
    workspaceApi.cancelAnalysisRequest(state.projectId, target.getAttribute("data-request-id")).then(async () => {
      state.analysisRequests = (await workspaceApi.listAnalysisRequests(state.projectId)).data;
      toast("Analysis request cancelled by the mock adapter.");
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Cancellation failed."));
  }

  /* workflow execution */
  if (action === "select-workflow") {
    const workflowId = target.getAttribute("data-workflow-id");
    Promise.all([
      workspaceApi.listWorkflowTasks(state.projectId, workflowId),
      workspaceApi.listWorkflowEvents(state.projectId, workflowId)
    ]).then(([tasks, events]) => {
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
      Promise.all([
        workspaceApi.getWorkflow(state.projectId, state.workflowId),
        workspaceApi.listWorkflowEvents(state.projectId, state.workflowId)
      ]).then(([workflow, events]) => {
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
    workspaceApi.nextMockWorkflowEvent(state.projectId, state.workflowId).then(async (result) => {
      if (!result.data.event) { toast("No further mock events."); return; }
      state.workflowEvents = normalizeWorkflowEvents([...state.workflowEvents, result.data.event]);
      state.workflows = state.workflows.map((item) => item.id === result.data.workflow.id ? result.data.workflow : item);
      if (result.data.terminal) {
        const snapshot = await workspaceApi.getWorkflow(state.projectId, state.workflowId);
        state.workflows = state.workflows.map((item) => item.id === snapshot.data.id ? snapshot.data : item);
        state.streamState = "closed";
        toast("Terminal mock event received; authoritative snapshot refetched.");
      }
      render();
    });
  }
  if (action === "workflow-control") {
    workspaceApi.controlWorkflow(state.projectId, state.workflowId, target.getAttribute("data-control")).then((result) => {
      state.workflows = state.workflows.map((item) => item.id === result.data.id ? result.data : item);
      toast(`Workflow ${result.data.status} in the mock adapter.`);
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Workflow control failed."));
  }

  /* mcp */
  if (action === "select-mcp-request") {
    const requestId = target.getAttribute("data-request-id");
    mcpApi.getTrace(requestId).then((trace) => {
      state.mcpRequestId = requestId;
      state.mcpTrace = trace.data;
      render();
    });
  }
  if (action === "server-health") {
    mcpApi.checkServerHealth(target.getAttribute("data-server-id")).then(async (result) => {
      state.mcpServers = (await mcpApi.listServers()).data;
      toast(`Mock health check: ${result.data.healthStatus}. No server was contacted.`);
      render();
    });
  }
  if (action === "discover-directory") {
    mcpApi.discoverDirectory(target.getAttribute("data-directory-id"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock discovery completed with ${result.data.resultsCount} fixture results.`);
    });
  }

  /* product */
  if (action === "product-tab" || action === "product-section") {
    const sec = target.getAttribute("data-section") || target.getAttribute("data-tab") || "overview";
    state.productSection = sec;
    state.productTab = sec;
    render();
  }
  if (action === "product-select-requirement") {
    state.productSelectedRequirementId = target.getAttribute("data-req-id") || "";
    render();
  }
  if (action === "product-close-requirement-drawer") {
    state.productSelectedRequirementId = "";
    render();
  }
  if (action === "product-update-req-status") {
    const reqId = target.getAttribute("data-req-id");
    const newStatus = target.getAttribute("data-status");
    if (reqId && newStatus) {
      productApi.updateRequirement(state.projectId, reqId, { status: newStatus }, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.requirements = (await productApi.listRequirements(state.projectId)).data;
        toast(`Requirement ${reqId} updated to ${newStatus}.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Update failed."));
    }
  }
  if (action === "product-delete-req") {
    const reqId = target.getAttribute("data-req-id");
    if (reqId) {
      productApi.deleteRequirement(state.projectId, reqId, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.requirements = (await productApi.listRequirements(state.projectId)).data;
        if (state.productSelectedRequirementId === reqId) state.productSelectedRequirementId = "";
        toast(`Requirement ${reqId} deleted.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Deletion failed."));
    }
  }
  if (action === "product-move-rank") {
    const featId = target.getAttribute("data-feat-id");
    const dir = target.getAttribute("data-dir");
    const feats = [...state.productFeatures].sort((a, b) => a.priorityRank - b.priorityRank);
    const idx = feats.findIndex((f) => f.id === featId);
    if (idx !== -1 && ((dir === "up" && idx > 0) || (dir === "down" && idx < feats.length - 1))) {
      const targetIdx = dir === "up" ? idx - 1 : idx + 1;
      const temp = feats[idx];
      feats[idx] = feats[targetIdx];
      feats[targetIdx] = temp;
      const orderedIds = feats.map((f) => f.id);
      productApi.reprioritizeFeatures(state.projectId, orderedIds, { idempotencyKey: createIdempotencyKey() }).then(async (result) => {
        state.productFeatures = result.data;
        toast(`Feature #${featId} moved ${dir}.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Re-ranking failed."));
    }
  }
  if (action === "product-reprioritize-auto") {
    const sorted = [...state.productFeatures].sort((a, b) => {
      const ratioA = a.businessValue / Math.max(a.effort, 1);
      const ratioB = b.businessValue / Math.max(b.effort, 1);
      return ratioB - ratioA;
    });
    const orderedIds = sorted.map((f) => f.id);
    productApi.reprioritizeFeatures(state.projectId, orderedIds, { idempotencyKey: createIdempotencyKey() }).then(async (result) => {
      state.productFeatures = result.data;
      toast("Features automatically ranked by Business Value / Effort ratio.");
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Auto-ranking failed."));
  }
  if (action === "product-modal") {
    state.productActiveModal = target.getAttribute("data-modal") || "";
    render();
  }
  if (action === "close-modal") {
    state.productActiveModal = "";
    render();
  }
  if (action === "product-feature-delete") {
    const featId = target.getAttribute("data-feat-id");
    if (featId) {
      productApi.deleteFeature(state.projectId, featId, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.productFeatures = (await productApi.listProductFeatures(state.projectId)).data;
        toast(`Feature ${featId} removed.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Feature deletion failed."));
    }
  }
  if (action === "product-delete-roadmap") {
    const roadId = target.getAttribute("data-roadmap-id");
    if (roadId) {
      productApi.deleteRoadmapItem(state.projectId, roadId, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.roadmapItems = (await productApi.listRoadmapItems(state.projectId)).data;
        toast(`Milestone ${roadId} removed.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Milestone deletion failed."));
    }
  }
  if (action === "product-mock") {
    const act = target.getAttribute("data-product-action") || "overview";
    productApi.runProductIntelligenceAction(state.projectId, act, { idempotencyKey: createIdempotencyKey() }).then(async (result) => {
      toast(`[Receipt ${result.data.receiptId}] ${result.data.details}. Status: ${result.data.status}`);
      render();
    }).catch((err) => {
      toast(err instanceof Error ? err.message : "Analysis run failed.");
    });
  }

  /* devops */
  if (action === "devops-tab") { state.devopsTab = target.getAttribute("data-tab") || "overview"; render(); }
  if (action === "devops-mock") {
    devopsApi.runDevOpsMock(state.projectId, target.getAttribute("data-devops-domain"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock ${result.data.domain} analysis completed. Executed actions: 0.`);
    });
  }

  /* context */
  if (action === "context-mock") {
    contextApi.runContextMock(state.projectId, target.getAttribute("data-context-action"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock ${result.data.action.replaceAll("_", " ")} completed. No backend store was contacted.`);
    });
  }

  /* decision dashboard (was src/phase12.js) */
  if (action === "dashboard-retry") loadDashboard();

  /* outputs */
  if (action === "generate-report") {
    outputsApi.generateReport(state.projectId, "final_decision_summary", { idempotencyKey: createIdempotencyKey() }).then((result)=>toast(`Queued mock receipt ${result.data.workflowId}. No report was generated.`));
  }
  if (action === "export-report") {
    outputsApi.exportReport(state.projectId, target.getAttribute("data-report-id"), "pdf", { idempotencyKey: createIdempotencyKey() }).then(()=>toast("Mock export receipt created. No binary or download URL exists."));
  }
  if (action === "publish-report") {
    outputsApi.publishReport(state.projectId, target.getAttribute("data-report-id"), { idempotencyKey: createIdempotencyKey() }).then(()=>toast("Mock publication receipt created. Nothing was published.")).catch((error)=>toast(error instanceof Error ? error.message : "Publication failed."));
  }
  if (action === "select-approval") {
    const approvalId = target.getAttribute("data-approval-id");
    outputsApi.getApproval(state.projectId, approvalId).then((result)=>{ state.approvalId = approvalId; state.approvalDetail = result.data; render(); });
  }
  if (action === "cancel-approval") {
    outputsApi.cancelApproval(state.projectId, target.getAttribute("data-approval-id"), { idempotencyKey: createIdempotencyKey() }).then(async (result)=>{
      state.approvals = (await outputsApi.listApprovals(state.projectId)).data; state.approvalDetail = result.data; toast("Approval request cancelled. No downstream action executed."); render();
    }).catch((error)=>toast(error instanceof Error ? error.message : "Cancellation failed."));
  }

  /* repository + inputs */
  if (action === "repo-detail") {
    const repositoryId = target.getAttribute("data-repository-id");
    Promise.all([
      workspaceApi.listRepositorySnapshots(repositoryId),
      workspaceApi.getRepositoryTree(repositoryId)
    ]).then(([snapshots, tree]) => {
      state.repositoryDetailId = repositoryId;
      state.repositorySnapshots = snapshots.data;
      state.repositoryTree = tree.data;
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Repository detail failed."));
  }
  if (action === "repo-sync") {
    const repositoryId = target.getAttribute("data-repository-id");
    workspaceApi.syncRepository(state.projectId, repositoryId).then(async () => {
      state.repositories = (await workspaceApi.listRepositories(state.projectId)).data;
      toast("Mock repository sync completed. No provider was contacted.");
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Sync failed."));
  }
  if (action === "advance-asset") {
    workspaceApi.advanceAssetDemo(state.projectId, target.getAttribute("data-asset-id")).then(async () => {
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
      toast("Advanced one explicit mock processing state.");
      render();
    });
  }
  if (action === "delete-asset") {
    workspaceApi.deleteAsset(state.projectId, target.getAttribute("data-asset-id")).then(async () => {
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
      toast("Input removed from the mock inventory.");
      render();
    });
  }

  /* integrations (was src/phase11.js) */
  if (["integration-connect", "integration-disconnect", "integration-health", "integration-sync"].includes(action)) {
    mutateIntegration(action.replace("integration-", ""), target.getAttribute("data-id") || "");
  }
  if (action === "integration-retry") loadIntegrations();
  if (action === "audit-detail") {
    phase11Api.getAuditEvent(state.projectId, target.getAttribute("data-id") || "").then((result) => {
      state.auditDetail = result.data;
      render();
    }).catch((error) => { state.integrationError = error instanceof Error ? error.message : "Action failed"; render(); });
  }
  if (action === "audit-close") { state.auditDetail = null; render(); }

  /* Chat & Work owns its own actions */
  if (work.handleWorkAction(action, target)) return;
});

/**
 * @param {string} action
 * @param {string} id
 */
async function mutateIntegration(action, id) {
  const options = { idempotencyKey: createPhase11IdempotencyKey() };
  const method = {
    connect: "connectIntegration",
    disconnect: "disconnectIntegration",
    health: "checkIntegrationHealth",
    sync: "syncIntegration"
  }[action];
  try {
    state.integrationReceipt = (await phase11Api[method](state.projectId, id, options)).data;
  } catch (error) {
    state.integrationError = error instanceof Error ? error.message : "Action failed";
  }
  render();
}

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target.id === "workspace-switcher") await hydrate(target.value);
  if (target.id === "project-switcher") {
    state.projectId = target.value;
    try {
      await hydrateProject(target.value);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to load the project.");
    }
    navigate(`/app/projects/${target.value}/overview`);
    render();
  }
  if (target.id === "project-search" || target.id === "project-status") filterProjects();
  if (target.id === "product-status-filter") {
    state.productFilterStatus = target.value;
    render();
  }
  if (target.id === "product-priority-filter") {
    state.productFilterPriority = target.value;
    render();
  }
  if (target.id === "product-provenance-filter") {
    state.productFilterProvenance = target.value;
    render();
  }
  if (target.getAttribute("data-action") === "product-update-roadmap-status") {
    const roadId = target.getAttribute("data-roadmap-id");
    const newStatus = target.value;
    if (roadId && newStatus) {
      productApi.updateRoadmapItem(state.projectId, roadId, { status: newStatus }, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.roadmapItems = (await productApi.listRoadmapItems(state.projectId)).data;
        toast(`Milestone ${roadId} updated to ${newStatus}.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Update failed."));
    }
  }
  if (target.id === "asset-status-filter") {
    const filtered = state.assets.filter((asset) => !target.value || asset.processingStatus === target.value);
    const results = document.querySelector("#asset-results");
    if (results) results.innerHTML = assetTable(filtered, state.projectId);
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.id === "project-search") filterProjects();
  if (target instanceof HTMLInputElement && target.id === "product-search-input") {
    state.productSearchQuery = target.value;
    render();
  }
  /* the composer is uncontrolled between renders, so mirror it into state
     without re-rendering on every keystroke */
  if (target instanceof HTMLInputElement && target.id === "work-input") {
    state.workComposer = target.value;
  }
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

  /* Chat & Work composer */
  if (form.id === "work-composer-form") {
    event.preventDefault();
    await work.sendWorkMessage();
    work.focusWorkInput();
    return;
  }

  /* integrations filters (was src/phase11.js) */
  if (form.id === "integration-activity-filter" || form.id === "integration-audit-filter") {
    event.preventDefault();
    await loadIntegrations(Object.fromEntries(new FormData(form)));
    return;
  }

  event.preventDefault();

  /* Product Intelligence forms */
  if (form.id === "product-create-requirement-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      await productApi.createRequirement(
        state.projectId,
        {
          title: String(raw.title || ""),
          type: /** @type {any} */ (raw.type || "functional"),
          priority: /** @type {any} */ (raw.priority || "high"),
          rationale: String(raw.rationale || ""),
          evidence: raw.evidence ? [String(raw.evidence)] : [],
          architectureImpact: String(raw.architectureImpact || "")
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.requirements = (await productApi.listRequirements(state.projectId)).data;
      state.productActiveModal = "";
      toast("Requirement created successfully.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to create requirement.");
    }
    return;
  }
  if (form.id === "product-import-requirements-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      const content = String(raw.content || "").trim();
      let items = [];
      if (content.startsWith("[") || content.startsWith("{")) {
        const parsed = JSON.parse(content);
        items = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        items = content.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => ({
          title: line,
          type: "functional",
          priority: "medium",
          provenance: "confirmed"
        }));
      }
      const res = await productApi.importRequirements(state.projectId, items, { idempotencyKey: createIdempotencyKey() });
      state.requirements = (await productApi.listRequirements(state.projectId)).data;
      state.productActiveModal = "";
      toast(`Successfully imported ${res.meta?.importedCount || items.length} requirements.`);
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to import requirements.");
    }
    return;
  }
  if (form.id === "product-create-feature-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      await productApi.createFeature(
        state.projectId,
        {
          title: String(raw.title || ""),
          businessValue: Number(raw.businessValue || 5),
          impact: Number(raw.impact || 5),
          effort: Number(raw.effort || 5),
          risk: Number(raw.risk || 5),
          rationale: String(raw.rationale || "")
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.productFeatures = (await productApi.listProductFeatures(state.projectId)).data;
      state.productActiveModal = "";
      toast("Candidate feature added.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to create feature.");
    }
    return;
  }
  if (form.id === "product-create-roadmap-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      const deps = String(raw.dependencies || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await productApi.createRoadmapItem(
        state.projectId,
        {
          milestone: String(raw.milestone || ""),
          release: String(raw.release || "R-Next"),
          status: /** @type {any} */ (raw.status || "planned"),
          startDate: String(raw.startDate || ""),
          endDate: String(raw.endDate || ""),
          dependencies: deps
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.roadmapItems = (await productApi.listRoadmapItems(state.projectId)).data;
      state.productActiveModal = "";
      toast("Milestone scheduled on roadmap.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to create milestone.");
    }
    return;
  }
  if (form.id === "product-update-strategy-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      const principles = String(raw.principles || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const risks = String(raw.risks || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const result = await productApi.saveProductStrategy(
        state.projectId,
        {
          objective: String(raw.objective || ""),
          principles,
          risks
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.productStrategy = result.data;
      state.productActiveModal = "";
      toast("Product strategy updated.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to update strategy.");
    }
    return;
  }

  if (form.id === "approval-decision-form") {
    const values = new FormData(form);
    const decision = event.submitter instanceof HTMLButtonElement ? event.submitter.value : "";
    try {
      const result = await outputsApi.decideApproval(state.projectId, String(values.get("approvalId")), decision, String(values.get("rationale") || ""), { idempotencyKey: createIdempotencyKey() });
      state.approvals = (await outputsApi.listApprovals(state.projectId)).data;
      state.reports = (await outputsApi.listReports(state.projectId)).data;
      state.approvalDetail = result.data;
      toast(`${result.data.status} recorded. Downstream executed: No.`);
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Approval decision failed."); }
    return;
  }
  if (form.id === "approval-comment-form") {
    const values = new FormData(form);
    try {
      await outputsApi.addApprovalComment(state.projectId, String(values.get("approvalId")), String(values.get("text") || ""), { idempotencyKey: createIdempotencyKey() });
      state.approvalDetail = (await outputsApi.getApproval(state.projectId, String(values.get("approvalId")))).data;
      toast("Mock review comment added.");
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Comment failed."); }
    return;
  }
  if (form.id === "memory-search-form") {
    const query = String(new FormData(form).get("query") || "").trim();
    state.contextQuery = query;
    state.memoryResults = (await contextApi.searchMemory(state.projectId, query)).data;
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
      const result = await workspaceApi.createProject(values, { idempotencyKey: createIdempotencyKey() });
      await hydrate(values.workspaceId);
      toast("Project created in the mock adapter.");
      navigate(`/app/projects/${result.data.id}/overview`);
      render();
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
      await workspaceApi.updateProject(id, values);
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
        await workspaceApi.login(values);
        /* signing in lands on Chat, not the Work dashboard */
        location.href = `${location.pathname}#${routes.chat}`;
        await hydrate();
      } else if (kind === "register") {
        await workspaceApi.register(values);
        if (message) message.innerHTML = `<div class="alert success">Check your email to continue. This is a mock response.</div>`;
      } else {
        await workspaceApi.recover(values.email);
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
      await workspaceApi.connectRepository(state.projectId, values, { idempotencyKey: createIdempotencyKey() });
      state.repositories = (await workspaceApi.listRepositories(state.projectId)).data;
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
      const initiated = await workspaceApi.initiateUpload(state.projectId, { name: file.name, inputType, byteSize: file.size, mimeType: file.type, sourceType: "upload" }, { idempotencyKey: createIdempotencyKey() });
      await workspaceApi.completeUpload(state.projectId, initiated.data.assetId);
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
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
      if (form.id === "text-input-form") await workspaceApi.addTextInput(state.projectId, values);
      else await workspaceApi.addUrlInput(state.projectId, values);
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
      toast(form.id === "text-input-form" ? "Text context added to the mock inventory." : "URL accepted by the mock adapter.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Input failed.")}</div>`;
    }
  }
  if (form.id === "new-conversation-form") {
    const values = Object.fromEntries(new FormData(form));
    try {
      const created = await workspaceApi.createConversation(state.projectId, values, { idempotencyKey: createIdempotencyKey() });
      state.conversations = (await workspaceApi.listConversations(state.projectId)).data;
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
      await workspaceApi.postMessage(state.projectId, state.conversationId, input, { idempotencyKey: createIdempotencyKey() });
      state.messages = (await workspaceApi.listMessages(state.projectId, state.conversationId)).data;
      state.conversations = (await workspaceApi.listConversations(state.projectId)).data;
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
      const created = await workspaceApi.createAnalysisRequest(state.projectId, input, { idempotencyKey: createIdempotencyKey() });
      state.analysisRequests = (await workspaceApi.listAnalysisRequests(state.projectId)).data;
      if (message) message.innerHTML = `<div class="alert success">Mock receipt created: ${escapeHtml(created.data.id)} · workflow ${escapeHtml(created.data.workflowId)} · status ${escapeHtml(created.data.status)}. No execution started.</div>`;
      toast("Mock analysis receipt created.");
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Request failed.")}</div>`;
    }
  }
});

/* ── navigation ───────────────────────────────────────────────────── */

/* ── Chat & Work ─────────────────────────────────────────────────── */


/** Loads whatever the incoming route needs beyond core hydration. */
function loadRouteData() {
  const path = currentPath();
  if (path === routes.dashboard) loadDashboard();
  if (path === routes.chat || path.startsWith(`${routes.chat}/`)) work.loadWork();
  if (isIntegrationsRoute(path)) loadIntegrations();
}

function onRouteChange() {
  render();
  loadRouteData();
}

window.addEventListener("hashchange", onRouteChange);
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    toast("Global search contract is not defined yet.");
  }
});

initTheme();
render();
if (!currentPath().startsWith("/auth/")) {
  hydrate().then(loadRouteData);
} else {
  loadRouteData();
}