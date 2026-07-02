import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ── Colores Institucionales ───────────────────────────────────────────────────
const G = {
  green:     '#67B93E',
  greenDark: '#3d7820',
  greenBg:   '#f2faeb',
  purple:    '#5b2d8e',
  blue:      '#1a6fa8',
  orange:    '#c96a00',
  red:       '#dc2626',
}
const COLORS = [G.green, G.purple, G.blue, G.orange, G.red, '#0891b2', '#7c3aed']

const PROG_LABEL = {
  trabajo_social: 'Trabajo Social',
  agronomia:      'Ing. Agronómica',
  administracion: 'Adm. Empresas',
}
const ACTOR_LABEL = {
  estudiante:   'Estudiante',
  docente:      'Docente',
  comunidad:    'Comunidad',
  organizacion: 'Organización',
}

// ── Utilidad: truncar texto para celdas Excel (límite 32767 chars) ────────────
const truncarCelda = (texto, max = 32000) => {
  if (!texto) return ''
  const str = String(texto)
  return str.length > max ? str.slice(0, max) + '...[truncado]' : str
}

// ── Exportación ───────────────────────────────────────────────────────────────
const exportarCSV = (datos, nombreArchivo) => {
  if (!datos?.length) return
  const headers = Object.keys(datos[0]).join(',')
  const filas = datos.map(fila =>
    Object.values(fila).map(v => {
      if (v === null || v === undefined) return ''
      let texto = String(v).replace(/"/g, '""')
      return texto.includes(',') || texto.includes('\n') || texto.includes('\r') ? `"${texto}"` : texto
    }).join(',')
  )
  const csv = [headers, ...filas].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// Exporta un libro de Excel con múltiples hojas. `hojas` = [{ nombre, datos }]
const exportarExcelMultihoja = (hojas, nombreArchivo) => {
  const wb = XLSX.utils.book_new()
  hojas.forEach(({ nombre, datos }) => {
    if (!datos?.length) return
    const ws = XLSX.utils.json_to_sheet(datos)
    XLSX.utils.book_append_sheet(wb, ws, nombre.slice(0, 31))
  })
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
}

// ── UI ────────────────────────────────────────────────────────────────────────
function StatCard({ emoji, label, value, sub, accent }) {
  const esTextoLargo = typeof value === 'string' && value.length > 14
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{emoji}</span>
        <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: accent || G.green }} />
      </div>
      <p className={`font-display font-black text-gray-900 leading-tight ${esTextoLargo ? 'text-base' : 'text-3xl'}`}
        title={typeof value === 'string' ? value : undefined}>
        {value ?? '—'}
      </p>
      <p className="font-display font-semibold text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="font-body text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function SinDatos({ mensaje }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-gray-300">
      <span className="text-4xl mb-2">📭</span>
      <p className="font-body text-sm font-medium">{mensaje || 'Sin datos para este segmento'}</p>
    </div>
  )
}

