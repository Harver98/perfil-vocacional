import { useState, useEffect } from 'react'
import { MENSAJES_MOTIVADORES } from '../../data/catatumbo'

const MSG = MENSAJES_MOTIVADORES[Math.floor(Math.random() * MENSAJES_MOTIVADORES.length)]

const IMAGENES_FONDO = [
  '/territorio-rio1.jpg',
  '/territorio-mural.jpg',
  '/territorio-montanas.jpg',
  '/territorio-pueblo.jpg',
]

export default function Bienvenida({ onComenzar }) {
  const [imgActual, setImgActual] = useState(0)
  const [entrando,  setEntrando]  = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setImgActual(i => (i + 1) % IMAGENES_FONDO.length)
    }, 7000) // Cambia cada 7 segundos

    return () => clearInterval(t)
  }, [])

  const handleComenzar = () => { 
    setEntrando(true)
    setTimeout(onComenzar, 600) 
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">

      {/* Imágenes rotativas */}
      {IMAGENES_FONDO.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{ opacity: i === imgActual ? 1 : 0 }}>
          <img src={src} alt="Territorio Catatumbo" className="w-full h-full object-cover"
            style={{ objectPosition: src.includes('mural') ? 'center 40%' : 'center center' }} />
        </div>
      ))}

      {/* Overlay 3 capas para eliminar destellos */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(22,101,52,0.72) 0%, rgba(91,45,142,0.65) 50%, rgba(0,51,102,0.75) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

      {/* ── Header con Contraste y Zoom Optimizado ─────────────────────────────────── */}
      <header className="relative z-20 pt-6 px-8 flex items-center justify-between">

        {/* Logo MEN - Fondo oscuro para contrastar el SVG Blanco + Zoom interno */}
        <div
          className="rounded-2xl px-4 py-3 shadow-xl flex items-center justify-center backdrop-blur-md border border-white/10"
          style={{
            background: 'rgba(31, 16, 51, 0.92)', // Morado noche profundo
            minWidth: 140,
            maxWidth: 190,
            overflow: 'hidden'
          }}
        >
          <img
            src="/LOGO_MIN.svg"
            alt="Ministerio de Educación Nacional"
            className="h-10 w-auto object-contain transform scale-125 transition-transform duration-300"
          />
        </div>

        {/* Lema central */}
        <div className="hidden md:flex flex-col items-center flex-1 mx-4">
          <span className="text-white/60 font-body text-xs">
            Con Dignidad,
          </span>
          <span
            className="font-display font-extrabold text-2xl tracking-wide leading-none"
            style={{ color: '#a8e063' }}
          >
            ¡CUMPLIMOS!
          </span>
        </div>

        {/* Logo UIS - Fondo claro para contrastar el logo oscuro + Zoom interno */}
        <div
          className="rounded-2xl px-4 py-3 shadow-xl flex items-center justify-center backdrop-blur-md border border-white/20"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            minWidth: 140,
            maxWidth: 190,
            overflow: 'hidden'
          }}
        >
          <img
            src="/LOGO_UIS.svg"
            alt="Universidad Industrial de Santander"
            className="h-10 w-auto object-contain transform scale-125 transition-transform duration-300"
            style={{
              mixBlendMode: 'multiply'
            }}
          />
        </div>

      </header>

      {/* Contenido — pt-20 asegura el espacio y aire correcto debajo del lema */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-20 md:pt-12 pb-8 text-center">

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm rounded-full px-5 py-2 mb-7">
          <span className="text-base">🌿</span>
          <span className="font-display font-bold text-white/90 text-sm">Territorio Catatumbo</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="font-body text-white/70 text-xs">Norte de Santander</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-5 leading-tight max-w-2xl"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          Tu voz ayuda a construir el{' '}
          <span style={{ color: '#a8e063' }}>futuro de la educación superior</span>
          {' '}en el Catatumbo.
        </h1>

        <p className="font-body text-white/80 text-lg mb-8 max-w-xl leading-relaxed"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
          Participa en la socialización y validación de los programas académicos de la
          futura <strong className="text-white">Universidad Nacional del Catatumbo</strong>.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { emoji: '🎯', text: 'Tu participación importa' },
            { emoji: '⏱️', text: '15–20 minutos' },
            { emoji: '🔒', text: 'Información protegida' },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span>{item.emoji}</span>
              <span className="font-body text-white/85 text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        <p className="font-display italic text-white/45 text-sm mb-8">"{MSG}"</p>

        <button onClick={handleComenzar}
          className={`group font-display font-black text-xl px-14 py-5 rounded-2xl shadow-2xl transition-all duration-500 text-white ${entrando ? 'opacity-0 scale-95' : 'hover:-translate-y-1'}`}
          style={{ background: 'linear-gradient(135deg, #67B93E, #3d7820)', boxShadow: '0 8px 40px rgba(103,185,62,0.45)' }}>
          <span className="flex items-center gap-3">
            Iniciar recorrido
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </span>
        </button>

        <p className="mt-6 text-white/30 text-xs font-body">
          Trabajo Social · Ingeniería Agronómica · Administración de Empresas
        </p>
      </main>
    </div>
  )
}