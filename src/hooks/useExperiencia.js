import { useState, useCallback } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'
import { calcularResultados, formatearRespuestasParaDB } from '../utils/calculos'

export const PASOS = {
  BIENVENIDA: 0,
  INFO_GENERAL: 1,
  SELECCION_PROGRAMA: 2,
  VIDEO: 3,
  CUESTIONARIO: 4,
  RESULTADO: 5,
}

const estadoInicial = {
  paso: PASOS.BIENVENIDA,
  sesionId: null,
  municipio: '',
  edad: '',
  gruposPoblacionales: [],
  programaId: null,
  respuestas: [],
  resultado: null,
  guardando: false,
  error: null,
}

// Genera un ID local cuando no hay Supabase configurado
const demoId = () => 'demo-' + Math.random().toString(36).slice(2, 10)

export function useExperiencia() {
  const [estado, setEstado] = useState(estadoInicial)

  const actualizar = useCallback((cambios) => {
    setEstado(prev => ({ ...prev, ...cambios }))
  }, [])

  const irAPaso = useCallback((paso) => {
    setEstado(prev => ({ ...prev, paso }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // PASO 1 → 2: Guardar info general
  const guardarInfoGeneral = useCallback(async (datos) => {
    actualizar({ guardando: true, error: null })

    // MODO DEMO: sin .env.local configurado, funciona sin guardar datos
    if (!supabaseConfigurado) {
      actualizar({
        sesionId: demoId(),
        municipio: datos.municipio,
        edad: datos.edad,
        gruposPoblacionales: datos.gruposPoblacionales,
        guardando: false,
        paso: PASOS.SELECCION_PROGRAMA,
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('sesiones')
        .insert({
          municipio: datos.municipio,
          edad: parseInt(datos.edad),
          grupos_poblacionales: datos.gruposPoblacionales,
          programa: 'pendiente',
          completado: false,
        })
        .select('id')
        .single()

      if (error) throw error

      actualizar({
        sesionId: data.id,
        municipio: datos.municipio,
        edad: datos.edad,
        gruposPoblacionales: datos.gruposPoblacionales,
        guardando: false,
        paso: PASOS.SELECCION_PROGRAMA,
      })
    } catch (err) {
      console.error('Error guardando info general:', err)
      actualizar({ guardando: false, error: 'Error al conectar con Supabase. Verifica tu .env.local' })
    }
  }, [actualizar])

  // PASO 2 → 3: Guardar programa seleccionado
  const seleccionarPrograma = useCallback(async (programaId) => {
    if (!estado.sesionId) return

    if (supabaseConfigurado && !estado.sesionId.startsWith('demo-')) {
      try {
        await supabase
          .from('sesiones')
          .update({ programa: programaId })
          .eq('id', estado.sesionId)
      } catch (err) {
        console.warn('No se pudo actualizar programa en Supabase:', err)
      }
    }

    actualizar({ programaId, paso: PASOS.VIDEO })
  }, [estado.sesionId, actualizar])

  // PASO 4 → 5: Guardar respuestas y calcular resultado
  const finalizarCuestionario = useCallback(async (respuestas) => {
    actualizar({ guardando: true, error: null })

    const resultado = calcularResultados(estado.programaId, respuestas)

    // MODO DEMO: mostrar resultado sin guardar en BD
    if (!supabaseConfigurado || estado.sesionId?.startsWith('demo-')) {
      actualizar({
        respuestas,
        resultado,
        guardando: false,
        paso: PASOS.RESULTADO,
      })
      return
    }

    try {
      // Guardar respuestas individuales
      const respuestasDB = formatearRespuestasParaDB(estado.sesionId, estado.programaId, respuestas)
      const { error: errRespuestas } = await supabase
        .from('respuestas')
        .insert(respuestasDB)
      if (errRespuestas) throw errRespuestas

      // Guardar resultado calculado
      const { error: errResultado } = await supabase
        .from('resultados')
        .insert({
          sesion_id: estado.sesionId,
          programa: estado.programaId,
          puntaje_ser: resultado.puntajeSer,
          puntaje_hacer: resultado.puntajeHacer,
          puntaje_saber: resultado.puntajeSaber,
          afinidad_total: resultado.afinidadTotal,
          dimension_dominante: resultado.dimensionDominante,
          insignia: resultado.insignia,
          fortalezas: resultado.fortalezas,
        })
      if (errResultado) throw errResultado

      // Marcar sesión como completada
      await supabase
        .from('sesiones')
        .update({ completado: true })
        .eq('id', estado.sesionId)

      actualizar({
        respuestas,
        resultado,
        guardando: false,
        paso: PASOS.RESULTADO,
      })
    } catch (err) {
      console.error('Error guardando resultados:', err)
      // Mostrar resultado aunque falle el guardado
      actualizar({
        respuestas,
        resultado,
        guardando: false,
        error: 'Resultado calculado, pero no se pudo guardar en la base de datos.',
        paso: PASOS.RESULTADO,
      })
    }
  }, [estado.sesionId, estado.programaId, actualizar])

  const reiniciar = useCallback(() => {
    setEstado(estadoInicial)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return {
    ...estado,
    irAPaso,
    guardarInfoGeneral,
    seleccionarPrograma,
    finalizarCuestionario,
    reiniciar,
    PASOS,
    modoDemo: !supabaseConfigurado,
  }
}
