import { useEffect } from 'react'

import { getFrontend2Url } from '../lib/frontend2'

export default function Frontend2Redirect({ path = '/login' }) {
  const url = getFrontend2Url(path)

  useEffect(() => {
    window.location.replace(url)
  }, [url])

  return (
    <div className="min-h-screen bg-[#08080e] text-white flex items-center justify-center px-6">
      <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
        Apertura della console AURA...
      </p>
    </div>
  )
}
