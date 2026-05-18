# AURA — Prompt MongoDB per questo sito web

Questo file e' pensato per creare il database MongoDB reale dietro al sito `frontend-2`.
Il sito oggi contiene:

- landing page e richiesta demo
- login/register demo, da sostituire con auth reale
- catalogo di 4 agent predefiniti
- dettaglio scenario con form specifico per richiedere un agent
- builder per agent custom
- dashboard cliente con agent sottoscritti, configurazione, analytics e avvio avatar
- vision gate locale per `/avatar`, che puo' restare separato e non richiede per forza persistenza

Database target: `aura_db`.

---

## Prompt da inviare a un AI o sviluppatore backend

```text
Realizza il database MongoDB e il backend Express/Mongoose per AURA.
Il backend va implementato nella cartella `/backend` esistente, non dentro `frontend-2/server.js`, perche' quel file serve solo il vision gate locale.

Obiettivo MVP:
1. sostituire gli utenti demo salvati in `sessionStorage` con utenti reali;
2. salvare le richieste demo;
3. salvare le richieste "Richiedi questo agent" con campi diversi per scenario;
4. salvare gli agent sottoscritti/configurati nella dashboard;
5. preparare log e analytics per uso futuro.

Usa:
- Node.js + Express
- Mongoose
- bcryptjs per password
- jsonwebtoken con access token e refresh token
- dotenv
- validazione lato backend

Variabili ambiente richieste:
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/aura_db?retryWrites=true&w=majority
DB_NAME=aura_db
JWT_SECRET=<secret-lungo>
JWT_REFRESH_SECRET=<secret-lungo-refresh>
BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:5173
```

---

## Collections

### 1. `users`

Utenti registrati o demo migrati dal frontend.

