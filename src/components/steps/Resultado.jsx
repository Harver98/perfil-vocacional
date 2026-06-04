import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { PROGRAMAS } from '../../data/programas'

function AnimatedBar({ valor, color, delay = 0 }) {
  return (
    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ width: `${valor}%`, background: color, animation: `barGrow 1s ease-out ${delay}ms both` }}
      />
    </div>
  )
}

export default function Resultado({ resultado, programaId, onReiniciar, onFinalizar }) {
  const programa = PROGRAMAS.find(p => p.id === programaId)
  const { puntajeSer, puntajeHacer, puntajeSaber, afinidadTotal, dimensionDominante, insignia, fortalezas, mensaje } = resultado

  const radarData = [
    { subject: 'SER',   value: puntajeSer,   fullMark: 100 },
    { subject: 'HACER', value: puntajeHacer, fullMark: 100 },
    { subject: 'SABER', value: puntajeSaber, fullMark: 100 },
  ]

  const afinidadColor = afinidadTotal >= 80 ? '#3d7820' : afinidadTotal >= 60 ? '#1a6fa8' : '#c96a00'
  const afinidadLabel = afinidadTotal >= 80 ? '¡Alta afinidad!' : afinidadTotal >= 60 ? 'Buena afinidad' : 'Afinidad moderada'

  return (
    <div className="py-8 px-4">
      <style>{`@keyframes barGrow { from { width: 0 } }`}</style>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Sección 1 — Celebración con morado UIS-Catatumbo */}
        <div
          className="relative rounded-3xl p-8 text-center text-white overflow-hidden shadow-xl animate-scale-in"
          style={{ background: 'linear-gradient(135deg, #5b2d8e, #7b3fa8)' }}
        >
          <div className="absolute top-3 right-5 text-3xl opacity-40 select-none">✨</div>
          <div className="absolute bottom-3 left-5 text-2xl opacity-30 select-none">🎊</div>
          <div className="relative z-10">
            <p className="text-white/60 font-body text-xs mb-2 uppercase tracking-widest">Programa Catatumbo · UIS</p>
            <h2 className="font-display text-3xl font-black mb-1">🎉 Tu perfil ha sido descubierto</h2>
            <p className="text-white/75 font-body">{programa.nombre}</p>
          </div>
        </div>

        {/* Sección 2 — Dimensión dominante */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <p className="text-gray-400 font-body text-xs uppercase tracking-widest mb-3">Tu fortaleza principal</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-sm text-white shadow-md" style={{ background: programa.colorAccent }}>
              {dimensionDominante}
            </div>
            <div>
              <p className="font-display font-bold text-xl text-gray-900">
                {dimensionDominante === 'SER' ? '🧠 Ser' : dimensionDominante === 'HACER' ? '⚡ Hacer' : '📘 Saber'}
              </p>
              <p className="text-gray-500 font-body text-sm">
                {dimensionDominante === 'SER' ? 'Tus valores y actitudes son tu mayor fortaleza'
                 : dimensionDominante === 'HACER' ? 'La acción y la práctica son tu zona de poder'
                 : 'El conocimiento y el aprendizaje definen tu perfil'}
              </p>
            </div>
          </div>
        </div>

        {/* Sección 3 — Radar + Barras */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <p className="text-gray-400 font-body text-xs uppercase tracking-widest mb-5">Tu perfil de competencias</p>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Sora' }} />
                  <Radar dataKey="value" stroke={programa.colorAccent} fill={programa.colorAccent} fillOpacity={0.18} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {[
                { label: '💡 SER',   valor: puntajeSer,   color: '#7b3fa8' },
                { label: '⚡ HACER', valor: puntajeHacer, color: programa.colorAccent },
                { label: '📘 SABER', valor: puntajeSaber, color: '#1a6fa8' },
              ].map((dim, i) => (
                <div key={dim.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-display font-semibold text-sm text-gray-700">{dim.label}</span>
                    <span className="font-display font-bold text-sm text-gray-900">{dim.valor}%</span>
                  </div>
                  <AnimatedBar valor={dim.valor} color={dim.color} delay={i * 200} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección 4 — Afinidad */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fade-up" style={{ animationDelay: '350ms' }}>
          <p className="text-gray-400 font-body text-xs uppercase tracking-widest mb-4">
            Afinidad con {programa.nombre}
          </p>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke={programa.colorAccent} strokeWidth="8"
                  strokeDasharray={`${2.01 * afinidadTotal} ${201 - 2.01 * afinidadTotal}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-xl" style={{ color: programa.colorAccent }}>{afinidadTotal}%</span>
              </div>
            </div>
            <div>
              <p className="font-display font-bold text-lg mb-1" style={{ color: afinidadColor }}>{afinidadLabel}</p>
              <p className="text-gray-500 font-body text-sm leading-relaxed">
                Tu nivel de conexión con {programa.nombre} es notable. Hay coherencia clara entre tu perfil y este programa del territorio Catatumbo.
              </p>
            </div>
          </div>
        </div>

        {/* Sección 5 — Fortalezas */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fade-up" style={{ animationDelay: '450ms' }}>
          <p className="text-gray-400 font-body text-xs uppercase tracking-widest mb-4">Fortalezas detectadas</p>
          <div className="flex flex-wrap gap-2">
            {fortalezas.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 border px-4 py-2 rounded-full font-display font-semibold text-sm"
                style={{ background: programa.colorBg, color: programa.colorAccent, borderColor: programa.colorBorder }}
              >
                ✓ {f}
              </span>
            ))}
          </div>
        </div>

        {/* Sección 6 — Insignia */}
        <div
          className="rounded-3xl p-7 text-center text-white shadow-xl animate-fade-up"
          style={{ background: `linear-gradient(135deg, ${programa.colorAccent}, ${programa.colorAccent}bb)`, animationDelay: '550ms' }}
        >
          <div className="text-5xl mb-3">{programa.insigniaEmoji}</div>
          <p className="text-white/60 font-body text-xs uppercase tracking-widest mb-1">Tu insignia</p>
          <h3 className="font-display text-2xl font-black">{programa.insignia}</h3>
          <p className="text-white/60 font-body text-xs mt-2">Programa Catatumbo · UIS</p>
        </div>

        {/* Sección 7 — Mensaje */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fade-up" style={{ animationDelay: '650ms' }}>
          <p className="text-gray-400 font-body text-xs uppercase tracking-widest mb-3">Tu mensaje personalizado</p>
          <blockquote className="font-body text-gray-700 text-base leading-relaxed pl-4 border-l-4" style={{ borderColor: '#67B93E' }}>
            "{mensaje}"
          </blockquote>
        </div>

        {/* Logos institucionales al final */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: '700ms' }}>
          <div>
            <p className="font-body text-gray-400 text-xs">Ministerio de</p>
            <p className="font-display font-bold text-gray-700 text-xs">Educación Nacional</p>
            <div className="flex gap-0.5 mt-1">
              <div className="h-1 w-5 rounded-full bg-yellow-400" />
              <div className="h-1 w-3 rounded-full bg-blue-700" />
              <div className="h-1 w-3 rounded-full bg-red-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-300 font-body text-xs">Con Dignidad,</p>
            <p className="font-display font-bold text-xs" style={{ color: '#67B93E' }}>¡CUMPLIMOS!</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs text-white" style={{ background: '#67B93E' }}>UIS</div>
            <div>
              <p className="font-display font-bold text-gray-700 text-xs">Universidad</p>
              <p className="font-display font-bold text-gray-700 text-xs">Industrial de Santander</p>
            </div>
          </div>
        </div>

        {/* Botones finales */}
        <div className="grid grid-cols-2 gap-3 pb-8 animate-fade-up" style={{ animationDelay: '800ms' }}>
          <button
            onClick={onReiniciar}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-display font-semibold py-4 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            🔄 Volver a explorar
          </button>
          <button
            onClick={onFinalizar}
            className="flex items-center justify-center gap-2 font-display font-semibold py-4 rounded-2xl text-white transition-all duration-200"
            style={{ background: '#67B93E', boxShadow: '0 4px 16px rgba(103,185,62,0.35)' }}
          >
            🏠 Finalizar
          </button>
        </div>
      </div>
    </div>
  )
}
