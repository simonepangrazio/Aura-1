import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import { SCENARIOS } from './Templates'

const FULL_SPECS = {
  'portineria-scolastica': {
    longDescription: "L'agent Portineria Scolastica rivoluziona l'accoglienza nelle scuole di ogni ordine e grado. Disponibile 24/7, gestisce il flusso di comunicazione tra famiglie, studenti e personale scolastico con efficienza e cortesia, riducendo drasticamente il carico di lavoro del personale ATA.",
    useCases: [
      { title: 'Permessi di uscita', desc: 'Gestisce le richieste di uscita anticipata raccogliendo dati e notificando i responsabili.' },
      { title: 'Comunicazioni scuola-famiglia', desc: 'Smista messaggi tra genitori e docenti/segreteria in modo ordinato.' },
      { title: 'Info calendario', desc: 'Fornisce date di scrutini, vacanze, eventi e riunioni aggiornate in tempo reale.' },
      { title: 'Visitatori esterni', desc: 'Identifica e registra i visitatori, avvisando il personale competente.' },
    ],
    integrations: ['Registro Elettronico', 'Email scolastica', 'WhatsApp Business', 'Totem digitale'],
    setup: '48 ore',
    languages: ['Italiano', 'Inglese', 'Arabo', 'Cinese', 'Rumeno'],
  },
  'hiring-screening': {
    longDescription: "Il modulo Hiring & Screening automatizza la fase più onerosa del recruiting: il primo contatto e la valutazione preliminare dei candidati. L'agent conduce colloqui strutturati, valuta le risposte con scoring personalizzabile e produce report dettagliati per il team HR.",
    useCases: [
      { title: 'Screening automatizzato', desc: "Intervista i candidati via chat o voce, raccogliendo dati standardizzati e comparabili." },
      { title: 'Scoring dinamico', desc: "Assegna punteggi ponderati in base ai requisiti del ruolo configurati dall'HR." },
      { title: 'Analisi semantica CV', desc: "Estrae competenze chiave dai curriculum e le confronta con il job profile." },
      { title: 'Report HR', desc: "Genera PDF con ranking, punti di forza e aree di miglioramento per ogni candidato." },
    ],
    integrations: ['LinkedIn', 'Workday', 'BambooHR', 'ATS personalizzati', 'Google Calendar'],
    setup: '72 ore',
    languages: ['Italiano', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo'],
  },
  'palestra': {
    longDescription: "L'Assistente Palestra trasforma la customer experience del tuo centro fitness. Disponibile 24/7, gestisce tutto il ciclo di vita del cliente: dalla prima informazione all'abbonamento, dalla prenotazione dei corsi al supporto motivazionale, riducendo il churn e aumentando la soddisfazione.",
    useCases: [
      { title: 'Gestione abbonamenti', desc: "Informa su pacchetti disponibili, gestisce rinnovi e invia promemoria di scadenza." },
      { title: 'Prenotazione corsi', desc: "Permette di prenotare lezioni, personal trainer e sale con disponibilità in tempo reale." },
      { title: 'Piano allenamento', desc: "Crea schede personalizzate in base a obiettivi, livello ed eventuali limitazioni fisiche." },
      { title: 'Supporto nutrizionale', desc: "Fornisce consigli alimentari di base e suggerisce integratori (con disclaimer medico)." },
    ],
    integrations: ['TeamSystem Wellness', 'Mindbody', 'Stripe', 'WhatsApp Business', 'App mobile'],
    setup: '24 ore',
    languages: ['Italiano', 'Inglese'],
  },
  'studio-medico': {
    longDescription: "La Segreteria Medica Intelligente riduce del 70% le chiamate in entrata allo studio, gestendo autonomamente prenotazioni, informazioni pre-visita e comunicazioni di routine. Conforme GDPR, tratta i dati sensibili con la massima sicurezza e trasparenza.",
    useCases: [
      { title: 'Prenotazione appuntamenti', desc: "Prenota visite verificando disponibilità reale del calendario medico in tempo reale." },
      { title: 'Anamnesi preliminare', desc: "Raccoglie in modo strutturato la storia clinica del paziente prima della visita." },
      { title: 'Preparazione esami', desc: "Invia istruzioni dettagliate su digiuno, farmaci sospesi e materiale da portare." },
      { title: 'Follow-up post visita', desc: "Contatta i pazienti per controllo esiti e promemoria visite di follow-up." },
    ],
    integrations: ['Zucchetti Medical', 'TeamSystem Health', 'HL7 FHIR', 'Email certificata', 'SMS'],
    setup: '72 ore',
    languages: ['Italiano', 'Inglese', 'Arabo'],
  },
}

const accentMap = {
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-[0_0_80px_rgba(59,130,246,0.15)]',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    tag: 'bg-blue-500/10 text-blue-400',
    btn: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    dot: 'bg-blue-400',
  },
  violet: {
    gradient: 'from-violet-500 to-purple-700',
    glow: 'shadow-[0_0_80px_rgba(139,92,246,0.15)]',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    tag: 'bg-violet-500/10 text-violet-400',
    btn: 'from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    dot: 'bg-violet-400',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-[0_0_80px_rgba(16,185,129,0.15)]',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    tag: 'bg-emerald-500/10 text-emerald-400',
    btn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    dot: 'bg-emerald-400',
  },
  rose: {
    gradient: 'from-rose-500 to-red-600',
    glow: 'shadow-[0_0_80px_rgba(244,63,94,0.15)]',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    tag: 'bg-rose-500/10 text-rose-400',
    btn: 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]',
    dot: 'bg-rose-400',
  },
}

