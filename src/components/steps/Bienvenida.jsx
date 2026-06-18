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
    }, 7000)
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

      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(22,101,52,0.72) 0%, rgba(91,45,142,0.65) 50%, rgba(0,51,102,0.75) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="relative z-20 pt-4 px-4 sm:pt-6 sm:px-8">

        {/* Fila logos + lema */}
        <div className="flex items-center justify-between gap-2">

          {/* Logo MEN */}
          <div className="rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-xl flex items-center justify-center backdrop-blur-md border border-white/10 flex-shrink-0"
            style={{ background: 'rgba(31,16,51,0.92)', minWidth: 90, maxWidth: 160 }}>
            <img src="/LOGO_MIN.svg" alt="Ministerio de Educación Nacional"
              className="h-7 sm:h-10 w-auto object-contain scale-110 sm:scale-125" />
          </div>

          {/* Lema central — siempre visible */}
          <div className="flex flex-col items-center flex-1 mx-2 sm:mx-4">
            <span className="text-white/60 font-body text-xs sm:text-sm leading-tight">Con Dignidad,</span>
            <span className="font-display font-black text-xl sm:text-3xl tracking-wide leading-none"
              style={{ color: '#a8e063', textShadow: '0 2px 12px rgba(168,224,99,0.4)' }}>
              ¡CUMPLIMOS!
            </span>
          </div>

          {/* Logo UIS */}
          <div className="rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-xl flex items-center justify-center backdrop-blur-md border border-white/20 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.95)', minWidth: 90, maxWidth: 160 }}>
            <img src="/LOGO_UIS.svg" alt="Universidad Industrial de Santander"
              className="h-7 sm:h-10 w-auto object-contain scale-110 sm:scale-125"
              style={{ mixBlendMode: 'multiply' }} />
          </div>

        </div>
      </header>

      {/* ── CONTENIDO ──────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pt-8 pb-8 text-center">

        {/* Badge universidad */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <span className="text-base">🎓</span>
          <span className="font-display font-bold text-white/90 text-sm">Universidad Nacional del Catatumbo</span>
        </div>

        {/* Título */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight max-w-2xl"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          Tu voz ayuda a construir el{' '}
          <span style={{ color: '#a8e063' }}>futuro de la educación superior</span>
          {' '}en el Catatumbo.
        </h1>

        {/* Mensaje unificado de participación */}
        <div className="max-w-md w-full mb-8 rounded-2xl border border-white/20 backdrop-blur-sm px-5 py-4 text-left space-y-2"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <p className="font-display font-bold text-white text-sm mb-1">📋 Antes de comenzar</p>
          <p className="font-body text-white/80 text-sm leading-relaxed">
            Tu participación es muy importante para nosotros. El tiempo estimado para completar este recorrido es de <strong className="text-white">15 a 20 minutos</strong>. Tu información estará completamente protegida y será utilizada únicamente con fines académicos para fortalecer esta propuesta educativa territorial.
          </p>
        </div>

        {/* Frase motivadora */}
        <p className="font-display italic text-white/40 text-sm mb-8">"{MSG}"</p>

        {/* Botón */}
        <button onClick={handleComenzar}
          className={`group font-display font-black text-lg sm:text-xl px-10 sm:px-14 py-4 sm:py-5 rounded-2xl shadow-2xl transition-all duration-500 text-white ${entrando ? 'opacity-0 scale-95' : 'hover:-translate-y-1'}`}
          style={{ background: 'linear-gradient(135deg, #67B93E, #3d7820)', boxShadow: '0 8px 40px rgba(103,185,62,0.45)' }}>
          <span className="flex items-center gap-3">
            Iniciar recorrido
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </span>
        </button>

        <p className="mt-5 text-white/30 text-xs font-body">
          Trabajo Social · Ingeniería Agronómica · Administración de Empresas
        </p>
      </main>
    </div>
  )
}