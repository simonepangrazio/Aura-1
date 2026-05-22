import re

with open('src/pages/Home.jsx', 'r') as f:
    content = f.read()

# 1. Add lucide-react imports
if 'import { Book' not in content:
    content = content.replace("import AvatarSection from '../components/AvatarSection'", "import AvatarSection from '../components/AvatarSection'\nimport { Book, FileText, Calendar, Headphones, PieChart, Megaphone, Box, BarChart2, Users, ArrowRight } from 'lucide-react'")

# 2. Add ECOSYSTEM_NODES
nodes_str = """
const ECOSYSTEM_NODES = [
  { label: 'Knowledge\\nManagement', icon: Book, pos: { top: '5%', left: '50%' } },
  { label: 'Intelligent\\nDocument\\nProcessing', icon: FileText, pos: { top: '18%', left: '85%' } },
  { label: 'Booking\\nSystem', icon: Calendar, pos: { top: '50%', left: '95%' } },
  { label: 'Smart\\nContact\\nCenter', icon: Headphones, pos: { top: '82%', left: '85%' } },
  { label: 'Finance Data\\nManagement', icon: PieChart, pos: { top: '95%', left: '50%' } },
  { label: 'Marketing\\n& Selling', icon: Megaphone, pos: { top: '82%', left: '15%' } },
  { label: 'Supply Chain', icon: Box, pos: { top: '50%', left: '5%' } },
  { label: 'Business\\nIntelligence', icon: BarChart2, pos: { top: '30%', left: '10%' } },
  { label: 'Human\\nResources\\nManagement', icon: Users, pos: { top: '15%', left: '25%' } },
];
"""
if 'ECOSYSTEM_NODES' not in content:
    content = content.replace("const TEMPLATES = [", nodes_str + "\nconst TEMPLATES = [")

# 3. Add Ecosystem to TEMPLATES
new_template = """  {
    emoji: '🌐',
    label: 'Ecosistema AURA',
    id: 'ecosistema-aura',
    color: '#0891b2',
    isEcosystem: true
  },
]"""
if 'ecosistema-aura' not in content:
    content = content.replace("  },\n]", new_template)

# 4. Remove EcosystemSection import and usage
content = content.replace("import EcosystemSection from '../components/EcosystemSection'\n", "")
content = re.sub(r'\{\/\* ── ECOSYSTEM ───────────────────────────────────────── \*\/\}\s*<EcosystemSection \/>', '', content)

# 5. Replace TEMPLATES TEASER block
teaser_regex = r'\{\/\* ── TEMPLATES TEASER ────────────────────────────────── \*\/\}\s*<section style=\{\{ padding:\'5\.25rem 1\.5rem\', borderTop:\'1px solid rgba\(255,255,255,0\.05\)\' \}\}>.*?(?=\{\/\* ── DEMO CALLOUT ────────────────────────────────────── \*\/\})'

