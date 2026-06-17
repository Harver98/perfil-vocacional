import { useState } from 'react'
import { PROGRAMAS } from '../../data/programas'

const MANIFIESTO_TEXTO = `Nosotros y nosotras creemos en la Universidad Nacional del Catatumbo.

Quienes participamos en este proceso de diálogo, reflexión y validación comunitaria reconocemos que la educación superior constituye una oportunidad fundamental para fortalecer el desarrollo social, económico, cultural y ambiental del Catatumbo.

Como habitantes, líderes comunitarios, organizaciones sociales, instituciones educativas, sector productivo, comunidades indígenas, campesinas y ciudadanía en general, manifestamos nuestro respaldo a la creación y consolidación de los programas académicos de Trabajo Social, Administración de Empresas e Ingeniería Agronómica.

Consideramos que estos programas responden a las necesidades, potencialidades y desafíos de nuestro territorio, aportando a la formación de profesionales comprometidos con la construcción de paz, el desarrollo rural, la innovación, la sostenibilidad ambiental, la inclusión social y el fortalecimiento de las capacidades locales.

Soñamos con una universidad que dialogue con las comunidades, reconozca la diversidad cultural del Catatumbo, valore los saberes campesinos e indígenas y contribuya a generar oportunidades para las nuevas generaciones.`

