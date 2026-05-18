import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionState,
  Room,
  RoomEvent,
  type RemoteTrack,
} from "livekit-client";

interface UseLiveKitRoomOptions {
  onDisconnected: () => void;
  onError: (error: Error) => void;
}

interface LiveKitRoomState {
  audioTracks: RemoteTrack[];
  connectionState: ConnectionState;
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => void;
  videoTrack: RemoteTrack | null;
}

function uniqueTracks(tracks: RemoteTrack[], nextTrack: RemoteTrack): RemoteTrack[] {
  if (tracks.includes(nextTrack)) {
    return tracks;
  }
  return [...tracks, nextTrack];
}

export function useLiveKitRoom(options: UseLiveKitRoomOptions): LiveKitRoomState {
  const roomRef = useRef<Room | null>(null);
  const onDisconnectedRef = useRef(options.onDisconnected);
  const onErrorRef = useRef(options.onError);
  const [videoTrack, setVideoTrack] = useState<RemoteTrack | null>(null);
  const [audioTracks, setAudioTracks] = useState<RemoteTrack[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

  useEffect(() => {
    onDisconnectedRef.current = options.onDisconnected;
    onErrorRef.current = options.onError;
  }, [options.onDisconnected, options.onError]);

  const disconnect = useCallback(() => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setVideoTrack(null);
    setAudioTracks([]);
    setConnectionState(ConnectionState.Disconnected);
  }, []);

  const connect = useCallback(
    async (url: string, token: string) => {
      disconnect();

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      const onTrackSubscribed = (track: RemoteTrack) => {
        if (track.kind === "video") {
          setVideoTrack((current) => current ?? track);
        }
        if (track.kind === "audio") {
          setAudioTracks((current) => uniqueTracks(current, track));
        }
      };

      const onTrackUnsubscribed = (track: RemoteTrack) => {
        if (track.kind === "video") {
          setVideoTrack((current) => (current === track ? null : current));
        }
        if (track.kind === "audio") {
          setAudioTracks((current) => current.filter((item) => item !== track));
        }
      };

      room
        .on(RoomEvent.TrackSubscribed, onTrackSubscribed)
        .on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
        .on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
          setConnectionState(state);
        })
        .on(RoomEvent.Reconnected, () => {
          console.info("livekit connected");
        })
        .on(RoomEvent.Disconnected, () => {
          setConnectionState(ConnectionState.Disconnected);
          onDisconnectedRef.current();
        });

      try {
        await room.connect(url, token, { autoSubscribe: true });
        await room.startAudio().catch(() => undefined);
        setConnectionState(room.state);
        console.info("livekit connected");
      } catch (error) {
        onErrorRef.current(error instanceof Error ? error : new Error("LiveKit connection failed"));
        disconnect();
        throw error;
      }
    },
    [disconnect],
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    audioTracks,
    connectionState,
    connect,
    disconnect,
    videoTrack,
  };
}
