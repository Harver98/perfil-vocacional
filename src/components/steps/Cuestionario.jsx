import { useState } from 'react'
import { PREGUNTAS, OPCIONES_RESPUESTA, MENSAJES_MOTIVADORES } from '../../data/preguntas'
import { PROGRAMAS } from '../../data/programas'

export default function Cuestionario({ programaId, onFinalizar, guardando }) {
  const preguntas = PREGUNTAS[programaId]
  const programa = PROGRAMAS.find(p => p.id === programaId)

  // Construir lista plana: [ser0, ser1, ser2, hacer0, hacer1, hacer2, saber0, saber1, saber2]
  const listaPreguntas = [
    ...preguntas.ser.map((q, i) => ({ texto: q, dimension: 'SER', index: i })),
    ...preguntas.hacer.map((q, i) => ({ texto: q, dimension: 'HACER', index: i })),
    ...preguntas.saber.map((q, i) => ({ texto: q, dimension: 'SABER', index: i })),
  ]
  const total = listaPreguntas.length

  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [transicion, setTransicion] = useState(false)
  const [mostrarMotivador, setMostrarMotivador] = useState(false)

  const progreso = Math.round((preguntaActual / total) * 100)
  const motivador = MENSAJES_MOTIVADORES[Math.floor((preguntaActual / total) * MENSAJES_MOTIVADORES.length)]
  const pregunta = listaPreguntas[preguntaActual]

  const DIMENSIONES_CONFIG = {
    SER: { color: 'bg-violet-100 text-violet-700', emoji: '💡' },
    HACER: { color: 'bg-blue-100 text-blue-700', emoji: '⚡' },
    SABER: { color: 'bg-emerald-100 text-emerald-700', emoji: '📘' },
  }

  const handleRespuesta = (valor) => {
    if (seleccionada !== null || transicion) return
    setSeleccionada(valor)

    setTimeout(() => {
      const nuevasRespuestas = [...respuestas, valor]

      if (preguntaActual < total - 1) {
        // Mostrar motivador cada 3 preguntas
        if ((preguntaActual + 1) % 3 === 0) {
          setMostrarMotivador(true)
          setTimeout(() => {
            setMostrarMotivador(false)
            setTransicion(true)
            setTimeout(() => {
              setRespuestas(nuevasRespuestas)
              setPreguntaActual(prev => prev + 1)
              setSeleccionada(null)
              setTransicion(false)
            }, 200)
          }, 1200)
        } else {
          setTransicion(true)
          setTimeout(() => {
            setRespuestas(nuevasRespuestas)
            setPreguntaActual(prev => prev + 1)
            setSeleccionada(null)
            setTransicion(false)
          }, 400)
        }
      } else {
        // Última pregunta
        setTimeout(() => onFinalizar(nuevasRespuestas), 600)
      }
    }, 500)
  }

  if (guardando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${programa.color} animate-pulse`} />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
          </div>
          <h3 className="font-display text-xl font-bold text-gray-800 mb-2">Calculando tu perfil...</h3>
          <p className="text-gray-500 font-body">Un momento, estamos procesando tus respuestas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-body text-gray-400">
              Pregunta {preguntaActual + 1} de {total}
            </span>
            <span className={`text-xs font-display font-semibold px-2 py-0.5 rounded-full ${DIMENSIONES_CONFIG[pregunta.dimension].color}`}>
              {DIMENSIONES_CONFIG[pregunta.dimension].emoji} {pregunta.dimension}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${programa.color} rounded-full transition-all duration-500`}
              style={{ width: `${Math.max(5, progreso)}%` }}
            />
          </div>
        </div>

        {/* Mensaje motivador */}
        {mostrarMotivador && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-3xl px-10 py-8 text-center shadow-2xl animate-scale-in">
              <div className="text-5xl mb-3">{motivador.emoji}</div>
              <p className="font-display text-2xl font-bold text-gray-800">{motivador.texto}</p>
            </div>
          </div>
        )}

        {/* Tarjeta de pregunta */}
        <div className={`bg-white rounded-3xl shadow-xl shadow-gray-100 p-8 mb-6 transition-all duration-300 ${transicion ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'} animate-fade-up`}>
          <p className="text-gray-400 font-body text-xs mb-4 uppercase tracking-widest">
            Conozcamos tus intereses
          </p>
          <h3 className="font-display text-xl font-bold text-gray-900 leading-snug">
            {pregunta.texto}
          </h3>
        </div>

        {/* Opciones de respuesta */}
        <div className="grid grid-cols-2 gap-3">
          {OPCIONES_RESPUESTA.map((opcion) => (
            <button
              key={opcion.valor}
              onClick={() => handleRespuesta(opcion.valor)}
              disabled={seleccionada !== null}
              className={`py-4 px-4 rounded-2xl border-2 font-display font-semibold text-base transition-all duration-200
                ${seleccionada === opcion.valor
                  ? opcion.selectedColor + ' scale-95 shadow-lg'
                  : seleccionada !== null
                    ? 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed'
                    : opcion.color + ' cursor-pointer hover:scale-105 active:scale-95'
                }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        {/* Indicador de paso */}
        <div className="flex justify-center gap-1.5 mt-6">
          {listaPreguntas.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < preguntaActual ? `bg-gradient-to-r ${programa.color} w-4` :
                i === preguntaActual ? `bg-gradient-to-r ${programa.color} w-6` :
                'bg-gray-200 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
