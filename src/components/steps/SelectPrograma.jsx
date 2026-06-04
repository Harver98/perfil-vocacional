import { useState } from 'react'
import { PROGRAMAS } from '../../data/programas'

export default function SelectPrograma({ onSeleccionar }) {
  const [seleccionado, setSeleccionado] = useState(null)
  const [confirmado, setConfirmado] = useState(false)

  const handleSeleccionar = (programaId) => {
    setSeleccionado(programaId)
    setTimeout(() => {
      setConfirmado(true)
      setTimeout(() => onSeleccionar(programaId), 1800)
    }, 400)
  }

  if (confirmado) {
    const prog = PROGRAMAS.find(p => p.id === seleccionado)
    return (
      <div className="flex items-center justify-center px-4 py-20">
        <div className="text-center animate-scale-in">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl" style={{ background: `linear-gradient(135deg, ${prog.colorAccent}, ${prog.colorAccent}cc)` }}>
            {prog.emoji}
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">¡Excelente elección! 🚀</h2>
          <p className="text-gray-500 font-body text-lg">
            Ahora descubriremos qué tan conectado/a estás con{' '}
            <strong className="text-gray-700">{prog.nombre}</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full animate-fade-up">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3" style={{ background: '#f2faeb', border: '2px solid #c2e8a1' }}>
            📚
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900">¿Qué carrera te llama la atención?</h2>
          <p className="text-gray-500 font-body mt-2">Elige la que más conecte con quién eres</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PROGRAMAS.map((prog, i) => (
            <button
              key={prog.id}
              onClick={() => handleSeleccionar(prog.id)}
              style={{ animationDelay: `${i * 100}ms` }}
              className={`group bg-white rounded-3xl border-2 p-7 text-left transition-all duration-300 animate-fade-up hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${
                seleccionado === prog.id ? 'border-current shadow-xl' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Emoji con fondo del color del programa */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-md group-hover:scale-110 transition-transform duration-300"
                style={{ background: `linear-gradient(135deg, ${prog.colorAccent}, ${prog.colorAccent}bb)` }}
              >
                {prog.emoji}
              </div>

              <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{prog.nombre}</h3>
              <p className="font-body text-gray-500 text-sm leading-relaxed">{prog.descripcion}</p>

              <div
                className="mt-5 flex items-center gap-1 font-display font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: prog.colorAccent }}
              >
                Explorar este programa
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Nota Catatumbo */}
        <p className="text-center text-gray-400 font-body text-xs mt-6">
          Programa Catatumbo · Universidad Industrial de Santander
        </p>
      </div>
    </div>
  )
}
