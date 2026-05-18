import type { DeviceCredentials } from "../types/kiosk";

interface KioskSetupQrPayload {
  type: "beyond.kiosk.setup";
  version: 1;
  device_id: string;
  device_token: string;
}

export function parseKioskSetupQrPayload(value: string): DeviceCredentials {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("QR setup non valido");
  }

  const payload = parsed as Partial<KioskSetupQrPayload>;
  if (
    payload.type !== "beyond.kiosk.setup" ||
    payload.version !== 1 ||
    typeof payload.device_id !== "string" ||
    typeof payload.device_token !== "string" ||
    !payload.device_id.trim() ||
    !payload.device_token.trim()
  ) {
    throw new Error("QR setup non riconosciuto");
  }

  return {
    deviceId: payload.device_id.trim(),
    deviceToken: payload.device_token.trim(),
  };
}
