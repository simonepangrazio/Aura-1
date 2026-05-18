import json
import os
import time
import urllib.error
import urllib.request

import cv2


SERVER_URL = os.getenv("AURA_VISION_SERVER_URL", "http://localhost:3000/vision/status")
TIMEOUT_USCITA = 3
HEARTBEAT_SECONDS = 1.5
LOOKING_FRAMES_REQUIRED = 5
NOT_LOOKING_FRAMES_REQUIRED = 8
MAX_FACE_CENTER_OFFSET = 0.24
MIN_FACE_WIDTH_RATIO = 0.12
MIN_EYES_REQUIRED = int(os.getenv("AURA_MIN_EYES_REQUIRED", "1"))


def publish_status(looking_at_camera, reason, yaw=None, pitch=None):
    payload = {
        "lookingAtCamera": bool(looking_at_camera),
        "reason": reason,
        "yaw": yaw,
        "pitch": pitch,
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        SERVER_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=1) as response:
            response.read()
    except (urllib.error.URLError, TimeoutError) as error:
        print(f"Backend non raggiungibile ({SERVER_URL}): {error}")


def load_cascade(filename):
    path = os.path.join(cv2.data.haarcascades, filename)
    cascade = cv2.CascadeClassifier(path)

    if cascade.empty():
        raise RuntimeError(f"Modello OpenCV non trovato: {path}")

    return cascade


def detect_attention(image, face_cascade, eye_cascade):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    height, width = gray.shape[:2]

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80),
    )

    if len(faces) == 0:
        return None

    x, y, w, h = max(faces, key=lambda face: face[2] * face[3])
    face_center_x = x + w / 2
    face_center_y = y + h / 2
    center_offset = abs(face_center_x - width / 2) / (width / 2)
    face_width_ratio = w / width

    eye_y0 = int(h * 0.18)
    eye_y1 = int(h * 0.62)
    eye_x0 = int(w * 0.08)
    eye_x1 = int(w * 0.92)
    eye_region = gray[y + eye_y0:y + eye_y1, x + eye_x0:x + eye_x1]
    eyes = eye_cascade.detectMultiScale(
        eye_region,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(18, 18),
    )
    eye_boxes = [(x + eye_x0 + ex, y + eye_y0 + ey, ew, eh) for ex, ey, ew, eh in eyes]
    eye_count = len(eye_boxes)

    looking_at_camera = (
        center_offset <= MAX_FACE_CENTER_OFFSET
        and face_width_ratio >= MIN_FACE_WIDTH_RATIO
        and eye_count >= MIN_EYES_REQUIRED
    )

    if face_width_ratio < MIN_FACE_WIDTH_RATIO:
        reason = "face-too-far"
    elif center_offset > MAX_FACE_CENTER_OFFSET:
        reason = "face-not-centered"
    elif eye_count < MIN_EYES_REQUIRED:
        reason = "eyes-not-visible"
    else:
        reason = "looking-at-camera"

    yaw = ((face_center_x - width / 2) / (width / 2)) * 30
    pitch = ((face_center_y - height / 2) / (height / 2)) * 20

    return {
        "bbox": (x, y, w, h),
        "eyes": eye_boxes,
        "pitch": pitch,
        "yaw": yaw,
        "reason": reason,
        "looking_at_camera": looking_at_camera,
    }


def draw_status(image, looking_at_camera, reason, attention):
    color = (16, 185, 129) if looking_at_camera else (244, 63, 94)
    label = "GUARDA LA CAMERA" if looking_at_camera else "ATTESA SGUARDO"
    cv2.putText(image, label, (24, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
    cv2.putText(image, reason, (24, 76), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 1)

    if attention:
        x, y, w, h = attention["bbox"]
        cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)

        for ex, ey, ew, eh in attention["eyes"]:
            cv2.rectangle(image, (ex, ey), (ex + ew, ey + eh), (34, 211, 238), 1)

        cv2.putText(
            image,
            f"yaw={attention['yaw']:.1f} pitch={attention['pitch']:.1f} eyes={len(attention['eyes'])}",
            (24, 108),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (212, 212, 216),
            1,
        )


def main():
    face_cascade = load_cascade("haarcascade_frontalface_default.xml")
    eye_cascade = load_cascade("haarcascade_eye_tree_eyeglasses.xml")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Impossibile aprire la webcam.")

    avatar_attivo = False
    ultimo_volto = 0
    ultimo_invio = 0
    looking_frames = 0
    not_looking_frames = 0
    last_payload = None

    print("Sistema di rilevamento avviato. Premi ESC per uscire.")
    print(f"Invio stato al backend: {SERVER_URL}")

    try:
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                continue

            image = cv2.flip(image, 1)
            attention = detect_attention(image, face_cascade, eye_cascade)
            reason = "no-face"
            looking_now = False

            if attention:
                ultimo_volto = time.time()
                reason = attention["reason"]

                if attention["looking_at_camera"]:
                    looking_frames += 1
                    not_looking_frames = 0
                    looking_now = looking_frames >= LOOKING_FRAMES_REQUIRED
                else:
                    looking_frames = 0
                    not_looking_frames += 1
            elif avatar_attivo and time.time() - ultimo_volto <= TIMEOUT_USCITA:
                looking_now = True
                reason = "face-timeout-grace"
            else:
                looking_frames = 0
                not_looking_frames += 1

            if looking_now and not avatar_attivo:
                print("Persona centrata: attivo avatar Beyond.")
                avatar_attivo = True

            should_stop_for_face = not attention and time.time() - ultimo_volto > TIMEOUT_USCITA
            should_stop_for_gaze = attention and not_looking_frames >= NOT_LOOKING_FRAMES_REQUIRED
            if avatar_attivo and (should_stop_for_face or should_stop_for_gaze):
                print("Sguardo assente o volto fuori camera: blocco avatar.")
                avatar_attivo = False

            payload = (
                avatar_attivo,
                reason if avatar_attivo else (attention["reason"] if attention else "no-face"),
                round(attention["yaw"], 2) if attention else None,
                round(attention["pitch"], 2) if attention else None,
            )
            now = time.time()
            if payload != last_payload or now - ultimo_invio >= HEARTBEAT_SECONDS:
                publish_status(*payload)
                last_payload = payload
                ultimo_invio = now

            draw_status(image, avatar_attivo, payload[1], attention)
            cv2.imshow("AURA Vision Detector", image)

            if cv2.waitKey(5) & 0xFF == 27:
                break
    finally:
        publish_status(False, "detector-stopped")
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
