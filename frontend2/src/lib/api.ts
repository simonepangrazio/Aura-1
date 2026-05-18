export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"
).replace(/\/$/, "");

export type Role = "super_admin" | "tenant_admin" | string;

export interface UserInfo {
  id: string;
  tenant_id?: string | null;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: Role;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TenantCreatePayload {
  name: string;
  slug: string;
  email: string;
  status?: string;
  admin_email: string;
  admin_password: string;
  admin_first_name: string;
  admin_last_name: string;
  create_default_agent: boolean;
}

export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  beyond_avatar_id?: string | null;
  system_prompt?: string | null;
  n8n_webhook_url?: string | null;
  stt_provider?: string | null;
  stt_model?: string | null;
  voice_provider?: string | null;
  voice_id?: string | null;
  tts_model?: string | null;
  language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentPayload {
  tenant_id?: string | null;
  name: string;
  description?: string | null;
  beyond_avatar_id?: string | null;
  system_prompt?: string | null;
  n8n_webhook_url?: string | null;
  stt_provider?: string | null;
  stt_model?: string | null;
  voice_provider?: string | null;
  voice_id?: string | null;
  tts_model?: string | null;
  language: string;
  is_active: boolean;
}

export interface TenantCreateResponse {
  tenant: Tenant;
  admin_user: UserInfo;
  admin_credentials: {
    email: string;
    password: string;
    role: "tenant_admin";
  };
  default_agent?: Agent | null;
}

export interface Device {
  id: string;
  tenant_id: string;
  agent_id: string;
  name: string;
  location?: string | null;
  device_token?: string | null;
  settings?: Record<string, unknown> | null;
  status: string;
  last_seen?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevicePayload {
  tenant_id?: string | null;
  agent_id: string;
  name: string;
  location?: string | null;
  device_token?: string | null;
  settings?: Record<string, unknown>;
  status: string;
}

export interface Widget {
  id: string;
  tenant_id: string;
  agent_id: string;
  name: string;
  public_token?: string | null;
  allowed_domains?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RealtimeSession {
  id: string;
  tenant_id: string;
  agent_id: string;
  device_id?: string | null;
  widget_id?: string | null;
  session_type: string;
  status: string;
  started_at?: string | null;
  ended_at?: string | null;
  user_connected_at?: string | null;
  livekit_room_name?: string | null;
  conversation_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionDetail extends RealtimeSession {
  duration_seconds?: number | null;
  tenant?: { id: string; name: string } | null;
  agent?: { id: string; name: string } | null;
  device?: { id: string; name: string } | null;
  widget?: { id: string; name: string } | null;
  messages: Array<{
    id: string;
    session_id: string;
    role: string;
    message: string;
    tokens_used?: number | null;
    created_at: string;
  }>;
  events: Array<{
    id: string;
    session_id: string;
    event_type: string;
    payload: Record<string, unknown>;
    created_at: string;
  }>;
}

export interface AdminOverview {
  tenant_total: number;
  device_online: number;
  active_sessions: number;
  sessions_today: number;
  registered_users: number;
  active_agents: number;
  recent_tenants: Tenant[];
  recent_sessions: RealtimeSession[];
  recent_devices: Device[];
  uptime_status: string;
}

export interface Workflow {
  agent_id: string;
  agent_name: string;
  tenant_id: string;
  tenant_name?: string | null;
  webhook_url?: string | null;
  status: string;
}

export interface WorkflowTestResponse {
  ok: boolean;
  status_code?: number | null;
  message: string;
}

export interface WorkflowPayload {
  webhook_url?: string | null;
}

export interface ApiKeyConfig {
  id: string;
  tenant_id: string;
  provider: string;
  is_configured: boolean;
  key_preview?: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyPayload {
  tenant_id?: string | null;
  api_key?: string | null;
  settings?: Record<string, unknown>;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // Keep the generic message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token: string) {
  return request<UserInfo>("/auth/me", {}, token);
}

export function refresh(token: string) {
  return request<AuthResponse>("/auth/refresh", { method: "POST" }, token);
}

export function getAdminOverview(token: string) {
  return request<AdminOverview>("/admin/overview", {}, token);
}

export function getTenants(token: string) {
  return request<Tenant[]>("/tenants", {}, token);
}

export function getTenant(token: string, id: string) {
  return request<Tenant>(`/tenants/${id}`, {}, token);
}

export function createTenant(token: string, payload: TenantCreatePayload) {
  return request<TenantCreateResponse>("/tenants", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function updateTenant(token: string, id: string, payload: Partial<Tenant>) {
  return request<Tenant>(`/tenants/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
}

export function deleteTenant(token: string, id: string) {
  return request<{ ok: boolean }>(`/tenants/${id}`, { method: "DELETE" }, token);
}

export function getUsers(token: string) {
  return request<UserInfo[]>("/users", {}, token);
}

export function createUser(token: string, payload: Partial<UserInfo> & { email: string; password: string }) {
  return request<UserInfo>("/users", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function updateUser(token: string, id: string, payload: Partial<UserInfo>) {
  return request<UserInfo>(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
}

export function resetUserPassword(token: string, id: string, password: string) {
  return request<UserInfo>(`/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  }, token);
}

export function deleteUser(token: string, id: string) {
  return request<{ ok: boolean }>(`/users/${id}`, { method: "DELETE" }, token);
}

export function getAgents(token: string) {
  return request<Agent[]>("/agents", {}, token);
}

export function createAgent(token: string, payload: AgentPayload) {
  return request<Agent>("/agents", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function updateAgent(token: string, id: string, payload: Partial<AgentPayload>) {
  return request<Agent>(`/agents/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
}

export function deleteAgent(token: string, id: string) {
  return request<{ ok: boolean }>(`/agents/${id}`, { method: "DELETE" }, token);
}

export function getDevices(token: string) {
  return request<Device[]>("/devices", {}, token);
}

export function createDevice(token: string, payload: DevicePayload) {
  return request<Device>("/devices", { method: "POST", body: JSON.stringify(payload) }, token);
}

export function updateDevice(token: string, id: string, payload: Partial<DevicePayload>) {
  return request<Device>(`/devices/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
}

export function regenerateDeviceToken(token: string, id: string) {
  return request<Device>(`/devices/${id}/regenerate-token`, { method: "POST" }, token);
}

export function deleteDevice(token: string, id: string) {
  return request<{ ok: boolean }>(`/devices/${id}`, { method: "DELETE" }, token);
}

export function getWidgets(token: string) {
  return request<Widget[]>("/widgets", {}, token);
}

export function getSessions(token: string) {
  return request<RealtimeSession[]>("/sessions", {}, token);
}

export function getSession(token: string, id: string) {
  return request<SessionDetail>(`/sessions/${id}`, {}, token);
}

export function getWorkflows(token: string) {
  return request<Workflow[]>("/workflows", {}, token);
}

export function getApiKeys(token: string, tenantId?: string | null) {
  const query = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : "";
  return request<ApiKeyConfig[]>(`/api-keys${query}`, {}, token);
}

export function upsertApiKey(token: string, provider: string, payload: ApiKeyPayload) {
  return request<ApiKeyConfig>(`/api-keys/${encodeURIComponent(provider)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteApiKey(token: string, provider: string, tenantId?: string | null) {
  const query = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : "";
  return request<{ ok: boolean }>(`/api-keys/${encodeURIComponent(provider)}${query}`, { method: "DELETE" }, token);
}

export function updateWorkflow(token: string, agentId: string, payload: WorkflowPayload) {
  return request<Workflow>(`/workflows/${agentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteWorkflow(token: string, agentId: string) {
  return request<Workflow>(`/workflows/${agentId}`, { method: "DELETE" }, token);
}

export function testWorkflow(token: string, agentId: string) {
  return request<WorkflowTestResponse>("/workflows/test", {
    method: "POST",
    body: JSON.stringify({ agent_id: agentId }),
  }, token);
}
