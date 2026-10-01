const ROUTES = [
  { id: "r-auth-login", path: "/auth/login", match: "startsWith('/auth/') default", view: "authPage('login')", module: "src/app.js", phase: 2, section: "auth", shell: false, status: "mock" },
  { id: "r-auth-register", path: "/auth/register", match: "includes('register')", view: "authPage('register')", module: "src/app.js", phase: 2, section: "auth", shell: false, status: "mock" },
  { id: "r-auth-forgot", path: "/auth/forgot", match: "includes('forgot')", view: "authPage('forgot')", module: "src/app.js", phase: 2, section: "auth", shell: false, status: "mock" },
  { id: "r-dashboard", path: "/app/dashboard", match: "=== routes.dashboard", view: "dashboardPage()", module: "src/app.js", phase: 12, section: "workspace", shell: true, status: "overridden" },
  { id: "r-projects", path: "/app/projects", match: "=== routes.projects", view: "projectsPage()", module: "src/app.js", phase: 2, section: "workspace", shell: true, status: "mock" },
  { id: "r-project-create", path: "/app/projects/create", match: "=== routes.createProject", view: "createProjectPage()", module: "src/app.js", phase: 2, section: "workspace", shell: true, status: "mock" },
  { id: "r-project-overview", path: "/app/projects/:projectId/overview", match: "^/app/projects/([^/]+)/overview$", view: "projectOverviewPage(projectId)", module: "src/app.js", phase: 2, section: "project", shell: true, status: "mock" },
  { id: "r-project-settings", path: "/app/projects/:projectId/settings", match: "^/app/projects/([^/]+)/settings$", view: "projectSettingsPage(projectId)", module: "src/app.js", phase: 2, section: "system", shell: true, status: "mock" },
  { id: "r-project-repository", path: "/app/projects/:projectId/repository", match: "^/app/projects/([^/]+)/repository$", view: "repositoryPage(projectId)", module: "src/app.js", phase: 3, section: "workspace", shell: true, status: "mock" },
  { id: "r-project-inputs", path: "/app/projects/:projectId/inputs", match: "^/app/projects/([^/]+)/inputs$", view: "inputsPage(projectId)", module: "src/app.js", phase: 3, section: "workspace", shell: true, status: "provisional" },
  { id: "r-project-analysis", path: "/app/projects/:projectId/analysis", match: "^/app/projects/([^/]+)/analysis$", view: "analysisPage(projectId)", module: "src/app.js", phase: 4, section: "workspace", shell: true, status: "provisional" },
  { id: "r-project-runs", path: "/app/projects/:projectId/runs", match: "^/app/projects/([^/]+)/runs$", view: "runsPage(projectId)", module: "src/app.js", phase: 5, section: "workspace", shell: true, status: "mock" },
  { id: "r-project-integrations", path: "/app/projects/:projectId/integrations", match: "^/app/projects/[^/]+/integrations$", view: "integrations()", module: "src/phase11.js", phase: 11, section: "phase11", shell: true, status: "mock" },
  { id: "r-workspace-members", path: "/app/workspaces/:workspaceId/members", match: "includes('/workspaces/') && endsWith('/members')", view: "membersPage()", module: "src/app.js", phase: 2, section: "workspace", shell: true, status: "mock" },
  { id: "r-workspace-settings", path: "/app/workspaces/:workspaceId/settings", match: "includes('/workspaces/') && endsWith('/settings')", view: "workspaceSettingsPage()", module: "src/app.js", phase: 2, section: "system", shell: true, status: "mock" },
  { id: "r-intel-product", path: "/app/intelligence/product", match: "=== '/app/intelligence/product'", view: "productIntelligencePage()", module: "src/app.js", phase: 7, section: "intelligence", shell: true, status: "mock" },
  { id: "r-intel-devops", path: "/app/intelligence/devops", match: "=== '/app/intelligence/devops'", view: "devopsIntelligencePage()", module: "src/app.js", phase: 8, section: "intelligence", shell: true, status: "mock" },
  { id: "r-mcp-root", path: "/app/mcp", match: "^/app/mcp$", view: "mcpPage('overview')", module: "src/app.js", phase: 6, section: "intelligence", shell: true, status: "mock" },
  { id: "r-mcp-overview", path: "/app/mcp/overview", match: "^/app/mcp/(overview)$", view: "mcpPage('overview')", module: "src/app.js", phase: 6, section: "intelligence", shell: true, status: "mock" },
  { id: "r-mcp-executions", path: "/app/mcp/executions", match: "^/app/mcp/(executions)$", view: "mcpPage('executions')", module: "src/app.js", phase: 6, section: "intelligence", shell: true, status: "mock" },
  { id: "r-mcp-tools", path: "/app/mcp/tools", match: "^/app/mcp/(tools)$", view: "mcpPage('tools')", module: "src/app.js", phase: 6, section: "intelligence", shell: true, status: "mock" },
  { id: "r-mcp-models", path: "/app/mcp/models", match: "^/app/mcp/(models)$", view: "mcpPage('models')", module: "src/app.js", phase: 6, section: "intelligence", shell: true, status: "mock" },
  { id: "r-mcp-discovery", path: "/app/mcp/discovery", match: "^/app/mcp/(discovery)$", view: "mcpPage('discovery')", module: "src/app.js", phase: 6, section: "intelligence", shell: true, status: "mock" },
  { id: "r-context-overview", path: "/app/context/overview", match: "=== '/app/context/overview'", view: "contextOverviewPage()", module: "src/app.js", phase: 9, section: "intelligence", shell: true, status: "mock" },
  { id: "r-context-memory", path: "/app/context/memory", match: "=== '/app/context/memory'", view: "memoryPage()", module: "src/app.js", phase: 9, section: "intelligence", shell: true, status: "mock" },
  { id: "r-context-history", path: "/app/context/history", match: "=== '/app/context/history'", view: "retrievalHistoryPage()", module: "src/app.js", phase: 9, section: "intelligence", shell: true, status: "mock" },
  { id: "r-knowledge-graph", path: "/app/knowledge/graph", match: "=== '/app/knowledge/graph'", view: "knowledgeGraphPage()", module: "src/app.js", phase: 9, section: "intelligence", shell: true, status: "mock" },
  { id: "r-reports", path: "/app/reports", match: "=== '/app/reports'", view: "reportsPage()", module: "src/app.js", phase: 10, section: "outputs", shell: true, status: "mock" },
  { id: "r-report-detail", path: "/app/reports/:reportId", match: "^/app/reports/([^/]+)$", view: "reportDetailPage(reportId)", module: "src/app.js", phase: 10, section: "outputs", shell: true, status: "mock" },
  { id: "r-approvals", path: "/app/approvals", match: "=== '/app/approvals'", view: "approvalsPage()", module: "src/app.js", phase: 10, section: "outputs", shell: true, status: "mock" },
  { id: "r-integrations", path: "/app/integrations", match: "=== '/app/integrations'", view: "integrations()", module: "src/phase11.js", phase: 11, section: "phase11", shell: true, status: "provisional" },
  { id: "r-activity", path: "/app/activity", match: "=== '/app/activity'", view: "activity()", module: "src/phase11.js", phase: 11, section: "phase11", shell: true, status: "mock" },
  { id: "r-audit", path: "/app/audit", match: "=== '/app/audit'", view: "audit()", module: "src/phase11.js", phase: 11, section: "phase11", shell: true, status: "provisional" }
];

