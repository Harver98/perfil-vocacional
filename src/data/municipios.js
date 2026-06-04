// Lista oficial de los 40 municipios de Norte de Santander (sin duplicados)
export const MUNICIPIOS = [
  'Ábrego', 'Arboledas', 'Bochalema', 'Bucarasica', 'Cácota', 'Cáchira',
  'Chinácota', 'Chitagá', 'Convención', 'Cúcuta', 'Cucutilla', 'Durania',
  'El Carmen', 'El Tarra', 'El Zulia', 'Gramalote', 'Hacarí', 'Herrán',
  'La Esperanza', 'La Playa de Belén', 'Labateca', 'Los Patios', 'Lourdes',
  'Mutiscua', 'Ocaña', 'Pamplona', 'Pamplonita', 'Puerto Santander',
  'Ragonvalia', 'Salazar', 'San Calixto', 'San Cayetano', 'Santiago',
  'Santo Domingo Silos', 'Sardinata', 'Silos', 'Teorama', 'Tibú',
  'Toledo', 'Villa Caro', 'Villa del Rosario',
].sort()

export const TIPOS_ZONA = [
  { id: 'cabecera', label: 'Cabecera Municipal (Casco Urbano)' },
  { id: 'corregimiento', label: 'Corregimiento' },
  { id: 'vereda', label: 'Vereda' }
]

export const GRUPOS_POBLACIONALES = [
  { id: 'campesino',       label: 'Campesino/a',               emoji: '🌾' },
  { id: 'victima',         label: 'Víctima del conflicto',      emoji: '🕊️' },
  { id: 'joven',           label: 'Joven',                      emoji: '⚡' },
  { id: 'mujer',           label: 'Mujer',                      emoji: '💜' },
  { id: 'discapacidad',    label: 'Persona con discapacidad',   emoji: '♿' },
  { id: 'indigena',        label: 'Comunidad indígena',         emoji: '🌿' },
  { id: 'afrodescendiente',label: 'Comunidad afrodescendiente', emoji: '✊' },
  { id: 'migrante',        label: 'Migrante',                   emoji: '🌍' },
  { id: 'otro',            label: 'Otro',                       emoji: '👤' },
]
