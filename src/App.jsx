import { useExperiencia, PASOS } from './hooks/useExperiencia'
import Welcome from './components/steps/Welcome'
import InfoGeneral from './components/steps/InfoGeneral'
import SelectPrograma from './components/steps/SelectPrograma'
import VideoPrograma from './components/steps/VideoPrograma'
import Cuestionario from './components/steps/Cuestionario'
import Resultado from './components/steps/Resultado'
import Dashboard from './components/Dashboard'
import HeaderUIS from './components/HeaderUIS'
import './index.css'

// Barra de progreso — debajo del header
function ProgressBar({ paso }) {
  if (paso === PASOS.BIENVENIDA) return null
  const porcentaje = Math.round(((paso - 1) / 4) * 100)
  return (
    <div className="h-1 bg-gray-100 w-full">
      <div
        className="h-full transition-all duration-700 rounded-r-full"
        style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #67B93E, #4f9a2b)' }}
      />
    </div>
  )
}

// Banner modo demo
function DemoBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-body shadow-lg flex-wrap" style={{ background: '#fff3cd', color: '#856404' }}>
      <span>⚠️ <strong className="font-display">Modo demo</strong> — Los datos no se guardan.</span>
      <span>Crea <code className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: '#ffeaa7' }}>.env.local</code> con tus credenciales de Supabase.</span>
      <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-display font-semibold hover:opacity-80">
        Ir a Supabase →
      </a>
    </div>
  )
}

// Layout con header UIS para pasos interiores
function LayoutConHeader({ children, paso }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderUIS />
      <ProgressBar paso={paso} />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function App() {
  const exp = useExperiencia()

const pathLimpio = window.location.pathname.replace(/\/$/, "").toLowerCase();
const esDashboard = pathLimpio === '/dashboard';
if (esDashboard) return <Dashboard />


  return (
    <>
      {exp.modoDemo && <DemoBanner />}

      {exp.paso === PASOS.BIENVENIDA && (
        <Welcome onComenzar={() => exp.irAPaso(PASOS.INFO_GENERAL)} />
      )}

      {exp.paso === PASOS.INFO_GENERAL && (
        <LayoutConHeader paso={exp.paso}>
          <InfoGeneral
            onContinuar={exp.guardarInfoGeneral}
            guardando={exp.guardando}
            error={exp.error}
          />
        </LayoutConHeader>
      )}

      {exp.paso === PASOS.SELECCION_PROGRAMA && (
        <LayoutConHeader paso={exp.paso}>
          <SelectPrograma onSeleccionar={exp.seleccionarPrograma} />
        </LayoutConHeader>
      )}

      {exp.paso === PASOS.VIDEO && (
        <LayoutConHeader paso={exp.paso}>
          <VideoPrograma
            programaId={exp.programaId}
            onContinuar={() => exp.irAPaso(PASOS.CUESTIONARIO)}
          />
        </LayoutConHeader>
      )}

      {exp.paso === PASOS.CUESTIONARIO && (
        <LayoutConHeader paso={exp.paso}>
          <Cuestionario
            programaId={exp.programaId}
            onFinalizar={exp.finalizarCuestionario}
            guardando={exp.guardando}
          />
        </LayoutConHeader>
      )}

      {exp.paso === PASOS.RESULTADO && (
        <LayoutConHeader paso={exp.paso}>
          <Resultado
            resultado={exp.resultado}
            programaId={exp.programaId}
            onReiniciar={exp.reiniciar}
            onFinalizar={exp.reiniciar}
          />
        </LayoutConHeader>
      )}
    </>
  )
}
