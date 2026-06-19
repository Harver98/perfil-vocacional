import { useState, useEffect, useRef, useCallback } from 'react'

const CAPSULAS = [
  {
    id: 'por_que',
    titulo: '¿Por qué una oferta académica para el Catatumbo?',
    descripcion: 'La voz de la comunidad, profesores y estudiantes escuchadas en El Tarra, El Carmen, Hacarí, San Calixto, Convención, Teorama, Tibú y Sardinata, identificó que la educación superior es una herramienta para generar oportunidades y cerrar brechas de desarrollo en el territorio.',
    videoId: null,
    color: 'linear-gradient(160deg, rgb(22,101,52) 0%, rgb(34,139,34) 60%, rgb(16,185,129) 100%)',
    emoji: '🌿',
    fotoActividad: '/img_6.jpg',
    comentariosTaller: [
      "«Necesitamos carreras que se queden en la región para trabajar nuestra tierra»",
      "«La distancia y los costos hacían imposible que nuestros jóvenes estudiaran»"
    ],
  },
  {
    id: 'programas',
    titulo: '¿Qué programas se están proponiendo?',
    subtitulo: 'Tres caminos para transformar el territorio',
    descripcion: 'En este video presentamos los tres programas con que dará inicio la Universidad Nacional del Catatumbo.',
    videoId: 'YJ9aW-chNCw',
    color: 'linear-gradient(160deg, rgb(91,45,142) 0%, rgb(123,63,168) 60%, rgb(155,79,192) 100%)',
    emoji: '🎓',
    trivia: {
      pregunta: '¿Cuáles son los tres programas académicos propuestos para la Universidad Nacional del Catatumbo?',
      opciones: [
        { id: 'a', emoji: '🤝', label: 'Trabajo Social' },
        { id: 'b', emoji: '🌱', label: 'Ingeniería Agronómica' },
        { id: 'c', emoji: '📈', label: 'Administración de Empresas' },
        { id: 'd', emoji: '⚖️', label: 'Derecho' },
        { id: 'e', emoji: '👨‍🎓', label: 'Licenciatura en Literatura' },
      ],
      correctas: ['a', 'b', 'c'],
      mensajeError: '¡Casi! Los programas propuestos son Trabajo Social, Ingeniería Agronómica y Administración de Empresas. Selecciona exactamente esos tres para continuar.',
    },
  },
]

// Singleton YouTube API
let ytApiReady = false
let ytApiCallbacks = []

function cargarYouTubeAPI(cb) {
  if (ytApiReady) { cb(); return }
  ytApiCallbacks.push(cb)
  if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
  window.onYouTubeIframeAPIReady = () => {
    ytApiReady = true
    ytApiCallbacks.forEach(fn => fn())
    ytApiCallbacks = []
  }
}

