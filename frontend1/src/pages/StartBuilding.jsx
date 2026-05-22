import { useState } from 'react'
import Navbar from '../components/Navbar'
import { sendContactRequest } from '../lib/contactRequests'

const TOOLS = ['Ricerca file', 'Ricerca web', 'MCP', 'HTTP', 'Database', 'Email', 'Calendar']
const LANGUAGES = ['Rilevamento automatico', 'Italiano', 'English', 'Français', 'Deutsch', 'Español']
const MODELS = ['claude-sonnet-4', 'gpt-4o', 'gemini-1.5-pro', 'llama-3-70b']

export default function StartBuilding() {
  const [form, setForm] = useState({
    name: '',
    systemMessage: '',
    outputRequirements: '',
    tools: [],
    model: 'claude-sonnet-4',
    budget: 50,
    language: 'Rilevamento automatico',
  })
  const [deployed, setDeployed] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const toggleTool = (tool) => {
    setForm(f => ({
      ...f,
      tools: f.tools.includes(tool) ? f.tools.filter(t => t !== tool) : [...f.tools, tool]
    }))
  }

  const handleDeploy = async () => {
    if (!form.name.trim()) return
    setSending(true)
    setSubmitError('')

    try {
      await sendContactRequest({
        type: 'start_building',
        title: form.name,
        details: {
          agentName: form.name,
          systemMessage: form.systemMessage,
          outputRequirements: form.outputRequirements,
          tools: form.tools,
          model: form.model,
          budget: form.budget,
          budgetLabel: form.budget < 34 ? 'Economico' : form.budget < 67 ? 'Medio' : 'Alto',
          language: form.language,
        },
      })
      setDeployed(true)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSending(false)
    }
  }

  if (deployed) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
        <Navbar />
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(139,92,246,0.4)]">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-4">Richiesta inviata!</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-2">
            La tua richiesta per <span className="text-violet-400 font-semibold">"{form.name}"</span> è in fase di revisione da parte di un nostro specialista.
          </p>
          <p className="text-zinc-500 mb-10">
            Entro <span className="text-white font-semibold">5 giorni lavorativi</span> riceverai il tuo Agent personalizzato, pronto all'uso.
          </p>
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0"></span>
              Analisi dei requisiti e definizione del comportamento
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"></span>
              Configurazione del modello e dei tools
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
              Testing e consegna dell'agent operativo
            </div>
          </div>
          <button
            onClick={() => { setDeployed(false); setForm({ name:'', systemMessage:'', outputRequirements:'', tools:[], model:'claude-sonnet-4', budget:50, language:'Rilevamento automatico' }) }}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Crea un altro Agent
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16 grid lg:grid-cols-[1fr_420px] gap-8">
        {/* Left - Form */}
        <div>
          <h1 className="font-display text-5xl font-800 mb-2">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Configura il tuo</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI Agent</span>
          </h1>
          <p className="text-zinc-500 text-base mb-10">Descrivi cosa vuoi che il tuo assistente faccia — penseremo noi al resto.</p>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 mb-8 w-fit">
            {['Configura', 'Vibe', 'Confronta'].map((tab, i) => (
              <button key={tab} className={`px-4 py-2 text-sm rounded-lg transition-all ${i === 0 ? 'bg-white/10 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nome dell'agent</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Es: Receptionist digitale, Assistente HR..."
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all text-sm"
              />
            </div>

            {/* System Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">System Message</label>
              <p className="text-xs text-zinc-600">Descrivi il comportamento, gli obiettivi e la personalità del tuo agent</p>
              <textarea
                value={form.systemMessage}
                onChange={e => setForm(f => ({ ...f, systemMessage: e.target.value }))}
                placeholder="Es: Sei un assistente virtuale per una palestra. Rispondi alle domande su orari, abbonamenti, corsi disponibili. Sei professionale ma amichevole..."
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all text-sm resize-none"
              />
            </div>

            {/* Output Requirements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-zinc-300">Output Requirements</label>
                  <p className="text-xs text-zinc-600 mt-0.5">Definisci tono, struttura e lunghezza delle risposte</p>
                </div>
                <button className="text-xs text-violet-400 border border-violet-400/30 px-3 py-1.5 rounded-lg hover:bg-violet-400/10 transition-colors">
                  Definisci output
                </button>
              </div>
              <textarea
                value={form.outputRequirements}
                onChange={e => setForm(f => ({ ...f, outputRequirements: e.target.value }))}
                placeholder="Es: Risposte concise (max 3 frasi), tono formale, usa elenchi puntati per informazioni multiple..."
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all text-sm resize-none"
              />
            </div>

            {/* Tools */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-zinc-300">Tools</label>
                <p className="text-xs text-zinc-600 mt-0.5">Ricerca file, web search, MCP o HTTP</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TOOLS.map(tool => (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      form.tools.includes(tool)
                        ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                        : 'bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Modello AI</label>
              <div className="grid grid-cols-2 gap-2">
                {MODELS.map(m => (
                  <button
                    key={m}
                    onClick={() => setForm(f => ({ ...f, model: m }))}
                    className={`px-4 py-2.5 text-xs rounded-xl border text-left transition-all ${
                      form.model === m
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                        : 'bg-white/[0.03] border-white/[0.07] text-zinc-500 hover:border-white/15 hover:text-zinc-400'
                    }`}
                  >
                    <span className="font-medium">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">Budget computazionale</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0} max={100}
                  value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Basso</span>
                  <span className={`font-medium ${form.budget > 66 ? 'text-cyan-400' : form.budget > 33 ? 'text-violet-400' : 'text-zinc-500'}`}>
                    {form.budget < 34 ? 'Economico' : form.budget < 67 ? 'Medio' : 'Alto'}
                  </span>
                  <span>Alto</span>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Lingua di risposta</label>
              <select
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-all text-sm appearance-none cursor-pointer"
              >
                {LANGUAGES.map(l => <option key={l} value={l} className="bg-zinc-900">{l}</option>)}
              </select>
            </div>
          </div>

          {/* Deploy */}
          <div className="pt-6">
            <button
              onClick={handleDeploy}
              disabled={!form.name.trim() || sending}
              className="w-full py-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
            >
              {sending ? 'Invio richiesta...' : 'Deploy Agent →'}
            </button>
            {!form.name.trim() && <p className="text-center text-xs text-zinc-600 mt-2">Inserisci un nome per abilitare il deploy</p>}
            {submitError && <p className="text-center text-xs text-red-400 mt-2">{submitError}</p>}
          </div>
        </div>

        {/* Right - Live Preview */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="border-b border-white/[0.07] px-5 py-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/60"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/60"></span>
              </div>
              <span className="text-xs text-zinc-600 font-medium">Preview Agent</span>
            </div>
            <div className="p-6 min-h-[500px] flex flex-col">
              {form.name || form.systemMessage ? (
                <div className="space-y-4 flex-1">
                  {form.name && (
                    <div>
                      <p className="text-xs text-zinc-600 mb-1 uppercase tracking-wider">Agent</p>
                      <p className="text-white font-semibold text-lg">{form.name}</p>
                    </div>
                  )}
                  {form.systemMessage && (
                    <div>
                      <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Comportamento</p>
                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4">{form.systemMessage}</p>
                    </div>
                  )}
                  {form.tools.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Tools attivi</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.tools.map(t => (
                          <span key={t} className="text-xs px-2 py-1 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Modello</p>
                    <span className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{form.model}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-3">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">A</div>
                      <div className="bg-white/[0.06] rounded-xl px-3 py-2 text-xs text-zinc-400 max-w-[80%]">
                        Ciao! Sono {form.name}. Come posso aiutarti?
                      </div>
                    </div>
                    <div className="flex gap-2 items-center bg-white/[0.04] rounded-xl px-3 py-2.5 border border-white/[0.07]">
                      <input className="flex-1 bg-transparent text-xs text-zinc-600 placeholder-zinc-700 focus:outline-none" placeholder="Scrivi un messaggio..." readOnly />
                      <span className="text-zinc-700">↵</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-zinc-600 text-sm font-medium">Preview Agent</p>
                  <p className="text-zinc-700 text-xs mt-1">Compila i campi per vedere l'anteprima</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
