import { useNavigate, useLocation } from 'react-router-dom'

import { goToFrontend2 } from '../lib/frontend2'

const syne = { fontFamily: 'system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'Templates',     path: '/templates' },
  { label: 'Richiedi Demo', path: '/demo' },
]

export default function Navbar() {
  const navigate       = useNavigate()
  const { pathname }   = useLocation()

  return (
    <header style={{ position:'fixed', inset:'0 0 auto 0', zIndex:50, padding:'1.25rem 1.5rem' }}>
      <div style={{ maxWidth:1152, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,8,14,0.82)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.25rem', padding:'0.75rem 1.5rem', backdropFilter:'blur(24px)', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>

          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'none', border:'none', cursor:'pointer' }}>
            <span
              aria-hidden="true"
              style={{ width:44, height:44, borderRadius:'0.875rem', backgroundImage:'url(/Logo_Aura_vett.png)', backgroundSize:'170%', backgroundPosition:'center 35%', boxShadow:'0 0 24px rgba(124,58,237,0.35)', flexShrink:0 }}
            />
            <span style={{ ...syne, fontSize:'1.35rem' }}>
              <span style={{ color:'#fff' }}>AU</span><span style={grad}>RA</span>
            </span>
          </button>

          {/* Desktop links */}
          <nav style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
            {NAV_LINKS.map(l => (
              <button key={l.path} onClick={() => navigate(l.path)}
                style={{ padding:'0.625rem 1rem', borderRadius:'0.875rem', border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight: pathname === l.path ? 600 : 400, transition:'all .2s',
                  background: pathname === l.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: pathname === l.path ? '#fff' : '#52525b',
                }}
                onMouseEnter={e => { if(pathname !== l.path) e.currentTarget.style.color='#d4d4d8' }}
                onMouseLeave={e => { if(pathname !== l.path) e.currentTarget.style.color='#52525b' }}
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Right CTAs */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <button onClick={() => goToFrontend2('/login')}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#d4d4d8', fontSize:'0.875rem', fontWeight:600, padding:'0.625rem 1.25rem', borderRadius:'0.875rem', cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
            >
              Accedi
            </button>
            <button onClick={() => navigate('/start-building')}
              style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.875rem', padding:'0.625rem 1.25rem', borderRadius:'0.875rem', cursor:'pointer', boxShadow:'0 0 24px rgba(124,58,237,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.opacity='.85'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}
            >
              Start Building →
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
