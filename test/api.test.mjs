import test from "node:test";
import assert from "node:assert/strict";
import { api, ApiError, createIdempotencyKey } from "../src/api.js";

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