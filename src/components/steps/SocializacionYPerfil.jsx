import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { PROGRAMAS } from '../../data/programas'

// ── Características de lectura del perfil de ingreso por programa ───────────
const PERFIL_INGRESO_INFO = {
  agronomia: {
    caracteristicas: [
      { emoji: '🌱', titulo: 'Gusto por el campo', descripcion: 'Interés real por la naturaleza, la producción agrícola y el trabajo al aire libre (no le teme a embarrarse las botas).' },
      { emoji: '🔬', titulo: 'Curiosidad científica', descripcion: 'Afinidad básica por entender cómo funcionan las plantas, el suelo y los microorganismos (biología y química básica).' },
      { emoji: '💡', titulo: 'Ganas de innovar', descripcion: 'Interés por aprender a usar tecnologías o métodos nuevos para mejorar los cultivos de la región.' },
    ],
    facilidades: [
      'Implementar un programa intensivo de nivelación en matemáticas, química y biología para quienes vienen del campo con vacíos en estas materias.',
      'Diseñar actividades de campo e investigación en fincas de la región desde el primer semestre para mantener alta la motivación de quienes tienen vocación práctica.',
      'Brindar tutorías personalizadas que enseñen cómo aplicar la ciencia y la tecnología directamente a los cultivos tradicionales de la zona.',
      'Nivelar y fortalecer desde el inicio las habilidades en lectura crítica y análisis de datos.',
      'Recibir curso de nivelación de inglés.',
    ],
  },
  administracion: {
    caracteristicas: [
      { emoji: '🚀', titulo: 'Liderazgo y proactividad', descripcion: 'Iniciativa propia; es el tipo de persona que propone ideas, organiza a otros y busca soluciones en lugar de esperar órdenes.' },
      { emoji: '📊', titulo: 'Pensamiento organizado', descripcion: 'Gusto por la planeación, el orden y una capacidad básica para entender números, datos y presupuestos.' },
      { emoji: '🏗️', titulo: 'Visión de negocio o proyecto', descripcion: 'Interés por crear, gestionar o hacer crecer proyectos, empresas o asociaciones comunitarias.' },
    ],
    facilidades: [
      'Nivelar y fortalecer desde el inicio las habilidades en lectura crítica, análisis de datos y presupuestos, que suelen ser el mayor obstáculo técnico.',
      'Permitirles crear y gestionar proyectos reales, empresas locales o cooperativas desde los primeros ciclos para aprovechar su liderazgo práctico.',
      'Ofrecer talleres de gestión del tiempo, planeación y herramientas digitales para estructurar su pensamiento organizado.',
      'Implementar horarios flexibles o tutorías de apoyo para que quienes ya tienen un emprendimiento o trabajan en la región no se vean obligados a desertar.',
      'Recibir curso de nivelación de inglés.',
    ],
  },
  trabajo_social: {
    caracteristicas: [
      { emoji: '🤝', titulo: 'Empatía y sensibilidad humana', descripcion: 'Capacidad de ponerse en los zapatos del otro y una preocupación genuina por los problemas de los demás y de su comunidad.' },
      { emoji: '👂', titulo: 'Saber escuchar', descripcion: 'Disposición para dialogar con todo tipo de personas, sin juzgar y buscando entender sus realidades.' },
      { emoji: '🕊️', titulo: 'Vocación de mediador', descripcion: 'Interés por ayudar a resolver conflictos y por motivar a los grupos a trabajar juntos por un bien común.' },
    ],
    facilidades: [
      'Brindar talleres de manejo emocional y apoyo psicológico.',
      'Enseñar técnicas prácticas de mediación, diálogo de saberes y resolución de conflictos desde los primeros meses para canalizar su vocación comunitaria.',
      'Fortalecer la capacidad de análisis crítico y lectura del entorno para ayudarles a pasar de una visión asistencial (dar ayudas) a una transformación social real.',
      'Realizar prácticas de observación comunitaria tempranas para asegurar que su interés por las poblaciones vulnerables se conecte rápidamente con el ejercicio profesional.',
      'Recibir curso de nivelación de inglés.',
    ],
  },
}