```js
{
  _id: ObjectId,
  name: String,                       // es: "Mario Rossi"
  email: String,                      // unique, lowercase, required
  passwordHash: String,               // bcrypt hash, never returned
  role: String,                       // "user" | "admin"
  plan: String,                       // "Free" | "Pro" | "Business" | "Enterprise"
  planExpiresAt: Date | null,
  organization: {
    name: String,
    sector: String,
    size: String,                     // "1-10" | "11-50" | "51-200" | "200+"
    website: String,
    vatNumber: String,
    address: String
  },
  services: [String],                 // slugs rapidi per compatibilita frontend: ["palestra"]
  isActive: Boolean,
  emailVerified: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Indici:

```js
users.email unique
users.plan
users.createdAt
```

Note:

- In risposta API non inviare mai `passwordHash`.
- Il frontend attuale si aspetta `name`, `email`, `plan`, `services`.

---

### 2. `services`

Catalogo dei 4 agent predefiniti mostrati in `/templates` e dashboard.

```js
{
  _id: ObjectId,
  slug: String,                       // unique: "portineria-scolastica"
  title: String,
  subtitle: String,
  icon: String,
  color: String,                      // hex UI: "#3b82f6"
  accent: String,                     // "blue" | "violet" | "emerald" | "rose"
  tagline: String,
  description: String,
  longDescription: String,
  features: [String],
  useCases: [{
    title: String,
    desc: String
  }],
  integrations: [String],
  languages: [String],
  setupTime: String,                  // "24 ore" | "48 ore" | "72 ore"
  pricing: {
    monthly: Number,
    setup: Number,
    currency: String                  // "EUR"
  },
  stats: {
    requests: String,                 // es: "2.400+"
    satisfaction: String,             // es: "97%"
    avgTime: String,                  // es: "< 8 sec"
    uptime: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

Indici:

```js
services.slug unique
services.isActive
```

---

### 3. `agent_requests`

Richieste generate da:

- pagina dettaglio scenario, bottone "Richiedi questo agent"
- pagina `/start-building`, builder custom

```js
{
  _id: ObjectId,
  source: String,                     // "template" | "custom_builder"
  status: String,                     // "new" | "reviewing" | "quoted" | "accepted" | "rejected" | "converted"

  serviceSlug: String | null,         // null se custom_builder
  serviceTitle: String | null,

  requester: {
    organization: String,
    contactName: String,
    email: String,
    phone: String
  },

  channels: [String],                 // "Sito web" | "WhatsApp" | "Totem fisico" | "Email" | "Dashboard interna"
  launchWindow: String,               // "Entro 5 giorni lavorativi" | "Entro 2 settimane" | ...
  notes: String,

  scenarioConfig: {
    // portineria-scolastica
    schoolType: String,
    students: String,
    frontDeskHours: String,
    priorityFlows: [String],
    systems: String,

    // hiring-screening
    roles: String,
    monthlyCandidates: String,
    screeningSteps: [String],
    scoreCriteria: String,
    ats: String,

    // palestra
    gymType: String,
    members: String,
    services: [String],
    courses: String,
    managementSoftware: String,

    // studio-medico
    specialty: String,
    doctors: String,
    patientFlows: [String],
    bookingRules: String,
    medicalSoftware: String
  },

  customBuilderConfig: {
    name: String,
    systemMessage: String,
    outputRequirements: String,
    tools: [String],
    model: String,
    budget: Number,
    language: String
  },

  assignedTo: String,
  internalNotes: String,
  createdByUserId: ObjectId | null,   // ref users, null se richiesta anonima
  convertedUserServiceId: ObjectId | null,
  createdAt: Date,
  updatedAt: Date
}
```

Indici:

```js
agent_requests.status
agent_requests.serviceSlug
agent_requests.requester.email
agent_requests.createdAt
```

Regola importante:

- Se `source = "template"`, `serviceSlug` e `scenarioConfig` sono obbligatori.
- Se `source = "custom_builder"`, `customBuilderConfig.name` e `customBuilderConfig.systemMessage` sono obbligatori.

---

### 4. `demo_requests`

Richieste dalla pagina `/demo`.

```js
{
  _id: ObjectId,
  name: String,
  email: String,
  company: String,
  sector: String,
  message: String,
  status: String,                     // "new" | "contacted" | "demo_scheduled" | "converted" | "lost"
  assignedTo: String,
  scheduledAt: Date | null,
  internalNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

Indici:

```js
demo_requests.email
demo_requests.status
demo_requests.createdAt
```

---

### 5. `user_services`

Agent sottoscritti e configurati da un utente, mostrati nella dashboard.

```js
{
  _id: ObjectId,
  userId: ObjectId,                   // ref users._id
  serviceId: ObjectId,                // ref services._id
  serviceSlug: String,                // denormalizzato per query veloci
  status: String,                     // "pending" | "active" | "paused" | "stopped" | "cancelled"
  runtimeStatus: String,              // "online" | "offline"
  config: {
    agentName: String,
    language: String,                 // "Italiano", "English", ...
    tone: String,                     // "Professionale" | "Amichevole" | "Formale" | "Informale"
    operatingHours: String,
    channels: [String],
    webhookUrl: String,
    customInstructions: String,
    beyAgentId: String                // ID Beyond Presence/Bey, se assegnato
  },
  subscribedAt: Date,
  startedAt: Date | null,
  pausedAt: Date | null,
  expiresAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

Indici:

```js
user_services.userId
user_services.serviceId
user_services.serviceSlug
user_services.status
user_services.userId + user_services.serviceId unique
```

---

### 6. `sessions`

Sessioni auth con refresh token salvato come hash.

```js
{
  _id: ObjectId,
  userId: ObjectId,
  refreshTokenHash: String,
  ipAddress: String,
  userAgent: String,
  isRevoked: Boolean,
  createdAt: Date,
  expiresAt: Date
}
```

Indici:

```js
sessions.userId
sessions.refreshTokenHash unique
sessions.expiresAt TTL
```

---

### 7. `agent_logs`

Log conversazioni/interazioni degli agent.

```js
{
  _id: ObjectId,
  userServiceId: ObjectId,
  userId: ObjectId,
  serviceId: ObjectId,
  sessionId: String,
  role: String,                       // "user" | "agent" | "system"
  message: String,
  metadata: {
    responseTimeMs: Number,
    model: String,
    tokensUsed: Number,
    language: String,
    channel: String,
    visionState: String               // opzionale: "looking" | "not-looking"
  },
  createdAt: Date
}
```

Indici:

```js
agent_logs.userServiceId
agent_logs.userId
agent_logs.serviceId
agent_logs.sessionId
agent_logs.createdAt TTL opzionale 90 giorni
```

---

### 8. `analytics`

Metriche aggregate per la dashboard.

```js
{
  _id: ObjectId,
  userServiceId: ObjectId,
  userId: ObjectId,
  serviceId: ObjectId,
  period: String,                     // "day" | "week" | "month"
  date: Date,
  metrics: {
    totalRequests: Number,
    uniqueUsers: Number,
    avgResponseTimeMs: Number,
    satisfactionScore: Number,
    uptime: Number,
    topLanguages: [{ lang: String, count: Number }],
    topChannels: [{ channel: String, count: Number }],
    peakHour: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

Indici:

```js
analytics.userServiceId + analytics.period + analytics.date unique
analytics.userId
analytics.serviceId
```

---

### 9. `audit_logs`

Log amministrativi e sicurezza.

```js
{
  _id: ObjectId,
  userId: ObjectId | null,
  action: String,                     // "login" | "logout" | "create" | "update" | "delete" | "start_agent" | "stop_agent"
  resource: String,                   // "user" | "service" | "agent_request" | "user_service"
  resourceId: ObjectId | null,
  status: String,                     // "success" | "failure"
  details: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

Indici:

```js
audit_logs.userId
audit_logs.action
audit_logs.resource
audit_logs.createdAt TTL opzionale 365 giorni
```

---

## API minime da creare

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/services
GET    /api/services/:slug

POST   /api/demo-requests

POST   /api/agent-requests
GET    /api/agent-requests                 // admin
PATCH  /api/agent-requests/:id/status      // admin

GET    /api/user-services                  // auth user
POST   /api/user-services                  // admin or conversion from request
PATCH  /api/user-services/:id/config
PATCH  /api/user-services/:id/runtime

GET    /api/dashboard/summary              // auth user
GET    /api/dashboard/analytics            // auth user
```

Risposta `POST /api/auth/login` compatibile con il frontend:

```js
{
  user: {
    id: "...",
    name: "Mario Rossi",
    email: "mario@scuola.it",
    plan: "Pro",
    services: ["portineria-scolastica"]
  },
  accessToken: "...",
  refreshToken: "..."
}
```

---

## Seed iniziale obbligatorio

Crea 4 documenti in `services`:

1. `portineria-scolastica`
2. `hiring-screening`
3. `palestra`
4. `studio-medico`

Usa testi, features, stats, colori e lingue coerenti con:

- `frontend-2/src/pages/Templates.jsx`
- `frontend-2/src/pages/ScenarioDetail.jsx`
- `frontend-2/src/pages/Dashboard.jsx`

Crea anche questi utenti demo, con password `demo1234` hashata:

```js
[
  {
    email: "mario@scuola.it",
    name: "Mario Rossi",
    plan: "Pro",
    services: ["portineria-scolastica"]
  },
  {
    email: "anna@palestra.it",
    name: "Anna Bianchi",
    plan: "Business",
    services: ["palestra", "hiring-screening"]
  },
  {
    email: "luca@studiomed.it",
    name: "Luca Verdi",
    plan: "Enterprise",
    services: ["studio-medico", "portineria-scolastica", "hiring-screening", "palestra"]
  }
]
```

Per ogni servizio in `users.services`, crea anche il relativo documento in `user_services`.

---

## File backend richiesti

```text
backend/
  models/
    User.js
    Service.js
    AgentRequest.js
    DemoRequest.js
    UserService.js
    Session.js
    AgentLog.js
    Analytics.js
    AuditLog.js
  routes/
    auth.js
    services.js
    agentRequests.js
    demoRequests.js
    userServices.js
    dashboard.js
  middleware/
    auth.js
    validate.js
  db.js
  seed.js
  server.js
```

Requisiti tecnici:

- `db.js` deve connettersi a `MONGODB_URI` con retry e logging.
- Ogni schema deve usare `timestamps: true`, tranne `agent_logs` se usa solo `createdAt`.
- Password: salvare solo `passwordHash`.
- Refresh token: salvare solo hash.
- Usare `schema.index()` per tutti gli indici elencati.
- Validare enum e campi required.
- CORS deve permettere `FRONTEND_URL`.
- Le route pubbliche sono solo login/register, services, demo request e agent request anonima.
- Tutto il resto richiede JWT.

---

## Script rapido `mongosh` per creare il DB minimo

Usa questo solo per inizializzare MongoDB Atlas/manuale prima del backend completo.
Da terminale:

```bash
mongosh "mongodb+srv://<user>:<password>@cluster0.mongodb.net/aura_db"
```

Poi incolla:

```js
use aura_db

db.createCollection("users")
db.createCollection("services")
db.createCollection("agent_requests")
db.createCollection("demo_requests")
db.createCollection("user_services")
db.createCollection("sessions")
db.createCollection("agent_logs")
db.createCollection("analytics")
db.createCollection("audit_logs")

db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ plan: 1 })
db.users.createIndex({ createdAt: -1 })

db.services.createIndex({ slug: 1 }, { unique: true })
db.services.createIndex({ isActive: 1 })

db.agent_requests.createIndex({ status: 1 })
db.agent_requests.createIndex({ serviceSlug: 1 })
db.agent_requests.createIndex({ "requester.email": 1 })
db.agent_requests.createIndex({ createdAt: -1 })

db.demo_requests.createIndex({ email: 1 })
db.demo_requests.createIndex({ status: 1 })
db.demo_requests.createIndex({ createdAt: -1 })

db.user_services.createIndex({ userId: 1 })
db.user_services.createIndex({ serviceId: 1 })
db.user_services.createIndex({ serviceSlug: 1 })
db.user_services.createIndex({ status: 1 })
db.user_services.createIndex({ userId: 1, serviceId: 1 }, { unique: true })

db.sessions.createIndex({ userId: 1 })
db.sessions.createIndex({ refreshTokenHash: 1 }, { unique: true })
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

db.agent_logs.createIndex({ userServiceId: 1 })
db.agent_logs.createIndex({ userId: 1 })
db.agent_logs.createIndex({ serviceId: 1 })
db.agent_logs.createIndex({ sessionId: 1 })
db.agent_logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

db.analytics.createIndex({ userServiceId: 1, period: 1, date: 1 }, { unique: true })
db.analytics.createIndex({ userId: 1 })
db.analytics.createIndex({ serviceId: 1 })

db.audit_logs.createIndex({ userId: 1 })
db.audit_logs.createIndex({ action: 1 })
db.audit_logs.createIndex({ resource: 1 })
db.audit_logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 })