new_teaser = """{/* ── TEMPLATES TEASER & ECOSYSTEM ────────────────────────────────── */}
      <section style={{ padding:'5.25rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto templates-teaser-grid">
          <div>
            {!selectedTemplate.isEcosystem ? (
              <>
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
              </>
            ) : (
              <>
                <h2 style={{ ...syne, fontSize:'clamp(2.5rem,4.5vw,3.75rem)', color:'#fff', marginBottom:'1.5rem', lineHeight:1.1 }}>
                  L'ecosistema AURA,<br />
                  <span style={grad}>già configurato</span>
                </h2>
                <p style={{ fontSize:'1.1rem', color:'#a1a1aa', lineHeight:1.8, marginBottom:'1.5rem' }}>
                  AURA integra tecnologie proprietarie, AI conversazionale, machine learning e natural language processing per creare AI Agent capaci di <strong style={{ color:'#22d3ee', fontWeight:600 }}>comprendere, generare e adattare</strong> azioni e decisioni in diversi contesti.
                </p>
                <p style={{ fontSize:'1.1rem', color:'#a1a1aa', lineHeight:1.8, marginBottom:'2.5rem' }}>
                  Una piattaforma <strong style={{ color:'#a78bfa', fontWeight:600 }}>flessibile</strong> e pronta all'uso, pensata per rispondere alle esigenze reali della tua organizzazione.
                </p>
                <button
                  onClick={() => navigate('/ecosystem')}
                  style={{ background:'linear-gradient(135deg,#7c3aed,#0891b2)', boxShadow:'0 0 30px rgba(124,58,237,0.3)', border:'none', color:'#fff', fontWeight:600, fontSize:'1rem', padding:'1rem 2rem', borderRadius:'1rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.5rem' }}
                >
                  Scopri l'ecosistema AURA <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>

          <div className="sector-showcase">
            {!selectedTemplate.isEcosystem ? (
              <SectorOrbit sector={selectedTemplate} />
            ) : (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 0 50px rgba(124,58,237,0.1)', borderStyle: 'dashed' }} />
                <div style={{ position: 'absolute', inset: '25%', borderRadius: '50%', border: '1px solid rgba(8,145,178,0.2)', boxShadow: '0 0 40px rgba(8,145,178,0.1)' }} />
                <div style={{ position: 'absolute', inset: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {ECOSYSTEM_NODES.map((n, i) => (
                    <line key={`line-${i}`} x1="50%" y1="50%" x2={n.pos.left} y2={n.pos.top} stroke="rgba(124,58,237,0.3)" strokeWidth="1" />
                  ))}
                </svg>

                <div style={{ position: 'relative', width: '35%', height: '35%', borderRadius: '50%', background: 'linear-gradient(135deg, #1e1e2e, #0f0f1a)', border: '2px solid rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 0 60px rgba(124,58,237,0.4)', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'url(/Logo_Aura_vett.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8 }} />
                  <div style={{ position: 'absolute', bottom: '15%', background: '#fff', padding: '0.2rem 0.8rem', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ color: '#7c3aed', fontWeight: 900, fontSize: '1.2rem', lineHeight: 1 }}>AURA</div>
                    <div style={{ color: '#000', fontSize: '0.45rem', fontWeight: 700, letterSpacing: '0.05em' }}>AI AGENTS FOR BUSINESS</div>
                  </div>
                </div>

                {ECOSYSTEM_NODES.map((node, i) => {
                  const Icon = node.icon;
                  return (
                    <div key={i} style={{ position: 'absolute', top: node.pos.top, left: node.pos.left, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f0f1a', border: '1px solid rgba(34,211,238,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(34,211,238,0.2)' }}>
                        <Icon size={18} color="#22d3ee" />
                      </div>
                      <div style={{ color: '#e4e4e7', fontSize: '0.75rem', fontWeight: 500, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2 }}>
                        {node.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="sector-selector">
              <div className="sector-selector-grid">
                {TEMPLATES.map((t, index) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTemplate(index)}
                    className={index === activeTemplate ? 'is-active' : ''}
                    style={{ '--sector-color': t.color }}
                  >
                    <span>{t.emoji}</span>
                    <strong>{t.label}</strong>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={showNextTemplate}
                className="sector-next"
                aria-label="Mostra settore successivo"
              >
                <span>Settore successivo</span>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {selectedTemplate.isEcosystem && (
          <div className="max-w-6xl mx-auto" style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem 2rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginBottom: '1.5rem' }}>Tecnologie integrate</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" alt="Python" style={{ height: '24px' }} />
                <span style={{ color: '#e4e4e7', fontWeight: 500, fontSize: '0.9rem' }}>Python</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5V9.5l4 2.5-4 2.5z"/></svg>
                <span style={{ color: '#e4e4e7', fontWeight: 500, fontSize: '0.9rem' }}>OpenAI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <span style={{ color: '#ff9900', fontWeight: 700, fontSize: '1.2rem', fontStyle: 'italic' }}>aws</span>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <span style={{ color: '#a1a1aa', fontSize: '0.55rem' }}>AWS</span>
                  <span style={{ color: '#a1a1aa', fontSize: '0.55rem' }}>Qualified</span>
                  <span style={{ color: '#a1a1aa', fontSize: '0.55rem' }}>Software</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem', letterSpacing: '-0.05em' }}>tavus</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5V9.5l4 2.5-4 2.5z"/></svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #22d3ee, #7c3aed)', borderRadius: '4px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ color: '#e4e4e7', fontSize: '0.75rem', fontWeight: 500 }}>Proprietary</span>
                  <span style={{ color: '#e4e4e7', fontSize: '0.75rem', fontWeight: 500 }}>AI Models</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', minWidth: '140px', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ color: '#e4e4e7', fontSize: '0.8rem', fontWeight: 600 }}>n8n</span>
                  <span style={{ color: '#a1a1aa', fontSize: '0.65rem' }}>Automation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
"""

content = re.sub(teaser_regex, new_teaser, content, flags=re.DOTALL)

with open('src/pages/Home.jsx', 'w') as f:
    f.write(content)
