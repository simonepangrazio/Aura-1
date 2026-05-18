import { kioskEnv } from "../config/env";
import type { DeviceCredentials } from "../types/kiosk";

interface SessionSocketOptions {
  sessionId: string;
  credentials: DeviceCredentials;
  onMessage: (message: string) => void;
  onClose: () => void;
  onError: (error: Error) => void;
}

export function openSessionSocket(options: SessionSocketOptions): Promise<WebSocket> {
  const url = new URL(`${kioskEnv.wsBaseUrl}/session/${options.sessionId}`);
  url.searchParams.set("device_id", options.credentials.deviceId);
  url.searchParams.set("device_token", options.credentials.deviceToken);

  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url.toString());
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      settled = true;
      socket.close();
      reject(new Error("WebSocket connection timed out"));
    }, 8000);

    socket.onopen = () => {
      settled = true;
      window.clearTimeout(timeoutId);
      console.info("session started");
      resolve(socket);
    };

    socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        options.onMessage(event.data);
      }
    };

    socket.onerror = () => {
      const error = new Error("WebSocket error");
      options.onError(error);
      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
        reject(error);
      }
    };

    socket.onclose = () => {
      window.clearTimeout(timeoutId);
      if (!settled) {
        settled = true;
        reject(new Error("WebSocket connection closed"));
        return;
      }
      options.onClose();
    };
  });
}
