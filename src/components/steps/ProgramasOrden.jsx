import { useState } from 'react'
import { PROGRAMAS } from '../../data/programas'

export default function ProgramasOrden({ onContinuar }) {
  const [orden, setOrden]         = useState(PROGRAMAS.map(p => p.id))
  const [arrastrado, setArrastrado] = useState(null)
  const [sobre, setSobre]         = useState(null)
  const [confirmado, setConfirmado] = useState(false)

  const programa = (id) => PROGRAMAS.find(p => p.id === id)

  // ── Drag & Drop handlers ─────────────────────────────────────────────────
  const onDragStart = (e, id) => {
    setArrastrado(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (e, id) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setSobre(id)
  }
  const onDrop = (e, idDestino) => {
    e.preventDefault()
    if (!arrastrado || arrastrado === idDestino) return
    const nuevo = [...orden]
    const desde = nuevo.indexOf(arrastrado)
    const hasta = nuevo.indexOf(idDestino)
    nuevo.splice(desde, 1)
    nuevo.splice(hasta, 0, arrastrado)
    setOrden(nuevo)
    setSobre(null)
    setArrastrado(null)
  }
  const onDragEnd = () => { setArrastrado(null); setSobre(null) }

  // ── Mover con botones (accesibilidad móvil) ──────────────────────────────
  const moverArriba = (id) => {
    const i = orden.indexOf(id)
    if (i === 0) return
    const nuevo = [...orden]
    ;[nuevo[i - 1], nuevo[i]] = [nuevo[i], nuevo[i - 1]]
    setOrden(nuevo)
  }
  const moverAbajo = (id) => {
    const i = orden.indexOf(id)
    if (i === orden.length - 1) return
    const nuevo = [...orden]
    ;[nuevo[i], nuevo[i + 1]] = [nuevo[i + 1], nuevo[i]]
    setOrden(nuevo)
  }

  const handleConfirmar = () => {
    setConfirmado(true)
    setTimeout(() => onContinuar(orden), 1500)
  }

  const ETIQUETAS = ['1ª preferencia', '2ª preferencia', '3ª preferencia']

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: programa(orden[0])?.gradient || '#f9fafb' }}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🎯</span>
          <h2 className="font-display text-2xl font-black text-white mb-3 balance leading-snug">
            ¿Qué tan interesado estarías tu, algún familiar o conocido en cada uno de los siguientes programas académicos? Ordénalos desplazándolos con las flechas.
          </h2>
        </div>

        {/* Lista drag & drop */}
        <div className="space-y-3 mb-8">
          {orden.map((id, i) => {
            const prog = programa(id)
            const esDragged = arrastrado === id
            const esSobre   = sobre === id
            return (
              <div
                key={id}
                draggable
                onDragStart={e => onDragStart(e, id)}
                onDragOver={e  => onDragOver(e, id)}
                onDrop={e      => onDrop(e, id)}
                onDragEnd={onDragEnd}
                className="rounded-3xl border-2 p-5 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all duration-200"
                style={{
                  background:   esDragged ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(12px)',
                  borderColor:  esSobre ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                  opacity:      esDragged ? 0.5 : 1,
                  transform:    esSobre ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Posición */}
                <div className="flex-shrink-0 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-display font-black text-white text-lg mb-1">
                    {i + 1}
                  </div>
                  <p className="text-white/50 font-body text-xs whitespace-nowrap">{ETIQUETAS[i]}</p>
                </div>

                {/* Info programa */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-2xl">{prog.emoji}</span>
                    <p className="font-display font-bold text-white text-base leading-tight">{prog.nombre}</p>
                  </div>
                  <p className="text-white/60 font-body text-xs leading-snug">{prog.descripcion}</p>
                </div>

                {/* Botones de orden (para móvil) */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => moverArriba(id)} disabled={i === 0}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 disabled:opacity-20 text-white font-bold text-sm flex items-center justify-center transition-all">
                    ↑
                  </button>
                  <button onClick={() => moverAbajo(id)} disabled={i === orden.length - 1}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 disabled:opacity-20 text-white font-bold text-sm flex items-center justify-center transition-all">
                    ↓
                  </button>
                </div>

                {/* Handle drag */}
                <div className="text-white/30 text-xl flex-shrink-0 select-none">⠿</div>
              </div>
            )
          })}
        </div>

        {/* Vista previa del orden */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-6">
          <p className="text-white/60 font-body text-xs mb-3 uppercase tracking-wide">Tu orden de preferencia</p>
          <div className="flex items-center gap-2 flex-wrap">
            {orden.map((id, i) => (
              <div key={id} className="flex items-center gap-1.5">
                <span className="text-white/40 font-body text-xs">{i + 1}.</span>
                <span className="text-white font-display font-semibold text-sm">{programa(id)?.emoji} {programa(id)?.nombre}</span>
                {i < orden.length - 1 && <span className="text-white/30">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Botón confirmar */}
        <button
          onClick={handleConfirmar}
          disabled={confirmado}
          className="w-full py-4 rounded-2xl font-display font-bold text-lg transition-all duration-300"
          style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}
        >
          {confirmado ? '✅ ¡Listo! Continuando...' : 'Confirmar mi orden →'}
        </button>
      </div>
    </div>
  )
}