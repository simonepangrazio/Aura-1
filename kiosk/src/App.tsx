import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceSetupPage } from "./pages/DeviceSetupPage";
import { KioskRuntimePage } from "./pages/KioskRuntimePage";
import { authenticateDevice } from "./services/apiClient";
import {
  clearDeviceCredentials,
  readDeviceCredentials,
  saveDeviceCredentials,
} from "./services/deviceStorage";
import type { DeviceAuthResponse, DeviceCredentials } from "./types/kiosk";

type AppPhase = "setup" | "authenticating" | "runtime";

function App() {
  const [credentials, setCredentials] = useState<DeviceCredentials | null>(() =>
    readDeviceCredentials(),
  );
  const [auth, setAuth] = useState<DeviceAuthResponse | null>(null);
  const [phase, setPhase] = useState<AppPhase>(credentials ? "authenticating" : "setup");
  const [setupError, setSetupError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const didBootRef = useRef(false);
  const connectDeviceRef = useRef<
    (nextCredentials: DeviceCredentials, shouldPersist: boolean) => Promise<void>
  >(async () => undefined);

  const connectDevice = useCallback(
    async (nextCredentials: DeviceCredentials, shouldPersist: boolean): Promise<void> => {
      setPhase("authenticating");
      setSetupError(null);
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      try {
        const response = await authenticateDevice(nextCredentials);
        if (shouldPersist) {
          saveDeviceCredentials(nextCredentials);
        }
        setCredentials(nextCredentials);
        setAuth(response);
        setPhase("runtime");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Autenticazione device fallita";
        setSetupError(message);
        setAuth(null);

        if (message.toLowerCase().includes("invalid device credentials")) {
          clearDeviceCredentials();
          setCredentials(null);
          setPhase("setup");
          return;
        }

        setPhase(nextCredentials ? "authenticating" : "setup");
        retryTimeoutRef.current = window.setTimeout(() => {
          void connectDeviceRef.current(nextCredentials, shouldPersist);
        }, 5000);
      }
    },
    [],
  );

  useEffect(() => {
    connectDeviceRef.current = connectDevice;
  }, [connectDevice]);

  useEffect(() => {
    if (!didBootRef.current && credentials) {
      didBootRef.current = true;
      void connectDevice(credentials, false);
    }

    return () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [connectDevice, credentials]);

  const handleSetupSubmit = useCallback(
    async (nextCredentials: DeviceCredentials) => {
      await connectDevice(nextCredentials, true);
    },
    [connectDevice],
  );

  const handleFatalAuthError = useCallback(() => {
    clearDeviceCredentials();
    setCredentials(null);
    setAuth(null);
    setPhase("setup");
  }, []);

  if (phase === "runtime" && auth && credentials) {
    return (
      <KioskRuntimePage
        auth={auth}
        credentials={credentials}
        onFatalAuthError={handleFatalAuthError}
      />
    );
  }

  if (phase === "authenticating") {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#05060a] px-6 text-center text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.34em] text-cyan-200/70">
            Beyond Presence Kiosk
          </p>
          <h1 className="mt-5 text-5xl font-semibold md:text-7xl">Connessione device</h1>
          {setupError && <p className="mt-6 text-base text-white/60">{setupError}</p>}
        </div>
      </main>
    );
  }

  return <DeviceSetupPage error={setupError} onSubmit={handleSetupSubmit} />;
}

export default App;
