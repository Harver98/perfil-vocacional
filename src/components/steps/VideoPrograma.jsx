import { useState, useEffect, useRef } from 'react'
import { PROGRAMAS } from '../../data/programas'

export default function VideoPrograma({ programaId, onContinuar }) {
  const [videoListo, setVideoListo]     = useState(false)
  const [progreso, setProgreso]         = useState(0)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [playerReady, setPlayerReady]   = useState(false)
  const playerRef  = useRef(null)
  const divRef     = useRef(null)
  const intervaloRef = useRef(null)
  const programa   = PROGRAMAS.find(p => p.id === programaId)

  // Extraer el ID del video de la URL
  const getVideoId = (url) => {
    const match = url.match(/embed\/([^?]+)/)
    return match ? match[1] : null
  }
  const videoId = getVideoId(programa.videoUrl)

  useEffect(() => {
    // Cargar el script de YouTube IFrame API una sola vez
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }

    // Cuando la API esté lista, crear el player
    const initPlayer = () => {
      if (!divRef.current || !videoId) return
      playerRef.current = new window.YT.Player(divRef.current, {
        videoId,
        playerVars: {
          rel:            0,
          modestbranding: 1,
          origin:         window.location.origin,
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (e) => {
            // 1 = reproduciendo, 2 = pausado, 0 = terminado
            if (e.data === window.YT.PlayerState.PLAYING) {
              setReproduciendo(true)
            }
            if (e.data === window.YT.PlayerState.PAUSED) {
              setReproduciendo(false)
            }
            if (e.data === window.YT.PlayerState.ENDED) {
              setReproduciendo(false)
              setProgreso(100)
              setVideoListo(true)
              clearInterval(intervaloRef.current)
            }
          },
        },
      })
    }

    // Si YT ya estaba cargado, iniciar directo
    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      // Esperar a que la API llame a onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      clearInterval(intervaloRef.current)
      if (playerRef.current?.destroy) playerRef.current.destroy()
    }
  }, [videoId])

  // Polling de progreso cada segundo mientras reproduce
  useEffect(() => {
    if (reproduciendo && playerRef.current) {
      intervaloRef.current = setInterval(() => {
        try {
          const current  = playerRef.current.getCurrentTime()
          const duration = playerRef.current.getDuration()
          if (duration > 0) {
            const pct = Math.round((current / duration) * 100)
            setProgreso(Math.min(pct, 99))
            if (pct >= 95) {
              setVideoListo(true)
              clearInterval(intervaloRef.current)
            }
          }
        } catch {}
      }, 1000)
    } else {
      clearInterval(intervaloRef.current)
    }
    return () => clearInterval(intervaloRef.current)
  }, [reproduciendo])

  return (
    <div className="flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full animate-fade-up">

        {/* Badge del programa */}
        <div className="flex justify-center mb-5">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-display font-semibold text-white"
            style={{ background: programa.colorAccent }}
          >
            {programa.emoji} {programa.nombre}
          </div>
        </div>

        <div className="text-center mb-5">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Conoce el programa</h2>
          <p className="text-gray-500 font-body text-sm">
            {videoListo
              ? '¡Listo! Ya puedes continuar'
              : 'Mira el video completo para continuar · Programa Catatumbo UIS'}
          </p>
        </div>

        {/* Contenedor del player de YouTube */}
        <div
          className="relative rounded-2xl overflow-hidden bg-black shadow-xl mb-4 border border-gray-200"
          style={{ aspectRatio: '16/9' }}
        >
          {/* YouTube monta el iframe aquí */}
          <div ref={divRef} className="w-full h-full" />

          {/* Overlay cuando está listo */}
          {videoListo && (
            <div className="absolute top-3 right-3 pointer-events-none">
              <div
                className="rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg text-sm font-display font-bold"
                style={{ background: '#67B93E', color: 'white' }}
              >
                ✅ Completado
              </div>
            </div>
          )}

          {/* Spinner mientras carga el player */}
          {!playerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div
                className="w-10 h-10 border-4 rounded-full animate-spin"
                style={{ borderColor: '#67B93E33', borderTopColor: '#67B93E' }}
              />
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-body text-gray-400">
              {videoListo
                ? '✅ Video completado'
                : reproduciendo
                ? '▶ Reproduciendo...'
                : progreso > 0
                ? '⏸ En pausa'
                : '▶ Dale play para comenzar'}
            </span>
            <span
              className="text-xs font-display font-bold"
              style={{ color: progreso > 0 ? programa.colorAccent : '#9ca3af' }}
            >
              {progreso}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progreso}%`,
                background: videoListo ? '#67B93E' : programa.colorAccent,
              }}
            />
          </div>
        </div>

        {/* Botón continuar */}
        <button
          onClick={onContinuar}
          disabled={!videoListo}
          className="w-full py-4 rounded-2xl font-display font-bold text-lg transition-all duration-500 text-white"
          style={
            videoListo
              ? {
                  background: `linear-gradient(135deg, ${programa.colorAccent}, ${programa.colorAccent}cc)`,
                  boxShadow: `0 4px 20px ${programa.colorAccent}40`,
                }
              : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
          }
        >
          {videoListo ? 'Descubrir mi perfil →' : 'Mira el video para continuar'}
        </button>
      </div>
    </div>
  )
}
