import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AvatarSection from '../components/AvatarSection'
import { Book, FileText, Calendar, Headphones, PieChart, Megaphone, Box, BarChart2, Users, ArrowRight, Target, Shield, BrainCircuit, Code, Zap, Share2, Settings, Database, PenTool, Layout, Palette, ShieldCheck, Bug, TrendingUp, MessageCircle, BarChart3 } from 'lucide-react'

/* ── helpers ─────────────────────────────────────── */
const syne = { fontFamily: 'system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
const gradWarm = { background: 'linear-gradient(135deg,#a78bfa,#f0abfc,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const STEPS = [
  { n: '01', emoji: '⚙️', title: 'Configura', body: 'Descrivi il tuo Agent: comportamento, tono, obiettivi e tools. Il nostro form guidato ti accompagna passo dopo passo.' },
  { n: '02', emoji: '🔧', title: 'Noi lo costruiamo', body: 'Il nostro team di specialisti prende la tua richiesta, costruisce, testa e ottimizza il tuo artificial human.' },
  { n: '03', emoji: '🚀', title: 'Deploy & Go Live', body: "Ricevi il tuo Agent integrato nei tuoi canali — sito, app, totem, WhatsApp — in meno di 5 giorni." },
]

const FEATURES = [
  { emoji: '🗣️', title: 'Multilingue', body: 'La funzionalità di AI conversazionale è accessibile in numerose lingue, rispondendo così alla richiesta di una copertura globale nel mercato.', accent: '#7c3aed' },
  { emoji: '🔄', title: 'Automazione Flussi', body: 'Automatizza processi complessi e ripetitivi, liberando tempo prezioso per attività a maggior valore aggiunto.', accent: '#c026d3' },
  { emoji: '🤝', title: 'Interazioni Intelligenti', body: 'Gestisci comunicazioni personalizzate con clienti, supporto 24/7 e processi decisionali autonomi in tempo reale.', accent: '#0891b2' },
  { emoji: '🔌', title: 'Integrazione Totale', body: 'Connettiti a CRM, calendari, sistemi aziendali e API custom. Unifica tutti i servizi in una piattaforma unica.', accent: '#059669' },
  { emoji: '🌍', title: 'Presenza Omnichannel', body: 'Dal web allo spazio fisico tramite totem preinstallati. I tuoi Agent operano ovunque li serva.', accent: '#d97706' },
  { emoji: '🎯', title: 'Efficienza Umana', body: 'Restituisci valore al lavoro delle persone, automatizzando task ripetitivi e garantendo personale più specializzato.', accent: '#dc2626' },
]


const ECOSYSTEM_NODES = [
  { label: 'Knowledge\nManagement', icon: Book, pos: { top: '5%', left: '50%' } },
  { label: 'Intelligent\nDocument\nProcessing', icon: FileText, pos: { top: '18%', left: '85%' } },
  { label: 'Booking\nSystem', icon: Calendar, pos: { top: '50%', left: '95%' } },
  { label: 'Smart\nContact\nCenter', icon: Headphones, pos: { top: '82%', left: '85%' } },
  { label: 'Finance Data\nManagement', icon: PieChart, pos: { top: '95%', left: '50%' } },
  { label: 'Marketing\n& Selling', icon: Megaphone, pos: { top: '82%', left: '15%' } },
  { label: 'Supply Chain', icon: Box, pos: { top: '50%', left: '5%' } },
  { label: 'Business\nIntelligence', icon: BarChart2, pos: { top: '30%', left: '10%' } },
  { label: 'Human\nResources\nManagement', icon: Users, pos: { top: '15%', left: '25%' } },
];

const TEAM = [
  {
    name: 'Simone Pangrazio', role: 'Project Manager', roleColor: '#0284c7', borderColor: '#0284c7',
    avatarImg: '/team/simone.png',
    bullets: [
      { icon: Target, text: 'Pianificazione e controllo progetti' },
      { icon: Users, text: 'Leadership e gestione del team' },
      { icon: Shield, text: 'Analisi del rischio e processi' }
    ]
  },
  {
    name: 'Alessio Matteucci', role: 'AI Developer', roleColor: '#2563eb', borderColor: '#2563eb',
    avatarImg: '/team/alessio.png',
    bullets: [
      { icon: BrainCircuit, text: 'Sviluppo AI Beyond Presence' },
      { icon: Code, text: 'Ingegneria del prompt e automazioni' },
      { icon: Zap, text: 'Integrazione API e strumenti AI' }
    ]
  },
  {
    name: 'Jan Borozan', role: 'AI Developer (n8n)', roleColor: '#059669', borderColor: '#059669',
    avatarImg: '/team/jan.png',
    bullets: [
      { icon: Share2, text: 'Sviluppo workflow con n8n' },
      { icon: Settings, text: 'Automazioni avanzate e integrazioni' },
      { icon: Database, text: 'Ottimizzazione processi e scalabilità' }
    ]
  },
  {
    name: 'Marco Ippolito', role: 'UI Designer', roleColor: '#9333ea', borderColor: '#9333ea',
    avatarImg: '/team/marco.png',
    bullets: [
      { icon: PenTool, text: 'Progettazione UI e Design System' },
      { icon: Layout, text: 'Wireframing e prototipazione' },
      { icon: Palette, text: 'User Experience e accessibilità' }
    ]
  },
  {
    name: 'Cristian Gorovei', role: 'QA Tester', roleColor: '#0d9488', borderColor: '#0d9488',
    avatarImg: '/team/cristian.png',
    bullets: [
      { icon: ShieldCheck, text: 'Test funzionali e non funzionali' },
      { icon: Bug, text: 'Bug tracking e segnalazioni' },
      { icon: TrendingUp, text: 'Quality assurance e miglioramento' }
    ]
  },
  {
    name: 'Christian Ippoliti', role: 'Social Media Manager', roleColor: '#c026d3', borderColor: '#c026d3',
    avatarImg: '/team/christian.png',
    bullets: [
      { icon: MessageCircle, text: 'Content creation e copywriting' },
      { icon: BarChart3, text: 'Gestione social e community' },
      { icon: PieChart, text: 'Analytics e reporting' }
    ]
  }
];

const TEMPLATES = [
  {
    emoji: '🌐',
    label: 'Ecosistema AURA',
    id: 'ecosistema-aura',
    color: '#0891b2',
    isEcosystem: true
  },

  {
    emoji: '🏫',
    label: 'Portineria Scolastica',
    id: 'portineria-scolastica',
    color: '#3b82f6',
    payoff: 'Accoglienza studenti, genitori e personale sempre disponibile.',
    nodes: ['Segreteria', 'Calendario', 'FAQ scuola', 'Comunicazioni', 'Orientamento', 'Documenti'],
  },
  {
    emoji: '💼',
    label: 'Hiring & Screening',
    id: 'hiring-screening',
    color: '#8b5cf6',
    payoff: 'Pre-screening candidati, domande guidate e report per HR.',
    nodes: ['CV parsing', 'Colloqui', 'Score HR', 'Onboarding', 'Agenda', 'Report'],
  },
  {
    emoji: '🏋️',
    label: 'Assistente Palestra',
    id: 'palestra',
    color: '#10b981',
    payoff: 'Prenotazioni, abbonamenti e supporto clienti per il fitness.',
    nodes: ['Booking corsi', 'Abbonamenti', 'Trainer', 'Promozioni', 'Check-in', 'Supporto'],
  },
  {
    emoji: '🩺',
    label: 'Studio Medico',
    id: 'studio-medico',
    color: '#f43f5e',
    payoff: 'Gestione pazienti, appuntamenti e richieste ricorrenti.',
    nodes: ['Agenda visite', 'Anamnesi', 'Promemoria', 'Documenti', 'Triage', 'Follow-up'],
  },
]

const ORBIT_POSITIONS = [
  { left: '50%', top: '7%' },
  { left: '83%', top: '23%' },
  { left: '88%', top: '58%' },
  { left: '62%', top: '86%' },
  { left: '21%', top: '72%' },
  { left: '13%', top: '34%' },
]

function SectorOrbit({ sector }) {
  return (
    <div className="sector-orbit-card" style={{ '--sector-color': sector.color }}>
      <div className="sector-orbit-copy sector-orbit-copy-left">
        <span>{sector.nodes[0]}</span>
        <span>{sector.nodes[1]}</span>
      </div>

      <div className="sector-orbit">
        <div className="sector-orbit-ring sector-orbit-ring-outer" />
        <div className="sector-orbit-ring sector-orbit-ring-middle" />
        <div className="sector-orbit-ring sector-orbit-ring-inner" />

        {sector.nodes.map((node, index) => (
          <div
            key={node}
            className="sector-orbit-node"
            style={{ left: ORBIT_POSITIONS[index].left, top: ORBIT_POSITIONS[index].top }}
          >
            <span>{index + 1}</span>
          </div>
        ))}

        <div className="sector-orbit-agent">
          <div className="sector-orbit-avatar">
            <span>{sector.emoji}</span>
          </div>
          <div className="sector-orbit-badge">
            <strong>AURA</strong>
            <small>{sector.label}</small>
          </div>
        </div>
      </div>

      <div className="sector-orbit-copy sector-orbit-copy-right">
        <span>{sector.nodes[2]}</span>
        <span>{sector.nodes[3]}</span>
        <span>{sector.nodes[4]}</span>
      </div>

      <div className="sector-orbit-caption">
        <strong>{sector.label}</strong>
        <p>{sector.payoff}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [activeTemplate, setActiveTemplate] = useState(0)
  const [showEcosystem, setShowEcosystem] = useState(false)
  const selectedTemplate = TEMPLATES[activeTemplate]
  const showNextTemplate = () => setActiveTemplate((activeTemplate + 1) % TEMPLATES.length)

  return (
    <div className="min-h-screen bg-[#08080e] text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative flex items-center pt-32 pb-20 lg:pt-40 lg:pb-28 px-6">
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{ position: 'absolute', top: '20%', left: '25%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'absolute', top: '45%', right: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-14 items-center">

          {/* left */}
          <div className="flex flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full px-5 py-2.5 text-xs text-zinc-400" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Piattaforma No-Code — AI Agent Orchestration
            </div>

            <h1 style={{ ...syne, fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', lineHeight: 1.0, margin: 0 }}>
              <span style={{ color: '#fff' }}>Evolvi il tuo business</span><br />
              <span style={gradWarm}>con un</span><br />
              <span style={{ color: '#fff' }}>agente conversazionale</span><br />

            </h1>

            <p style={{ fontSize: '1.2rem', lineHeight: 1.75, color: '#a1a1aa', maxWidth: 440, margin: 0 }}>
              Aura è la piattaforma di cui non sai ancora di aver bisogno. Cavalca l'onda dell'automazione, non lasciarti travolgere.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/demo')}
                style={{ background: 'linear-gradient(135deg,#7c3aed,#0891b2)', boxShadow: '0 0 50px rgba(124,58,237,0.45)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '1rem', padding: '1rem 2rem', borderRadius: '1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
              >
                Richiedi una Demo
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <button
                onClick={() => navigate('/templates')}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '1rem 2rem', borderRadius: '1rem', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                Esplora i template
              </button>
            </div>

          </div>

          {/* right – avatar */}
          <div className="relative" style={{ marginTop: '2rem' }}>
            <div style={{ position: 'absolute', inset: -24, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 70%)', borderRadius: 48, pointerEvents: 'none' }} />
            <AvatarSection />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="px-6" style={{ padding: '5.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '3.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>Come funziona</p>
            <h2 style={{ ...syne, fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#fff', margin: 0 }}>
              Dal briefing al tuo Agent<br />
              <span style={grad}>in pochi giorni</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.75rem' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.75rem', padding: '3rem 2.5rem', transition: 'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.045)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
                  <span style={{ ...syne, fontSize: '4rem', color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>{s.n}</span>
                </div>
                <h3 style={{ ...syne, fontSize: '1.4rem', color: '#fff', marginBottom: '1rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.95rem', color: '#71717a', lineHeight: 1.75, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section style={{ padding: '5.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '3.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>Tecnologia</p>
            <h2 style={{ ...syne, fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#fff', margin: 0 }}>
              Tutto ciò che ti serve,<br />
              <span style={grad}>già incluso</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i}
                style={{ background: `radial-gradient(ellipse at top left, ${f.accent}18 0%, rgba(8,8,14,0) 60%), rgba(255,255,255,0.025)`, border: `1px solid ${f.accent}28`, borderRadius: '1.5rem', padding: '2.5rem', transition: 'transform .25s, box-shadow .25s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${f.accent}22` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.accent}22`, border: `1px solid ${f.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                  {f.emoji}
                </div>
                <h3 style={{ ...syne, fontSize: '1.15rem', color: '#fff', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#71717a', lineHeight: 1.75, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES / ECOSYSTEM TOGGLE ────────────────────────────────── */}
      <section style={{ padding: '5.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto templates-teaser-grid" style={{ alignItems: 'center' }}>
          <div>
            {!showEcosystem ? (
              <>
                <p style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.25rem' }}>Template pronti</p>
                <h2 style={{ ...syne, fontSize: 'clamp(2.5rem,4.5vw,3.75rem)', color: '#fff', marginBottom: '1.5rem' }}>
                  Il tuo settore,<br />
                  <span style={grad}>già configurato</span>
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#71717a', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  Soluzioni specifiche per Piccole Aziende Locali e Scuole. Template pre-configurati per ottimizzare risorse senza sostenere costi di presidio umano H24.
                </p>
                <button
                  onClick={() => navigate('/templates')}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '0.95rem', padding: '0.875rem 1.75rem', borderRadius: '0.875rem', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Vedi tutti i template →
                </button>
              </>
            ) : (
              <>
                <h2 style={{ ...syne, fontSize: 'clamp(2.5rem,4.5vw,3.75rem)', color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                  L'ecosistema AURA,<br />
                  <span style={grad}>già configurato</span>
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#a1a1aa', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  AURA integra tecnologie proprietarie, AI conversazionale, machine learning e natural language processing per creare AI Agent capaci di <strong style={{ color: '#22d3ee', fontWeight: 600 }}>comprendere, generare e adattare</strong> azioni e decisioni in diversi contesti.
                </p>
                <p style={{ fontSize: '1.1rem', color: '#a1a1aa', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  Una piattaforma <strong style={{ color: '#a78bfa', fontWeight: 600 }}>flessibile</strong> e pronta all'uso, pensata per rispondere alle esigenze reali della tua organizzazione.
                </p>

              </>
            )}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, width: '100%' }}>
              {!showEcosystem ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {TEMPLATES.filter(t => !t.isEcosystem).map(t => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/templates/${t.id}`)}
                      style={{
                        cursor: 'pointer',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                        border: `1px solid ${t.color}33`,
                        borderRadius: '1.5rem',
                        padding: '2rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        minHeight: '220px',
                        boxShadow: `0 10px 30px ${t.color}11`,
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${t.color}22` }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 10px 30px ${t.color}11` }}
                    >
                      <div style={{ fontSize: '3.5rem', marginBottom: 'auto', alignSelf: 'center', marginTop: '1rem' }}>{t.emoji}</div>
                      <h3 style={{ ...syne, fontSize: '1rem', color: '#fff', margin: '1.5rem 0 0 0' }}>{t.label}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 0 50px rgba(124,58,237,0.1)', borderStyle: 'dashed' }} />
                  <div style={{ position: 'absolute', inset: '25%', borderRadius: '50%', border: '1px solid rgba(8,145,178,0.2)', boxShadow: '0 0 40px rgba(8,145,178,0.1)' }} />
                  <div style={{ position: 'absolute', inset: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {ECOSYSTEM_NODES.map((n, i) => (
                      <line key={`line-${i}`} x1="50%" y1="50%" x2={n.pos.left} y2={n.pos.top} stroke="rgba(124,58,237,0.3)" strokeWidth="1" />
                    ))}
                  </svg>

                  <div style={{ position: 'relative', width: '35%', height: '35%', borderRadius: '50%', background: 'linear-gradient(135deg, #1e1e2e, #0f0f1a)', border: '2px solid rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 0 60px rgba(124,58,237,0.4)', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: 'url(/Logo_Aura_vett.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8 }} />

                  </div>

                  {ECOSYSTEM_NODES.map((node, i) => {
                    const Icon = node.icon;
                    return (
                      <div key={i} style={{ position: 'absolute', top: node.pos.top, left: node.pos.left, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f0f1a', border: '1px solid rgba(34,211,238,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(34,211,238,0.2)' }}>
                          <Icon size={18} color="#22d3ee" />
                        </div>
                        <div style={{ color: '#e4e4e7', fontSize: '0.75rem', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                          {node.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Toggle Arrow next to the grid/wheel */}
            <div style={{ position: 'absolute', right: '-3rem', top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}>
              <button
                onClick={() => setShowEcosystem(!showEcosystem)}
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                title={showEcosystem ? "Torna agli scenari" : "Vedi l'ecosistema AURA"}
              >
                {!showEcosystem ? <ArrowRight size={24} /> : <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Tecnologie integrate solo per l'ecosistema */}
        {showEcosystem && (
          <div className="max-w-6xl mx-auto" style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem 2rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginBottom: '1.5rem' }}>Tecnologie integrate</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" alt="Python" style={{ height: '24px' }} />
                <span style={{ color: '#e4e4e7', fontWeight: 500, fontSize: '0.9rem' }}>Python</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5V9.5l4 2.5-4 2.5z" /></svg>
                <span style={{ color: '#e4e4e7', fontWeight: 500, fontSize: '0.9rem' }}>OpenAI</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #22d3ee, #7c3aed)', borderRadius: '4px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ color: '#e4e4e7', fontSize: '0.75rem', fontWeight: 500 }}>Proprietary</span>
                  <span style={{ color: '#e4e4e7', fontSize: '0.75rem', fontWeight: 500 }}>AI Models</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ color: '#e4e4e7', fontSize: '0.8rem', fontWeight: 600 }}>n8n</span>
                  <span style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Automation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── TEAM SECTION ────────────────────────────────────── */}
      <section style={{ padding: '5.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#08080e' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1rem', fontWeight: 600 }}>IL NOSTRO TEAM</p>
              <h2 style={{ ...syne, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', margin: '0 0 1rem 0', lineHeight: 1.1 }}>
                Le persone dietro <span style={{ color: '#a78bfa' }}>AURA</span>
              </h2>
              <p style={{ fontSize: '1rem', color: '#a1a1aa', maxWidth: '500px', lineHeight: 1.6, margin: 0 }}>
                Un team multidisciplinare che unisce competenze tecniche, creatività e visione strategica per costruire soluzioni AI su misura.
              </p>
            </div>
            
            {/* Illustration decoration similar to image top right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', border: '1px dashed rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={48} color="#7c3aed" />
                <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.1)', animation: 'pulse 3s infinite' }} />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#a1a1aa', maxWidth: '200px', lineHeight: 1.5, margin: 0 }}>
                Insieme per trasformare l'intelligenza artificiale in <span style={{ color: '#22d3ee' }}>valore concreto</span> per il tuo business.
              </p>
            </div>
          </div>

          {/* Grid of Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map(member => (
              <div key={member.name}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid rgba(255,255,255,0.05)`,
                  borderRadius: '1.25rem',
                  padding: '2rem 1.5rem',
                  transition: 'all 0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = `${member.borderColor}55`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = `rgba(255,255,255,0.05)`; }}
              >
                {/* Avatar with glow */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'absolute', inset: '-10px', background: member.borderColor, filter: 'blur(30px)', opacity: 0.15, borderRadius: '50%' }} />
                  <div style={{ width: 120, height: 120, borderRadius: '50%', border: `2px solid ${member.borderColor}66`, background: '#18181b', overflow: 'hidden', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={member.avatarImg} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>

                {/* Name & Role */}
                <h3 style={{ ...syne, fontSize: '1.15rem', color: '#fff', marginBottom: '0.25rem', textAlign: 'center' }}>{member.name}</h3>
                <p style={{ color: member.roleColor, fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.75rem', textAlign: 'center' }}>{member.role}</p>

                {/* Bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  {member.bullets.map((bullet, idx) => {
                    const Icon = bullet.icon;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ color: member.roleColor, marginTop: '2px' }}>
                          <Icon size={18} strokeWidth={1.5} />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.4 }}>{bullet.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom Footer Note */}
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '999px' }}>
              <Users size={16} color="#22d3ee" />
              <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>
                Competenze diverse, un unico obiettivo: creare <span style={{ color: '#22d3ee' }}>soluzioni AI</span> <span style={{ color: '#a78bfa' }}>intelligenti</span> e su misura per te.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO CALLOUT ────────────────────────────────────── */}
      <section style={{ padding: '5.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(8,8,14,0) 50%, rgba(8,145,178,0.08) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '2.5rem', padding: '3.75rem', position: 'relative', overflow: 'hidden' }}>
            {/* decorative orbs */}
            <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 250, height: 250, background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
              {/* text */}
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 999, padding: '0.5rem 1.125rem', fontSize: '0.75rem', color: '#a78bfa', marginBottom: '1.75rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  Parla con un nostro specialista
                </div>
                <h2 style={{ ...syne, fontSize: 'clamp(2.2rem,4vw,3.5rem)', color: '#fff', marginBottom: '1.25rem' }}>
                  Prenota una<br />
                  <span style={grad}>demo gratuita</span>
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#71717a', lineHeight: 1.8, marginBottom: '2rem' }}>
                  Scopri come AURA può trasformare i tuoi processi aziendali. Demo personalizzata per il tuo settore, 30 minuti senza impegno.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {['Demo personalizzata sul tuo settore', 'Consulenza con un AI specialist', 'Analisi delle tue esigenze specifiche', 'Preventivo su misura senza impegno'].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#a1a1aa' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="10" fill="none" stroke="#a78bfa" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* mini form */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.5rem', padding: '2.5rem' }}>
                <h3 style={{ ...syne, fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Prenota ora — è gratuito</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {[
                    { label: 'Nome', placeholder: 'Mario', type: 'text' },
                    { label: 'Email aziendale', placeholder: 'mario@azienda.it', type: 'email' },
                    { label: 'Azienda', placeholder: 'Nome azienda', type: 'text' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: '0.75rem', color: '#71717a', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/demo')}
                    style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg,#7c3aed,#0891b2)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '0.875rem', borderRadius: '0.75rem', cursor: 'pointer', boxShadow: '0 0 30px rgba(124,58,237,0.35)', width: '100%' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    Prenota la mia demo gratuita →
                  </button>
                  <p style={{ fontSize: '0.72rem', color: '#3f3f50', textAlign: 'center', margin: 0 }}>Senza impegno · Risposta entro 24 ore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section style={{ padding: '5.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div className="max-w-3xl mx-auto">
          <h2 style={{ ...syne, fontSize: 'clamp(3rem,6vw,5.5rem)', color: '#fff', lineHeight: 1.0, marginBottom: '1.5rem' }}>
            Pronto a configurare<br />
            <span style={gradWarm}>il tuo AURA?</span>
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#71717a', lineHeight: 1.75, marginBottom: '3rem' }}>
            La tua piattaforma di orchestrazione AI Agent sarà operativa in meno di una settimana.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/demo')}
              style={{ background: 'linear-gradient(135deg,#7c3aed,#0891b2)', boxShadow: '0 0 60px rgba(124,58,237,0.5)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '1.05rem', padding: '1.1rem 2.5rem', borderRadius: '1.125rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Richiedi una Demo
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
            <button onClick={() => navigate('/templates')}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: '1.05rem', padding: '1.1rem 2.5rem', borderRadius: '1.125rem', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              Esplora i template
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              aria-hidden="true"
              style={{ width: 34, height: 34, borderRadius: '0.75rem', backgroundImage: 'url(/Logo_Aura_vett.png)', backgroundSize: '170%', backgroundPosition: 'center 35%', boxShadow: '0 0 18px rgba(124,58,237,0.28)', flexShrink: 0 }}
            />
            <span style={{ ...syne, fontSize: '1rem' }}>
              <span style={{ color: '#fff' }}>AU</span>
              <span style={grad}>RA</span>
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#3f3f50', margin: 0 }}>© 2025 AURA — Piattaforma No-Code per Orchestrazione AI Agent. Tutti i diritti riservati.</p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#3f3f50' }}>
            {['Privacy Policy', 'Termini di servizio', 'Cookie'].map(l => (
              <span key={l} style={{ cursor: 'pointer', transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#71717a'}
                onMouseLeave={e => e.currentTarget.style.color = '#3f3f50'}
              >{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