function ExportMenu({ onCSV, onExcel, onCSVAbiertas }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-semibold transition-all"
        style={{ borderColor: G.green, color: G.green, background: G.greenBg }}>
        ⬇️ Exportar <span className="text-xs opacity-60">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 min-w-48">
          {[
            { icon: '📗', label: 'Excel completo (multi-hoja)',       fn: onExcel },
            { icon: '📊', label: 'CSV (sábana simple)',               fn: onCSV },
            { icon: '📝', label: 'Exportar Respuestas Abiertas (CSV)', fn: onCSVAbiertas },
          ].map(op => (
            <button key={op.label} onClick={() => { op.fn(); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm font-body text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
              {op.icon} {op.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LoginUIS({ onLogin }) {
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [cargando,    setCargando]    = useState(false)
  const [error,       setError]       = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)

  const intentarLogin = async () => {
    if (!email || !password) return
    setCargando(true); setError('')
    try {
      const { data: auth, error: ae } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      })
      if (ae) throw ae
      const { data: admin, error: adme } = await supabase
        .from('admins').select('activo, nombre').eq('user_id', auth.user.id).single()
      if (adme || !admin?.activo) {
        await supabase.auth.signOut()
        throw new Error('Tu cuenta no tiene acceso al dashboard.')
      }
      onLogin(admin.nombre || email)
    } catch (e) {
      const m = e.message || ''
      if (m.includes('Invalid login'))  setError('Correo o contraseña incorrectos.')
      else if (m.includes('confirmed')) setError('Confirma tu correo primero.')
      else if (m.includes('acceso'))    setError(m)
      else                              setError('Error de conexión. Verifica tu entorno.')
    } finally { setCargando(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg,#5b2d8e 0%,#7b3fa8 50%,#3d7820 100%)' }}>
      <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg"
            style={{ background: G.greenBg, border: `2px solid ${G.green}33` }}>📊</div>
          <h1 className="font-display text-2xl font-black text-gray-900">Observatorio Territorial</h1>
          <p className="font-body text-gray-400 text-sm mt-1">Programa Catatumbo · UIS</p>
        </div>
        <div className="mb-3">
          <label className="block text-xs font-display font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Correo</label>
          <input type="email" placeholder="usuario@uis.edu.co" value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-gray-700 text-sm focus:outline-none focus:border-green-500 transition-all" />
        </div>
        <div className="mb-5">
          <label className="block text-xs font-display font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Contraseña</label>
          <div className="relative">
            <input type={mostrarPass ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 font-body text-gray-700 text-sm focus:outline-none focus:border-green-500 transition-all" />
            <button onClick={() => setMostrarPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              {mostrarPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-600 text-sm font-body mb-4">⚠️ {error}</div>}
        <button onClick={intentarLogin} disabled={!email || !password || cargando}
          className="w-full py-3.5 rounded-2xl font-display font-bold text-white transition-all bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed">
          {cargando ? 'Verificando...' : 'Ingresar →'}
        </button>
      </div>
    </div>
  )
}

function ConfirmarTodo({ eliminando, onConfirmar, onVolver }) {
  const [texto, setTexto] = useState('')
  const valido = texto === 'CONFIRMAR'
  return (
    <>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🚨</div>
        <h3 className="font-display font-black text-xl text-gray-900">¿Eliminar TODO?</h3>
        <p className="text-gray-500 font-body text-sm mt-2">Esta acción vaciará el histórico completo de forma irreversible.</p>
      </div>
      <div className="mb-5">
        <input type="text" placeholder="CONFIRMAR" value={texto} onChange={e => setTexto(e.target.value)}
          className="w-full border-2 rounded-xl px-4 py-3 font-mono text-sm text-center focus:outline-none"
          style={{ borderColor: valido ? '#ef4444' : '#e5e7eb' }} />
      </div>
      <div className="flex gap-3">
        <button onClick={onVolver} className="flex-1 py-3 rounded-2xl border border-gray-200 font-semibold text-sm">Volver</button>
        <button onClick={onConfirmar} disabled={!valido || eliminando}
          className="flex-1 py-3 rounded-2xl text-white font-bold text-sm bg-red-600 disabled:bg-gray-300">
          {eliminando ? 'Borrando...' : 'Confirmar'}
        </button>
      </div>
    </>
  )
}

// ── Dashboard Principal ───────────────────────────────────────────────────────
export default function Dashboard() {
  const [autenticado,   setAutenticado]  = useState(false)
  const [nombreAdmin,   setNombreAdmin]  = useState('')
  const [vista,         setVista]        = useState(0)
  const [cargando,      setCargando]     = useState(true)
  const [rawData,       setRawData]      = useState({})
  const [modalEliminar, setModalEliminar]= useState(null)
  const [eliminando,    setEliminando]   = useState(false)
  const [mensajeElim,   setMensajeElim]  = useState(null)
  const [busqueda,      setBusqueda]     = useState('')

  const [filtroMunicipio,  setFiltroMunicipio]  = useState('')
  const [filtroPrograma,   setFiltroPrograma]   = useState('')
  const [filtroActor,      setFiltroActor]      = useState('')
  const [filtroEdad,       setFiltroEdad]       = useState('')
  const [filtroCompletado, setFiltroCompletado] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase.from('admins').select('nombre, activo').eq('user_id', session.user.id).single()
        .then(({ data }) => {
          if (data?.activo) { setNombreAdmin(data.nombre || session.user.email); setAutenticado(true) }
        })
    })
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut(); setAutenticado(false); setRawData({})
  }

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      const [
        { data: participantes },
        { data: progOrden },
        { data: lineas },
        { data: electivas },
        { data: certificados },
        { data: pIngreso },
        { data: pEgreso },
        { data: manifiestoData },
      ] = await Promise.all([
        supabase.from('participantes').select('*'),
        supabase.from('programas_orden').select('*'),
        supabase.from('lineas_investigacion').select('*'),
        supabase.from('electivas').select('*'),
        supabase.from('certificados').select('*'),
        supabase.from('perfil_ingreso').select('*'),
        supabase.from('perfil_egreso').select('*'),
        supabase.from('manifiesto').select('*'),
      ])
      setRawData({
        participantes:  participantes  || [],
        progOrden:      progOrden      || [],
        lineas:         lineas         || [],
        electivas:      electivas      || [],
        certificados:   certificados   || [],
        perfilIngreso:  pIngreso       || [],
        perfilEgreso:   pEgreso        || [],
        manifiesto:     manifiestoData || [],
      })
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { if (autenticado) cargarDatos() }, [autenticado, cargarDatos])

  const limpiarFiltros = () => {
    setFiltroMunicipio(''); setFiltroPrograma(''); setFiltroActor('')
    setFiltroEdad(''); setFiltroCompletado(false)
  }

  // ── Engine de Filtros ─────────────────────────────────────────────────────
  const datosFiltrados = useMemo(() => {
    if (!rawData.participantes?.length) return null

    const partFiltrados = rawData.participantes.filter(p => {
      if (filtroMunicipio && p.municipio !== filtroMunicipio) return false
      if (filtroActor && p.tipo_actor !== filtroActor) return false
      if (filtroCompletado && !p.completado) return false
      if (filtroEdad) {
        if (!p.edad) return false
        const e = parseInt(p.edad, 10)
        if (isNaN(e)) return false
        if (filtroEdad === '< 18'  && e >= 18)            return false
        if (filtroEdad === '18-25' && (e < 18 || e > 25)) return false
        if (filtroEdad === '26-35' && (e < 26 || e > 35)) return false
        if (filtroEdad === '36-45' && (e < 36 || e > 45)) return false
        if (filtroEdad === '46+'   && e <= 45)            return false
      }
      if (filtroPrograma) {
        const tiene = rawData.progOrden?.some(po => po.participante_id === p.id && po.programa === filtroPrograma && po.orden === 1)
        if (!tiene) return false
      }
      return true
    })

    const targetIds = new Set(partFiltrados.map(p => p.id))

    const poFiltrados   = (rawData.progOrden     || []).filter(po => targetIds.has(po.participante_id))
    const linFiltrados  = (rawData.lineas        || []).filter(l  => targetIds.has(l.participante_id))
    const elFiltrados   = (rawData.electivas     || []).filter(e  => targetIds.has(e.participante_id))
    const certFiltrados = (rawData.certificados  || []).filter(c  => targetIds.has(c.participante_id))
    const ingFiltrados  = (rawData.perfilIngreso || []).filter(i  => targetIds.has(i.participante_id))
    const egFiltrados   = (rawData.perfilEgreso  || []).filter(e  => targetIds.has(e.participante_id))

    const total          = partFiltrados.length
    const completados    = partFiltrados.filter(p => p.completado).length
    const rural          = partFiltrados.filter(p => p.vereda || p.corregimiento).length
    const participoAntes = partFiltrados.filter(p => p.participo_antes).length

    let sumaEdad = 0, cuentaEdad = 0
    const porMunicipio = {}
    const porActor     = {}
    const porEdad      = { '< 18': 0, '18-25': 0, '26-35': 0, '36-45': 0, '46+': 0 }

    partFiltrados.forEach(p => {
      porMunicipio[p.municipio] = (porMunicipio[p.municipio] || 0) + 1
      porActor[p.tipo_actor]    = (porActor[p.tipo_actor]    || 0) + 1
      if (p.edad) {
        const e = parseInt(p.edad, 10)
        if (!isNaN(e)) {
          sumaEdad += e; cuentaEdad++
          if (e < 18)       porEdad['< 18']++
          else if (e <= 25) porEdad['18-25']++
          else if (e <= 35) porEdad['26-35']++
          else if (e <= 45) porEdad['36-45']++
          else              porEdad['46+']++
        }
      }
    })

    const municipioDetalle = Object.entries(porMunicipio).map(([mun, tot]) => {
      const pMun = partFiltrados.filter(p => p.municipio === mun)
      return {
        municipio: mun,
        total: tot,
        completados: pMun.filter(p => p.completado).length,
        urbanos: pMun.filter(p => !p.vereda && !p.corregimiento).length,
        rural: pMun.filter(p => p.vereda || p.corregimiento).length,
        estudiantes: pMun.filter(p => p.tipo_actor === 'estudiante').length,
        docentes: pMun.filter(p => p.tipo_actor === 'docente').length,
        comunidad: pMun.filter(p => p.tipo_actor === 'comunidad').length,
        organizaciones: pMun.filter(p => p.tipo_actor === 'organizacion').length,
      }
    }).sort((a, b) => b.total - a.total)

    const lCount = {}
    linFiltrados.forEach(l => { lCount[l.linea] = (lCount[l.linea] || 0) + 1 })
    const totalVotosLineas = linFiltrados.length || 1
    const lineasTop = Object.entries(lCount)
      .map(([linea, total]) => ({ linea, total, porcentaje: Math.round((total / totalVotosLineas) * 100) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const eCount = {}
    elFiltrados.forEach(e => { eCount[e.electiva] = (eCount[e.electiva] || 0) + 1 })
    const totalVotosElectivas = elFiltrados.length || 1
    const electivasTop = Object.entries(eCount)
      .map(([electiva, total]) => ({ electiva, total, porcentaje: Math.round((total / totalVotosElectivas) * 100) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    const facilidadesFiltradas = ingFiltrados.filter(i => i.categoria === 'facilidad' && i.competencia)

    const facilidadesPorPuesto = {}
    facilidadesFiltradas.forEach(f => {
      const puesto = f.orden_prioridad
      if (!puesto) return
      if (!facilidadesPorPuesto[puesto]) facilidadesPorPuesto[puesto] = {}
      facilidadesPorPuesto[puesto][f.competencia] = (facilidadesPorPuesto[puesto][f.competencia] || 0) + 1
    })

    const masVotadoEnPuesto = (puesto) => {
      const conteo = facilidadesPorPuesto[puesto]
      if (!conteo) return null
      const [texto, votos] = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]
      return { texto, votos }
    }

    const PESO_PUESTO = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 }
    const puntajeConsolidado = {}
    const vecesNo1 = {}
    facilidadesFiltradas.forEach(f => {
      const peso = PESO_PUESTO[f.orden_prioridad] || 0
      puntajeConsolidado[f.competencia] = (puntajeConsolidado[f.competencia] || 0) + peso
      if (f.orden_prioridad === 1) vecesNo1[f.competencia] = (vecesNo1[f.competencia] || 0) + 1
    })
    const facilidadesRanking = Object.entries(puntajeConsolidado)
      .map(([aspecto, puntaje]) => ({ aspecto, puntaje, veces_no1: vecesNo1[aspecto] || 0 }))
      .sort((a, b) => b.puntaje - a.puntaje)

    const facilidadesTop3Puestos = {
      puesto1: masVotadoEnPuesto(1),
      puesto2: masVotadoEnPuesto(2),
      puesto3: masVotadoEnPuesto(3),
    }

    const progPref = {}
    poFiltrados.filter(p => p.orden === 1).forEach(p => {
      progPref[p.programa] = (progPref[p.programa] || 0) + 1
    })

    const agruparCompetencias = (coleccion) => {
      const conteo = {}
      coleccion.forEach(c => {
        if (!c.competencia) return
        conteo[c.competencia] = (conteo[c.competencia] || 0) + 1
      })
      return Object.entries(conteo)
        .map(([competencia, total]) => ({ competencia, total }))
        .sort((a, b) => b.total - a.total)
    }

    return {
      participantes: partFiltrados,
      progOrden:     poFiltrados,
      total, completados, rural, participoAntes,
      certificados: certFiltrados.length,
      tasa:         total ? Math.round((completados / total) * 100) : 0,
      municipios:   Object.keys(porMunicipio).length,
      edadPromedio: cuentaEdad ? Math.round(sumaEdad / cuentaEdad) : 0,
      porMunicipio: Object.entries(porMunicipio).map(([municipio, total]) => ({ municipio, total })).sort((a, b) => b.total - a.total),
      porActor:     Object.entries(porActor).map(([k, v]) => ({ actor: ACTOR_LABEL[k] || k, total: v })),
      porEdad:      Object.entries(porEdad).filter(([, v]) => v > 0).map(([k, v]) => ({ rango: k, total: v })),
      municipioDetalle, lineasTop, electivasTop,
      progPref:     Object.entries(progPref).map(([k, v]) => ({ programa: PROG_LABEL[k] || k, total: v })),
      competenciasIngreso: agruparCompetencias(ingFiltrados),
      competenciasEgreso:  agruparCompetencias(egFiltrados),
      facilidadesRanking, facilidadesTop3Puestos,
      kpiTemaInvestigacionTop: lineasTop[0]?.linea || '—',
      kpiElectivaTop:          electivasTop[0]?.electiva || '—',
      kpiFacilidadNo1:         facilidadesRanking[0]?.aspecto || '—',
      kpiProgramasAnalizados:  new Set(poFiltrados.filter(p => p.orden === 1).map(p => p.programa)).size,
    }
  }, [rawData, filtroMunicipio, filtroPrograma, filtroActor, filtroEdad, filtroCompletado])

  const listadosFiltros = useMemo(() => {
    if (!rawData.participantes) return { municipios: [], actores: [] }
    return {
      municipios: [...new Set(rawData.participantes.map(p => p.municipio))].filter(Boolean).sort(),
      actores:    [...new Set(rawData.participantes.map(p => p.tipo_actor))].filter(Boolean).sort(),
    }
  }, [rawData.participantes])

  // ── Exportación CSV sábana completa ──────────────────────────────────────
  const procesarExportacionCSV = () => {
    if (!rawData.participantes?.length) return

    const sabana = rawData.participantes.map(p => {
      const programa1     = rawData.progOrden?.find(po => po.participante_id === p.id && po.orden === 1)?.programa || ''
      const programa2     = rawData.progOrden?.find(po => po.participante_id === p.id && po.orden === 2)?.programa || ''
      const lineasRep     = (rawData.lineas        || []).filter(l => l.participante_id === p.id).map(l => l.linea).join(' | ')
      const electivasRep  = (rawData.electivas     || []).filter(e => e.participante_id === p.id).map(e => e.electiva).join(' | ')
      const compIngreso   = (rawData.perfilIngreso || []).filter(i => i.participante_id === p.id).sort((a, b) => (a.orden_prioridad || 0) - (b.orden_prioridad || 0)).map(i => `${i.competencia}(${i.orden_prioridad ?? ''})`).join(' | ')
      const compEgreso    = (rawData.perfilEgreso  || []).filter(e => e.participante_id === p.id).sort((a, b) => (a.orden_prioridad || 0) - (b.orden_prioridad || 0)).map(e => `${e.competencia}(${e.orden_prioridad ?? ''})`).join(' | ')
      const certFila      = (rawData.certificados  || []).find(c => c.participante_id === p.id)
      const certificado   = certFila ? (certFila.codigo_qr || certFila.codigo_verificacion || 'SÍ') : 'No certificado'
      const visionIngreso = (rawData.perfilIngreso || []).find(i => i.participante_id === p.id && i.vision_territorial)?.vision_territorial || ''
      const manifiestoFila    = (rawData.manifiesto || []).find(m => m.participante_id === p.id)
      const mensajeFinal      = manifiestoFila?.comentario_final || ''
      const comentariosEgreso = [...new Set(
        (rawData.perfilEgreso || [])
          .filter(e => e.participante_id === p.id && e.comentario_libre)
          .map(e => `[${PROG_LABEL[e.programa] || e.programa}] ${e.comentario_libre}`)
      )].join(' || ')

      return {
        'ID Participante':                     p.id,
        'Nombre Completo':                     p.nombre              || 'Anónimo',
        'Municipio':                           p.municipio           || '',
        'Corregimiento':                       p.corregimiento       || '',
        'Vereda':                              p.vereda              || '',
        'Zona':                                p.vereda ? 'Rural-Vereda' : p.corregimiento ? 'Rural-Corregimiento' : 'Urbana',
        'Edad':                                p.edad                || '',
        'Tipo de Actor':                       ACTOR_LABEL[p.tipo_actor] || p.tipo_actor || '',
        'Colegio':                             p.colegio             || '',
        'Grado':                               p.grado               || '',
        'Institución Educativa':               p.institucion         || '',
        'Área de Enseñanza':                   p.area                || '',
        'Nivel Educativo':                     p.nivel_educativo     || '',
        'Organización':                        p.organizacion        || '',
        'Correo':                              p.correo              || '',
        '¿Completó Todo?':                     p.completado          ? 'SÍ' : 'NO',
        '¿Participó Antes?':                   p.participo_antes     ? 'SÍ' : 'NO',
        'Importancia Lengua Barí e Idiomas':   p.importancia_lengua  || 'Sin responder',
        'Programa Preferencia 1':              PROG_LABEL[programa1] || programa1,
        'Programa Preferencia 2':              PROG_LABEL[programa2] || programa2,
        'Líneas de Interés':                   lineasRep,
        'Electivas Seleccionadas':             electivasRep,
        'Competencias Perfil Ingreso':         compIngreso,
        'Competencias Perfil Egreso':          compEgreso,
        'Código Certificado':                  certificado,
        'Fecha de Registro':                   p.created_at ? new Date(p.created_at).toLocaleString('es-CO') : '',
        'Rasgo Especial Egresado':             comentariosEgreso,
        'Conocimiento Cultura Barí (0-10)':    p.conocimiento_bari ?? '',
        'Desea que estudiantes conozcan Barí': p.desea_conocer_bari === true ? 'Sí' : p.desea_conocer_bari === false ? 'No' : '',
        'Cómo conocer cultura Barí':           p.como_conocer_bari   || '',
        'Mensaje Final':                       mensajeFinal,
        'Visión Territorial del programa':     visionIngreso,
      }
    })

    exportarCSV(sabana, 'observatorio_catatumbo_sabana_completa')
  }

  // ── Exportación Excel multi-hoja (sin respuestas abiertas) ───────────────
  const procesarExportacionExcel = () => {
    if (!rawData.participantes?.length) return

    // Hoja 1: Sábana completa
    const sabana = rawData.participantes.map(p => {
      const programa1      = rawData.progOrden?.find(po => po.participante_id === p.id && po.orden === 1)?.programa || ''
      const lineasRep      = (rawData.lineas        || []).filter(l => l.participante_id === p.id).map(l => l.linea).join(' | ')
      const electivasRep   = (rawData.electivas     || []).filter(e => e.participante_id === p.id).map(e => e.electiva).join(' | ')
      const compEgreso     = (rawData.perfilEgreso  || []).filter(e => e.participante_id === p.id).sort((a, b) => (a.orden_prioridad || 0) - (b.orden_prioridad || 0)).map(e => `${e.competencia}(${e.orden_prioridad ?? ''})`).join(' | ')
      const facilidadesRep = (rawData.perfilIngreso || []).filter(i => i.participante_id === p.id && i.categoria === 'facilidad').sort((a, b) => (a.orden_prioridad || 0) - (b.orden_prioridad || 0)).map(i => `#${i.orden_prioridad}: ${i.competencia}`).join(' | ')
      const certFila       = (rawData.certificados  || []).find(c => c.participante_id === p.id)
      const certificado    = certFila ? (certFila.codigo_qr || certFila.codigo_verificacion || 'SÍ') : 'No certificado'
      const visionIngreso  = (rawData.perfilIngreso || []).find(i => i.participante_id === p.id && i.vision_territorial)?.vision_territorial || ''
      const manifiestoFila = (rawData.manifiesto    || []).find(m => m.participante_id === p.id)
      const mensajeFinal   = manifiestoFila?.comentario_final || ''
      const comentariosEgreso = [...new Set(
        (rawData.perfilEgreso || [])
          .filter(e => e.participante_id === p.id && e.comentario_libre)
          .map(e => `[${PROG_LABEL[e.programa] || e.programa}] ${e.comentario_libre}`)
      )].join(' || ')

      return {
        'ID Participante':                    p.id,
        'Nombre Completo':                    p.nombre || 'Anónimo',
        'Correo Electrónico':                 p.correo || '',
        'Municipio':                          p.municipio || '',
        'Corregimiento':                      p.corregimiento || '',
        'Vereda':                             p.vereda || '',
        'Zona':                               p.vereda ? 'Rural-Vereda' : p.corregimiento ? 'Rural-Corregimiento' : 'Urbana',
        'Edad':                               p.edad || '',
        'Tipo de Actor':                      ACTOR_LABEL[p.tipo_actor] || p.tipo_actor || '',
        'Programa Académico Preferencia 1':   PROG_LABEL[programa1] || programa1,
        '¿Completó Todo?':                    p.completado ? 'SÍ' : 'NO',
        'Facilidades de Ingreso (ordenadas)': truncarCelda(facilidadesRep),
        'Líneas de Investigación':            truncarCelda(lineasRep),
        'Electivas Seleccionadas':            truncarCelda(electivasRep),
        'Competencias Perfil Egreso':         truncarCelda(compEgreso),
        'Visión Territorial del Programa':    truncarCelda(visionIngreso),
        'Rasgo Especial Egresado':            truncarCelda(comentariosEgreso),
        'Mensaje Final':                      truncarCelda(mensajeFinal),
        'Conocimiento Cultura Barí (0-10)':   p.conocimiento_bari ?? '',
        'Código Certificado':                 certificado,
        'Fecha de Registro':                  p.created_at ? new Date(p.created_at).toLocaleString('es-CO') : '',
      }
    })

    // Hoja 2: Top Temas de Investigación
    const lineasResumen = (datosFiltrados?.lineasTop || []).map((l, i) => ({
      'Ranking': i + 1, 'Tema de Investigación': l.linea, 'Cantidad de Votos': l.total, 'Porcentaje': `${l.porcentaje}%`,
    }))

    // Hoja 3: Top Electivas
    const electivasResumen = (datosFiltrados?.electivasTop || []).map((e, i) => ({
      'Ranking': i + 1, 'Materia Complementaria': e.electiva, 'Cantidad de Votos': e.total, 'Porcentaje': `${e.porcentaje}%`,
    }))

    // Hoja 4: Ranking de Facilidades al Ingreso
    const facilidadesResumen = (datosFiltrados?.facilidadesRanking || []).map((f, i) => ({
      'Posición': i + 1, 'Aspecto': f.aspecto, 'Puntaje Ponderado': f.puntaje, 'Veces Elegido como #1': f.veces_no1,
    }))

    exportarExcelMultihoja([
      { nombre: 'Sábana Completa',              datos: sabana },
      { nombre: 'Top Temas Investigación',      datos: lineasResumen },
      { nombre: 'Top Materias Complementarias', datos: electivasResumen },
      { nombre: 'Ranking Facilidades Ingreso',  datos: facilidadesResumen },
    ], 'observatorio_catatumbo_completo')
  }

  // ── Exportación CSV Respuestas Abiertas ──────────────────────────────────
  const procesarExportacionCSVAbiertas = () => {
  if (!rawData.participantes?.length) return

  const respuestasAbiertas = []

  rawData.participantes.forEach(p => {
    const fecha = p.created_at
      ? new Date(p.created_at).toLocaleString('es-CO')
      : ''

    const programa1 = rawData.progOrden?.find(
      po => po.participante_id === p.id && po.orden === 1
    )?.programa || ''

    const progLabel = PROG_LABEL[programa1] || programa1 || 'Sin programa'

    const datosBase = {
      'Fecha de registro': fecha,
      'Nombre': p.nombre || '',
      'Correo': p.correo || '',
      'Municipio': p.municipio || '',
      'Completó el formulario': p.completado ? 'Sí' : 'No'
    }

    // Visión territorial
    const ingresoUnicos = new Map()

    ;(rawData.perfilIngreso || [])
      .filter(i => i.participante_id === p.id && i.vision_territorial)
      .forEach(i => {
        const key = `${i.participante_id}__${i.programa}`
        if (!ingresoUnicos.has(key)) ingresoUnicos.set(key, i)
      })

    ingresoUnicos.forEach(i => {
      respuestasAbiertas.push({
        ...datosBase,
        'Pregunta': '¿Cómo imagina que este programa transformará el territorio?',
        'Respuesta': i.vision_territorial || '',
      })
    })

    // Perfil de egreso
    const egresoUnicos = new Map()

    ;(rawData.perfilEgreso || [])
      .filter(e => e.participante_id === p.id && e.comentario_libre)
      .forEach(e => {
        const key = `${e.participante_id}__${e.programa}`
        if (!egresoUnicos.has(key)) egresoUnicos.set(key, e)
      })

    egresoUnicos.forEach(e => {
      respuestasAbiertas.push({
        ...datosBase,
        'Pregunta': `¿Qué rasgo o característica especial considera que debería tener un profesional de ${PROG_LABEL[e.programa] || e.programa} de la Universidad Nacional del Catatumbo?`,
        'Respuesta': e.comentario_libre || '',
      })
    })

    // Mensaje final
    const manifiestoFila = (rawData.manifiesto || []).find(
      m => m.participante_id === p.id
    )

    if (manifiestoFila?.comentario_final) {
      respuestasAbiertas.push({
        ...datosBase,
        'Pregunta': '¿Algún mensaje final para los constructores de esta universidad?',
        'Respuesta': manifiestoFila.comentario_final,
      })
    }

    // Cultura Barí
    if (p.como_conocer_bari) {
      respuestasAbiertas.push({
        ...datosBase,
        'Pregunta': '¿Cómo le gustaría que los estudiantes conocieran la cultura Barí?',
        'Respuesta': p.como_conocer_bari,
      })
    }

    // Empleabilidad
    const manifiestoEmp = (rawData.manifiesto || []).find(
      m => m.participante_id === p.id
    )

    if (manifiestoEmp) {
      const EMP_CAMPO = {
        trabajo_social: 'empleabilidad_ts',
        agronomia: 'empleabilidad_ia',
        administracion: 'empleabilidad_adm'
      }

      const campoEmp = EMP_CAMPO[programa1]
      const valorEmp = campoEmp ? manifiestoEmp[campoEmp] : null

      if (valorEmp) {
        respuestasAbiertas.push({
          ...datosBase,
          'Pregunta': `Desde su experiencia, ¿en qué instituciones, organizaciones, empresas o sectores podrían trabajar los egresados de ${progLabel} en el Catatumbo?`,
          'Respuesta': valorEmp,
        })
      }
    }
  })

  exportarCSV(
    respuestasAbiertas,
    'observatorio_catatumbo_respuestas_abiertas'
  )
}

  // ── Eliminación de registros ──────────────────────────────────────────────
  const eliminarRegistros = async (tipo) => {
    setEliminando(true); setMensajeElim(null)
    const TABLAS_HIJO = ['manifiesto', 'certificados', 'electivas', 'lineas_investigacion', 'perfil_egreso', 'perfil_ingreso', 'programas_orden']
    try {
      if (tipo === 'incompletos') {
        const { data: incom } = await supabase.from('participantes').select('id').eq('completado', false)
        if (incom?.length) {
          const ids = incom.map(p => p.id)
          for (const t of TABLAS_HIJO) await supabase.from(t).delete().in('participante_id', ids)
          await supabase.from('respuestas').delete().in('sesion_id', ids)
          await supabase.from('participantes').delete().eq('completado', false)
        }
        setMensajeElim({ ok: true, texto: '✅ Registros incompletos depurados correctamente.' })
      } else if (tipo === 'todo') {
        for (const t of TABLAS_HIJO) await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('respuestas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('participantes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        setMensajeElim({ ok: true, texto: '✅ Base de datos restablecida por completo.' })
      }
      await cargarDatos()
    } catch (err) {
      setMensajeElim({ ok: false, texto: '⚠️ Error al eliminar: ' + err.message })
    } finally {
      setEliminando(false); setModalEliminar(null)
    }
  }

  if (!autenticado) return <LoginUIS onLogin={n => { setNombreAdmin(n); setAutenticado(true) }} />

  const VISTAS = [
    { id: 0, label: '📋 Resumen' },
    { id: 1, label: '🗺️ Territorio' },
    { id: 2, label: '📚 Líneas & Electivas' },
    { id: 3, label: '👥 Participantes' },
    { id: 4, label: '🎯 Programas' },
    { id: 5, label: '🧠 Análisis Avanzado' },
  ]

  const hayFiltros = filtroMunicipio || filtroPrograma || filtroActor || filtroEdad || filtroCompletado

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* HEADER */}
      <header style={{ background: G.greenDark }} className="shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-sm flex items-center justify-center min-w-[50px] h-11">
              <img src="/LOGO_UIS.svg" alt="Logo UIS" className="h-8 w-auto object-contain"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
              <span className="text-xl font-black tracking-tighter hidden" style={{ color: G.greenDark }}>UIS</span>
            </div>
            <div>
              <h1 className="font-display font-black text-white text-lg leading-tight">Observatorio Académico del Catatumbo</h1>
              <p className="font-body text-white/70 text-xs">Panel Ejecutivo de Acreditación y Validación Territorial</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {nombreAdmin && <span className="text-white/80 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">👤 {nombreAdmin}</span>}
            <ExportMenu
              onCSV={procesarExportacionCSV}
              onExcel={procesarExportacionExcel}
              onCSVAbiertas={procesarExportacionCSVAbiertas}
            />
            <button onClick={cargarDatos} className="text-xs bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-1.5 rounded-lg font-medium transition-colors">🔄 Actualizar</button>
            <button onClick={() => setModalEliminar('menu')} className="text-xs bg-red-700/40 text-red-100 hover:bg-red-700/60 px-3 py-1.5 rounded-lg transition-colors">🗑️ Depurar</button>
            <button onClick={cerrarSesion} className="text-xs text-white/60 hover:text-white pl-2 font-bold">Salir →</button>
          </div>
        </div>
        <div className="border-t border-white/10 bg-black/10">
          <div className="max-w-7xl mx-auto px-5 flex gap-1 overflow-x-auto">
            {VISTAS.map(v => (
              <button key={v.id} onClick={() => setVista(v.id)}
                className="px-4 py-3.5 font-display font-bold text-sm border-b-4 transition-all whitespace-nowrap"
                style={vista === v.id ? { borderColor: '#a8e063', color: '#a8e063' } : { borderColor: 'transparent', color: 'rgba(255,255,255,0.6)' }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* FILTROS GLOBALES */}
      <section className="bg-white border-b border-gray-200 py-4 px-5 shadow-sm sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <span className="text-gray-400 font-bold uppercase text-xs">Filtros:</span>
            <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">🗺️ Todos los Municipios</option>
              {listadosFiltros.municipios.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filtroPrograma} onChange={e => setFiltroPrograma(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">🎯 Todos los Programas</option>
              {Object.entries(PROG_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filtroActor} onChange={e => setFiltroActor(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">👥 Todos los Actores</option>
              {Object.entries(ACTOR_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filtroEdad} onChange={e => setFiltroEdad(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">⏳ Todas las Edades</option>
              {['< 18', '18-25', '26-35', '36-45', '46+'].map(r => <option key={r} value={r}>{r} años</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer text-gray-600">
              <input type="checkbox" checked={filtroCompletado} onChange={e => setFiltroCompletado(e.target.checked)}
                className="rounded text-green-600 h-3.5 w-3.5" />
              Solo Completados
            </label>
          </div>
          {hayFiltros && (
            <button onClick={limpiarFiltros} className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg hover:text-red-700">
              ✕ Limpiar Filtros
            </button>
          )}
        </div>
      </section>

      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto px-5 py-6">
        {cargando ? (
          <div className="flex items-center justify-center py-32 flex-col gap-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${G.green}33`, borderTopColor: G.green }} />
            <p className="font-body text-gray-500 text-sm font-semibold">Cargando datos desde Supabase...</p>
          </div>
        ) : !datosFiltrados || datosFiltrados.total === 0 ? (
          <SinDatos mensaje={hayFiltros ? 'Sin resultados para los filtros aplicados.' : 'No hay participantes registrados aún.'} />
        ) : (
          <>
            {/* VISTA 0: RESUMEN */}
            {vista === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard emoji="👥" label="Participantes"    value={datosFiltrados.total}       accent={G.green} />
                  <StatCard emoji="✅" label="Completaron"      value={datosFiltrados.completados} sub={`${datosFiltrados.tasa}% tasa de éxito`} accent={G.blue} />
                  <StatCard emoji="🌾" label="Población Rural"  value={datosFiltrados.rural}       sub="Veredas y Corregimientos" accent={G.orange} />
                  <StatCard emoji="📍" label="Municipios"       value={datosFiltrados.municipios}  accent={G.purple} />
                </div>

                <div>
                  <p className="text-xs font-display font-bold uppercase tracking-wide text-gray-400 mb-2">
                    Indicadores Rápidos {filtroPrograma ? `· ${PROG_LABEL[filtroPrograma]}` : '· Todos los programas'}
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard emoji="📨" label="Total Respuestas"           value={datosFiltrados.total}                  accent={G.green} />
                    <StatCard emoji="🎓" label="Programas Analizados"       value={datosFiltrados.kpiProgramasAnalizados} accent={G.blue} />
                    <StatCard emoji="🔬" label="Tema Investigación Top"     value={datosFiltrados.kpiTemaInvestigacionTop} accent={G.purple} />
                    <StatCard emoji="📚" label="Materia Complementaria Top" value={datosFiltrados.kpiElectivaTop}         accent={G.orange} />
                    <StatCard emoji="🥇" label="Facilidad #1 al Ingreso"   value={datosFiltrados.kpiFacilidadNo1}        accent={G.red} />
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-3">Segmentación de Actores</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={datosFiltrados.porActor} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="total" nameKey="actor">
                          {datosFiltrados.porActor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-1">Distribución por Edad</h3>
                    <p className="text-xs text-gray-400 mb-3">Promedio: {datosFiltrados.edadPromedio} años</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={datosFiltrados.porEdad}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="rango" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={G.green} radius={[4, 4, 0, 0]} name="Participantes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-4">Top Municipios</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={datosFiltrados.porMunicipio.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="municipio" width={80} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={G.purple} radius={[0, 4, 4, 0]} name="Participantes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* VISTA 1: TERRITORIO */}
            {vista === 1 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 mb-4">Distribución Geográfica (Urbano vs Rural)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosFiltrados.municipioDetalle}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="municipio" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip /><Legend />
                      <Bar
    dataKey="urbanos"
    name="Urbano"
    stackId="t"
    fill={G.blue}
/>

<Bar
    dataKey="rural"
    name="Rural"
    stackId="t"
    fill={G.green}
    radius={[4,4,0,0]}
/>
</BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: G.greenBg }} className="text-xs uppercase tracking-wider text-gray-700 font-bold border-b border-gray-100">
                        {[ 'Municipio', 'Total', 'Completados', 'Urbano', 'Rural', 'Estudiante', 'Docente', 'Comunidad', 'Organización' ].map(h => (
                          <th key={h} className="p-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {datosFiltrados.municipioDetalle.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50/80">
                          <td className="p-4 font-bold text-gray-900">{m.municipio}</td>
                          <td className="p-4 font-bold text-green-600">{m.total}</td>
                          <td className="p-4 text-gray-600">{m.completados}</td>
                          <td className="p-4 text-gray-600">{m.urbanos}</td>
                          <td className="p-4 text-gray-600">{m.rural}</td>
                          <td className="p-4 text-gray-600">{m.estudiantes}</td>
                          <td className="p-4 text-gray-600">{m.docentes}</td>
                          <td className="p-4 text-gray-600">{m.comunidad}</td>
                          <td className="p-4 text-gray-600">{m.organizaciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VISTA 2: LÍNEAS & ELECTIVAS */}
            {vista === 2 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 text-sm mb-1">¿En qué temas consideras que debería investigar este programa?</h3>
                  <p className="text-xs text-gray-400 mb-4">Top 10 temas más seleccionados {filtroPrograma ? `· ${PROG_LABEL[filtroPrograma]}` : '· Todos los programas'}</p>
                  {datosFiltrados.lineasTop.length ? (
                    <>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={datosFiltrados.lineasTop} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="linea" width={140} tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(v, n, props) => [`${v} votos (${props.payload.porcentaje}%)`, 'Votos']} />
                          <Bar dataKey="total" fill={G.purple} radius={[0, 4, 4, 0]} name="Votos" />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-3 divide-y divide-gray-50 text-xs">
                        {datosFiltrados.lineasTop.map((l, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-gray-600"><strong className="text-gray-400 mr-1">{i + 1}.</strong>{l.linea}</span>
                            <span className="font-bold text-gray-800 whitespace-nowrap ml-2">{l.total} <span className="text-gray-400 font-normal">({l.porcentaje}%)</span></span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <SinDatos />}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 text-sm mb-1">¿Qué materias complementarias enriquecerían la formación?</h3>
                  <p className="text-xs text-gray-400 mb-4">Top 10 materias más seleccionadas {filtroPrograma ? `· ${PROG_LABEL[filtroPrograma]}` : '· Todos los programas'}</p>
                  {datosFiltrados.electivasTop.length ? (
                    <>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={datosFiltrados.electivasTop} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="electiva" width={140} tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(v, n, props) => [`${v} votos (${props.payload.porcentaje}%)`, 'Votos']} />
                          <Bar dataKey="total" fill={G.blue} radius={[0, 4, 4, 0]} name="Votos" />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-3 divide-y divide-gray-50 text-xs">
                        {datosFiltrados.electivasTop.map((e, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-gray-600"><strong className="text-gray-400 mr-1">{i + 1}.</strong>{e.electiva}</span>
                            <span className="font-bold text-gray-800 whitespace-nowrap ml-2">{e.total} <span className="text-gray-400 font-normal">({e.porcentaje}%)</span></span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <SinDatos />}
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 text-sm mb-1">
                    ¿Qué debería facilitar la Universidad Nacional del Catatumbo al inicio del programa para que el estudiante que ingrese pueda continuar su proceso de formación?
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Pregunta de priorización (ordenamiento) {filtroPrograma ? `· ${PROG_LABEL[filtroPrograma]}` : '· Todos los programas'}
                  </p>
                  {datosFiltrados.facilidadesRanking.length ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                        {[
                          { puesto: 1, data: datosFiltrados.facilidadesTop3Puestos.puesto1, color: G.green,  bg: '#f2faeb' },
                          { puesto: 2, data: datosFiltrados.facilidadesTop3Puestos.puesto2, color: G.blue,   bg: '#eff8ff' },
                          { puesto: 3, data: datosFiltrados.facilidadesTop3Puestos.puesto3, color: G.purple, bg: '#f6f0ff' },
                        ].map(({ puesto, data, color, bg }) => (
                          <div key={puesto} className="rounded-2xl p-4" style={{ background: bg }}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color }}>Más elegido en puesto #{puesto}</p>
                            {data ? (
                              <>
                                <p className="font-display font-bold text-sm text-gray-800 leading-snug">{data.texto}</p>
                                <p className="text-xs text-gray-500 mt-1">{data.votos} {data.votos === 1 ? 'persona lo eligió' : 'personas lo eligieron'} en el puesto #{puesto}</p>
                              </>
                            ) : <p className="text-xs text-gray-400">Sin datos aún</p>}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-display font-bold uppercase tracking-wide text-gray-400 mb-2">Ranking general consolidado (puntaje ponderado por posición)</p>
                      <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr style={{ background: G.greenBg }} className="text-xs uppercase tracking-wider text-gray-700 font-bold">
                              <th className="p-3">Posición</th>
                              <th className="p-3">Aspecto</th>
                              <th className="p-3">Puntaje Ponderado</th>
                              <th className="p-3">Veces elegido como #1</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm">
                            {datosFiltrados.facilidadesRanking.map((f, i) => (
                              <tr key={i} className="hover:bg-gray-50/80">
                                <td className="p-3 font-bold text-gray-400">{i + 1}</td>
                                <td className="p-3 text-gray-800">{f.aspecto}</td>
                                <td className="p-3 font-bold" style={{ color: G.green }}>{f.puntaje}</td>
                                <td className="p-3 text-gray-600">{f.veces_no1}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : <SinDatos mensaje="Sin datos de facilidades aún." />}
                </div>
              </div>
            )}

            {/* VISTA 3: PARTICIPANTES */}
            {vista === 3 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <span className="text-gray-400 text-sm">🔍</span>
                  <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o municipio..."
                    className="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none" />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: G.greenBg }} className="text-xs uppercase tracking-wider text-gray-700 font-bold border-b border-gray-100">
                        {['Nombre', 'Municipio', 'Actor', 'Edad', 'Barí', 'Estado'].map(h => <th key={h} className="p-4">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {datosFiltrados.participantes
                        .filter(p => !busqueda ||
                          p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.municipio?.toLowerCase().includes(busqueda.toLowerCase()))
                        .slice(0, 50)
                        .map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50/80">
                            <td className="p-4 font-semibold text-gray-900">{p.nombre || 'Anónimo'}</td>
                            <td className="p-4 text-gray-600">{p.municipio}</td>
                            <td className="p-4 text-xs font-bold text-purple-700 uppercase">{p.tipo_actor}</td>
                            <td className="p-4 text-gray-600">{p.edad || '—'}</td>
                            <td className="p-4 text-xs text-gray-500">{p.conocimiento_bari ?? '—'}/10</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.completado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                {p.completado ? 'Completado' : 'Incompleto'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VISTA 4: PROGRAMAS */}
            {vista === 4 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 mb-2">Primera Preferencia de Programas</h3>
                  <p className="text-xs text-gray-400 mb-4">Programa seleccionado con prioridad 1</p>
                  {datosFiltrados.progPref.length ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={datosFiltrados.progPref}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="programa" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={G.green} radius={[4, 4, 0, 0]}>
                          {datosFiltrados.progPref.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <SinDatos />}
                </div>
              </div>
            )}

            {/* VISTA 5: ANÁLISIS AVANZADO */}
            {vista === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard emoji="📈" label="Tasa de Completitud"  value={`${datosFiltrados.tasa}%`}       accent={G.green} />
                  <StatCard emoji="📜" label="Certificados"         value={datosFiltrados.certificados}      accent={G.blue} />
                  <StatCard emoji="🔄" label="Participación Previa" value={datosFiltrados.participoAntes}    accent={G.orange} />
                  <StatCard emoji="🧮" label="Muestra Total"        value={datosFiltrados.total}             accent={G.purple} />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-1">
                      ¿Qué debería facilitar la Universidad Nacional del Catatumbo al inicio del programa para que el estudiante que ingrese pueda continuar su proceso de formación?
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">Top 5 del ranking consolidado · ver detalle completo en "Líneas & Electivas"</p>
                    {datosFiltrados.facilidadesRanking.length ? (
                      <div className="space-y-2">
                        {datosFiltrados.facilidadesRanking.slice(0, 5).map((f, i) => (
                          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                            <span className="text-sm text-gray-700"><strong className="text-gray-400 mr-1.5">{i + 1}.</strong>{f.aspecto}</span>
                            <span className="text-xs font-bold whitespace-nowrap ml-2" style={{ color: G.green }}>{f.puntaje} pts</span>
                          </div>
                        ))}
                      </div>
                    ) : <SinDatos />}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-1">Perfil de Egreso: Competencias</h3>
                    <p className="text-xs text-gray-400 mb-3">Priorización al finalizar el ciclo formativo</p>
                    {datosFiltrados.competenciasEgreso.length ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={datosFiltrados.competenciasEgreso.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="competencia" tick={{ fontSize: 9, angle: -15, textAnchor: 'end' }} height={50} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="total" name="Relevancia" fill={G.purple} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <SinDatos />}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 text-sm mb-1">Conocimiento sobre la Cultura Barí</h3>
                  <p className="text-xs text-gray-400 mb-3">Promedio reportado (escala 0-10) y disposición a aprender</p>
                  {(() => {
                    const vals     = datosFiltrados.participantes.map(p => p.conocimiento_bari).filter(v => v !== null && v !== undefined)
                    const prom     = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
                    const desean   = datosFiltrados.participantes.filter(p => p.desea_conocer_bari === true).length
                    const noDesean = datosFiltrados.participantes.filter(p => p.desea_conocer_bari === false).length
                    return prom ? (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <p className="font-black text-3xl text-gray-900">{prom}</p>
                          <p className="text-xs text-gray-500 mt-1">Promedio conocimiento</p>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-4">
                          <p className="font-black text-3xl text-green-700">{desean}</p>
                          <p className="text-xs text-gray-500 mt-1">Quieren saber más</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <p className="font-black text-3xl text-gray-500">{noDesean}</p>
                          <p className="text-xs text-gray-500 mt-1">No quieren saber más</p>
                        </div>
                      </div>
                    ) : <SinDatos mensaje="Sin datos de cultura Barí aún." />
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* TOAST */}
      {mensajeElim && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-6 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border"
            style={mensajeElim.ok
              ? { background: '#14532d', color: '#4ade80', borderColor: '#166534' }
              : { background: '#450a0a', color: '#f87171', borderColor: '#7f1d1d' }}>
            {mensajeElim.texto}
            <button onClick={() => setMensajeElim(null)} className="ml-2">✕</button>
          </div>
        </div>
      )}

      {/* MODAL ELIMINACIÓN */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            {modalEliminar === 'menu' && (
              <>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2">🗑️</div>
                  <h3 className="font-display font-black text-lg text-gray-900">Mantenimiento de Datos</h3>
                </div>
                <div className="space-y-2.5 mb-5">
                  <button onClick={() => setModalEliminar('confirmar-incompletos')}
                    className="w-full text-left bg-amber-50/50 border border-amber-200 rounded-xl p-3 hover:bg-amber-100/50 transition-colors">
                    <p className="font-bold text-amber-800 text-xs">⚠️ Eliminar Registros Incompletos</p>
                    <p className="text-amber-600 text-[11px] mt-0.5">Limpia las sesiones que no concluyeron el formulario.</p>
                  </button>
                  <button onClick={() => setModalEliminar('confirmar-todo')}
                    className="w-full text-left bg-red-50/50 border border-red-200 rounded-xl p-3 hover:bg-red-100/50 transition-colors">
                    <p className="font-bold text-red-700 text-xs">🚨 Vaciar Repositorio Completo</p>
                    <p className="text-red-500 text-[11px] mt-0.5">Borrado en cascada absoluto de todas las tablas.</p>
                  </button>
                </div>
                <button onClick={() => setModalEliminar(null)} className="w-full py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-500">Cancelar</button>
              </>
            )}
            {modalEliminar === 'confirmar-incompletos' && (
              <>
                <div className="text-center mb-5">
                  <span className="text-4xl block mb-2">⚠️</span>
                  <h3 className="font-display font-black text-lg text-gray-900">¿Remover abandonos?</h3>
                  <p className="text-gray-500 text-xs mt-1">Se purgarán los aspirantes sin certificado generado.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModalEliminar('menu')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold">Volver</button>
                  <button onClick={() => eliminarRegistros('incompletos')} disabled={eliminando}
                    className="flex-1 py-2.5 rounded-xl text-white bg-amber-600 text-xs font-bold">
                    {eliminando ? 'Procesando...' : 'Sí, Limpiar'}
                  </button>
                </div>
              </>
            )}
            {modalEliminar === 'confirmar-todo' && (
              <ConfirmarTodo eliminando={eliminando} onConfirmar={() => eliminarRegistros('todo')} onVolver={() => setModalEliminar('menu')} />
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-gray-200 mt-12 py-4 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between text-xs font-medium text-gray-400">
          <span>Universidad Industrial de Santander · Observatorio Catatumbo © 2026</span>
          <span style={{ color: G.greenDark }} className="font-bold">¡Con Dignidad, CUMPLIMOS!</span>
        </div>
      </footer>
    </div>
  )
}