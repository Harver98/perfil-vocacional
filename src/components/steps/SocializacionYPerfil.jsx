import { useState, useEffect, useCallback, useRef } from 'react'
import { PROGRAMAS } from '../../data/programas'

// ── Drag & Drop ───────────────────────────────────────────────────────────────
function DragDropCompetencias({ items, onCambio, accentColor }) {
  const [opciones,    setOpciones]    = useState([...items])
  const [prioridades, setPrioridades] = useState([])
  const [dragging,    setDragging]    = useState(null)
  const [fromCol,     setFromCol]     = useState(null)

  // Usamos useCallback para que onCambio no genere dependencia estale
  const notificar = useCallback((lista) => { onCambio(lista) }, [onCambio])

  useEffect(() => { notificar(prioridades) }, [prioridades, notificar])

  const startDrag = (item, col) => { setDragging(item); setFromCol(col) }

  const dropEn = (col) => {
    if (!dragging || fromCol === col) { setDragging(null); return }
    if (col === 'pri') {
      setOpciones(p => p.filter(i => i !== dragging))
      setPrioridades(p => [...p, dragging])
    } else {
      setPrioridades(p => p.filter(i => i !== dragging))
      setOpciones(p => [...p, dragging])
    }
    setDragging(null); setFromCol(null)
  }

  const moverA = (item, destino) => {
    if (destino === 'pri') {
      setOpciones(p => p.filter(i => i !== item))
      setPrioridades(p => [...p, item])
    } else {
      setPrioridades(p => p.filter(i => i !== item))
      setOpciones(p => [...p, item])
    }
  }

  const Chip = ({ item, col }) => (
    <div
      draggable
      onDragStart={() => startDrag(item, col)}
      onDragEnd={() => setDragging(null)}
      onClick={() => moverA(item, col === 'ops' ? 'pri' : 'ops')}
      className="rounded-xl px-3 py-2 text-xs font-body border cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-150 select-none"
      style={{
        opacity: dragging === item ? 0.4 : 1,
        background: 'white', borderColor: '#d1d5db', color: '#1f2937',
        fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      title={col === 'ops' ? 'Toca para priorizar' : 'Toca para quitar'}>
      {item}
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-3">
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={() => dropEn('ops')}
        className="min-h-36 rounded-2xl border-2 border-dashed p-3"
        style={{ borderColor: `${accentColor}50`, background: 'rgba(255,255,255,0.12)' }}>
        <p className="text-xs font-display font-bold mb-1 uppercase tracking-wide text-white">OPCIONES</p>
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>toca para priorizar</p>
        <div className="flex flex-wrap gap-1.5">
          {opciones.map(i => <Chip key={i} item={i} col="ops" />)}
          {opciones.length === 0 && (
            <p className="text-xs py-3 w-full text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Todas priorizadas ✓</p>
          )}
        </div>
      </div>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={() => dropEn('pri')}
        className="min-h-36 rounded-2xl border-2 border-dashed p-3"
        style={{ borderColor: `${accentColor}80`, background: 'rgba(255,255,255,0.18)' }}>
        <p className="text-xs font-display font-bold mb-2 uppercase tracking-wide text-white">MIS PRIORIDADES</p>
        <div className="flex flex-col gap-1.5 mt-4">
          {prioridades.map((i, idx) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-display font-black w-4 text-center flex-shrink-0 text-white">{idx + 1}</span>
              <Chip item={i} col="pri" />
            </div>
          ))}
          {prioridades.length === 0 && (
            <p className="text-xs text-center py-4 leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
              ← Toca o arrastra para priorizar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Card oscura ───────────────────────────────────────────────────────────────
function Card({ children }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
      {children}
    </div>
  )
}

function RadioOpcion({ label, seleccionado, onSeleccionar }) {
  return (
    <button
      onClick={onSeleccionar}
      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 flex items-center gap-3"
      style={seleccionado
        ? { background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.7)', color: '#ffffff' }
        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)' }}>
      <div
        className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
        style={{ borderColor: seleccionado ? '#ffffff' : 'rgba(255,255,255,0.4)' }}>
        {seleccionado && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className="font-body text-sm leading-snug">{label}</span>
    </button>
  )
}

function SeccionLenguas({ onGuardar, txtMuted }) {
  const [importanciaLenguas, setImportanciaLenguas] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <span className="text-3xl">🌐</span>
        <div>
          <p className="font-display font-bold text-white text-base">Lenguas e Interculturalidad</p>
          <p className="font-body text-xs" style={txtMuted}>Una reflexión final sobre la formación universitaria en el Catatumbo</p>
        </div>
      </div>

      <Card>
        <p className="font-display font-bold text-white text-sm mb-3 leading-snug">
          ¿Qué tan importante considera que los estudiantes y futuros profesionales
          de la Universidad Nacional del Catatumbo desarrollen competencias en una
          segunda lengua o en lenguas propias del territorio (como la lengua del pueblo Barí)
          para su formación y ejercicio profesional?
        </p>
        <p className="font-body text-xs mb-4" style={txtMuted}>Seleccione una opción</p>
        <div className="space-y-2">
          {['Muy importante', 'Importante', 'Medianamente importante', 'Poco importante', 'Nada importante'].map(op => (
            <RadioOpcion
              key={op}
              label={op}
              seleccionado={importanciaLenguas === op}
              onSeleccionar={() => setImportanciaLenguas(op)}
            />
          ))}
        </div>
      </Card>

      <button
        onClick={() => onGuardar({ importanciaLenguas })}
        disabled={!importanciaLenguas}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
        style={importanciaLenguas
          ? { background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }
          : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' }}>
        {importanciaLenguas ? 'Continuar →' : 'Selecciona una opción para continuar'}
      </button>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SocializacionYPerfil({ programasOrden, onGuardarIngreso, onGuardarEgreso, guardando }) {
  const [progIdx,  setProgIdx]  = useState(0)
  const [subpaso,  setSubpaso]  = useState(0)
  const [errorMsg, setErrorMsg] = useState(null)

  // Ingreso
  const [priIngresoSer,   setPriIngresoSer]   = useState([])
  const [priIngresoHacer, setPriIngresoHacer] = useState([])
  const [priIngresoSaber, setPriIngresoSaber] = useState([])
  const [comIngreso,      setComIngreso]      = useState('')
  const [imaginaPrograma, setImaginaPrograma] = useState('')

  // Egreso
  const [priEgresoSaber,  setPriEgresoSaber]  = useState([])
  const [priEgresoSer,    setPriEgresoSer]    = useState([])
  const [priEgresoHacer,  setPriEgresoHacer]  = useState([])
  const [comEgreso,       setComEgreso]       = useState('')

  // useRef: valor disponible sincrónicamente sin delay de setState
  const egresoGuardadoRef = useRef(null)

  const programaId = programasOrden[progIdx]
  const prog       = PROGRAMAS.find(p => p.id === programaId)
  const esUltimo   = progIdx === programasOrden.length - 1

  const resetSubpaso = () => {
    setSubpaso(0)
    setErrorMsg(null)
    setPriIngresoSer([]); setPriIngresoHacer([]); setPriIngresoSaber([])
    setComIngreso(''); setImaginaPrograma('')
    setPriEgresoSaber([]); setPriEgresoSer([]); setPriEgresoHacer([])
    setComEgreso('')
    // Limpiamos también el egreso temporal para evitar contaminación entre programas
    egresoGuardadoRef.current = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ir = (paso) => {
    setErrorMsg(null)
    setSubpaso(paso)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGuardarIngreso = async () => {
    const prioridades = [
      ...priIngresoSer.map((c, i)   => ({ categoria: 'ser',   competencia: c, orden: i + 1 })),
      ...priIngresoHacer.map((c, i) => ({ categoria: 'hacer', competencia: c, orden: i + 1 })),
      ...priIngresoSaber.map((c, i) => ({ categoria: 'saber', competencia: c, orden: i + 1 })),
    ]
    try {
      await onGuardarIngreso({ programa: programaId, prioridades, comentario: comIngreso, vision_territorial: imaginaPrograma })
      ir(2)
    } catch (e) {
      setErrorMsg('Error al guardar perfil de ingreso. Intenta de nuevo.')
    }
  }

  const handleGuardarEgreso = async () => {
    const prioridades = [
      ...priEgresoSaber.map((c, i) => ({ categoria: 'saber', competencia: c, orden: i + 1 })),
      ...priEgresoSer.map((c, i)   => ({ categoria: 'ser',   competencia: c, orden: i + 1 })),
      ...priEgresoHacer.map((c, i) => ({ categoria: 'hacer', competencia: c, orden: i + 1 })),
    ]
    // Guardamos localmente y siempre pasamos a lenguas antes de persistir
    egresoGuardadoRef.current = { programa: programaId, prioridades, comentario: comEgreso }
    ir(3)
  }

  const handleGuardarLenguas = async (datosLenguas) => {
    if (!egresoGuardadoRef.current) return
    try {
      await onGuardarEgreso({
        ...egresoGuardadoRef.current,
        importancia_lengua: datosLenguas?.importanciaLenguas || 'Sin especificar',
      })

      if (progIdx < programasOrden.length - 1) {
        setProgIdx(i => i + 1)
        resetSubpaso()
      } else {
        resetSubpaso()
      }
    } catch (e) {
      setErrorMsg('Error al guardar. Intenta de nuevo.')
    }
  }

  if (!prog) return null

  const T = {
    principal: { color: '#ffffff', textShadow: '0 1px 6px rgba(0,0,0,0.6)' },
    sub:       { color: 'rgba(255,255,255,0.88)' },
    muted:     { color: 'rgba(255,255,255,0.55)' },
    textarea: {
      width: '100%', background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12,
      padding: '12px 16px', color: '#ffffff',
      fontFamily: 'DM Sans, sans-serif', fontSize: 14,
      resize: 'none', outline: 'none', lineHeight: 1.6,
    },
    btnVolver: {
      background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
      color: 'rgba(255,255,255,0.82)', borderRadius: 16, padding: '14px 20px',
      fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer',
    },
    btnPrincipal: {
      background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.55)',
      color: '#ffffff', borderRadius: 16, padding: '14px 20px',
      fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16,
      cursor: 'pointer', textShadow: '0 1px 4px rgba(0,0,0,0.4)',
    },
    badge: {
      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: 999, padding: '6px 16px',
      display: 'inline-flex', alignItems: 'center', gap: 8,
    },
  }

  const SECCIONES_INGRESO = [
    { label: '💡 SER — Valores y actitudes',    sub: '¿Qué valores debe tener quien ingrese?', items: prog.perfilIngreso.ser,   setState: setPriIngresoSer   },
    { label: '⚡ HACER — Habilidades prácticas', sub: '¿Qué debe saber hacer quien ingrese?',   items: prog.perfilIngreso.hacer, setState: setPriIngresoHacer },
    { label: '📘 SABER — Conocimientos previos', sub: '¿Qué debe conocer quien ingrese?',       items: prog.perfilIngreso.saber, setState: setPriIngresoSaber },
  ]
  const SECCIONES_EGRESO = [
    { label: '📘 SABER — Competencias técnicas',        sub: '¿Qué debe saber hacer profesionalmente?',   items: prog.perfilEgreso.saber, setState: setPriEgresoSaber },
    { label: '💡 SER — Valores profesionales',          sub: '¿Qué valores debe tener como profesional?', items: prog.perfilEgreso.ser,   setState: setPriEgresoSer   },
    { label: '⚡ HACER — Capacidades en el territorio', sub: '¿Qué debe poder hacer en el Catatumbo?',    items: prog.perfilEgreso.hacer, setState: setPriEgresoHacer },
  ]

  const ETIQUETAS = ['Conociendo el programa', 'Perfil de ingreso', 'Perfil de egreso', 'Lenguas']

  return (
    <div className="min-h-screen transition-all duration-700" style={{ background: prog.gradient }}>
      <div className="max-w-2xl mx-auto px-5 py-10">

        {/* Indicador */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-1.5">
            {programasOrden.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i === progIdx ? 32 : 8, background: i <= progIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)' }} />
            ))}
          </div>
          <span className="font-body text-xs" style={T.muted}>{prog.nombre} · {ETIQUETAS[subpaso]}</span>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-900/60 border border-red-400/40 rounded-2xl px-4 py-3 text-red-200 text-sm font-body">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ── MOMENTO 5: Socialización ─────────────────────────────────────── */}
        {subpaso === 0 && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <span className="text-5xl block mb-4">{prog.emoji}</span>
              <h2 className="font-display text-3xl font-black mb-2" style={T.principal}>{prog.nombre}</h2>
              <p className="font-body text-base leading-relaxed" style={T.sub}>{prog.descripcion}</p>
            </div>
            <Card>
              <p className="text-xs font-display font-bold uppercase tracking-widest mb-3" style={T.muted}>¿Qué aporta al Catatumbo?</p>
              {prog.beneficios.map((b, i) => (
                <div key={i} className="flex items-start gap-2 mb-2.5">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>✦</span>
                  <p className="font-body text-sm leading-relaxed" style={T.sub}>{b}</p>
                </div>
              ))}
            </Card>
            <Card>
              <p className="text-xs font-display font-bold uppercase tracking-widest mb-2" style={T.muted}>Pertinencia territorial</p>
              <p className="font-body text-sm leading-relaxed" style={T.sub}>{prog.justificacion}</p>
            </Card>
            <Card>
              <p className="font-display font-bold text-sm mb-3 text-white">¿Cómo imagina que este programa transformará el territorio?</p>
              <textarea rows={3} value={imaginaPrograma} onChange={e => setImaginaPrograma(e.target.value)}
                placeholder="Comparte tu visión..." style={T.textarea} />
            </Card>
            <button onClick={() => ir(1)} style={T.btnPrincipal} className="w-full py-4 rounded-2xl font-display font-bold text-lg transition-all">
              Validar perfil de ingreso →
            </button>
          </div>
        )}

        {/* ── MOMENTO 6: Perfil de ingreso ──────────────────────────────────── */}
        {subpaso === 1 && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <div style={T.badge} className="mb-4">
                <span>{prog.emoji}</span>
                <span className="font-body text-sm" style={T.sub}>Perfil de Ingreso</span>
              </div>
              <h2 className="font-display text-2xl font-black mb-2" style={T.principal}>¿Quién debería estudiar {prog.nombre}?</h2>
              <p className="font-body text-sm leading-relaxed" style={T.sub}>
                Toca o arrastra las competencias hacia "Mis Prioridades" para ordenarlas según su importancia.
              </p>
            </div>
            {SECCIONES_INGRESO.map(sec => (
              <Card key={sec.label}>
                <p className="font-display font-bold mb-1 text-white">{sec.label}</p>
                <p className="font-body text-xs mb-3" style={T.muted}>{sec.sub}</p>
                <DragDropCompetencias items={sec.items} onCambio={sec.setState} accentColor={prog.colorAccent} />
              </Card>
            ))}
            <Card>
              <p className="font-display font-bold text-sm mb-3 text-white">✏️ {prog.preguntaAbiertaIngreso}</p>
              <textarea rows={3} value={comIngreso} onChange={e => setComIngreso(e.target.value)}
                placeholder="Tu aporte es muy valioso para el territorio..." style={T.textarea} />
            </Card>
            <div className="flex gap-3">
              <button onClick={() => ir(0)} style={T.btnVolver} className="flex-1">← Volver</button>
              <button onClick={handleGuardarIngreso} disabled={guardando} style={T.btnPrincipal} className="flex-1">
                {guardando ? 'Guardando...' : 'Validar perfil de egreso →'}
              </button>
            </div>
          </div>
        )}

        {/* ── MOMENTO 7: Perfil de egreso ───────────────────────────────────── */}
        {subpaso === 2 && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <div style={T.badge} className="mb-4">
                <span>{prog.emoji}</span>
                <span className="font-body text-sm" style={T.sub}>Perfil de Egreso</span>
              </div>
              <h2 className="font-display text-2xl font-black mb-2" style={T.principal}>
                ¿Qué debería saber hacer un profesional de {prog.nombre}?
              </h2>
              <p className="font-body text-sm leading-relaxed" style={T.sub}>
                Prioriza las competencias más importantes para los egresados que trabajarán en el Catatumbo.
              </p>
            </div>
            {SECCIONES_EGRESO.map(sec => (
              <Card key={sec.label}>
                <p className="font-display font-bold mb-1 text-white">{sec.label}</p>
                <p className="font-body text-xs mb-3" style={T.muted}>{sec.sub}</p>
                <DragDropCompetencias items={sec.items} onCambio={sec.setState} accentColor={prog.colorAccent} />
              </Card>
            ))}
            <Card>
              <p className="font-display font-bold text-sm mb-3 text-white">
                ✏️ ¿Qué le gustaría que distinguiera a los profesionales egresados de{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{prog.nombre}</span>{' '}
                cuando trabajen en el Catatumbo?
              </p>
              <textarea rows={3} value={comEgreso} onChange={e => setComEgreso(e.target.value)}
                placeholder="Describe lo que distinguiría a un buen profesional del Catatumbo..." style={T.textarea} />
            </Card>
            <div className="flex gap-3">
              <button onClick={() => ir(1)} style={T.btnVolver} className="flex-1">← Volver</button>
              <button onClick={handleGuardarEgreso} disabled={guardando} style={T.btnPrincipal} className="flex-1">
                {guardando ? 'Guardando...'
                  : esUltimo
                    ? 'Reflexión final →'
                    : `Siguiente: ${PROGRAMAS.find(p => p.id === programasOrden[progIdx + 1])?.nombre} →`}
              </button>
            </div>
          </div>
        )}

        {/* ── LENGUAS ────────────────────────────────────────────────────────── */}
        {subpaso === 3 && (
          <div className="animate-fade-up">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-black mb-2" style={T.principal}>Una reflexión final sobre el territorio</h2>
              <p className="font-body text-sm leading-relaxed" style={T.sub}>
                Antes de continuar, queremos conocer tu perspectiva sobre las lenguas y la interculturalidad.
              </p>
            </div>
            <SeccionLenguas onGuardar={handleGuardarLenguas} txtMuted={T.muted} txtSub={T.sub} />
          </div>
        )}

      </div>
    </div>
  )
}