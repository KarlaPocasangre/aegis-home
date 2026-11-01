import { Band, ICONS, SectionHeading, icon } from "./layout";

const WHO_FALLS = "https://www.who.int/es/news-room/fact-sheets/detail/falls";

const COMMON_RISKS = [
  { title: "Pisos mojados o lisos", text: "Baños y cocinas sin tapete antideslizante." },
  { title: "Tapetes sueltos y cables", text: "Bordes levantados y cosas en el paso." },
  { title: "Escaleras sin pasamanos", text: "Escalones sin agarradera ni buena luz." },
  { title: "Poca luz de noche", text: "Pasillos oscuros camino al baño." },
];

export function ProblemSection() {
  return (
    <Band id="por-que" labelledBy="por-que-title">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <SectionHeading
          id="por-que-title"
          eyebrow="Por qué importa"
          title="La mayoría de los riesgos están a simple vista"
          intro={
            <>
              Según la{" "}
              <a
                href={WHO_FALLS}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal-800 underline underline-offset-4"
              >
                Organización Mundial de la Salud
              </a>
              , las caídas son la segunda causa de muerte por lesiones no intencionales en el mundo,
              y las personas mayores de 60 años son las más afectadas. Muchas empiezan en casa, con
              cosas que se pueden arreglar con poco dinero.
            </>
          }
        />
        <ul className="grid gap-4 sm:grid-cols-2">
          {COMMON_RISKS.map((risk) => (
            <li key={risk.title} className="rounded-xl bg-stone-50 p-5 ring-1 ring-stone-200">
              <p className="text-lg font-semibold">{risk.title}</p>
              <p className="mt-1 text-base text-stone-600">{risk.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}

const STEPS = [
  {
    icon: ICONS.camera,
    title: "Tome una foto",
    text: "De pie, mostrando el piso y por donde se camina: baño, cocina, escaleras, pasillos.",
  },
  {
    icon: ICONS.sparkle,
    title: "Muse Spark revisa",
    text: "El modelo de visión de Meta identifica los riesgos, qué tan graves son y cómo arreglarlos.",
  },
  {
    icon: ICONS.target,
    title: "SAM 3.1 los señala",
    text: "El modelo de segmentación de Meta ubica cada riesgo para resaltarlo sobre su foto.",
  },
  {
    icon: ICONS.list,
    title: "Siga su plan",
    text: "Arreglos ordenados por prioridad, con costo aproximado. Márquelos al terminarlos.",
  },
];

export function HowItWorksSection() {
  return (
    <Band id="como-funciona" tone="stone" labelledBy="como-funciona-title">
      <SectionHeading
        id="como-funciona-title"
        eyebrow="Cómo funciona"
        title="De una foto a un plan de acción"
      />
      <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative rounded-xl bg-white p-5 ring-1 ring-stone-200">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal-700 text-white">
                {icon(step.icon)}
              </span>
              <span className="text-3xl font-bold text-stone-200" aria-hidden>
                {index + 1}
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold">{step.title}</p>
            <p className="mt-1 text-base text-stone-600">{step.text}</p>
          </li>
        ))}
      </ol>
    </Band>
  );
}

const FEATURES = [
  {
    icon: ICONS.target,
    title: "Riesgos resaltados en la foto",
    text: "Cada riesgo lleva un número y un recuadro sobre su propia foto.",
  },
  {
    icon: ICONS.list,
    title: "Plan por prioridad",
    text: "Primero lo más urgente. Cada arreglo explicado en palabras sencillas.",
  },
  {
    icon: ICONS.coin,
    title: "Costos de aquí",
    text: "Precios aproximados de materiales que se consiguen en Centroamérica.",
  },
  {
    icon: ICONS.check,
    title: "Seguimiento",
    text: "Marque “Ya lo arreglé” y vea cuánto falta y cuánto costará.",
  },
  {
    icon: ICONS.share,
    title: "En familia",
    text: "Comparta un enlace privado para que hermanos o primos ayuden con el plan.",
  },
  {
    icon: ICONS.phone,
    title: "Contacto rápido",
    text: "Llame o escriba por WhatsApp o SMS a sus contactos de confianza con un toque.",
  },
];

export function FeaturesSection() {
  return (
    <Band id="funciones" tone="stone" labelledBy="funciones-title">
      <SectionHeading
        id="funciones-title"
        eyebrow="Lo que recibe"
        title="Todo lo necesario para actuar, nada de más"
      />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <li key={f.title} className="rounded-xl bg-white p-6 ring-1 ring-stone-200">
            <span className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
              {icon(f.icon)}
            </span>
            <p className="mt-4 text-lg font-semibold">{f.title}</p>
            <p className="mt-1 text-base text-stone-600">{f.text}</p>
          </li>
        ))}
      </ul>
    </Band>
  );
}

