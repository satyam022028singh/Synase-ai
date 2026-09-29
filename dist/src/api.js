// @ts-check

export class ApiError extends Error {
  constructor(code, message, status = 500, details = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = `req_${Math.random().toString(36).slice(2, 10)}`;
  }
}

const sleep = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

const db = {
  user: {
    id: "usr_satyam",
    email: "satyam@example.com",
    displayName: "Satyam Singh",
    globalRole: "member"
  },
  workspaces: [
    {
      id: "ws_synase",
      name: "SYNASE Core",
      slug: "synase-core",
      description: "Product and engineering decision intelligence.",
      role: "owner",
      status: "active"
    },
    {
      id: "ws_research",
      name: "Research Lab",
      slug: "research-lab",
      description: "Experiments and reference architecture.",
      role: "member",
      status: "active"
    }
  ],
  projects: [
    {
      id: "prj_platform",
      workspaceId: "ws_synase",
      name: "SYNASE Platform",
      slug: "synase-platform",
      description: "Unified product and DevOps intelligence workspace.",
      goal: "Turn project context into evidence-backed engineering decisions.",
      lifecycleStatus: "active",
      role: "owner",
      updatedAt: "2026-09-29T08:20:00Z"
    },
    {
      id: "prj_mcp",
      workspaceId: "ws_synase",
      name: "MCP V2 Runtime",
      slug: "mcp-v2-runtime",
      description: "Observable capability discovery and execution.",
      goal: "Provide traceable orchestration across models, agents, and tools.",
      lifecycleStatus: "active",
      role: "developer",
      updatedAt: "2026-09-28T15:14:00Z"
    },
    {
      id: "prj_design",
      workspaceId: "ws_synase",
      name: "Design System",
      slug: "design-system",
      description: "Accessible engineering-console interface foundations.",
      goal: "Keep the product dense, clear, and consistent.",
      lifecycleStatus: "paused",
      role: "product_manager",
      updatedAt: "2026-09-26T11:02:00Z"
    },
    {
      id: "prj_eval",
      workspaceId: "ws_research",
      name: "Model Evaluation",
      slug: "model-evaluation",
      description: "Confidence and validation research.",
      goal: "Compare decision quality with repeatable evidence.",
      lifecycleStatus: "draft",
      role: "reviewer",
      updatedAt: "2026-09-25T10:40:00Z"
    }
  ],
  workspaceMembers: [
    { userId: "usr_satyam", name: "Satyam Singh", email: "satyam@example.com", role: "owner", joinedAt: "2026-04-10" },
    { userId: "usr_maya", name: "Maya Chen", email: "maya@example.com", role: "admin", joinedAt: "2026-05-14" },
    { userId: "usr_jordan", name: "Jordan Bell", email: "jordan@example.com", role: "member", joinedAt: "2026-07-02" },
    { userId: "usr_lee", name: "Lee Park", email: "lee@example.com", role: "viewer", joinedAt: "2026-08-21" }
  ],
  activity: [
    { id: "act_1", actor: "Maya Chen", action: "updated", target: "API contract foundation", occurredAt: "18 min ago" },
    { id: "act_2", actor: "Satyam Singh", action: "created", target: "Phase 2 implementation plan", occurredAt: "1 hr ago" },
    { id: "act_3", actor: "Jordan Bell", action: "reviewed", target: "Design system tokens", occurredAt: "Yesterday" },
    { id: "act_4", actor: "System", action: "completed", target: "Mock contract validation", occurredAt: "Yesterday" }
  ],
  repositories: [
    {
      id: "repo_core",
      projectId: "prj_platform",
      provider: "github",
      name: "synase-platform",
      fullName: "synase-ai/synase-platform",
      defaultBranch: "main",
      visibility: "private",
      connectionStatus: "connected",
      lastSyncedAt: "2026-09-29T07:42:00Z"
    },
    {
      id: "repo_contracts",
      projectId: "prj_platform",
      provider: "github",
      name: "synase-contracts",
      fullName: "synase-ai/synase-contracts",
      defaultBranch: "main",
      visibility: "private",
      connectionStatus: "pending"
    },
    {
      id: "repo_runtime",
      projectId: "prj_mcp",
      provider: "gitlab",
      name: "mcp-runtime",
      fullName: "synase/mcp-runtime",
      defaultBranch: "develop",
      visibility: "internal",
      connectionStatus: "connected",
      lastSyncedAt: "2026-09-28T18:02:00Z"
    }
  ],
  snapshots: [
    { id: "snap_1", repositoryId: "repo_core", commitSha: "7e4ab91", branch: "main", fileCount: 842, totalBytes: 12820480, scanStatus: "completed", createdAt: "2026-09-29T07:42:00Z" },
    { id: "snap_2", repositoryId: "repo_core", commitSha: "18f2d02", branch: "main", fileCount: 836, totalBytes: 12681210, scanStatus: "completed", createdAt: "2026-09-27T16:10:00Z" }
  ],
  assets: [
    { id: "asset_prd", projectId: "prj_platform", name: "SYNASE Product Requirements.pdf", inputType: "pdf", sourceType: "upload", mimeType: "application/pdf", byteSize: 2483000, processingStatus: "ready", securityScanStatus: "clean", extractionStatus: "completed", createdAt: "2026-09-29T06:10:00Z" },
    { id: "asset_arch", projectId: "prj_platform", name: "Architecture v3.png", inputType: "image", sourceType: "drag_drop", mimeType: "image/png", byteSize: 948200, processingStatus: "indexing", securityScanStatus: "clean", extractionStatus: "completed", createdAt: "2026-09-29T07:28:00Z" },
    { id: "asset_logs", projectId: "prj_platform", name: "deployment-errors.log", inputType: "log", sourceType: "upload", mimeType: "text/plain", byteSize: 183420, processingStatus: "warning", securityScanStatus: "warning", extractionStatus: "partial", createdAt: "2026-09-28T20:02:00Z" },
    { id: "asset_blocked", projectId: "prj_platform", name: "legacy-source.zip", inputType: "code_archive", sourceType: "upload", mimeType: "application/zip", byteSize: 18233200, processingStatus: "failed", securityScanStatus: "blocked", extractionStatus: "not_started", createdAt: "2026-09-28T11:44:00Z" }
  ],
  conversations: [
    { id: "conv_arch", projectId: "prj_platform", title: "Architecture review", status: "active", updatedAt: "2026-09-29T08:42:00Z" },
    { id: "conv_release", projectId: "prj_platform", title: "Release readiness", status: "active", updatedAt: "2026-09-28T14:18:00Z" },
    { id: "conv_mcp", projectId: "prj_mcp", title: "Routing evaluation", status: "active", updatedAt: "2026-09-28T17:01:00Z" }
  ],
  messages: [
    { id: "msg_1", conversationId: "conv_arch", role: "user", text: "Review the architecture implications of the current product requirements.", status: "completed", assetIds: ["asset_prd"], repositoryIds: ["repo_core"], createdAt: "2026-09-29T08:40:00Z" },
    { id: "msg_2", conversationId: "conv_arch", role: "system", text: "Mock adapter receipt: context references were accepted. No AI analysis or workflow execution occurred.", status: "completed", assetIds: [], repositoryIds: [], createdAt: "2026-09-29T08:42:00Z", mock: true },
    { id: "msg_3", conversationId: "conv_release", role: "user", text: "Identify release risks using the deployment logs.", status: "completed", assetIds: ["asset_logs"], repositoryIds: [], createdAt: "2026-09-28T14:12:00Z" }
  ],
  analysisRequests: [
    { id: "req_arch", projectId: "prj_platform", conversationId: "conv_arch", requestText: "Review architecture implications and identify decisions that require approval.", requestType: "architecture_review", priority: "high", executionStrategy: "hybrid", assetIds: ["asset_prd"], repositoryIds: ["repo_core"], status: "queued", workflowId: "wf_mock_arch", traceId: "trace_mock_arch", createdAt: "2026-09-29T08:43:00Z", mock: true },
    { id: "req_risk", projectId: "prj_platform", conversationId: "conv_release", requestText: "Assess release risks using the deployment logs.", requestType: "risk_assessment", priority: "normal", executionStrategy: "sequential", assetIds: ["asset_logs"], repositoryIds: [], status: "received", workflowId: "wf_mock_risk", traceId: "trace_mock_risk", createdAt: "2026-09-28T14:19:00Z", mock: true }
  ],
  workflows: [
    { id: "wf_mock_arch", projectId: "prj_platform", requestId: "req_arch", executionStrategy: "hybrid", status: "running", progressPercent: 42, currentStage: "context_retrieval", createdAt: "2026-09-29T08:43:00Z", updatedAt: "2026-09-29T08:46:00Z", mock: true },
    { id: "wf_mock_risk", projectId: "prj_platform", requestId: "req_risk", executionStrategy: "sequential", status: "waiting", progressPercent: 18, currentStage: "capability_mapping", createdAt: "2026-09-28T14:19:00Z", updatedAt: "2026-09-28T14:22:00Z", mock: true }
  ],
  workflowTasks: [
    { id: "task_1", workflowId: "wf_mock_arch", name: "Detect intent", layer: "orchestrator", status: "completed", progressPercent: 100, sequence: 1 },
    { id: "task_2", workflowId: "wf_mock_arch", name: "Retrieve project context", layer: "orchestrator", status: "running", progressPercent: 60, sequence: 2 },
    { id: "task_3", workflowId: "wf_mock_arch", name: "Map capabilities", layer: "mcp", status: "ready", progressPercent: 0, sequence: 3 },
    { id: "task_4", workflowId: "wf_mock_arch", name: "Generate decision report", layer: "reporting", status: "pending", progressPercent: 0, sequence: 4 },
    { id: "task_5", workflowId: "wf_mock_risk", name: "Detect intent", layer: "orchestrator", status: "completed", progressPercent: 100, sequence: 1 },
    { id: "task_6", workflowId: "wf_mock_risk", name: "Await repository context", layer: "orchestrator", status: "waiting", progressPercent: 20, sequence: 2 }
  ],
  workflowEvents: [
    { eventId: "evt_1", eventType: "workflow.created", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:43:00Z", sequence: 1, schemaVersion: "1", payload: { status: "created", progressPercent: 0 } },
    { eventId: "evt_2", eventType: "workflow.stage.started", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:44:00Z", sequence: 2, schemaVersion: "1", payload: { stage: "intent_detection", progressPercent: 10 } },
    { eventId: "evt_3", eventType: "workflow.stage.completed", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:45:00Z", sequence: 3, schemaVersion: "1", payload: { stage: "intent_detection", progressPercent: 25 } },
    { eventId: "evt_4", eventType: "workflow.stage.started", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:46:00Z", sequence: 4, schemaVersion: "1", payload: { stage: "context_retrieval", progressPercent: 42 } }
  ],
  workflowScripts: {
    wf_mock_arch: [
      { eventId: "demo_evt_5", eventType: "workflow.stage.completed", workflowId: "wf_mock_arch", sequence: 5, schemaVersion: "1", payload: { stage: "context_retrieval", progressPercent: 55 } },
      { eventId: "demo_evt_6", eventType: "task.started", workflowId: "wf_mock_arch", sequence: 6, schemaVersion: "1", payload: { taskId: "task_3", stage: "capability_mapping", progressPercent: 64 } },
      { eventId: "demo_evt_7", eventType: "validation.completed", workflowId: "wf_mock_arch", sequence: 7, schemaVersion: "1", payload: { stage: "validation", progressPercent: 82 } },
      { eventId: "demo_evt_8", eventType: "workflow.completed", workflowId: "wf_mock_arch", sequence: 8, schemaVersion: "1", payload: { status: "completed", progressPercent: 100 } }
    ]
  },
  mcpRequests: [
    { id: "mcp_req_arch", workflowId: "wf_mock_arch", detectedLayer: "both", status: "completed", payloadFormat: "toon", confidence: 0.87, validationStatus: "passed", createdAt: "2026-09-29T08:46:00Z", mock: true },
    { id: "mcp_req_risk", workflowId: "wf_mock_risk", detectedLayer: "devops", status: "processing", payloadFormat: "reference", confidence: 0.62, validationStatus: "warning", createdAt: "2026-09-28T14:22:00Z", mock: true },
    { id: "mcp_req_cache", workflowId: "wf_mock_arch", detectedLayer: "product", status: "cached", payloadFormat: "json", confidence: 0.91, validationStatus: "passed", createdAt: "2026-09-27T10:18:00Z", mock: true }
  ],
  mcpTrace: [
    { id: "trace_1", requestId: "mcp_req_arch", chamber: "request_gateway", sequence: 1, status: "completed", durationMs: 18, summary: "Request accepted and correlated" },
    { id: "trace_2", requestId: "mcp_req_arch", chamber: "context_manager", sequence: 2, status: "completed", durationMs: 142, summary: "Selected 8 project context references" },
    { id: "trace_3", requestId: "mcp_req_arch", chamber: "task_layer_intelligence", sequence: 3, status: "completed", durationMs: 36, summary: "Detected product + DevOps scope" },
    { id: "trace_4", requestId: "mcp_req_arch", chamber: "chamber_router", sequence: 4, status: "completed", durationMs: 24, summary: "Routed to architecture-review capability" },
    { id: "trace_5", requestId: "mcp_req_arch", chamber: "tool_model_execution", sequence: 5, status: "completed", durationMs: 1260, summary: "Mock execution metadata only; no model or tool ran" },
    { id: "trace_6", requestId: "mcp_req_arch", chamber: "validation", sequence: 6, status: "completed", durationMs: 84, summary: "Validation passed with warnings resolved" },
    { id: "trace_7", requestId: "mcp_req_arch", chamber: "response_aggregation", sequence: 7, status: "completed", durationMs: 52, summary: "Structured response aggregation completed" }
  ],
  mcpModels: [
    { id: "model_claude", provider: "anthropic", name: "Claude Sonnet", contextWindow: 200000, availabilityStatus: "active" },
    { id: "model_gpt", provider: "openai", name: "GPT reasoning", contextWindow: 128000, availabilityStatus: "active" },
    { id: "model_local", provider: "local", name: "Local evaluator", contextWindow: 32000, availabilityStatus: "disabled" }
  ],
  mcpTools: [
    { id: "tool_repo", name: "Repository Inspector", type: "github", availabilityStatus: "active", capabilities: ["repository_review", "code_search"] },
    { id: "tool_logs", name: "Log Analyzer", type: "logs", availabilityStatus: "active", capabilities: ["risk_analysis", "incident_review"] },
    { id: "tool_deploy", name: "Deployment Planner", type: "cicd", availabilityStatus: "disabled", capabilities: ["deployment_plan"] }
  ],
  mcpServers: [
    { id: "server_internal", name: "SYNASE Internal MCP", transportType: "internal", status: "active", healthStatus: "healthy", toolCount: 8 },
    { id: "server_repo", name: "Repository MCP", transportType: "https", status: "active", healthStatus: "degraded", toolCount: 4 },
    { id: "server_docs", name: "Documentation MCP", transportType: "sse", status: "discovered", healthStatus: "unknown", toolCount: 0 }
  ],
  mcpDirectories: [
    { id: "dir_internal", name: "Internal Registry", type: "internal", status: "active", healthStatus: "healthy" },
    { id: "dir_smithery", name: "Smithery", type: "smithery", status: "disabled", healthStatus: "unknown" }
  ],
  discoveryRuns: []
};

function page(data) {
  return { data, meta: { page: 1, pageSize: 25, total: data.length } };
}

export const mockApi = {
  async login({ email, password }) {
    await sleep(450);
    if (!email || !password) throw new ApiError("VALIDATION_ERROR", "Email and password are required.", 422);
    if (email.includes("blocked")) throw new ApiError("ACCOUNT_SUSPENDED", "This account is suspended.", 403);
    return { data: { user: db.user, authenticated: true } };
  },
  async register(input) {
    await sleep(500);
    if (!input.name || !input.email || !input.password) throw new ApiError("VALIDATION_ERROR", "Complete all required fields.", 422);
    return { data: { status: "verification_required" } };
  },
  async recover(email) {
    await sleep(450);
    if (!email) throw new ApiError("VALIDATION_ERROR", "Enter your email address.", 422);
    return { data: { accepted: true } };
  },
  async getMe() {
    await sleep();
    return { data: db.user };
  },
  async listWorkspaces() {
    await sleep();
    return page(db.workspaces);
  },
  async getWorkspace(id) {
    await sleep();
    const item = db.workspaces.find((workspace) => workspace.id === id);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", "Workspace was not found.", 404);
    return { data: item };
  },
  async listWorkspaceMembers() {
    await sleep();
    return page(db.workspaceMembers);
  },
  async inviteWorkspaceMember({ email, role }) {
    await sleep(350);
    if (!email || !role) throw new ApiError("VALIDATION_ERROR", "Email and role are required.", 422);
    return { data: { id: `invite_${Date.now()}`, email, role, status: "pending" } };
  },
  async listProjects(workspaceId) {
    await sleep();
    return page(db.projects.filter((project) => project.workspaceId === workspaceId));
  },
  async getProject(id) {
    await sleep();
    const item = db.projects.find((project) => project.id === id);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", "Project was not found.", 404);
    return { data: item };
  },
  async createProject(input, { idempotencyKey } = {}) {
    await sleep(520);
    if (!input.workspaceId || !input.name?.trim()) throw new ApiError("VALIDATION_ERROR", "Workspace and project name are required.", 422);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const duplicate = db.projects.some((project) => project.workspaceId === input.workspaceId && project.name.toLowerCase() === input.name.trim().toLowerCase());
    if (duplicate) throw new ApiError("RESOURCE_CONFLICT", "A project with this name already exists.", 409);
    const project = {
      id: `prj_${Math.random().toString(36).slice(2, 9)}`,
      workspaceId: input.workspaceId,
      name: input.name.trim(),
      slug: input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: input.description?.trim() || "",
      goal: input.goal?.trim() || "",
      lifecycleStatus: "draft",
      role: "owner",
      updatedAt: new Date().toISOString()
    };
    db.projects.unshift(project);
    return { data: project };
  },
  async updateProject(id, patch) {
    await sleep(420);
    const project = db.projects.find((item) => item.id === id);
    if (!project) throw new ApiError("RESOURCE_NOT_FOUND", "Project was not found.", 404);
    Object.assign(project, patch, { updatedAt: new Date().toISOString() });
    return { data: project };
  },
  async getDashboard(workspaceId) {
    await sleep(300);
    const projects = db.projects.filter((project) => project.workspaceId === workspaceId);
    return {
      data: {
        metrics: [
          { label: "Active projects", value: String(projects.filter((p) => p.lifecycleStatus === "active").length), trend: "Workspace scope", tone: "positive" },
          { label: "Contract coverage", value: "72%", trend: "Phases 0–2", tone: "neutral" },
          { label: "Open decisions", value: "11", trend: "4 critical", tone: "warning" },
          { label: "Approval queue", value: "—", trend: "Not available in Phase 2", tone: "neutral" }
        ],
        projects,
        activity: db.activity
      }
    };
  },
  async listRepositories(projectId) {
    await sleep();
    return page(db.repositories.filter((repository) => repository.projectId === projectId));
  },
  async connectRepository(projectId, input, { idempotencyKey } = {}) {
    await sleep(460);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.provider || !input.fullName?.trim()) throw new ApiError("VALIDATION_ERROR", "Provider and repository path are required.", 422);
    const repository = {
      id: `repo_${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      provider: input.provider,
      name: input.fullName.trim().split("/").pop(),
      fullName: input.fullName.trim(),
      defaultBranch: input.defaultBranch?.trim() || "main",
      visibility: "unknown",
      connectionStatus: "pending"
    };
    db.repositories.unshift(repository);
    return { data: repository };
  },
  async syncRepository(projectId, repositoryId) {
    await sleep(420);
    const repository = db.repositories.find((item) => item.projectId === projectId && item.id === repositoryId);
    if (!repository) throw new ApiError("RESOURCE_NOT_FOUND", "Repository was not found.", 404);
    if (repository.connectionStatus !== "connected") throw new ApiError("RESOURCE_CONFLICT", "Only connected repositories can be synchronized.", 409);
    repository.lastSyncedAt = new Date().toISOString();
    return { data: { repositoryId, status: "completed", demo: true, completedAt: repository.lastSyncedAt } };
  },
  async listRepositorySnapshots(repositoryId) {
    await sleep();
    return page(db.snapshots.filter((snapshot) => snapshot.repositoryId === repositoryId));
  },
  async getRepositoryTree(repositoryId) {
    await sleep();
    if (!db.repositories.some((item) => item.id === repositoryId)) throw new ApiError("RESOURCE_NOT_FOUND", "Repository was not found.", 404);
    return { data: [
      { path: "src", type: "directory" },
      { path: "src/api", type: "directory" },
      { path: "src/components", type: "directory" },
      { path: "src/app.tsx", type: "file", byteSize: 8240 },
      { path: "README.md", type: "file", byteSize: 4102 }
    ] };
  },
  async listAssets(projectId) {
    await sleep();
    return page(db.assets.filter((asset) => asset.projectId === projectId && asset.processingStatus !== "deleted"));
  },
  async initiateUpload(projectId, input, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.name || !input.inputType) throw new ApiError("VALIDATION_ERROR", "File name and input type are required.", 422);
    if (input.byteSize > 50 * 1024 * 1024) throw new ApiError("FILE_TOO_LARGE", "The mock project limit is 50 MB.", 413);
    const assetId = `asset_${Math.random().toString(36).slice(2, 9)}`;
    db.assets.unshift({
      id: assetId,
      projectId,
      name: input.name,
      inputType: input.inputType,
      sourceType: input.sourceType || "upload",
      mimeType: input.mimeType || "application/octet-stream",
      byteSize: input.byteSize || 0,
      processingStatus: "received",
      securityScanStatus: "pending",
      extractionStatus: "not_started",
      createdAt: new Date().toISOString()
    });
    return { data: { assetId, upload: { method: "PUT", url: `mock-upload://${assetId}`, expiresAt: new Date(Date.now() + 900000).toISOString(), headers: {} } } };
  },
  async completeUpload(projectId, assetId) {
    await sleep(320);
    const asset = db.assets.find((item) => item.projectId === projectId && item.id === assetId);
    if (!asset) throw new ApiError("RESOURCE_NOT_FOUND", "Asset was not found.", 404);
    return { data: { assetId, processingStatus: asset.processingStatus, demo: true } };
  },
  async addTextInput(projectId, input) {
    await sleep(320);
    if (!input.text?.trim()) throw new ApiError("VALIDATION_ERROR", "Text content is required.", 422);
    const asset = { id: `asset_${Math.random().toString(36).slice(2, 9)}`, projectId, name: input.title?.trim() || "Pasted context", inputType: "text", sourceType: "paste", mimeType: "text/plain", byteSize: input.text.length, processingStatus: "ready", securityScanStatus: "clean", extractionStatus: "completed", createdAt: new Date().toISOString() };
    db.assets.unshift(asset);
    return { data: asset };
  },
  async addUrlInput(projectId, input) {
    await sleep(360);
    try { new URL(input.url); } catch { throw new ApiError("VALIDATION_ERROR", "Enter a valid URL.", 422); }
    const asset = { id: `asset_${Math.random().toString(36).slice(2, 9)}`, projectId, name: input.url, inputType: "url", sourceType: "url", processingStatus: "received", securityScanStatus: "pending", extractionStatus: "not_started", createdAt: new Date().toISOString() };
    db.assets.unshift(asset);
    return { data: asset };
  },
  async advanceAssetDemo(projectId, assetId) {
    await sleep(260);
    const asset = db.assets.find((item) => item.projectId === projectId && item.id === assetId);
    if (!asset) throw new ApiError("RESOURCE_NOT_FOUND", "Asset was not found.", 404);
    const next = { received: "scanning", scanning: "extracting", extracting: "indexing", indexing: "ready" };
    asset.processingStatus = next[asset.processingStatus] || asset.processingStatus;
    if (asset.processingStatus === "extracting") asset.securityScanStatus = "clean";
    if (asset.processingStatus === "indexing") asset.extractionStatus = "completed";
    return { data: { ...asset, demo: true } };
  },
  async deleteAsset(projectId, assetId) {
    await sleep(260);
    const asset = db.assets.find((item) => item.projectId === projectId && item.id === assetId);
    if (!asset) throw new ApiError("RESOURCE_NOT_FOUND", "Asset was not found.", 404);
    asset.processingStatus = "deleted";
    return { data: { assetId, status: "deleted" } };
  },
  async listConversations(projectId) {
    await sleep();
    return page(db.conversations.filter((session) => session.projectId === projectId && session.status !== "deleted"));
  },
  async createConversation(projectId, input, { idempotencyKey } = {}) {
    await sleep(340);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const session = { id: `conv_${Math.random().toString(36).slice(2, 9)}`, projectId, title: input.title?.trim() || "New conversation", status: "active", updatedAt: new Date().toISOString() };
    db.conversations.unshift(session);
    return { data: session };
  },
  async listMessages(projectId, conversationId) {
    await sleep();
    const session = db.conversations.find((item) => item.projectId === projectId && item.id === conversationId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Conversation was not found.", 404);
    return page(db.messages.filter((message) => message.conversationId === conversationId && message.status !== "deleted"));
  },
  async postMessage(projectId, conversationId, input, { idempotencyKey } = {}) {
    await sleep(420);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.text?.trim()) throw new ApiError("VALIDATION_ERROR", "Message text is required.", 422);
    const session = db.conversations.find((item) => item.projectId === projectId && item.id === conversationId);
    if (!session || session.status !== "active") throw new ApiError("RESOURCE_CONFLICT", "An active conversation is required.", 409);
    const message = { id: `msg_${Math.random().toString(36).slice(2, 9)}`, conversationId, role: "user", text: input.text.trim(), status: "submitted", assetIds: input.assetIds || [], repositoryIds: input.repositoryIds || [], createdAt: new Date().toISOString() };
    db.messages.push(message);
    db.messages.push({ id: `msg_${Math.random().toString(36).slice(2, 9)}`, conversationId, role: "system", text: "Mock adapter receipt: message accepted. No AI response or workflow execution occurred.", status: "completed", assetIds: [], repositoryIds: [], createdAt: new Date().toISOString(), mock: true });
    session.updatedAt = new Date().toISOString();
    return { data: message };
  },
  async listAnalysisRequests(projectId) {
    await sleep();
    return page(db.analysisRequests.filter((request) => request.projectId === projectId));
  },
  async createAnalysisRequest(projectId, input, { idempotencyKey } = {}) {
    await sleep(480);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.requestText?.trim() || !input.requestType) throw new ApiError("VALIDATION_ERROR", "Request text and request type are required.", 422);
    const ownedAssets = new Set(db.assets.filter((item) => item.projectId === projectId).map((item) => item.id));
    const ownedRepositories = new Set(db.repositories.filter((item) => item.projectId === projectId).map((item) => item.id));
    if ((input.assetIds || []).some((id) => !ownedAssets.has(id)) || (input.repositoryIds || []).some((id) => !ownedRepositories.has(id))) {
      throw new ApiError("INVALID_CONTEXT_REFERENCE", "All context references must belong to the project.", 422);
    }
    const request = {
      id: `req_${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      conversationId: input.conversationId || undefined,
      requestText: input.requestText.trim(),
      requestType: input.requestType,
      priority: input.priority || "normal",
      executionStrategy: input.executionStrategy || "hybrid",
      assetIds: input.assetIds || [],
      repositoryIds: input.repositoryIds || [],
      status: "queued",
      workflowId: `wf_mock_${Math.random().toString(36).slice(2, 8)}`,
      traceId: `trace_mock_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      mock: true
    };
    db.analysisRequests.unshift(request);
    return { data: request };
  },
  async cancelAnalysisRequest(projectId, requestId) {
    await sleep(340);
    const request = db.analysisRequests.find((item) => item.projectId === projectId && item.id === requestId);
    if (!request) throw new ApiError("RESOURCE_NOT_FOUND", "Analysis request was not found.", 404);
    if (!["received", "validated", "queued", "processing"].includes(request.status)) throw new ApiError("RESOURCE_CONFLICT", "This request cannot be cancelled.", 409);
    request.status = "cancelled";
    return { data: { ...request } };
  },
  async listWorkflows(projectId) {
    await sleep();
    return page(db.workflows.filter((workflow) => workflow.projectId === projectId));
  },
  async getWorkflow(projectId, workflowId) {
    await sleep();
    const workflow = db.workflows.find((item) => item.projectId === projectId && item.id === workflowId);
    if (!workflow) throw new ApiError("RESOURCE_NOT_FOUND", "Workflow was not found.", 404);
    return { data: { ...workflow } };
  },
  async listWorkflowTasks(projectId, workflowId) {
    await sleep();
    await this.getWorkflow(projectId, workflowId);
    return page(db.workflowTasks.filter((task) => task.workflowId === workflowId).sort((a, b) => a.sequence - b.sequence));
  },
  async listWorkflowEvents(projectId, workflowId) {
    await sleep();
    await this.getWorkflow(projectId, workflowId);
    return page(db.workflowEvents.filter((event) => event.workflowId === workflowId).sort((a, b) => a.sequence - b.sequence));
  },
  async controlWorkflow(projectId, workflowId, action) {
    await sleep(360);
    const workflow = db.workflows.find((item) => item.projectId === projectId && item.id === workflowId);
    if (!workflow) throw new ApiError("RESOURCE_NOT_FOUND", "Workflow was not found.", 404);
    const allowed = {
      pause: ["running", "waiting"],
      resume: ["paused", "waiting"],
      cancel: ["created", "queued", "running", "waiting", "paused"]
    };
    if (!allowed[action]?.includes(workflow.status)) throw new ApiError("RESOURCE_CONFLICT", `Workflow cannot ${action} from ${workflow.status}.`, 409);
    workflow.status = action === "pause" ? "paused" : action === "resume" ? "running" : "cancelled";
    workflow.updatedAt = new Date().toISOString();
    return { data: { ...workflow } };
  },
  async nextMockWorkflowEvent(projectId, workflowId) {
    await sleep(260);
    const workflow = db.workflows.find((item) => item.projectId === projectId && item.id === workflowId);
    if (!workflow) throw new ApiError("RESOURCE_NOT_FOUND", "Workflow was not found.", 404);
    const script = db.workflowScripts[workflowId] || [];
    const emitted = new Set(db.workflowEvents.filter((event) => event.workflowId === workflowId).map((event) => event.eventId));
    const template = script.find((event) => !emitted.has(event.eventId));
    if (!template) return { data: { event: null, terminal: ["completed", "failed", "cancelled"].includes(workflow.status) } };
    const event = { ...template, occurredAt: new Date().toISOString() };
    db.workflowEvents.push(event);
    workflow.progressPercent = event.payload.progressPercent ?? workflow.progressPercent;
    workflow.currentStage = event.payload.stage ?? workflow.currentStage;
    if (event.eventType === "workflow.completed") workflow.status = "completed";
    workflow.updatedAt = event.occurredAt;
    return { data: { event, workflow: { ...workflow }, terminal: event.eventType === "workflow.completed" } };
  },
  async getMcpOverview() {
    await sleep();
    return { data: {
      requestCount: db.mcpRequests.length,
      completedCount: db.mcpRequests.filter((item) => ["completed", "validated", "cached"].includes(item.status)).length,
      averageConfidence: Number((db.mcpRequests.reduce((sum, item) => sum + item.confidence, 0) / db.mcpRequests.length).toFixed(2)),
      healthyServers: db.mcpServers.filter((item) => item.healthStatus === "healthy").length,
      modelCount: db.mcpModels.length,
      toolCount: db.mcpTools.length
    } };
  },
  async listMcpRequests() { await sleep(); return page(db.mcpRequests); },
  async getMcpTrace(requestId) {
    await sleep();
    if (!db.mcpRequests.some((item) => item.id === requestId)) throw new ApiError("RESOURCE_NOT_FOUND", "MCP request was not found.", 404);
    return page(db.mcpTrace.filter((stage) => stage.requestId === requestId).sort((a, b) => a.sequence - b.sequence));
  },
  async listMcpModels() { await sleep(); return page(db.mcpModels); },
  async listMcpTools() { await sleep(); return page(db.mcpTools); },
  async listMcpServers() { await sleep(); return page(db.mcpServers); },
  async listMcpDirectories() { await sleep(); return page(db.mcpDirectories); },
  async checkMcpServerHealth(serverId) {
    await sleep(320);
    const server = db.mcpServers.find((item) => item.id === serverId);
    if (!server) throw new ApiError("RESOURCE_NOT_FOUND", "MCP server was not found.", 404);
    server.healthStatus = server.healthStatus === "unknown" ? "healthy" : server.healthStatus;
    return { data: { serverId, healthStatus: server.healthStatus, checkedAt: new Date().toISOString(), mock: true } };
  },
  async discoverMcpDirectory(directoryId, { idempotencyKey } = {}) {
    await sleep(380);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const directory = db.mcpDirectories.find((item) => item.id === directoryId);
    if (!directory) throw new ApiError("RESOURCE_NOT_FOUND", "MCP directory was not found.", 404);
    const run = { id: `discovery_${Math.random().toString(36).slice(2, 8)}`, directoryId, status: "completed", resultsCount: 2, createdAt: new Date().toISOString(), mock: true };
    db.discoveryRuns.unshift(run);
    return { data: run };
  }
};

export function redactMcpPayload(value) {
  const sensitive = /token|password|secret|authorization|api[_-]?key|credential/i;
  if (Array.isArray(value)) return value.map(redactMcpPayload);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sensitive.test(key) ? "[REDACTED]" : redactMcpPayload(nested)]));
  }
  return value;
}

export function normalizeWorkflowEvents(events) {
  const byId = new Map();
  for (const event of events) {
    if (!event?.eventId || !Number.isFinite(event.sequence)) continue;
    if (!byId.has(event.eventId)) byId.set(event.eventId, event);
  }
  return [...byId.values()].sort((a, b) => a.sequence - b.sequence);
}

export const liveApi = {
  async request() {
    throw new ApiError("LIVE_API_NOT_CONFIGURED", "The live backend is not configured. Enable mocks for this Phase 0–2 build.", 503);
  }
};

export const api = mockApi;
export const createIdempotencyKey = () => globalThis.crypto?.randomUUID?.() ?? `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`;