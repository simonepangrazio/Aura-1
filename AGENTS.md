# AGENTS.md

## Sintesi del progetto

Il progetto `6` e un MVP SaaS realtime per avatar AI 3D. L'idea centrale e una piattaforma multi-tenant in cui aziende diverse possono configurare agenti/avatar Beyond Presence, collegarli a workflow N8N, avviare sessioni realtime tramite LiveKit e distribuire l'esperienza in tre superfici:

- dashboard SaaS per gestione e monitoraggio;
- kiosk/totem fullscreen con rilevamento presenza;
- widget embeddabile su siti terzi.

La root contiene anche infrastruttura Docker/NGINX, tipi condivisi TypeScript e un backend FastAPI con database PostgreSQL.

## Struttura principale

- `backend/`: backend FastAPI, auth JWT, modelli SQLAlchemy, migrazioni Alembic, servizi sessione, integrazioni N8N/Beyond Presence/LiveKit.
- `frontend1/`: landing/marketing React Vite con pagine demo, dashboard mock/marketing e asset video avatar.
- `frontend2/`: dashboard SaaS Next.js 16 con Tailwind/shadcn-like UI e client API reale verso il backend.
- `kiosk/`: app React Vite TypeScript fullscreen per totem fisici, con MediaPipe, speech recognition e LiveKit.
- `widget/`: app React Vite TypeScript embeddabile, attualmente in forma base/prototipale.
- `shared/`: tipi e costanti TypeScript condivisi.
- `infra/`: `docker-compose.yml` e `nginx.conf` per orchestrare Postgres, Redis, backend, frontend e reverse proxy.

Sono presenti `node_modules/` in piu frontend e `backend/venv/`; questi sono artefatti locali gia installati e non fanno parte della logica applicativa.

## Backend: cosa e stato fatto

Il backend espone una FastAPI configurata in `backend/app/main.py` con:

- health check su `/health`;
- prefisso API `/api/v1`;
- CORS aperto per sviluppo;
- websocket su `/ws/session/{session_id}`.

Funzionalita principali implementate:

- autenticazione JWT con login, register e refresh;
- hashing password tramite `pbkdf2_sha256`;
- tenant multi-azienda;
- CRUD tenant-scoped per agenti;
- CRUD/listing per device;
- CRUD/listing per widget;
- listing sessioni;
- avvio sessione da dashboard, device o widget;
- chiusura sessione;
- websocket testuale per conversazione utente/avatar;
- salvataggio messaggi ed eventi sessione;
- generazione token LiveKit con fallback `dev_token` in sviluppo;
- chiamata a webhook N8N per ottenere risposta AI;
- invio testo avatar verso Beyond Presence.

### Modello dati

I modelli principali sono in `backend/app/models/domain.py`:

- `Tenant`
- `User`
- `Agent`
- `Device`
- `Widget`
- `Session`
- `Message`
- `SessionEvent`
- `KnowledgeBase`
- `ApiKey`

Le credenziali e configurazioni sensibili per tenant sono pensate per stare nel database, in particolare su `agents` e `api_keys`.

### Seed demo

`backend/app/core/seed_db.py` popola dati demo:

- tenant `Hotel Aurora`;
- tenant `Clinica Nova`;
- utenti admin/owner;
- agenti demo con avatar Beyond e webhook N8N;
- device kiosk demo;
- widget demo;
- API key Beyond Presence demo;
- una sessione booking conclusa con messaggi ed eventi.

Login demo indicato dal seed:

```text
admin@aurora.example / password123
```

## Frontend2: dashboard SaaS

`frontend2/` e la dashboard principale e piu integrata col backend.

Stack:

- Next.js 16 App Router;
- React 19;
- Tailwind CSS 4;
- lucide-react;
- componenti UI locali.

Cosa e stato fatto:

- schermata login con credenziali demo precompilate;
- salvataggio token e utente in `localStorage`;
- client API condiviso in `src/lib/api.ts`;
- caricamento reale di agenti, device, widget e sessioni dal backend;
- tab per agenti, kiosk/device, sessioni, widget embed e configurazione;
- rendering stati loading, errore, empty e popolato;
- snippet embed generato usando dati reali del widget e dell'agente;
- file locale `frontend2/AGENTS.md` con regole specifiche per lavorare su questa dashboard.

Nota importante: quando si lavora in `frontend2`, leggere prima `frontend2/AGENTS.md`.

## Kiosk

`kiosk/` e una app fullscreen runtime per totem fisici, non una dashboard.

Stack:

- React Vite TypeScript strict;
- Tailwind CSS 4;
- MediaPipe Tasks Vision per face detection locale;
- LiveKit Client SDK per room/audio/video realtime;
- Web Speech API per transcript vocale MVP;
- WebSocket backend su `/ws/session/{session_id}`.

Cosa e stato fatto:

