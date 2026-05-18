import type { KioskSessionState, RuntimeError } from "../types/kiosk";

export interface KioskMachineState {
  status: KioskSessionState;
  error: RuntimeError | null;
}

export type KioskMachineEvent =
  | { type: "FACE_DETECTED" }
  | { type: "FACE_LOST" }
  | { type: "START_REQUESTED" }
  | { type: "REALTIME_READY" }
  | { type: "END_REQUESTED" }
  | { type: "RESET" }
  | { type: "ERROR"; error: RuntimeError };

export const initialKioskState: KioskMachineState = {
  status: "IDLE",
  error: null,
};

export function kioskReducer(
  state: KioskMachineState,
  event: KioskMachineEvent,
): KioskMachineState {
  switch (event.type) {
    case "FACE_DETECTED":
      if (state.status !== "IDLE") {
        return state;
      }
      return { status: "PRESENCE_DETECTED", error: null };
    case "FACE_LOST":
      if (state.status !== "PRESENCE_DETECTED") {
        return state;
      }
      return { status: "IDLE", error: null };
    case "START_REQUESTED":
      if (state.status !== "PRESENCE_DETECTED" && state.status !== "IDLE") {
        return state;
      }
      return { status: "STARTING", error: null };
    case "REALTIME_READY":
      if (state.status !== "STARTING") {
        return state;
      }
      return { status: "ACTIVE", error: null };
    case "END_REQUESTED":
      if (state.status === "ENDING" || state.status === "IDLE") {
        return state;
      }
      return { status: "ENDING", error: null };
    case "ERROR":
      return { status: "ERROR", error: event.error };
    case "RESET":
      return initialKioskState;
    default:
      return state;
  }
}
