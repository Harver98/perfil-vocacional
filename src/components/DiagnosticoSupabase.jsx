import { useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'

// Componente de diagnóstico — solo visible en desarrollo
// Agrégalo temporalmente en App.jsx para debuggear
export default function DiagnosticoSupabase() {
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)

  const url = import.meta.env.VITE_SUPABASE_URL || '❌ NO DEFINIDA'
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  const keyResumen = key
    ? `✅ ${key.slice(0, 20)}...${key.slice(-6)}`
    : '❌ NO DEFINIDA'

  const testConexion = async () => {
    setCargando(true)
    try {
      const { data, error } = await supabase.from('sesiones').select('count').limit(1)
      if (error) setResultado({ ok: false, msg: error.message, code: error.code })
      else       setResultado({ ok: true,  msg: 'Conexión exitosa ✅' })
    } catch (e) {
      setResultado({ ok: false, msg: e.message })
    } finally {
      setCargando(false)
    }
  }

  const testAuth = async () => {
    setCargando(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) setResultado({ ok: false, msg: error.message })
      else       setResultado({ ok: true,  msg: `Auth OK · Sesión: ${data.session ? 'activa' : 'ninguna'}` })
    } catch (e) {
      setResultado({ ok: false, msg: e.message })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: 24, background: '#0f172a', color: '#e2e8f0', minHeight: '100vh' }}>
      <h2 style={{ color: '#67B93E', marginBottom: 24, fontSize: 20 }}>🔍 Diagnóstico Supabase</h2>

      <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <p style={{ color: '#94a3b8', marginBottom: 8, fontSize: 13 }}>VITE_SUPABASE_URL</p>
        <p style={{ color: url.startsWith('❌') ? '#f87171' : '#4ade80', wordBreak: 'break-all' }}>{url}</p>
      </div>

      <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <p style={{ color: '#94a3b8', marginBottom: 8, fontSize: 13 }}>VITE_SUPABASE_ANON_KEY</p>
        <p style={{ color: key ? '#4ade80' : '#f87171' }}>{keyResumen}</p>
      </div>

      <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <p style={{ color: '#94a3b8', marginBottom: 8, fontSize: 13 }}>Estado general</p>
        <p style={{ color: supabaseConfigurado ? '#4ade80' : '#f87171' }}>
          {supabaseConfigurado ? '✅ Variables de entorno cargadas' : '❌ Faltan variables de entorno'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button onClick={testConexion} disabled={cargando}
          style={{ background: '#67B93E', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 14 }}>
          {cargando ? '...' : '▶ Test BD (sesiones)'}
        </button>
        <button onClick={testAuth} disabled={cargando}
          style={{ background: '#5b2d8e', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 14 }}>
          {cargando ? '...' : '▶ Test Auth'}
        </button>
      </div>

      {resultado && (
        <div style={{ background: resultado.ok ? '#14532d' : '#450a0a', borderRadius: 12, padding: 20, border: `1px solid ${resultado.ok ? '#4ade80' : '#f87171'}` }}>
          <p style={{ color: resultado.ok ? '#4ade80' : '#f87171', margin: 0 }}>
            {resultado.msg}
          </p>
          {resultado.code && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>Código: {resultado.code}</p>}
        </div>
      )}

      <div style={{ marginTop: 32, background: '#1e293b', borderRadius: 12, padding: 20 }}>
        <p style={{ color: '#f59e0b', marginBottom: 12, fontSize: 14 }}>📋 Checklist</p>
        {[
          { ok: !!url && !url.startsWith('❌'), label: '.env.local existe con VITE_SUPABASE_URL' },
          { ok: !!key,                           label: '.env.local tiene VITE_SUPABASE_ANON_KEY' },
          { ok: url?.includes('.supabase.co'),   label: 'URL tiene formato correcto (.supabase.co)' },
          { ok: key?.startsWith('eyJ'),          label: 'Clave anon tiene formato JWT (empieza con eyJ)' },
          { ok: supabaseConfigurado,             label: 'Vite leyó las variables (reinicia npm run dev)' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ color: item.ok ? '#4ade80' : '#f87171', fontSize: 16 }}>{item.ok ? '✅' : '❌'}</span>
            <span style={{ color: item.ok ? '#cbd5e1' : '#f87171', fontSize: 13 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