const NAV = [
  { section: "Workspace", module: "src/app.js", items: [
    ["#/app/dashboard", "Dashboard", "r-dashboard"],
    ["#/app/projects", "Projects", "r-projects", "prefix"],
    ["#/app/projects/:projectId/repository", "Repository", "r-project-repository"],
    ["#/app/projects/:projectId/inputs", "Inputs", "r-project-inputs"],
    ["#/app/projects/:projectId/analysis", "Conversation & Analysis", "r-project-analysis"],
    ["#/app/projects/:projectId/runs", "Execution Runs", "r-project-runs"],
    ["#/app/workspaces/:workspaceId/members", "Members", "r-workspace-members"]
  ] },
  { section: "Intelligence", module: "src/app.js", items: [
    ["#/app/intelligence/product", "Product Intelligence", "r-intel-product"],
    ["#/app/intelligence/devops", "DevOps Intelligence", "r-intel-devops"],
    ["#/app/mcp/overview", "MCP V2", "r-mcp-root", "prefix"],
    ["#/app/context/overview", "Context", "r-context-overview", "prefix"],
    ["#/app/knowledge/graph", "Knowledge Graph", "r-knowledge-graph"]
  ] },
  { section: "Outputs", module: "src/app.js", items: [
    ["#/app/reports", "Reports", "r-reports", "prefix"],
    ["#/app/approvals", "Approvals", "r-approvals"]
  ] },
  { section: "System", module: "src/app.js", items: [
    ["#/app/workspaces/:workspaceId/settings", "Settings", "r-workspace-settings"],
    ["#/app/activity", "Activity & Audit", "r-activity", null, "disabled"]
  ] },
  { section: "Phase 11", module: "src/phase11.js", items: [
    ["#/app/integrations", "Integrations", "r-integrations"],
    ["#/app/activity", "Activity", "r-activity"],
    ["#/app/audit", "Audit", "r-audit"]
  ] }
];

const TABS = [
  { id: "t-analysis", module: "src/app.js", state: "state.analysisTab", param: "?tab=", values: ["conversation", "compose", "history"], route: "r-project-analysis" },
  { id: "t-product", module: "src/app.js", state: "state.productTab", param: "?productTab=", values: ["requirements", "prioritization", "strategy", "roadmap"], route: "r-intel-product" },
  { id: "t-devops", module: "src/app.js", state: "state.devopsTab", param: "?devopsTab=", values: ["overview", "architecture", "quality", "security", "dependencies", "testing", "risk", "deployment"], route: "r-intel-devops" },
  { id: "t-input", module: "src/app.js", state: "state.inputTab", param: null, values: ["file", "text", "url", "repository"], route: "r-project-inputs" }
];

