import type { KioskSettings } from "../types/kiosk";

function cleanUrl(value: string): string {
  return value.replace(/\/$/, "");
}

const apiBaseUrl = cleanUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1");

function defaultWsBaseUrl(): string {
  const apiUrl = new URL(apiBaseUrl);
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = "/ws";
  apiUrl.search = "";
  apiUrl.hash = "";
  return cleanUrl(apiUrl.toString());
}

export const defaultKioskSettings: KioskSettings = {
  presenceStartMs: 4000,
  absenceEndMs: 15000,
  language: "it-IT",
};

export const kioskEnv = {
  apiBaseUrl,
  wsBaseUrl: cleanUrl(import.meta.env.VITE_WS_BASE_URL ?? defaultWsBaseUrl()),
  mediaPipeWasmBaseUrl:
    import.meta.env.VITE_MEDIAPIPE_WASM_BASE_URL ??
    "/mediapipe/wasm",
  mediaPipeFaceModelUrl:
    import.meta.env.VITE_MEDIAPIPE_FACE_MODEL_URL ??
    "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
};

export function mergeKioskSettings(settings?: Partial<KioskSettings>): KioskSettings {
  return {
    ...defaultKioskSettings,
    ...settings,
  };
}
