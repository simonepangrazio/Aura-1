import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const VISION_API_URL = import.meta.env.VITE_VISION_API_URL || 'http://localhost:3000'
const DEFAULT_BEY_AGENT_ID = '80cada4e-9219-424a-80d3-bd039ff00c4b'

const syne = { fontFamily: 'Syne, system-ui, sans-serif', fontWeight: 800, letterSpacing: 0 }
const grad = { background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

const INITIAL_VISION = {
  connected: false,
  detectorOnline: false,
  lookingAtCamera: false,
  reason: 'waiting-for-detector',
  updatedAt: null,
  yaw: null,
  pitch: null,
}

function getViewportProfile() {
  if (typeof window === 'undefined') return 'desktop'

  const { innerWidth, innerHeight } = window
  const ratio = innerWidth / Math.max(innerHeight, 1)

  if (ratio < 0.72 && innerHeight >= 760) return 'totem'
  if (innerWidth <= 760) return 'phone'
  return 'desktop'
}

function useViewportProfile() {
  const [profile, setProfile] = useState(getViewportProfile)

  useEffect(() => {
    const update = () => setProfile(getViewportProfile())
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return profile
}

function visionUrl(path) {
  return new URL(path, VISION_API_URL).toString()
}

function getVisionIndicator(vision, visionReady, hasAgent) {
  if (visionReady) {
    return {
      label: 'Persona in camera',
      action: hasAgent ? 'Avatar attivo' : 'Visione ok',
      detail: 'Sguardo confermato',
      color: '#10b981',
    }
  }

  if (!vision.connected) {
    return {
      label: 'Backend non connesso',
      action: 'Verifica sospesa',
      detail: 'Avvia npm run start:dev',
      color: '#f59e0b',
    }
  }

  if (!vision.detectorOnline) {
    return {
      label: 'Detector non attivo',
      action: 'Avatar bloccato',
      detail: 'Avvia npm run dev:vision',
      color: '#f59e0b',
    }
  }

  if (vision.reason === 'no-face') {
    return {
      label: 'Nessuno davanti allo schermo',
      action: 'Avatar bloccato',
      detail: 'Il detector funziona e non vede un volto',
      color: '#f43f5e',
    }
  }

  if (vision.reason === 'face-not-centered') {
    return {
      label: 'Volto rilevato fuori centro',
      action: 'Avatar bloccato',
      detail: 'Porta il volto al centro della camera',
      color: '#f43f5e',
    }
  }

  if (vision.reason === 'eyes-not-visible') {
    return {
      label: 'Occhi non visibili',
      action: 'Avatar bloccato',
      detail: 'Guarda frontalmente la camera',
      color: '#f43f5e',
    }
  }

  if (vision.reason === 'face-too-far') {
    return {
      label: 'Volto troppo lontano',
      action: 'Avatar bloccato',
      detail: 'Avvicinati leggermente allo schermo',
      color: '#f43f5e',
    }
  }

  return {
    label: 'Sguardo non verificato',
    action: 'Avatar bloccato',
    detail: vision.reason || 'In attesa del detector',
    color: '#f43f5e',
  }
}

function getVisionCopy(vision, visionReady, hasAgent) {
  const indicator = getVisionIndicator(vision, visionReady, hasAgent)

  if (visionReady) {
    return {
      title: 'Sguardo verificato',
      description: 'La persona è centrata in camera. Avatar Beyond attivo.',
      color: indicator.color,
    }
  }

  if (!vision.connected) {
    return {
      title: 'Backend visione non connesso',
      description: 'Avvia il backend locale e il detector Python per abilitare la verifica.',
      color: indicator.color,
    }
  }

  if (!vision.detectorOnline) {
    return {
      title: 'Detector in attesa',
      description: 'Il backend è attivo, ma non sta ricevendo segnali dalla webcam.',
      color: indicator.color,
    }
  }

  if (vision.reason === 'no-face') {
    return {
      title: 'Nessuno davanti allo schermo',
      description: 'Il detector è attivo e non rileva persone: l’avatar Beyond resta bloccato.',
      color: indicator.color,
    }
  }

  return {
    title: indicator.label,
    description: indicator.detail,
    color: indicator.color,
  }
}

function VisionStatusPanel({ vision, visionReady, hasAgent, compact = false }) {
  const indicator = getVisionIndicator(vision, visionReady, hasAgent)

  return (
    <div
      className={`flex ${compact ? 'items-center gap-3 rounded-full px-4 py-2' : 'w-full max-w-2xl items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left'} border`}
      style={{
        borderColor: `${indicator.color}44`,
        background: `${indicator.color}12`,
        boxShadow: compact ? 'none' : `0 0 36px ${indicator.color}14`,
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="h-3 w-3 flex-shrink-0 rounded-full"
          style={{ background: indicator.color, boxShadow: `0 0 16px ${indicator.color}` }}
        />
        <div className="min-w-0">
          <p style={{ color: '#fff', fontSize: compact ? '0.8rem' : '0.98rem', fontWeight: 800, margin: 0 }}>
            {indicator.label}
          </p>
          {!compact && (
            <p style={{ color: '#a1a1aa', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>
              {indicator.detail}
            </p>
          )}
        </div>
      </div>
      <span
        className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase"
        style={{ color: indicator.color, background: 'rgba(0,0,0,0.22)', letterSpacing: '0.08em' }}
      >
        {indicator.action}
      </span>
    </div>
  )
}

function VisionGate({ vision, visionReady, hasAgent }) {
  const copy = getVisionCopy(vision, visionReady, hasAgent)
  const telemetry = [
    { label: 'Backend', value: vision.connected ? 'Online' : 'Offline' },
    { label: 'Detector', value: vision.detectorOnline ? 'Online' : 'In attesa' },
    { label: 'Sguardo', value: vision.lookingAtCamera ? 'In camera' : 'Non verificato' },
  ]

  if (Number.isFinite(vision.yaw) && Number.isFinite(vision.pitch)) {
    telemetry.push({ label: 'Angoli', value: `${vision.yaw.toFixed(1)} / ${vision.pitch.toFixed(1)}` })
  }

  return (
    <div className="avatar-stage avatar-gate w-full overflow-hidden border border-white/[0.05] bg-[#0d0d16] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-8">
        <div
          className="absolute inset-0 -m-8 rounded-full border animate-ping"
          style={{ borderColor: `${copy.color}22`, animationDuration: '3s' }}
        />
        <div
          className="w-28 h-28 rounded-full border flex items-center justify-center"
          style={{ borderColor: `${copy.color}55`, background: `${copy.color}14`, boxShadow: `0 0 42px ${copy.color}22` }}
        >
          <svg className="w-12 h-12" style={{ color: copy.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      <div
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase"
        style={{ borderColor: `${copy.color}44`, color: copy.color, background: `${copy.color}12`, letterSpacing: '0.08em' }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: copy.color, boxShadow: `0 0 12px ${copy.color}` }} />
        Vision gate
      </div>

      <h3 style={{ ...syne, fontSize: '1.8rem', color: '#fff', margin: '1rem 0 0.75rem' }}>
        {copy.title}
      </h3>
      <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 520, margin: 0 }}>
        {copy.description}
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {telemetry.map(item => (
          <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
            <p style={{ color: '#52525b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.35rem' }}>
              {item.label}
            </p>
            <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MissingAgent({ navigate }) {
  return (
    <div className="avatar-stage w-full overflow-hidden border border-white/[0.05] bg-gradient-to-br from-violet-950/40 to-cyan-950/20 flex flex-col items-center justify-center p-10">
      <div className="relative mb-10">
        <div className="absolute inset-0 -m-8 rounded-full border border-violet-500/10 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 -m-16 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.6)]">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>
      </div>

      <h3 style={{ ...syne, fontSize: '1.5rem', color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
        Avatar Beyond Presence
      </h3>
      <p style={{ color: '#71717a', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6, marginBottom: '2rem' }}>
        Per attivare l&apos;avatar iperrealistico, configura un Agent ID valido nel file .env
      </p>

      <div className="bg-black/40 border border-white/[0.08] rounded-xl p-4 text-left w-full max-w-sm">
        <p style={{ color: '#52525b', fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'monospace' }}>.env</p>
        <code style={{ color: '#10b981', fontSize: '0.875rem', fontFamily: 'monospace' }}>
          VITE_BEY_AGENT_ID=<span style={{ color: '#71717a' }}>your_real_agent_id</span>
        </code>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <a
          href="https://app.bey.chat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Crea il tuo Agent su bey.chat →
        </a>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Torna alla Dashboard
        </button>
      </div>

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
    </div>
  )
}

export default function AvatarContainer() {
  const navigate = useNavigate()
  const viewportProfile = useViewportProfile()
  const BEY_AGENT_ID = import.meta.env.VITE_BEY_AGENT_ID || DEFAULT_BEY_AGENT_ID
  const hasAgent = Boolean(BEY_AGENT_ID && BEY_AGENT_ID !== 'demo')
  const [vision, setVision] = useState(INITIAL_VISION)

  useEffect(() => {
    let cancelled = false

    const applyStatus = data => {
      if (cancelled) return

      setVision({
        ...INITIAL_VISION,
        ...data,
        connected: true,
        detectorOnline: Boolean(data.detectorOnline),
        lookingAtCamera: Boolean(data.lookingAtCamera),
        yaw: Number.isFinite(data.yaw) ? data.yaw : null,
        pitch: Number.isFinite(data.pitch) ? data.pitch : null,
      })
    }

    const markDisconnected = () => {
      if (cancelled) return

      setVision(previous => ({
        ...previous,
        connected: false,
        detectorOnline: false,
        lookingAtCamera: false,
        reason: 'backend-offline',
      }))
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(visionUrl('/vision/status'))
        if (!response.ok) throw new Error('Vision status unavailable')
        applyStatus(await response.json())
      } catch {
        markDisconnected()
      }
    }

    fetchStatus()
    const events = new EventSource(visionUrl('/vision/events'))
    events.addEventListener('vision-status', event => {
      applyStatus(JSON.parse(event.data))
    })
    events.onerror = markDisconnected

    const poll = window.setInterval(fetchStatus, 3000)

    return () => {
      cancelled = true
      events.close()
      window.clearInterval(poll)
    }
  }, [])

  const visionReady = vision.connected && vision.detectorOnline && vision.lookingAtCamera
  const avatarReady = hasAgent && visionReady
  const avatarUrl = useMemo(() => (hasAgent ? `https://bey.chat/${BEY_AGENT_ID}` : null), [BEY_AGENT_ID, hasAgent])
  const isImmersive = viewportProfile === 'phone' || viewportProfile === 'totem'

  return (
    <div className={`avatar-page min-h-screen bg-[#08080e] text-white avatar-page--${viewportProfile}`}>
      {!isImmersive && <Navbar />}

      <div className="avatar-shell max-w-7xl mx-auto px-6 py-20">
        <div className="avatar-hero text-center mb-12">
          <p style={{ fontSize: '0.7rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
            Avatar Beyond Presence
          </p>
          <h1 style={{ ...syne, fontSize: '3.4rem', color: '#fff', marginBottom: '1.5rem' }}>
            Il tuo <span style={grad}>artificial human</span> è pronto
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#71717a', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
            Interagisci con il tuo avatar iperrealistico powered by Beyond Presence AI.
          </p>
        </div>

        <div className="avatar-wrap relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '20%',
                width: 600,
                height: 600,
                background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
                transform: 'translate(-50%,-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '60%',
                right: '15%',
                width: 400,
                height: 400,
                background: 'radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="avatar-frame relative bg-gradient-to-br from-violet-950/20 to-cyan-950/10 rounded-3xl p-8 border border-white/[0.07]">
            <div className="avatar-status mb-6 flex justify-center">
              <VisionStatusPanel vision={vision} visionReady={visionReady} hasAgent={hasAgent} />
            </div>

            {hasAgent && avatarReady ? (
              <div className="avatar-stage relative w-full h-full overflow-hidden border border-white/[0.05] bg-black/20">
                <div className="absolute left-4 top-4 z-10">
                  <VisionStatusPanel vision={vision} visionReady={visionReady} hasAgent={hasAgent} compact />
                </div>
                <iframe
                  src={avatarUrl}
                  allow="camera; microphone; fullscreen"
                  allowFullScreen
                  className="w-full h-full absolute inset-0"
                  style={{ border: 'none' }}
                  title="AURA Avatar"
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
              </div>
            ) : hasAgent ? (
              <VisionGate vision={vision} visionReady={visionReady} hasAgent={hasAgent} />
            ) : (
              <MissingAgent navigate={navigate} />
            )}
          </div>

          <div className="avatar-actions mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.09)' }}
              onMouseLeave={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            >
              ← Torna alla Dashboard
            </button>

            {hasAgent && (
              <button
                disabled={!avatarReady}
                onClick={() => {
                  if (avatarReady) window.open(avatarUrl, '_blank')
                }}
                style={{
                  background: avatarReady ? 'linear-gradient(135deg,#7c3aed,#0891b2)' : 'rgba(255,255,255,0.05)',
                  border: avatarReady ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: avatarReady ? '#fff' : '#71717a',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.875rem',
                  cursor: avatarReady ? 'pointer' : 'not-allowed',
                  boxShadow: avatarReady ? '0 0 30px rgba(124,58,237,0.35)' : 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={event => {
                  if (avatarReady) event.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={event => {
                  event.currentTarget.style.opacity = '1'
                }}
              >
                Apri in Nuova Finestra →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
