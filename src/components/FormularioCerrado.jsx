export default function FormularioCerrado() {
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">

      <div className="absolute inset-0">
        <img src="/territorio-mural.jpg" alt="Territorio Catatumbo" className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }} />
      </div>

      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(22,101,52,0.75) 0%, rgba(91,45,142,0.68) 50%, rgba(0,51,102,0.78) 100%)' }} />

      <header className="relative z-20 pt-4 px-4 sm:pt-6 sm:px-8">
        <div className="flex items-center justify-between gap-2">
          <div className="rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-xl flex items-center justify-center backdrop-blur-md border border-white/10 flex-shrink-0"
            style={{ background: 'rgba(31,16,51,0.92)', minWidth: 90, maxWidth: 160 }}>
            <img src="/LOGO_MIN.svg" alt="Ministerio de Educación Nacional"
              className="h-7 sm:h-10 w-auto object-contain scale-110 sm:scale-125" />
          </div>

          <div className="flex flex-col items-center flex-1 mx-2 sm:mx-4">
            <span className="text-white/60 font-body text-xs sm:text-sm leading-tight">Con Dignidad,</span>
            <span className="font-display font-black text-xl sm:text-3xl tracking-wide leading-none"
              style={{ color: '#a8e063', textShadow: '0 2px 12px rgba(168,224,99,0.4)' }}>
              ¡CUMPLIMOS!
            </span>
          </div>

          <div className="rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-xl flex items-center justify-center backdrop-blur-md border border-white/20 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.95)', minWidth: 90, maxWidth: 160 }}>
            <img src="/LOGO_UIS.svg" alt="Universidad Industrial de Santander"
              className="h-7 sm:h-10 w-auto object-contain scale-110 sm:scale-125"
              style={{ mixBlendMode: 'multiply' }} />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8 text-center">

        <div className="text-6xl sm:text-7xl mb-6">🙏</div>

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <span className="text-base">🎓</span>
          <span className="font-display font-bold text-white/90 text-sm">Universidad Nacional del Catatumbo</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-black text-white mb-5 leading-tight max-w-2xl"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          Este formulario ha{' '}
          <span style={{ color: '#a8e063' }}>cerrado</span>
        </h1>

        <div className="max-w-md w-full mb-6 rounded-2xl border border-white/20 backdrop-blur-sm px-6 py-5"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <p className="font-body text-white/85 text-base leading-relaxed">
            Gracias por tu interés en participar en la construcción de la futura
            Universidad Nacional del Catatumbo. El periodo de recolección de
            aportes para esta encuesta ha finalizado.
          </p>
        </div>

        <p className="font-body text-white/60 text-sm max-w-md leading-relaxed mb-2">
          Tu voz y la de cada participante serán sistematizadas como insumo
          fundamental para fortalecer una propuesta académica pertinente,
          incluyente y territorializada para el Catatumbo.
        </p>

        <p className="font-display italic text-white/40 text-sm mt-6">
          "La educación transforma territorios, fortalece comunidades y construye futuro."
        </p>

        <p className="mt-8 text-white/30 text-xs font-body">
          Trabajo Social · Ingeniería Agronómica · Administración de Empresas
        </p>
      </main>
    </div>
  )
}