const LAYERS = [
  { id: "l0-composition", ordinal: 0, label: "Composition root", modules: ["src/app.js", "src/phase11.js", "src/phase12.js"], owns: "Route resolution, adapter selection, store, event delegation." },
  { id: "l1-view", ordinal: 1, label: "View templates", modules: ["src/app.js", "src/phase11.js", "src/phase12.js"], owns: "Pure HTML string builders. No transport, no persistence knowledge." },
  { id: "l2-service", ordinal: 2, label: "Domain service interface", modules: ["src/api.js", "src/phase11-api.js", "src/phase12-api.js"], owns: "Domain-oriented contracts under /api/v1. Returns { data, meta }." },
  { id: "l3-adapter", ordinal: 3, label: "Adapter boundary", modules: ["src/api.js", "src/phase12-api.js"], owns: "mock implementation (shipped) and live implementation (fail-closed, unwired)." },
  { id: "l4-transport", ordinal: 4, label: "Transport", modules: ["src/phase12-api.js"], owns: "fetchImpl, AbortController timeout, X-Request-ID, credentials: include, response decoding. Currently exercised only in tests." },
  { id: "l5-backend", ordinal: 5, label: "Backend /api/v1", modules: [], owns: "Unresolved. No server exists in this repository." }
];

const TYPES = [
  { id: "src/types.d.ts", role: "Core domain declarations", exports: 70, kind: "type-only" },
  { id: "src/phase11-types.d.ts", role: "Integrations, activity, audit declarations", exports: 17, kind: "type-only" },
  { id: "src/phase12-types.d.ts", role: "Dashboard, readiness, QA declarations", exports: 9, kind: "type-only" }
];

const SERVICES = [
  {
    id: "svc-mock", label: "mockApi", module: "src/api.js", phases: "0-10", export: "mockApi",
    role: "Deterministic in-memory domain service. Owns the entire mock db fixture.",
    fixture: "db (src/api.js)",
    methods: "login,register,recover,getMe,listWorkspaces,getWorkspace,listWorkspaceMembers,inviteWorkspaceMember,listProjects,getProject,createProject,updateProject,getDashboard,listRepositories,connectRepository,syncRepository,listRepositorySnapshots,getRepositoryTree,listAssets,initiateUpload,completeUpload,addTextInput,addUrlInput,advanceAssetDemo,deleteAsset,listConversations,createConversation,listMessages,postMessage,listAnalysisRequests,createAnalysisRequest,cancelAnalysisRequest,listWorkflows,getWorkflow,listWorkflowTasks,listWorkflowEvents,controlWorkflow,nextMockWorkflowEvent,getMcpOverview,listMcpRequests,getMcpTrace,listMcpModels,listMcpTools,listMcpServers,listMcpDirectories,checkMcpServerHealth,discoverMcpDirectory,listRequirements,listProductFeatures,getProductStrategy,listRoadmapItems,runProductMock,getDevOpsSummary,listFindings,listDevOpsRecommendations,listDependencies,listTestSuggestions,listDeploymentPlans,runDevOpsMock,listContextItems,searchMemory,listRetrievalHistory,getKnowledgeGraph,runContextMock,listReports,getReport,listApprovals,getApproval,generateReport,publishReport,exportReport,decideApproval,addApprovalComment,cancelApproval",
    helpers: "ApiError, redactMcpPayload, normalizeWorkflowEvents, createIdempotencyKey, liveApi"
  },
  {
    id: "svc-p11", label: "phase11Api", module: "src/phase11-api.js", phases: "11", export: "phase11Api",
    role: "Integrations, operational activity, and immutable audit projections. Project scoped.",
    fixture: "module-private providers, connections, runs, activity, audit + receipts Map",
    methods: "listIntegrationProviders,listIntegrationConnections,getIntegrationConnection,listIntegrationRuns,connectIntegration,disconnectIntegration,checkIntegrationHealth,syncIntegration,listActivity,listAuditEvents,getAuditEvent",
    helpers: "Phase11ApiError, redactSensitiveMetadata, createPhase11IdempotencyKey"
  },
  {
    id: "svc-p12", label: "phase12Api", module: "src/phase12-api.js", phases: "12", export: "phase12Api",
    role: "Workspace dashboard aggregate and integration readiness. Only service with a live adapter factory.",
    fixture: "frozen dashboard fixture",
    methods: "getDashboard,getIntegrationReadiness",
    helpers: "Phase12ApiError, sanitizeIntegrationMetadata, createPhase12Service, phase12DashboardFixture"
  }
];

