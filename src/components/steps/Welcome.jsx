export default function Welcome({ onComenzar }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #5b2d8e 0%, #7b3fa8 40%, #9b4fc0 70%, #6a2f9a 100%)' }}>

      {/* Patrón decorativo de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: '#67B93E', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#67B93E', filter: 'blur(60px)' }} />
        {/* Círculos decorativos sutiles */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full opacity-30" style={{ background: '#67B93E' }} />
        <div className="absolute top-1/3 left-1/5 w-2 h-2 rounded-full opacity-20" style={{ background: '#fff' }} />
        <div className="absolute bottom-1/4 right-1/3 w-4 h-4 rounded-full opacity-20" style={{ background: '#67B93E' }} />
      </div>

      {/* Header institucional */}
      <header className="relative z-10 px-6 pt-8 pb-4 flex items-center justify-between">
        {/* Logo Ministerio de Educación */}
        <div className="flex flex-col items-start">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
            <p className="text-white/60 font-body text-xs leading-tight">Ministerio de</p>
            <p className="text-white font-display font-bold text-xs leading-tight">Educación Nacional</p>
            <div className="mt-1 flex gap-0.5">
              <div className="h-1 w-6 rounded-full" style={{ background: '#FFD700' }} />
              <div className="h-1 w-4 rounded-full" style={{ background: '#003893' }} />
              <div className="h-1 w-4 rounded-full" style={{ background: '#CF0821' }} />
            </div>
          </div>
        </div>

        {/* Logo UIS */}
        <div className="flex flex-col items-center">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20 flex items-center gap-2.5">
            {/* Escudo UIS simplificado */}
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-black text-sm border-2" style={{ background: '#67B93E', borderColor: '#4f9a2b', color: 'white' }}>
              UIS
            </div>
            <div>
              <p className="text-white font-display font-bold text-xs leading-tight">Universidad</p>
              <p className="text-white font-display font-bold text-xs leading-tight">Industrial de</p>
              <p className="text-white font-display font-bold text-xs leading-tight">Santander</p>
            </div>
          </div>
        </div>
      </header>

      {/* Lema institucional */}
      <div className="relative z-10 px-6 py-3 flex justify-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
          <span className="text-sm" style={{ color: '#67B93E' }}>✓</span>
          <span className="font-body text-white/90 text-sm">Con Dignidad,</span>
          <span className="font-display font-bold text-sm" style={{ color: '#a8e063' }}>¡CUMPLIMOS!</span>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">

        {/* Badge programa */}
        <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6 font-display font-bold text-sm border-2" style={{ background: '#67B93E', borderColor: '#4f9a2b', color: 'white' }}>
          🎯 Programa Catatumbo
        </div>

        {/* Título principal */}
        <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3 leading-tight max-w-lg">
          Descubre qué tan{' '}
          <span className="relative">
            <span style={{ color: '#a8e063' }}>conectado estás</span>
            <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 200 4">
              <path d="M0 2 Q100 0 200 2" stroke="#67B93E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
          {' '}con este programa
        </h1>

        <p className="font-body text-white/75 text-lg mb-4 leading-relaxed max-w-md">
          Tres programas que transforman el territorio del Catatumbo.
        </p>

        {/* Tres programas preview */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {[
            { emoji: '🤝', label: 'Trabajo Social' },
            { emoji: '🌱', label: 'Ing. Agroindustrial' },
            { emoji: '📈', label: 'Adm. Empresas' },
          ].map(p => (
            <span key={p.label} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-white/80 font-body text-xs">
              {p.emoji} {p.label}
            </span>
          ))}
        </div>

        {/* Tiempo estimado */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2.5 text-white/70 font-body text-sm mb-8">
          ⏱️ Tiempo estimado: 3 minutos
        </div>

        {/* Botón CTA */}
        <button
          onClick={onComenzar}
          className="group relative font-display font-black text-lg px-12 py-4 rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
          style={{ background: '#67B93E', color: 'white', boxShadow: '0 8px 32px rgba(103,185,62,0.4)' }}
        >
          <span className="flex items-center gap-3">
            Comenzar mi descubrimiento
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </span>
        </button>

        <p className="mt-6 text-white/35 text-xs font-body">
          🔒 Experiencia completamente anónima · Sin datos personales
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 pb-6 text-center">
        <p className="text-white/30 text-xs font-body">
          © Universidad Industrial de Santander · Programa Catatumbo
        </p>
      </footer>
    </div>
  )
}
