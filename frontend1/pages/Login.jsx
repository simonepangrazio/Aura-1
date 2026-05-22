import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const syne = { fontFamily: 'system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

// Credenziali demo
const DEMO_USERS = [
  { email: 'mario@scuola.it',    password: 'demo1234', name: 'Mario Rossi',    plan: 'Pro',      services: ['portineria-scolastica'] },
  { email: 'anna@palestra.it',   password: 'demo1234', name: 'Anna Bianchi',   plan: 'Business', services: ['palestra','hiring-screening'] },
  { email: 'luca@studiomed.it',  password: 'demo1234', name: 'Luca Verdi',     plan: 'Enterprise',services: ['studio-medico','portineria-scolastica','hiring-screening','palestra'] },
]

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab]         = useState('login')       // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const inputStyle = (hasError) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasError ? 'rgba(244,63,94,0.6)' : 'rgba(255,255,255,0.09)'}`,
    borderRadius: '0.875rem',
    padding: '0.875rem 1rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s',
  })

  const handleLogin = () => {
    setError('')
    if (!email || !password) { setError('Compila tutti i campi.'); return }
    setLoading(true)
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password)
      if (user) {
        // salva in sessionStorage
        sessionStorage.setItem('aura_user', JSON.stringify(user))
        navigate('/dashboard')
      } else {
        setError('Email o password non corretti.')
        setLoading(false)
      }
    }, 900)
  }

  const handleRegister = () => {
    setError('')
    if (!name || !email || !password) { setError('Compila tutti i campi.'); return }
    if (!email.includes('@')) { setError("Inserisci un'email valida."); return }
    if (password.length < 6) { setError('La password deve avere almeno 6 caratteri.'); return }
    setLoading(true)
    setTimeout(() => {
      // In produzione qui ci sarebbe la chiamata API
      const newUser = { email, name, plan: 'Free', services: [] }
      sessionStorage.setItem('aura_user', JSON.stringify(newUser))
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08080e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

      {/* Blobs */}
      <div style={{ position:'absolute', top:'15%', left:'20%', width:500, height:500, background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'15%', width:400, height:400, background:'radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Back to home */}
      <button onClick={() => navigate('/')} style={{ position:'absolute', top:24, left:24, display:'flex', alignItems:'center', gap:8, color:'#52525b', fontSize:'0.85rem', background:'none', border:'none', cursor:'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color='#a1a1aa'}
        onMouseLeave={e => e.currentTarget.style.color='#52525b'}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        Torna alla home
      </button>

      <div style={{ width: '100%', maxWidth: 440, position:'relative' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:'1.5rem' }}>
            <span
              aria-hidden="true"
              style={{ width:54, height:54, borderRadius:'1rem', backgroundImage:'url(/Logo_Aura_vett.png)', backgroundSize:'170%', backgroundPosition:'center 35%', boxShadow:'0 0 30px rgba(124,58,237,0.4)', flexShrink:0 }}
            />
            <span style={{ ...syne, fontSize:'1.75rem' }}>
              <span style={{ color:'#fff' }}>AU</span><span style={grad}>RA</span>
            </span>
          </div>
          <h1 style={{ ...syne, fontSize:'1.75rem', color:'#fff', margin:'0 0 0.5rem' }}>
            {tab === 'login' ? 'Accedi al tuo account' : 'Crea il tuo account'}
          </h1>
          <p style={{ fontSize:'0.9rem', color:'#52525b', margin:0 }}>
            {tab === 'login' ? 'Bentornato su AURA' : 'Inizia il tuo percorso con AURA'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'1.75rem', padding:'2.5rem', backdropFilter:'blur(20px)' }}>

          {/* Tabs */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'0.875rem', padding:4, marginBottom:'2rem' }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                style={{ flex:1, padding:'0.625rem', borderRadius:'0.75rem', border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, transition:'all .2s',
                  background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: tab === t ? '#fff' : '#52525b',
                }}
              >
                {t === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {tab === 'register' && (
              <div>
                <label style={{ fontSize:'0.75rem', color:'#71717a', display:'block', marginBottom:6 }}>Nome completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Mario Rossi"
                  style={inputStyle(false)}
                  onFocus={e => e.target.style.borderColor='rgba(124,58,237,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.09)'}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize:'0.75rem', color:'#71717a', display:'block', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mario@azienda.it"
                style={inputStyle(!!error && !email)}
                onFocus={e => e.target.style.borderColor='rgba(124,58,237,0.5)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.09)'}
                onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleRegister())}
              />
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <label style={{ fontSize:'0.75rem', color:'#71717a' }}>Password</label>
                {tab === 'login' && <span style={{ fontSize:'0.75rem', color:'#7c3aed', cursor:'pointer' }}>Password dimenticata?</span>}
              </div>
              <div style={{ position:'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ ...inputStyle(!!error && !password), paddingRight:'3rem' }}
                  onFocus={e => e.target.style.borderColor='rgba(124,58,237,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.09)'}
                  onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleRegister())}
                />
                <button onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#52525b', padding:4 }}
                >
                  {showPass
                    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.25)', borderRadius:'0.75rem', padding:'0.75rem 1rem', fontSize:'0.85rem', color:'#f87171' }}>
                {error}
              </div>
            )}

            <button onClick={tab === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              style={{ marginTop:8, background:'linear-gradient(135deg,#7c3aed,#0891b2)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.95rem', padding:'1rem', borderRadius:'0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow:'0 0 30px rgba(124,58,237,0.3)', transition:'opacity .2s' }}
            >
              {loading ? 'Attendere...' : tab === 'login' ? 'Accedi →' : 'Crea account →'}
            </button>
          </div>
        </div>

        {/* Demo hint */}
        {tab === 'login' && (
          <div style={{ marginTop:'1.5rem', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)', borderRadius:'1rem', padding:'1rem 1.25rem' }}>
            <p style={{ fontSize:'0.75rem', color:'#71717a', margin:'0 0 0.5rem', fontWeight:600 }}>Account demo disponibili:</p>
            {DEMO_USERS.map(u => (
              <button key={u.email} onClick={() => { setEmail(u.email); setPassword('demo1234') }}
                style={{ display:'block', fontSize:'0.72rem', color:'#a78bfa', background:'none', border:'none', cursor:'pointer', padding:'2px 0', textAlign:'left' }}
              >
                {u.email} → Piano {u.plan}
              </button>
            ))}
          </div>
        )}

        <p style={{ textAlign:'center', fontSize:'0.75rem', color:'#3f3f50', marginTop:'1.5rem' }}>
          Accedendo accetti i <span style={{ color:'#7c3aed', cursor:'pointer' }}>Termini di servizio</span> e la <span style={{ color:'#7c3aed', cursor:'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
