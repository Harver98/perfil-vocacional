import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts'

const UIS_GREEN      = '#67B93E'
const UIS_GREEN_DARK = '#3d7820'
const UIS_GREEN_BG   = '#f2faeb'
const UIS_PURPLE     = '#5b2d8e'
const UIS_BLUE       = '#1a6fa8'
const UIS_ORANGE     = '#c96a00'
const COLORS         = [UIS_GREEN, UIS_PURPLE, UIS_BLUE, UIS_ORANGE, '#e11d48']

const PROGRAMAS_LABEL = {
  trabajo_social: 'Trabajo Social',
  agroindustrial:  'Ing. Agroindustrial',
  administracion:  'Adm. Empresas',
}

// ─── Tarjeta de métrica ───────────────────────────────────────────────────────
function StatCard({ emoji, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{emoji}</span>
        <div className="w-2 h-2 rounded-full mt-1" style={{ background: accent || UIS_GREEN }} />
      </div>
      <p className="font-display font-black text-3xl text-gray-900">{value ?? '—'}</p>
      <p className="font-display font-semibold text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

// ─── Pantalla de Login con Supabase Auth ──────────────────────────────────────
function LoginUIS({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)

  const intentarLogin = async () => {
    if (!email || !password) return
    setCargando(true)
    setError('')
    try {
      // 1. Autenticar con Supabase Auth (email + contraseña)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email:    email.trim().toLowerCase(),
        password: password,
      })
      if (authError) throw authError

      // 2. Verificar que el usuario está en la tabla admins
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('activo, nombre')
        .eq('user_id', authData.user.id)
        .single()

      if (adminError || !adminData?.activo) {
        // Cerrar sesión si no es admin
        await supabase.auth.signOut()
        throw new Error('Tu cuenta no tiene acceso al dashboard.')
      }

      onLogin(adminData.nombre || email)
    } catch (e) {
      const msg = e.message || ''
      if (msg.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo antes de ingresar.')
      } else if (msg.includes('no tiene acceso')) {
        setError(msg)
      } else {
        setError('Error al conectar. Verifica tu .env.local de Supabase.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #5b2d8e 0%, #7b3fa8 50%, #3d7820 100%)' }}
    >
      {/* Orbes decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"  style={{ background: UIS_GREEN, filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ background: '#fff',     filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* Logos institucionales */}
        <div className="flex items-center justify-between mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
            <p className="text-white/60 font-body text-xs">Ministerio de</p>
            <p className="text-white font-display font-bold text-xs">Educación Nacional</p>
            <div className="flex gap-0.5 mt-0.5">
              <div className="h-0.5 w-5 rounded-full bg-yellow-400" />
              <div className="h-0.5 w-3 rounded-full bg-blue-600" />
              <div className="h-0.5 w-3 rounded-full bg-red-500" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs text-white" style={{ background: UIS_GREEN }}>
              UIS
            </div>
            <div>
              <p className="text-white font-display font-bold text-xs leading-tight">Universidad</p>
              <p className="text-white font-display font-bold text-xs leading-tight">Industrial de Santander</p>
            </div>
          </div>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-7">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg"
              style={{ background: UIS_GREEN_BG, border: `2px solid ${UIS_GREEN}33` }}
            >
              📊
            </div>
            <h1 className="font-display text-2xl font-black text-gray-900">Dashboard</h1>
            <p className="font-body text-gray-400 text-sm mt-1">Programa Catatumbo · UIS</p>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="text-xs font-body text-gray-300">Con Dignidad,</span>
              <span className="text-xs font-display font-bold" style={{ color: UIS_GREEN }}>¡CUMPLIMOS!</span>
            </div>
          </div>

          {/* Campo email */}
          <div className="mb-3">
            <label className="block text-xs font-display font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Correo institucional
            </label>
            <input
              type="email"
              placeholder="usuario@uis.edu.co"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && intentarLogin()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-gray-700 text-sm focus:outline-none transition-all"
              onFocus={e => e.target.style.borderColor = UIS_GREEN}
              onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Campo contraseña */}
          <div className="mb-5">
            <label className="block text-xs font-display font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPass ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && intentarLogin()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 font-body text-gray-700 text-sm focus:outline-none transition-all"
                onFocus={e => e.target.style.borderColor = UIS_GREEN}
                onBlur={e  => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                onClick={() => setMostrarPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                tabIndex={-1}
              >
                {mostrarPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-600 text-sm font-body mb-4">
              ⚠️ {error}
            </div>
          )}

          {/* Botón ingresar */}
          <button
            onClick={intentarLogin}
            disabled={!email || !password || cargando}
            className="w-full py-3.5 rounded-2xl font-display font-bold text-white transition-all duration-200"
            style={email && password && !cargando
              ? { background: UIS_GREEN, boxShadow: `0 4px 16px ${UIS_GREEN}40` }
              : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }
            }
          >
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verificando...
              </span>
            ) : 'Ingresar →'}
          </button>

          <p className="text-center text-gray-300 text-xs font-body mt-5">
            🔐 Acceso restringido · Solo personal autorizado UIS
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Componente interno: confirmación de borrado total ────────────────────────
function ConfirmarTodo({ eliminando, onConfirmar, onVolver }) {
  const [texto, setTexto] = useState('')
  const valido = texto === 'CONFIRMAR'
  return (
    <>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🚨</div>
        <h3 className="font-display font-black text-xl text-gray-900">¿Eliminar TODO?</h3>
        <p className="text-gray-500 font-body text-sm mt-2">
          Esta acción borrará <strong>todas las sesiones, respuestas y resultados</strong> de forma permanente. No se puede deshacer.
        </p>
      </div>
      <div className="mb-5">
        <label className="block text-xs font-display font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Escribe CONFIRMAR para continuar
        </label>
        <input
          type="text"
          placeholder="CONFIRMAR"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          className="w-full border-2 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none transition-all"
          style={{ borderColor: valido ? '#ef4444' : '#e5e7eb' }}
        />
      </div>
      <div className="flex gap-3">
        <button onClick={onVolver}
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-display font-semibold text-sm hover:bg-gray-50 transition-colors">
          Volver
        </button>
        <button onClick={onConfirmar} disabled={!valido || eliminando}
          className="flex-1 py-3 rounded-2xl font-display font-bold text-sm text-white transition-all"
          style={{ background: valido && !eliminando ? '#dc2626' : '#d1d5db', cursor: valido && !eliminando ? 'pointer' : 'not-allowed' }}>
          {eliminando
            ? <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Eliminando...
              </span>
            : '🗑️ Eliminar todo'}
        </button>
      </div>
    </>
  )
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  const [autenticado, setAutenticado] = useState(false)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [vista,       setVista]       = useState(0)
  const [cargando,    setCargando]    = useState(true)
  const [datos,       setDatos]       = useState(null)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [eliminando,    setEliminando]    = useState(false)
  const [mensajeElim,   setMensajeElim]   = useState(null)

  // Verificar sesión activa al cargar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('admins').select('nombre, activo')
          .eq('user_id', session.user.id).single()
          .then(({ data }) => {
            if (data?.activo) {
              setNombreAdmin(data.nombre || session.user.email)
              setAutenticado(true)
            }
          })
      }
    })
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    setAutenticado(false)
    setDatos(null)
  }

  const eliminarRegistros = async (tipo) => {
    setEliminando(true)
    setMensajeElim(null)
    try {
      if (tipo === 'incompletos') {
        const { data: incom } = await supabase
          .from('sesiones').select('id').eq('completado', false)
        if (incom?.length) {
          const ids = incom.map(s => s.id)
          await supabase.from('respuestas').delete().in('sesion_id', ids)
          await supabase.from('resultados').delete().in('sesion_id', ids)
          await supabase.from('sesiones').delete().eq('completado', false)
        }
        setMensajeElim({ ok: true, texto: `✅ ${incom?.length ?? 0} registros incompletos eliminados.` })
      }
      if (tipo === 'todo') {
        await supabase.from('respuestas').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('resultados').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('sesiones').delete().neq('id',   '00000000-0000-0000-0000-000000000000')
        setMensajeElim({ ok: true, texto: '✅ Todos los registros han sido eliminados.' })
      }
      await cargarDatos()
    } catch (err) {
      setMensajeElim({ ok: false, texto: '⚠️ Error al eliminar: ' + err.message })
    } finally {
      setEliminando(false)
      setModalEliminar(null)
    }
  }

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const { data: sesiones }   = await supabase.from('sesiones').select('*').eq('completado', true)
      const { data: resultados } = await supabase.from('resultados').select('*')

      const porMunicipio = {}, porPrograma = {}
      const porEdad = { '14-17':0,'18-25':0,'26-35':0,'36-45':0,'46+':0 }
      const porGrupo = {}

      sesiones?.forEach(s => {
        porMunicipio[s.municipio] = (porMunicipio[s.municipio] || 0) + 1
        porPrograma[s.programa]   = (porPrograma[s.programa]   || 0) + 1
        const e = parseInt(s.edad)
        if      (e <= 17) porEdad['14-17']++
        else if (e <= 25) porEdad['18-25']++
        else if (e <= 35) porEdad['26-35']++
        else if (e <= 45) porEdad['36-45']++
        else              porEdad['46+']++
        s.grupos_poblacionales?.forEach(g => { porGrupo[g] = (porGrupo[g] || 0) + 1 })
      })

      let sumSer=0, sumHacer=0, sumSaber=0, sumAfin=0
      resultados?.forEach(r => { sumSer+=r.puntaje_ser; sumHacer+=r.puntaje_hacer; sumSaber+=r.puntaje_saber; sumAfin+=r.afinidad_total })
      const n = resultados?.length || 1

      const municipioConResultados = Object.entries(porMunicipio)
        .sort(([,a],[,b]) => b-a).slice(0,10)
        .map(([mun, count]) => {
          const sesM  = sesiones.filter(s => s.municipio === mun)
          const idsM  = sesM.map(s => s.id)
          const resM  = resultados?.filter(r => idsM.includes(r.sesion_id)) || []
          const afin  = resM.length ? Math.round(resM.reduce((a,r)=>a+r.afinidad_total,0)/resM.length) : 0
          const progs = {}; sesM.forEach(s => { progs[s.programa] = (progs[s.programa]||0)+1 })
          const progD = Object.entries(progs).sort(([,a],[,b])=>b-a)[0]?.[0] || '-'
          return { municipio: mun, total: count, afinidad: afin, programa: PROGRAMAS_LABEL[progD]||progD }
        })

      setDatos({
        total:            sesiones?.length || 0,
        municipios:       Object.keys(porMunicipio).length,
        afinidadPromedio: Math.round(sumAfin/n),
        programaMasPopular: Object.entries(porPrograma).sort(([,a],[,b])=>b-a)[0]?.[0],
        promedios: { ser: Math.round(sumSer/n), hacer: Math.round(sumHacer/n), saber: Math.round(sumSaber/n) },
        porPrograma: Object.entries(porPrograma).map(([k,v]) => ({ name: PROGRAMAS_LABEL[k]||k, value: v })),
        porEdad:  Object.entries(porEdad).filter(([,v])=>v>0).map(([k,v]) => ({ rango:k, total:v })),
        municipioConResultados,
        resultadosPorPrograma: ['trabajo_social','agroindustrial','administracion'].map(pid => {
          const r = resultados?.filter(x => x.programa===pid) || []
          const nn = r.length||1
          return {
            programa: PROGRAMAS_LABEL[pid],
            ser:      Math.round(r.reduce((a,x)=>a+x.puntaje_ser,0)/nn),
            hacer:    Math.round(r.reduce((a,x)=>a+x.puntaje_hacer,0)/nn),
            saber:    Math.round(r.reduce((a,x)=>a+x.puntaje_saber,0)/nn),
            afinidad: Math.round(r.reduce((a,x)=>a+x.afinidad_total,0)/nn),
          }
        }),
      })
    } catch(err) { console.error(err) }
    finally { setCargando(false) }
  }

  useEffect(() => { if (autenticado) cargarDatos() }, [autenticado])

  if (!autenticado) return <LoginUIS onLogin={(nombre) => { setNombreAdmin(nombre); setAutenticado(true) }} />

  const VISTAS = [
    { label: '📋 Resumen General', id: 0 },
    { label: '🗺️ Por Municipio',   id: 1 },
    { label: '📈 Competencias',    id: 2 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ background: UIS_GREEN_DARK }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm text-white border-2 border-white/30" style={{ background: UIS_GREEN }}>
              UIS
            </div>
            <div>
              <h1 className="font-display font-black text-white text-base leading-tight">Dashboard Vocacional</h1>
              <p className="font-body text-white/50 text-xs">Programa Catatumbo · Norte de Santander</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-white/40 font-body text-xs">Con Dignidad,</span>
              <span className="font-display font-bold text-xs" style={{ color: '#a8e063' }}>¡CUMPLIMOS!</span>
            </div>
            {nombreAdmin && (
              <span className="hidden md:block text-white/50 font-body text-xs border-l border-white/20 pl-4">
                👤 {nombreAdmin}
              </span>
            )}
            <button onClick={cargarDatos} className="font-body text-xs border border-white/20 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:border-white/40 transition-colors">
              🔄 Actualizar
            </button>
            <button onClick={() => { setModalEliminar('menu'); setMensajeElim(null) }}
              className="font-body text-xs border border-red-400/40 px-3 py-1.5 rounded-lg text-red-300/80 hover:text-red-200 hover:border-red-400/70 transition-colors">
              🗑️ Eliminar
            </button>
            <button onClick={cerrarSesion} className="font-body text-xs text-white/40 hover:text-white/70 transition-colors">
              Salir
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-t border-white/10">
          <div className="max-w-5xl mx-auto px-5 flex gap-1">
            {VISTAS.map(v => (
              <button key={v.id} onClick={() => setVista(v.id)}
                className="px-5 py-3 font-display font-semibold text-sm border-b-2 transition-all"
                style={vista===v.id ? { borderColor:'#a8e063', color:'#a8e063' } : { borderColor:'transparent', color:'rgba(255,255,255,0.45)' }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido */}
      {cargando ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor:`${UIS_GREEN}33`, borderTopColor:UIS_GREEN }} />
            <p className="font-body text-gray-400 text-sm">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-5 py-8">

          {/* VISTA 1 */}
          {vista===0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard emoji="👥" label="Participantes totales"  value={datos?.total}                                          accent={UIS_GREEN}  />
                <StatCard emoji="📍" label="Municipios"             value={datos?.municipios}                                     accent={UIS_PURPLE} />
                <StatCard emoji="🎯" label="Afinidad promedio"      value={datos?.afinidadPromedio ? `${datos.afinidadPromedio}%` : '—'} accent={UIS_BLUE}   />
                <StatCard emoji="🏆" label="Carrera más popular"    value={PROGRAMAS_LABEL[datos?.programaMasPopular] || '—'}    accent={UIS_ORANGE} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-display font-bold text-gray-800 mb-4">Distribución por programa</h3>
                  {datos?.porPrograma?.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={datos.porPrograma} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({percent})=>`${Math.round(percent*100)}%`}>
                          {datos.porPrograma.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-52 flex items-center justify-center text-gray-300 text-sm font-body">Sin datos aún</div>}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-display font-bold text-gray-800 mb-5">Promedio SER · HACER · SABER</h3>
                  <div className="space-y-5 mt-2">
                    {[{label:'💡 SER',val:datos?.promedios.ser,color:UIS_PURPLE},{label:'⚡ HACER',val:datos?.promedios.hacer,color:UIS_GREEN},{label:'📘 SABER',val:datos?.promedios.saber,color:UIS_BLUE}].map(d=>(
                      <div key={d.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-display font-semibold text-gray-700">{d.label}</span>
                          <span className="font-display font-bold text-gray-900">{d.val??0}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{width:`${d.val??0}%`,background:d.color}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-display font-bold text-gray-800 mb-4">Distribución por edad</h3>
                {datos?.porEdad?.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={datos.porEdad}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="rango" tick={{fontSize:12,fontFamily:'DM Sans'}} />
                      <YAxis tick={{fontSize:12,fontFamily:'DM Sans'}} />
                      <Tooltip />
                      <Bar dataKey="total" fill={UIS_GREEN} radius={[6,6,0,0]} name="Participantes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-48 flex items-center justify-center text-gray-300 text-sm font-body">Sin datos aún</div>}
              </div>
            </div>
          )}

          {/* VISTA 2 */}
          {vista===1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-display font-bold text-gray-800 mb-4">Participantes por municipio (Top 10)</h3>
                {datos?.municipioConResultados?.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={datos.municipioConResultados} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                      <XAxis type="number" tick={{fontSize:11,fontFamily:'DM Sans'}} />
                      <YAxis type="category" dataKey="municipio" width={110} tick={{fontSize:11,fontFamily:'DM Sans'}} />
                      <Tooltip />
                      <Bar dataKey="total" fill={UIS_GREEN} radius={[0,6,6,0]} name="Participantes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-52 flex items-center justify-center text-gray-300 text-sm font-body">Sin datos aún</div>}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-display font-bold text-gray-800">Detalle por municipio</h3>
                  <span className="text-xs font-body text-gray-400">{datos?.municipioConResultados?.length??0} municipios</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{background:UIS_GREEN_BG}}>
                      <tr>{['Municipio','Participantes','Programa dominante','Afinidad promedio'].map(h=>(
                        <th key={h} className="px-5 py-3 text-left text-xs font-display font-semibold uppercase tracking-wider" style={{color:UIS_GREEN_DARK}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {datos?.municipioConResultados?.map((m,i)=>(
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-body text-sm font-medium text-gray-900">{m.municipio}</td>
                          <td className="px-5 py-3 font-body text-sm text-gray-600">{m.total}</td>
                          <td className="px-5 py-3 font-body text-sm text-gray-600">{m.programa}</td>
                          <td className="px-5 py-3">
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-display font-semibold"
                              style={m.afinidad>=70 ? {background:UIS_GREEN_BG,color:UIS_GREEN_DARK} : {background:'#fff4e6',color:UIS_ORANGE}}>
                              {m.afinidad}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!datos?.municipioConResultados?.length && <div className="py-12 text-center text-gray-300 font-body text-sm">Sin datos aún</div>}
                </div>
              </div>
            </div>
          )}

          {/* VISTA 3 */}
          {vista===2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-display font-bold text-gray-800 mb-4">SER · HACER · SABER por programa</h3>
                {datos?.resultadosPorPrograma?.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={datos.resultadosPorPrograma}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="programa" tick={{fontSize:11,fontFamily:'DM Sans'}} />
                      <YAxis domain={[0,100]} tick={{fontSize:11,fontFamily:'DM Sans'}} />
                      <Tooltip /><Legend />
                      <Bar dataKey="ser"   fill={UIS_PURPLE} radius={[4,4,0,0]} name="SER"   />
                      <Bar dataKey="hacer" fill={UIS_GREEN}  radius={[4,4,0,0]} name="HACER" />
                      <Bar dataKey="saber" fill={UIS_BLUE}   radius={[4,4,0,0]} name="SABER" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-52 flex items-center justify-center text-gray-300 text-sm font-body">Sin datos aún</div>}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {datos?.resultadosPorPrograma?.map((p,i)=>(
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                    <p className="font-display font-bold text-gray-800 text-sm mb-4">{p.programa}</p>
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                        <circle cx="40" cy="40" r="32" fill="none" stroke={COLORS[i]} strokeWidth="8"
                          strokeDasharray={`${2.01*(p.afinidad||0)} ${201-2.01*(p.afinidad||0)}`} strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display font-black text-lg" style={{color:COLORS[i]}}>{p.afinidad}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-body">Afinidad promedio</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-display font-bold text-gray-800 mb-4">Perfil comparativo de competencias</h3>
                {datos?.resultadosPorPrograma?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      {subject:'SER',   ...Object.fromEntries(datos.resultadosPorPrograma.map(p=>[p.programa.split(' ')[0],p.ser]))  },
                      {subject:'HACER', ...Object.fromEntries(datos.resultadosPorPrograma.map(p=>[p.programa.split(' ')[0],p.hacer]))},
                      {subject:'SABER', ...Object.fromEntries(datos.resultadosPorPrograma.map(p=>[p.programa.split(' ')[0],p.saber]))},
                    ]}>
                      <PolarGrid stroke="#e5e7eb"/>
                      <PolarAngleAxis dataKey="subject" tick={{fontSize:13,fontFamily:'Sora'}}/>
                      {datos.resultadosPorPrograma.map((p,i)=>(
                        <Radar key={i} name={p.programa.split(' ')[0]} dataKey={p.programa.split(' ')[0]}
                          stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12}/>
                      ))}
                      <Legend/>
                    </RadarChart>
                  </ResponsiveContainer>
                ) : <div className="h-52 flex items-center justify-center text-gray-300 text-sm font-body">Sin datos aún</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast mensaje eliminación */}
      {mensajeElim && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
          <div
            className="px-6 py-3 rounded-2xl shadow-2xl font-display font-semibold text-sm flex items-center gap-3"
            style={mensajeElim.ok
              ? { background: '#14532d', color: '#4ade80', border: '1px solid #166534' }
              : { background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' }
            }
          >
            {mensajeElim.texto}
            <button onClick={() => setMensajeElim(null)} className="opacity-60 hover:opacity-100 ml-2">✕</button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-scale-in">

            {/* Menú principal de opciones */}
            {modalEliminar === 'menu' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🗑️</div>
                  <h3 className="font-display font-black text-xl text-gray-900">Eliminar registros</h3>
                  <p className="text-gray-400 font-body text-sm mt-1">Elige qué deseas eliminar</p>
                </div>
                <div className="space-y-3 mb-6">
                  <button onClick={() => setModalEliminar('confirmar-incompletos')}
                    className="w-full text-left bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition-colors">
                    <p className="font-display font-bold text-amber-800 text-sm">⚠️ Registros incompletos</p>
                    <p className="font-body text-amber-600 text-xs mt-0.5">Sesiones que no llegaron al resultado final</p>
                  </button>
                  <button onClick={() => setModalEliminar('confirmar-todo')}
                    className="w-full text-left bg-red-50 border border-red-200 rounded-2xl p-4 hover:bg-red-100 transition-colors">
                    <p className="font-display font-bold text-red-700 text-sm">🚨 Todos los registros</p>
                    <p className="font-body text-red-500 text-xs mt-0.5">Elimina todas las sesiones, respuestas y resultados</p>
                  </button>
                </div>
                <button onClick={() => setModalEliminar(null)}
                  className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-display font-semibold text-sm hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </>
            )}

            {/* Confirmación eliminar incompletos */}
            {modalEliminar === 'confirmar-incompletos' && (
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">⚠️</div>
                  <h3 className="font-display font-black text-xl text-gray-900">¿Eliminar incompletos?</h3>
                  <p className="text-gray-500 font-body text-sm mt-2">
                    Se eliminarán todas las sesiones que no llegaron al resultado final. Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModalEliminar('menu')}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-display font-semibold text-sm hover:bg-gray-50 transition-colors">
                    Volver
                  </button>
                  <button onClick={() => eliminarRegistros('incompletos')} disabled={eliminando}
                    className="flex-1 py-3 rounded-2xl font-display font-bold text-sm text-white transition-colors"
                    style={{ background: eliminando ? '#d1d5db' : '#d97706' }}>
                    {eliminando ? '...' : 'Sí, eliminar'}
                  </button>
                </div>
              </>
            )}

            {/* Confirmación eliminar todo — requiere escribir CONFIRMAR */}
            {modalEliminar === 'confirmar-todo' && (
              <ConfirmarTodo
                eliminando={eliminando}
                onConfirmar={() => eliminarRegistros('todo')}
                onVolver={() => setModalEliminar('menu')}
              />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8 py-5 px-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded flex items-center justify-center font-display font-black text-xs text-white" style={{background:UIS_GREEN}}>UIS</div>
            <span className="font-body text-gray-400 text-xs">Universidad Industrial de Santander · Programa Catatumbo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 font-body text-xs">Con Dignidad,</span>
            <span className="font-display font-bold text-xs" style={{color:UIS_GREEN}}>¡CUMPLIMOS!</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
