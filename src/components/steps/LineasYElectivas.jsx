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

  // Vista: 'lineas' | 'electivas' | 'lenguas'
  const [vista,        setVista]        = useState('lineas')
  const [lineasSel,    setLineasSel]    = useState([])
  const [electivasSel, setElectivasSel] = useState([])

  // Momento lenguas
  const [importanciaLengua,   setImportanciaLengua]   = useState('')
  const [opcionLengua,        setOpcionLengua]        = useState('')
  const [conocimientoInter,   setConocimientoInter]   = useState('')
  const [justificacionLengua, setJustificacionLengua] = useState('')

  const toggleLinea   = (l) => setLineasSel(prev   => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  const toggleElectiva = (e) => setElectivasSel(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])

  const handleGuardarLineas = async () => {
    await onGuardarLineas(lineasSel)
    setVista('electivas')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGuardarElectivas = async () => {
    await onGuardarElectivas(electivasSel)
    setVista('lenguas')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGuardarLenguas = async () => {
    // Las lenguas se guardarán junto con electivas (extensión del mismo guardado)
    // O puedes crear un endpoint separado si lo necesitas
    // Por ahora pasamos como parte de electivas adicionales
    const datosLenguas = {
      importancia_lengua:    importanciaLengua,
      opcion_lengua:         opcionLengua,
      conocimiento_intercul: conocimientoInter,
      justificacion:         justificacionLengua,
    }
    // Guardar en Supabase si tienes tabla para esto
    // Por ahora avanzamos al siguiente paso
    await onGuardarElectivas([
      ...electivasSel,
      importanciaLengua ? `[Lenguas] Importancia: ${importanciaLengua}` : '',
      opcionLengua      ? `[Lenguas] Opción: ${opcionLengua}` : '',
    ].filter(Boolean))
  }

  if (!prog) return null

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(160deg,#1e293b 0%,#0f172a 100%)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Indicador de progreso interno */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex gap-2">
            {['lineas','electivas','lenguas'].map((v, i) => (
              <div key={v} className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: vista === v ? 32 : 8,
                  background: (['lineas','electivas','lenguas'].indexOf(vista) >= i)
                    ? prog.colorAccent : 'rgba(255,255,255,0.2)'
                }} />
            ))}
          </div>
          <span className="text-white/40 font-body text-xs">
            {vista === 'lineas' ? 'Líneas de investigación'
              : vista === 'electivas' ? ' Profundización y electivas'
              : 'Lenguas e interculturalidad'}
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
                ¿En qué temas debería investigar este programa?
              </h2>
              <p className="text-white/60 font-body text-sm">{prog.preguntaLineas}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
              <p className="text-white/50 font-body text-xs mb-4 uppercase tracking-wide">
                Selecciona todos los que consideres relevantes para el territorio
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
              <div className="flex flex-wrap gap-2">
                {prog.electivas.map(e => (
                  <ChipSeleccionable key={e} label={e} seleccionado={electivasSel.includes(e)}
                    onToggle={() => toggleElectiva(e)} color={prog.colorAccent} />
                ))}
              </div>
            </div>

            {electivasSel.length > 0 && (
              <div className="rounded-2xl p-4 mb-5 border" style={{ background: `${prog.colorAccent}15`, borderColor: `${prog.colorAccent}40` }}>
                <p className="text-xs font-display font-bold mb-2 uppercase tracking-wide" style={{ color: prog.colorAccent }}>
                  {electivasSel.length} seleccionadas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {electivasSel.map(e => (
                    <span key={e} className="text-xs font-body px-2 py-1 rounded-lg text-white" style={{ background: prog.colorAccent }}>
                      {e}
                    </span>
                  ))}
                </div>
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

        {/* ── MOMENTO 9b: Lenguas e interculturalidad ─────────────────────── */}
        {vista === 'lenguas' && (
          <div className="animate-fade-up space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
                <span>🌐</span>
                <span className="text-white/80 font-body text-sm">Lenguas e Interculturalidad</span>
              </div>
              <h2 className="font-display text-3xl font-black text-white mb-2">
                ¿Qué papel deben jugar las lenguas en la formación?
              </h2>
              <p className="text-white/60 font-body text-sm">
                Pensando en las necesidades del Catatumbo y sus comunidades.
              </p>
            </div>

            {/* Pregunta 1 — Importancia */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white font-display font-bold text-sm mb-4">
                ¿Qué tan importante considera que los futuros profesionales desarrollen competencias
                en una segunda lengua o en lenguas propias del territorio (como la lengua del pueblo Barí)?
              </p>
              <div className="space-y-2">
                {['Muy importante', 'Importante', 'Medianamente importante', 'Poco importante', 'Nada importante'].map(op => (
                  <button key={op} onClick={() => setImportanciaLengua(op)}
                    className="w-full text-left px-4 py-3 rounded-xl border-2 font-body text-sm transition-all"
                    style={importanciaLengua === op
                      ? { background: '#67B93E', borderColor: '#3d7820', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                    {importanciaLengua === op ? '● ' : '○ '}{op}
                  </button>
                ))}
              </div>
            </div>

            {/* Pregunta 2 — Opción más relevante */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white font-display font-bold text-sm mb-4">
                ¿Cuál de las siguientes opciones considera más relevante para fortalecer
                la formación de los futuros profesionales del Catatumbo?
              </p>
              <div className="space-y-2">
                {[
                  'Dominio del inglés para acceder a conocimiento internacional',
                  'Aprendizaje de lenguas indígenas presentes en el territorio',
                  'Formación básica tanto en inglés como en lenguas propias del territorio',
                  'Ninguna de las anteriores',
                ].map(op => (
                  <button key={op} onClick={() => setOpcionLengua(op)}
                    className="w-full text-left px-4 py-3 rounded-xl border-2 font-body text-sm transition-all"
                    style={opcionLengua === op
                      ? { background: '#67B93E', borderColor: '#3d7820', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                    {opcionLengua === op ? '● ' : '○ '}{op}
                  </button>
                ))}
              </div>
            </div>

            {/* Pregunta 3 — Conocimiento intercultural */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white font-display font-bold text-sm mb-4">
                ¿Considera que el conocimiento de las culturas, tradiciones y formas de comunicación
                de las comunidades indígenas y campesinas del Catatumbo debería formar parte
                de la educación universitaria?
              </p>
              <div className="flex gap-3 mb-4">
                {['Sí', 'No', 'No sabe'].map(op => (
                  <button key={op} onClick={() => setConocimientoInter(op)}
                    className="flex-1 py-3 rounded-xl border-2 font-display font-bold text-sm transition-all"
                    style={conocimientoInter === op
                      ? { background: '#67B93E', borderColor: '#3d7820', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                    {op}
                  </button>
                ))}
              </div>
              {conocimientoInter && (
                <div>
                  <p className="text-white/60 font-body text-xs mb-2">Explique su respuesta (opcional)</p>
                  <textarea rows={2} value={justificacionLengua} onChange={e => setJustificacionLengua(e.target.value)}
                    placeholder="Comparte tu razonamiento..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 font-body text-sm focus:outline-none resize-none" />
                </div>
              )}
            </div>

            {/* Pregunta abierta lenguas */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white font-display font-bold text-sm mb-3">
                ✏️ Desde su experiencia en el territorio, ¿qué lenguas, formas de comunicación
                o conocimientos interculturales deberían fortalecer los estudiantes universitarios
                para relacionarse de manera respetuosa con las comunidades del Catatumbo?
              </p>
              <textarea rows={3} value={justificacionLengua} onChange={e => setJustificacionLengua(e.target.value)}
                placeholder="Tu experiencia y perspectiva son muy valiosas..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/25 font-body text-sm focus:outline-none resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setVista('electivas')}
                className="flex-1 py-4 rounded-2xl font-display font-semibold text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>
                ← Volver
              </button>
              <button onClick={handleGuardarLenguas} disabled={guardando}
                className="flex-2 flex-grow py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
                style={{ background: '#67B93E', boxShadow: '0 4px 20px rgba(103,185,62,0.4)' }}>
                {guardando ? 'Guardando...' : 'Continuar →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
