import { useEffect, useState } from 'react'

export default function HeaderUIS() {
  const [fechaActual, setFechaActual] = useState('')

  useEffect(() => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' }
    setFechaActual(new Date().toLocaleDateString('es-CO', opciones))
  }, [])

  return (
    <header className="w-full bg-slate-900/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Extremo Izquierdo: Logo UIS (Carga segura desde /public) */}
        <div className="flex items-center gap-3">
          <img 
            src="/LOGO_UIS.svg" 
            alt="Logo Universidad Industrial de Santander" 
            className="h-12 w-auto object-contain select-none"
            onError={(e) => {
              // Fallback sutil por si el SVG tuviera problemas
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <div className="hidden md:block">
            <p className="text-white font-display font-black text-xs uppercase tracking-wider leading-none">UIS</p>
            <p className="text-white/40 font-body text-[10px] uppercase tracking-widest mt-0.5">Sede Regional</p>
          </div>
        </div>

        {/* Centro: Título de la Iniciativa */}
        <div className="text-center hidden sm:block">
          <h1 className="text-white font-display font-black text-sm tracking-wide uppercase">
            Perfil Vocacional y Empleabilidad
          </h1>
          <p className="text-[#67B93E] font-body text-xs font-bold uppercase tracking-widest mt-0.5">
            Universidad del Catatumbo
          </p>
        </div>

        {/* Extremo Derecho: Logo Institucional MIN y Fecha */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-white/40 font-body text-[10px] uppercase tracking-wider">Fecha de consulta</p>
            <p className="text-white/80 font-display font-bold text-xs uppercase mt-0.5">{fechaActual}</p>
          </div>
          
          <div className="w-px h-8 bg-white/15 hidden lg:block" />

          <img 
            src="/LOGO_MIN.svg" 
            alt="Logo Institucional" 
            className="h-12 w-auto object-contain select-none"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
        </div>

      </div>
    </header>
  )
}