export default function Empleabilidad({ nombre, municipio, programasOrden, onGuardar, guardando }) {
  // ← El programa de mayor preferencia es siempre programasOrden[0]
  // El usuario ya lo ordenó en ProgramasOrden (drag & drop)
  const programaPrincipal = programasOrden[0]
  const progPrincipal     = PROGRAMAS.find(p => p.id === programaPrincipal)

  const [empleabilidad,     setEmpleabilidad]     = useState({})
  const [organizacion,      setOrganizacion]      = useState('')
  const [comentarioFinal,   setComentarioFinal]   = useState('')
  const [acepta,            setAcepta]            = useState(false)
  const [listo,             setListo]             = useState(false)
  const [mostrarManifiesto, setMostrarManifiesto] = useState(false)
  // Permite ver los otros programas si quiere
  const [progActivo,        setProgActivo]        = useState(programaPrincipal)

  const setEmp    = (id, val) => setEmpleabilidad(prev => ({ ...prev, [id]: val }))
  const progActual = PROGRAMAS.find(p => p.id === progActivo)

  const handleEnviar = async () => {
    setListo(true)
    await onGuardar({ empleabilidad, comentarioFinal, acepta, organizacion, firma: null })
  }

  const puedeEnviar = acepta

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(160deg,#1e3a5f 0%,#1e293b 50%,#0f172a 100%)' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <span className="text-5xl block mb-3">🏛️</span>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Validación general de pertinencia
            </span>
          </div>
          <h2 className="font-display text-3xl font-black text-white mb-2">
            ¿Dónde trabajarán los futuros profesionales?
          </h2>

          {/* Mostrar el programa de mayor preferencia */}
          {progPrincipal && (
            <div className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 mt-2"
              style={{ background: `${progPrincipal.colorAccent}25`, border: `1px solid ${progPrincipal.colorAccent}60` }}>
              <span className="text-lg">{progPrincipal.emoji}</span>
              <div className="text-left">
                <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Tu programa de mayor interés</p>
                <p className="font-display font-bold text-white text-sm">{progPrincipal.nombre}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pregunta de empleabilidad — muestra el programa activo */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>
          {/* Tabs de programas — en el orden que el usuario los priorizó */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {programasOrden.map((id, i) => {
              const p = PROGRAMAS.find(x => x.id === id)
              if (!p) return null
              const activo = progActivo === id
              return (
                <button key={id} onClick={() => setProgActivo(id)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all"
                  style={{
                    borderBottom: activo ? `2px solid ${p.colorAccent}` : '2px solid transparent',
                    background: activo ? `${p.colorAccent}15` : 'transparent',
                  }}>
                  <span className="text-xl">{p.emoji}</span>
                  <span className="font-body text-xs leading-tight text-center hidden sm:block"
                    style={{ color: activo ? '#ffffff' : 'rgba(255,255,255,0.45)' }}>
                    {p.nombre.split(' ')[0]}
                  </span>
                  {/* Badge de posición */}
                  <span className="font-display font-black text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: i === 0 ? p.colorAccent : 'rgba(255,255,255,0.1)',
                      color: i === 0 ? 'white' : 'rgba(255,255,255,0.4)',
                      fontSize: 10,
                    }}>
                    {i === 0 ? '★ 1ª' : `${i + 1}ª`}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Textarea del programa activo */}
          {progActual && (
            <div className="p-5">
              <p className="font-body text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Desde su experiencia, ¿en qué instituciones, organizaciones, empresas o sectores
                podrían trabajar los egresados de <strong className="text-white">{progActual.nombre}</strong> en el Catatumbo?
              </p>
              <textarea
                rows={4}
                value={empleabilidad[progActual.id] || ''}
                onChange={e => setEmp(progActual.id, e.target.value)}
                placeholder={`Ej: Alcaldías, ICBF, hospitales, cooperativas agrícolas, ONG...`}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
                  padding: '12px 16px', color: '#ffffff',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                  resize: 'none', outline: 'none', lineHeight: 1.6,
                }}
              />
              {/* Indicador de llenado de los otros programas */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {programasOrden.filter(id => id !== progActivo).map(id => {
                  const p        = PROGRAMAS.find(x => x.id === id)
                  const tieneResp = !!(empleabilidad[id]?.trim())
                  return (
                    <button key={id} onClick={() => setProgActivo(id)}
                      className="flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                      {tieneResp ? '✅' : '○'} {p?.emoji} {p?.nombre.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Organización */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="font-display font-bold text-white text-sm mb-2">
            Organización o Institución que representa{' '}
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(opcional)</span>
          </p>
          <input type="text" value={organizacion} onChange={e => setOrganizacion(e.target.value)}
            placeholder="Nombre de su organización, institución o comunidad..."
            style={{
              width: '100%', background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
              padding: '12px 16px', color: '#ffffff',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none',
            }}
          />
        </div>

        {/* Manifiesto */}
        <div className="relative rounded-3xl overflow-hidden">
          <img src="/territorio-mural.jpg" alt="Catatumbo te quiero"
            className="w-full object-cover" style={{ height: 200, objectPosition: 'center 40%' }} />
          <div className="absolute inset-0" style={{ background: 'rgba(0,51,102,0.90)' }} />
          <div className="relative z-10 p-7">
            <p className="font-body text-xs uppercase tracking-widest mb-3 text-center"
              style={{ color: 'rgba(255,255,255,0.5)' }}>Carta Manifiesto</p>
            <h3 className="font-display text-xl font-black text-white text-center mb-4 leading-tight">
              MANIFIESTO POR LA EDUCACIÓN SUPERIOR<br />Y EL FUTURO DEL CATATUMBO
            </h3>
            <div className={`overflow-hidden transition-all duration-500 ${mostrarManifiesto ? '' : 'max-h-20'}`}>
              <p className="font-body text-sm leading-relaxed whitespace-pre-line"
                style={{ color: 'rgba(255,255,255,0.82)' }}>
                {MANIFIESTO_TEXTO}
              </p>
            </div>
            <button onClick={() => setMostrarManifiesto(m => !m)}
              className="mt-3 text-xs font-display font-semibold underline w-full text-center"
              style={{ color: '#a8e063' }}>
              {mostrarManifiesto ? '▲ Ver menos' : '▼ Leer manifiesto completo'}
            </button>
            <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="font-display font-bold text-white text-base leading-snug">
                "La educación transforma territorios,<br />fortalece comunidades y construye futuro."
              </p>
            </div>
          </div>
        </div>

        {/* Comentario final */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="font-display font-bold text-white text-sm mb-1">
            ✏️ ¿Algún mensaje final para los constructores de esta universidad?
          </p>
          <p className="font-body text-xs mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Al finalizar, sus aportes serán sistematizados como insumo para fortalecer la propuesta académica.
          </p>
          <textarea rows={3} value={comentarioFinal} onChange={e => setComentarioFinal(e.target.value)}
            placeholder='"Gracias por escuchar nuestra voz..."'
            style={{
              width: '100%', background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
              padding: '12px 16px', color: '#ffffff',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14,
              resize: 'none', outline: 'none', lineHeight: 1.6,
            }}
          />
        </div>

        {/* Consentimiento */}
        <button onClick={() => setAcepta(a => !a)}
          className="w-full flex items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all"
          style={acepta
            ? { background: '#f0fdf4', borderColor: '#67B93E' }
            : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}>
          <div className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
            style={acepta ? { background: '#67B93E', borderColor: '#67B93E' } : { borderColor: 'rgba(255,255,255,0.3)' }}>
            {acepta && <span className="text-white text-sm font-bold">✓</span>}
          </div>
          <div>
            <p className="font-display font-bold text-sm mb-1"
              style={{ color: acepta ? '#1f2937' : 'rgba(255,255,255,0.9)' }}>
              Autorización para uso académico e institucional
            </p>
            <p className="font-body text-xs leading-relaxed"
              style={{ color: acepta ? '#4b5563' : 'rgba(255,255,255,0.55)' }}>
              Confirmo mi participación y autorizo el uso de la información suministrada con fines
              académicos e institucionales para fortalecer la propuesta de programas de la
              Universidad Nacional del Catatumbo.
            </p>
          </div>
        </button>

        {/* Mensaje de cierre */}
        <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            "Gracias por participar en este proceso de validación. Tus aportes serán fundamentales
            para ajustar la propuesta académica y fortalecer una oferta de educación superior
            pertinente, incluyente y territorializada para el Catatumbo."
          </p>
        </div>

        {/* Botón final */}
        <button onClick={handleEnviar} disabled={!puedeEnviar || guardando || listo}
          className="w-full py-5 rounded-2xl font-display font-black text-xl text-white transition-all duration-300"
          style={puedeEnviar && !guardando && !listo
            ? { background: 'linear-gradient(135deg,#67B93E,#3d7820)', boxShadow: '0 8px 32px rgba(103,185,62,0.4)' }
            : { background: '#374151', cursor: 'not-allowed' }}>
          {listo      ? '✅ ¡Enviado! Generando tu certificado...'
            : guardando ? 'Procesando...'
            : !acepta   ? 'Acepta la autorización para continuar'
            : '🎓 Finalizar y obtener mi certificado →'}
        </button>

        <p className="text-center font-body pb-4" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          {nombre} · {municipio} · Programa Catatumbo UIS
        </p>
      </div>
    </div>
  )
}