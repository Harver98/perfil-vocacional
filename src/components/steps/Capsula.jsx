import { useState, useEffect, useRef } from 'react'

const CAPSULAS = [
  {
    id: 'por_que',
    titulo: '¿Por qué una oferta académica para el Catatumbo?',
    subtitulo: 'Resultados de la primera fase de socialización',
    descripcion: 'A partir de los talleres realizados con la comunidad, profesores y estudiantes en la primera fase, identificamos las profundas brechas de acceso a la educación superior y las oportunidades urgentes de desarrollo regional en nuestro territorio.',
    // La cápsula 1 NO lleva videoId para activar el modo "Resultados de Talleres"
    videoId: null, 
    color: 'linear-gradient(160deg, rgb(22,101,52) 0%, rgb(34,139,34) 60%, rgb(16,185,129) 100%)',
    emoji: '🌿',
    // Datos específicos para la Cápsula 1
    fotoActividad: '/territorio-rio2.jpg', // ← Asegúrate de que esta ruta o tu foto exista en /public
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
    videoId: 'YJ9aW-chNCw', // ← Aquí pones el ID de YouTube cuando subas el video de Drive
    color: 'linear-gradient(160deg, rgb(91,45,142) 0%, rgb(123,63,168) 60%, rgb(155,79,192) 100%)',
    emoji: '🎓',
    stats: [
      { valor: '🤝', label: 'Trabajo Social' },
      { valor: '🌱', label: 'Ing. Agronómica' },
      { valor: '📈', label: 'Adm. Empresas' },
    ],
  },
]

function VideoPlayer({ videoId, onTerminado, registrar }) {
  const [progreso,  setProgreso]  = useState(0)
  const [listo,     setListo]     = useState(false)
  const [playerOK,  setPlayerOK]  = useState(false)
  const playerRef  = useRef(null)
  const divRef     = useRef(null)
  const intervalo  = useRef(null)

  useEffect(() => {
    if (!videoId) return

    setListo(false)
    setPlayerOK(false)
    setProgreso(0)

    const initPlayer = () => {
      if (!divRef.current) return

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy() } catch(e) {}
      }

      playerRef.current = new window.YT.Player(divRef.current, {
        videoId: videoId,
        playerVars: { 
          rel: 0, 
          modestbranding: 1, 
          origin: window.location.origin,
          autoplay: 0 
        },
        events: {
          onReady: () => setPlayerOK(true),
          onStateChange: (e) => {
            if (e.data === 1) { // playing
              intervalo.current = setInterval(() => {
                try {
                  const cur = playerRef.current.getCurrentTime()
                  const dur = playerRef.current.getDuration()
                  if (dur > 0) {
                    const pct = Math.round((cur / dur) * 100)
                    setProgreso(Math.min(pct, 99))
                    if (pct >= 95) { 
                      setListo(true)
                      onTerminado?.()
                      clearInterval(intervalo.current) 
                    }
                  }
                } catch {}
              }, 1000)
            }
            if (e.data === 2) clearInterval(intervalo.current)
            if (e.data === 0) { // ended
              setListo(true)
              setProgreso(100)
              clearInterval(intervalo.current)
              if (registrar) registrar()
              onTerminado?.()
            }
          },
        },
      })
    }

    if (!window.YT) {
      const yaExisteScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (!yaExisteScript) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
      
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkReady)
          initPlayer()
        }
      }, 100)
      
      window.onYouTubeIframeAPIReady = () => {
        clearInterval(checkReady)
        initPlayer()
      }
    } else if (window.YT.Player) {
      initPlayer()
    }

    return () => { clearInterval(intervalo.current) }
  }, [videoId])

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
  // Si la cápsula actual NO tiene video, se marca automáticamente como "lista" para poder continuar
  const capsula = CAPSULAS[indice]
  const [videoListo, setVideoListo] = useState(!capsula.videoId)
  const esUltima = indice === CAPSULAS.length - 1

  // Efecto para actualizar la disponibilidad del botón al cambiar de cápsula
  useEffect(() => {
    setVideoListo(!capsula.videoId)
  }, [indice, capsula.videoId])

  const handleVideoTerminado = () => {
    setVideoListo(true)
    registrarVideoVisto?.(capsula.videoId || capsula.id, capsula.id)
  }

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

        {/* Indicador de cápsula */}
        <div className="flex items-center gap-3 mb-7">
          <div className="flex gap-1.5">
            {CAPSULAS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i === indice ? 32 : 8, background: i <= indice ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          <span className="text-white/50 font-body text-xs">Cápsula {indice + 1} de {CAPSULAS.length}</span>
        </div>

        {/* Emoji y título */}
        <div className="mb-6">
          <span className="text-5xl block mb-4">{capsula.emoji}</span>
          <h2 className="font-display text-3xl font-black text-white leading-tight mb-2">{capsula.titulo}</h2>
          <p className="text-white/70 font-body text-base">{capsula.subtitulo}</p>
        </div>

        {/* Renderizado Condicional: DINÁMICA CÁPSULA 1 (Foto y Comentarios) */}
        {!capsula.videoId && (
          <div className="space-y-4 mb-6">
            {/* Foto de los talleres */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 h-52 bg-black/20">
              <img src={capsula.fotoActividad} alt="Talleres de Socialización" className="w-full h-full object-cover" />
            </div>
            {/* Comentarios expuestos */}
            <div className="space-y-2">
              {capsula.comentariosTaller?.map((comentario, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border-l-4 border-[#a8e063] rounded-r-xl p-3 text-white/90 italic font-body text-sm">
                  {comentario}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Renderizado Condicional: DINÁMICA CÁPSULA 2 (Reproductor de Video) */}
        {capsula.videoId && (
          <VideoPlayer
            videoId={capsula.videoId}
            onTerminado={handleVideoTerminado}
            registrar={handleVideoTerminado}
          />
        )}

        {/* Stats dinámicas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {capsula.stats.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center flex flex-col justify-center">
              <p className="font-display font-black text-xl sm:text-2xl text-white mb-1">{s.valor}</p>
              <p className="font-body text-white/60 text-xs leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Descripción */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6">
          <p className="font-body text-white/85 leading-relaxed text-sm sm:text-base">{capsula.descripcion}</p>
        </div>

        {/* Botón continuar inteligente */}
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