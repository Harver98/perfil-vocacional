import { useState, useEffect, useRef, useCallback } from 'react'

const CAPSULAS = [
  {
    id: 'por_que',
    titulo: '¿Por qué una oferta académica para el Catatumbo?',
    subtitulo: 'Resultados de la primera fase de socialización',
    descripcion: 'A partir de los talleres realizados con la comunidad, profesores y estudiantes en la primera fase, identificamos las profundas brechas de acceso a la educación superior y las oportunidades urgentes de desarrollo regional en nuestro territorio.',
    videoId: null,
    color: 'linear-gradient(160deg, rgb(22,101,52) 0%, rgb(34,139,34) 60%, rgb(16,185,129) 100%)',
    emoji: '🌿',
    fotoActividad: '/territorio-rio2.jpg',
    comentariosTaller: [
      "«Necesitamos carreras que se queden en la región para trabajar nuestra tierra»",
      "«La distancia y los costos hacían imposible que nuestros jóvenes estudiaran»"
    ],
    stats: [
      { valor: '📍 Enfoque', label: 'Basado en talleres comunitarios' },
      { valor: '👥 Voces', label: 'Comunidad, profes y estudiantes' },
    ]
  },
  {
    id: 'programas',
    titulo: '¿Qué programas se están proponiendo?',
    subtitulo: 'Tres caminos para transformar el territorio',
    descripcion: 'Presentamos de manera sencilla los programas académicos en validación. Mira y escucha el video realizado por el equipo donde se exponen sintéticamente los perfiles de la futura oferta.',
    videoId: 'YJ9aW-chNCw',
    color: 'linear-gradient(160deg, rgb(91,45,142) 0%, rgb(123,63,168) 60%, rgb(155,79,192) 100%)',
    emoji: '🎓',
    stats: [
      { valor: '🤝', label: 'Trabajo Social' },
      { valor: '🌱', label: 'Ingeniería Agronómica' },
      { valor: '📈', label: 'Administración de Empresas' },
    ],
  },
]

// Singleton para garantizar que la API de YouTube se carga una sola vez
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
  const [listo, setListo] = useState(false)
  const [playerOK, setPlayerOK] = useState(false)
  const playerRef = useRef(null)
  const divRef = useRef(null)
  const intervalo = useRef(null)

  const handleTerminado = useCallback(() => {
    if (!listo) {
      setListo(true)
      setProgreso(100)
      onTerminado?.()
    }
  }, [listo, onTerminado])

  useEffect(() => {
    if (!videoId) return

    setListo(false)
    setPlayerOK(false)
    setProgreso(0)

    const initPlayer = () => {
      if (!divRef.current) return
      if (playerRef.current?.destroy) {
        try { playerRef.current.destroy() } catch (_) {}
      }

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
                    if (pct >= 95) {
                      clearInterval(intervalo.current)
                      handleTerminado()
                    }
                  }
                } catch (_) {}
              }, 1000)
            }
            if (e.data === 2) clearInterval(intervalo.current)
            if (e.data === 0) {
              clearInterval(intervalo.current)
              handleTerminado()
            }
          },
        },
      })
    }

    cargarYouTubeAPI(initPlayer)
    return () => clearInterval(intervalo.current)
  }, [videoId]) // eslint-disable-line react-hooks/exhaustive-deps

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

export default function Capsula({ onContinuar, registrarVideoVisto }) {
  const [indice, setIndice] = useState(0)
  const capsula = CAPSULAS[indice]
  const [videoListo, setVideoListo] = useState(!capsula.videoId)
  const esUltima = indice === CAPSULAS.length - 1

  useEffect(() => {
    setVideoListo(!capsula.videoId)
  }, [indice, capsula.videoId])

  const handleVideoTerminado = useCallback(() => {
    setVideoListo(true)
    registrarVideoVisto?.(capsula.videoId || capsula.id, capsula.id)
  }, [capsula, registrarVideoVisto])

  const handleSiguiente = () => {
    if (esUltima) {
      onContinuar()
    } else {
      setIndice(i => i + 1)
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-1000" style={{ background: capsula.color }}>
      <div className="max-w-2xl mx-auto px-5 py-10">

        <div className="flex items-center gap-3 mb-7">
          <div className="flex gap-1.5">
            {CAPSULAS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i === indice ? 32 : 8, background: i <= indice ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          <span className="text-white/50 font-body text-xs">Cápsula {indice + 1} de {CAPSULAS.length}</span>
        </div>

        <div className="mb-6">
          <span className="text-5xl block mb-4">{capsula.emoji}</span>
          <h2 className="font-display text-3xl font-black text-white leading-tight mb-2">{capsula.titulo}</h2>
          <p className="text-white/70 font-body text-base">{capsula.subtitulo}</p>
        </div>

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

        {capsula.videoId && (
          <VideoPlayer
            videoId={capsula.videoId}
            onTerminado={handleVideoTerminado}
          />
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {capsula.stats.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center flex flex-col justify-center">
              <p className="font-display font-black text-xl sm:text-2xl text-white mb-1">{s.valor}</p>
              <p className="font-body text-white/60 text-xs leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6">
          <p className="font-body text-white/85 leading-relaxed text-sm sm:text-base">{capsula.descripcion}</p>
        </div>

        <button
          onClick={handleSiguiente}
          disabled={!videoListo}
          className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all duration-300 shadow-lg"
          style={videoListo
            ? { background: 'linear-gradient(135deg, #67B93E, #3d7820)', boxShadow: '0 8px 30px rgba(103,185,62,0.3)', cursor: 'pointer' }
            : { background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed' }
          }
        >
          {videoListo
            ? esUltima ? 'Comenzar mi participación →' : 'Entendido, Siguiente cápsula →'
            : 'Mira el video completo para continuar'}
        </button>
      </div>
    </div>
  )
}