// ── Fotos de los talleres de socialización, repartidas en el flujo ──────────
const FOTOS_TALLERES = [
  { src: '/taller-jovenes-cartelera.jpg',     alt: 'Estudiantes construyendo una cartelera participativa sobre el territorio' },
  { src: '/taller-salon-completo.jpg',        alt: 'Socialización del programa Catatumbo con estudiantes' },
  { src: '/taller-mesa-comunidad.jpg',        alt: 'Mesa de trabajo con líderes comunitarios del territorio' },
  { src: '/taller-mesa-funcionarios.jpg',     alt: 'Mesa de trabajo con priorización de ideas en notas adhesivas' },
  { src: '/taller-mesa-casa-justicia.jpg',    alt: 'Socialización con la Casa de Justicia y Convivencia Ciudadana' },
]

function FotoTaller({ index, caption }) {
  const foto = FOTOS_TALLERES[index % FOTOS_TALLERES.length]
  return (
    <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
      <img
        src={foto.src}
        alt={foto.alt}
        loading="lazy"
        className="w-full object-cover h-40 sm:h-48 md:h-56 lg:h-64"
      />
      {caption && (
        <div className="px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <p className="font-body text-xs text-white/60 leading-snug">{caption}</p>
        </div>
      )}
    </div>
  )
}

