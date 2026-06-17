import { useState } from 'react'
import { MUNICIPIOS_CATATUMBO, TIPOS_ACTOR, NIVELES_EDUCATIVOS, GRADOS } from '../../data/catatumbo'

const INPUT_CLASS = "w-full border-2 border-gray-200 rounded-2xl px-5 py-4 font-body text-gray-800 text-base focus:outline-none transition-all bg-white"

function Campo({ label, children }) {
  return (
    <div className="animate-fade-up">
      <label className="block font-display font-bold text-gray-700 text-sm mb-2 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export default function Caracterizacion({ onContinuar, guardando, error }) {
  const [subpaso, setSubpaso] = useState(0)

  const [nombre,         setNombre]         = useState('')
  const [municipio,      setMunicipio]      = useState('')
  const [corregimiento,  setCorregimiento]  = useState('')
  const [vereda,         setVereda]         = useState('')
  const [tipoActor,      setTipoActor]      = useState('')

  const [edad,           setEdad]           = useState('')
  const [colegio,        setColegio]        = useState('')
  const [grado,          setGrado]          = useState('')
  const [institucion,    setInstitucion]    = useState('')
  const [area,           setArea]           = useState('')
  const [nivelEdu,       setNivelEdu]       = useState('')
  const [organizacion,   setOrganizacion]   = useState('')
  const [correo,         setCorreo]         = useState('')
  // null = sin responder; true/false = respuesta seleccionada
  const [participoAntes, setParticipoAntes] = useState(null)

  const actorInfo = TIPOS_ACTOR.find(a => a.id === tipoActor)

  const irSiguiente = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setSubpaso(s => s + 1)
  }

  // El formulario final requiere edad Y que participoAntes haya sido respondido (true o false, no null)
  const puedeEnviar = !!edad && participoAntes !== null && !guardando

  const handleEnviar = () => {
    if (!puedeEnviar) return
    const datosActor = {
      edad,
      colegio,
      grado,
      institucion,
      area,
      nivel_educativo: nivelEdu,
      organizacion,
      correo,
      participo_antes: participoAntes,
    }
    onContinuar({ nombre, municipio, corregimiento, vereda, tipoActor, datosActor })
  }

  const SUBPASOS = [
    // 0 — Nombre
    <div key={0} className="space-y-6">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">👋</span>
        <h2 className="font-display text-3xl font-black text-gray-900 mb-2">¡Bienvenido/a al recorrido!</h2>
        <p className="text-gray-500 font-body">Cuéntanos quién eres para personalizar tu experiencia</p>
      </div>
      <Campo label="¿Cuál es tu nombre completo?">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Escribe tu nombre..."
          className={INPUT_CLASS}
          onFocus={e => (e.target.style.borderColor = '#67B93E')}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Campo>
      <button
        onClick={irSiguiente}
        disabled={!nombre.trim()}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
        style={nombre.trim()
          ? { background: '#67B93E', boxShadow: '0 4px 20px rgba(103,185,62,0.3)' }
          : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }}>
        Continuar →
      </button>
    </div>,

    // 1 — Municipio
    <div key={1} className="space-y-6">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">📍</span>
        <h2 className="font-display text-3xl font-black text-gray-900 mb-2">
          Hola, <span style={{ color: '#67B93E' }}>{nombre}</span>
        </h2>
        <p className="text-gray-500 font-body">¿De qué parte del Catatumbo eres?</p>
      </div>
      <Campo label="Municipio">
        <div className="grid grid-cols-2 gap-3">
          {MUNICIPIOS_CATATUMBO.map(m => (
            <button
              key={m}
              onClick={() => setMunicipio(m)}
              className="py-3 px-4 rounded-2xl border-2 font-display font-semibold text-sm transition-all duration-200"
              style={municipio === m
                ? { background: '#67B93E', borderColor: '#3d7820', color: 'white' }
                : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }}>
              {m}
            </button>
          ))}
        </div>
      </Campo>
      <Campo label="Corregimiento (opcional)">
        <input
          type="text"
          value={corregimiento}
          onChange={e => setCorregimiento(e.target.value)}
          placeholder="Nombre del corregimiento..."
          className={INPUT_CLASS}
          onFocus={e => (e.target.style.borderColor = '#67B93E')}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Campo>
      <Campo label="Vereda (opcional)">
        <input
          type="text"
          value={vereda}
          onChange={e => setVereda(e.target.value)}
          placeholder="Nombre de la vereda..."
          className={INPUT_CLASS}
          onFocus={e => (e.target.style.borderColor = '#67B93E')}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Campo>
      <button
        onClick={irSiguiente}
        disabled={!municipio}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
        style={municipio
          ? { background: '#67B93E', boxShadow: '0 4px 20px rgba(103,185,62,0.3)' }
          : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }}>
        Continuar →
      </button>
    </div>,

    // 2 — Tipo de actor
    <div key={2} className="space-y-6">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">🌟</span>
        <h2 className="font-display text-3xl font-black text-gray-900 mb-2">¿Cuál es tu rol en el territorio?</h2>
        <p className="text-gray-500 font-body">Selecciona el que mejor te describe</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {TIPOS_ACTOR.map(actor => (
          <button
            key={actor.id}
            onClick={() => setTipoActor(actor.id)}
            className="p-5 rounded-3xl border-2 text-left transition-all duration-200 hover:-translate-y-1"
            style={tipoActor === actor.id
              ? { background: actor.bg, borderColor: 'transparent', color: 'white', boxShadow: `0 8px 24px ${actor.color}40` }
              : { background: 'white', borderColor: '#e5e7eb' }}>
            <span className="text-3xl block mb-2">{actor.emoji}</span>
            <p className={`font-display font-bold text-base mb-1 ${tipoActor === actor.id ? 'text-white' : 'text-gray-900'}`}>{actor.label}</p>
            <p className={`font-body text-xs leading-snug ${tipoActor === actor.id ? 'text-white/75' : 'text-gray-500'}`}>{actor.descripcion}</p>
          </button>
        ))}
      </div>
      <button
        onClick={irSiguiente}
        disabled={!tipoActor}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
        style={tipoActor
          ? { background: actorInfo?.color || '#67B93E', boxShadow: `0 4px 20px ${actorInfo?.color || '#67B93E'}40` }
          : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }}>
        Continuar →
      </button>
    </div>,

    // 3 — Datos específicos según actor
    <div key={3} className="space-y-5">
      <div className="text-center mb-8">
        <span className="text-4xl block mb-3">{actorInfo?.emoji}</span>
        <h2 className="font-display text-2xl font-black text-gray-900 mb-1">Un poco más sobre ti</h2>
        <p className="text-gray-500 font-body text-sm">
          Como <strong>{actorInfo?.label}</strong> del Catatumbo
        </p>
      </div>

      <Campo label="Edad">
        <input
          type="number"
          min="10"
          max="90"
          value={edad}
          onChange={e => setEdad(e.target.value)}
          placeholder="Tu edad..."
          className={INPUT_CLASS}
          onFocus={e => (e.target.style.borderColor = '#67B93E')}
          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
        />
      </Campo>

      {tipoActor === 'estudiante' && (
        <>
          <Campo label="Colegio">
            <input
              type="text"
              value={colegio}
              onChange={e => setColegio(e.target.value)}
              placeholder="Nombre del colegio..."
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Campo>
          <Campo label="Grado">
            <div className="flex flex-wrap gap-2">
              {GRADOS.map(g => (
                <button
                  key={g}
                  onClick={() => setGrado(g)}
                  className="px-4 py-2 rounded-xl border-2 font-display font-bold text-sm transition-all"
                  style={grado === g
                    ? { background: '#67B93E', borderColor: '#3d7820', color: 'white' }
                    : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }}>
                  {g}
                </button>
              ))}
            </div>
          </Campo>
        </>
      )}

      {tipoActor === 'docente' && (
        <>
          <Campo label="Institución educativa">
            <input
              type="text"
              value={institucion}
              onChange={e => setInstitucion(e.target.value)}
              placeholder="Nombre de la institución..."
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Campo>
          <Campo label="Área de enseñanza">
            <input
              type="text"
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="Ej: Ciencias Naturales, Matemáticas..."
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Campo>
          <Campo label="Correo electrónico">
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Campo>
        </>
      )}

      {tipoActor === 'comunidad' && (
        <>
          <Campo label="Nivel educativo">
            <select
              value={nivelEdu}
              onChange={e => setNivelEdu(e.target.value)}
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}>
              <option value="">Selecciona...</option>
              {NIVELES_EDUCATIVOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Campo>
          <Campo label="Correo (opcional)">
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="tu@correo.com (opcional)"
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Campo>
        </>
      )}

      {tipoActor === 'organizacion' && (
        <>
          <Campo label="Nombre de la organización">
            <input
              type="text"
              value={organizacion}
              onChange={e => setOrganizacion(e.target.value)}
              placeholder="Nombre de tu organización..."
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Campo>
          <Campo label="Correo electrónico">
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              className={INPUT_CLASS}
              onFocus={e => (e.target.style.borderColor = '#67B93E')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </Campo>
        </>
      )}

      {/* participoAntes es OBLIGATORIO — el botón queda bloqueado hasta responder */}
      <Campo label="¿Ha participado en espacios de socialización sobre educación superior en el Catatumbo?">
        <div className="flex gap-3">
          {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(op => (
            <button
              key={String(op.v)}
              onClick={() => setParticipoAntes(op.v)}
              className="flex-1 py-3 rounded-2xl border-2 font-display font-bold transition-all"
              style={participoAntes === op.v
                ? { background: '#67B93E', borderColor: '#3d7820', color: 'white' }
                : { background: 'white', borderColor: '#e5e7eb', color: '#374151' }}>
              {op.l}
            </button>
          ))}
        </div>
      </Campo>

      {/* Indicador visual cuando falta responder participoAntes */}
      {edad && participoAntes === null && (
        <p className="text-amber-600 text-xs font-semibold text-center">
          ⚠️ Por favor responde si has participado antes para continuar.
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 font-body text-sm">
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleEnviar}
        disabled={!puedeEnviar}
        className="w-full py-4 rounded-2xl font-display font-bold text-lg text-white transition-all"
        style={puedeEnviar
          ? { background: '#67B93E', boxShadow: '0 4px 20px rgba(103,185,62,0.3)' }
          : { background: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed' }}>
        {guardando
          ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </span>
          )
          : 'Continuar el recorrido →'}
      </button>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {SUBPASOS[subpaso]}
      </div>
    </div>
  )
}
