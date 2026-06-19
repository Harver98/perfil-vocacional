import { useState } from 'react'
import { PROGRAMAS } from '../../data/programas'

function ChipSeleccionable({ label, seleccionado, onToggle, color }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-body text-sm transition-all duration-200 hover:scale-105 active:scale-95 text-left"
      style={seleccionado
        ? { background: color, borderColor: color, color: 'white', boxShadow: `0 4px 12px ${color}40` }
        : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }
      }
    >
      {seleccionado && <span className="text-white/80 flex-shrink-0">✓</span>}
      <span>{label}</span>
    </button>
  )
}

export default function LineasYElectivas({
  programaActual,
  onGuardarLineas,
  onGuardarElectivas,
  guardando,
}) {
  const prog = PROGRAMAS.find(p => p.id === programaActual)

  // Vista: 'lineas' | 'electivas'
  const [vista,        setVista]        = useState('lineas')
  const [lineasSel,    setLineasSel]    = useState([])
  const [electivasSel, setElectivasSel] = useState([])

  const MAX_LINEAS = 4
  const toggleLinea = (l) => setLineasSel(prev => {
    if (prev.includes(l)) return prev.filter(x => x !== l)
    if (prev.length >= MAX_LINEAS) return prev
    return [...prev, l]
  })
  const toggleElectiva = (e) => setElectivasSel(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])

  const handleGuardarLineas = async () => {
    await onGuardarLineas(lineasSel)
    setVista('electivas')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGuardarElectivas = async () => {
    await onGuardarElectivas(electivasSel)
  }

  if (!prog) return null

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(160deg,#1e293b 0%,#0f172a 100%)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Indicador de progreso interno */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex gap-2">
            {['lineas','electivas'].map((v, i) => (
              <div key={v} className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: vista === v ? 32 : 8,
                  background: (['lineas','electivas'].indexOf(vista) >= i)
                    ? prog.colorAccent : 'rgba(255,255,255,0.2)'
                }} />
            ))}
          </div>
          <span className="text-white/40 font-body text-xs">
            {vista === 'lineas' ? 'Líneas de investigación' : 'Profundización y electivas'}
          </span>
        </div>

        {/* ── MOMENTO 8: Líneas de investigación ─────────────────────────── */}
        {vista === 'lineas' && (
          <div className="animate-fade-up">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-sm font-display font-semibold text-white"
                style={{ background: prog.colorAccent }}>
                {prog.emoji} {prog.nombre}
              </div>
              <h2 className="font-display text-3xl font-black text-white mb-2">
                ¿En qué temas consideras que debería investigar este programa?
              </h2>
              <p className="text-white/60 font-body text-sm">{prog.preguntaLineas}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
              <p className="text-white/50 font-body text-xs mb-4 uppercase tracking-wide">
            Selecciona hasta {MAX_LINEAS} que consideres relevantes para el territorio · {lineasSel.length}/{MAX_LINEAS}
          </p>
              <div className="flex flex-wrap gap-2">
                {prog.lineasInvestigacion.map(l => (
                  <ChipSeleccionable key={l} label={l} seleccionado={lineasSel.includes(l)}
                    onToggle={() => toggleLinea(l)} color={prog.colorAccent} />
                ))}
              </div>
            </div>

            {lineasSel.length > 0 && (
              <div className="rounded-2xl p-4 mb-5 border" style={{ background: `${prog.colorAccent}15`, borderColor: `${prog.colorAccent}40` }}>
                <p className="text-xs font-display font-bold mb-2 uppercase tracking-wide" style={{ color: prog.colorAccent }}>
                  {lineasSel.length} {lineasSel.length === 1 ? 'línea seleccionada' : 'líneas seleccionadas'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {lineasSel.map(l => (
                    <span key={l} className="text-xs font-body px-2 py-1 rounded-lg text-white" style={{ background: prog.colorAccent }}>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleGuardarLineas} disabled={guardando}
              className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
              style={{ background: prog.colorAccent, boxShadow: `0 4px 20px ${prog.colorAccent}40` }}>
              {guardando ? 'Guardando...' : `Continuar${lineasSel.length > 0 ? ` con ${lineasSel.length} líneas` : ''} →`}
            </button>
          </div>
        )}

        {/* ── MOMENTO 9: Electivas ────────────────────────────────────────── */}
        {vista === 'electivas' && (
          <div className="animate-fade-up">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-sm font-display font-semibold text-white"
                style={{ background: prog.colorAccent }}>
                {prog.emoji} {prog.nombre}
              </div>
              <h2 className="font-display text-3xl font-black text-white mb-2">
                ¿Qué materias complementarias enriquecerían la formación?
              </h2>
              <p className="text-white/60 font-body text-sm">{prog.preguntaElectivas}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
              <p className="text-white/50 font-body text-xs mb-4 uppercase tracking-wide">
                Selecciona las que consideres más importantes
              </p>
              <div className="space-y-2">
                {prog.electivas.map(e => (
                  <button key={e} onClick={() => toggleElectiva(e)}
                    className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150"
                    style={electivasSel.includes(e)
                      ? { background: `${prog.colorAccent}20`, borderColor: prog.colorAccent }
                      : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}>
                    <div className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={electivasSel.includes(e)
                        ? { background: prog.colorAccent, borderColor: prog.colorAccent }
                        : { borderColor: 'rgba(255,255,255,0.3)' }}>
                      {electivasSel.includes(e) && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className="font-body text-sm leading-snug"
                      style={{ color: electivasSel.includes(e) ? 'white' : 'rgba(255,255,255,0.8)' }}>
                      {e}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {electivasSel.length > 0 && (
              <div className="rounded-2xl p-4 mb-5 border" style={{ background: `${prog.colorAccent}15`, borderColor: `${prog.colorAccent}40` }}>
                <p className="text-xs font-display font-bold uppercase tracking-wide" style={{ color: prog.colorAccent }}>
                  {electivasSel.length} {electivasSel.length === 1 ? 'materia seleccionada' : 'materias seleccionadas'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setVista('lineas')}
                className="flex-1 py-4 rounded-2xl font-display font-semibold text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
                ← Volver
              </button>
              <button onClick={handleGuardarElectivas} disabled={guardando}
                className="flex-2 flex-grow py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
                style={{ background: prog.colorAccent, boxShadow: `0 4px 20px ${prog.colorAccent}40` }}>
                {guardando ? 'Guardando...' : 'Continuar →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}