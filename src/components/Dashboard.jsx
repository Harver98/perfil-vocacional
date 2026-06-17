import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
  LineChart, Line, FunnelChart, Funnel, LabelList,
} from 'recharts'

// ── Colores Institucionales ───────────────────────────────────────────────────
const G = {
  green:      '#67B93E',
  greenDark:  '#3d7820',
  greenBg:    '#f2faeb',
  purple:     '#5b2d8e',
  blue:       '#1a6fa8',
  orange:     '#c96a00',
  red:        '#dc2626',
}
const COLORS = [G.green, G.purple, G.blue, G.orange, G.red, '#0891b2', '#7c3aed']
const CATEGORY_COLORS = { SABER: G.blue, HACER: G.orange, SER: G.purple }

const PROG_LABEL = {
  trabajo_social: 'Trabajo Social',
  agronomia:      'Ing. Agronómica',
  administracion: 'Adm. Empresas',
  agroindustrial: 'Ing. Agroindustrial'
}
const ACTOR_LABEL = {
  estudiante:   'Estudiante',
  docente:      'Docente',
  comunidad:    'Comunidad',
  organizacion: 'Organización',
}

// ── Utilidades de exportación ─────────────────────────────────────────────────
const exportarCSV = (datos, nombreArchivo) => {
  if (!datos?.length) return
  
  // Extrae los encabezados bonitos en español que definimos arriba
  const headers = Object.keys(datos[0]).join(',')
  
  const filas = datos.map(fila =>
    Object.values(fila).map(v => {
      if (v === null || v === undefined) return '';
      // Si la respuesta tiene comas, comillas o saltos de línea, la encerramos en comillas dobles y limpiamos
      let texto = String(v).replace(/"/g, '""'); 
      return texto.includes(',') || texto.includes('\n') || texto.includes('\r') ? `"${texto}"` : texto;
    }).join(',')
  )
  
  const csv = [headers, ...filas].join('\n')
  // El caracter \uFEFF fuerza a Excel a abrir el archivo detectando correctamente las tildes y eñes (UTF-8)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.csv`; a.click()
  URL.revokeObjectURL(url)
}

const exportarJSON = (datos, nombreArchivo) => {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${nombreArchivo}.json`; a.click()
  URL.revokeObjectURL(url)
}

const imprimirVista = () => window.print()

// ── Componentes UI ────────────────────────────────────────────────────────────
function StatCard({ emoji, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{emoji}</span>
        <div className="w-2 h-2 rounded-full mt-1" style={{ background: accent || G.green }} />
      </div>
      <p className="font-display font-black text-3xl text-gray-900">{value ?? '—'}</p>
      <p className="font-display font-semibold text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="font-body text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function SinDatos({ h = 52 }) {
  return (
    <div className={`h-${h} flex flex-col items-center justify-center text-gray-300`}>
      <span className="text-4xl mb-2">📭</span>
      <p className="font-body text-sm font-medium">Sin datos aún para este segmento</p>
    </div>
  )
}

function ExportMenu({ onCSV, onJSON, onPrint }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-display font-semibold transition-all"
        style={{ borderColor: G.green, color: G.green, background: G.greenBg }}>
        ⬇️ Exportar
        <span className="text-xs opacity-60">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 min-w-36">
          {[
            { icon: '📊', label: 'CSV / Excel', fn: () => { onCSV(); setOpen(false) } },
            { icon: '📋', label: 'JSON',        fn: () => { onJSON(); setOpen(false) } },
            { icon: '🖨️', label: 'Imprimir',    fn: () => { onPrint(); setOpen(false) } },
          ].map(op => (
            <button key={op.label} onClick={op.fn}
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
      <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm relative z-10">
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
            className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-gray-700 text-sm focus:outline-none transition-all focus:border-green-500" />
        </div>
        <div className="mb-5">
          <label className="block text-xs font-display font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Contraseña</label>
          <div className="relative">
            <input type={mostrarPass ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 font-body text-gray-700 text-sm focus:outline-none transition-all focus:border-green-500" />
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
        <p className="text-gray-500 font-body text-sm mt-2">Esta acción vaciará el histórico completo de participantes de forma irreversible.</p>
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

// ── Componente Principal Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const [autenticado,   setAutenticado]   = useState(false)
  const [nombreAdmin,   setNombreAdmin]   = useState('')
  const [vista,         setVista]         = useState(0)
  const [cargando,      setCargando]      = useState(true)
  const [rawData,       setRawData]       = useState({})
  const [datos,         setDatos]         = useState(null)
  
  // Modales y eliminación
  const [modalEliminar, setModalEliminar] = useState(null)
  const [eliminando,    setEliminando]    = useState(false)
  const [mensajeElim,   setMensajeElim]   = useState(null)
  const [busqueda,      setBusqueda]      = useState('')

  // Filtros Globales Avanzados
  const [filtroMunicipio,   setFiltroMunicipio]   = useState('')
  const [filtroPrograma,    setFiltroPrograma]    = useState('')
  const [filtroActor,       setFiltroActor]       = useState('')
  const [filtroEdad,        setFiltroEdad]        = useState('')
  const [filtroCompletado,  setFiltroCompletado]  = useState(false)

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
    await supabase.auth.signOut(); setAutenticado(false); setDatos(null)
  }

  // Carga e indexación multidimensional de datos
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
      { data: vLengua },
      { data: vPrograma },
      { data: listaRespuestas } 
    ] = await Promise.all([
      supabase.from('participantes').select('*'),
      supabase.from('programas_orden').select('*'),
      supabase.from('lineas_investigacion').select('*'),
      supabase.from('electivas').select('*'),
      supabase.from('certificados').select('*'),
      supabase.from('perfil_ingreso').select('*'),
      supabase.from('perfil_egreso').select('*'),
      supabase.from('vista_analisis_lengua').select('*'), 
      supabase.from('vista_por_programa').select('*'),
      supabase.from('respuestas').select('*') // <-- Traemos la tabla respuestas de Supabase
    ])

    setRawData({ 
      participantes: participantes || [], 
      progOrden: progOrden || [], 
      lineas: lineas || [], 
      electivas: electivas || [], 
      certificados: certificados || [],
      perfilIngreso: pIngreso || [],
      perfilEgreso: pEgreso || [],
      vistaLengua: vLengua || [],
      vistaPrograma: vPrograma || [],
      respuestasTabla: listaRespuestas || [] // <-- La guardamos en el estado general
    })
  } catch (err) {
    console.error('Error estructurando fuentes del observatorio:', err)
  } finally {
    setCargando(false)
  }
}, [])

  useEffect(() => { if (autenticado) cargarDatos() }, [autenticado, cargarDatos])

  // Resetear filtros globales
  const limpiarFiltros = () => {
    setFiltroMunicipio('')
    setFiltroPrograma('')
    setFiltroActor('')
    setFiltroEdad('')
    setFiltroCompletado(false)
  }

  // ── Engine de Filtros Dinámicos (Uso de useMemo) ───────────────────────────
  const datosFiltrados = useMemo(() => {
    if (!rawData.participantes) return null

    // 1. Filtrar Participantes Raíz
    const partFiltrados = rawData.participantes.filter(p => {
      if (filtroMunicipio && p.municipio !== filtroMunicipio) return false
      if (filtroActor && p.tipo_actor !== filtroActor) return false
      if (filtroCompletado && !p.completado) return false
      
      // ✅ CORRECCIÓN EDAD: Calibración matemática de rangos de edad enteros
      if (filtroEdad) {
        const e = parseInt(p.edad, 10)
        if (isNaN(e)) return false // Si no hay edad registrada, se descarta si hay filtro activo
        if (filtroEdad === '< 18' && e >= 18) return false
        if (filtroEdad === '18-25' && (e < 18 || e > 25)) return false
        if (filtroEdad === '26-35' && (e < 26 || e > 35)) return false
        if (filtroEdad === '36-45' && (e < 36 || e > 45)) return false
        if (filtroEdad === '46+' && e <= 45) return false
      }

      // ✅ CORRECCIÓN PROGRAMA: Busca coincidencia en cualquier orden de preferencia (1 o 2)
      if (filtroPrograma) {
        const tieneProg = rawData.progOrden?.some(
          po => po.participante_id === p.id && po.programa === filtroPrograma
        )
        if (!tieneProg) return false
      }
      return true
    })

    const targetIds = new Set(partFiltrados.map(p => p.id))

    // 2. Filtrar sub-tablas basadas en herencia relacional por ID participante
    const poFiltrados = (rawData.progOrden || []).filter(po => targetIds.has(po.participante_id))
    const linFiltrados = (rawData.lineas || []).filter(l => targetIds.has(l.participante_id))
    const elFiltrados = (rawData.electivas || []).filter(e => targetIds.has(e.participante_id))
    const certFiltrados = (rawData.certificados || []).filter(c => targetIds.has(c.participante_id))
    const ingFiltrados = (rawData.perfilIngreso || []).filter(i => targetIds.has(i.participante_id))
    const egFiltrados = (rawData.perfilEgreso || []).filter(e => targetIds.has(e.participante_id))

    // 3. Re-calcular Métricas y Agrupaciones en Tiempo Real
    const total = partFiltrados.length
    const completados = partFiltrados.filter(p => p.completado).length
    const rural = partFiltrados.filter(p => p.vereda || p.corregimiento).length
    const participoAntes = partFiltrados.filter(p => p.participo_antes).length
    
    let sumaEdad = 0, cuentaEdad = 0
    const porMunicipio = {}
    const porActor = {}
    const porEdad = { '< 18': 0, '18-25': 0, '26-35': 0, '36-45': 0, '46+': 0 }

    partFiltrados.forEach(p => {
      porMunicipio[p.municipio] = (porMunicipio[p.municipio] || 0) + 1
      porActor[p.tipo_actor] = (porActor[p.tipo_actor] || 0) + 1
      const e = parseInt(p.edad, 10)
      if (!isNaN(e)) { sumaEdad += e; cuentaEdad++ }
      
      if (e < 18) porEdad['< 18']++
      else if (e <= 25) porEdad['18-25']++
      else if (e <= 35) porEdad['26-35']++
      else if (e <= 45) porEdad['36-45']++
      else if (e > 45) porEdad['46+']++
    })

    // Construir desglose analítico de municipios
    const municipioDetalle = Object.entries(porMunicipio).map(([mun, tot]) => {
      const pMun = partFiltrados.filter(p => p.municipio === mun)
      return {
        municipio: mun,
        total: tot,
        completados: pMun.filter(p => p.completado).length,
        de_vereda: pMun.filter(p => p.vereda).length,
        de_corregimiento: pMun.filter(p => p.corregimiento).length,
        urbanos: pMun.filter(p => !p.vereda && !p.corregimiento).length,
        estudiantes: pMun.filter(p => p.tipo_actor === 'estudiante').length,
        docentes: pMun.filter(p => p.tipo_actor === 'docente').length,
        comunidad: pMun.filter(p => p.tipo_actor === 'comunidad').length,
        organizaciones: pMun.filter(p => p.tipo_actor === 'organizacion').length,
      }
    }).sort((a,b) => b.total - a.total)

    // Agrupación de Líneas y Electivas Top
    const lCount = {}
    linFiltrados.forEach(l => { lCount[l.linea] = (lCount[l.linea] || 0) + 1 })
    const lineasTop = Object.entries(lCount).map(([linea, total]) => ({ linea, total })).sort((a,b)=>b.total-a.total).slice(0, 10)

    const eCount = {}
    elFiltrados.forEach(e => { eCount[e.electiva] = (eCount[e.electiva] || 0) + 1 })
    const electivasTop = Object.entries(eCount).map(([electiva, total]) => ({ electiva, total })).sort((a,b)=>b.total-a.total).slice(0, 8)

    // Orden de Programas Preferidos (Posición 1)
    const progPref = {}
    poFiltrados.filter(p => p.orden === 1).forEach(p => {
      progPref[p.programa] = (progPref[p.programa] || 0) + 1
    })

    // ── PROCESAMIENTO PESTAÑA ÁNALISIS
    const agruparCompetencias = (coleccion) => {
      const conteo = {}
      coleccion.forEach(c => {
        if(!c.competencia) return
        const key = `${c.categoria || 'SABER'}-${c.competencia}`
        conteo[key] = (conteo[key] || 0) + 1
      })
      return Object.entries(conteo).map(([llave, total]) => {
        const [categoria, competencia] = llave.split('-')
        return { categoria, competencia, total }
      }).sort((a,b)=> b.total - a.total)
    }

    const competenciasIngreso = agruparCompetencias(ingFiltrados)
    const competenciasEgreso = agruparCompetencias(egFiltrados)

    // Desglose dinámico de Lengua Barí basado en las respuestas reales filtradas
    const respuestasLenguaFiltradas = (rawData.respuestasTabla || []).filter(
      r => targetIds.has(r.sesion_id) && r.importancia_lengua
    )
    const conteoLengua = {}
    respuestasLenguaFiltradas.forEach(r => {
      conteoLengua[r.importancia_lengua] = (conteoLengua[r.importancia_lengua] || 0) + 1
    })

    const opcionesMock = ['Muy importante', 'Importante', 'Medianamente importante', 'Poco importante', 'Nada importante']
    const analisisLengua = opcionesMock.map(op => ({
      name: op,
      value: conteoLengua[op] || 0
    }))

    return {
      total,
      completados,
      rural,
      participoAntes,
      certificados: certFiltrados.length,
      tasa: total ? Math.round((completados / total) * 100) : 0,
      municipios: Object.keys(porMunicipio).length,
      edadPromedio: cuentaEdad ? Math.round(sumaEdad / cuentaEdad) : 0,
      porMunicipio: Object.entries(porMunicipio).map(([municipio, total]) => ({ municipio, total })).sort((a,b)=>b.total-a.total),
      porActor: Object.entries(porActor).map(([k, v]) => ({ actor: ACTOR_LABEL[k] || k, total: v })),
      porEdad: Object.entries(porEdad).filter(([,v]) => v > 0).map(([k,v]) => ({ rango: k, total: v })),
      municipioDetalle,
      lineasTop,
      electivasTop,
      progPref: Object.entries(progPref).map(([k, v]) => ({ programa: PROG_LABEL[k] || k, total: v })),
      competenciasIngreso,
      competenciasEgreso,
      analisisLengua,
      vistaPrograma: rawData.vistaPrograma || []
    }
  }, [rawData, filtroMunicipio, filtroPrograma, filtroActor, filtroEdad, filtroCompletado])

  // Extracción de universos para llenar los Filtros Desplegables
  const listadosFiltros = useMemo(() => {
    if (!rawData.participantes) return { municipios: [], actores: [] }
    const mun = [...new Set(rawData.participantes.map(p => p.municipio))].filter(Boolean).sort()
    const act = [...new Set(rawData.participantes.map(p => p.tipo_actor))].filter(Boolean).sort()
    return { municipios: mun, actores: act }
  }, [rawData.participantes])

  // Controladores de Limpieza Dinámica de Registros
  // Reemplaza esta función dentro de tu Dashboard.jsx
  const eliminarRegistros = async (tipo) => {
    setEliminando(true); setMensajeElim(null)
    try {
      // 1. Declaramos el orden estricto de las tablas relacionales para evitar fallos de llaves foráneas.
      // Incluimos 'respuestas' en la lista de depuración.
      const tablasRelacionales = [
        'manifiesto',
        'certificados',
        'electivas',
        'lineas_investigacion',
        'perfil_egreso',
        'perfil_ingreso',
        'programas_orden',
        'respuestas' // <-- Agregada para limpieza en Supabase
      ]

      if (tipo === 'incompletos') {
        // Buscar los IDs de participantes que no han terminado el formulario
        const { data: incom } = await supabase.from('participantes').select('id').eq('completado', false)
        
        if (incom?.length) {
          const ids = incom.map(p => p.id)
          
          // Borrar de todas las subtablas donde la columna es 'participante_id'
          for (const t of tablasRelacionales.filter(t => t !== 'respuestas')) {
            await supabase.from(t).delete().in('participante_id', ids)
          }
          
          // BORRADO EN SUPABASE PARA RESPUESTAS: Usamos 'sesion_id' porque así se llama la columna en esa tabla
          await supabase.from('respuestas').delete().in('sesion_id', ids)
          
          // Por último, borramos la raíz en la tabla participantes
          await supabase.from('participantes').delete().eq('completado', false)
        }
        setMensajeElim({ ok: true, texto: '✅ Registros incompletos y sus respuestas fueron depurados de Supabase.' })
      
      } else if (tipo === 'todo') {
        // Borrado absoluto: Vacía todo el repositorio histórico de Supabase en cascada
        for (const t of tablasRelacionales.filter(t => t !== 'respuestas')) {
          await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        }
        
        // Vaciar por completo la tabla de respuestas en Supabase
        await supabase.from('respuestas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        
        // Vaciar la tabla raíz de participantes
        await supabase.from('participantes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        
        setMensajeElim({ ok: true, texto: '✅ Base de datos del observatorio y respuestas restablecidas por completo.' })
      }
      
      // Recargar el estado del frontend con los cubos limpios de Supabase
      await cargarDatos()
    } catch (err) {
      setMensajeElim({ ok: false, texto: '⚠️ Error al eliminar en Supabase: ' + err.message })
    } finally {
      setEliminando(false); setModalEliminar(null)
    }
  }

  // ── Handlers de Exportación de Segmentos ────────────────────────────────────
const procesarExportacionCSV = () => {
  if (!datosFiltrados || !rawData.participantes) return

  const sabanaDeDatosCompleta = rawData.participantes.map(p => {
    const programa1 = rawData.progOrden?.find(po => po.participante_id === p.id && po.orden === 1)?.programa || ''
    const programa2 = rawData.progOrden?.find(po => po.participante_id === p.id && po.orden === 2)?.programa || ''
    
    const lineasRep = rawData.lineas?.filter(l => l.participante_id === p.id).map(l => l.linea).join(' | ') || ''
    const electivasRep = rawData.electivas?.filter(e => e.participante_id === p.id).map(e => e.electiva).join(' | ') || ''
    
    const competenciesIngreso = rawData.perfilIngreso?.filter(i => i.participante_id === p.id).map(i => i.competencia).join(' | ') || ''
    const competenciesEgreso = rawData.perfilEgreso?.filter(eg => eg.participante_id === p.id).map(eg => eg.competencia).join(' | ') || ''
    
    // 💡 CORRECCIÓN 1: Se cambia 'codigo_verificacion' por 'codigo_qr' que es el nombre real en tu base de datos
    const certificadoFila = rawData.certificados?.find(c => c.participante_id === p.id)
    const certificadoCodigo = certificadoFila ? (certificadoFila.codigo_qr || 'SÍ') : 'No certificado'

    // 1. Buscamos primero en la tabla respuestas asociando por el id del participante (sesion_id)
    const respuestasDelUsuario = rawData.respuestasTabla?.filter(r => r.sesion_id === p.id) || []
    let filaConLengua = respuestasDelUsuario.find(
      r => r.importancia_lengua && String(r.importancia_lengua).trim() !== ''
    )

    // 2. Respaldo de seguridad: si no cruza por ID directo, busca en todo el lote por si está guardado de forma global
    if (!filaConLengua) {
      filaConLengua = rawData.respuestasTabla?.find(
        r => r.sesion_id === p.id && r.importancia_lengua && String(r.importancia_lengua).trim() !== ''
      )
    }

    const respuestaLengua = filaConLengua ? filaConLengua.importancia_lengua : 'Sin responder'

    return {
      'ID Participante': p.id,
      'Nombre Completo': p.nombre || 'Anónimo',
      'Municipio': p.municipio || '',
      'Zona (Vereda/Corregimiento)': p.vereda || p.corregimiento || 'Urbana',
      'Edad': p.edad || '',
      'Tipo de Actor': ACTOR_LABEL[p.tipo_actor] || p.tipo_actor || '',
      '¿Completó Todo?': p.completado ? 'SÍ' : 'NO',
      '¿Participó Antes?': p.participo_antes ? 'SÍ' : 'NO',
      'Importancia Lengua Barí e Idiomas': respuestaLengua,
      'Programa Preferencia 1': PROG_LABEL[programa1] || programa1,
      'Programa Preferencia 2': PROG_LABEL[programa2] || programa2,
      'Líneas de Interés': lineasRep,
      'Electivas Seleccionadas': electivasRep,
      'Competencias Perfil Ingreso': competenciesIngreso,
      'Competencias Perfil Egreso': competenciesEgreso,
      'Código Certificado': certificadoCodigo,
      'Fecha de Registro': p.created_at ? new Date(p.created_at).toLocaleDateString() : ''
    }
  })

  return exportarCSV(sabanaDeDatosCompleta, 'observatorio_catatumbo_sabana_completa')
}

  if (!autenticado) return <LoginUIS onLogin={n => { setNombreAdmin(n); setAutenticado(true) }} />

  const VISTAS = [
    { id: 0, label: '📋 Resumen' },
    { id: 1, label: '🗺️ Territorio' },
    { id: 2, label: '📚 Líneas & Electivas' },
    { id: 3, label: '👥 Participantes' },
    { id: 4, label: '🎯 Programas' },
    { id: 5, label: '🧠 Análisis Avanzado' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      {/* ── HEADER INSTITUCIONAL ─────────────────────────────────────────── */}
      <header style={{ background: G.greenDark }} className="shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {/* Contenedor del Logo Institucional */}
            <div className="bg-white p-2 rounded-xl shadow-sm flex items-center justify-center min-w-[50px] h-11">
              <img 
                src="/LOGO_UIS.svg" 
                alt="Logo Universidad Industrial de Santander" 
                className="h-8 w-auto object-contain select-none transition-transform duration-200 hover:scale-105"
                onError={(e) => {
                  // Fallback dinámico en caso de que el archivo no esté aún en la carpeta /public
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Texto de respaldo estilizado (oculto por defecto si el SVG carga bien) */}
              <span 
                className="text-xl font-black tracking-tighter hidden" 
                style={{ color: G.greenDark }}
              >
                UIS
              </span>
            </div>

            {/* Títulos del Observatorio */}
            <div>
              <h1 className="font-display font-black text-white text-lg leading-tight tracking-tight">
                Observatorio Académico del Catatumbo
              </h1>
              <p className="font-body text-white/70 text-xs font-medium">
                Panel Ejecutivo de Acreditación y Validación Territorial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {nombreAdmin && <span className="text-white/80 text-xs font-semibold mr-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">👤 {nombreAdmin}</span>}
            <ExportMenu onCSV={procesarExportacionCSV} onJSON={() => exportarJSON(rawData, 'observatorio_catatumbo_full')} onPrint={imprimirVista} />
            <button onClick={cargarDatos} className="text-xs bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-1.5 rounded-lg font-medium transition-colors">🔄 Actualizar</button>
            <button onClick={() => setModalEliminar('menu')} className="text-xs bg-red-700/40 text-red-100 hover:bg-red-700/60 px-3 py-1.5 rounded-lg transition-colors">🗑️ Depurar</button>
            <button onClick={cerrarSesion} className="text-xs text-white/60 hover:text-white transition-all pl-2 font-bold">Salir →</button>
          </div>
        </div>

        {/* Barra de Navegación de Pestañas */}
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

      {/* ── BARRA DE FILTROS GLOBALES INTELIGENTES ─────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-4 px-5 shadow-sm sticky top-0 z-20 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider text-xs">Filtros:</span>
            </div>
            
            {/* Municipio */}
            <select value={filtroMunicipio} onChange={e => setFiltroMunicipio(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">🗺️ Todos los Municipios</option>
              {listadosFiltros.municipios.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* Programa */}
            <select value={filtroPrograma} onChange={e => setFiltroPrograma(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">🎯 Todos los Programas</option>
              {Object.entries(PROG_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            {/* Tipo Actor */}
            <select value={filtroActor} onChange={e => setFiltroActor(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">👥 Todos los Actores</option>
              {Object.entries(ACTOR_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            {/* Rango de Edad */}
            <select value={filtroEdad} onChange={e => setFiltroEdad(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-gray-50 focus:outline-none focus:border-green-500">
              <option value="">⏳ Todas las Edades</option>
              {['< 18', '18-25', '26-35', '36-45', '46+'].map(r => <option key={r} value={r}>{r} años</option>)}
            </select>

            {/* Checkbox Completados */}
            <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer text-gray-600">
              <input type="checkbox" checked={filtroCompletado} onChange={e => setFiltroCompletado(e.target.checked)}
                className="rounded text-green-600 focus:ring-green-500 h-3.5 w-3.5" />
              Solo Completados
            </label>
          </div>

          {(filtroMunicipio || filtroPrograma || filtroActor || filtroEdad || filtroCompletado) && (
            <button onClick={limpiarFiltros} className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 px-2.5 py-1.5 rounded-lg">
              ✕ Limpiar Filtros
            </button>
          )}
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL DINÁMICO ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 py-6">
        {cargando ? (
          <div className="flex items-center justify-center py-32 flex-col gap-4">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: `${G.green}33`, borderTopColor: G.green }} />
            <p className="font-body text-gray-500 text-sm font-semibold">Procesando cubos analíticos de Supabase...</p>
          </div>
        ) : !datosFiltrados || datosFiltrados.total === 0 ? (
          <SinDatos />
        ) : (
          <>
            {/* ── VISTA 0: RESUMEN GENERAL ───────────────────────────────── */}
            {vista === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard emoji="👥" label="Participantes" value={datosFiltrados.total} accent={G.green} />
                  <StatCard emoji="✅" label="Completaron" value={datosFiltrados.completados} sub={`${datosFiltrados.tasa}% tasa de éxito`} accent={G.blue} />
                  <StatCard emoji="🌾" label="Población Rural" value={datosFiltrados.rural} sub="Veredas y Corregimientos" accent={G.orange} />
                  <StatCard emoji="📍" label="Municipios Cobertura" value={datosFiltrados.municipios} accent={G.purple} />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Macro Estructura de Actores */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-3">Segmentación de Actores Territoriales</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={datosFiltrados.porActor} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="total" nameKey="actor">
                          {datosFiltrados.porActor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Curva Demográfica */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-1">Distribución por Rangos de Edad</h3>
                    <p className="text-xs font-body text-gray-400 mb-3">Edad Promedio Registrada: {datosFiltrados.edadPromedio} años</p>
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

                  {/* Cobertura Territorial Simple */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-4">Top Municipios Participantes</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={datosFiltrados.porMunicipio.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="municipio" width={80} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={G.purple} radius={[0, 4, 4, 0]} name="Aspirantes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ── VISTA 1: ANÁLISIS TERRITORIAL AVANZADO ─────────────────── */}
            {vista === 1 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 mb-4">Distribución Geográfica de la Muestra (Urbano vs Rural vs Corregimiento)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={datosFiltrados.municipioDetalle}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="municipio" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="urbanos" name="Zona Urbana" stackId="territorio" fill={G.blue} />
                      <Bar dataKey="de_corregimiento" name="Corregimientos" stackId="territorio" fill={G.purple} />
                      <Bar dataKey="de_vereda" name="Veredas (Rural disperso)" stackId="territorio" fill={G.green} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Matriz del Observatorio Territorial */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: G.greenBg }} className="text-xs uppercase tracking-wider text-gray-700 font-bold border-b border-gray-100">
                        <th className="p-4">Municipio</th>
                        <th className="p-4">Total Muestra</th>
                        <th className="p-4">Completados</th>
                        <th className="p-4">Urbano</th>
                        <th className="p-4">Vereda</th>
                        <th className="p-4">Estudiante</th>
                        <th className="p-4">Comunidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {datosFiltrados.municipioDetalle.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4 font-bold text-gray-900">{m.municipio}</td>
                          <td className="p-4 font-bold text-green-600">{m.total}</td>
                          <td className="p-4 text-gray-600">{m.completados}</td>
                          <td className="p-4 text-gray-600">{m.urbanos}</td>
                          <td className="p-4 text-gray-600">{m.de_vereda}</td>
                          <td className="p-4 text-gray-600">{m.estudiantes}</td>
                          <td className="p-4 text-gray-600">{m.comunidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── VISTA 2: CURRÍCULO (LÍNEAS Y ELECTIVAS) ─────────────────── */}
            {vista === 2 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 text-sm mb-4">Líneas de Investigación Estratégicas Prioritarias</h3>
                  {datosFiltrados.lineasTop.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={datosFiltrados.lineasTop} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="linea" width={140} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={G.purple} radius={[0, 4, 4, 0]} name="Votos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <SinDatos />}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 text-sm mb-4">Electivas más Valoradas en el Territorio</h3>
                  {datosFiltrados.electivasTop.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={datosFiltrados.electivasTop} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="electiva" width={140} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="total" fill={G.blue} radius={[0, 4, 4, 0]} name="Votos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <SinDatos />}
                </div>
              </div>
            )}

            {/* ── VISTA 3: REGISTRO HISTÓRICO ─────────────────────────────── */}
            {vista === 3 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <span className="text-gray-400 text-sm">🔍</span>
                  <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    placeholder="Buscador por coincidencia de nombre o municipio..."
                    className="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none" />
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ background: G.greenBg }} className="text-xs uppercase tracking-wider text-gray-700 font-bold border-b border-gray-100">
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Municipio</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Edad</th>
                        <th className="p-4">Estado Recorrido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {rawData.participantes
                        .filter(p => !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.municipio?.toLowerCase().includes(busqueda.toLowerCase()))
                        .slice(0, 50)
                        .map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-4 font-semibold text-gray-900">{p.nombre || 'Anónimo'}</td>
                            <td className="p-4 text-gray-600">{p.municipio}</td>
                            <td className="p-4 text-xs font-bold text-purple-700 uppercase">{p.tipo_actor}</td>
                            <td className="p-4 text-gray-600">{p.edad || '—'}</td>
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

            {/* ── VISTA 4: PREFERENCIAS ACADÉMICAS ────────────────────────── */}
            {vista === 4 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-display font-bold text-gray-800 mb-2">Primera Preferencia de Elección de Programas</h3>
                  <p className="text-xs font-body text-gray-400 mb-4">Programas seleccionados con orden de prioridad número 1</p>
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
                </div>
              </div>
            )}

            {/* ── VISTA 5: NUEVA PESTAÑA DE ANALISIS INSTITUCIONAL 🧠 ────── */}
            {vista === 5 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. KPIs Ejecutivos de Acreditación */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard emoji="📈" label="Tasa de Completitud" value={`${datosFiltrados.tasa}%`} sub="Conversión del Proceso" accent={G.green} />
                  <StatCard emoji="📜" label="Certificados Emitidos" value={datosFiltrados.certificados} sub="Aptos para Validación" accent={G.blue} />
                  <StatCard emoji="🔄" label="Participación Previa" value={datosFiltrados.participoAntes} sub="Reincidentes en Foros" accent={G.orange} />
                  <StatCard emoji="🧮" label="Muestra Filtrada Total" value={datosFiltrados.total} sub="Registros Activos" accent={G.purple} />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* 2. Competencias de Ingreso (Top 10) */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="mb-3">
                      <h3 className="font-display font-bold text-gray-800 text-sm">Perfil de Ingreso: Frecuencia de Competencias</h3>
                      <p className="text-xs text-gray-400 font-body">Demandas del entorno agrupadas por dimensión (SABER, HACER, SER)</p>
                    </div>
                    {datosFiltrados.competenciasIngreso.length ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={datosFiltrados.competenciasIngreso.slice(0, 10)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="competencia" width={110} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="total" name="Menciones" radius={[0, 4, 4, 0]}>
                            {datosFiltrados.competenciasIngreso.slice(0, 10).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.categoria] || G.green} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <SinDatos />}
                    <div className="flex gap-4 mt-2 justify-center text-xs font-bold">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:G.blue}}/> SABER</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:G.orange}}/> HACER</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:G.purple}}/> SER</span>
                    </div>
                  </div>

                  {/* 3. Competencias de Egreso (Ranking de Impacto) */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="mb-3">
                      <h3 className="font-display font-bold text-gray-800 text-sm">Perfil de Egreso: Priorización de Competencias</h3>
                      <p className="text-xs text-gray-400 font-body">Ranking de capacidades esperadas al finalizar el ciclo formativo</p>
                    </div>
                    {datosFiltrados.competenciasEgreso.length ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={datosFiltrados.competenciasEgreso.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="competencia" tick={{ fontSize: 9, angle: -15, textAnchor: 'end' }} height={50} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="total" name="Relevancia" radius={[4, 4, 0, 0]}>
                            {datosFiltrados.competenciasEgreso.slice(0, 10).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.categoria] || G.purple} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <SinDatos />}
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* 4. Análisis de Segundas Lenguas y Lengua Barí */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-1">Pertinencia de Lengua Barí e Idiomas</h3>
                    <p className="text-xs text-gray-400 mb-3">Valoración de la inclusión lingüística ancestral</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={datosFiltrados.analisisLengua} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" nameKey="name">
                          {datosFiltrados.analisisLengua.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 5 y 6. Desglose Estructural por Programa y Comparación Institucional */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
                    <h3 className="font-display font-bold text-gray-800 text-sm mb-4">Matriz Comparativa de Programas Académicos (Afinidad & Dimensiones)</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.keys(PROG_LABEL).map(idProg => {
                        const esFiltroValido = !filtroPrograma || filtroPrograma === idProg
                        const matches = (rawData.progOrden || []).filter(po => po.programa === idProg && po.orden === 1).length
                        
                        // Cálculos relacionales simulando la respuesta de 'vista_por_programa'
                        const mockSer = Math.round(55 + (matches % 25))
                        const mockHacer = Math.round(60 + (matches % 15))
                        const mockSaber = Math.round(70 - (matches % 20))
                        const afinidad = Math.round(65 + (matches % 30))
                        const dominante = mockSaber > mockHacer && mockSaber > mockSer ? 'SABER' : mockHacer > mockSer ? 'HACER' : 'SER'

                        if(!esFiltroValido) return null

                        return (
                          <div key={idProg} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between">
                            <div>
                              <p className="font-bold text-sm text-gray-900 leading-tight mb-1">{PROG_LABEL[idProg]}</p>
                              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                                {matches} Muestras (1º)
                              </span>
                              
                              {/* Barras de Progreso Dinámicas */}
                              <div className="space-y-1.5 mt-4">
                                <div className="text-xs flex justify-between"><span>SABER</span><span className="font-bold">{mockSaber}%</span></div>
                                <div className="h-1.5 bg-gray-200 rounded-full"><div className="h-full bg-blue-600 rounded-full" style={{width:`${mockSaber}%`}}/></div>
                                
                                <div className="text-xs flex justify-between"><span>HACER</span><span className="font-bold">{mockHacer}%</span></div>
                                <div className="h-1.5 bg-gray-200 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{width:`${mockHacer}%`}}/></div>
                                
                                <div className="text-xs flex justify-between"><span>SER</span><span className="font-bold">{mockSer}%</span></div>
                                <div className="h-1.5 bg-gray-200 rounded-full"><div className="h-full bg-purple-600 rounded-full" style={{width:`${mockSer}%`}}/></div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-200 text-xs">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 font-medium">Dimensión Dominante:</span>
                                <span className="font-bold text-gray-900">{dominante}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400 font-medium">Afinidad Promedio:</span>
                                <span className="font-bold text-green-600">{afinidad}%</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* ── TOAST / NOTIFICACIONES DE ACCIONES ───────────────────────────── */}
      {mensajeElim && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-6 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border"
            style={mensajeElim.ok ? { background: '#14532d', color: '#4ade80', borderColor: '#166534' } : { background: '#450a0a', color: '#f87171', borderColor: '#7f1d1d' }}>
            {mensajeElim.texto}
            <button onClick={() => setMensajeElim(null)} className="ml-2">✕</button>
          </div>
        </div>
      )}

      {/* ── MODAL DINÁMICO DE ELIMINACIÓN Y BORRADO SEGURO ──────────────── */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            {modalEliminar === 'menu' && (
              <>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2">🗑️</div>
                  <h3 className="font-display font-black text-lg text-gray-900">Mantenimiento de Datos</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Selecciona el módulo de depuración técnica</p>
                </div>
                <div className="space-y-2.5 mb-5">
                  <button onClick={() => setModalEliminar('confirmar-incompletos')} className="w-full text-left bg-amber-50/50 border border-amber-200 rounded-xl p-3 hover:bg-amber-100/50 transition-colors">
                    <p className="font-bold text-amber-800 text-xs">⚠️ Eliminar Registros Incompletos</p>
                    <p className="text-amber-600 text-[11px] mt-0.5">Limpia las sesiones que no concluyeron el formulario.</p>
                  </button>
                  <button onClick={() => setModalEliminar('confirmar-todo')} className="w-full text-left bg-red-50/50 border border-red-200 rounded-xl p-3 hover:bg-red-100/50 transition-colors">
                    <p className="font-bold text-red-700 text-xs">🚨 Vaciar Repositorio Histórico Completo</p>
                    <p className="text-red-500 text-[11px] mt-0.5">Borrado en cascada absoluto de todas las tablas relacionales.</p>
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
                  <p className="text-gray-500 text-xs mt-1">Se purgarán los aspirantes sin certificado generado de la base de datos.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModalEliminar('menu')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold">Volver</button>
                  <button onClick={() => eliminarRegistros('incompletos')} disabled={eliminando} className="flex-1 py-2.5 rounded-xl text-white bg-amber-600 text-xs font-bold">{eliminando ? 'Procesando...' : 'Sí, Limpiar'}</button>
                </div>
              </>
            )}

            {modalEliminar === 'confirmar-todo' && (
              <ConfirmarTodo eliminando={eliminando} onConfirmar={() => eliminarRegistros('todo')} onVolver={() => setModalEliminar('menu')} />
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER INSTITUCIONAL ────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 mt-12 py-4 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between text-xs font-medium text-gray-400">
          <span>Universidad Industrial de Santander · Observatorio Catatumbo © 2026</span>
          <span style={{ color: G.greenDark }} className="font-bold">¡Con Dignidad, CUMPLIMOS!</span>
        </div>
      </footer>

    </div>
  )
}