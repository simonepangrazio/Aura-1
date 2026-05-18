export type KioskSessionState =
  | "IDLE"
  | "PRESENCE_DETECTED"
  | "STARTING"
  | "ACTIVE"
  | "ENDING"
  | "ERROR";

export interface DeviceCredentials {
  deviceId: string;
  deviceToken: string;
}

export interface KioskSettings {
  presenceStartMs: number;
  absenceEndMs: number;
  language: string;
}

export interface DeviceAuthResponse {
  success: boolean;
  tenant_id: string;
  agent_id: string;
  agent_name: string;
  beyond_avatar_id?: string | null;
  livekit_config: Record<string, unknown>;
  settings: Partial<KioskSettings> & Record<string, unknown>;
  runtime_status?: RuntimeStatus;
}

export interface AgentRuntimeInfo {
  id: string;
  name: string;
  language?: string | null;
  stt_provider?: string | null;
  stt_model?: string | null;
  voice_provider?: string | null;
  voice_id?: string | null;
  tts_model?: string | null;
  beyond_avatar_id?: string | null;
}

export interface AvatarRuntimeInfo {
  provider?: string | null;
  beyond_avatar_id?: string | null;
  room?: string | null;
}

export interface SessionStartResponse {
  id: string;
  session_id: string;
  tenant_id: string;
  agent_id: string;
  device_id?: string | null;
  session_type: "kiosk" | string;
  status: string;
  token: string;
  url: string;
  room: string;
  livekit_token: string;
  livekit_url: string;
  agent: AgentRuntimeInfo;
  avatar: AvatarRuntimeInfo;
  runtime_status?: RuntimeStatus;
}

export interface RuntimeError {
  title: string;
  detail: string;
}

export interface RuntimeStatus {
  ready?: boolean;
  missing?: string[];
  blocking_missing?: string[];
  warnings?: string[];
  can_start_kiosk?: boolean;
  agent_active?: boolean;
  beyond_avatar_configured?: boolean;
  beyond_api_key_configured?: boolean;
  livekit_configured?: boolean;
  n8n_configured?: boolean;
  stt_provider?: string | null;
  stt_model?: string | null;
  tts_provider?: string | null;
  tts_model?: string | null;
  tts_api_key_configured?: boolean;
  beyond_session_started?: boolean;
  beyond_session_id?: string | null;
  beyond_session_error?: {
    code?: string | null;
    status_code?: number | null;
    detail?: string | null;
  } | null;
  livekit_token_error?: string | null;
}
