# Frontend2 Dashboard

Dashboard Next.js per la piattaforma AI Avatar realtime.

## Avvio locale

```bash
npm install
npm run dev
```

La base API si configura con `NEXT_PUBLIC_API_BASE_URL`; fallback locale:

```text
http://localhost:8000/api/v1
```

## Login

Il login unico vive in `/login`.

```text
Super admin: admin@platform.local / Admin123!
Tenant demo: admin@aurora.example / password123
```

Redirect per ruolo:

- `super_admin` -> `/dashboard`
- `tenant_admin` -> `/tenant/dashboard`

## Dashboard admin globale

Route disponibili:

- `/dashboard`
- `/tenants`
- `/users`
- `/agents`
- `/devices`
- `/sessions`
- `/workflows`
- `/analytics`
- `/settings`

La guardia frontend usa cookie di ruolo per la navigazione; la sicurezza reale resta negli endpoint FastAPI con JWT bearer e controlli ruolo.

## Configurazione kiosk e provider

- `/devices`: genera il QR setup per configurare rapidamente il kiosk senza rimuovere il setup manuale.
- `/settings`: configura API key tenant-scoped per Beyond Presence, OpenAI e Gemini.
- `/agents`: configura Beyond Avatar ID, webhook N8N, provider/modello STT e provider/modello TTS.
