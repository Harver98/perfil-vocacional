import { useExperiencia, PASOS } from './hooks/useExperiencia'
import FormularioCerrado      from './components/FormularioCerrado'
import Bienvenida          from './components/steps/Bienvenida'
import Capsula             from './components/steps/Capsula'
import Caracterizacion     from './components/steps/Caracterizacion'
import ProgramasOrden      from './components/steps/ProgramasOrden'
import SocializacionYPerfil from './components/steps/SocializacionYPerfil'
import LineasYElectivas    from './components/steps/LineasYElectivas'
import Empleabilidad       from './components/steps/Empleabilidad'
import Certificado         from './components/steps/Certificado'
import Dashboard           from './components/Dashboard'
import DiagnosticoSupabase from './components/DiagnosticoSupabase'
import './index.css'

// ⚠️ Cambia esto a false para reabrir el formulario
const FORMULARIO_CERRADO = true

// Banner modo demo
function DemoBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2 flex items-center justify-center gap-2 text-sm font-body flex-wrap"
      style={{ background: '#fff3cd', color: '#856404' }}>
      <span>⚠️ <strong>Modo demo</strong> — Los datos no se guardan.</span>
      <span>Crea <code className="px-1 rounded font-mono text-xs" style={{ background: '#ffeaa7' }}>.env.local</code> con tus credenciales de Supabase.</span>
    </div>
  )
}

export default function App() {
  const exp = useExperiencia()

  // Rutas especiales
  const path = window.location.pathname.replace(/\/$/, '').toLowerCase()
  if (path === '/dashboard')   return <Dashboard />
  if (path === '/diagnostico') return <DiagnosticoSupabase />

  // ── Formulario cerrado ──────────────────────────────────────────────────
  // Permite seguir entrando al dashboard y diagnóstico aunque esté cerrado
  if (FORMULARIO_CERRADO) return <FormularioCerrado />

  return (
    <>
      {exp.modoDemo && <DemoBanner />}

      {/* ── SECCIÓN 1: Bienvenida ─────────────────────────────────────── */}
      {exp.paso === PASOS.BIENVENIDA && (
        <Bienvenida onComenzar={() => exp.irAPaso(PASOS.CAPSULA)} />
      )}

      {/* ── SECCIÓN 2: Cápsulas informativas ─────────────────────────── */}
      {exp.paso === PASOS.CAPSULA && (
        <Capsula
          onContinuar={() => exp.irAPaso(PASOS.CARACTERIZACION)}
          registrarVideoVisto={exp.registrarVideoVisto}
        />
      )}

      {/* ── SECCIÓN 3: Caracterización ───────────────────────────────── */}
      {exp.paso === PASOS.CARACTERIZACION && (
        <Caracterizacion
          onContinuar={exp.guardarCaracterizacion}
          guardando={exp.guardando}
          error={exp.error}
        />
      )}

      {/* ── SECCIÓN 4: Orden de programas ────────────────────────────── */}
      {exp.paso === PASOS.PROGRAMAS_ORDEN && (
        <ProgramasOrden onContinuar={exp.guardarProgramasOrden} />
      )}

      {/* ── SECCIONES 5 + 6 + 7: Socialización + Perfiles ───────────── */}
      {(exp.paso === PASOS.SOCIALIZACION ||
        exp.paso === PASOS.PERFIL_INGRESO ||
        exp.paso === PASOS.PERFIL_EGRESO) && (
        <SocializacionYPerfil
          programasOrden={exp.programasOrden}
          onGuardarIngreso={async (datos) => {
            await exp.guardarPerfilIngreso(datos)
          }}
          onGuardarEgreso={async (datos) => {
            await exp.guardarPerfilEgreso(datos)
          }}
          guardando={exp.guardando}
        />
      )}

      {/* ── SECCIONES 8 + 9: Líneas y Electivas ─────────────────────── */}
      {(exp.paso === PASOS.LINEAS_INVESTIGACION ||
        exp.paso === PASOS.ELECTIVAS) && (
        <LineasYElectivas
          programaActual={exp.programaActual}
          onGuardarLineas={exp.guardarLineas}
          onGuardarElectivas={exp.guardarElectivas}
          guardando={exp.guardando}
        />
      )}

      {/* ── SECCIÓN 10: Empleabilidad y Manifiesto ───────────────────── */}
      {exp.paso === PASOS.EMPLEABILIDAD && (
        <Empleabilidad
          nombre={exp.nombre}
          programasOrden={exp.programasOrden}
          onGuardar={exp.guardarManifiesto}
          guardando={exp.guardando}
        />
      )}

      {/* ── SECCIÓN 11: Certificado ──────────────────────────────────── */}
      {exp.paso === PASOS.CERTIFICADO && (
        <Certificado
          nombre={exp.nombre}
          municipio={exp.municipio}
          programasOrden={exp.programasOrden}
          codigoQR={exp.codigoQR}
          onReiniciar={exp.reiniciar}
        />
      )}
    </>
  )
}