const ENTITY_MAP = [
  { name: "User", fixture: "db.user", service: "svc-mock", methods: "getMe,login,register,recover", views: "shell" },
  { name: "Workspace", fixture: "db.workspaces", service: "svc-mock", methods: "listWorkspaces,getWorkspace", views: "workspaceSettingsPage,shell" },
  { name: "WorkspaceMember", fixture: "db.workspaceMembers", service: "svc-mock", methods: "listWorkspaceMembers,inviteWorkspaceMember", views: "membersPage" },
  { name: "Project", fixture: "db.projects", service: "svc-mock", methods: "listProjects,getProject,createProject,updateProject", views: "projectsPage,projectOverviewPage,projectSettingsPage" },
  { name: "ProjectMember", fixture: "db.projects[].members", service: "svc-mock", methods: "getProject,listProjects", views: "projectOverviewPage" },
  { name: "DashboardMetric", fixture: "derived", service: "svc-mock", methods: "getDashboard", views: "metricCard,dashboardPage" },
  { name: "ActivityItem", fixture: "db.activity", service: "svc-mock", methods: "getDashboard", views: "dashboardPage", note: "Flat actor:string shape in types.d.ts. Two divergent siblings exist." },
  { name: "Repository", fixture: "db.repositories", service: "svc-mock", methods: "listRepositories,connectRepository,syncRepository", views: "repositoryPage" },
  { name: "RepositorySnapshot", fixture: "db.snapshots", service: "svc-mock", methods: "listRepositorySnapshots", views: "repositoryPage" },
  { name: "Asset", fixture: "db.assets", service: "svc-mock", methods: "listAssets,initiateUpload,completeUpload,addTextInput,addUrlInput,advanceAssetDemo,deleteAsset", views: "inputsPage,assetTable,assetState" },
  { name: "UploadInitiationResponse", fixture: "derived", service: "svc-mock", methods: "initiateUpload", views: "inputComposer" },
  { name: "ConversationSession", fixture: "db.conversations", service: "svc-mock", methods: "listConversations,createConversation", views: "conversationWorkspace" },
  { name: "ConversationMessage", fixture: "db.messages", service: "svc-mock", methods: "listMessages,postMessage", views: "messageThread" },
  { name: "AnalysisRequest", fixture: "db.analysisRequests", service: "svc-mock", methods: "listAnalysisRequests,createAnalysisRequest,cancelAnalysisRequest", views: "analysisComposer,requestHistory" },
  { name: "WorkflowRun", fixture: "db.workflows", service: "svc-mock", methods: "listWorkflows,getWorkflow,controlWorkflow", views: "runsPage,workflowDetail" },
  { name: "WorkflowTask", fixture: "db.workflowTasks", service: "svc-mock", methods: "listWorkflowTasks", views: "workflowDetail" },
  { name: "WorkflowEvent", fixture: "db.workflowEvents,db.workflowScripts", service: "svc-mock", methods: "listWorkflowEvents,nextMockWorkflowEvent", views: "workflowDetail" },
  { name: "McpRequest", fixture: "db.mcpRequests", service: "svc-mock", methods: "listMcpRequests,getMcpOverview", views: "mcpRequestTable" },
  { name: "McpTraceStage", fixture: "db.mcpTrace", service: "svc-mock", methods: "getMcpTrace", views: "mcpExecutionsView" },
  { name: "McpModel", fixture: "db.mcpModels", service: "svc-mock", methods: "listMcpModels", views: "mcpCatalogView('models')" },
  { name: "McpTool", fixture: "db.mcpTools", service: "svc-mock", methods: "listMcpTools", views: "mcpCatalogView('tools')" },
  { name: "McpServer", fixture: "db.mcpServers", service: "svc-mock", methods: "listMcpServers,checkMcpServerHealth", views: "mcpDiscoveryView" },
  { name: "Requirement", fixture: "db.requirements", service: "svc-mock", methods: "listRequirements", views: "requirementsView" },
  { name: "ProductFeature", fixture: "db.productFeatures", service: "svc-mock", methods: "listProductFeatures", views: "prioritizationView" },
  { name: "RoadmapItem", fixture: "db.roadmapItems", service: "svc-mock", methods: "listRoadmapItems", views: "roadmapView" },
  { name: "Finding", fixture: "db.findings", service: "svc-mock", methods: "listFindings", views: "findingsTable,devopsOverview" },
  { name: "DevOpsRecommendation", fixture: "db.devopsRecommendations", service: "svc-mock", methods: "listDevOpsRecommendations", views: "devopsOverview" },
  { name: "DeploymentPlan", fixture: "db.deploymentPlans", service: "svc-mock", methods: "listDeploymentPlans", views: "devopsDeployment" },
  { name: "ContextItem", fixture: "db.contextItems", service: "svc-mock", methods: "listContextItems", views: "contextOverviewPage" },
  { name: "MemoryResult", fixture: "db.memoryItems", service: "svc-mock", methods: "searchMemory", views: "memoryPage" },
  { name: "RetrievalRecord", fixture: "db.retrievalHistory", service: "svc-mock", methods: "listRetrievalHistory", views: "retrievalHistoryPage" },
  { name: "KnowledgeGraph", fixture: "db.knowledgeGraphs", service: "svc-mock", methods: "getKnowledgeGraph", views: "knowledgeGraphPage" },
  { name: "DecisionReport", fixture: "db.reports", service: "svc-mock", methods: "listReports,getReport,generateReport,publishReport", views: "reportsPage,reportDetailPage" },
  { name: "ReportExportArtifact", fixture: "db.exportArtifacts", service: "svc-mock", methods: "exportReport", views: "reportsPage (receipt only)" },
  { name: "Approval", fixture: "db.approvals", service: "svc-mock", methods: "listApprovals,getApproval,decideApproval,addApprovalComment,cancelApproval", views: "approvalsPage" },
  { name: "IntegrationProvider", fixture: "phase11-api.js providers", service: "svc-p11", methods: "listIntegrationProviders", views: "integrations" },
  { name: "IntegrationConnection", fixture: "phase11-api.js connections", service: "svc-p11", methods: "listIntegrationConnections,getIntegrationConnection,connectIntegration,disconnectIntegration", views: "integrations" },
  { name: "IntegrationRun", fixture: "phase11-api.js runs", service: "svc-p11", methods: "listIntegrationRuns,checkIntegrationHealth,syncIntegration", views: "integrations" },
  { name: "IntegrationSyncReceipt", fixture: "phase11-api.js receipts Map", service: "svc-p11", methods: "connectIntegration,disconnectIntegration,checkIntegrationHealth,syncIntegration", views: "integrations" },
  { name: "ActivityItem", fixture: "phase11-api.js activity", service: "svc-p11", methods: "listActivity", views: "activity", note: "Actor object + target object + domain/outcome/source. Collides by name with types.d.ts ActivityItem." },
  { name: "AuditEvent", fixture: "phase11-api.js audit (frozen)", service: "svc-p11", methods: "listAuditEvents,getAuditEvent", views: "audit" },
  { name: "DashboardOverview", fixture: "phase12-api.js dashboard", service: "svc-p12", methods: "getDashboard", views: "dashboardView" },
  { name: "AttentionItem", fixture: "phase12-api.js dashboard.attention", service: "svc-p12", methods: "getDashboard", views: "dashboardView" },
  { name: "ProjectHealthSummary", fixture: "phase12-api.js dashboard.projects", service: "svc-p12", methods: "getDashboard", views: "dashboardView" },
  { name: "IntegrationReadiness", fixture: "phase12-api.js dashboard.readiness", service: "svc-p12", methods: "getIntegrationReadiness", views: "dashboardView" },
  { name: "ContractCheck", fixture: "phase12-api.js dashboard.readiness", service: "svc-p12", methods: "getIntegrationReadiness", views: "dashboardView" },
  { name: "ActivityItem", fixture: "phase12-api.js dashboard.activity", service: "svc-p12", methods: "getDashboard", views: "dashboardView", note: "Third activity shape: flat actor plus audit:false flag." }
];

