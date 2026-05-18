# Beyond Presence Kiosk

Runtime fullscreen React/Vite per totem fisici con webcam, microfono, presence detection locale, sessioni realtime LiveKit e avatar Beyond Presence.

## Requisiti

- Node.js compatibile con Vite.
- Backend FastAPI attivo su `http://localhost:8000`.
- Device creato dal backend con `device_id` UUID e `device_token`.
- Browser con accesso a webcam, microfono, WebRTC e Web Speech API.

## Configurazione

Il file `.env` locale contiene solo endpoint non sensibili:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

Credenziali kiosk e token device non vanno inseriti in `.env`: vengono salvati nel `localStorage` del browser durante il setup.

## Avvio locale

```bash
npm install
npm run dev
```

Apri l’URL Vite indicato dal terminale. Al primo avvio il kiosk mostra una schermata setup:

1. inserisci `device_id`;
2. inserisci `device_token`;
3. concedi permessi fullscreen, webcam e microfono;
4. il kiosk chiama `POST /api/v1/devices/auth`;
5. se il device è valido entra in modalità idle.

Per i dati demo, esegui prima il seed backend:

```bash
cd ../backend
python app/core/seed_db.py
```

Il seed stampa `Kiosk device_id` e `Kiosk device_token`.

La dashboard Devices mostra anche un QR setup con lo stesso `device_id` e `device_token`.
Il setup manuale resta disponibile; il QR e solo un modo piu rapido per compilare e validare le stesse credenziali.

## Flusso runtime

1. `IDLE`: webcam attiva solo per MediaPipe locale, nessuna sessione realtime aperta.
2. `PRESENCE_DETECTED`: volto presente; dopo `presenceStartMs` parte la sessione.
3. `STARTING`: il kiosk chiama `/sessions/start`, apre `/ws/session/{session_id}` e connette LiveKit.
4. `ACTIVE`: mostra il primo remote video track LiveKit come avatar fullscreen e invia transcript vocali al backend via WebSocket.
5. `ENDING`: dopo `absenceEndMs` senza volto, o su disconnessione controllata, chiude WebSocket, LiveKit e `/sessions/end`.
6. `ERROR`: cleanup e retry automatico verso `IDLE`.

Default runtime:

- `presenceStartMs`: `4000`
- `absenceEndMs`: `15000`
- `language`: `it-IT`

Il backend può sovrascriverli tramite `devices.settings`.

## Privacy

- Il video webcam resta nel browser ed è usato solo da MediaPipe.
- Non vengono salvati immagini, video o audio utente.
- Il kiosk non chiama mai N8N direttamente.
- Beyond Presence è trattato come rendering avatar via LiveKit.

## Reset device locale

Da DevTools console:

```js
localStorage.removeItem("beyond.kiosk.deviceId")
localStorage.removeItem("beyond.kiosk.deviceToken")
location.reload()
```

## Troubleshooting

- `Invalid device credentials`: rigenera o copia correttamente `device_id` e `device_token`.
- Camera non disponibile: controlla permessi browser, HTTPS in produzione e che nessun’altra app stia usando la webcam.
- Nessun avatar video: verifica che Beyond Presence pubblichi un remote video track nella room LiveKit restituita da `/sessions/start`.
- WebSocket chiuso: verifica `VITE_WS_BASE_URL`, proxy `/ws/` e query `device_id/device_token`.
- Web Speech API non supportata: usa Chrome/Edge in kiosk mode per il voice MVP.
