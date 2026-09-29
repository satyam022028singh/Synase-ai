export type PlatformRole = "platform_admin" | "member" | "support";
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type ProjectRole = "owner" | "product_manager" | "developer" | "devops_engineer" | "reviewer" | "viewer";
export type ProjectLifecycleStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface ApiSuccess<T> { data: T }
export interface PageMeta { page: number; pageSize: number; total: number }
export interface ApiList<T> { data: T[]; meta: PageMeta }
export interface ApiErrorShape {
  code: string;
  message: string;
  details: Record<string, unknown>;
  requestId?: string;
  status?: number;
}
export interface User {
  id: string;
  email: string;
  displayName: string;
  globalRole: PlatformRole;
  avatarUrl?: string;
}
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  role: WorkspaceRole;
  status: "active" | "suspended" | "archived";
}
export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
}
export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  goal?: string;
  lifecycleStatus: ProjectLifecycleStatus;
  role: ProjectRole;
  updatedAt: string;
}
export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: ProjectRole;
}
export interface DashboardMetric {
  label: string;
  value: string;
  trend?: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
}
export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
}
export type RepositoryProvider = "github" | "gitlab" | "bitbucket" | "local" | "other";
export type RepositoryConnectionStatus = "pending" | "connected" | "error" | "revoked";
export interface Repository {
  id: string;
  projectId: string;
  provider: RepositoryProvider;
  name: string;
  fullName: string;
  defaultBranch: string;
  visibility: "public" | "private" | "internal" | "unknown";
  connectionStatus: RepositoryConnectionStatus;
  lastSyncedAt?: string;
}
export interface RepositorySnapshot {
  id: string;
  repositoryId: string;
  commitSha: string;
  branch: string;
  fileCount: number;
  totalBytes: number;
  scanStatus: "pending" | "running" | "completed" | "failed";
  createdAt: string;
}
export type InputType = "text" | "file" | "csv" | "spreadsheet" | "pdf" | "document" | "image" | "audio" | "video" | "url" | "repository" | "connector" | "code_archive" | "log";
export type InputProcessingStatus = "received" | "scanning" | "extracting" | "indexing" | "ready" | "warning" | "failed" | "deleted";
export type SecurityScanStatus = "pending" | "clean" | "warning" | "blocked" | "failed";
export type ExtractionStatus = "not_started" | "running" | "completed" | "partial" | "failed";
export interface Asset {
  id: string;
  projectId: string;
  name: string;
  inputType: InputType;
  sourceType: "upload" | "paste" | "drag_drop" | "github" | "gitlab" | "url" | "integration" | "generated_context";
  mimeType?: string;
  byteSize?: number;
  processingStatus: InputProcessingStatus;
  securityScanStatus: SecurityScanStatus;
  extractionStatus: ExtractionStatus;
  createdAt: string;
}
export interface UploadInitiationResponse {
  assetId: string;
  upload: { method: "PUT"; url: string; expiresAt: string; headers: Record<string, string> };
}
export type ConversationStatus = "active" | "archived" | "deleted";
export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageStatus = "draft" | "submitted" | "processing" | "completed" | "failed" | "deleted";
export interface ConversationSession {
  id: string;
  projectId: string;
  title?: string;
  status: ConversationStatus;
  updatedAt: string;
}
export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  text?: string;
  status: MessageStatus;
  assetIds: string[];
  repositoryIds: string[];
  createdAt: string;
  mock?: boolean;
}
export type AnalysisPriority = "low" | "normal" | "high" | "urgent";
export type ExecutionStrategy = "sequential" | "parallel" | "hybrid";
export type AnalysisRequestStatus = "received" | "validated" | "rejected" | "queued" | "processing" | "completed" | "failed" | "cancelled";
export interface AnalysisRequest {
  id: string;
  projectId: string;
  conversationId?: string;
  requestText: string;
  requestType: string;
  priority: AnalysisPriority;
  executionStrategy: ExecutionStrategy;
  assetIds: string[];
  repositoryIds: string[];
  status: AnalysisRequestStatus;
  workflowId?: string;
  traceId?: string;
  createdAt: string;
}
export type WorkflowStatus = "created" | "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled" | "paused";
export type TaskStatus = "pending" | "ready" | "running" | "waiting" | "completed" | "failed" | "skipped" | "cancelled";
export interface WorkflowRun {
  id: string;
  projectId: string;
  requestId: string;
  executionStrategy: ExecutionStrategy;
  status: WorkflowStatus;
  progressPercent: number;
  currentStage?: string;
  createdAt: string;
  updatedAt: string;
}
export interface WorkflowTask {
  id: string;
  workflowId: string;
  name: string;
  layer: "product" | "devops" | "orchestrator" | "mcp" | "reporting";
  status: TaskStatus;
  progressPercent: number;
  sequence: number;
}
export interface WorkflowEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  workflowId: string;
  occurredAt: string;
  sequence: number;
  schemaVersion: "1";
  payload: T;
}
export interface McpRequest {
  id: string;
  workflowId?: string;
  detectedLayer?: "product" | "devops" | "both" | "unknown";
  status: "received" | "processing" | "completed" | "failed" | "cached" | "validated";
  payloadFormat: "json" | "toon" | "reference";
  createdAt: string;
}
export interface McpTraceStage {
  id: string;
  requestId: string;
  chamber: string;
  sequence: number;
  status: "queued" | "running" | "completed" | "failed" | "skipped" | "cached";
  durationMs?: number;
  summary: string;
}
export interface McpModel {
  id: string;
  provider: string;
  name: string;
  contextWindow?: number;
  availabilityStatus: "active" | "disabled" | "deprecated";
}
export interface McpTool {
  id: string;
  name: string;
  type: string;
  availabilityStatus: "active" | "disabled" | "deprecated";
}
export interface McpServer {
  id: string;
  name: string;
  transportType: string;
  status: "discovered" | "registered" | "active" | "disabled" | "error" | "deprecated";
  healthStatus: "unknown" | "healthy" | "degraded" | "unavailable";
}
export interface DomainApi {
  getMe(): Promise<ApiSuccess<User>>;
  listWorkspaces(): Promise<ApiList<Workspace>>;
  listProjects(workspaceId: string): Promise<ApiList<Project>>;
  createProject(input: Pick<Project, "workspaceId" | "name"> & Partial<Project>): Promise<ApiSuccess<Project>>;
  listRepositories(projectId: string): Promise<ApiList<Repository>>;
  listAssets(projectId: string): Promise<ApiList<Asset>>;
  listConversations(projectId: string): Promise<ApiList<ConversationSession>>;
  listAnalysisRequests(projectId: string): Promise<ApiList<AnalysisRequest>>;
}