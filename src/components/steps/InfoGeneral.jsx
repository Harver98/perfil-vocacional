import { useState } from 'react'
import { MUNICIPIOS, GRUPOS_POBLACIONALES } from '../../data/municipios'

const UIS_GREEN = '#67B93E'
const UIS_GREEN_DARK = '#4f9a2b'
const UIS_GREEN_BG = '#f2faeb'
const UIS_GREEN_BORDER = '#c2e8a1'

// Opciones de zona residencial
const TIPOS_ZONA = [
  { id: 'cabecera', label: '🏡 Casco Urbano (Cabecera)' },
  { id: 'corregimiento', label: '⛰️ Corregimiento' },
  { id: 'vereda', label: '🌱 Vereda' }
]

export default function InfoGeneral({ onContinuar, guardando, error }) {
  const [municipio, setMunicipio] = useState('')
  const [edad, setEdad] = useState('')
  const [tipoZona, setTipoZona] = useState('cabecera') // 'cabecera', 'corregimiento' o 'vereda'
  const [nombreZona, setNombreZona] = useState('')      // Nombre específico de la vereda o corregimiento
  const [grupos, setGrupos] = useState([])

  const toggleGrupo = (id) => {
    setGrupos(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  const handleSubmit = () => {
    if (!municipio || !edad) return
    
    // Validación: Si escoge zona rural, el nombre es obligatorio
    if (tipoZona !== 'cabecera' && !nombreZona.trim()) return

    onContinuar({ 
      municipio, 
      edad, 
      tipoZona,
      nombreZona: tipoZona === 'cabecera' ? '' : nombreZona.trim(),
      gruposPoblacionales: grupos 
    })
  }

  // Validación extendida del formulario
  const esZonaValida = tipoZona === 'cabecera' || (tipoZona !== 'cabecera' && nombreZona.trim().length > 0)
  const valido = municipio && edad && parseInt(edad) >= 14 && parseInt(edad) <= 80 && esZonaValida

  return (
    <div className="flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full animate-fade-up">

        {/* Header de sección */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3" style={{ background: UIS_GREEN_BG, border: `2px solid ${UIS_GREEN_BORDER}` }}>
            👤
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900">Cuéntanos sobre ti</h2>
          <p className="text-gray-500 font-body mt-1 text-sm">Solo necesitamos esto para personalizar tu experiencia</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 p-7 space-y-5 border border-gray-100">

          {/* Municipio */}
          <div>
            <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
              📍 ¿De qué municipio eres?
            </label>
            <select
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-gray-700 bg-white focus:outline-none transition-all"
              onFocus={e => e.target.style.borderColor = UIS_GREEN}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">Selecciona tu municipio...</option>
              {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Zona de Residencia */}
          <div>
            <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
              🗺️ ¿En qué sector del municipio vives?
            </label>
            <div className="grid grid-cols-1 gap-2">
              {TIPOS_ZONA.map(z => (
                <label
                  key={z.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-body cursor-pointer transition-all duration-200"
                  style={tipoZona === z.id
                    ? { background: UIS_GREEN_BG, borderColor: UIS_GREEN, fontWeight: '600' }
                    : { background: 'white', borderColor: '#e5e7eb' }
                  }
                >
                  <input
                    type="radio"
                    name="tipoZona"
                    value={z.id}
                    checked={tipoZona === z.id}
                    onChange={(e) => {
                      setTipoZona(e.target.value)
                      if (e.target.value === 'cabecera') setNombreZona('')
                    }}
                    className="w-4 h-4 border-gray-300 focus:ring-emerald-500"
                    style={{ accentColor: UIS_GREEN }}
                  />
                  <span style={{ color: tipoZona === z.id ? UIS_GREEN_DARK : '#4b5563' }}>{z.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nombre de la Vereda o Corregimiento (Condicional) */}
          {tipoZona !== 'cabecera' && (
            <div className="transition-all duration-300 ease-in-out">
              <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                ✍️ Nombre del {tipoZona === 'corregimiento' ? 'corregimiento' : 'vereda'}
              </label>
              <input
                type="text"
                value={nombreZona}
                onChange={(e) => setNombreZona(e.target.value)}
                placeholder={tipoZona === 'corregimiento' ? "Ej: La Gabarra, Las Mercedes" : "Ej: Agua Blanca, El Salto"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-gray-700 focus:outline-none transition-all"
                onFocus={e => e.target.style.borderColor = UIS_GREEN}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          )}

          {/* Edad */}
          <div>
            <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
              🎂 ¿Cuántos años tienes?
            </label>
            <input
              type="number" min="14" max="80"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              placeholder="Ej: 22"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 font-body text-gray-700 focus:outline-none transition-all"
              onFocus={e => e.target.style.borderColor = UIS_GREEN}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Grupos poblacionales */}
          <div>
            <label className="block text-sm font-display font-semibold text-gray-700 mb-3">
              🌐 ¿Perteneces a algún grupo? <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GRUPOS_POBLACIONALES.map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGrupo(g.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-body transition-all duration-200 text-left"
                  style={grupos.includes(g.id)
                    ? { background: UIS_GREEN, borderColor: UIS_GREEN_DARK, color: 'white' }
                    : { background: 'white', borderColor: '#e5e7eb', color: '#4b5563' }
                  }
                >
                  <span>{g.emoji}</span>
                  <span className="leading-tight">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-body">
              ⚠️ {error}
            </div>
          )}

          {/* Botón */}
          <button
            onClick={handleSubmit}
            disabled={!valido || guardando}
            className="w-full py-4 rounded-2xl font-display font-bold text-lg transition-all duration-300 text-white"
            style={valido && !guardando
              ? { background: UIS_GREEN, boxShadow: `0 4px 20px rgba(103,185,62,0.35)` }
              : { background: '#d1d5db', cursor: 'not-allowed' }
            }
          >
            {guardando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Guardando...
              </span>
            ) : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  )
}