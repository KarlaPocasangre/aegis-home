// Spanish is the source language: pt.ts and en.ts must match this shape (checked by `Dict`).
export const es = {
  meta: {
    locale: "es-SV",
    title: "Aegis Home · El escudo del hogar",
  },
  common: {
    homeAria: "Aegis Home, inicio",
    tagline: "El escudo del hogar",
    skipToContent: "Saltar al contenido",
    language: "Idioma",
    close: "Cerrar",
    copy: "Copiar",
    copied: "¡Copiado!",
    useSample: "Usar imagen de prueba",
    noPhotoAtHand: "¿No tiene una foto a mano?",
  },
  rooms: {
    bathroom: "Baño",
    kitchen: "Cocina",
    bedroom: "Dormitorio",
    living_room: "Sala",
    hallway: "Pasillo",
    stairs: "Escaleras",
    entrance: "Entrada",
    outdoor: "Patio o exterior",
    other: "Otro espacio",
  },
  severity: { high: "Riesgo alto", medium: "Riesgo medio", low: "Riesgo bajo" },
  cost: {
    free: "Sin costo",
    approx: (value: string) => `Aprox. ${value}`,
  },
  samples: {
    bathroom: "Baño con piso mojado",
    stairs: "Escalera sin barandal",
  },
  errors: {
    generic: "Ocurrió un error inesperado. Intente de nuevo.",
    network: "No se pudo conectar con el servicio. Revise su conexión e intente de nuevo.",
    sampleLoad: "No se pudo cargar la imagen de prueba.",
    imageTooBig: "La foto es demasiado grande. Use una de menos de 25 MB.",
    imageUnreadable: "No se pudo leer la imagen. Use una foto JPG, PNG o WebP.",
    imageUnsupported: "Su navegador no puede procesar la imagen.",
    imagePrepare: "No se pudo preparar la imagen.",
    codes: {
      BAD_REQUEST: "La solicitud no es válida.",
      UNAUTHORIZED: "Este enlace ya no es válido o la evaluación expiró.",
      NOT_FOUND: "No encontramos lo que busca.",
      PAYLOAD_TOO_LARGE: "El archivo es demasiado grande.",
      UNSUPPORTED_MEDIA_TYPE: "Tipo de archivo no soportado. Use una foto JPG, PNG o WebP.",
      VALIDATION_ERROR: "Algunos datos no son válidos.",
      RATE_LIMITED: "Demasiadas solicitudes. Espere un momento e intente de nuevo.",
      AI_PROVIDER_ERROR: "El servicio de análisis no está disponible. Intente más tarde.",
      INTERNAL_ERROR: "Ocurrió un error en el servidor. Intente de nuevo.",
    } as Record<string, string>,
  },
  privacy: {
    title: "Antes de empezar",
    items: [
      "Las fotos se analizan con inteligencia artificial de Meta y esta app no las guarda.",
      "Evite fotos con personas, rostros o documentos.",
      "El análisis señala riesgos del entorno; no reemplaza la opinión de un profesional ni da consejos médicos.",
      "No es un servicio de emergencias.",
    ],
    accept: "Entiendo y quiero continuar",
  },
  progress: {
    title: (seconds: number) => `Analizando la foto… ${seconds} s`,
    searching: "Buscando riesgos de caída en el espacio.",
    slow: "Puede tardar hasta un minuto si el servicio estaba en reposo.",
  },
  fallback: {
    cachedTitle: "Resultado guardado previamente",
    mockTitle: "Resultado de ejemplo",
    cachedNotice:
      "El servicio de análisis no está disponible en este momento. Se muestra un análisis real hecho antes para esta misma foto.",
    mockNotice: "Resultado de ejemplo: el servicio de análisis no está disponible en este momento.",
  },
  share: {
    title: "Compartir con la familia",
    warning:
      "Cualquier persona con este enlace puede ver y actualizar el plan de esta casa. Compártalo solo con personas de confianza.",
    linkLabel: "Enlace del plan",
    promptCopy: "Copie este enlace:",
  },
  landingNav: {
    aria: "Secciones de la página",
    sections: {
      how: "Cómo funciona",
      example: "Ejemplo",
      privacy: "Privacidad",
      about: "Acerca",
      faq: "Preguntas",
    },
    myEvaluation: "Mi evaluación",
    start: "Empezar",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  hero: {
    badge: "Con Muse Spark y SAM 3.1 de Meta",
    titleA: "Una casa más segura para",
    titleB: "quienes más queremos",
    intro:
      "Tome fotos de la casa de su mamá, papá o abuelos. La inteligencia artificial señala lo que puede provocar una caída y le da un plan de arreglos sencillos, en orden y con costo aproximado.",
    continue: "Continuar mi evaluación",
    analyze: "Analizar mi casa",
    seeExample: "Ver un ejemplo real",
    trust: [
      "Gratis y sin crear cuenta",
      "Las fotos no se guardan",
      "En español, portugués e inglés",
    ],
    photoAlt: "Ilustración de un baño con piso mojado y riesgos resaltados",
    highRisk: "Riesgo alto",
    planOf: "Plan de este baño",
    fixes: "arreglos",
    caption: "Resultado real de Muse Spark y SAM 3.1 sobre una ilustración de ejemplo.",
  },
  problem: {
    eyebrow: "Por qué importa",
    story:
      "Su mamá se levanta de noche para ir al baño. El pasillo está oscuro, el piso sigue mojado y no hay dónde agarrarse. Son detalles que vemos todos los días y que casi nunca notamos.",
    whoBefore: "Según la",
    whoLink: "Organización Mundial de la Salud",
    whoUrl: "https://www.who.int/es/news-room/fact-sheets/detail/falls",
    whoAfter:
      ", las caídas son la segunda causa de muerte por lesiones no intencionales en el mundo, y las personas mayores de 60 años son las más afectadas. Muchas empiezan en casa, con cosas que se pueden arreglar con poco dinero.",
    risks: [
      { title: "Pisos mojados o lisos", text: "Baños y cocinas sin tapete antideslizante." },
      { title: "Tapetes sueltos y cables", text: "Bordes levantados y cosas en el paso." },
      { title: "Escaleras sin pasamanos", text: "Escalones sin agarradera ni buena luz." },
      { title: "Poca luz de noche", text: "Pasillos oscuros camino al baño." },
    ],
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "De una foto a un plan de acción",
    intro: "Dos modelos de inteligencia artificial de Meta trabajan en cadena sobre su foto.",
    steps: [
      {
        title: "Tome una foto",
        text: "De pie, mostrando el piso y por donde se camina: baño, cocina, escaleras, pasillos. La foto se reduce y se le quitan los datos de ubicación en su dispositivo.",
      },
      {
        title: "Muse Spark revisa",
        text: "El modelo de visión de Meta identifica cada riesgo, qué tan grave es, cómo arreglarlo en palabras sencillas y cuánto puede costar.",
      },
      {
        title: "SAM 3.1 los señala",
        text: "El modelo de segmentación de Meta ubica cada riesgo en la imagen para resaltarlo sobre su propia foto, con un número.",
      },
      {
        title: "Siga su plan",
        text: "Los arreglos quedan ordenados por prioridad, con el costo pendiente. Márquelos al terminarlos y compártalos con la familia.",
      },
    ],
    planTitle: "Plan de acción",
  },
  analysis: {
    eyebrow: "Análisis con IA",
    title: "Pruébelo ahora",
    intro:
      "Explore un resultado real o empiece con una foto de la casa. Si no tiene una a mano, use una imagen de prueba: el análisis se hace en vivo con la IA de Meta.",
    demoTitle: "Ejemplo: un baño",
    recorded: "Resultado real grabado",
    demoHint: "Toque un número o un riesgo para resaltarlo.",
    demoAlt: "Ilustración de un baño con piso mojado",
    demoCaption:
      "Respuesta de Muse Spark y SAM 3.1 sobre una ilustración creada para esta demostración.",
    startTitle: "Empezar una evaluación",
    nameLabel: "Nombre para esta casa (opcional)",
    namePlaceholder: "Ej.: Casa de la abuela",
    creating: "Creando…",
    start: "Empezar evaluación",
    checkFirst: "Marque la casilla de arriba para continuar.",
  },
  features: {
    eyebrow: "Lo que recibe",
    title: "Todo lo necesario para actuar, nada de más",
    items: [
      {
        title: "Riesgos resaltados en la foto",
        text: "Cada riesgo lleva un número y un recuadro sobre su propia foto.",
      },
      {
        title: "Plan por prioridad",
        text: "Primero lo más urgente. Cada arreglo explicado en palabras sencillas.",
      },
      {
        title: "Costos de aquí",
        text: "Precios aproximados de materiales que se consiguen en Centroamérica.",
      },
      {
        title: "Seguimiento",
        text: "Marque “Ya lo arreglé” y vea cuánto falta y cuánto costará.",
      },
      {
        title: "En familia",
        text: "Comparta un enlace privado para que hermanos o primos ayuden con el plan.",
      },
      {
        title: "Contacto rápido",
        text: "Llame o escriba por WhatsApp o SMS a sus contactos de confianza con un toque.",
      },
    ],
  },
  tech: {
    eyebrow: "La tecnología",
    title: "Dos modelos de Meta trabajando juntos",
    intro:
      "Muse Spark entiende la escena y decide qué es peligroso; SAM 3.1 encuentra exactamente dónde está. Cada respuesta se revisa antes de mostrarse.",
    step: (n: number) => `Paso ${n}`,
    pipeline: [
      {
        name: "Su foto",
        detail: "Se reduce y se le quitan los datos de ubicación en su dispositivo.",
      },
      {
        name: "Muse Spark 1.3",
        detail: "Visión de Meta: riesgos, gravedad, arreglo y costo en JSON.",
      },
      { name: "SAM 3.1", detail: "Segmentación de Meta: encuentra cada objeto en la imagen." },
      { name: "Su plan", detail: "Validado, ordenado por prioridad y listo para seguir." },
    ],
    honesty:
      "Si el servicio de IA no responde, la app lo dice claramente y nunca presenta un ejemplo como si fuera un análisis nuevo.",
  },
  privacySection: {
    eyebrow: "Privacidad y seguridad",
    title: "Hecho para cuidar, también sus datos",
    intro:
      "Las fotos de una casa son información sensible. Aegis Home guarda lo mínimo y por el menor tiempo posible.",
    warning:
      "Evite fotos con personas, rostros o documentos. Las fotos se envían a la IA de Meta para su análisis.",
    items: [
      {
        title: "Fotos que no se guardan",
        text: "Se analizan en memoria y se descartan. Solo queda la lista de riesgos.",
      },
      {
        title: "Sin cuentas ni correos",
        text: "No pedimos nombre, correo ni teléfono. Un enlace privado identifica la evaluación.",
      },
      {
        title: "Se borra sola",
        text: "Cada evaluación expira a los 30 días, y puede borrarla antes con un botón.",
      },
      {
        title: "Contactos en su teléfono",
        text: "Los contactos de confianza se guardan solo en su dispositivo, nunca en el servidor.",
      },
    ],
  },
  about: {
    eyebrow: "Detrás de Aegis Home",
    title: "Una herramienta para la familia que cuida a distancia",
    p1: "Muchos de nosotros vivimos lejos de nuestros padres o abuelos y no siempre podemos revisar su casa. Una evaluación profesional en persona no está al alcance de todos, y las herramientas que existen suelen estar en inglés y pensadas para otros países.",
    p2Before: "Aegis Home nació en el",
    p2Theme: "con el tema",
    p2After: ": construir para el mundo propio, en nuestro idioma y con nuestra realidad.",
    values: [
      {
        title: "Prevención, no diagnóstico",
        text: "Solo riesgos del entorno y arreglos de la casa. Nunca consejos médicos.",
      },
      {
        title: "Para nuestra región",
        text: "Palabras sencillas, costos y materiales de Centroamérica y Latinoamérica.",
      },
      {
        title: "Honesto con sus límites",
        text: "La IA puede equivocarse; la app lo dice y le avisa cuando un resultado no es en vivo.",
      },
    ],
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Lo que suelen preguntarnos",
    items: [
      { q: "¿Cuánto cuesta?", a: "Nada. Es gratis y no necesita crear una cuenta." },
      {
        q: "¿Guardan mis fotos?",
        a: "No. Se analizan y se descartan. Solo se guarda la lista de riesgos de cada espacio, que se borra a los 30 días o cuando usted lo decida.",
      },
      {
        q: "¿Reemplaza a un profesional o a un médico?",
        a: "No. Aegis Home señala riesgos del entorno para ayudarle a empezar. No da consejos médicos ni detecta caídas, y no reemplaza la visita de un profesional.",
      },
      {
        q: "¿Y si la IA se equivoca?",
        a: "Puede pasar: a veces no ve un riesgo o marca algo que no lo es. Use el plan como guía y confíe en su criterio. Si el servicio de IA no está disponible, la app muestra un aviso visible.",
      },
      {
        q: "¿En qué idioma llegan los resultados?",
        a: "La interfaz está en español, portugués e inglés. Por ahora, la descripción de cada riesgo que escribe la IA llega en español.",
      },
      {
        q: "¿Quién puede ver el plan?",
        a: "Solo quien tenga el enlace de la evaluación. Compártalo únicamente con personas de confianza.",
      },
      {
        q: "¿El botón de contacto llama a emergencias?",
        a: "No. Abre la llamada, WhatsApp o SMS hacia los contactos que usted agregue. En una emergencia, llame al 911.",
      },
    ],
  },
  finalCta: {
    titleA: "Empiece por",
    titleB: "un solo espacio",
    text: "El baño suele ser el lugar más importante. Una foto basta para tener su primer plan.",
    cta: "Analizar mi casa",
  },
  footer: {
    disclaimer:
      "Aegis Home señala riesgos del entorno con inteligencia artificial y puede equivocarse. No da consejos médicos, no detecta caídas y no es un servicio de emergencias. Los costos son aproximados.",
    identityTitle: "Identidad y propósito",
    identityText:
      "Prevención de caídas en casa para familias de Centroamérica y Latinoamérica: de una foto a un plan claro.",
    navTitle: "Navegación rápida",
    home: "Inicio",
    startEvaluation: "Empezar una evaluación",
    privacyTitle: "Privacidad y seguridad",
    privacyItems: [
      "Las fotos se analizan y no se guardan.",
      "Sin cuentas ni datos personales.",
      "Cada evaluación se borra a los 30 días.",
      "Contactos guardados solo en su dispositivo.",
    ],
    techTitle: "Tecnologías y créditos",
    techAi: "IA de Meta: Muse Spark 1.3 y SAM 3.1",
    techStack: "React, Tailwind CSS, Node.js, Express y PostgreSQL",
    hackathon: "Creado para el Meta Global AI Developer Hackathon 2026",
    github: "Código abierto en GitHub",
    emergency: "En una emergencia, llame al 911.",
  },
  nav: {
    aria: "Secciones de la evaluación",
    tabs: { plan: "Plan", analizar: "Analizar", espacios: "Espacios", ajustes: "Ajustes" },
    pending: "pendientes",
  },
  household: {
    confirmDelete: "¿Borrar esta evaluación y todos sus datos? Esta acción no se puede deshacer.",
    expired: "Este enlace ya no es válido o la evaluación expiró.",
    goHome: "Ir al inicio",
    loading: "Cargando la evaluación…",
    analyzeCta: "Analizar un espacio",
  },
  plan: {
    title: "Plan de acción",
    empty: "Aún no hay riesgos en el plan. Analice la foto de un espacio de la casa para empezar.",
    emptyShort:
      "Aún no hay riesgos en el plan. Suba una foto de un espacio de la casa para empezar.",
    progress: (resolved: number, total: number) => `${resolved} de ${total} riesgos resueltos`,
    progressAria: "Progreso del plan",
    pendingCost: "Costo pendiente aprox.:",
    todo: "Por hacer, en orden de prioridad",
    done: "Ya resueltos",
    fixed: "Ya lo arreglé",
    undo: "Deshacer",
    seePhoto: "Ver en la foto",
  },
  analyze: {
    title: "Analizar un espacio",
    subtitle: "Una foto por espacio. Al terminar verá los riesgos resaltados.",
    roomQuestion: "¿Qué espacio es?",
    photoLabel: "Foto del espacio",
    photoHint: "Tome la foto de pie, mostrando el piso y los lugares por donde se camina.",
    submit: "Analizar foto",
    choosePhoto: "Elegir foto",
    noFile: "Ninguna foto elegida",
    analyzing: "Analizando…",
  },
  roomsView: {
    title: "Espacios analizados",
    subtitle: "Toque un número en la foto o un riesgo de la lista para resaltarlo.",
    empty: "Todavía no ha analizado ningún espacio.",
    back: "Todos los espacios",
    notFound: "No encontramos este espacio",
    notFoundHint: "Puede que se haya borrado.",
    photoAlt: (room: string) => `Foto de ${room.toLowerCase()}`,
    noPhoto:
      "Las fotos no se guardan. Para ver los riesgos resaltados, vuelva a subir la foto de este espacio.",
    noHazards: "No se encontraron riesgos visibles en esta foto.",
    whatToDo: "Qué hacer:",
    resolved: "Resuelto",
    riskAria: (n: number, label: string) => `Riesgo ${n}: ${label}`,
  },
  settings: {
    title: "Ajustes",
    contactsTitle: "Contactos de confianza",
    contactsBefore: "Use el botón rojo",
    contactsButton: "Contactar a un familiar",
    contactsAfter:
      "para agregar hasta 3 contactos y llamarlos o escribirles. Se guardan solo en este dispositivo.",
    privacyTitle: "Privacidad",
    privacyPhotos: "Las fotos se analizan y no se guardan; solo se guarda la lista de riesgos.",
    availableBefore: "Esta evaluación estará disponible hasta el",
    availableAfter: ". Después se borra sola.",
    languageTitle: "Idioma",
    languageText: "Elija el idioma de la app. Se guarda en este dispositivo.",
    deleteTitle: "Borrar datos",
    deleteText:
      "Borra la evaluación, sus espacios y riesgos. El enlace compartido dejará de funcionar.",
    deleting: "Borrando…",
    delete: "Borrar esta evaluación y sus datos",
  },
  contact: {
    button: "Contactar a un familiar",
    title: "Contactar a un familiar",
    disclaimer:
      "Este botón abre su teléfono para llamar o escribir a sus contactos. No es un servicio de emergencias y no avisa a nadie por sí solo. En una emergencia, llame al 911.",
    includeLocation: "Incluir mi ubicación en el mensaje",
    locating: "Obteniendo ubicación…",
    locationError: "No se pudo obtener la ubicación. El mensaje se enviará sin ella.",
    call: "Llamar",
    whatsapp: "WhatsApp",
    sms: "SMS",
    remove: "Quitar",
    removeAria: (name: string) => `Quitar a ${name}`,
    actionAria: (action: string, name: string) => `${action}: ${name}`,
    addFirst: "Agregue un contacto de confianza",
    addAnother: "Agregar otro contacto",
    storedLocally: "Los contactos se guardan solo en este teléfono o computadora.",
    name: "Nombre",
    phone: "Teléfono con código de país",
    save: "Guardar contacto",
    nameError: "Escriba un nombre (máximo 40 letras).",
    phoneError: "Escriba el número con código de país, por ejemplo +503 7000 0000.",
    max: "Puede guardar hasta 3 contactos.",
    help: "Hola, necesito que me contactes, por favor.",
    myLocation: "Mi ubicación:",
  },
};

export type Dict = typeof es;
