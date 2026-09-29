import test from "node:test";
import assert from "node:assert/strict";
import { api, ApiError, createIdempotencyKey, normalizeWorkflowEvents, redactMcpPayload } from "../src/api.js";

test("list response uses the documented envelope", async () => {
  const response = await api.listProjects("ws_synase");
  assert.ok(Array.isArray(response.data));
  assert.deepEqual(Object.keys(response.meta), ["page", "pageSize", "total"]);
});

test("project creation requires idempotency", async () => {
  await assert.rejects(
    () => api.createProject({ workspaceId: "ws_synase", name: "No key" }),
    (error) => error instanceof ApiError && error.code === "IDEMPOTENCY_REQUIRED"
  );
});

test("project creation returns a typed domain object", async () => {
  const name = `Contract Test ${Date.now()}`;
  const response = await api.createProject(
    { workspaceId: "ws_synase", name, description: "Deterministic contract test" },
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.equal(response.data.name, name);
  assert.equal(response.data.lifecycleStatus, "draft");
  assert.equal(response.data.role, "owner");
});

test("unknown project is normalized as not found", async () => {
  await assert.rejects(
    () => api.getProject("missing"),
    (error) => error instanceof ApiError && error.status === 404 && Boolean(error.requestId)
  );
});

test("repositories remain project scoped", async () => {
  const platform = await api.listRepositories("prj_platform");
  const runtime = await api.listRepositories("prj_mcp");
  assert.ok(platform.data.every((repository) => repository.projectId === "prj_platform"));
  assert.ok(runtime.data.every((repository) => repository.projectId === "prj_mcp"));
});

test("upload initiation requires idempotency and preserves lifecycle boundaries", async () => {
  await assert.rejects(
    () => api.initiateUpload("prj_platform", { name: "spec.pdf", inputType: "pdf", byteSize: 1200 }),
    (error) => error instanceof ApiError && error.code === "IDEMPOTENCY_REQUIRED"
  );
  const initiated = await api.initiateUpload(
    "prj_platform",
    { name: `spec-${Date.now()}.pdf`, inputType: "pdf", byteSize: 1200, mimeType: "application/pdf" },
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.match(initiated.data.upload.url, /^mock-upload:/);
  const completed = await api.completeUpload("prj_platform", initiated.data.assetId);
  assert.equal(completed.data.processingStatus, "received");
});

test("mock processing advances only through explicit user-triggered steps", async () => {
  const initiated = await api.initiateUpload(
    "prj_platform",
    { name: `flow-${Date.now()}.csv`, inputType: "csv", byteSize: 500, mimeType: "text/csv" },
    { idempotencyKey: createIdempotencyKey() }
  );
  const scanning = await api.advanceAssetDemo("prj_platform", initiated.data.assetId);
  const extracting = await api.advanceAssetDemo("prj_platform", initiated.data.assetId);
  assert.equal(scanning.data.processingStatus, "scanning");
  assert.equal(extracting.data.processingStatus, "extracting");
  assert.equal(extracting.data.securityScanStatus, "clean");
});

test("blocked security state remains distinct from processing state", async () => {
  const assets = await api.listAssets("prj_platform");
  const blocked = assets.data.find((asset) => asset.securityScanStatus === "blocked");
  assert.ok(blocked);
  assert.equal(blocked.processingStatus, "failed");
  assert.equal(blocked.extractionStatus, "not_started");
});

test("conversations and messages remain project scoped", async () => {
  const conversations = await api.listConversations("prj_platform");
  assert.ok(conversations.data.every((session) => session.projectId === "prj_platform"));
  const messages = await api.listMessages("prj_platform", conversations.data[0].id);
  assert.ok(messages.data.every((message) => message.conversationId === conversations.data[0].id));
});

test("message submission requires idempotency", async () => {
  await assert.rejects(
    () => api.postMessage("prj_platform", "conv_arch", { text: "Review this." }),
    (error) => error instanceof ApiError && error.code === "IDEMPOTENCY_REQUIRED"
  );
});

test("analysis request rejects cross-project context references", async () => {
  await assert.rejects(
    () => api.createAnalysisRequest(
      "prj_platform",
      { requestText: "Review routing.", requestType: "repository_review", priority: "normal", executionStrategy: "hybrid", assetIds: [], repositoryIds: ["repo_runtime"] },
      { idempotencyKey: createIdempotencyKey() }
    ),
    (error) => error instanceof ApiError && error.code === "INVALID_CONTEXT_REFERENCE"
  );
});

test("analysis receipt remains queued and distinct from workflow execution", async () => {
  const response = await api.createAnalysisRequest(
    "prj_platform",
    { requestText: "Review architecture.", requestType: "architecture_review", priority: "high", executionStrategy: "hybrid", assetIds: ["asset_prd"], repositoryIds: ["repo_core"] },
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.equal(response.data.status, "queued");
  assert.match(response.data.workflowId, /^wf_mock_/);
  assert.equal(response.data.mock, true);
});

test("workflow events are deduplicated and ordered by sequence", () => {
  const events = [
    { eventId: "b", sequence: 2 },
    { eventId: "a", sequence: 1 },
    { eventId: "b", sequence: 2 }
  ];
  assert.deepEqual(normalizeWorkflowEvents(events).map((event) => event.eventId), ["a", "b"]);
});

test("workflow tasks remain ordered and scoped", async () => {
  const tasks = await api.listWorkflowTasks("prj_platform", "wf_mock_arch");
  assert.ok(tasks.data.every((task) => task.workflowId === "wf_mock_arch"));
  assert.deepEqual(tasks.data.map((task) => task.sequence), [1, 2, 3, 4]);
});

test("workflow control validates state transitions", async () => {
  const paused = await api.controlWorkflow("prj_platform", "wf_mock_arch", "pause");
  assert.equal(paused.data.status, "paused");
  const resumed = await api.controlWorkflow("prj_platform", "wf_mock_arch", "resume");
  assert.equal(resumed.data.status, "running");
});

test("mock workflow playback advances only on explicit calls", async () => {
  const before = await api.getWorkflow("prj_platform", "wf_mock_arch");
  const result = await api.nextMockWorkflowEvent("prj_platform", "wf_mock_arch");
  const after = await api.getWorkflow("prj_platform", "wf_mock_arch");
  assert.ok(result.data.event);
  assert.ok(after.data.progressPercent > before.data.progressPercent);
});

test("MCP trace stages remain ordered", async () => {
  const trace = await api.getMcpTrace("mcp_req_arch");
  assert.deepEqual(trace.data.map((stage) => stage.sequence), [1, 2, 3, 4, 5, 6, 7]);
});

test("MCP payload redaction removes nested credential fields", () => {
  const result = redactMcpPayload({ authorization: "Bearer x", nested: { apiKey: "secret", safe: "ok" } });
  assert.equal(result.authorization, "[REDACTED]");
  assert.equal(result.nested.apiKey, "[REDACTED]");
  assert.equal(result.nested.safe, "ok");
});

test("MCP discovery requires idempotency", async () => {
  await assert.rejects(
    () => api.discoverMcpDirectory("dir_internal"),
    (error) => error instanceof ApiError && error.code === "IDEMPOTENCY_REQUIRED"
  );
});

test("MCP server health action returns labeled mock metadata", async () => {
  const result = await api.checkMcpServerHealth("server_docs");
  assert.equal(result.data.mock, true);
  assert.equal(result.data.healthStatus, "healthy");
});

test("requirements preserve confirmed and AI-suggested provenance", async () => {
  const response = await api.listRequirements("prj_platform");
  assert.ok(response.data.some((item) => item.provenance === "confirmed"));
  assert.ok(response.data.some((item) => item.provenance === "ai_suggested" && item.confidence <= 1));
});

test("feature prioritization remains ordered by rank", async () => {
  const response = await api.listProductFeatures("prj_platform");
  assert.deepEqual(response.data.map((item) => item.priorityRank), [1, 2, 3]);
});

test("roadmap dependencies reference earlier milestones", async () => {
  const response = await api.listRoadmapItems("prj_platform");
  const seen = new Set();
  for (const item of response.data) {
    assert.ok(item.dependencies.every((dependency) => seen.has(dependency)));
    seen.add(item.id);
  }
});

test("product mock action requires idempotency and changes no confirmed records", async () => {
  await assert.rejects(() => api.runProductMock("prj_platform", "requirements"), (error) => error.code === "IDEMPOTENCY_REQUIRED");
  const result = await api.runProductMock("prj_platform", "requirements", { idempotencyKey: createIdempotencyKey() });
  assert.equal(result.data.changedRecords, 0);
  assert.equal(result.data.mock, true);
});