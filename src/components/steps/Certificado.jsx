import { useEffect, useRef, useState } from 'react'
import { PROGRAMAS } from '../../data/programas'

function CertificadoCanvas({ nombre, municipio, programasOrden, fecha }) {
  const canvasRef = useRef(null)
  const [generado, setGenerado] = useState(false)

  // Tomamos únicamente la carrera de máxima elección (la primera de la lista)
  const idEleccionPrincipal = programasOrden?.[0]
  const programaPrincipalNombre = PROGRAMAS.find(p => p.id === idEleccionPrincipal)?.nombre || 'Programa Priorizado'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    // Cargar imagen de fondo del territorio
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, W, H)

      // Overlay degradado sobre la imagen
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, 'rgba(0,51,102,0.92)')
      grad.addColorStop(0.5, 'rgba(30,41,59,0.90)')
      grad.addColorStop(1, 'rgba(15,23,42,0.92)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      dibujarContenido()
    }
    img.onerror = () => {
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, '#1e3a5f')
      grad.addColorStop(0.5, '#1e293b')
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
      dibujarContenido()
    }
    img.src = '/territorio-arte.jpg'

    function dibujarContenido() {
      // Bordes decorativos
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3
      ctx.strokeRect(20, 20, W-40, H-40)
      ctx.strokeStyle = 'rgba(103,185,94,0.3)';  ctx.lineWidth = 1
      ctx.strokeRect(28, 28, W-56, H-56)

      // Intentar cargar e incrustar el Logo UIS en el extremo superior izquierdo
      const logoUIS = new Image()
      logoUIS.onload = () => {
        ctx.drawImage(logoUIS, 45, 45, 110, 50)
        cargarLogoMin()
      }
      logoUIS.onerror = cargarLogoMin
      logoUIS.src = '/LOGO_UIS.svg'

      function cargarLogoMin() {
        // Intentar cargar el Logo Institucional en el extremo superior derecho
        const logoMin = new Image()
        logoMin.onload = () => {
          ctx.drawImage(logoMin, W - 155, 45, 110, 50)
          finalizarTexto()
        }
        logoMin.onerror = finalizarTexto
        logoMin.src = '/LOGO_MIN.svg'
      }

      function finalizarTexto() {
        // Texto institucional superior centralizado
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '700 11px Arial'
        ctx.fillText('CONSTRUCCIÓN COLECTIVA DE LA OFERTA ACADÉMICA', W/2, 65)

        ctx.fillStyle = '#67B93E'
        ctx.font = 'bold 11px Arial'
        ctx.fillText('MESA TÉCNICA CURRICULAR · TERRITORIO CATATUMBO', W/2, 82)

        // Título del certificado
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 22px Arial'
        ctx.fillText('CERTIFICADO DE PARTICIPACIÓN CIUDADANA', W/2, 140)

        // Línea divisoria elegante
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(W/2-140, 155); ctx.lineTo(W/2+140, 155); ctx.stroke()

        // Texto de Otorgamiento
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.font = '400 14px Arial'
        ctx.fillText('Se otorga el presente reconocimiento y distinción a:', W/2, 195)

        // Nombre del participante
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px Arial'
        ctx.fillText(nombre || 'Participante', W/2, 240)

        // Ubicación territorial
        ctx.fillStyle = '#67B93E'
        ctx.font = 'bold 14px Arial'
        ctx.fillText(`Habitante del municipio de ${municipio || 'Catatumbo'}, Norte de Santander`, W/2, 265)

        // Contenido del Reconocimiento
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '400 12.5px Arial'
        ctx.fillText('Por haber liderado y aportado activamente con su visión en el diseño, pertinencia territorial', W/2, 305)
        ctx.fillText('y proyección laboral de la futura Universidad del Catatumbo para el programa de:', W/2, 323)

        // Mención de la carrera principal elegida
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 15px Arial'
        ctx.fillText(`🎓 ${programaPrincipalNombre.toUpperCase()}`, W/2, 362)

        // Fecha de expedición (limpia en la base)
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.font = '400 11px Arial'
        ctx.fillText(`Expedido el: ${fecha}`, W/2, 415)

        // Slogan de cierre
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = 'italic 11px Arial'
        ctx.fillText('🌿 "La educación transforma territorios, fortalece comunidades y construye futuro."', W/2, H-35)

        setGenerado(true)
      }
    }
  }, [nombre, municipio, fecha, programaPrincipalNombre])

  const descargar = () => {
    const link     = document.createElement('a')
    link.download  = `Certificado_Catatumbo_${(nombre||'participante').replace(/\s+/g,'_')}.png`
    link.href      = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div>
      <canvas ref={canvasRef} width={700} height={480} className="w-full rounded-2xl shadow-2xl" />
      {generado && (
        <button onClick={descargar}
          className="w-full mt-4 py-3.5 rounded-2xl font-display font-bold text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ background: '#67B93E', boxShadow: '0 4px 16px rgba(103,185,62,0.35)' }}>
          📄 Descargar certificado en alta definición
        </button>
      )}
    </div>
  )
}

