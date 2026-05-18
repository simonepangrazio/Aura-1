import { kioskEnv } from "../config/env";
import type {
  DeviceAuthResponse,
  DeviceCredentials,
  RuntimeStatus,
  SessionStartResponse,
} from "../types/kiosk";

interface ApiErrorDetail {
  message?: unknown;
  runtime_status?: RuntimeStatus;
}

async function parseError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string") {
      return new Error(body.detail);
    }
    if (body.detail && typeof body.detail === "object") {
      const detail = body.detail as ApiErrorDetail;
      if (typeof detail.message === "string") {
        return new Error(detail.message);
      }
    }
  } catch {
    // Keep the generic error below.
  }
  return new Error(`Request failed with status ${response.status}`);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${kioskEnv.apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return response.json() as Promise<T>;
}

export function authenticateDevice(credentials: DeviceCredentials): Promise<DeviceAuthResponse> {
  return postJson<DeviceAuthResponse>("/devices/auth", {
    device_id: credentials.deviceId,
    device_token: credentials.deviceToken,
  });
}

export function startKioskSession(credentials: DeviceCredentials): Promise<SessionStartResponse> {
  return postJson<SessionStartResponse>("/sessions/start", {
    device_id: credentials.deviceId,
    device_token: credentials.deviceToken,
    session_type: "kiosk",
  });
}

export function endKioskSession(
  credentials: DeviceCredentials,
  sessionId: string,
): Promise<unknown> {
  return postJson("/sessions/end", {
    session_id: sessionId,
    device_id: credentials.deviceId,
    device_token: credentials.deviceToken,
  });
}
