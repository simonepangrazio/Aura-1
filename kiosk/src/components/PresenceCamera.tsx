import type { RefObject } from "react";

interface PresenceCameraProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function PresenceCamera({ videoRef }: PresenceCameraProps) {
  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      autoPlay
      muted
      playsInline
      className="pointer-events-none absolute h-px w-px opacity-0"
    />
  );
}