const PIPELINE = [
  { name: "Su foto", detail: "Se reduce y se le quitan los datos de ubicación en su dispositivo." },
  { name: "Muse Spark 1.3", detail: "Visión de Meta: riesgos, gravedad, arreglo y costo en JSON." },
  { name: "SAM 3.1", detail: "Segmentación de Meta: encuentra cada objeto en la imagen." },
  { name: "Su plan", detail: "Validado, ordenado por prioridad y listo para seguir." },
];

export function TechSection() {
  return (
    <Band id="tecnologia" tone="teal" labelledBy="tecnologia-title">
      <SectionHeading
        id="tecnologia-title"
        eyebrow="La tecnología"
        title="Dos modelos de Meta trabajando juntos"
        intro="Muse Spark entiende la escena y decide qué es peligroso; SAM 3.1 encuentra exactamente dónde está. Cada respuesta se revisa antes de mostrarse."
        invert
      />
      <ol className="mt-10 grid gap-4 lg:grid-cols-4">
        {PIPELINE.map((step, index) => (
          <li
            key={step.name}
            className="relative rounded-xl bg-teal-800/70 p-5 ring-1 ring-teal-600"
          >
            <p className="text-sm font-semibold text-teal-200">Paso {index + 1}</p>
            <p className="mt-1 text-xl font-bold">{step.name}</p>
            <p className="mt-2 text-base text-teal-50">{step.detail}</p>
            {index < PIPELINE.length - 1 && (
              <span
                aria-hidden
                className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-2xl text-teal-300 lg:block"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-8 text-base text-teal-100">
        Si el servicio de IA no responde, la app lo dice claramente y nunca presenta un ejemplo como
        si fuera un análisis nuevo.
      </p>
    </Band>
  );
}

const PRIVACY = [
  {
    icon: ICONS.eyeOff,
    title: "Fotos que no se guardan",
    text: "Se analizan en memoria y se descartan. Solo queda la lista de riesgos.",
  },
  {
    icon: ICONS.user,
    title: "Sin cuentas ni correos",
    text: "No pedimos nombre, correo ni teléfono. Un enlace privado identifica la evaluación.",
  },
  {
    icon: ICONS.clock,
    title: "Se borra sola",
    text: "Cada evaluación expira a los 30 días, y puede borrarla antes con un botón.",
  },
  {
    icon: ICONS.phone,
    title: "Contactos en su teléfono",
    text: "Los contactos de confianza se guardan solo en su dispositivo, nunca en el servidor.",
  },
];

export function PrivacySection() {
  return (
    <Band id="privacidad" labelledBy="privacidad-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading
            id="privacidad-title"
            eyebrow="Privacidad y seguridad"
            title="Hecho para cuidar, también sus datos"
            intro="Las fotos de una casa son información sensible. aegis-home guarda lo mínimo y por el menor tiempo posible."
          />
          <p className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-base text-amber-950 ring-1 ring-amber-200">
            {icon(ICONS.shield, "mt-0.5 size-5")}
            Evite fotos con personas, rostros o documentos. Las fotos se envían a la IA de Meta para
            su análisis.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PRIVACY.map((p) => (
            <li key={p.title} className="rounded-xl bg-stone-50 p-5 ring-1 ring-stone-200">
              <span className="text-teal-800">{icon(p.icon)}</span>
              <p className="mt-3 text-lg font-semibold">{p.title}</p>
              <p className="mt-1 text-base text-stone-600">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}

const VALUES = [
  {
    icon: ICONS.heart,
    title: "Prevención, no diagnóstico",
    text: "Solo riesgos del entorno y arreglos de la casa. Nunca consejos médicos.",
  },
  {
    icon: ICONS.globe,
    title: "Para nuestra región",
    text: "Español sencillo, costos y materiales de Centroamérica y Latinoamérica.",
  },
  {
    icon: ICONS.shield,
    title: "Honesto con sus límites",
    text: "La IA puede equivocarse; la app lo dice y le avisa cuando un resultado no es en vivo.",
  },
];

export function AboutSection() {
  return (
    <Band id="acerca" tone="stone" labelledBy="acerca-title">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="acerca-title"
            eyebrow="Detrás de aegis-home"
            title="Una herramienta para la familia que cuida a distancia"
          />
          <div className="mt-4 space-y-4 text-lg text-stone-700">
            <p>
              Muchos de nosotros vivimos lejos de nuestros padres o abuelos y no siempre podemos
              revisar su casa. Una evaluación profesional en persona no está al alcance de todos, y
              las herramientas que existen suelen estar en inglés y pensadas para otros países.
            </p>
            <p>
              aegis-home nació en el <strong>Meta Global AI Developer Hackathon 2026</strong>, con
              el tema <em>Build for Your World</em>: construir para el mundo propio, en nuestro
              idioma y con nuestra realidad.
            </p>
          </div>
        </div>
        <ul className="space-y-4">
          {VALUES.map((v) => (
            <li key={v.title} className="flex gap-4 rounded-xl bg-white p-5 ring-1 ring-stone-200">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                {icon(v.icon)}
              </span>
              <div>
                <p className="text-lg font-semibold">{v.title}</p>
                <p className="mt-1 text-base text-stone-600">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}

const FAQ = [
  {
    q: "¿Cuánto cuesta?",
    a: "Nada. Es gratis y no necesita crear una cuenta.",
  },
  {
    q: "¿Guardan mis fotos?",
    a: "No. Se analizan y se descartan. Solo se guarda la lista de riesgos de cada espacio, que se borra a los 30 días o cuando usted lo decida.",
  },
  {
    q: "¿Reemplaza a un profesional o a un médico?",
    a: "No. aegis-home señala riesgos del entorno para ayudarle a empezar. No da consejos médicos ni detecta caídas, y no reemplaza la visita de un profesional.",
  },
  {
    q: "¿Y si la IA se equivoca?",
    a: "Puede pasar: a veces no ve un riesgo o marca algo que no lo es. Use el plan como guía y confíe en su criterio. Si el servicio de IA no está disponible, la app muestra un aviso visible.",
  },
  {
    q: "¿Quién puede ver el plan?",
    a: "Solo quien tenga el enlace de la evaluación. Compártalo únicamente con personas de confianza.",
  },
  {
    q: "¿El botón de contacto llama a emergencias?",
    a: "No. Abre la llamada, WhatsApp o SMS hacia los contactos que usted agregue. En una emergencia, llame al 911.",
  },
];

export function FaqSection() {
  return (
    <Band id="preguntas" labelledBy="preguntas-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading
          id="preguntas-title"
          eyebrow="Preguntas frecuentes"
          title="Lo que suelen preguntarnos"
        />
        <div className="divide-y divide-stone-200 rounded-xl ring-1 ring-stone-200">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="text-2xl text-teal-700 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-base text-stone-700">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Band>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 pb-16 sm:pb-20">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-12 text-center text-white sm:px-12">
        <h2 className="text-3xl font-bold sm:text-4xl">Empiece por un solo espacio</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-teal-50">
          El baño suele ser el lugar más importante. Una foto basta para tener su primer plan.
        </p>
        <a
          href="#empezar"
          className="mt-8 inline-flex min-h-14 items-center rounded-xl bg-white px-7 text-lg font-semibold text-teal-900 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Analizar mi casa
        </a>
      </div>
    </section>
  );
}
