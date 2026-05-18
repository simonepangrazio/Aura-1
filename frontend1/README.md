# AURA — AI Assistants & Artificial Humans

Piattaforma per la creazione di artificial humans con avatar iperrealistico **Beyond Presence** integrato nella homepage.

## Setup

```bash
npm install
npm run dev
```

Per usare il blocco visivo prima dell'avatar Beyond:

```bash
npm run dev:backend
npm run dev
npm run dev:vision
```

`npm run start:dev` avvia insieme Vite e il backend locale; il detector Python va lanciato in un terminale separato perché usa webcam e finestra di debug.

### Configurare l'avatar Beyond Presence

1. Crea un account su [app.bey.chat](https://app.bey.chat)
2. Crea un **Agent** scegliendo un avatar dal catalogo
3. Dal menu dell'agent, clicca **Share** per ottenere il link (es: `bey.chat/abc123`)
4. Copia l'ID (`abc123`) e crea un file `.env`:

```env
VITE_BEY_AGENT_ID=abc123
```

5. Riavvia il server di sviluppo

Senza `VITE_BEY_AGENT_ID`, viene mostrato un avatar olografico placeholder con le istruzioni di configurazione.

### Vision gate

La pagina `/avatar`, aperta dal bottone **Inizia servizio** nella dashboard cliente, ascolta il backend locale su `http://localhost:3000`. L'iframe Beyond viene montato solo quando `scripts/vision_detector.py` conferma che il volto è orientato verso la telecamera.

Puoi cambiare endpoint con:

```env
VITE_VISION_API_URL=http://localhost:3000
AURA_VISION_SERVER_URL=http://localhost:3000/vision/status
```

## Struttura

```
src/
├── components/
│   ├── Navbar.jsx          # Navbar condivisa tra tutte le pagine
│   └── AvatarSection.jsx   # Integrazione Beyond Presence
├── pages/
│   ├── Home.jsx            # Homepage con avatar e landing
│   ├── StartBuilding.jsx   # Builder form per agent custom
│   ├── Templates.jsx       # Griglia 4 scenari preconfigurati
│   └── ScenarioDetail.jsx  # Pagina dettaglio singolo scenario
├── App.jsx                 # Router principale
├── main.jsx                # Entry point
└── index.css               # Stili globali + Tailwind
```

## Route

| Path | Pagina |
|------|--------|
| `/` | Homepage con avatar |
| `/start-building` | Builder agent custom |
| `/templates` | Griglia template |
| `/templates/portineria-scolastica` | Dettaglio scenario |
| `/templates/hiring-screening` | Dettaglio scenario |
| `/templates/palestra` | Dettaglio scenario |
| `/templates/studio-medico` | Dettaglio scenario |

## Stack

- React 19 + Vite
- TailwindCSS 3
- React Router DOM v7
- Beyond Presence (avatar video AI iperrealistico)
- Font: Syne (display) + DM Sans (body)
