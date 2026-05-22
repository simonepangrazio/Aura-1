import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { SCENARIOS } from './Templates'
import { sendContactRequest } from '../lib/contactRequests'

const FULL_SPECS = {
  'portineria-scolastica': {
    longDescription: "L'Agent Portineria Scolastica rivoluziona l'accoglienza nelle scuole di ogni ordine e grado. Disponibile 24/7, gestisce il flusso di comunicazione tra famiglie, studenti e personale scolastico con efficienza e cortesia, riducendo drasticamente il carico di lavoro del personale ATA.",
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
    longDescription: "Il modulo Hiring & Screening automatizza la fase più onerosa del recruiting: il primo contatto e la valutazione preliminare dei candidati. L'Agent conduce colloqui strutturati, valuta le risposte con scoring personalizzabile e produce report dettagliati per il team HR.",
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

const REQUEST_FORMS = {
  'portineria-scolastica': {
    title: 'Configura la portineria scolastica',
    description: 'Raccogliamo i dati necessari per adattare accoglienza, segreteria e comunicazioni al tuo istituto.',
    fields: [
      {
        key: 'schoolType',
        label: 'Tipo di istituto',
        type: 'select',
        options: ['Istituto comprensivo', 'Scuola primaria', 'Scuola secondaria', 'Campus / università', 'Altro'],
      },
      {
        key: 'students',
        label: 'Numero indicativo di studenti',
        type: 'select',
        options: ['Fino a 300', '300 - 800', '800 - 1.500', 'Oltre 1.500'],
      },
      {
        key: 'frontDeskHours',
        label: 'Orari e presidi da coprire',
        type: 'text',
        placeholder: 'Es: segreteria lun-ven 8:00-14:00, ingresso principale 7:30-16:30',
      },
      {
        key: 'priorityFlows',
        label: 'Flussi prioritari',
        type: 'checkboxes',
        options: ['Permessi di uscita', 'Giustificazioni assenze', 'Comunicazioni scuola-famiglia', 'Registrazione visitatori', 'Info calendario e circolari'],
      },
      {
        key: 'systems',
        label: 'Registro e strumenti già in uso',
        type: 'textarea',
        placeholder: 'Es: ClasseViva, Google Workspace, email istituzionali, centralino...',
      },
    ],
  },
  'hiring-screening': {
    title: 'Configura Hiring & Screening',
    description: 'Definiamo ruoli, criteri di valutazione e passaggi HR che l’agent dovrà automatizzare.',
    fields: [
      {
        key: 'roles',
        label: 'Ruoli da coprire',
        type: 'text',
        placeholder: 'Es: sales account, developer junior, receptionist...',
      },
      {
        key: 'monthlyCandidates',
        label: 'Candidati da gestire al mese',
        type: 'select',
        options: ['Fino a 50', '50 - 200', '200 - 500', 'Oltre 500'],
      },
      {
        key: 'screeningSteps',
        label: 'Step da automatizzare',
        type: 'checkboxes',
        options: ['Parsing CV', 'Domande knockout', 'Colloquio video/voce', 'Scoring competenze', 'Report per recruiter', 'Scheduling colloqui'],
      },
      {
        key: 'scoreCriteria',
        label: 'Criteri di scoring',
        type: 'textarea',
        placeholder: 'Es: esperienza minima, lingue, disponibilità, competenze tecniche, soft skill...',
      },
      {
        key: 'ats',
        label: 'ATS o strumenti HR',
        type: 'text',
        placeholder: 'Es: LinkedIn, Workday, BambooHR, fogli Google...',
      },
    ],
  },
  palestra: {
    title: 'Configura l’assistente palestra',
    description: 'Impostiamo abbonamenti, corsi e servizi che il tuo assistente dovrà gestire per clienti e prospect.',
    fields: [
      {
        key: 'gymType',
        label: 'Tipo di centro',
        type: 'select',
        options: ['Palestra generalista', 'Boutique fitness', 'Centro wellness', 'Box cross training', 'Studio personal trainer'],
      },
      {
        key: 'members',
        label: 'Clienti o iscritti attivi',
        type: 'select',
        options: ['Fino a 200', '200 - 700', '700 - 1.500', 'Oltre 1.500'],
      },
      {
        key: 'services',
        label: 'Servizi da gestire',
        type: 'checkboxes',
        options: ['Abbonamenti e rinnovi', 'Prenotazione corsi', 'Personal trainer', 'Schede allenamento', 'Trial e lead', 'Reminder scadenze'],
      },
      {
        key: 'courses',
        label: 'Corsi o attività principali',
        type: 'textarea',
        placeholder: 'Es: pilates, spinning, functional, sala pesi, nutrizione...',
      },
      {
        key: 'managementSoftware',
        label: 'Gestionale o app in uso',
        type: 'text',
        placeholder: 'Es: TeamSystem Wellness, Mindbody, app proprietaria...',
      },
    ],
  },
  'studio-medico': {
    title: 'Configura la segreteria medica',
    description: 'Raccogliamo specialità, flussi paziente e requisiti privacy per una segreteria davvero operativa.',
    fields: [
      {
        key: 'specialty',
        label: 'Specialità dello studio',
        type: 'text',
        placeholder: 'Es: odontoiatria, fisioterapia, medicina generale, dermatologia...',
      },
      {
        key: 'doctors',
        label: 'Numero di professionisti',
        type: 'select',
        options: ['1 professionista', '2 - 5 professionisti', '6 - 15 professionisti', 'Oltre 15 professionisti'],
      },
      {
        key: 'patientFlows',
        label: 'Flussi paziente prioritari',
        type: 'checkboxes',
        options: ['Prenotazione visite', 'Anamnesi preliminare', 'Preparazione esami', 'Promemoria appuntamenti', 'Follow-up post visita', 'Gestione urgenze'],
      },
      {
        key: 'bookingRules',
        label: 'Regole di prenotazione',
        type: 'textarea',
        placeholder: 'Es: durata visite, giorni per specialista, urgenze, documenti richiesti...',
      },
      {
        key: 'medicalSoftware',
        label: 'Gestionale medico o calendario',
        type: 'text',
        placeholder: 'Es: MioDottore, Doctolib, Google Calendar, Zucchetti...',
      },
    ],
  },
}

const CHANNELS = ['Sito web', 'WhatsApp', 'Totem fisico', 'Email', 'Dashboard interna']

function createInitialRequestForm(id) {
  const scenarioFields = REQUEST_FORMS[id]?.fields || []

  return {
    organization: '',
    contactName: '',
    email: '',
    phone: '',
    channels: [],
    launchWindow: 'Entro 5 giorni lavorativi',
    notes: '',
    scenario: scenarioFields.reduce((values, field) => ({
      ...values,
      [field.key]: field.type === 'checkboxes' ? [] : '',
    }), {}),
  }
}

export default function ScenarioDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [requestStep, setRequestStep] = useState('details')
  const [requestForm, setRequestForm] = useState(() => createInitialRequestForm(id))
  const [sendingRequest, setSendingRequest] = useState(false)
  const [requestError, setRequestError] = useState('')

  const scenario = SCENARIOS.find(s => s.id === id)
  const specs = FULL_SPECS[id]
  const formConfig = REQUEST_FORMS[id]

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
  const canSubmitRequest = Boolean(requestForm.organization.trim() && requestForm.contactName.trim() && requestForm.email.trim())

  const updateCommonField = (key, value) => {
    setRequestForm(form => ({ ...form, [key]: value }))
  }

  const updateScenarioField = (key, value) => {
    setRequestForm(form => ({
      ...form,
      scenario: { ...form.scenario, [key]: value },
    }))
  }

  const toggleMultiValue = (area, key, value) => {
    setRequestForm(form => {
      const currentValues = area === 'scenario' ? form.scenario[key] || [] : form[key] || []
      const nextValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value]

      if (area === 'scenario') {
        return { ...form, scenario: { ...form.scenario, [key]: nextValues } }
      }

      return { ...form, [key]: nextValues }
    })
  }

  const openRequestForm = () => {
    setRequestStep('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitRequest = async (event) => {
    event.preventDefault()
    if (!canSubmitRequest) return
    setSendingRequest(true)
    setRequestError('')

    try {
      await sendContactRequest({
        type: 'scenario',
        title: scenario.title,
        replyTo: requestForm.email,
        details: {
          scenarioId: id,
          scenarioTitle: scenario.title,
          organization: requestForm.organization,
          contactName: requestForm.contactName,
          email: requestForm.email,
          phone: requestForm.phone,
          channels: requestForm.channels,
          launchWindow: requestForm.launchWindow,
          notes: requestForm.notes,
          scenarioSpecifications: requestForm.scenario,
          includedUseCases: specs.useCases.map(useCase => useCase.title),
          supportedIntegrations: specs.integrations,
          setupTime: specs.setup,
          languages: specs.languages,
        },
      })
      setRequestStep('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setRequestError(error.message)
    } finally {
      setSendingRequest(false)
    }
  }

  const renderScenarioField = (field) => {
    const value = requestForm.scenario[field.key]
    const fieldClass = 'w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all text-sm'

    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={event => updateScenarioField(field.key, event.target.value)}
          className={fieldClass}
        >
          <option value="" className="bg-zinc-900">Seleziona un'opzione</option>
          {field.options.map(option => (
            <option key={option} value={option} className="bg-zinc-900">{option}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={event => updateScenarioField(field.key, event.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${fieldClass} resize-none`}
        />
      )
    }

    if (field.type === 'checkboxes') {
      return (
        <div className="grid sm:grid-cols-2 gap-2">
          {field.options.map(option => {
            const selected = value.includes(option)

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleMultiValue('scenario', field.key, option)}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                  selected
                    ? `${a.badge} bg-white/[0.06]`
                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )
    }

    return (
      <input
        type="text"
        value={value}
        onChange={event => updateScenarioField(field.key, event.target.value)}
        placeholder={field.placeholder}
        className={fieldClass}
      />
    )
  }

  if (requestStep === 'success') {
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

  if (requestStep === 'form') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
          <button
            onClick={() => setRequestStep('details')}
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Torna alle specifiche
          </button>

          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <form onSubmit={submitRequest} className="space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scenario.color} flex items-center justify-center text-2xl flex-shrink-0 ${a.glow}`}>
                    {scenario.icon}
                  </div>
                  <div>
                    <span className={`inline-block text-xs px-3 py-1.5 rounded-full border font-medium mb-2 ${a.badge}`}>
                      {scenario.subtitle}
                    </span>
                    <h1 className="font-display text-4xl lg:text-5xl font-800 text-white">{formConfig.title}</h1>
                  </div>
                </div>
                <p className="text-zinc-500 text-base max-w-2xl">{formConfig.description}</p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-700 text-white mb-1">Dati del richiedente</h2>
                  <p className="text-xs text-zinc-600">I campi con asterisco servono per avviare la richiesta.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Organizzazione *</label>
                    <input
                      type="text"
                      value={requestForm.organization}
                      onChange={event => updateCommonField('organization', event.target.value)}
                      placeholder="Nome azienda, scuola o studio"
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Referente *</label>
                    <input
                      type="text"
                      value={requestForm.contactName}
                      onChange={event => updateCommonField('contactName', event.target.value)}
                      placeholder="Nome e cognome"
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Email *</label>
                    <input
                      type="email"
                      value={requestForm.email}
                      onChange={event => updateCommonField('email', event.target.value)}
                      placeholder="nome@azienda.it"
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Telefono</label>
                    <input
                      type="tel"
                      value={requestForm.phone}
                      onChange={event => updateCommonField('phone', event.target.value)}
                      placeholder="+39 ..."
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-700 text-white mb-1">Caratteristiche dello scenario</h2>
                  <p className="text-xs text-zinc-600">Queste informazioni cambiano in base al template selezionato.</p>
                </div>

                <div className="space-y-5">
                  {formConfig.fields.map(field => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">{field.label}</label>
                      {renderScenarioField(field)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-display font-700 text-white mb-1">Canali e consegna</h2>
                  <p className="text-xs text-zinc-600">Scegli dove dovrà essere disponibile l’agent e quando vuoi partire.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Canali desiderati</label>
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map(channel => {
                      const selected = requestForm.channels.includes(channel)

                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => toggleMultiValue('common', 'channels', channel)}
                          className={`px-3 py-2 text-xs rounded-xl border transition-all ${
                            selected
                              ? `${a.badge} bg-white/[0.06]`
                              : 'bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                          }`}
                        >
                          {channel}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Finestra di avvio</label>
                    <select
                      value={requestForm.launchWindow}
                      onChange={event => updateCommonField('launchWindow', event.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/25 transition-all text-sm"
                    >
                      {['Entro 5 giorni lavorativi', 'Entro 2 settimane', 'Entro 1 mese', 'Sto esplorando'].map(option => (
                        <option key={option} value={option} className="bg-zinc-900">{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Note operative</label>
                    <input
                      type="text"
                      value={requestForm.notes}
                      onChange={event => updateCommonField('notes', event.target.value)}
                      placeholder="Vincoli, urgenze o dettagli utili"
                      className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!canSubmitRequest || sendingRequest}
                  className={`w-full py-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r ${a.btn} text-white`}
                >
                  {sendingRequest ? 'Invio richiesta...' : 'Invia richiesta configurata →'}
                </button>
                {!canSubmitRequest && (
                  <p className="text-center text-xs text-zinc-600 mt-2">
                    Compila organizzazione, referente ed email per inviare la richiesta
                  </p>
                )}
                {requestError && <p className="text-center text-xs text-red-400 mt-2">{requestError}</p>}
              </div>
            </form>

            <aside className="lg:sticky lg:top-32 h-fit">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${scenario.color}`}></div>
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Template selezionato</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center text-xl`}>
                        {scenario.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{scenario.title}</p>
                        <p className="text-xs text-zinc-500">{scenario.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Incluso nel setup</p>
                    {specs.useCases.slice(0, 3).map(useCase => (
                      <div key={useCase.title} className="flex items-start gap-3 text-sm text-zinc-400">
                        <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.dot}`}></span>
                        <span>{useCase.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/[0.07] pt-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">Setup base</span>
                      <span className="text-white font-semibold">{specs.setup}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">Lingue</span>
                      <span className="text-white font-semibold">{specs.languages.slice(0, 2).join(' / ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">Avvio</span>
                      <span className="text-white font-semibold">{requestForm.launchWindow}</span>
                    </div>
                  </div>

                  {requestForm.channels.length > 0 && (
                    <div className="border-t border-white/[0.07] pt-5">
                      <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">Canali scelti</p>
                      <div className="flex flex-wrap gap-2">
                        {requestForm.channels.map(channel => (
                          <span key={channel} className={`text-xs px-2.5 py-1 rounded-lg ${a.tag}`}>
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
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
            onClick={openRequestForm}
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