const UNTYPED_FIXTURES = [
  { key: "devopsSummary", entity: "DevOpsSummary aggregate", methods: "getDevOpsSummary", views: "devopsOverview", module: "src/api.js" },
  { key: "productStrategy", entity: "ProductStrategy aggregate", methods: "getProductStrategy", views: "strategyView", module: "src/api.js" },
  { key: "dependencies", entity: "Dependency", methods: "listDependencies", views: "devopsDependencies", module: "src/api.js" },
  { key: "testSuggestions", entity: "TestSuggestion", methods: "listTestSuggestions", views: "devopsTesting", module: "src/api.js" },
  { key: "mcpDirectories", entity: "McpDirectory", methods: "listMcpDirectories,discoverMcpDirectory", views: "mcpDiscoveryView", module: "src/api.js" },
  { key: "discoveryRuns", entity: "McpDiscoveryRun", methods: "discoverMcpDirectory", views: "mcpDiscoveryView", module: "src/api.js" },
  { key: "workflowScripts", entity: "Scripted demo events", methods: "nextMockWorkflowEvent", views: "workflowDetail", module: "src/api.js" }
];

const INVARIANTS = [
  { id: "inv-01", label: "No external contact in mock mode", statement: "The shipped adapter contacts no external provider, directory, server, or model.", enforcedBy: "test/api.test.mjs,test/phase11.test.mjs,test/phase12.test.mjs", layer: "l3-adapter" },
  { id: "inv-02", label: "No secret exposure", statement: "No password, token, API key, cookie, authorization header, MFA secret, or secret-manager value reaches a display model or audit projection.", enforcedBy: "redactMcpPayload,redactSensitiveMetadata,sanitizeIntegrationMetadata", layer: "l3-adapter" },
  { id: "inv-03", label: "Recursively redacted, raw payloads omitted", statement: "Sensitive metadata is redacted recursively; raw headers and request/response bodies are omitted, not truncated.", enforcedBy: "test/phase11.test.mjs,test/phase12.test.mjs", layer: "l3-adapter" },
  { id: "inv-04", label: "Approval is not execution", statement: "An approval decision never implies downstream execution. downstreamExecuted and executed stay false.", enforcedBy: "test/api.test.mjs,test/phase12.test.mjs", layer: "l2-service" },
  { id: "inv-05", label: "Connect is not authorization", statement: "Authorization, connection, health, and synchronization are four independent states.", enforcedBy: "test/phase11.test.mjs", layer: "l2-service" },
  { id: "inv-06", label: "Elapsed time is not progress", statement: "Workflow progress comes only from authoritative events or snapshots, never from a timer.", enforcedBy: "src/app.js workflowDetail", layer: "l1-view" },
  { id: "inv-07", label: "Mock receipt is not a real action", statement: "A submitted action yields a queued mock receipt with externalContacted:false and executed:false.", enforcedBy: "test/api.test.mjs", layer: "l2-service" },
  { id: "inv-08", label: "Mutations require an idempotency key", statement: "Every mutation rejects with IDEMPOTENCY_REQUIRED when no key is supplied and replays the first receipt on retry.", enforcedBy: "test/api.test.mjs,test/phase11.test.mjs", layer: "l2-service" },
  { id: "inv-09", label: "No automatic retry of unsafe mutations", statement: "Unsafe mutations are never silently retried by the transport.", enforcedBy: "src/phase12-api.js", layer: "l4-transport" },
  { id: "inv-10", label: "No optimistic success on high-impact actions", statement: "Approvals, publications, and syncs wait for the authoritative response.", enforcedBy: "src/app.js,src/phase11.js", layer: "l1-view" },
  { id: "inv-11", label: "Domain models are not persistence models", statement: "Frontend domain contracts do not mirror PostgreSQL tables.", enforcedBy: "src/types.d.ts", layer: "l2-service" },
  { id: "inv-12", label: "Activity is not audit", statement: "Operational activity history is explicitly distinct from immutable security-grade audit.", enforcedBy: "test/phase11.test.mjs", layer: "l2-service" },
  { id: "inv-13", label: "Project scoping is enforced", statement: "Every project-scoped read and mutation rejects cross-project identifiers as not found.", enforcedBy: "test/api.test.mjs,test/phase11-extra.test.mjs", layer: "l2-service" },
  { id: "inv-14", label: "AI-proposed is not confirmed state", statement: "Provenance distinguishes ai_suggested from confirmed project state.", enforcedBy: "test/api.test.mjs", layer: "l2-service" },
  { id: "inv-15", label: "Build success is not backend connectivity", statement: "A green build or a passing suite never claims a live backend.", enforcedBy: "phase12.js alerting,README", layer: "l1-view" },
  { id: "inv-16", label: "Live mode fails closed", statement: "Missing base URL, non-HTTPS non-local base URL, or a malformed response aborts with a canonical error.", enforcedBy: "test/phase12.test.mjs", layer: "l4-transport" },
  { id: "inv-17", label: "Audit is read-only", statement: "No service exposes an audit mutation. The suite asserts phase11Api.updateAuditEvent is undefined.", enforcedBy: "test/phase11.test.mjs", layer: "l2-service" },
  { id: "inv-18", label: "UI output is escaped", statement: "Every interpolated value passes through escapeHtml/esc before entering innerHTML.", enforcedBy: "src/app.js,src/phase11.js,src/phase12.js", layer: "l1-view" }
];

