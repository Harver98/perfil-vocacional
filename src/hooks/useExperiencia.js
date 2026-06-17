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
  // Datos del participante
  nombre:           '',
  municipio:        '',
  corregimiento:    '',
  vereda:           '',
  tipoActor:        '',
  datosActor:       {},
  // Selecciones
  programasOrden:   [],   // ['trabajo_social', 'agronomia', 'administracion']
  programaActual:   null, // programa siendo socializado ahora
  perfilIngreso:    {},
  perfilEgreso:     {},
  lineas:           [],
  electivas:        [],
  empleabilidad:    {},
  firma:            null,
  comentarioFinal:  '',
  // Certificado
  codigoQR:         null,
  // UI
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

  // ── SECCIÓN 3: Guardar caracterización ───────────────────────────────────
  const guardarCaracterizacion = useCallback(async (datos) => {
    actualizar({ guardando: true, error: null })

    if (!supabaseConfigurado) {
      actualizar({
        participanteId: demoId(),
        nombre:         datos.nombre,
        municipio:      datos.municipio,
        corregimiento:  datos.corregimiento,
        vereda:         datos.vereda,
        tipoActor:      datos.tipoActor,
        datosActor:     datos.datosActor,
        guardando:      false,
        paso:           PASOS.PROGRAMAS_ORDEN,
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('participantes')
        .insert({
          nombre:          datos.nombre,
          municipio:       datos.municipio,
          corregimiento:   datos.corregimiento || null,
          vereda:          datos.vereda || null,
          tipo_actor:      datos.tipoActor,
          edad:            datos.datosActor.edad ? parseInt(datos.datosActor.edad) : null,
          colegio:         datos.datosActor.colegio || null,
          grado:           datos.datosActor.grado || null,
          institucion:     datos.datosActor.institucion || null,
          area:            datos.datosActor.area || null,
          nivel_educativo: datos.datosActor.nivel_educativo || null,
          organizacion:    datos.datosActor.organizacion || null,
          correo:          datos.datosActor.correo || null,
          participo_antes: datos.datosActor.participo_antes ?? null,
          completado:      false,
        })
        .select('id')
        .single()

      if (error) throw error

      actualizar({
        participanteId: data.id,
        nombre:         datos.nombre,
        municipio:      datos.municipio,
        corregimiento:  datos.corregimiento,
        vereda:         datos.vereda,
        tipoActor:      datos.tipoActor,
        datosActor:     datos.datosActor,
        guardando:      false,
        paso:           PASOS.PROGRAMAS_ORDEN,
      })
    } catch (err) {
      console.error(err)
      actualizar({ guardando: false, error: 'Error al guardar. Verifica tu conexión.' })
    }
  }, [actualizar])

  // ── SECCIÓN 4: Guardar orden de programas ────────────────────────────────
  const guardarProgramasOrden = useCallback(async (orden) => {
    actualizar({ programasOrden: orden, guardando: true })

    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = orden.map((prog, i) => ({
          participante_id: estado.participanteId,
          programa:        prog,
          orden:           i + 1,
        }))
        await supabase.from('programas_orden').insert(rows)
      } catch (err) { console.warn(err) }
    }

    actualizar({
      guardando:     false,
      programaActual: orden[0], // iniciar con el programa de mayor preferencia
      paso:          PASOS.SOCIALIZACION,
    })
  }, [estado.participanteId, actualizar])

  // ── SECCIÓN 6: Guardar perfil de ingreso ─────────────────────────────────
  const guardarPerfilIngreso = useCallback(async (datos) => {
    actualizar({ guardando: true })

    const nuevo = { ...estado.perfilIngreso, [datos.programa]: datos }
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = datos.prioridades.map(p => ({
          participante_id: estado.participanteId,
          programa:        datos.programa,
          categoria:       p.categoria,
          competencia:     p.competencia,
          orden_prioridad: p.orden,
          comentario_libre: datos.comentario || null,
        }))
        await supabase.from('perfil_ingreso').insert(rows)
      } catch (err) { console.warn(err) }
    }

    actualizar({ perfilIngreso: nuevo, guardando: false, paso: PASOS.PERFIL_EGRESO })
  }, [estado.participanteId, estado.perfilIngreso, actualizar])

  // ── SECCIÓN 7: Guardar perfil de egreso + Lenguas ────────────────────────
  const guardarPerfilEgreso = useCallback(async (datos) => {
    actualizar({ guardando: true })

    const nuevo = { ...estado.perfilEgreso, [datos.programa]: datos }
    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = datos.prioridades.map(p => ({
          participante_id: estado.participanteId,
          programa:        datos.programa,
          competencia:     p.competencia,
          orden_prioridad: p.orden,
          comentario_libre: datos.comentario || null,
        }))
        await supabase.from('perfil_egreso').insert(rows)

        // Si se adjuntan datos de lenguas e interculturalidad, se insertan en su respectiva tabla
        if (datos.lenguas) {
          await supabase.from('interculturalidad_lenguas').insert({
            participante_id: estado.participanteId,
            integracion:     datos.lenguas.integracion,
            explicacion:     datos.lenguas.explicacion || null,
            abierta_lenguas: datos.lenguas.abiertaLenguas || null,
          })
        }
      } catch (err) { console.warn(err) }
    }

    actualizar({ perfilEgreso: nuevo, guardando: false, paso: PASOS.LINEAS_INVESTIGACION })
  }, [estado.participanteId, estado.perfilEgreso, actualizar])

  // ── SECCIÓN 8: Guardar líneas ─────────────────────────────────────────────
  const guardarLineas = useCallback(async (lineasSeleccionadas) => {
    actualizar({ guardando: true })

    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = lineasSeleccionadas.map(l => ({
          participante_id: estado.participanteId,
          programa:        estado.programaActual,
          linea:           l,
        }))
        if (rows.length) await supabase.from('lineas_investigacion').insert(rows)
      } catch (err) { console.warn(err) }
    }

    actualizar({ lineas: lineasSeleccionadas, guardando: false, paso: PASOS.ELECTIVAS })
  }, [estado.participanteId, estado.programaActual, actualizar])

  // ── SECCIÓN 9: Guardar electivas ──────────────────────────────────────────
  const guardarElectivas = useCallback(async (electivasSeleccionadas) => {
    actualizar({ guardando: true })

    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        const rows = electivasSeleccionadas.map(e => ({
          participante_id: estado.participanteId,
          programa:        estado.programaActual,
          electiva:        e,
        }))
        if (rows.length) await supabase.from('electivas').insert(rows)
      } catch (err) { console.warn(err) }
    }

    actualizar({ electivas: electivasSeleccionadas, guardando: false, paso: PASOS.EMPLEABILIDAD })
  }, [estado.participanteId, estado.programaActual, actualizar])

  // ── SECCIÓN 10: Guardar manifiesto y generar certificado ──────────────────
  const guardarManifiesto = useCallback(async (datos) => {
    actualizar({ guardando: true, error: null })

    const codigo = 'CAT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase()

    if (supabaseConfigurado && !estado.participanteId?.startsWith('demo-')) {
      try {
        await supabase.from('manifiesto').insert({
          participante_id:   estado.participanteId,
          empleabilidad_ts:  datos.empleabilidad?.trabajo_social || null,
          empleabilidad_ia:  datos.empleabilidad?.agronomia || null,
          empleabilidad_adm: datos.empleabilidad?.administracion || null,
          comentario_final:  datos.comentarioFinal || null,
          firma_svg:         datos.firma || null,
          acepta_manifiesto: datos.acepta || false,
        })

        await supabase.from('certificados').insert({
          participante_id: estado.participanteId,
          codigo_qr:       codigo,
          programas:       estado.programasOrden,
        })

        await supabase.from('participantes')
          .update({ completado: true })
          .eq('id', estado.participanteId)
      } catch (err) {
        console.warn('Error guardando manifiesto:', err)
      }
    }

    actualizar({
      empleabilidad:   datos.empleabilidad,
      firma:           datos.firma,
      comentarioFinal: datos.comentarioFinal,
      codigoQR:        codigo,
      guardando:       false,
      paso:            PASOS.CERTIFICADO,
    })
  }, [estado.participanteId, estado.programasOrden, actualizar])

  // ── Registrar video visto ─────────────────────────────────────────────────
  const registrarVideoVisto = useCallback(async (videoId, seccion) => {
    if (!supabaseConfigurado || !estado.participanteId || estado.participanteId?.startsWith('demo-')) return
    try {
      await supabase.from('videos_vistos').insert({
        participante_id: estado.participanteId,
        video_id:        videoId,
        seccion,
        visto:           true,
      })
    } catch (err) { console.warn(err) }
  }, [estado.participanteId])

  const reiniciar = useCallback(() => {
    setEstado(estadoInicial)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return {
    ...estado,
    irAPaso,
    guardarCaracterizacion,
    guardarProgramasOrden,
    guardarPerfilIngreso,
    guardarPerfilEgreso,
    guardarLineas,
    guardarElectivas,
    guardarManifiesto,
    registrarVideoVisto,
    reiniciar,
    PASOS,
    modoDemo: !supabaseConfigurado,
  }
}