export default function Certificado({ nombre, municipio, programasOrden, codigoQR, onReiniciar }) {
  const [mostrarContenido, setMostrarContenido] = useState(false)
  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => { 
    const timer = setTimeout(() => setMostrarContenido(true), 1200) 
    return () => clearTimeout(timer)
  }, [])

  const idEleccionPrincipal = programasOrden?.[0]
  const programaPrincipalNombre = PROGRAMAS.find(p => p.id === idEleccionPrincipal)?.nombre || 'Programa Priorizado'

  const compartir = async () => {
    const texto = `🎓 Acabo de participar aportando mi visión sobre la empleabilidad para el programa de ${programaPrincipalNombre} en la futura Universidad del Catatumbo. ¡Juntos construimos el futuro del territorio!`
    if (navigator.share) await navigator.share({ title: 'Mi certificado Catatumbo', text: texto })
    else { await navigator.clipboard.writeText(texto); alert('¡Mensaje de difusión copiado al portapapeles!') }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0f2027, #203a43, #2c5364)' }}>
      {/* Animación Confeti sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {['🌿','✨','⭐','🎉','💫','🌟','🎈','🌿'].map((e,i) => (
          <div key={i} className="absolute text-3xl"
            style={{ left:`${10+i*12}%`, top:'-40px', animation:`caer ${2.5+i*0.3}s ease-in ${i*0.15}s forwards` }}>
            {e}
          </div>
        ))}
      </div>
      <style>{`@keyframes caer{0%{transform:translateY(-40px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(540deg);opacity:0}}`}</style>

      <div className="relative z-20 max-w-2xl mx-auto px-5 py-10 space-y-6">

        {/* Mensaje de Éxito */}
        <div className="text-center">
          <div className="text-7xl mb-4">🎓</div>
          <h2 className="font-display text-4xl font-black text-white mb-2">¡Aporte Procesado, {nombre}!</h2>
          <p className="text-white/70 font-body text-lg">Tu participación ha quedado registrada exitosamente en la base de datos de la mesa técnica</p>
        </div>

        {/* Logotipos en el apartado HTML cargando de forma segura desde /public */}
        <div className="flex items-center justify-center gap-8 py-3 bg-white/5 rounded-2xl backdrop-blur-sm max-w-sm mx-auto border border-white/5">
          <img src="/LOGO_UIS.svg" alt="UIS" className="h-9 w-auto object-contain" />
          <div className="w-px h-6 bg-white/20" />
          <img src="/LOGO_MIN.svg" alt="Logo Institucional" className="h-9 w-auto object-contain" />
        </div>

        {/* Panel Resumen de Insignia */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-5xl mb-3">🏅</div>
          <p className="text-white/50 font-body text-xs uppercase tracking-widest mb-1">Tu rol en esta iniciativa</p>
          <p className="font-display font-black text-2xl text-white">Planificador Curricular</p>
          <p className="text-[#a8e063] font-body text-sm mt-1.5 font-semibold">Enfoque: {programaPrincipalNombre}</p>
        </div>

        {/* Sección de visualización del Certificado */}
        {mostrarContenido && (
          <div className="space-y-3">
            <p className="text-white/50 font-body text-xs uppercase tracking-widest text-center">Vista previa de tu reconocimiento digital</p>
            <CertificadoCanvas nombre={nombre} municipio={municipio} programasOrden={programasOrden} fecha={fecha} />
          </div>
        )}

        {/* Barra de Acciones */}
        <div className="grid grid-cols-2 gap-4 pt-4 pb-8">
          <button onClick={compartir}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-white/10 text-white font-display font-semibold bg-white/5 hover:bg-white/10 transition-colors">
            🔗 Compartir Logro
          </button>
          <button onClick={onReiniciar}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#67B93E' }}>
            🔄 Formulario Nuevo
          </button>
        </div>
      </div>
    </div>
  )
}