const GAPS = [
  { id: "gap-01", label: "Authentication and session contracts", detail: "login, registration, recovery, logout, renewal, and callback contracts are unresolved. app.js ships with state.authenticated = true.", blocks: ["l5-backend"] },
  { id: "gap-02", label: "Complete DTO and error schemas", detail: "Nullability, error envelopes, and full DTO shapes are not frozen.", blocks: ["l5-backend"] },
  { id: "gap-03", label: "Pagination and mutation idempotency policy", detail: "page() hardcodes page 1 of 25. Server-side pagination and a documented idempotency window are undefined.", blocks: ["l5-backend"] },
  { id: "gap-04", label: "Workspace aggregate endpoints", detail: "Dashboard, search, report, approval, integration, and activity aggregates do not exist. Phase 12 ships a selected-project mock and labels it as such.", blocks: ["l5-backend", "svc-p12"] },
  { id: "gap-05", label: "Active workspace/project context encoding", detail: "How the server scopes requests to an active workspace or project is undefined.", blocks: ["l5-backend"] },
  { id: "gap-06", label: "Permissions beyond roles", detail: "Roles exist in types.d.ts but capability and permission fields do not.", blocks: ["l5-backend"] },
  { id: "gap-07", label: "SSE envelope, auth, replay, retention", detail: "Workflow streaming is a scripted mock. Event envelope, authentication, heartbeat, replay, and retention are undefined.", blocks: ["l5-backend"] },
  { id: "gap-08", label: "Signed upload flow", detail: "initiateUpload returns a mock-upload: URL. Real signed initiation and completion are undefined.", blocks: ["l5-backend"] },
  { id: "gap-09", label: "Realtime transport outside workflow SSE", detail: "No realtime channel exists for collaboration or presence.", blocks: ["l5-backend"] },
  { id: "gap-10", label: "Notification delivery", detail: "No delivery channel, preference model, or retry policy exists.", blocks: ["l5-backend"] },
  { id: "gap-11", label: "API compatibility and deprecation policy", detail: "No versioning or deprecation contract exists under /api/v1.", blocks: ["l5-backend"] },
  { id: "gap-12", label: "Security-grade audit retention", detail: "Audit completeness, immutability guarantees, and retention are explicitly not claimed.", blocks: ["l5-backend"] }
];

