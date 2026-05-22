import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const syne = { fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const ALL_SERVICES = [
  {
    id: 'portineria-scolastica',
    title: 'Portineria Scolastica',
    subtitle: 'Istruzione & Amministrazione',
    icon: '🏫',
    color: '#3b82f6',
    desc: 'Sportello orientamento interattivo per studenti e famiglie. Semplifica accesso informazioni e innova comunicazione interna.',
    stats: { requests: '2.400+', uptime: '99.9%', lang: 'IT / EN / AR' },
  },
  {
    id: 'hiring-screening',
    title: 'Hiring & Screening',
    subtitle: 'Risorse Umane',
    icon: '💼',
    color: '#8b5cf6',
    desc: 'Automazione processi di selezione e screening candidati con scoring automatico e report HR dettagliati.',
    stats: { requests: '1.800+', uptime: '99.7%', lang: '5 lingue' },
  },
  {
    id: 'palestra',
    title: 'Assistente Palestra',
    subtitle: 'Fitness & Wellness',
    icon: '🏋️',
    color: '#10b981',
    desc: 'Gestione appuntamenti e assistenza clienti 24/7 con abbonamenti e prenotazioni corsi.',
    stats: { requests: '3.100+', uptime: '99.9%', lang: 'IT / EN' },
  },
  {
    id: 'studio-medico',
    title: 'Studio Medico',
    subtitle: 'Salute & Medicina',
    icon: '🩺',
    color: '#f43f5e',
    desc: 'Automazione accoglienza e gestione pazienti con prenotazioni e promemoria automatici.',
    stats: { requests: '2.900+', uptime: '99.8%', lang: 'IT / EN / AR' },
  },
]

const PLAN_COLORS = {
  Free:       { bg: 'rgba(255,255,255,0.06)', text: '#a1a1aa', border: 'rgba(255,255,255,0.1)' },
  Pro:        { bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  Business:   { bg: 'rgba(34,211,238,0.1)',   text: '#22d3ee', border: 'rgba(34,211,238,0.25)' },
  Enterprise: { bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
}

function readStoredUser() {
  const stored = sessionStorage.getItem('aura_user')
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const [user]                    = useState(readStoredUser)
  const [running, setRunning]     = useState({})   // serviceId → boolean
  const [activeSvc, setActiveSvc] = useState(null) // serviceId aperto in modale
  const [tab, setTab]             = useState('services') // 'services' | 'analytics' | 'settings'

  useEffect(() => {
    if (!user) navigate('/login')
  }, [navigate, user])

  if (!user) return null

  const myServices = ALL_SERVICES.filter(s => user.services.includes(s.id))
  const planStyle  = PLAN_COLORS[user.plan] || PLAN_COLORS.Free

  const toggleService = (id) => {
    setRunning(r => ({ ...r, [id]: !r[id] }))
  }

  const startService = (id) => {
    setRunning(r => ({ ...r, [id]: true }))
    navigate(`/avatar?service=${id}`)
  }

  const logout = () => {
    sessionStorage.removeItem('aura_user')
    navigate('/')
  }

  /* ── Modale agente aperto ──────────────────────────────── */
  const openSvc = ALL_SERVICES.find(s => s.id === activeSvc)

  return (
    <div style={{ minHeight: '100vh', background: '#08080e', color: '#fff', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', zIndex: 40 }}>

        {/* Logo */}
        <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', marginBottom:'2.5rem', padding:'0.25rem 0.5rem' }}>
          <span
            aria-hidden="true"
            style={{ width:40, height:40, borderRadius:'0.875rem', backgroundImage:'url(/Logo_Aura_vett.png)', backgroundSize:'170%', backgroundPosition:'center 35%', boxShadow:'0 0 20px rgba(124,58,237,0.4)', flexShrink:0 }}
          />
          <span style={{ ...syne, fontSize:'1.25rem' }}>
            <span style={{ color:'#fff' }}>AU</span><span style={grad}>RA</span>
          </span>
        </button>

        {/* Nav items */}
        {[
          { id:'services',  label:'I miei agent',  icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
          { id:'analytics', label:'Analytics',     icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
          { id:'settings',  label:'Impostazioni',  icon:<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'0.75rem 0.875rem', borderRadius:'0.875rem', border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:'0.875rem', fontWeight: tab === item.id ? 600 : 400, marginBottom:4, transition:'all .2s',
              background: tab === item.id ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: tab === item.id ? '#a78bfa' : '#52525b',
              borderLeft: tab === item.id ? '2px solid #7c3aed' : '2px solid transparent',
            }}
          >
            {item.icon}{item.label}
          </button>
        ))}

        <div style={{ flex:1 }} />

        {/* User info */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1rem', padding:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.75rem' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:700, flexShrink:0 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow:'hidden' }}>
              <p style={{ fontSize:'0.8rem', fontWeight:600, color:'#fff', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</p>
              <p style={{ fontSize:'0.7rem', color:'#52525b', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</p>
            </div>
          </div>
          <div style={{ display:'inline-block', background: planStyle.bg, border:`1px solid ${planStyle.border}`, borderRadius:999, padding:'3px 10px', fontSize:'0.7rem', fontWeight:700, color: planStyle.text, marginBottom:'0.75rem' }}>
            Piano {user.plan}
          </div>
          <button onClick={logout}
            style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#52525b', fontSize:'0.78rem', padding:0, width:'100%' }}
            onMouseEnter={e => e.currentTarget.style.color='#f87171'}
            onMouseLeave={e => e.currentTarget.style.color='#52525b'}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Esci
          </button>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────── */}
      <main style={{ marginLeft: 240, minHeight: '100vh', padding: '2.5rem 3rem' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'3rem' }}>
          <div>
            <p style={{ fontSize:'0.75rem', color:'#52525b', textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 0.5rem' }}>
              {new Date().toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
            <h1 style={{ ...syne, fontSize:'2.25rem', color:'#fff', margin:0 }}>
              Ciao, {user.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize:'0.9rem', color:'#52525b', margin:'0.4rem 0 0' }}>
              {myServices.length > 0 ? `Hai ${myServices.length} agent attiv${myServices.length === 1 ? 'o' : 'i'} nel tuo piano.` : 'Nessun agent attivo. Richiedi una demo per iniziare.'}
            </p>
          </div>
          <button onClick={() => navigate('/templates')}
            style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.85rem', padding:'0.75rem 1.5rem', borderRadius:'0.875rem', cursor:'pointer', boxShadow:'0 0 24px rgba(124,58,237,0.3)', whiteSpace:'nowrap', flexShrink:0 }}
            onMouseEnter={e => e.currentTarget.style.opacity='.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            + Richiedi nuovo agent
          </button>
        </div>

        {/* ── TAB: SERVICES ─────────────────────────────── */}
        {tab === 'services' && (
          <>
            {/* Quick stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2.5rem' }}>
              {[
                { label:'Agent attivi',       value: myServices.length,                                  icon:'⚡', color:'#a78bfa' },
                { label:'In esecuzione',      value: Object.values(running).filter(Boolean).length,      icon:'🟢', color:'#10b981' },
                { label:'Richieste oggi',     value: myServices.length * 47,                             icon:'📊', color:'#22d3ee' },
                { label:'Soddisfazione media',value: myServices.length > 0 ? '97%' : '—',               icon:'⭐', color:'#fbbf24' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.25rem', padding:'1.5rem' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:'0.75rem' }}>{s.icon}</div>
                  <div style={{ ...syne, fontSize:'2rem', color: s.color, marginBottom:'0.25rem' }}>{s.value}</div>
                  <div style={{ fontSize:'0.78rem', color:'#52525b' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ ...syne, fontSize:'1.25rem', color:'#fff', marginBottom:'1.25rem' }}>I tuoi agent</h2>

            {myServices.length === 0 ? (
              <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.5rem', padding:'4rem', textAlign:'center' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🤖</div>
                <p style={{ ...syne, fontSize:'1.25rem', color:'#fff', marginBottom:'0.5rem' }}>Nessun agent attivo</p>
                <p style={{ fontSize:'0.9rem', color:'#52525b', marginBottom:'1.5rem' }}>Il tuo account è attivo ma non hai ancora agent configurati.</p>
                <button onClick={() => navigate('/demo')}
                  style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.9rem', padding:'0.875rem 2rem', borderRadius:'0.875rem', cursor:'pointer' }}
                >
                  Richiedi il tuo primo agent →
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'1.25rem' }}>
                {myServices.map(svc => {
                  const isRunning = running[svc.id]
                  return (
                    <div key={svc.id} style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${svc.color}22`, borderRadius:'1.5rem', padding:'1.75rem', transition:'all .25s', position:'relative', overflow:'hidden' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=`${svc.color}50`; e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=`${svc.color}22`; e.currentTarget.style.background='rgba(255,255,255,0.025)' }}
                    >
                      {/* Glow top-left */}
                      <div style={{ position:'absolute', top:-40, left:-40, width:140, height:140, background:`radial-gradient(circle, ${svc.color}18 0%, transparent 70%)`, pointerEvents:'none' }} />

                      {/* Top row */}
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.25rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:48, height:48, borderRadius:'1rem', background:`${svc.color}22`, border:`1px solid ${svc.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>
                            {svc.icon}
                          </div>
                          <div>
                            <p style={{ ...syne, fontSize:'1rem', color:'#fff', margin:0 }}>{svc.title}</p>
                            <p style={{ fontSize:'0.75rem', color:'#52525b', margin:0 }}>{svc.subtitle}</p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div style={{ display:'flex', alignItems:'center', gap:6, background: isRunning ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)', border:`1px solid ${isRunning ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius:999, padding:'4px 10px', fontSize:'0.7rem', fontWeight:600, color: isRunning ? '#10b981' : '#52525b', flexShrink:0 }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background: isRunning ? '#10b981' : '#52525b', display:'inline-block', boxShadow: isRunning ? '0 0 6px #10b981' : 'none' }} />
                          {isRunning ? 'Online' : 'Offline'}
                        </div>
                      </div>

                      <p style={{ fontSize:'0.85rem', color:'#71717a', lineHeight:1.7, marginBottom:'1.25rem' }}>{svc.desc}</p>

                      {/* Mini stats */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem', marginBottom:'1.5rem' }}>
                        {[
                          { label:'Richieste/mese', v: svc.stats.requests },
                          { label:'Uptime',          v: svc.stats.uptime },
                          { label:'Lingue',          v: svc.stats.lang },
                        ].map(st => (
                          <div key={st.label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'0.625rem', padding:'0.5rem 0.625rem', textAlign:'center' }}>
                            <p style={{ fontSize:'0.7rem', fontWeight:700, color:'#d4d4d8', margin:'0 0 2px' }}>{st.v}</p>
                            <p style={{ fontSize:'0.62rem', color:'#52525b', margin:0 }}>{st.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display:'flex', gap:'0.625rem' }}>
                        <button onClick={() => startService(svc.id)}
                          style={{ flex:1, padding:'0.625rem', borderRadius:'0.75rem', cursor:'pointer', fontWeight:700, fontSize:'0.82rem', transition:'all .2s',
                            background: `${svc.color}22`,
                            color: svc.color,
                            border: `1px solid ${svc.color}40`,
                          }}
                        >
                          {isRunning ? '↗ Apri servizio' : '▶ Inizia servizio'}
                        </button>
                        <button onClick={() => setActiveSvc(svc.id)}
                          style={{ flex:1, padding:'0.625rem', borderRadius:'0.75rem', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', cursor:'pointer', fontWeight:600, fontSize:'0.82rem', color:'#a1a1aa', transition:'all .2s' }}
                          onMouseEnter={e => e.currentTarget.style.color='#fff'}
                          onMouseLeave={e => e.currentTarget.style.color='#a1a1aa'}
                        >
                          ⚙ Configura
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Available (not subscribed) */}
            {ALL_SERVICES.filter(s => !user.services.includes(s.id)).length > 0 && (
              <>
                <h2 style={{ ...syne, fontSize:'1.25rem', color:'#fff', margin:'3rem 0 1.25rem' }}>Agent disponibili nel catalogo</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
                  {ALL_SERVICES.filter(s => !user.services.includes(s.id)).map(svc => (
                    <div key={svc.id} style={{ background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'1.25rem', padding:'1.5rem', opacity:0.75, position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', inset:0, background:'rgba(8,8,14,0.4)', backdropFilter:'blur(1px)', zIndex:1, borderRadius:'1.25rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <button onClick={() => navigate('/demo')}
                          style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.82rem', padding:'0.625rem 1.25rem', borderRadius:'0.75rem', cursor:'pointer' }}
                        >
                          Richiedi accesso →
                        </button>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'0.75rem' }}>
                        <span style={{ fontSize:'1.5rem' }}>{svc.icon}</span>
                        <div>
                          <p style={{ ...syne, fontSize:'0.95rem', color:'#fff', margin:0 }}>{svc.title}</p>
                          <p style={{ fontSize:'0.72rem', color:'#52525b', margin:0 }}>{svc.subtitle}</p>
                        </div>
                      </div>
                      <p style={{ fontSize:'0.82rem', color:'#52525b', lineHeight:1.65, margin:0 }}>{svc.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── TAB: ANALYTICS ────────────────────────────── */}
        {tab === 'analytics' && (
          <div>
            <h2 style={{ ...syne, fontSize:'1.5rem', color:'#fff', marginBottom:'2rem' }}>Analytics</h2>
            {myServices.length === 0 ? (
              <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.5rem', padding:'4rem', textAlign:'center' }}>
                <p style={{ color:'#52525b' }}>Nessun dato disponibile. Attiva almeno un agent per vedere le analytics.</p>
              </div>
            ) : (
              <div style={{ display:'grid', gap:'1.5rem' }}>
                {myServices.map(svc => {
                  const bars = [65,82,54,91,76,88,60,95,72,84,78,90]
                  return (
                    <div key={svc.id} style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${svc.color}22`, borderRadius:'1.5rem', padding:'2rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.75rem' }}>
                        <span style={{ fontSize:'1.5rem' }}>{svc.icon}</span>
                        <div>
                          <p style={{ ...syne, fontSize:'1rem', color:'#fff', margin:0 }}>{svc.title}</p>
                          <p style={{ fontSize:'0.75rem', color:'#52525b', margin:0 }}>Ultimi 12 mesi</p>
                        </div>
                      </div>
                      {/* Bar chart */}
                      <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:80 }}>
                        {bars.map((h, i) => (
                          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                            <div style={{ width:'100%', height:`${h}%`, background:`linear-gradient(to top, ${svc.color}90, ${svc.color}30)`, borderRadius:'4px 4px 0 0', transition:'height .4s' }} />
                            <span style={{ fontSize:'0.55rem', color:'#3f3f50' }}>{['G','F','M','A','M','G','L','A','S','O','N','D'][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: SETTINGS ─────────────────────────────── */}
        {tab === 'settings' && (
          <div style={{ maxWidth:540 }}>
            <h2 style={{ ...syne, fontSize:'1.5rem', color:'#fff', marginBottom:'2rem' }}>Impostazioni account</h2>
            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.5rem', padding:'2rem', marginBottom:'1.25rem' }}>
              <h3 style={{ ...syne, fontSize:'1rem', color:'#fff', marginBottom:'1.25rem' }}>Profilo</h3>
              {[
                { label:'Nome', value: user.name },
                { label:'Email', value: user.email },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:'1rem' }}>
                  <label style={{ fontSize:'0.75rem', color:'#71717a', display:'block', marginBottom:6 }}>{f.label}</label>
                  <input defaultValue={f.value} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'0.875rem', padding:'0.875rem 1rem', color:'#fff', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }} />
                </div>
              ))}
              <button style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.85rem', padding:'0.75rem 1.5rem', borderRadius:'0.75rem', cursor:'pointer' }}>
                Salva modifiche
              </button>
            </div>

            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.5rem', padding:'2rem' }}>
              <h3 style={{ ...syne, fontSize:'1rem', color:'#fff', marginBottom:'0.5rem' }}>Piano attivo</h3>
              <p style={{ fontSize:'0.85rem', color:'#52525b', marginBottom:'1rem' }}>Stai usando il piano <span style={{ color: planStyle.text, fontWeight:700 }}>{user.plan}</span>.</p>
              <button onClick={() => navigate('/demo')}
                style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', color:'#a78bfa', fontWeight:600, fontSize:'0.85rem', padding:'0.75rem 1.5rem', borderRadius:'0.75rem', cursor:'pointer' }}
              >
                Upgrade piano →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── MODALE CONFIGURAZIONE ──────────────────────────── */}
      {activeSvc && openSvc && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}
          onClick={() => setActiveSvc(null)}
        >
          <div style={{ background:'#0f0f18', border:`1px solid ${openSvc.color}40`, borderRadius:'2rem', padding:'2.5rem', maxWidth:500, width:'100%', position:'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setActiveSvc(null)}
              style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.06)', border:'none', color:'#71717a', width:32, height:32, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:'2rem' }}>
              <div style={{ width:52, height:52, borderRadius:'1rem', background:`${openSvc.color}22`, border:`1px solid ${openSvc.color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem' }}>
                {openSvc.icon}
              </div>
              <div>
                <h3 style={{ ...syne, fontSize:'1.25rem', color:'#fff', margin:0 }}>{openSvc.title}</h3>
                <p style={{ fontSize:'0.8rem', color:'#52525b', margin:0 }}>{openSvc.subtitle}</p>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[
                { label:'Lingua principale', type:'select', options:['Italiano','English','Français','Deutsch','Español','العربية'] },
                { label:'Tono di risposta',  type:'select', options:['Professionale','Amichevole','Formale','Informale'] },
                { label:'Nome dell\'agent',  type:'text',   placeholder: openSvc.title },
                { label:'Orario operativo',  type:'text',   placeholder:'09:00 - 19:00 (lun-ven)' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize:'0.75rem', color:'#71717a', display:'block', marginBottom:6 }}>{f.label}</label>
                  {f.type === 'select'
                    ? <select style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'0.75rem', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' }}>
                        {f.options.map(o => <option key={o} className="bg-zinc-900" style={{background:'#111'}}>{o}</option>)}
                      </select>
                    : <input type="text" placeholder={f.placeholder} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'0.75rem', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' }} />
                  }
                </div>
              ))}
              <div style={{ display:'flex', gap:'0.75rem', marginTop:8 }}>
                <button onClick={() => setActiveSvc(null)}
                  style={{ flex:1, padding:'0.875rem', borderRadius:'0.875rem', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#71717a', fontWeight:600, fontSize:'0.875rem', cursor:'pointer' }}
                >
                  Annulla
                </button>
                <button onClick={() => { toggleService(openSvc.id); setActiveSvc(null) }}
                  style={{ flex:1, padding:'0.875rem', borderRadius:'0.875rem', border:'none', background:`linear-gradient(135deg, ${openSvc.color}, ${openSvc.color}99)`, color:'#fff', fontWeight:700, fontSize:'0.875rem', cursor:'pointer' }}
                >
                  Salva & Avvia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
