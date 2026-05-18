/* eslint-disable react-refresh/only-export-components */
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export const SCENARIOS = [
  {
    id: 'portineria-scolastica',
    title: 'Portineria Scolastica',
    subtitle: 'Istruzione & Amministrazione',
    icon: '🏫',
    color: 'from-blue-500 to-indigo-600',
    accent: 'blue',
    tagline: 'Il receptionist digitale per la tua scuola',
    description: "Sportello orientamento interattivo per studenti e famiglie. Semplifica accesso informazioni, innova comunicazione interna e gestisce accoglienza H24.",
    features: ['Gestione permessi e giustificazioni', 'Info su orari e calendario scolastico', 'Smistamento comunicazioni', 'Supporto multilingue per famiglie straniere'],
    stats: { requests: '2.400+', satisfaction: '97%', avgTime: '< 8 sec' },
  },
  {
    id: 'hiring-screening',
    title: 'Hiring & Screening',
    subtitle: 'Risorse Umane',
    icon: '💼',
    color: 'from-violet-500 to-purple-700',
    accent: 'violet',
    tagline: 'Scrematura colloqui online automatizzata',
    description: "Automazione processi di selezione e screening candidati. Interviste strutturate, scoring automatico e report HR dettagliati.",
    features: ['Interviste strutturate automatizzate', 'Scoring e ranking candidati', 'Analisi CV e cover letter', 'Report dettagliato per HR'],
    stats: { requests: '1.800+', satisfaction: '94%', avgTime: '12 min' },
  },
  {
    id: 'palestra',
    title: 'Assistente Palestra',
    subtitle: 'Fitness & Wellness',
    icon: '🏋️',
    color: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
    tagline: "Il tuo personal trainer digitale H24",
    description: "Gestione appuntamenti e assistenza clienti 24/7. Abbonamenti, prenotazioni corsi e piani di allenamento personalizzati.",
    features: ['Gestione abbonamenti e rinnovi', 'Prenotazione corsi e personal trainer', 'Piani allenamento personalizzati', 'Promemoria e motivazione clienti'],
    stats: { requests: '3.100+', satisfaction: '96%', avgTime: '< 5 sec' },
  },
  {
    id: 'studio-medico',
    title: 'Studio Medico',
    subtitle: 'Salute & Medicina',
    icon: '🩺',
    color: 'from-rose-500 to-red-600',
    accent: 'rose',
    tagline: "Segreteria medica intelligente 24/7",
    description: "Automazione accoglienza e gestione pazienti. Prenotazioni, anamnesi preliminare e promemoria automatici.",
    features: ['Prenotazione e gestione appuntamenti', 'Anamnesi preliminare digitale', 'Info su esami e preparazioni', 'Promemoria automatici ai pazienti'],
    stats: { requests: '2.900+', satisfaction: '98%', avgTime: '< 6 sec' },
  },
]

const accentMap = {
  blue: { card: 'hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', btn: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25', dot: 'bg-blue-400' },
  violet: { card: 'hover:border-violet-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', btn: 'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25', dot: 'bg-violet-400' },
  emerald: { card: 'hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', btn: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25', dot: 'bg-emerald-400' },
  rose: { card: 'hover:border-rose-500/40 hover:shadow-[0_0_40px_rgba(244,63,94,0.1)]', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', btn: 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25', dot: 'bg-rose-400' },
}

export default function Templates() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 text-xs text-zinc-500 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            4 soluzioni No-Code pronte all'uso
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-800 mb-4">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">AI Agent</span>
            {' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">No-Code</span>
            <br />
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">per il tuo settore</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Soluzioni specifiche per Piccole Aziende Locali e Scuole. Configura e orchestra AI Agent senza scrivere codice.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {SCENARIOS.map((s) => {
            const a = accentMap[s.accent]
            return (
              <div
                key={s.id}
                onClick={() => navigate(`/templates/${s.id}`)}
                className={`group relative bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 cursor-pointer transition-all duration-300 ${a.card}`}
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {s.icon}
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${a.badge}`}>
                      {s.subtitle}
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-700 text-white mb-1">{s.title}</h2>
                  <p className="text-sm text-zinc-500 mb-4 italic">{s.tagline}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6">{s.description}</p>
                  <div className="space-y-2 mb-8">
                    {s.features.slice(0, 3).map(f => (
                      <div key={f} className="flex items-center gap-2.5 text-xs text-zinc-500">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`}></span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.06] mb-6">
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Richieste/mese</p>
                      <p className="text-sm font-semibold text-white">{s.stats.requests}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Soddisfazione</p>
                      <p className="text-sm font-semibold text-white">{s.stats.satisfaction}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 mb-1">Tempo risposta</p>
                      <p className="text-sm font-semibold text-white">{s.stats.avgTime}</p>
                    </div>
                  </div>
                  <button className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${a.btn}`}>
                    Vedi specifiche →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-zinc-600 text-sm mb-4">Non trovi il tuo settore?</p>
          <button
            onClick={() => navigate('/start-building')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:from-violet-500 hover:to-cyan-400 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          >
            Costruisci un agent custom →
          </button>
        </div>
      </div>
    </div>
  )
}
