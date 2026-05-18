import type { ConnectionState, RemoteTrack } from "livekit-client";
import { RemoteAudio, RemoteVideo } from "./RemoteMediaRenderer";

interface AvatarStageProps {
  agentName: string;
  audioTracks: RemoteTrack[];
  connectionState: ConnectionState;
  isListening: boolean;
  lastAvatarText: string;
  lastUserText: string;
  statusLabel: string;
  videoTrack: RemoteTrack | null;
}

export function AvatarStage({
  agentName,
  audioTracks,
  connectionState,
  isListening,
  lastAvatarText,
  lastUserText,
  statusLabel,
  videoTrack,
}: AvatarStageProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {videoTrack ? (
        <RemoteVideo track={videoTrack} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#05060a]">
          <div className="flex flex-col items-center gap-7 text-center">
            <AvatarWave />
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/70">{agentName}</p>
              <h1 className="mt-4 text-5xl font-semibold text-white md:text-7xl">{statusLabel}</h1>
            </div>
          </div>
        </div>
      )}

      <RemoteAudio tracks={audioTracks} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-md border border-white/10 bg-black/45 p-4 text-white shadow-2xl backdrop-blur-md md:p-5">
          <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.24em] text-white/55">
            <span>{connectionState}</span>
            <span>{isListening ? "In ascolto" : "Audio pronto"}</span>
          </div>
          {(lastUserText || lastAvatarText) && (
            <div className="grid gap-3 text-base md:grid-cols-2 md:text-lg">
              <p className="min-h-8 text-white/85">{lastUserText || "..."}</p>
              <p className="min-h-8 text-cyan-100">{lastAvatarText || "..."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AvatarWave() {
  return (
    <div className="avatar-wave" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
