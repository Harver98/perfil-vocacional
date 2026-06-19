import { useState, useCallback } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'

export const PASOS = {
  BIENVENIDA:            0,
  CAPSULA:               1,
  CARACTERIZACION:       2,
  PROGRAMAS_ORDEN:       3,
  SOCIALIZACION:         4,
  PERFIL_INGRESO:        5,
  PERFIL_EGRESO:         6,
  LINEAS_INVESTIGACION:  7,
  ELECTIVAS:             8,
  EMPLEABILIDAD:         9,
  CERTIFICADO:          10,
}

const estadoInicial = {
  paso:             PASOS.BIENVENIDA,
  participanteId:   null,
  nombre:           '',
  municipio:        '',
  corregimiento:    '',
  vereda:           '',
  tipoActor:        '',
  datosActor:       {},
  programasOrden:   [],
  programaActual:   null,
  perfilIngreso:    {},
  perfilEgreso:     {},
  lineas:           [],
  electivas:        [],
  empleabilidad:    {},
  firma:            null,
  comentarioFinal:  '',
  codigoQR:         null,
  guardando:        false,
  error:            null,
}

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

  const guardarCaracterizacion = useCallback(async (datos) => {
    actualizar({ guardando: true, error: null })
    if (!supabaseConfigurado) {
      actualizar({ participanteId: demoId(), nombre: datos.nombre, municipio: datos.municipio, corregimiento: datos.corregimiento, vereda: datos.vereda, tipoActor: datos.tipoActor, datosActor: datos.datosActor, guardando: false, paso: PASOS.PROGRAMAS_ORDEN })
      return
    }
    try {
      const { data, error } = await supabase.from('participantes').insert({
        nombre: datos.nombre, municipio: datos.municipio,
        corregimiento: datos.corregimiento || null, vereda: datos.vereda || null,
        tipo_actor: datos.tipoActor,
        edad: datos.datosActor.edad ? parseInt(datos.datosActor.edad) : null,
        colegio: datos.datosActor.colegio || null, grado: datos.datosActor.grado || null,
        institucion: datos.datosActor.institucion || null, area: datos.datosActor.area || null,
        nivel_educativo: datos.datosActor.nivel_educativo || null,
        organizacion: datos.datosActor.organizacion || null, correo: datos.datosActor.correo || null,
        participo_antes: datos.datosActor.participo_antes ?? null, completado: false,
      }).select('id').single()
      if (error) throw error
      actualizar({ participanteId: data.id, nombre: datos.nombre, municipio: datos.municipio, corregimiento: datos.corregimiento, vereda: datos.vereda, tipoActor: datos.tipoActor, datosActor: datos.datosActor, guardando: false, paso: PASOS.PROGRAMAS_ORDEN })
    } catch (err) {
      console.error(err)
      actualizar({ guardando: false, error: 'Error al guardar. Verifica tu conexión.' })
    }
  }, [actualizar])

  const guardarProgramasOrden = useCallback(async (orden) => {
    actualizar({ programasOrden: orden, guardando: true })
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = orden.map((prog, i) => ({ participante_id: estado.participanteId, programa: prog, orden: i + 1 }))
        await supabase.from('programas_orden').insert(rows)
      } catch (err) { console.warn(err) }
    }
    actualizar({ guardando: false, programaActual: orden[0], paso: PASOS.SOCIALIZACION })
  }, [estado.participanteId, actualizar])

  // Guarda perfil de ingreso: facilidades ordenadas (categoria='facilidad') + visión territorial
  const guardarPerfilIngreso = useCallback(async (datos) => {
    actualizar({ guardando: true })
    const nuevo = { ...estado.perfilIngreso, [datos.programa]: datos }
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = datos.prioridades.map(p => ({
          participante_id: estado.participanteId, programa: datos.programa,
          categoria: p.categoria || null, competencia: p.competencia,
          orden_prioridad: p.orden, comentario_libre: datos.comentario || null,
          vision_territorial: datos.visionTerritorial || null,
        }))
        if (rows.length) {
          const { error } = await supabase.from('perfil_ingreso').insert(rows)
          if (error) console.error('Error guardando perfil_ingreso:', error)
        }
      } catch (err) { console.warn('Error guardando ingreso:', err) }
    }
    actualizar({ perfilIngreso: nuevo, guardando: false, paso: PASOS.PERFIL_EGRESO })
  }, [estado.participanteId, estado.perfilIngreso, actualizar])

  // Guarda perfil de egreso: competencias priorizadas + comentario abierto + datos de lengua/Barí
  const guardarPerfilEgreso = useCallback(async (datos) => {
    actualizar({ guardando: true })
    const nuevo = { ...estado.perfilEgreso, [datos.programa]: datos }
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = (datos.prioridades || []).map(p => ({
          participante_id: estado.participanteId,
          programa:         datos.programa,
          competencia:      p.competencia,
          orden_prioridad:  p.orden,
          comentario_libre: datos.comentario || null,
        }))
        if (rows.length) {
          const { error } = await supabase.from('perfil_egreso').insert(rows)
          if (error) console.error('Error guardando perfil_egreso:', error)
        } else {
          // Si por algún motivo no hay prioridades, igual guardamos el comentario en una fila
          const { error } = await supabase.from('perfil_egreso').insert({
            participante_id: estado.participanteId,
            programa:         datos.programa,
            competencia:      null,
            orden_prioridad:  null,
            comentario_libre: datos.comentario || null,
          })
          if (error) console.error('Error guardando perfil_egreso (sin prioridades):', error)
        }

        // Guardar datos de lengua y cultura Barí en participantes
        const updateData = {}
        if (datos.importancia_lengua !== undefined) updateData.importancia_lengua = datos.importancia_lengua
        if (datos.conocimiento_bari  !== undefined) updateData.conocimiento_bari  = datos.conocimiento_bari
        if (datos.desea_conocer_bari !== undefined) updateData.desea_conocer_bari = datos.desea_conocer_bari
        if (datos.como_conocer_bari  !== undefined) updateData.como_conocer_bari  = datos.como_conocer_bari || null

        if (Object.keys(updateData).length) {
          const { error } = await supabase.from('participantes').update(updateData).eq('id', estado.participanteId)
          if (error) console.error('Error actualizando datos Barí/lengua:', error)
        }
      } catch (err) {
        console.warn('Error guardando egreso:', err)
      }
    }
    actualizar({ perfilEgreso: nuevo, guardando: false, paso: PASOS.LINEAS_INVESTIGACION })
  }, [estado.participanteId, estado.perfilEgreso, actualizar])

  const guardarLineas = useCallback(async (lineasSeleccionadas) => {
    actualizar({ guardando: true })
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = lineasSeleccionadas.map(l => ({ participante_id: estado.participanteId, programa: estado.programaActual, linea: l }))
        if (rows.length) await supabase.from('lineas_investigacion').insert(rows)
      } catch (err) { console.warn(err) }
    }
    actualizar({ lineas: lineasSeleccionadas, guardando: false, paso: PASOS.ELECTIVAS })
  }, [estado.participanteId, estado.programaActual, actualizar])

  const guardarElectivas = useCallback(async (electivasSeleccionadas) => {
    actualizar({ guardando: true })
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = electivasSeleccionadas.map(e => ({ participante_id: estado.participanteId, programa: estado.programaActual, electiva: e }))
        if (rows.length) await supabase.from('electivas').insert(rows)
      } catch (err) { console.warn(err) }
    }
    actualizar({ electivas: electivasSeleccionadas, guardando: false, paso: PASOS.EMPLEABILIDAD })
  }, [estado.participanteId, estado.programaActual, actualizar])

  const guardarManifiesto = useCallback(async (datos) => {
    actualizar({ guardando: true, error: null })
    const codigo = 'CAT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase()
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        await supabase.from('manifiesto').insert({
          participante_id: estado.participanteId,
          empleabilidad_ts: datos.empleabilidad?.trabajo_social || null,
          empleabilidad_ia: datos.empleabilidad?.agronomia || null,
          empleabilidad_adm: datos.empleabilidad?.administracion || null,
          comentario_final: datos.comentarioFinal || null,
          firma_svg: datos.firma || null,
          acepta_manifiesto: datos.acepta || false,
        })
        await supabase.from('certificados').insert({ participante_id: estado.participanteId, codigo_qr: codigo, programas: estado.programasOrden })
        await supabase.from('participantes').update({ completado: true }).eq('id', estado.participanteId)
      } catch (err) { console.warn('Error guardando manifiesto:', err) }
    }
    actualizar({ empleabilidad: datos.empleabilidad, firma: datos.firma, comentarioFinal: datos.comentarioFinal, codigoQR: codigo, guardando: false, paso: PASOS.CERTIFICADO })
  }, [estado.participanteId, estado.programasOrden, actualizar])

  const registrarVideoVisto = useCallback(async (videoId, seccion) => {
    if (!supabaseConfigurado || !estado.participanteId || estado.participanteId?.startsWith('demo-')) return
    try {
      await supabase.from('videos_vistos').insert({ participante_id: estado.participanteId, video_id: videoId, seccion, visto: true })
    } catch (err) { console.warn(err) }
  }, [estado.participanteId])

  const reiniciar = useCallback(() => {
    setEstado(estadoInicial)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return {
    ...estado, irAPaso, guardarCaracterizacion, guardarProgramasOrden,
    guardarPerfilIngreso, guardarPerfilEgreso, guardarLineas, guardarElectivas,
    guardarManifiesto, registrarVideoVisto, reiniciar, PASOS,
    modoDemo: !supabaseConfigurado,
  }
}