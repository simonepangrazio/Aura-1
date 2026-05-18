import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { FaceDetector as MediaPipeFaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

interface PresenceDetectionOptions {
  enabled: boolean;
  wasmBaseUrl: string;
  modelUrl: string;
  intervalMs?: number;
}

interface PresenceDetectionState {
  isFaceDetected: boolean;
  isCameraReady: boolean;
  error: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
}

interface PresenceDetector {
  close: () => void;
  detect: (video: HTMLVideoElement) => boolean | Promise<boolean>;
}

type NativeFaceDetectorResult = unknown[];
type NativeFaceDetector = {
  detect: (source: CanvasImageSource) => Promise<NativeFaceDetectorResult>;
};
type NativeFaceDetectorConstructor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => NativeFaceDetector;

async function createMediaPipeDetector(options: PresenceDetectionOptions): Promise<PresenceDetector> {
  const vision = await FilesetResolver.forVisionTasks(options.wasmBaseUrl);
  let detector: MediaPipeFaceDetector | null = null;
  let lastError: unknown = null;

  for (const delegate of ["GPU", "CPU"] as const) {
    try {
      detector = await MediaPipeFaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: options.modelUrl,
          delegate,
        },
        runningMode: "VIDEO",
      });
      break;
    } catch (cause) {
      lastError = cause;
      detector?.close();
      detector = null;
    }
  }

  if (!detector) {
    throw lastError instanceof Error ? lastError : new Error("MediaPipe detector unavailable");
  }

  return {
    close: () => detector?.close(),
    detect: (video) => detector.detectForVideo(video, performance.now()).detections.length > 0,
  };
}

function createNativeDetector(): PresenceDetector | null {
  const NativeDetector = (window as Window & {
    FaceDetector?: NativeFaceDetectorConstructor;
  }).FaceDetector;

  if (!NativeDetector) {
    return null;
  }

  const detector = new NativeDetector({ fastMode: true, maxDetectedFaces: 1 });
  return {
    close: () => undefined,
    detect: async (video) => (await detector.detect(video)).length > 0,
  };
}

async function createPresenceDetector(options: PresenceDetectionOptions): Promise<PresenceDetector> {
  try {
    return await createMediaPipeDetector(options);
  } catch (cause) {
    const nativeDetector = createNativeDetector();
    if (nativeDetector) {
      console.info("MediaPipe presence detector unavailable, using native FaceDetector fallback.");
      return nativeDetector;
    }
    throw cause;
  }
}

export function usePresenceDetection(options: PresenceDetectionOptions): PresenceDetectionState {
  const { enabled, intervalMs, modelUrl, wasmBaseUrl } = options;
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<PresenceDetector | null>(null);
  const intervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectingRef = useRef(false);
  const positiveFramesRef = useRef(0);
  const negativeFramesRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    const detectorOptions = { enabled, intervalMs, modelUrl, wasmBaseUrl };

    async function start(): Promise<void> {
      try {
        setError(null);
        const detector = await createPresenceDetector(detectorOptions);
        if (cancelled) {
          detector.close();
          return;
        }
        detectorRef.current = detector;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;

        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);

        intervalRef.current = window.setInterval(() => {
          if (detectingRef.current) {
            return;
          }

          const video = videoRef.current;
          const detector = detectorRef.current;
          if (!video || !detector || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            return;
          }

          detectingRef.current = true;
          void Promise.resolve(detector.detect(video))
            .then((detected) => {
              if (cancelled) {
                return;
              }
              if (detected) {
                positiveFramesRef.current += 1;
                negativeFramesRef.current = 0;
              } else {
                negativeFramesRef.current += 1;
                positiveFramesRef.current = 0;
              }

              if (positiveFramesRef.current >= 2) {
                setIsFaceDetected(true);
              }
              if (negativeFramesRef.current >= 3) {
                setIsFaceDetected(false);
              }
            })
            .catch((cause) => {
              const message = cause instanceof Error ? cause.message : "Presence detection failed";
              setError(message);
              setIsFaceDetected(false);
            })
            .finally(() => {
              detectingRef.current = false;
            });
        }, intervalMs ?? 250);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Presence detection failed";
        setError(message);
        setIsFaceDetected(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      detectorRef.current?.close();
      detectorRef.current = null;
      detectingRef.current = false;
      positiveFramesRef.current = 0;
      negativeFramesRef.current = 0;
      setIsCameraReady(false);
      setIsFaceDetected(false);
    };
  }, [enabled, intervalMs, modelUrl, wasmBaseUrl]);

  return { isFaceDetected, isCameraReady, error, videoRef };
}
