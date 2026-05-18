# AI Avatar Realtime SaaS MVP

Questo progetto contiene l'MVP della piattaforma SaaS realtime per avatar AI 3D, basato su Beyond Presence, LiveKit, backend Python e workflow N8N.

## Struttura del Progetto

- `backend/`: Core dell'applicazione (FastAPI, WebSockets, DB SQLAlchemy). Gestisce sessioni, bridge verso N8N, e chiamate a LiveKit/Beyond Presence.
- `frontend1/`: Landing page statica / sito marketing.
- `frontend2/`: Dashboard SaaS (Next.js, Tailwind, shadcn/ui).
- `kiosk/`: Applicazione fullscreen React per Totem fisici con presence detection (MediaPipe).
- `widget/`: Applicazione React embeddabile per siti terzi.
- `shared/`: Costanti e tipi TypeScript condivisi tra i frontend.
- `infra/`: File Docker e NGINX per l'avvio in locale e su VPS.

## Setup e Avvio in Locale

### Prerequisiti
- Docker e Docker Compose installati.
- Node.js (v18+) e npm.
- Python 3.10+.

### 1. Inizializzazione Database
Il database è gestito tramite container Docker.
```bash
cd infra
docker-compose up -d postgres redis
```

### 2. Backend
Vai nella cartella `backend` e configura il venv:
```bash
cd backend
python -m venv venv
# Attiva il venv:
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Copia il file `.env.example` in `infra/` come `.env` e configura le variabili.
Per far partire le migrazioni del database:
```bash
alembic upgrade head
```

Popola i dati demo, incluso l'account admin globale:
```bash
python app/core/seed_db.py
```

Account admin globale:
```text
admin@platform.local / Admin123!
```

Account tenant demo:
```text
admin@aurora.example / password123
```

Per far partire il backend:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend (SaaS Dashboard)
```bash
cd frontend2
npm install
npm run dev
```

Route principali:

- `/login`: login unico.
- `/dashboard`: dashboard globale solo `super_admin`.
- `/tenant/dashboard`: dashboard tenant per `tenant_admin`.

La dashboard admin globale include gestione tenant, utenti, agents, devices, sessions, workflows, analytics e settings MVP.

### 4. Totem Kiosk
```bash
cd kiosk
npm install
npm run dev
```

### 5. Widget
```bash
cd widget
npm install
npm run dev
```

## Architettura Dati
Tutte le credenziali specifiche dei clienti (API key LiveKit, Beyond Presence, webhook N8N) sono pensate per essere salvate all'interno delle tabelle `tenants` e `agents` nel database PostgreSQL.
Il backend agisce da ponte: i frontend si connettono al websocket del backend, il quale si occupa di orchestrare la chiamata a N8N e il ritorno video tramite LiveKit e Beyond Presence.

## Deployment Completo
Per avviare l'intera architettura tramite Docker:
```bash
cd infra
docker-compose up -d --build
```
L'infrastruttura sarà disponibile sulla porta 80 tramite NGINX.