db.services.insertMany([
  {
    slug: "portineria-scolastica",
    title: "Portineria Scolastica",
    subtitle: "Istruzione & Amministrazione",
    icon: "🏫",
    color: "#3b82f6",
    accent: "blue",
    tagline: "Il receptionist digitale per la tua scuola",
    description: "Sportello orientamento interattivo per studenti e famiglie.",
    longDescription: "Agent per accoglienza scolastica, comunicazioni scuola-famiglia, permessi, calendario e visitatori.",
    features: ["Gestione permessi e giustificazioni", "Info su orari e calendario scolastico", "Smistamento comunicazioni", "Supporto multilingue"],
    useCases: [
      { title: "Permessi di uscita", desc: "Raccoglie richieste e notifica i responsabili." },
      { title: "Comunicazioni scuola-famiglia", desc: "Smista messaggi tra famiglie, docenti e segreteria." },
      { title: "Info calendario", desc: "Fornisce date, eventi e riunioni aggiornate." },
      { title: "Visitatori esterni", desc: "Registra visitatori e avvisa il personale." }
    ],
    integrations: ["Registro Elettronico", "Email scolastica", "WhatsApp Business", "Totem digitale"],
    languages: ["Italiano", "Inglese", "Arabo", "Cinese", "Rumeno"],
    setupTime: "48 ore",
    pricing: { monthly: 149, setup: 0, currency: "EUR" },
    stats: { requests: "2.400+", satisfaction: "97%", avgTime: "< 8 sec", uptime: "99.9%" },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "hiring-screening",
    title: "Hiring & Screening",
    subtitle: "Risorse Umane",
    icon: "💼",
    color: "#8b5cf6",
    accent: "violet",
    tagline: "Scrematura colloqui online automatizzata",
    description: "Automazione processi di selezione e screening candidati.",
    longDescription: "Agent per primo contatto, colloqui strutturati, scoring candidati e report HR.",
    features: ["Interviste strutturate automatizzate", "Scoring e ranking candidati", "Analisi CV e cover letter", "Report dettagliato per HR"],
    useCases: [
      { title: "Screening automatizzato", desc: "Intervista candidati via chat o voce." },
      { title: "Scoring dinamico", desc: "Assegna punteggi in base ai requisiti HR." },
      { title: "Analisi semantica CV", desc: "Estrae competenze chiave dai curriculum." },
      { title: "Report HR", desc: "Genera ranking e sintesi candidato." }
    ],
    integrations: ["LinkedIn", "Workday", "BambooHR", "ATS personalizzati", "Google Calendar"],
    languages: ["Italiano", "Inglese", "Francese", "Tedesco", "Spagnolo"],
    setupTime: "72 ore",
    pricing: { monthly: 299, setup: 0, currency: "EUR" },
    stats: { requests: "1.800+", satisfaction: "94%", avgTime: "12 min", uptime: "99.7%" },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "palestra",
    title: "Assistente Palestra",
    subtitle: "Fitness & Wellness",
    icon: "🏋️",
    color: "#10b981",
    accent: "emerald",
    tagline: "Il tuo personal trainer digitale H24",
    description: "Gestione appuntamenti e assistenza clienti 24/7.",
    longDescription: "Agent per abbonamenti, prenotazioni corsi, schede allenamento e supporto clienti.",
    features: ["Gestione abbonamenti e rinnovi", "Prenotazione corsi e personal trainer", "Piani allenamento personalizzati", "Promemoria e motivazione clienti"],
    useCases: [
      { title: "Gestione abbonamenti", desc: "Informa su pacchetti, rinnovi e scadenze." },
      { title: "Prenotazione corsi", desc: "Prenota lezioni e personal trainer." },
      { title: "Piano allenamento", desc: "Crea schede personalizzate." },
      { title: "Supporto nutrizionale", desc: "Fornisce consigli base con disclaimer." }
    ],
    integrations: ["TeamSystem Wellness", "Mindbody", "Stripe", "WhatsApp Business", "App mobile"],
    languages: ["Italiano", "Inglese"],
    setupTime: "24 ore",
    pricing: { monthly: 99, setup: 0, currency: "EUR" },
    stats: { requests: "3.100+", satisfaction: "96%", avgTime: "< 5 sec", uptime: "99.9%" },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: "studio-medico",
    title: "Studio Medico",
    subtitle: "Salute & Medicina",
    icon: "🩺",
    color: "#f43f5e",
    accent: "rose",
    tagline: "Segreteria medica intelligente 24/7",
    description: "Automazione accoglienza e gestione pazienti.",
    longDescription: "Agent per prenotazioni, anamnesi preliminare, preparazione esami e follow-up.",
    features: ["Prenotazione e gestione appuntamenti", "Anamnesi preliminare digitale", "Info su esami e preparazioni", "Promemoria automatici ai pazienti"],
    useCases: [
      { title: "Prenotazione appuntamenti", desc: "Prenota visite con disponibilita reale." },
      { title: "Anamnesi preliminare", desc: "Raccoglie dati clinici pre-visita." },
      { title: "Preparazione esami", desc: "Invia istruzioni e materiale da portare." },
      { title: "Follow-up post visita", desc: "Gestisce esiti e promemoria." }
    ],
    integrations: ["Zucchetti Medical", "TeamSystem Health", "HL7 FHIR", "Email certificata", "SMS"],
    languages: ["Italiano", "Inglese", "Arabo"],
    setupTime: "72 ore",
    pricing: { monthly: 199, setup: 0, currency: "EUR" },
    stats: { requests: "2.900+", satisfaction: "98%", avgTime: "< 6 sec", uptime: "99.8%" },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

---

## Nota pratica

Il database MongoDB nasce davvero quando:

1. la connessione usa il nome `aura_db`;
2. viene inserito almeno un documento;
3. oppure esegui lo script `mongosh` sopra.

Per il sito attuale, le collections minime indispensabili sono:

```text
users
services
agent_requests
demo_requests
user_services
sessions
```

Le collections `agent_logs`, `analytics` e `audit_logs` possono essere aggiunte subito oppure tenute pronte per la dashboard avanzata.
