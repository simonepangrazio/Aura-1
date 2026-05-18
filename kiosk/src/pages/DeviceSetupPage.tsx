import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { requestRuntimePermissions } from "../services/browserPermissions";
import { parseKioskSetupQrPayload } from "../services/qrSetup";
import type { DeviceCredentials } from "../types/kiosk";

interface DeviceSetupPageProps {
  error: string | null;
  onSubmit: (credentials: DeviceCredentials) => Promise<void>;
}

export function DeviceSetupPage({ error, onSubmit }: DeviceSetupPageProps) {
  const [deviceId, setDeviceId] = useState("");
  const [deviceToken, setDeviceToken] = useState("");
  const [setupMode, setSetupMode] = useState<"manual" | "qr">("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const didScanRef = useRef(false);

  const submitCredentials = useCallback(
    async (credentials: DeviceCredentials): Promise<void> => {
      setLocalError(null);
      setIsSubmitting(true);

      try {
        await requestRuntimePermissions();
        await onSubmit({
          deviceId: credentials.deviceId.trim(),
          deviceToken: credentials.deviceToken.trim(),
        });
      } catch (cause) {
        setLocalError(cause instanceof Error ? cause.message : "Setup non riuscito");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await submitCredentials({
      deviceId,
      deviceToken,
    });
  }

  useEffect(() => {
    if (setupMode !== "qr") {
      return undefined;
    }

    didScanRef.current = false;
    const codeReader = new BrowserQRCodeReader();
    let controls: IScannerControls | null = null;
    let stopped = false;

    async function startScanner() {
      try {
        const video = videoRef.current;
        if (!video) return;
        controls = await codeReader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          video,
          (result) => {
            if (!result || didScanRef.current) return;
            try {
              const credentials = parseKioskSetupQrPayload(result.getText());
              didScanRef.current = true;
              setDeviceId(credentials.deviceId);
              setDeviceToken(credentials.deviceToken);
              controls?.stop();
              void submitCredentials(credentials);
            } catch (cause) {
              setLocalError(cause instanceof Error ? cause.message : "QR setup non valido");
            }
          },
        );
      } catch (cause) {
        if (!stopped) {
          setLocalError(cause instanceof Error ? cause.message : "Camera QR non disponibile");
        }
      }
    }

    void startScanner();

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [setupMode, submitCredentials]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#05060a] px-6 text-white">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-xl rounded-md border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-md"
      >
        <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">Beyond Presence Kiosk</p>
        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">Setup dispositivo</h1>
        <p className="mt-4 text-base leading-7 text-white/65">
          Inserisci le credenziali del device create dal backend o inquadra il QR generato dalla
          dashboard. Verranno salvate solo su questo browser.
        </p>

        <div className="mt-7 grid grid-cols-2 rounded-md border border-white/10 bg-black/30 p-1">
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              setSetupMode("manual");
            }}
            className={`h-10 rounded-sm text-sm font-semibold transition ${
              setupMode === "manual" ? "bg-cyan-200 text-slate-950" : "text-white/65 hover:text-white"
            }`}
          >
            Manuale
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              setSetupMode("qr");
            }}
            className={`h-10 rounded-sm text-sm font-semibold transition ${
              setupMode === "qr" ? "bg-cyan-200 text-slate-950" : "text-white/65 hover:text-white"
            }`}
          >
            QR code
          </button>
        </div>

        {setupMode === "qr" ? (
          <div className="mt-8 overflow-hidden rounded-md border border-white/10 bg-black">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
            <p className="border-t border-white/10 p-3 text-center text-sm text-white/55">
              Inquadra il QR setup dalla dashboard Devices.
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm text-white/70">
            Device ID
            <input
              value={deviceId}
              onChange={(event) => setDeviceId(event.target.value)}
              required
              autoComplete="off"
              className="h-12 rounded-md border border-white/10 bg-black/35 px-4 text-base text-white outline-none transition focus:border-cyan-200/70"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/70">
            Device token
            <input
              value={deviceToken}
              onChange={(event) => setDeviceToken(event.target.value)}
              required
              autoComplete="off"
              type="password"
              className="h-12 rounded-md border border-white/10 bg-black/35 px-4 text-base text-white outline-none transition focus:border-cyan-200/70"
            />
          </label>
        </div>

        {(error || localError) && (
          <p className="mt-5 rounded-md border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
            {localError ?? error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 h-12 w-full rounded-md bg-cyan-200 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Connessione..." : "Avvia kiosk"}
        </button>
      </form>
    </main>
  );
}
