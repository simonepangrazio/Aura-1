import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { kioskEnv, mergeKioskSettings } from "../config/env";
import { AvatarStage, AvatarWave } from "../components/AvatarStage";
import { PresenceCamera } from "../components/PresenceCamera";
import { useLiveKitRoom } from "../hooks/useLiveKitRoom";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { usePresenceDetection } from "../presence/usePresenceDetection";
import { endKioskSession, startKioskSession } from "../services/apiClient";
import { openSessionSocket } from "../realtime/sessionSocket";
import {
  initialKioskState,
  kioskReducer,
} from "../state/kioskMachine";
import type {
  DeviceAuthResponse,
  DeviceCredentials,
  KioskSettings,
  SessionStartResponse,
} from "../types/kiosk";

interface KioskRuntimePageProps {
  auth: DeviceAuthResponse;
  credentials: DeviceCredentials;
  onFatalAuthError: () => void;
}

export function KioskRuntimePage({
  auth,
  credentials,
  onFatalAuthError,
}: KioskRuntimePageProps) {
  const [machine, dispatch] = useReducer(kioskReducer, initialKioskState);
  const [activeSession, setActiveSession] = useState<SessionStartResponse | null>(null);
  const [lastUserText, setLastUserText] = useState("");
  const [lastAvatarText, setLastAvatarText] = useState("");
  const sessionStateRef = useRef(machine.status);
  const startTimerRef = useRef<number | null>(null);
  const startProgressIntervalRef = useRef<number | null>(null);
  const absenceTimerRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const startingRef = useRef(false);
  const endingRef = useRef(false);
  const [presenceProgress, setPresenceProgress] = useState(0);

  const settings = useMemo<KioskSettings>(
    () => mergeKioskSettings(auth.settings),
    [auth.settings],
  );
  const canStartKiosk = auth.runtime_status?.can_start_kiosk ?? true;
  const authRuntimeIssue = useMemo(
    () => describeRuntimeIssue(auth.runtime_status, { requireBeyondStarted: false }),
    [auth.runtime_status],
  );

  useEffect(() => {
    sessionStateRef.current = machine.status;
  }, [machine.status]);

  const clearStartCountdown = useCallback(() => {
    if (startTimerRef.current) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
    if (startProgressIntervalRef.current) {
      window.clearInterval(startProgressIntervalRef.current);
      startProgressIntervalRef.current = null;
    }
  }, []);

  const {
    audioTracks,
    connectionState,
    connect: connectLiveKit,
    disconnect: disconnectLiveKit,
    videoTrack,
  } = useLiveKitRoom({
    onDisconnected: () => {
      console.info("livekit disconnected");
      if (sessionStateRef.current === "ACTIVE") {
        dispatch({
          type: "ERROR",
          error: {
            title: "Connessione interrotta",
            detail: "La sessione realtime verra ripristinata automaticamente.",
          },
        });
      }
    },
    onError: (error) => {
      console.info("error", error.message);
    },
  });

  const presence = usePresenceDetection({
    enabled: true,
    wasmBaseUrl: kioskEnv.mediaPipeWasmBaseUrl,
    modelUrl: kioskEnv.mediaPipeFaceModelUrl,
  });

  const sendTranscript = useCallback((text: string) => {
    setLastUserText(text);
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(text);
    }
  }, []);

  const speech = useSpeechRecognition({
    enabled: machine.status === "ACTIVE",
    language: settings.language,
    onFinalTranscript: sendTranscript,
    onError: (error) => console.info("error", error.message),
  });

  useEffect(() => {
    if (presence.error) {
      dispatch({
        type: "ERROR",
        error: {
          title: "Camera non disponibile",
          detail: presence.error,
        },
      });
    }
  }, [presence.error]);

  useEffect(() => {
    if (machine.status === "IDLE" && presence.isFaceDetected) {
      console.info("presence detected");
      dispatch({ type: "FACE_DETECTED" });
      return;
    }

    if (machine.status === "PRESENCE_DETECTED" && !presence.isFaceDetected) {
      console.info("presence lost");
      clearStartCountdown();
      dispatch({ type: "FACE_LOST" });
      return;
    }

    if (
      machine.status === "PRESENCE_DETECTED" &&
      presence.isFaceDetected &&
      canStartKiosk &&
      !startTimerRef.current
    ) {
      const startedAt = performance.now();
      queueMicrotask(() => setPresenceProgress(0));
      startProgressIntervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        setPresenceProgress(Math.min(1, elapsed / settings.presenceStartMs));
      }, 100);
      startTimerRef.current = window.setTimeout(() => {
        clearStartCountdown();
        setPresenceProgress(0);
        dispatch({ type: "START_REQUESTED" });
      }, settings.presenceStartMs);
    }
  }, [canStartKiosk, clearStartCountdown, machine.status, presence.isFaceDetected, settings.presenceStartMs]);

  useEffect(() => {
    if (machine.status !== "ACTIVE") {
      if (absenceTimerRef.current) {
        window.clearTimeout(absenceTimerRef.current);
        absenceTimerRef.current = null;
      }
      return;
    }

    if (!presence.isFaceDetected && !absenceTimerRef.current) {
      console.info("presence lost");
      absenceTimerRef.current = window.setTimeout(() => {
        absenceTimerRef.current = null;
        dispatch({ type: "END_REQUESTED" });
      }, settings.absenceEndMs);
    }

    if (presence.isFaceDetected && absenceTimerRef.current) {
      window.clearTimeout(absenceTimerRef.current);
      absenceTimerRef.current = null;
      console.info("presence detected");
    }
  }, [machine.status, presence.isFaceDetected, settings.absenceEndMs]);

  useEffect(() => {
    if (machine.status !== "STARTING" || startingRef.current) {
      return;
    }

    startingRef.current = true;
    let cancelled = false;

    async function startRealtime(): Promise<void> {
      let startedSession: SessionStartResponse | null = null;
      try {
        const session = await startKioskSession(credentials);
        startedSession = session;
        if (cancelled) {
          return;
        }
        const runtimeError = describeRuntimeIssue(session.runtime_status);
        if (runtimeError) {
          throw new Error(runtimeError);
        }

        setActiveSession(session);
        setLastAvatarText("");
        setLastUserText("");

        const socket = await openSessionSocket({
          sessionId: session.session_id,
          credentials,
          onMessage: (message) => setLastAvatarText(message),
          onClose: () => {
            if (sessionStateRef.current === "ACTIVE") {
              dispatch({
                type: "ERROR",
                error: {
                  title: "Realtime disconnesso",
                  detail: "Il canale conversazionale si e chiuso.",
                },
              });
            }
          },
          onError: (error) => console.info("error", error.message),
        });
        socketRef.current = socket;

        await connectLiveKit(session.livekit_url, session.livekit_token);
        if (!cancelled) {
          dispatch({ type: "REALTIME_READY" });
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Impossibile avviare la sessione";
        if (startedSession?.session_id) {
          await endKioskSession(credentials, startedSession.session_id).catch((endError) => {
            console.info("error", endError instanceof Error ? endError.message : "End session failed");
          });
        }
        setActiveSession(null);
        dispatch({
          type: "ERROR",
          error: {
            title: "Sessione non avviata",
            detail,
          },
        });
      } finally {
        startingRef.current = false;
      }
    }

    void startRealtime();

    return () => {
      cancelled = true;
    };
  }, [connectLiveKit, credentials, machine.status]);

  useEffect(() => {
    if (machine.status !== "ENDING" || endingRef.current) {
      return;
    }

    endingRef.current = true;

    async function endRealtime(): Promise<void> {
      try {
        socketRef.current?.close();
        socketRef.current = null;
        disconnectLiveKit();

        if (activeSession) {
          await endKioskSession(credentials, activeSession.session_id);
        }

        console.info("livekit disconnected");
      } catch (error) {
        console.info("error", error instanceof Error ? error.message : "End session failed");
      } finally {
        setActiveSession(null);
        setLastAvatarText("");
        setLastUserText("");
        endingRef.current = false;
        dispatch({ type: "RESET" });
      }
    }

    void endRealtime();
  }, [activeSession, credentials, disconnectLiveKit, machine.status]);

  useEffect(() => {
    if (machine.status !== "ERROR") {
      return undefined;
    }

    socketRef.current?.close();
    socketRef.current = null;
    disconnectLiveKit();
    const sessionToClose = activeSession;
    if (sessionToClose) {
      void endKioskSession(credentials, sessionToClose.session_id)
        .catch((error) => console.info("error", error instanceof Error ? error.message : "End session failed"))
        .finally(() => setActiveSession(null));
    }

    const timeoutId = window.setTimeout(() => {
      if (machine.error?.detail.includes("Invalid device credentials")) {
        onFatalAuthError();
        return;
      }
      setActiveSession(null);
      dispatch({ type: "RESET" });
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [activeSession, credentials, disconnectLiveKit, machine.error, machine.status, onFatalAuthError]);

  useEffect(() => {
    return () => {
      if (startTimerRef.current) {
        window.clearTimeout(startTimerRef.current);
      }
      if (startProgressIntervalRef.current) {
        window.clearInterval(startProgressIntervalRef.current);
      }
      if (absenceTimerRef.current) {
        window.clearTimeout(absenceTimerRef.current);
      }
      socketRef.current?.close();
      disconnectLiveKit();
    };
  }, [disconnectLiveKit]);

  const statusLabel = getStatusLabel(machine.status, Boolean(videoTrack));
  const shouldShowActiveStage =
    machine.status === "STARTING" || machine.status === "ACTIVE" || machine.status === "ENDING";

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#05060a] text-white">
      {shouldShowActiveStage ? (
        <AvatarStage
          agentName={auth.agent_name}
          audioTracks={audioTracks}
          connectionState={connectionState}
          isListening={speech.isListening}
          lastAvatarText={lastAvatarText}
          lastUserText={lastUserText}
          statusLabel={statusLabel}
          videoTrack={videoTrack}
        />
      ) : (
        <IdleAttract
          agentName={auth.agent_name}
          isCameraReady={presence.isCameraReady}
          isSpeechSupported={speech.isSupported}
          presenceProgress={presenceProgress}
          status={machine.status}
          error={machine.error?.detail ?? authRuntimeIssue}
        />
      )}

      <PresenceCamera videoRef={presence.videoRef} />
    </main>
  );
}

function describeRuntimeIssue(
  status?: SessionStartResponse["runtime_status"],
  options: { requireBeyondStarted?: boolean } = {},
): string | null {
  if (!status) {
    return null;
  }
  const missing = status.blocking_missing?.length ? status.blocking_missing : status.missing ?? [];
  if (missing.length === 0) {
    if (status.livekit_token_error) {
      return `LiveKit non avviato: ${status.livekit_token_error}`;
    }
    if (options.requireBeyondStarted !== false && status.beyond_session_started === false) {
      const detail = status.beyond_session_error?.detail;
      return detail
        ? `Avatar Beyond non avviato: ${detail}`
        : "Avatar Beyond non avviato. Verifica Beyond Avatar ID, API key Beyond e configurazione LiveKit.";
    }
    return null;
  }
  const labels: Record<string, string> = {
    agent: "Agent",
    agent_active: "Agent attivo",
    beyond_avatar_configured: "Beyond Avatar ID",
    beyond_api_key_configured: "API key Beyond",
    livekit_configured: "LiveKit",
    n8n_configured: "Webhook N8N",
    tts_api_key_configured: "API key TTS",
  };
  return `Configurazione runtime incompleta: ${missing.map((item) => labels[item] || item).join(", ")}.`;
}

function getStatusLabel(status: string, hasVideo: boolean): string {
  if (hasVideo) {
    return "Avatar attivo";
  }
  if (status === "STARTING") {
    return "Connessione avatar";
  }
  if (status === "ENDING") {
    return "Chiusura sessione";
  }
  return "Avatar in arrivo";
}

interface IdleAttractProps {
  agentName: string;
  error: string | null;
  isCameraReady: boolean;
  isSpeechSupported: boolean;
  presenceProgress: number;
  status: string;
}

function IdleAttract({
  agentName,
  error,
  isCameraReady,
  isSpeechSupported,
  presenceProgress,
  status,
}: IdleAttractProps) {
  const headline =
    status === "PRESENCE_DETECTED"
      ? "Resta davanti allo schermo"
      : status === "ERROR"
        ? "Ripristino connessione"
        : "Benvenuto";

  return (
    <section className="flex min-h-svh items-center justify-center px-8">
      <div className="max-w-4xl text-center">
        <div className="mb-10 flex justify-center">
          <AvatarWave />
        </div>
        <p className="text-sm uppercase tracking-[0.34em] text-cyan-200/70">{agentName}</p>
        <h1 className="mt-5 text-6xl font-semibold text-white md:text-8xl">{headline}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-white/60">
          {status === "PRESENCE_DETECTED"
            ? error
              ? "Completa la configurazione runtime prima di avviare una sessione."
              : "La sessione realtime si avviera automaticamente."
            : "Avvicinati al totem per iniziare la conversazione."}
        </p>
        {status === "PRESENCE_DETECTED" ? (
          <div className="mx-auto mt-7 max-w-sm">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cyan-200 transition-[width] duration-100"
                style={{ width: `${Math.round(presenceProgress * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/40">
              {presenceProgress >= 1 ? "Avvio sessione" : "Presenza confermata"}
            </p>
          </div>
        ) : null}
        {error && <p className="mt-5 text-sm text-red-100/80">{error}</p>}
        <div className="mt-10 flex justify-center gap-3 text-xs uppercase tracking-[0.2em] text-white/35">
          <span>{isCameraReady ? "Camera pronta" : "Camera"}</span>
          <span>{isSpeechSupported ? "Microfono pronto" : "Microfono non supportato"}</span>
        </div>
      </div>
    </section>
  );
}
