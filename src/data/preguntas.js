export const PREGUNTAS = {
  trabajo_social: {
    ser: [
      'Me gusta ayudar a otras personas cuando enfrentan dificultades.',
      'Escucho y respeto diferentes puntos de vista.',
      'Me interesa contribuir al bienestar de mi comunidad.',
    ],
    hacer: [
      'Disfruto participar en actividades comunitarias.',
      'Me gusta trabajar con grupos de personas para alcanzar objetivos.',
      'Me interesa proponer soluciones a problemáticas sociales.',
    ],
    saber: [
      'Me interesa comprender las causas de los problemas sociales.',
      'Me gustaría aprender sobre inclusión y desarrollo comunitario.',
      'Me interesa conocer herramientas para fortalecer comunidades.',
    ],
  },
  agroindustrial: {
    ser: [
      'Me preocupa el desarrollo sostenible de mi región.',
      'Me considero una persona comprometida con el cuidado de los recursos.',
      'Estoy dispuesto/a a asumir retos para mejorar mi entorno.',
    ],
    hacer: [
      'Me gusta identificar oportunidades de mejora en procesos productivos.',
      'Disfruto participar en proyectos relacionados con el sector agropecuario.',
      'Me interesa crear soluciones innovadoras para problemas reales.',
    ],
    saber: [
      'Me interesa aprender sobre transformación de productos agrícolas.',
      'Me gustaría conocer nuevas tecnologías aplicadas al campo.',
      'Me interesa comprender procesos de producción y calidad.',
    ],
  },
  administracion: {
    ser: [
      'Me considero una persona organizada y responsable.',
      'Me gusta asumir liderazgo cuando trabajo con otras personas.',
      'Me motiva alcanzar metas y resultados.',
    ],
    hacer: [
      'Disfruto planear actividades o proyectos.',
      'Me gusta resolver problemas relacionados con la organización de recursos.',
      'Me interesa coordinar equipos para lograr objetivos.',
    ],
    saber: [
      'Me gustaría aprender sobre gestión y administración de organizaciones.',
      'Me interesa conocer estrategias para crear o fortalecer empresas.',
      'Me llama la atención analizar información para tomar decisiones.',
    ],
  },
}

export const OPCIONES_RESPUESTA = [
  { valor: 1, label: 'Nunca', color: 'bg-red-50 border-red-200 hover:bg-red-100', selectedColor: 'bg-red-500 border-red-500 text-white' },
  { valor: 2, label: 'A veces', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100', selectedColor: 'bg-amber-500 border-amber-500 text-white' },
  { valor: 3, label: 'Frecuentemente', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100', selectedColor: 'bg-blue-500 border-blue-500 text-white' },
  { valor: 4, label: 'Siempre', color: 'bg-green-50 border-green-200 hover:bg-green-100', selectedColor: 'bg-green-500 border-green-500 text-white' },
]

export const MENSAJES_MOTIVADORES = [
  { emoji: '🚀', texto: '¡Vamos muy bien!' },
  { emoji: '✨', texto: '¡Sigues avanzando!' },
  { emoji: '🌟', texto: 'Descubriendo tu perfil...' },
  { emoji: '🎯', texto: '¡Ya casi terminamos!' },
  { emoji: '💫', texto: '¡Increíble tu progreso!' },
]
