export default function AvatarSection() {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden border border-white/[0.07]">
      <iframe
        title="Beyond Presence demo agent"
        src="https://bey.chat/agent/defaultAgent"
        allow="camera; microphone; fullscreen; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        className="w-full h-full absolute inset-0 object-cover"
        style={{ minHeight: '400px', border: 'none', backgroundColor: '#050508' }}
      />
      
      {/* Softens the embed edge without blocking camera/mic interactions. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Gradient frame */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-white/10"></div>
      
      {/* Indicatori di stato */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-white text-xs font-medium">LIVE</span>
      </div>
    </div>
  )
}
