import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const syne = { fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

export default function Demo() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    sector: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    // In a real app, this would send data to a backend
    setTimeout(() => {
      navigate('/dashboard')
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#08080e] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ ...syne, fontSize: '2rem', marginBottom: '1rem' }}>Richiesta inviata!</h2>
          <p style={{ color: '#71717a', marginBottom: '2rem' }}>
            Ti contatteremo entro 24 ore per fissare la tua demo personalizzata.
          </p>
          <p style={{ color: '#52525b', fontSize: '0.875rem' }}>
            Reindirizzamento al dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080e] text-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
            Demo Gratuita
          </p>
          <h1 style={{ ...syne, fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#fff', marginBottom: '1.5rem' }}>
            Scopri AURA in azione<br />
            <span style={grad}>nel tuo settore</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#71717a', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
            Prenota una demo personalizzata di 30 minuti. Mostreremo come AURA può trasformare 
            il tuo business con artificial humans iperrealistici.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.5rem', padding: '2.5rem' }}>
            <h3 style={{ ...syne, fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>
              Compila il form
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { name: 'name', label: 'Nome e Cognome', placeholder: 'Mario Rossi', type: 'text', required: true },
                { name: 'email', label: 'Email aziendale', placeholder: 'mario@azienda.it', type: 'email', required: true },
                { name: 'company', label: 'Azienda', placeholder: 'Nome della tua azienda', type: 'text', required: true },
                { name: 'sector', label: 'Settore', placeholder: 'Es. Retail, Sanità, Istruzione', type: 'text', required: true },
              ].map(field => (
                <div key={field.name}>
                  <label style={{ fontSize: '0.875rem', color: '#a1a1aa', display: 'block', marginBottom: '0.5rem' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.75rem',
                      padding: '0.875rem 1rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: '0.875rem', color: '#a1a1aa', display: 'block', marginBottom: '0.5rem' }}>
                  Messaggio (opzionale)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Descrivi brevemente le tue esigenze..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.75rem',
                    padding: '0.875rem 1rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg,#7c3aed,#0891b2)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '1rem 2rem',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 30px rgba(124,58,237,0.35)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Prenota la mia demo gratuita →
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h3 style={{ ...syne, fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>
                Cosa include la demo
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Demo live di AURA nel tuo settore',
                  'Consulenza personalizzata con un AI specialist',
                  'Analisi delle tue esigenze specifiche',
                  'Preventivo su misura senza impegno',
                  'Accesso anticipato alle nuove funzionalità'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: 'rgba(124,58,237,0.2)', 
                      border: '1px solid rgba(124,58,237,0.35)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="10" height="10" fill="none" stroke="#a78bfa" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </span>
                    <span style={{ fontSize: '0.95rem', color: '#a1a1aa', lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(8,8,14,0) 50%, rgba(8,145,178,0.08) 100%)', 
              border: '1px solid rgba(255,255,255,0.07)', 
              borderRadius: '1.5rem', 
              padding: '2rem' 
            }}>
              <h4 style={{ ...syne, fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>
                Perché AURA?
              </h4>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  { icon: '⚡', text: 'Attivazione in meno di 5 giorni' },
                  { icon: '🎭', text: 'Avatar iperrealistici Beyond Presence' },
                  { icon: '🔒', text: 'Conforme GDPR e privacy europea' },
                  { icon: '🌍', text: 'Supporto multilingue nativo' }
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
                    <span style={{ fontSize: '0.875rem', color: '#71717a' }}>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