// ── Subpaso 1: Lectura interactiva del perfil de ingreso ─────────────────────
function PerfilIngresoLectura({ programaId, prog, onEntendido, T }) {
  const info = PERFIL_INGRESO_INFO[programaId]
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (!info || visible >= info.caracteristicas.length) return
    const t = setTimeout(() => setVisible(v => v + 1), 450)
    return () => clearTimeout(t)
  }, [visible, info])

  if (!info) return null

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <div style={T.badge} className="mb-4">
          <span>{prog.emoji}</span>
          <span className="font-body text-sm" style={T.sub}>Perfil de Ingreso</span>
        </div>
        <h2 className="font-display text-2xl font-black mb-2" style={T.principal}>
          Una persona que quiere estudiar <span className="text-green-400">{prog.nombre}</span>, requiere…
        </h2>
        <p className="font-body text-sm leading-relaxed" style={T.sub}>
          Lee con atención las características que describen a alguien preparado para este camino.
        </p>
      </div>
      <div className="space-y-3">
        {info.caracteristicas.map((c, i) => (
          <div key={i} className="rounded-2xl p-5 transition-all duration-500"
            style={{
              background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              opacity: i < visible ? 1 : 0,
              transform: i < visible ? 'translateY(0)' : 'translateY(16px)',
            }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{ background: 'rgba(255,255,255,0.08)' }}>{c.emoji}</div>
              <div>
                <p className="font-display font-bold text-white text-sm mb-1">{c.titulo}</p>
                <p className="font-body text-sm leading-relaxed" style={T.sub}>{c.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visible >= info.caracteristicas.length && (
        <div className="pt-2 animate-fade-up">
          <div className="rounded-2xl px-5 py-4 mb-4 text-center"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <p className="font-body text-sm text-green-400 font-medium">
              ¡Tu participación construye esta universidad!
            </p>
          </div>
          <button onClick={onEntendido} className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all" style={T.btnPrincipal}>
            ✅ Entendido, continuar →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Subpaso 2: Ordenar facilidades al ingreso ────────────────────────────────
function OrdenarFacilidades({ programaId, prog, onGuardar, guardando, T }) {
  const info = PERFIL_INGRESO_INFO[programaId]
  const [orden, setOrden] = useState(info?.facilidades ?? [])
  const [dragging, setDrag] = useState(null)
  const [sobre, setSobre]   = useState(null)

  const moverArriba = (i) => {
    if (i === 0) return
    const n = [...orden]; [n[i-1], n[i]] = [n[i], n[i-1]]; setOrden(n)
  }
  const moverAbajo = (i) => {
    if (i === orden.length - 1) return
    const n = [...orden]; [n[i], n[i+1]] = [n[i+1], n[i]]; setOrden(n)
  }
  const onDragStart = (i) => setDrag(i)
  const onDragOver  = (e, i) => { e.preventDefault(); setSobre(i) }
  const onDrop      = (i) => {
    if (dragging === null || dragging === i) { setDrag(null); setSobre(null); return }
    const n = [...orden]; const [item] = n.splice(dragging, 1); n.splice(i, 0, item)
    setOrden(n); setDrag(null); setSobre(null)
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <div style={T.badge} className="mb-4">
          <span>{prog.emoji}</span>
          <span className="font-body text-sm" style={T.sub}>Facilidades al ingreso</span>
        </div>
        <h2 className="font-display text-2xl font-black mb-2" style={T.principal}>
          ¿Qué debería facilitar la Universidad al inicio de <span className="text-green-400">{prog.nombre}</span>?
        </h2>
        <p className="font-body text-sm leading-relaxed" style={T.sub}>
          Ordena según consideres más importante. Arrastra o usa las flechas.
        </p>
      </div>
      <div className="space-y-2">
        {orden.map((item, i) => (
          <div key={item} draggable
            onDragStart={() => onDragStart(i)} onDragOver={e => onDragOver(e, i)}
            onDrop={() => onDrop(i)} onDragEnd={() => { setDrag(null); setSobre(null) }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-150 cursor-grab active:cursor-grabbing"
            style={{
              background: sobre === i ? 'rgba(74,222,128,0.15)' : 'rgba(15,23,42,0.4)',
              border: sobre === i ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)', opacity: dragging === i ? 0.4 : 1,
            }}>
            <span className="font-display font-black text-white/30 text-sm w-5 flex-shrink-0">{i + 1}</span>
            <p className="font-body text-sm text-white/90 flex-1 leading-snug">{item}</p>
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <button onClick={() => moverArriba(i)} disabled={i === 0}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all"
                style={{ background: i === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.1)', color: i === 0 ? 'rgba(255,255,255,0.15)' : 'white' }}>↑</button>
              <button onClick={() => moverAbajo(i)} disabled={i === orden.length - 1}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all"
                style={{ background: i === orden.length-1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.1)', color: i === orden.length-1 ? 'rgba(255,255,255,0.15)' : 'white' }}>↓</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onGuardar(orden)} disabled={guardando}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all" style={T.btnPrincipal}>
        {guardando ? 'Guardando...' : 'Continuar →'}
      </button>
    </div>
  )
}

// ── Pantalla genérica de priorización de egreso (reutilizada para parte A y B) ──
// `categoria` indica qué subconjunto mostrar ('saber' | 'ser'), pero NUNCA se muestra ese texto en pantalla.
function OrdenarPerfilEgresoParte({ prog, categoria, tituloVisible, subtituloVisible, fotoIndex, fotoCaption, onSiguiente, guardando, T, esUltimaParte, comentario, onComentarioChange }) {
  const itemsCategoria = (prog.perfilEgreso || []).filter(i => i.categoria === categoria).map(i => i.texto)
  const [opciones,    setOpciones]    = useState(itemsCategoria)
  const [prioridades, setPrioridades] = useState([])
  const [dragging,    setDragging]    = useState(null)
  const [fromCol,     setFromCol]     = useState(null)

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
    <div draggable onDragStart={() => startDrag(item, col)} onDragEnd={() => setDragging(null)}
      onClick={() => moverA(item, col === 'ops' ? 'pri' : 'ops')}
      className="rounded-xl px-3 py-2.5 text-xs font-body border cursor-pointer active:scale-95 transition-all duration-150 select-none leading-snug"
      style={{ opacity: dragging === item ? 0.4 : 1, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)', color: '#ffffff', fontWeight: 500 }}>
      {item}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <div style={T.badge} className="mb-4">
          <span>{prog.emoji}</span>
          <span className="font-body text-sm" style={T.sub}>Perfil de Egreso</span>
        </div>
        <h2 className="font-display text-2xl font-black mb-2" style={T.principal}>
          {tituloVisible} <span className="text-green-400">{prog.nombre}</span>
        </h2>
        <p className="font-body text-sm leading-relaxed" style={T.sub}>{subtituloVisible}</p>
      </div>

      {fotoIndex !== undefined && <FotoTaller index={fotoIndex} caption={fotoCaption} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div onDragOver={e => e.preventDefault()} onDrop={() => dropEn('ops')}
          className="min-h-40 rounded-2xl border-2 border-dashed p-3"
          style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-xs font-display font-bold mb-1 uppercase tracking-wide text-white">OPCIONES</p>
          <p className="text-xs mb-2 text-white/40">toca para priorizar</p>
          <div className="flex flex-col gap-1.5">
            {opciones.map(i => <Chip key={i} item={i} col="ops" />)}
            {opciones.length === 0 && <p className="text-xs py-3 w-full text-center text-white/30">Todas priorizadas ✓</p>}
          </div>
        </div>
        <div onDragOver={e => e.preventDefault()} onDrop={() => dropEn('pri')}
          className="min-h-40 rounded-2xl border-2 border-dashed p-3"
          style={{ borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.04)' }}>
          <p className="text-xs font-display font-bold mb-2 uppercase tracking-wide text-white">MIS PRIORIDADES</p>
          <div className="flex flex-col gap-1.5">
            {prioridades.map((i, idx) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-display font-black w-4 text-center flex-shrink-0 text-white/50 mt-2.5">{idx + 1}</span>
                <div className="flex-1"><Chip item={i} col="pri" /></div>
              </div>
            ))}
            {prioridades.length === 0 && <p className="text-xs text-center py-4 leading-snug text-white/30">← Toca o arrastra para priorizar</p>}
          </div>
        </div>
      </div>

      {esUltimaParte && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="font-display font-bold text-sm mb-3 text-white">✏️ {prog.preguntaAbiertaEgreso}</p>
          <textarea rows={4} value={comentario} onChange={e => onComentarioChange(e.target.value)}
            placeholder="Tu aporte es muy valioso para el territorio..." style={T.textarea} />
        </div>
      )}

      <button onClick={() => onSiguiente(prioridades)} disabled={guardando}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all" style={T.btnPrincipal}>
        {guardando ? 'Guardando...' : 'Siguiente →'}
      </button>
    </div>
  )
}

// ── ¿Cómo vamos? + perfil egreso completo ─────────────────────────────────────
function ComoVamos({ programaId, prog, onContinuar, T, siguienteLabel }) {
  const [datos, setDatos] = useState({ municipio: '—', programa: '—', total: 0 })
  const [mostrarPerfil, setMostrarPerfil] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const { data: parts } = await supabase.from('participantes').select('municipio').eq('completado', true)
      const { data: progs } = await supabase.from('programas_orden').select('programa').eq('orden', 1)
      if (parts?.length) {
        const cMun = {}
        parts.forEach(p => { if (p.municipio) cMun[p.municipio] = (cMun[p.municipio] || 0) + 1 })
        const topMun = Object.entries(cMun).sort((a,b) => b[1]-a[1])[0]?.[0] || '—'
        const PROG_LABEL = { trabajo_social: 'Trabajo Social', agronomia: 'Ing. Agronómica', administracion: 'Adm. Empresas' }
        const cProg = {}
        progs?.forEach(p => { if (p.programa) cProg[p.programa] = (cProg[p.programa] || 0) + 1 })
        const topProg = PROG_LABEL[Object.entries(cProg).sort((a,b) => b[1]-a[1])[0]?.[0]] || '—'
        setDatos({ municipio: topMun, programa: topProg, total: parts.length })
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    cargar()
    const canal = supabase.channel('como-vamos-' + programaId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participantes' }, cargar)
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [cargar, programaId])

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="text-center">
        <span className="text-4xl block mb-3">📊</span>
        <h2 className="font-display text-2xl font-black text-white mb-1">¿Cómo vamos?</h2>
        <p className="font-body text-sm" style={T.muted}>Lo que está construyendo la comunidad</p>
      </div>

      <FotoTaller index={1} caption="Estudiantes y comunidad participando en los talleres de socialización del Catatumbo." />

      <div className="grid grid-cols-1 gap-3">
        {[
          { label: '👥 Participantes completados', value: datos.total },
          { label: '📍 Municipio más participativo', value: datos.municipio },
          { label: '🎓 Programa de mayor interés', value: datos.programa },
        ].map((d, i) => (
          <div key={i} className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-display font-bold uppercase tracking-widest mb-2" style={T.muted}>{d.label}</p>
            <p className="font-display font-black text-3xl text-white">{d.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => setMostrarPerfil(m => !m)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          style={{ borderBottom: mostrarPerfil ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
          <div>
            <p className="font-display font-bold text-white text-sm">
              Con tu apoyo hemos construido el perfil de egreso para <span className="text-green-400">{prog.nombre}</span>
            </p>
            <p className="font-body text-xs mt-0.5" style={T.muted}>Toca para ver el perfil completo</p>
          </div>
          <span className="text-white/40 text-lg ml-3">{mostrarPerfil ? '▲' : '▼'}</span>
        </button>
        {mostrarPerfil && (
          <div className="px-5 py-4 bg-black/20">
            <p className="font-body text-sm leading-relaxed whitespace-pre-line" style={T.sub}>
              {prog.perfilEgresoTexto}
            </p>
          </div>
        )}
      </div>
      <button onClick={onContinuar} className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all" style={T.btnPrincipal}>
        {siguienteLabel}
      </button>
    </div>
  )
}

// ── Lenguas (importancia) + Cultura Barí ──────────────────────────────────────
function SeccionLenguas({ onGuardar, txtMuted, T }) {
  const [importanciaLenguas, setImportanciaLenguas] = useState('')
  const [conocimientoBari,   setConocimientoBari]   = useState(5)
  const [deseaConocer,       setDeseaConocer]       = useState(null)
  const [comoConocer,        setComoConocer]        = useState('')

  const puedeGuardar = importanciaLenguas !== '' && deseaConocer !== null

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <span className="text-3xl">🌐</span>
        <div>
          <p className="font-display font-bold text-white text-base">Lenguas e Interculturalidad</p>
          <p className="font-body text-xs" style={txtMuted}>Una reflexión sobre la formación universitaria en el Catatumbo</p>
        </div>
      </div>

      <FotoTaller index={2} caption="Mesas de trabajo con líderes comunitarios y autoridades del territorio." />

      {/* Pregunta de importancia de lengua */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-display font-bold text-white text-sm mb-3 leading-snug">
          ¿Qué tan importante considera que los estudiantes y futuros profesionales de la Universidad Nacional del Catatumbo desarrollen competencias en una segunda lengua o en lenguas propias del territorio (como la lengua del pueblo Barí) para su formación y ejercicio profesional?
        </p>
        <p className="font-body text-xs mb-4" style={txtMuted}>Seleccione una opción</p>
        <div className="space-y-2">
          {['Muy importante', 'Importante', 'Medianamente importante', 'Poco importante', 'Nada importante'].map(op => (
            <button key={op} onClick={() => setImportanciaLenguas(op)}
              className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 flex items-center gap-3"
              style={importanciaLenguas === op
                ? { background: 'rgba(74,222,128,0.22)', border: '2px solid rgba(74,222,128,0.6)', color: '#ffffff' }
                : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)' }}>
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: importanciaLenguas === op ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>
                {importanciaLenguas === op && <div className="w-2 h-2 rounded-full bg-green-400" />}
              </div>
              <span className="font-body text-sm leading-snug">{op}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Barra 0-10 conocimiento Barí */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-display font-bold text-white text-sm mb-4 leading-snug">
          ¿Qué tanto conoce la región sobre la cultura Barí?
        </p>
        <div className="flex items-center gap-4 mb-2">
          <span className="font-body text-xs" style={txtMuted}>0</span>
          <input type="range" min="0" max="10" step="1" value={conocimientoBari}
            onChange={e => setConocimientoBari(parseInt(e.target.value))}
            className="flex-1 accent-green-400" />
          <span className="font-body text-xs" style={txtMuted}>10</span>
        </div>
        <div className="text-center">
          <span className="font-display font-black text-4xl text-white">{conocimientoBari}</span>
          <span className="font-body text-sm ml-2" style={txtMuted}>/ 10</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-body text-xs" style={txtMuted}>Muy poco</span>
          <span className="font-body text-xs" style={txtMuted}>Mucho</span>
        </div>
      </div>

      {/* Sí/No conocer más */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-display font-bold text-white text-sm mb-4 leading-snug">
          ¿Te gustaría que los estudiantes de la Universidad Nacional del Catatumbo conocieran más de la cultura Barí?
        </p>
        <div className="flex gap-3 mb-4">
          {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(op => (
            <button key={String(op.v)} onClick={() => setDeseaConocer(op.v)}
              className="flex-1 py-3 rounded-2xl border-2 font-display font-bold transition-all"
              style={deseaConocer === op.v
                ? { background: 'rgba(74,222,128,0.8)', borderColor: '#4ade80', color: 'white' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
              {op.l}
            </button>
          ))}
        </div>
        {deseaConocer === true && (
          <div>
            <p className="font-body text-xs mb-2" style={txtMuted}>¿Cómo? (breve explicación)</p>
            <textarea rows={2} value={comoConocer} onChange={e => setComoConocer(e.target.value)}
              placeholder="Describe cómo podría la universidad acercar a los estudiantes a la cultura Barí..."
              style={{
                width: '100%', background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
                padding: '10px 14px', color: '#ffffff',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                resize: 'none', outline: 'none', lineHeight: 1.6,
              }} />
          </div>
        )}
      </div>

      <button
        onClick={() => onGuardar({ importanciaLenguas, conocimientoBari, deseaConocer, comoConocer })}
        disabled={!puedeGuardar}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
        style={puedeGuardar
          ? { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }
          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}>
        {puedeGuardar ? 'Continuar →' : 'Responde todas las preguntas para continuar'}
      </button>
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {children}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function SocializacionYPerfil({ programasOrden, onGuardarIngreso, onGuardarEgreso, guardando }) {
  const [progIdx,  setProgIdx]  = useState(0)
  // 0=socialización 1=ingreso lectura 2=facilidades 3=egreso parteA 4=egreso parteB 5=cómo vamos 6=lenguas
  const [subpaso,  setSubpaso]  = useState(0)
  const [errorMsg, setErrorMsg] = useState(null)

  const [imaginaPrograma, setImaginaPrograma] = useState('')
  const [comEgreso,       setComEgreso]       = useState('')

  // Acumula prioridades de ambas partes del egreso antes de guardar en BD
  const egresoAcumuladoRef = useRef({ parteA: [], parteB: [] })
  const egresoGuardadoRef  = useRef(null)

  const programaId = programasOrden[progIdx]
  const prog       = PROGRAMAS.find(p => p.id === programaId)
  const esUltimo   = progIdx === programasOrden.length - 1

  const resetSubpaso = () => {
    setSubpaso(0); setErrorMsg(null)
    setImaginaPrograma(''); setComEgreso('')
    egresoAcumuladoRef.current = { parteA: [], parteB: [] }
    egresoGuardadoRef.current = null
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const ir = (paso) => { setErrorMsg(null); setSubpaso(paso); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleEntendidoIngreso = () => ir(2)

  const handleGuardarFacilidades = async (ordenFacilidades) => {
    try {
      await onGuardarIngreso({
        programa:          programaId,
        prioridades:       ordenFacilidades.map((f, i) => ({ categoria: 'facilidad', competencia: f, orden: i + 1 })),
        comentario:        null,
        visionTerritorial: imaginaPrograma,
      })
      ir(3)
    } catch (e) { setErrorMsg('Error al guardar. Intenta de nuevo.') }
  }

  // Parte A del egreso (categoría 'saber') → guarda en memoria y avanza a parte B
  const handleSiguienteParteA = (prioridadesSaber) => {
    egresoAcumuladoRef.current.parteA = prioridadesSaber.map((c, i) => ({ competencia: c, orden: i + 1, categoria: 'saber' }))
    ir(4)
  }

  // Parte B del egreso (categoría 'ser') → guarda en memoria junto con comentario, avanza a ¿cómo vamos?
  const handleSiguienteParteB = (prioridadesSer) => {
    egresoAcumuladoRef.current.parteB = prioridadesSer.map((c, i) => ({ competencia: c, orden: i + 1, categoria: 'ser' }))
    egresoGuardadoRef.current = {
      programa: programaId,
      prioridades: [...egresoAcumuladoRef.current.parteA, ...egresoAcumuladoRef.current.parteB],
      comentario: comEgreso,
    }
    ir(5)
  }

  const handleDespuesComoVamos = () => ir(6)

  const handleGuardarLenguas = async (datosLenguas) => {
    if (!egresoGuardadoRef.current) return
    try {
      await onGuardarEgreso({
        ...egresoGuardadoRef.current,
        importancia_lengua: datosLenguas.importanciaLenguas || 'Sin especificar',
        conocimiento_bari:  datosLenguas.conocimientoBari,
        desea_conocer_bari: datosLenguas.deseaConocer,
        como_conocer_bari:  datosLenguas.comoConocer || null,
      })
      if (!esUltimo) { setProgIdx(i => i + 1); resetSubpaso() }
      else resetSubpaso()
    } catch (e) { setErrorMsg('Error al guardar. Intenta de nuevo.') }
  }

  if (!prog) return null

  const T = {
    principal: { color: '#ffffff' },
    sub:       { color: 'rgba(255,255,255,0.85)' },
    muted:     { color: 'rgba(255,255,255,0.5)' },
    textarea: {
      width: '100%', background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
      padding: '12px 16px', color: '#ffffff',
      fontFamily: 'DM Sans, sans-serif', fontSize: 14,
      resize: 'none', outline: 'none', lineHeight: 1.6,
    },
    btnVolver:    { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', borderRadius: 16, padding: '14px 20px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' },
    btnPrincipal: { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', borderRadius: 16, padding: '14px 20px', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer' },
    badge:        { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: 8 },
  }

  const ETIQUETAS = ['Conociendo el programa', 'Perfil de ingreso', 'Facilidades', 'Perfil de egreso (1/2)', 'Perfil de egreso (2/2)', '¿Cómo vamos?', 'Lenguas']

  return (
    <div className="min-h-screen transition-all duration-700" style={{ background: prog.gradient }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-5 py-10">

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
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Contenedor glassmorphism */}
        <div className="rounded-3xl p-5 sm:p-8 shadow-2xl"
          style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* S0: Socialización */}
          {subpaso === 0 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <span className="text-5xl block mb-4">{prog.emoji}</span>
                <h2 className="font-display text-3xl font-black mb-2" style={T.principal}>{prog.nombre}</h2>
                <p className="font-body text-base leading-relaxed" style={T.sub}>{prog.descripcion}</p>
              </div>

              <FotoTaller index={0} caption="Jóvenes del Catatumbo construyendo colectivamente su visión del territorio." />

              <Card>
                <p className="text-xs font-display font-bold uppercase tracking-widest mb-3" style={T.muted}>¿Qué aporta al Catatumbo?</p>
                {prog.beneficios.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2.5">
                    <span className="mt-0.5 flex-shrink-0 text-green-400">✦</span>
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
              <button onClick={() => ir(1)} className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all" style={T.btnPrincipal}>
                Ver perfil de ingreso →
              </button>
            </div>
          )}

          {/* S1: Perfil ingreso lectura */}
          {subpaso === 1 && (
            <PerfilIngresoLectura programaId={programaId} prog={prog} onEntendido={handleEntendidoIngreso} T={T} />
          )}

          {/* S2: Facilidades */}
          {subpaso === 2 && (
            <OrdenarFacilidades programaId={programaId} prog={prog} onGuardar={handleGuardarFacilidades} guardando={guardando} T={T} />
          )}

          {/* S3: Perfil de egreso — PARTE A (categoría 'saber', sin mostrar la etiqueta) */}
          {subpaso === 3 && (
            <OrdenarPerfilEgresoParte
              prog={prog}
              categoria="saber"
              tituloVisible="¿Qué debería poder comprender y analizar un profesional de"
              subtituloVisible="Toca o arrastra las afirmaciones hacia 'Mis Prioridades' para ordenarlas según su importancia."
              fotoIndex={3}
              fotoCaption="Priorización colectiva de ideas durante las jornadas de socialización."
              onSiguiente={handleSiguienteParteA}
              guardando={guardando}
              T={T}
              esUltimaParte={false}
            />
          )}

          {/* S4: Perfil de egreso — PARTE B (categoría 'ser', sin mostrar la etiqueta) + pregunta abierta */}
          {subpaso === 4 && (
            <OrdenarPerfilEgresoParte
              prog={prog}
              categoria="ser"
              tituloVisible="¿Qué valores y actitudes debería tener un profesional de"
              subtituloVisible="Ahora prioriza estas afirmaciones según su importancia para el territorio."
              onSiguiente={handleSiguienteParteB}
              guardando={guardando}
              T={T}
              esUltimaParte={true}
              comentario={comEgreso}
              onComentarioChange={setComEgreso}
            />
          )}

          {/* S5: ¿Cómo vamos? */}
          {subpaso === 5 && (
            <ComoVamos
              programaId={programaId}
              prog={prog}
              onContinuar={handleDespuesComoVamos}
              T={T}
              siguienteLabel={esUltimo ? 'Ir a la reflexión final →' : 'Siguiente programa →'}
            />
          )}

          {/* S6: Lenguas / cultura Barí */}
          {subpaso === 6 && (
            <SeccionLenguas onGuardar={handleGuardarLenguas} txtMuted={T.muted} T={T} />
          )}

          {/* Botón atrás — solo en subpasos donde tiene sentido */}
          {[2, 3, 4, 6].includes(subpaso) && (
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => ir(subpaso - 1)} style={T.btnVolver}>← Atrás</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}