export default function ScenarioDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [requested, setRequested] = useState(false)

  const scenario = SCENARIOS.find(s => s.id === id)
  const specs = FULL_SPECS[id]

  if (!scenario || !specs) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Scenario non trovato</p>
          <button onClick={() => navigate('/templates')} className="text-violet-400 hover:text-violet-300">← Torna ai templates</button>
        </div>
      </div>
    )
  }

  const a = accentMap[scenario.accent]

  if (requested) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <Navbar />
        <div className="max-w-lg w-full text-center">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${scenario.color} flex items-center justify-center mx-auto mb-8 ${a.glow}`}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-4">Richiesta inviata!</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-2">
            Hai selezionato il template <span className="text-white font-semibold">"{scenario.title}"</span>.
          </p>
          <p className="text-zinc-500 mb-10">
            La tua richiesta sta venendo visionata da un nostro specialista.<br />
            Entro <span className="text-white font-semibold">5 giorni lavorativi</span> riceverai il tuo agent configurato e pronto all'uso.
          </p>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`}></span>
              Setup del template base: {specs.setup}
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0"></span>
              Personalizzazione in base alle tue esigenze
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0"></span>
              Testing e consegna con manuale d'uso
            </div>
          </div>
          <button
            onClick={() => navigate('/templates')}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Torna ai templates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="flex items-start gap-6 mb-8">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${scenario.color} flex items-center justify-center text-4xl flex-shrink-0 ${a.glow}`}>
              {scenario.icon}
            </div>
            <div className="flex-1">
              <span className={`inline-block text-xs px-3 py-1.5 rounded-full border font-medium mb-3 ${a.badge}`}>
                {scenario.subtitle}
              </span>
              <h1 className="font-display text-4xl lg:text-5xl font-800 text-white mb-2">{scenario.title}</h1>
              <p className="text-zinc-400 text-lg italic">{scenario.tagline}</p>
            </div>
          </div>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl">{specs.longDescription}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { label: 'Richieste gestite/mese', value: scenario.stats.requests },
            { label: 'Soddisfazione utenti', value: scenario.stats.satisfaction },
            { label: 'Tempo medio risposta', value: scenario.stats.avgTime },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-center">
              <p className="text-3xl font-display font-800 text-white mb-1">{stat.value}</p>
              <p className="text-xs text-zinc-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-700 text-white mb-8">Casi d'uso</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {specs.useCases.map((uc, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${scenario.color} flex items-center justify-center text-sm font-bold text-white mb-4`}>
                  {i + 1}
                </div>
                <h3 className="font-semibold text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations + Languages */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-xl font-display font-700 text-white mb-6">Integrazioni supportate</h2>
            <div className="space-y-3">
              {specs.integrations.map(int => (
                <div key={int} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-zinc-400">{int}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-display font-700 text-white mb-6">Lingue disponibili</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {specs.languages.map(lang => (
                <span key={lang} className={`text-sm px-3 py-1.5 rounded-lg font-medium ${a.tag}`}>{lang}</span>
              ))}
            </div>
            <h2 className="text-xl font-display font-700 text-white mb-4">Tempo di setup</h2>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-white font-semibold">{specs.setup}</p>
                <p className="text-xs text-zinc-600">dalla firma del contratto</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-10 text-center">
          <button
            onClick={() => setRequested(true)}
            className={`inline-flex items-center gap-2 bg-gradient-to-r ${a.btn} text-white px-10 py-4 rounded-xl font-semibold text-base transition-all`}
          >
            Richiedi questo agent
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <p className="text-zinc-700 text-xs mt-4">Un nostro specialista ti contatterà entro 24 ore</p>
        </div>
      </div>
    </div>
  )
}