function VideoPlayer({ videoId, onTerminado }) {
  const [progreso, setProgreso] = useState(0)
  const [listo,    setListo]    = useState(false)
  const [playerOK, setPlayerOK] = useState(false)
  const playerRef  = useRef(null)
  const divRef     = useRef(null)
  const intervalo  = useRef(null)

  const handleTerminado = useCallback(() => {
    if (!listo) { setListo(true); setProgreso(100); onTerminado?.() }
  }, [listo, onTerminado])

  useEffect(() => {
    if (!videoId) return
    setListo(false); setPlayerOK(false); setProgreso(0)

    const initPlayer = () => {
      if (!divRef.current) return
      if (playerRef.current?.destroy) { try { playerRef.current.destroy() } catch (_) {} }
      playerRef.current = new window.YT.Player(divRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, origin: window.location.origin, autoplay: 0 },
        events: {
          onReady: () => setPlayerOK(true),
          onStateChange: (e) => {
            if (e.data === 1) {
              clearInterval(intervalo.current)
              intervalo.current = setInterval(() => {
                try {
                  const cur = playerRef.current.getCurrentTime()
                  const dur = playerRef.current.getDuration()
                  if (dur > 0) {
                    const pct = Math.round((cur / dur) * 100)
                    setProgreso(Math.min(pct, 99))
                    if (pct >= 95) { clearInterval(intervalo.current); handleTerminado() }
                  }
                } catch (_) {}
              }, 1000)
            }
            if (e.data === 2) clearInterval(intervalo.current)
            if (e.data === 0) { clearInterval(intervalo.current); handleTerminado() }
          },
        },
      })
    }

    cargarYouTubeAPI(initPlayer)
    return () => clearInterval(intervalo.current)
  }, [videoId]) // eslint-disable-line

  return (
    <div className="mb-4">
      <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl" style={{ aspectRatio: '16/9' }}>
        <div ref={divRef} className="w-full h-full" />
        {!playerOK && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#ffffff33', borderTopColor: '#fff' }} />
          </div>
        )}
        {listo && (
          <div className="absolute top-3 right-3 z-10">
            <div className="rounded-xl px-3 py-1.5 text-sm font-display font-bold text-white" style={{ background: '#67B93E' }}>✅ Completado</div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-xs font-body text-white/50 mb-1">
          <span>{listo ? '✅ Video completado' : '▶ Mira el video completo'}</span>
          <span style={{ color: progreso > 0 ? '#a8e063' : undefined }}>{progreso}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progreso}%`, background: listo ? '#67B93E' : '#a8e063' }} />
        </div>
      </div>
    </div>
  )
}

// ── Trivia ────────────────────────────────────────────────────────────────────
function Trivia({ trivia, onResuelta }) {
  const [seleccionadas, setSeleccionadas] = useState([])
  const [error,         setError]         = useState(false)
  const [resuelta,      setResuelta]      = useState(false)

  const toggleOpcion = (id) => {
    if (resuelta) return
    setError(false)
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const verificar = () => {
    const correctas = trivia.correctas.slice().sort().join(',')
    const elegidas  = seleccionadas.slice().sort().join(',')
    if (elegidas === correctas) {
      setResuelta(true)
      setError(false)
      onResuelta()
    } else {
      setError(true)
    }
  }

  const puedeVerificar = seleccionadas.length === trivia.correctas.length

  return (
    <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)' }}>
      <div className="px-5 py-4 border-b border-white/10">
        <p className="text-xs font-display font-bold uppercase tracking-widest text-white/50 mb-1">🧩 Trivia</p>
        <p className="font-display font-bold text-white text-sm leading-snug">{trivia.pregunta}</p>
        <p className="text-white/40 text-xs mt-1">Selecciona los 3 programas correctos</p>
      </div>

      <div className="p-4 space-y-2">
        {trivia.opciones.map(op => {
          const sel      = seleccionadas.includes(op.id)
          const esCorrecta = trivia.correctas.includes(op.id)
          const mostrarOk  = resuelta && esCorrecta

          return (
            <button key={op.id} onClick={() => toggleOpcion(op.id)}
              disabled={resuelta}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left"
              style={{
                background: mostrarOk
                  ? 'rgba(103,185,62,0.25)'
                  : sel
                    ? 'rgba(255,255,255,0.18)'
                    : 'rgba(255,255,255,0.06)',
                borderColor: mostrarOk
                  ? '#67B93E'
                  : sel
                    ? 'rgba(255,255,255,0.6)'
                    : 'rgba(255,255,255,0.15)',
                cursor: resuelta ? 'default' : 'pointer',
              }}>
              <span className="text-xl flex-shrink-0">{op.emoji}</span>
              <span className="font-body text-white text-sm font-medium flex-1">{op.label}</span>
              {mostrarOk && <span className="text-green-400 font-bold text-sm">✓</span>}
              {sel && !resuelta && <span className="text-white/60 font-bold text-sm">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-3 px-4 py-3 rounded-xl text-sm font-body"
          style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5' }}>
          ⚠️ {trivia.mensajeError}
        </div>
      )}

      {/* Éxito */}
      {resuelta && (
        <div className="mx-4 mb-4 px-4 py-3 rounded-xl text-sm font-body font-bold"
          style={{ background: 'rgba(103,185,62,0.2)', border: '1px solid rgba(103,185,62,0.4)', color: '#a8e063' }}>
          🎉 ¡Correcto! Ya conoces los programas propuestos para el Catatumbo.
        </div>
      )}

      {/* Botón verificar */}
      {!resuelta && (
        <div className="px-4 pb-4">
          <button onClick={verificar} disabled={!puedeVerificar}
            className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all"
            style={puedeVerificar
              ? { background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', color: 'white', cursor: 'pointer' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}>
            {puedeVerificar ? 'Verificar respuesta →' : `Selecciona ${trivia.correctas.length - seleccionadas.length} más`}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Capsula principal ─────────────────────────────────────────────────────────
export default function Capsula({ onContinuar, registrarVideoVisto }) {
  const [indice,       setIndice]       = useState(0)
  const capsula = CAPSULAS[indice]
  const [videoListo,   setVideoListo]   = useState(!capsula.videoId)
  const [triviaLista,  setTriviaLista]  = useState(!capsula.trivia)
  const esUltima = indice === CAPSULAS.length - 1

  useEffect(() => {
    setVideoListo(!capsula.videoId)
    setTriviaLista(!capsula.trivia)
  }, [indice, capsula.videoId, capsula.trivia])

  const handleVideoTerminado = useCallback(() => {
    setVideoListo(true)
    registrarVideoVisto?.(capsula.videoId || capsula.id, capsula.id)
  }, [capsula, registrarVideoVisto])

  // Solo puede continuar si tanto el video como la trivia están listos
  const puedeConntinuar = videoListo && triviaLista

  const handleSiguiente = () => {
    if (esUltima) onContinuar()
    else setIndice(i => i + 1)
  }

  const textBoton = () => {
    if (!videoListo) return 'Mira el video completo para continuar'
    if (!triviaLista) return 'Responde la trivia para continuar'
    if (esUltima) return 'Comenzar mi participación →'
    return 'Entendido, Siguiente cápsula →'
  }

  return (
    <div className="min-h-screen transition-colors duration-1000" style={{ background: capsula.color }}>
      <div className="max-w-2xl mx-auto px-5 py-10">

        {/* Indicador */}
        <div className="flex items-center gap-3 mb-7">
          <div className="flex gap-1.5">
            {CAPSULAS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i === indice ? 32 : 8, background: i <= indice ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          <span className="text-white/50 font-body text-xs">Cápsula {indice + 1} de {CAPSULAS.length}</span>
        </div>

        {/* Título */}
        <div className="mb-6">
          <span className="text-5xl block mb-4">{capsula.emoji}</span>
          <h2 className="font-display text-3xl font-black text-white leading-tight mb-2">{capsula.titulo}</h2>
        </div>

        {/* Descripción */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6">
          <p className="font-body text-white/85 leading-relaxed text-sm sm:text-base">{capsula.descripcion}</p>
        </div>

        {/* Cápsula 1: foto + comentarios */}
        {!capsula.videoId && (
          <div className="space-y-4 mb-6">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 h-52 bg-black/20">
              <img src={capsula.fotoActividad} alt="Talleres de Socialización" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              {capsula.comentariosTaller?.map((comentario, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border-l-4 border-[#a8e063] rounded-r-xl p-3 text-white/90 italic font-body text-sm">
                  {comentario}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cápsula 2: video */}
        {capsula.videoId && (
          <VideoPlayer videoId={capsula.videoId} onTerminado={handleVideoTerminado} />
        )}

        {/* Trivia — aparece después del video */}
        {capsula.trivia && (
          <Trivia trivia={capsula.trivia} onResuelta={() => setTriviaLista(true)} />
        )}


        {/* Botón continuar */}
        <button
          onClick={handleSiguiente}
          disabled={!puedeConntinuar}
          className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all duration-300 shadow-lg"
          style={puedeConntinuar
            ? { background: 'linear-gradient(135deg, #67B93E, #3d7820)', boxShadow: '0 8px 30px rgba(103,185,62,0.3)', cursor: 'pointer' }
            : { background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' }
          }>
          {textBoton()}
        </button>
      </div>
    </div>
  )
}