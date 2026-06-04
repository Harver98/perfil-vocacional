import { PREGUNTAS } from '../data/preguntas'
import { PROGRAMAS } from '../data/programas'

/**
 * Calcula los puntajes SER / HACER / SABER y la afinidad total
 * Las respuestas llegan como array plano en orden: ser[0..2], hacer[0..2], saber[0..2]
 */
export function calcularResultados(programaId, respuestas) {
  const preguntas = PREGUNTAS[programaId]
  const totalPorDimension = preguntas.ser.length // siempre 3
  const maxPorDimension = totalPorDimension * 4  // máximo posible = 12

  // Separar respuestas por dimensión (índices 0-2: ser, 3-5: hacer, 6-8: saber)
  const rSer = respuestas.slice(0, 3)
  const rHacer = respuestas.slice(3, 6)
  const rSaber = respuestas.slice(6, 9)

  const sumaSer = rSer.reduce((a, b) => a + b, 0)
  const sumaHacer = rHacer.reduce((a, b) => a + b, 0)
  const sumaSaber = rSaber.reduce((a, b) => a + b, 0)

  const puntajeSer = Math.round((sumaSer / maxPorDimension) * 100)
  const puntajeHacer = Math.round((sumaHacer / maxPorDimension) * 100)
  const puntajeSaber = Math.round((sumaSaber / maxPorDimension) * 100)

  const afinidadTotal = Math.round((puntajeSer + puntajeHacer + puntajeSaber) / 3)

  // Dimensión dominante
  const dimensiones = { ser: puntajeSer, hacer: puntajeHacer, saber: puntajeSaber }
  const dimensionDominante = Object.entries(dimensiones)
    .sort(([, a], [, b]) => b - a)[0][0]
    .toUpperCase()

  // Seleccionar fortalezas según puntajes altos
  const programa = PROGRAMAS.find(p => p.id === programaId)
  const fortalezas = seleccionarFortalezas(programa, puntajeSer, puntajeHacer, puntajeSaber)

  return {
    puntajeSer,
    puntajeHacer,
    puntajeSaber,
    afinidadTotal,
    dimensionDominante,
    insignia: programa.insignia,
    fortalezas,
    mensaje: programa.mensaje,
  }
}

function seleccionarFortalezas(programa, ser, hacer, saber) {
  const fortalezas = programa.fortalezas
  // Mostrar entre 3 y 5 fortalezas según puntaje
  const promedio = (ser + hacer + saber) / 3
  if (promedio >= 80) return fortalezas.slice(0, 5)
  if (promedio >= 60) return fortalezas.slice(0, 4)
  return fortalezas.slice(0, 3)
}

/**
 * Convierte las respuestas al formato para guardar en Supabase
 */
export function formatearRespuestasParaDB(sesionId, programaId, respuestas) {
  const dimensiones = ['ser', 'ser', 'ser', 'hacer', 'hacer', 'hacer', 'saber', 'saber', 'saber']
  return respuestas.map((valor, index) => ({
    sesion_id: sesionId,
    programa: programaId,
    dimension: dimensiones[index],
    pregunta_index: index,
    valor,
  }))
}