- schermata setup fullscreen per salvare `device_id` UUID e `device_token` in `localStorage`;
- autenticazione device tramite `POST /api/v1/devices/auth`;
- struttura modulare in `components/`, `pages/`, `hooks/`, `services/`, `realtime/`, `presence/`, `state/`, `types/`, `config/`, `styles/`;
- state machine `IDLE`, `PRESENCE_DETECTED`, `STARTING`, `ACTIVE`, `ENDING`, `ERROR`;
- MediaPipe locale con webcam nascosta, timer presenza 4 secondi e reset se il volto sparisce;
- avvio sessione kiosk tramite `/api/v1/sessions/start` con `device_id` e `device_token`;
- connessione WebSocket protetta con query `device_id/device_token`;
- connessione LiveKit e rendering fullscreen del primo remote video track Beyond Presence;
- auto end dopo 15 secondi senza volto, cleanup di WebSocket/LiveKit/speech/timer e ritorno a `IDLE`;
- README kiosk completo con setup, reset localStorage e troubleshooting.

Regole kiosk importanti:

- il kiosk deve sempre conoscere `deviceId` e `deviceToken`;
- non usare ID numerici o tenant hardcoded;
- non inviare mai lo stream webcam al backend;
- non salvare immagini, video o audio utente;
- non chiamare mai N8N dal frontend kiosk;
- Beyond Presence va trattato come layer avatar/stream realtime, mentre il backend resta il cervello.

## Widget

`widget/` e una app Vite React TypeScript pensata per essere embeddabile.

Cosa e stato fatto:

- struttura Vite/React installata;
- dipendenze LiveKit presenti;
- UI base flottante in basso a destra;
- stato locale `connected`;
- pulsante Connect/Disconnect.

Stato attuale: il widget e ancora un prototipo visuale. Non usa ancora `public_token`, `widget_id`, `/api/v1/sessions/start`, LiveKit reale o websocket backend.

## Frontend1

`frontend1/` contiene il sito/landing marketing e alcune pagine demo.

Stack:

- React Vite;
- React Router;
- Tailwind CSS 3;
- Three.js / React Three Fiber / Drei;
- Framer Motion;
- GSAP.

Contenuti principali:

- pagine `Home`, `Demo`, `Dashboard`, `Login`, `Templates`, `ScenarioDetail`, `StartBuilding`, `AvatarContainer`;
- componenti `Navbar` e `AvatarSection`;
- asset video avatar in `public/videos/avatar.mov`;
- script Node/Python di supporto per sviluppo e vision detector.

Questa parte sembra orientata a demo/marketing piu che alla dashboard SaaS operativa, che vive in `frontend2`.

## Shared

`shared/` contiene:

- `types/index.ts`: tipi per stati sessione, device config e session info;
- `constants/index.ts`: `PRESENCE_TIMEOUT_MS` e `API_BASE_URL`.

Nota: i tipi condivisi usano ancora ID numerici, mentre il backend attuale usa UUID. Se si decide di usare davvero `shared/` tra app moderne, va aggiornato.

## Infra

`infra/docker-compose.yml` definisce:

- `postgres` su porta `5432`;
- `redis` su porta `6379`;
- `backend` su porta `8000`;
- `frontend1` servito da NGINX statico;
- `frontend2` su porta `3000`;
- `nginx` reverse proxy su porta `80`.

`infra/nginx.conf` instrada:

- `/` verso `frontend1`;
- `/dashboard/` verso `frontend2`;
- `/api/` verso backend;
- `/ws/` verso backend con upgrade websocket.

## Comandi utili

Backend locale:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python app/core/seed_db.py
uvicorn app.main:app --reload
```

Dashboard:

```bash
cd frontend2
npm install
npm run dev
```

Kiosk:

```bash
cd kiosk
npm install
npm run dev
```

Widget:

```bash
cd widget
npm install
npm run dev
```

Stack Docker:

```bash
cd infra
docker-compose up -d --build
```

## Stato complessivo

Fatto:

- architettura di base multi-app;
- backend tenant-aware con auth e modelli principali;
- migrazioni Alembic e seed demo;
- dashboard Next collegata alle API reali;
- infrastruttura Docker/NGINX;
- kiosk runtime fullscreen allineato a backend UUID, device auth, LiveKit, WebSocket e presence detection;
- base widget embeddabile;
- documentazione README root.

Da completare/rifinire:

- completare widget con token pubblico, session start, LiveKit e websocket;
- sostituire credenziali/dev token/fallback con configurazioni sicure;
- verificare flusso reale Beyond Presence end-to-end;
- verificare flusso reale N8N end-to-end;
- aggiornare `shared/` da ID numerici a UUID;
- aggiungere test automatici backend/frontend;
- decidere se `frontend1` resta solo marketing o viene integrato con dashboard/prodotto.

## Regole operative per futuri agenti

- Non trattare `node_modules/`, `venv/` e `__pycache__/` come sorgenti da modificare.
- Per modifiche dashboard, leggere prima `frontend2/AGENTS.md`.
- Preferire il backend come fonte di verita per dati tenant-scoped; evitare mock persistenti se esiste un endpoint.
- Mantenere coerenza con UUID backend in nuove integrazioni.
- Quando si toccano sessioni realtime, verificare insieme API REST, websocket, LiveKit e integrazioni N8N/Beyond.
- Prima di cambiare contratti API, aggiornare anche `frontend2/src/lib/api.ts` e gli eventuali client kiosk/widget.
- Per modifiche kiosk, mantenere il runtime fullscreen e senza overlay debug; usare `localStorage` solo per `device_id` e `device_token`.
- Gli endpoint device runtime sono `/api/v1/devices/auth`, `/api/v1/sessions/start`, `/api/v1/sessions/end` e `/ws/session/{session_id}`.
