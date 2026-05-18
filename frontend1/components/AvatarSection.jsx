export default function AvatarSection() {
  // Video OBS registrato per la homepage
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden border border-white/[0.07]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full absolute inset-0 object-cover"
        style={{ minHeight: '400px' }}
      >
        <source src="/videos/avatar.mov" type="video/mp4" />
        {/* Fallback per browser che non supportano il video */}
        <div className="w-full h-full bg-gradient-to-br from-violet-950/40 to-cyan-950/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <p className="text-white text-sm">Video non disponibile</p>
          </div>
        </div>
      </video>
      
      {/* Overlay con play button per controllo */}
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