const RISKS = [
  { id: "rsk-01", severity: "high", label: "Two owners of /app/dashboard", detail: "src/app.js renders dashboardPage() and src/phase12.js overwrites #main via MutationObserver. Resolution depends on script load order, not on a declared contract.", where: "src/app.js:745,src/phase12.js:34", graph: "r-dashboard" },
  { id: "rsk-02", severity: "medium", label: "ActivityItem exported from two type modules", detail: "src/types.d.ts and src/phase11-types.d.ts both export ActivityItem with different shapes. An unqualified import is ambiguous.", where: "src/types.d.ts,src/phase11-types.d.ts", graph: "ActivityItem" },
  { id: "rsk-03", severity: "medium", label: "Three incompatible activity shapes", detail: "api.js uses actor:string; phase11-api.js uses actor/target objects; phase12-api.js uses actor:string plus audit:false. Three fixtures, one concept.", where: "src/api.js,src/phase11-api.js,src/phase12-api.js", graph: "ActivityItem" },
  { id: "rsk-04", severity: "medium", label: "liveApi is dead code", detail: "src/api.js exports liveApi whose request() always throws LIVE_API_NOT_CONFIGURED, and api is a hard alias of mockApi. Nothing can select the live adapter.", where: "src/api.js:845,851", graph: "svc-mock" },
  { id: "rsk-05", severity: "medium", label: "Duplicated project hydrate cascade", detail: "hydrate() and the project-switcher change handler repeat the same 7-stage fetch. Divergence risk on every new domain.", where: "src/app.js:788,src/app.js:1039", graph: "l0-composition" },
  { id: "rsk-06", severity: "low", label: "Asymmetric clone semantics", detail: "api.js page() returns live references into db, while phase11/phase12 page() uses structuredClone and report/approval reads clone. List reads are mutable; single reads are snapshots.", where: "src/api.js,src/phase11-api.js,src/phase12-api.js", graph: "svc-mock" },
  { id: "rsk-07", severity: "low", label: "CI workflow filename lags its purpose", detail: ".github/workflows/phase11-validate.yml runs the Phase 12 suite and writes phase12-validation.json. The filename misleads.", where: ".github/workflows/phase11-validate.yml", graph: "ph-12" },
  { id: "rsk-08", severity: "low", label: "dev server requires a prior build", detail: "scripts/serve.mjs serves dist/ only, so npm run dev after a fresh clone returns 404 until npm run build runs.", where: "scripts/serve.mjs", graph: "scr-serve" },
  { id: "rsk-09", severity: "low", label: "Disabled nav link for a live route", detail: "app.js renders /app/activity as aria-disabled while phase11.js serves it. The nav misrepresents available functionality.", where: "src/app.js:174", graph: "r-activity" },
  { id: "rsk-10", severity: "low", label: "No lint, format, or typecheck script", detail: "Type annotations exist (// @ts-check) but no tsconfig or checker runs in CI. Contract drift is only caught by tests.", where: "package.json", graph: "ph-12" }
];

const DECISIONS = [
  { id: "dec-01", label: "Zero runtime dependencies", decision: "No npm dependencies, no framework, no bundler. Ship hand-written ES modules.", consequence: "No supply chain, no build step for the app itself, total control over the shipped bytes. Cost: no router, no reactive rendering, string templates everywhere.", status: "active" },
  { id: "dec-02", label: "Hash routing with a ?route= override", decision: "Navigation uses location.hash so any static server works; ?route= takes precedence for deep links and QA.", consequence: "Deployable as static files. Cost: no server-side routing, no real browser history entries (replaceState is used).", status: "active" },
  { id: "dec-03", label: "Per-phase modules instead of one growing app", decision: "Each phase adds api, view, css, and types modules rather than extending app.js.", consequence: "Phase boundaries stay legible and deletable. Cost: phase11.js and phase12.js take over #main from outside the router.", status: "active" },
  { id: "dec-04", label: "MutationObserver takeover for late modules", decision: "phase11.js and phase12.js observe document.body and re-assert ownership of #main.", consequence: "New phases integrate without editing the router. Cost: this is the mechanism behind rsk-01 and makes dashboard ownership implicit.", status: "debt" },
  { id: "dec-05", label: "Mock as a service implementation, not a fixture leak", decision: "Fixtures live behind domain methods returning { data, meta }, so mock and live share one boundary.", consequence: "Swapping adapters does not touch views. Cost: 74 methods to keep in sync with types.d.ts.", status: "active" },
  { id: "dec-06", label: "Only Phase 12 exposes a live adapter factory", decision: "createPhase12Service({ mode, baseUrl, fetchImpl, timeoutMs }) is the sole live seam, and it is not wired by default.", consequence: "Live integration has exactly one reviewable entry point. Cost: Phases 0-11 have no live path at all.", status: "active" },
  { id: "dec-07", label: "Negative claims are asserted, not assumed", decision: "The suite asserts externalContacted:false, executed:false, downstreamActionsExecuted:false and absence of secret literals rather than trusting them.", consequence: "The safety story is regression-protected. Cost: 64 tests are load-bearing for product claims.", status: "active" }
];

