import { useEffect, useRef } from "react";
import type { RemoteTrack } from "livekit-client";

interface RemoteVideoProps {
  track: RemoteTrack | null;
}

interface RemoteAudioProps {
  tracks: RemoteTrack[];
}

export function RemoteVideo({ track }: RemoteVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !track) {
      return undefined;
    }

    const element = track.attach() as HTMLVideoElement;
    element.autoplay = true;
    element.playsInline = true;
    element.className = "h-full w-full object-cover";
    container.replaceChildren(element);

    return () => {
      track.detach(element);
      element.remove();
      container.replaceChildren();
    };
  }, [track]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full bg-black" />;
}

export function RemoteAudio({ tracks }: RemoteAudioProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const elements = tracks.map((track) => {
      const element = track.attach() as HTMLAudioElement;
      element.autoplay = true;
      element.controls = false;
      container.appendChild(element);
      return { track, element };
    });

    return () => {
      elements.forEach(({ track, element }) => {
        track.detach(element);
        element.remove();
      });
    };
  }, [tracks]);

  return <div ref={containerRef} aria-hidden="true" className="hidden" />;
}
