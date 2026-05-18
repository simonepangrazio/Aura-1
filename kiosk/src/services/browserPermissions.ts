export async function requestFullscreenMode(): Promise<void> {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    await document.documentElement.requestFullscreen();
  }
}

async function requestMedia(constraints: MediaStreamConstraints): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  stream.getTracks().forEach((track) => track.stop());
}

export async function requestRuntimePermissions(): Promise<void> {
  await requestFullscreenMode().catch(() => undefined);
  await requestMedia({ video: true });
  await requestMedia({ audio: true }).catch(() => undefined);
}