const PHASES = [
  { n: 0, label: "API contract foundation", status: "implemented", capability: "Domain contract layer and ApiError envelope" },
  { n: 1, label: "Design system and application shell", status: "implemented", capability: "styles.css tokens, shell, sidebar, topbar" },
  { n: 2, label: "Auth, workspace, and projects", status: "mock-backed", capability: "auth pages, workspaces, members, project CRUD" },
  { n: 3, label: "Repository and multimodal input", status: "mock-backed", capability: "repository connect/sync/tree, uploads, text/url inputs" },
  { n: 4, label: "Conversation and analysis requests", status: "mock-backed", capability: "sessions, messages, analysis receipts" },
  { n: 5, label: "Workflow and SSE state handling", status: "mock-backed", capability: "runs, tasks, scripted events, control transitions" },
  { n: 6, label: "MCP V2 observability and discovery", status: "mock-backed", capability: "requests, traces, models, tools, servers, directories" },
  { n: 7, label: "Product Intelligence", status: "mock-backed", capability: "requirements, features, strategy, roadmap" },
  { n: 8, label: "DevOps Intelligence", status: "mock-backed", capability: "summary, findings, recommendations, dependencies, tests, deployments" },
  { n: 9, label: "Context and Knowledge", status: "mock-backed", capability: "context inventory, memory search, retrieval history, knowledge graph" },
  { n: 10, label: "Reports and human-in-the-loop approvals", status: "mock-backed", capability: "reports, generation, publication, export, approvals" },
  { n: 11, label: "Integrations, Activity, and Audit", status: "mock-backed", capability: "providers, connections, runs, activity, audit" },
  { n: 12, label: "Dashboard, integration readiness, and QA", status: "implemented and validated", capability: "workspace dashboard, readiness checks, live adapter seam" }
];

const ROADMAP = [
  { n: 13, label: "Contract registry and freeze", blocks: ["gap-02", "gap-11"], prereq: "none", rationale: "Publish the authoritative DTO, error, pagination, and versioning contracts before any adapter work. Turns the twelve known gaps into tracked, testable documents.", deliverables: ["docs/contracts/*.md per domain", "generated request/response schemas", "npm run contracts:check"] },
  { n: 14, label: "Auth and session lifecycle", blocks: ["gap-01", "gap-05", "gap-06"], prereq: 13, rationale: "Replace state.authenticated = true with a real session contract, capability fields beyond roles, and explicit active-context encoding.", deliverables: ["SessionProvider at the composition root", "login/logout/renew/callback flows", "capability-aware nav"] },
  { n: 15, label: "Backend aggregate endpoints", blocks: ["gap-04", "gap-03"], prereq: 13, rationale: "Give the dashboard real workspace-scoped aggregates so cross-domain pages stop needing browser-side relational reconstruction.", deliverables: ["GET /api/v1/dashboard implemented server-side", "server-side pagination on list endpoints", "phase12 aggregateContractStatus resolves to resolved"] },
  { n: 16, label: "Authoritative workflow streaming", blocks: ["gap-07"], prereq: 14, rationale: "Replace db.workflowScripts with a real SSE channel that carries authoritative event and snapshot state with replay and heartbeat.", deliverables: ["SSE envelope + X-Request-ID correlation", "replay from last sequence", "inv-06 enforced against real snapshots"] },
  { n: 17, label: "Signed input pipeline", blocks: ["gap-08"], prereq: 15, rationale: "Replace the mock-upload: URL with signed initiation and completion, keeping security scan and extraction as distinct states.", deliverables: ["initiateUpload/completeUpload against storage", "scan and extraction status remain independent", "no credential in frontend models"] },
  { n: 18, label: "Governed audit and notifications", blocks: ["gap-12", "gap-09", "gap-10"], prereq: 16, rationale: "Move audit from a read-only fixture to a governed append-only store with a stated retention policy, and add a delivery channel.", deliverables: ["append-only audit with retention statement", "notification preferences and delivery", "inv-12 keeps activity separate from audit"] }
];

export {
  ROUTES, NAV, TABS, LAYERS, TYPES, SERVICES, ENTITY_MAP, UNTYPED_FIXTURES,
  INVARIANTS, GAPS, RISKS, DECISIONS, PHASES, ROADMAP
};
