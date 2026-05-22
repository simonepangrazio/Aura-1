import type { DeviceCredentials } from "../types/kiosk";

const DEVICE_ID_KEY = "beyond.kiosk.deviceId";
const DEVICE_TOKEN_KEY = "beyond.kiosk.deviceToken";

export function readDeviceCredentials(): DeviceCredentials | null {
  const deviceId = window.localStorage.getItem(DEVICE_ID_KEY);
  const deviceToken = window.localStorage.getItem(DEVICE_TOKEN_KEY);

  if (!deviceId || !deviceToken) {
    return null;
  }

  return { deviceId, deviceToken };
}

export function readDeviceCredentialsFromUrl(): DeviceCredentials | null {
  const params = new URLSearchParams(window.location.search);
  const deviceId = params.get("device_id")?.trim();
  const deviceToken = params.get("device_token")?.trim();

  if (!deviceId || !deviceToken) {
    return null;
  }

  return { deviceId, deviceToken };
}

export function saveDeviceCredentials(credentials: DeviceCredentials): void {
  window.localStorage.setItem(DEVICE_ID_KEY, credentials.deviceId.trim());
  window.localStorage.setItem(DEVICE_TOKEN_KEY, credentials.deviceToken.trim());
}

export function clearDeviceCredentials(): void {
  window.localStorage.removeItem(DEVICE_ID_KEY);
  window.localStorage.removeItem(DEVICE_TOKEN_KEY);
}

export function clearDeviceCredentialsFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("device_id");
  url.searchParams.delete("device_token");
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}
