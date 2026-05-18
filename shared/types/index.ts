export type SessionStatus = 'IDLE' | 'PRESENCE_DETECTED' | 'STARTING' | 'ACTIVE' | 'ENDED';

export interface DeviceConfig {
    id: number;
    tenant_id: number;
    name: string;
    location?: string;
    device_token: string;
}

export interface SessionInfo {
    id: number;
    device_id?: number;
    status: SessionStatus;
    token?: string; // LiveKit token or Beyond Presence token
    url?: string; // LiveKit WS url
}
