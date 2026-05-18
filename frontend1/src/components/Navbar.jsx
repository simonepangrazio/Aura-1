import { useNavigate, useLocation } from 'react-router-dom'

const syne = { fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const NAV_LINKS = [
  { label: 'Home',          path: '/' },
  { label: 'Templates',     path: '/templates' },
  { label: 'Richiedi Demo', path: '/demo' },
]

export default function Navbar() {
  const navigate       = useNavigate()
  const { pathname }   = useLocation()

  const user = (() => { try { return JSON.parse(sessionStorage.getItem('aura_user')) } catch { return null } })()

  return (
    <header style={{ position:'fixed', inset:'0 0 auto 0', zIndex:50, padding:'1.25rem 1.5rem' }}>
      <div style={{ maxWidth:1152, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,8,14,0.82)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.25rem', padding:'0.75rem 1.5rem', backdropFilter:'blur(24px)', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>

          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'none', border:'none', cursor:'pointer' }}>
            <div style={{ position:'relative', width:36, height:36 }}>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#0891b2)', filter:'blur(8px)', opacity:0.4 }} />
              <div style={{ position:'relative', width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(124,58,237,0.4)' }}>
                <svg viewBox="0 0 20 20" fill="white" width="16" height="16">
                  <circle cx="10" cy="10" r="3.2"/><circle cx="10" cy="3" r="1.6" opacity=".65"/><circle cx="10" cy="17" r="1.6" opacity=".65"/><circle cx="3" cy="10" r="1.6" opacity=".65"/><circle cx="17" cy="10" r="1.6" opacity=".65"/>
                </svg>
              </div>
            </div>
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
            {user ? (
              <button onClick={() => navigate('/dashboard')}
                style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'0.875rem', padding:'0.5rem 1rem 0.5rem 0.5rem', cursor:'pointer', color:'#d4d4d8', fontSize:'0.85rem', fontWeight:600 }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
              >
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700 }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')}
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#d4d4d8', fontSize:'0.875rem', fontWeight:600, padding:'0.625rem 1.25rem', borderRadius:'0.875rem', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.09)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
              >
                Accedi
              </button>
            )}
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
