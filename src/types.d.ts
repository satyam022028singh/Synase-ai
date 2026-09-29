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
export interface DomainApi {
  getMe(): Promise<ApiSuccess<User>>;
  listWorkspaces(): Promise<ApiList<Workspace>>;
  listProjects(workspaceId: string): Promise<ApiList<Project>>;
  createProject(input: Pick<Project, "workspaceId" | "name"> & Partial<Project>): Promise<ApiSuccess<Project>>;
  listRepositories(projectId: string): Promise<ApiList<Repository>>;
  listAssets(projectId: string): Promise<ApiList<Asset>>;
}