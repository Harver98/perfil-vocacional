export const PROGRAMAS = [
  {
    id: 'trabajo_social',
    nombre: 'Trabajo Social',
    emoji: '🤝',
    descripcion: 'Transforma vidas y fortalece comunidades desde adentro.',
    gradient: 'linear-gradient(160deg, rgb(91,45,142) 0%, rgb(123,63,168) 40%, rgb(155,79,192) 70%, rgb(106,47,154) 100%)',
    colorAccent: '#7b3fa8',
    colorBg: '#f5f0ff',
    colorBorder: '#d4b8f0',
    colorText: '#5b2d8e',
    insignia: 'Agente de Cambio Territorial',
    insigniaEmoji: '🤝',
    videoUrl: '',
    beneficios: [
      'Fortalecimiento de organizaciones comunitarias',
      'Construcción de paz y reconciliación',
      'Atención a poblaciones vulnerables',
      'Políticas sociales para el territorio',
    ],
    justificacion: 'El Catatumbo necesita profesionales que acompañen a las comunidades en su proceso de desarrollo, paz y construcción colectiva.',

    // ── Perfil de EGRESO (Momento 7) — lista única para priorizar, sin etiquetas SABER/SER visibles ──
    perfilEgreso: [
      { texto: 'Comprender las dinámicas sociales, económicas, culturales, políticas y ambientales de los territorios rurales, fronterizos y multiculturales.', categoria: 'saber' },
      { texto: 'Conocer los enfoques de derechos humanos, construcción de paz, acción sin daño, justicia social e interculturalidad aplicados a la intervención social.', categoria: 'saber' },
      { texto: 'Analizar los procesos de desarrollo territorial, gobernanza participativa y fortalecimiento comunitario desde una perspectiva crítica y transformadora.', categoria: 'saber' },
      { texto: 'Comprender los principios y modelos de economía social y solidaria, asociatividad, cooperativismo e innovación social para el fortalecimiento del tejido social y productivo.', categoria: 'saber' },
      { texto: 'Conocer metodologías de investigación social aplicada, sistematización de experiencias y producción de conocimiento situado para la transformación de las realidades territoriales.', categoria: 'saber' },
      { texto: 'Comprender las políticas públicas, la gestión social y los mecanismos de participación ciudadana para la incidencia en el desarrollo local y regional.', categoria: 'saber' },
      { texto: 'Conocer herramientas tecnológicas, digitales y de gestión de información que apoyen la innovación, el seguimiento, la evaluación y la toma de decisiones en procesos sociales.', categoria: 'saber' },
      { texto: 'Compromiso ético con la dignidad humana, la justicia social y la defensa de los derechos individuales y colectivos.', categoria: 'ser' },
      { texto: 'Respeto y valoración de la diversidad cultural, étnica, campesina, territorial y poblacional presente en el Catatumbo y otros contextos.', categoria: 'ser' },
      { texto: 'Sensibilidad social y capacidad empática para comprender y acompañar las realidades de personas, familias, grupos y comunidades.', categoria: 'ser' },
      { texto: 'Liderazgo transformador orientado a la construcción de paz, la participación social y el fortalecimiento comunitario.', categoria: 'ser' },
      { texto: 'Pensamiento crítico, reflexivo y sistémico para interpretar problemáticas complejas y proponer alternativas de transformación social.', categoria: 'ser' },
      { texto: 'Disposición para el trabajo colaborativo, interdisciplinario e intercultural, reconociendo el valor de los saberes comunitarios, ancestrales y académicos.', categoria: 'ser' },
      { texto: 'Responsabilidad, transparencia y compromiso con la sostenibilidad social, ambiental y territorial en el ejercicio profesional.', categoria: 'ser' },
    ],

    perfilEgresoTexto: `El egresado del Programa de Trabajo Social de la Universidad Nacional del Catatumbo será un profesional integral, ético y crítico, competente para comprender, analizar e intervenir las complejas realidades sociales mediante la aplicación de conocimientos disciplinares, enfoques territoriales, diferenciales, interculturales, de derechos humanos y de justicia social, con pertinencia en contextos rurales, de frontera, multiculturales y de construcción de paz.

Contribuirá al desarrollo social, económico, ambiental y cultural del Catatumbo y de otros contextos territoriales mediante la formulación de estrategias contextualizadas que favorezcan la cohesión social, la participación ciudadana, la economía social y solidaria, la resiliencia comunitaria, la construcción de paz y el desarrollo territorial sostenible.

Se caracterizará por su compromiso con la dignidad humana, la justicia social, la construcción de paz, la equidad territorial, la democracia y el reconocimiento de la diversidad cultural, articulando el conocimiento científico con los saberes comunitarios, ancestrales y territoriales para responder de manera pertinente a las realidades y transformaciones sociales contemporáneas.`,

    preguntaAbiertaEgreso: 'Pensando en las necesidades del Catatumbo, ¿qué otros conocimientos, habilidades, actitudes o características considera que deberían tener los egresados de este programa para contribuir efectivamente al desarrollo, la paz y el bienestar de la región?',

    // ── Líneas de investigación (Momento 8) — específicas por programa ────────
    lineasInvestigacion: [
      'Desarrollo Territorial, Gobernanza y Participación Ciudadana',
      'Construcción de Paz, Reconciliación y Transformación de Conflictos',
      'Derechos Humanos, Inclusión y Justicia Social',
      'Familias, Comunidades y Redes de Cuidado',
      'Interculturalidad, Diversidad y Saberes Territoriales',
      'Innovación Social y Transformación Comunitaria',
      'Políticas Públicas y Desarrollo Social',
      'Tecnologías Sociales, Gestión del Conocimiento y Transformación Digital',
    ],
    preguntaLineas: 'Si tú fueras un trabajador social, ¿qué temas considera prioritarios para la solución de problemas en el Catatumbo? Organízalos por prioridad según interés y necesidades del territorio.',

    // ── Electivas (Momento 9) — específicas por programa, selección múltiple ──
    electivas: [
      'Desarrollo comunitario y liderazgo social.',
      'Construcción de paz y convivencia.',
      'Derechos humanos e inclusión social.',
      'Familia, niñez, juventud y grupos poblacionales.',
      'Economía solidaria y fortalecimiento de organizaciones comunitarias.',
    ],
    preguntaElectivas: 'Si tú fueras un trabajador social, ¿qué temas deberían incluirse como parte de la propuesta de programa?',
  },

  {
    id: 'agronomia',
    nombre: 'Ingeniería Agronómica',
    emoji: '🌱',
    descripcion: 'Innova y transforma el campo con ciencia y territorio.',
    gradient: 'linear-gradient(160deg, rgb(22,101,52) 0%, rgb(34,139,34) 40%, rgb(74,222,128) 70%, rgb(16,185,129) 100%)',
    colorAccent: '#16a34a',
    colorBg: '#f0fdf4',
    colorBorder: '#bbf7d0',
    colorText: '#166534',
    insignia: 'Innovador del Territorio',
    insigniaEmoji: '🌱',
    videoUrl: '',
    beneficios: [
      'Mejoramiento de sistemas productivos rurales',
      'Seguridad y soberanía alimentaria',
      'Agricultura sostenible y agroecológica',
      'Innovación tecnológica para el campo',
    ],
    justificacion: 'La vocación agrícola del Catatumbo requiere profesionales que potencien la producción rural con conocimiento científico y visión territorial.',

    perfilEgreso: [
      { texto: 'Comprender los fundamentos científicos, técnicos y tecnológicos de la producción agrícola sostenible y los sistemas agroalimentarios.', categoria: 'saber' },
      { texto: 'Analizar las dinámicas ambientales, climáticas, sociales, económicas y territoriales que influyen en los sistemas productivos rurales.', categoria: 'saber' },
      { texto: 'Conocer estrategias de manejo, conservación y uso sostenible del suelo, el agua, la biodiversidad y los recursos naturales.', categoria: 'saber' },
      { texto: 'Comprender los procesos de innovación, transferencia tecnológica, agricultura inteligente y transformación productiva aplicados al sector agropecuario.', categoria: 'saber' },
      { texto: 'Conocer metodologías para la formulación, gestión y evaluación de proyectos agropecuarios y de desarrollo rural sostenible.', categoria: 'saber' },
      { texto: 'Comprender los principios de seguridad alimentaria, soberanía alimentaria, economía rural, asociatividad y economía social y solidaria para el fortalecimiento de las comunidades rurales.', categoria: 'saber' },
      { texto: 'Analizar estrategias de adaptación y mitigación frente al cambio climático, la gestión del riesgo y la resiliencia de los sistemas productivos agrícolas.', categoria: 'saber' },
      { texto: 'Actuar con ética, responsabilidad y compromiso con el bienestar de las comunidades rurales y el desarrollo territorial sostenible.', categoria: 'ser' },
      { texto: 'Valorar y proteger los recursos naturales, promoviendo prácticas agrícolas ambientalmente responsables.', categoria: 'ser' },
      { texto: 'Reconocer y respetar los saberes campesinos, ancestrales y tradicionales, integrándolos con el conocimiento científico para la solución de problemas productivos.', categoria: 'ser' },
      { texto: 'Ejercer liderazgo participativo para impulsar procesos de innovación, asociatividad y fortalecimiento de organizaciones rurales.', categoria: 'ser' },
      { texto: 'Demostrar pensamiento crítico, sistémico y prospectivo frente a los desafíos de la agricultura, el desarrollo rural y el cambio climático.', categoria: 'ser' },
      { texto: 'Promover el trabajo colaborativo e interdisciplinario para la construcción de soluciones integrales a las problemáticas del territorio.', categoria: 'ser' },
      { texto: 'Mantener compromiso con la construcción de paz, la equidad territorial, la inclusión social y el desarrollo sostenible de las comunidades rurales.', categoria: 'ser' },
    ],

    perfilEgresoTexto: `El egresado del Programa de Ingeniería Agronómica de la Universidad Nacional del Catatumbo será un profesional integral, ético y crítico, competente para comprender, crear, gestionar y transformar los sistemas productivos agrícolas mediante la aplicación de conocimientos agronómicos, ambientales y socioterritoriales, con enfoque de sostenibilidad, responsabilidad social, innovación y pertinencia territorial.

Estará en capacidad de diseñar, implementar y evaluar estrategias, proyectos y procesos contextualizados, orientados al fortalecimiento de la producción agrícola, la seguridad alimentaria, la adaptación al cambio climático y el uso sostenible de los recursos naturales.

Se caracterizará por su compromiso con el desarrollo regional, la construcción de paz, la equidad territorial, el reconocimiento de la diversidad cultural y la protección del ambiente, articulando el conocimiento científico con los saberes locales para responder de manera pertinente a las necesidades y desafíos del contexto.`,

    preguntaAbiertaEgreso: 'Desde su experiencia y conocimiento en el territorio, ¿qué otras capacidades, conocimientos, valores o características deberían tener los futuros estudiantes de este programa para contribuir al desarrollo del Catatumbo?',

    lineasInvestigacion: [
      'Sistemas Agroalimentarios Sostenibles',
      'Cambio Climático y Resiliencia Agropecuaria',
      'Conservación de Recursos Naturales y Biodiversidad',
      'Innovación y Transformación Tecnológica Agropecuaria',
      'Economía Rural y Asociatividad Productiva',
      'Desarrollo Rural y Construcción de Paz',
      'Agrobiodiversidad y Saberes Campesinos',
      'Agroindustria y Generación de Valor Agregado',
    ],
    preguntaLineas: 'Si tú fueras un ingeniero agrónomo, ¿qué temas considera prioritarios para la solución de problemas en el Catatumbo? Organízalos por prioridad según interés y necesidades del territorio.',

    electivas: [
      'Producción agrícola sostenible.',
      'Cuidado del ambiente y recursos naturales.',
      'Innovación y tecnologías para el campo.',
      'Desarrollo rural y fortalecimiento de productores.',
      'Transformación y comercialización de productos agrícolas.',
    ],
    preguntaElectivas: 'Si tú fueras un ingeniero agrónomo, ¿qué temas deberían incluirse como parte de la propuesta de programa?',
  },

  {
    id: 'administracion',
    nombre: 'Administración de Empresas',
    emoji: '📈',
    descripcion: 'Lidera organizaciones y convierte ideas en oportunidades reales.',
    gradient: 'linear-gradient(160deg, rgb(0,51,102) 0%, rgb(0,102,204) 40%, rgb(59,130,246) 70%, rgb(30,64,175) 100%)',
    colorAccent: '#0066cc',
    colorBg: '#eff6ff',
    colorBorder: '#bfdbfe',
    colorText: '#1e3a8a',
    insignia: 'Líder Estratégico Territorial',
    insigniaEmoji: '🚀',
    videoUrl: '',
    beneficios: [
      'Fortalecimiento del tejido empresarial local',
      'Emprendimiento social y productivo',
      'Economía solidaria y asociativa',
      'Desarrollo económico territorial',
    ],
    justificacion: 'El Catatumbo necesita líderes que transformen las potencialidades del territorio en oportunidades económicas sostenibles para las comunidades.',

    perfilEgreso: [
      { texto: 'Comprender los fundamentos de la administración, la gestión organizacional y la dirección estratégica para el fortalecimiento de organizaciones públicas, privadas, comunitarias y solidarias.', categoria: 'saber' },
      { texto: 'Analizar las dinámicas económicas, sociales, territoriales y empresariales que inciden en el desarrollo regional, especialmente en contextos rurales y de frontera.', categoria: 'saber' },
      { texto: 'Conocer metodologías para la formulación, gestión, seguimiento y evaluación de proyectos empresariales, sociales y de desarrollo territorial.', categoria: 'saber' },
      { texto: 'Comprender los principios de emprendimiento, innovación, economía social y solidaria, asociatividad y fortalecimiento de unidades productivas rurales y urbanas.', categoria: 'saber' },
      { texto: 'Conocer herramientas de gestión financiera, mercadeo, talento humano, logística y operaciones orientadas a la sostenibilidad organizacional.', categoria: 'saber' },
      { texto: 'Comprender los enfoques de sostenibilidad, responsabilidad social empresarial, gobernanza y desarrollo territorial para la generación de valor económico, social y ambiental.', categoria: 'saber' },
      { texto: 'Conocer herramientas tecnológicas y de transformación digital para la toma de decisiones, la gestión organizacional y la competitividad empresarial.', categoria: 'saber' },
      { texto: 'Actuar con ética, transparencia y responsabilidad social en la gestión de organizaciones y procesos administrativos.', categoria: 'ser' },
      { texto: 'Demostrar compromiso con el desarrollo económico, social y ambiental de los territorios y las comunidades.', categoria: 'ser' },
      { texto: 'Valorar la diversidad cultural, social y territorial como elemento fundamental para la gestión organizacional y el desarrollo sostenible.', categoria: 'ser' },
      { texto: 'Ejercer liderazgo transformador para promover procesos de innovación, emprendimiento y fortalecimiento organizacional.', categoria: 'ser' },
      { texto: 'Desarrollar pensamiento crítico, estratégico y sistémico para la toma de decisiones en entornos complejos y cambiantes.', categoria: 'ser' },
      { texto: 'Promover el trabajo colaborativo, interdisciplinario y participativo para la construcción de soluciones organizacionales y territoriales.', categoria: 'ser' },
      { texto: 'Mantener compromiso con la construcción de paz, la equidad territorial, la inclusión social y el bienestar colectivo.', categoria: 'ser' },
    ],

    perfilEgresoTexto: `El egresado del programa de Administración de Empresas de la Universidad Nacional del Catatumbo será un profesional integral, ético y crítico, competente para comprender, gestionar y transformar organizaciones públicas, privadas, solidarias y comunitarias, mediante el ejercicio de los procesos administrativos y la gestión estratégica de recursos, con enfoque de sostenibilidad, responsabilidad social y pertinencia territorial.

Estará en capacidad de liderar procesos de emprendimiento, innovación, fortalecimiento empresarial y desarrollo organizacional, aportando al desarrollo económico, social y ambiental del Catatumbo y de otros contextos rurales y de frontera.

Se caracterizará por su compromiso con la construcción de paz, la equidad territorial, el reconocimiento de la diversidad cultural, la ciudadanía y la transformación social, articulando conocimientos disciplinares con saberes locales para responder de manera pertinente a las realidades y desafíos del territorio.`,

    preguntaAbiertaEgreso: 'Desde su experiencia y conocimiento en el territorio, ¿qué otras capacidades, conocimientos, valores o características deberían tener los futuros estudiantes de este programa para contribuir al desarrollo del Catatumbo?',

    lineasInvestigacion: [
      'Emprendimiento e Innovación para el Desarrollo Territorial',
      'Economía Social y Solidaria',
      'Gestión Organizacional y Competitividad Regional',
      'Desarrollo Empresarial Rural y de Frontera',
      'Finanzas para el Desarrollo Sostenible',
      'Transformación Digital y Gestión de la Innovación',
      'Responsabilidad Social, Sostenibilidad y Gobernanza',
      'Políticas Públicas, Desarrollo Económico y Gestión Territorial',
    ],
    preguntaLineas: 'Si tú fueras un administrador, ¿qué temas considera prioritarios para la solución de problemas en el Catatumbo? Organízalos por prioridad según interés y necesidades del territorio.',

    electivas: [
      'Creación y fortalecimiento de empresas.',
      'Emprendimiento e innovación.',
      'Economía solidaria y asociatividad.',
      'Gestión y administración de organizaciones.',
      'Desarrollo económico y empresarial del territorio.',
    ],
    preguntaElectivas: 'Si tú fueras un administrador, ¿qué temas deberían incluirse como parte de la propuesta de programa?',
  },
]