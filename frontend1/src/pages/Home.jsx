import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AvatarSection from '../components/AvatarSection'

/* ── helpers ─────────────────────────────────────── */
const syne = { fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
const gradWarm = { background: 'linear-gradient(135deg,#a78bfa,#f0abfc,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const STEPS = [
  { n: '01', emoji: '⚙️', title: 'Configura',        body: 'Descrivi il tuo Agent: comportamento, tono, obiettivi e tools. Il nostro form guidato ti accompagna passo dopo passo.' },
  { n: '02', emoji: '🔧', title: 'Noi lo costruiamo', body: 'Il nostro team di specialisti prende la tua richiesta, costruisce, testa e ottimizza il tuo artificial human.' },
  { n: '03', emoji: '🚀', title: 'Deploy & Go Live',  body: "Ricevi il tuo Agent integrato nei tuoi canali — sito, app, totem, WhatsApp — in meno di 5 giorni." },
]

const FEATURES = [
  { emoji: '⚙️', title: 'Piattaforma No-Code', body: 'Progetta e orchestra AI Agent specifici senza scrivere una riga di codice. Interfaccia intuitiva per configurare comportamenti complessi.', accent: '#7c3aed' },
  { emoji: '🔄', title: 'Automazione Flussi', body: 'Automatizza processi complessi e ripetitivi, liberando tempo prezioso per attività a maggior valore aggiunto.', accent: '#c026d3' },
  { emoji: '🤝', title: 'Interazioni Intelligenti', body: 'Gestisci comunicazioni personalizzate con clienti, supporto 24/7 e processi decisionali autonomi in tempo reale.', accent: '#0891b2' },
  { emoji: '🔌', title: 'Integrazione Totale', body: 'Connettiti a CRM, calendari, sistemi aziendali e API custom. Unifica tutti i servizi in una piattaforma unica.', accent: '#059669' },
  { emoji: '🌍', title: 'Presenza Omnichannel', body: 'Dal web allo spazio fisico tramite totem preinstallati. I tuoi Agent operano ovunque li serva.', accent: '#d97706' },
  { emoji: '🎯', title: 'Efficienza Umana', body: 'Restituisci valore al lavoro delle persone, automatizzando task ripetitivi e garantendo personale più specializzato.', accent: '#dc2626' },
]

const TEMPLATES = [
  { emoji: '🏫', label: 'Portineria Scolastica', id: 'portineria-scolastica', color: '#3b82f6' },
  { emoji: '💼', label: 'Hiring & Screening',    id: 'hiring-screening',      color: '#8b5cf6' },
  { emoji: '🏋️', label: 'Assistente Palestra',   id: 'palestra',              color: '#10b981' },
  { emoji: '🩺', label: 'Studio Medico',         id: 'studio-medico',         color: '#f43f5e' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#08080e] text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative flex items-center pt-32 pb-20 lg:pt-40 lg:pb-28 px-6">
        {/* ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{ position:'absolute', top:'20%', left:'25%', width:700, height:700, background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', transform:'translate(-50%,-50%)' }} />
          <div style={{ position:'absolute', top:'45%', right:'10%', width:500, height:500, background:'radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-14 items-center">

          {/* left */}
          <div className="flex flex-col gap-7">
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full px-5 py-2.5 text-xs text-zinc-400" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Piattaforma No-Code — AI Agent Orchestration
            </div>

            <h1 style={{ ...syne, fontSize:'clamp(2.4rem, 5.5vw, 4.2rem)', lineHeight:1.0, margin:0 }}>
              <span style={{ color:'#fff' }}>Automatizza</span><br />
              <span style={gradWarm}>i processi</span><br />
              <span style={{ color:'#fff' }}>complessi</span><br />
              <span style={{ color:'#3f3f50' }}>senza codice.</span>
            </h1>

            <p style={{ fontSize:'1.2rem', lineHeight:1.75, color:'#a1a1aa', maxWidth:440, margin:0 }}>
              AURA è la piattaforma <strong style={{ color:'#fff', fontWeight:600 }}>No-Code</strong> per progettare e orchestrare AI Agent che automatizzano flussi di lavoro complessi, gestiscono interazioni intelligenti con i clienti e integrano tutti i tuoi servizi digitali.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/demo')}
                style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', boxShadow:'0 0 50px rgba(124,58,237,0.45)', border:'none', color:'#fff', fontWeight:700, fontSize:'1rem', padding:'1rem 2rem', borderRadius:'1rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.75rem' }}
              >
                Richiedi una Demo
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
              <button
                onClick={() => navigate('/templates')}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontWeight:600, fontSize:'1rem', padding:'1rem 2rem', borderRadius:'1rem', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
              >
                Esplora i template
              </button>
            </div>

                      </div>

          {/* right – avatar */}
          <div className="relative" style={{ marginTop: '2rem' }}>
            <div style={{ position:'absolute', inset:-24, background:'radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 70%)', borderRadius:48, pointerEvents:'none' }} />
            <AvatarSection />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="px-6" style={{ padding:'5.25rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign:'center', marginBottom:'3.25rem' }}>
            <p style={{ fontSize:'0.7rem', color:'#52525b', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'1rem' }}>Come funziona</p>
            <h2 style={{ ...syne, fontSize:'clamp(2.5rem,5vw,4rem)', color:'#fff', margin:0 }}>
              Dal briefing al tuo Agent<br />
              <span style={grad}>in 5 giorni</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1.75rem' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.75rem', padding:'3rem 2.5rem', transition:'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.045)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem' }}>
                  <span style={{ fontSize:'2rem' }}>{s.emoji}</span>
                  <span style={{ ...syne, fontSize:'4rem', color:'rgba(255,255,255,0.04)', lineHeight:1 }}>{s.n}</span>
                </div>
                <h3 style={{ ...syne, fontSize:'1.4rem', color:'#fff', marginBottom:'1rem' }}>{s.title}</h3>
                <p style={{ fontSize:'0.95rem', color:'#71717a', lineHeight:1.75, margin:0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section style={{ padding:'5.25rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign:'center', marginBottom:'3.25rem' }}>
            <p style={{ fontSize:'0.7rem', color:'#52525b', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'1rem' }}>Tecnologia</p>
            <h2 style={{ ...syne, fontSize:'clamp(2.5rem,5vw,4rem)', color:'#fff', margin:0 }}>
              Tutto ciò che ti serve,<br />
              <span style={grad}>già incluso</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i}
                style={{ background:`radial-gradient(ellipse at top left, ${f.accent}18 0%, rgba(8,8,14,0) 60%), rgba(255,255,255,0.025)`, border:`1px solid ${f.accent}28`, borderRadius:'1.5rem', padding:'2.5rem', transition:'transform .25s, box-shadow .25s', cursor:'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${f.accent}22` }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
              >
                <div style={{ width:52, height:52, borderRadius:16, background:`${f.accent}22`, border:`1px solid ${f.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', marginBottom:'1.5rem' }}>
                  {f.emoji}
                </div>
                <h3 style={{ ...syne, fontSize:'1.15rem', color:'#fff', marginBottom:'0.75rem' }}>{f.title}</h3>
                <p style={{ fontSize:'0.9rem', color:'#71717a', lineHeight:1.75, margin:0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES TEASER ────────────────────────────────── */}
      <section style={{ padding:'5.25rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3.5rem', alignItems:'center' }}>
          <div>
            <p style={{ fontSize:'0.7rem', color:'#52525b', textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:'1.25rem' }}>Template pronti</p>
            <h2 style={{ ...syne, fontSize:'clamp(2.5rem,4.5vw,3.75rem)', color:'#fff', marginBottom:'1.5rem' }}>
              Il tuo settore,<br />
              <span style={grad}>già configurato</span>
            </h2>
            <p style={{ fontSize:'1.1rem', color:'#71717a', lineHeight:1.8, marginBottom:'2.5rem' }}>
              Soluzioni specifiche per Piccole Aziende Locali e Scuole. Template pre-configurati per ottimizzare risorse senza sostenere costi di presidio umano H24.
            </p>
            <button
              onClick={() => navigate('/templates')}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontWeight:600, fontSize:'0.95rem', padding:'0.875rem 1.75rem', borderRadius:'0.875rem', cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
            >
              Vedi tutti i template →
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => navigate(`/templates/${t.id}`)}
                style={{ background:`radial-gradient(ellipse at top left, ${t.color}20 0%, rgba(8,8,14,0) 70%)`, border:`1px solid ${t.color}28`, borderRadius:'1.5rem', padding:'2rem', textAlign:'left', cursor:'pointer', transition:'all .25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px) scale(1.02)'; e.currentTarget.style.borderColor=`${t.color}60` }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor=`${t.color}28` }}
              >
                <span style={{ fontSize:'2.5rem', display:'block', marginBottom:'1rem' }}>{t.emoji}</span>
                <span style={{ fontSize:'0.875rem', fontWeight:600, color:'#d4d4d8', lineHeight:1.4 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CALLOUT ────────────────────────────────────── */}
      <section style={{ padding:'5.25rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ background:'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(8,8,14,0) 50%, rgba(8,145,178,0.08) 100%)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'2.5rem', padding:'3.75rem', position:'relative', overflow:'hidden' }}>
            {/* decorative orbs */}
            <div style={{ position:'absolute', top:-80, left:-80, width:300, height:300, background:'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-80, right:-80, width:250, height:250, background:'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

            <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3.5rem', alignItems:'center' }}>
              {/* text */}
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:999, padding:'0.5rem 1.125rem', fontSize:'0.75rem', color:'#a78bfa', marginBottom:'1.75rem' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:'#a78bfa', display:'inline-block', animation:'pulse 2s infinite' }} />
                  Parla con un nostro specialista
                </div>
                <h2 style={{ ...syne, fontSize:'clamp(2.2rem,4vw,3.5rem)', color:'#fff', marginBottom:'1.25rem' }}>
                  Prenota una<br />
                  <span style={grad}>demo gratuita</span>
                </h2>
                <p style={{ fontSize:'1.05rem', color:'#71717a', lineHeight:1.8, marginBottom:'2rem' }}>
                  Scopri come AURA può trasformare i tuoi processi aziendali. Demo personalizzata per il tuo settore, 30 minuti senza impegno.
                </p>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                  {['Demo personalizzata sul tuo settore', 'Consulenza con un AI specialist', 'Analisi delle tue esigenze specifiche', 'Preventivo su misura senza impegno'].map(item => (
                    <li key={item} style={{ display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.9rem', color:'#a1a1aa' }}>
                      <span style={{ width:20, height:20, borderRadius:'50%', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="10" height="10" fill="none" stroke="#a78bfa" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* mini form */}
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'1.5rem', padding:'2.5rem' }}>
                <h3 style={{ ...syne, fontSize:'1.25rem', color:'#fff', marginBottom:'1.5rem' }}>Prenota ora — è gratuito</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                  {[
                    { label:'Nome', placeholder:'Mario', type:'text' },
                    { label:'Email aziendale', placeholder:'mario@azienda.it', type:'email' },
                    { label:'Azienda', placeholder:'Nome azienda', type:'text' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize:'0.75rem', color:'#71717a', display:'block', marginBottom:6 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'0.75rem', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/demo')}
                    style={{ marginTop:'0.5rem', background:'linear-gradient(135deg,#7c3aed,#0891b2)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.9rem', padding:'0.875rem', borderRadius:'0.75rem', cursor:'pointer', boxShadow:'0 0 30px rgba(124,58,237,0.35)', width:'100%' }}
                    onMouseEnter={e => e.currentTarget.style.opacity='.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}
                  >
                    Prenota la mia demo gratuita →
                  </button>
                  <p style={{ fontSize:'0.72rem', color:'#3f3f50', textAlign:'center', margin:0 }}>Senza impegno · Risposta entro 24 ore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section style={{ padding:'5.5rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
        <div className="max-w-3xl mx-auto">
          <h2 style={{ ...syne, fontSize:'clamp(3rem,6vw,5.5rem)', color:'#fff', lineHeight:1.0, marginBottom:'1.5rem' }}>
            Pronto a configurare<br />
            <span style={gradWarm}>il tuo AURA?</span>
          </h2>
          <p style={{ fontSize:'1.15rem', color:'#71717a', lineHeight:1.75, marginBottom:'3rem' }}>
            La tua piattaforma di orchestrazione AI Agent sarà operativa in meno di una settimana.
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/demo')}
              style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', boxShadow:'0 0 60px rgba(124,58,237,0.5)', border:'none', color:'#fff', fontWeight:700, fontSize:'1.05rem', padding:'1.1rem 2.5rem', borderRadius:'1.125rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.75rem' }}
              onMouseEnter={e => e.currentTarget.style.opacity='.85'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}
            >
              Richiedi una Demo
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
            <button onClick={() => navigate('/templates')}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontWeight:600, fontSize:'1.05rem', padding:'1.1rem 2.5rem', borderRadius:'1.125rem', cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
            >
              Esplora i template
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'2.5rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <span
              aria-hidden="true"
              style={{ width:34, height:34, borderRadius:'0.75rem', backgroundImage:'url(/Logo_Aura_vett.png)', backgroundSize:'170%', backgroundPosition:'center 35%', boxShadow:'0 0 18px rgba(124,58,237,0.28)', flexShrink:0 }}
            />
            <span style={{ ...syne, fontSize:'1rem' }}>
              <span style={{ color:'#fff' }}>AU</span>
              <span style={grad}>RA</span>
            </span>
          </div>
          <p style={{ fontSize:'0.75rem', color:'#3f3f50', margin:0 }}>© 2025 AURA — Piattaforma No-Code per Orchestrazione AI Agent. Tutti i diritti riservati.</p>
          <div style={{ display:'flex', gap:'1.5rem', fontSize:'0.75rem', color:'#3f3f50' }}>
            {['Privacy Policy','Termini di servizio','Cookie'].map(l => (
              <span key={l} style={{ cursor:'pointer', transition:'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color='#71717a'}
                onMouseLeave={e => e.currentTarget.style.color='#3f3f50'}
              >{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
