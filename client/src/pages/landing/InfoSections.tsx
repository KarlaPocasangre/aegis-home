import { RollText } from "../../components/RollText";
import { ScrollFillText } from "../../components/ScrollFillText";
import { Band, DisplayHeading, ICONS, SectionHeading, icon } from "./layout";

const WHO_FALLS = "https://www.who.int/es/news-room/fact-sheets/detail/falls";

const COMMON_RISKS = [
  { title: "Pisos mojados o lisos", text: "Baños y cocinas sin tapete antideslizante." },
  { title: "Tapetes sueltos y cables", text: "Bordes levantados y cosas en el paso." },
  { title: "Escaleras sin pasamanos", text: "Escalones sin agarradera ni buena luz." },
  { title: "Poca luz de noche", text: "Pasillos oscuros camino al baño." },
];

const PROBLEM_STORY =
  "Su mamá se levanta de noche para ir al baño. El pasillo está oscuro, el piso sigue mojado y no hay dónde agarrarse. Son detalles que vemos todos los días y que casi nunca notamos.";

export function ProblemSection() {
  return (
    <Band id="por-que" labelledBy="por-que-title">
      <h2 className="text-sm font-bold tracking-widest text-mint uppercase" id="por-que-title">
        Por qué importa
      </h2>
      <ScrollFillText
        text={PROBLEM_STORY}
        className="mt-6 font-display text-4xl leading-[1.15] text-white sm:text-6xl"
      />
      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <p className="text-lg text-stone-300">
          Según la{" "}
          <a
            href={WHO_FALLS}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-mint underline underline-offset-4"
          >
            Organización Mundial de la Salud
          </a>
          , las caídas son la segunda causa de muerte por lesiones no intencionales en el mundo, y
          las personas mayores de 60 años son las más afectadas. Muchas empiezan en casa, con cosas
          que se pueden arreglar con poco dinero.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {COMMON_RISKS.map((risk) => (
            <li
              data-stagger
              key={risk.title}
              className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/40"
            >
              <p className="text-lg font-semibold">{risk.title}</p>
              <p className="mt-1 text-base text-stone-400">{risk.text}</p>
            </li>
          ))}
        </ul>
      </div>
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
          <li
            data-stagger
            key={f.title}
            className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-mint/10 text-mint">
              {icon(f.icon)}
            </span>
            <p className="mt-4 text-lg font-semibold">{f.title}</p>
            <p className="mt-1 text-base text-stone-400">{f.text}</p>
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
            data-stagger
            key={step.name}
            className="relative rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10"
          >
            <p className="text-sm font-semibold text-mint">Paso {index + 1}</p>
            <p className="mt-1 text-xl font-bold">{step.name}</p>
            <p className="mt-2 text-base text-stone-300">{step.detail}</p>
            {index < PIPELINE.length - 1 && (
              <span
                aria-hidden
                className="absolute top-1/2 -right-3 hidden -translate-y-1/2 text-2xl text-mint lg:block"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-8 text-base text-stone-300">
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
          <p className="mt-6 flex items-start gap-3 rounded-xl bg-amber-400/10 p-4 text-base text-amber-100 ring-1 ring-amber-400/30">
            {icon(ICONS.shield, "mt-0.5 size-5")}
            Evite fotos con personas, rostros o documentos. Las fotos se envían a la IA de Meta para
            su análisis.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PRIVACY.map((p) => (
            <li
              data-stagger
              key={p.title}
              className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/40"
            >
              <span className="text-mint">{icon(p.icon)}</span>
              <p className="mt-3 text-lg font-semibold">{p.title}</p>
              <p className="mt-1 text-base text-stone-400">{p.text}</p>
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
          <div className="mt-4 space-y-4 text-lg text-stone-300">
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
            <li
              data-stagger
              key={v.title}
              className="flex gap-4 rounded-xl bg-white/[0.04] p-5 ring-1 ring-white/10"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint">
                {icon(v.icon)}
              </span>
              <div>
                <p className="text-lg font-semibold">{v.title}</p>
                <p className="mt-1 text-base text-stone-400">{v.text}</p>
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
        <div className="divide-y divide-white/10 rounded-xl ring-1 ring-white/10">
          {FAQ.map((item) => (
            <details key={item.q} className="faq group px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="text-2xl text-mint transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-base text-stone-300">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Band>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink-2 px-6 ring-1 ring-white/10 py-16 text-center text-white sm:px-12 sm:py-24">
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-mint/15 blur-3xl"
        />
        <div className="relative">
          <DisplayHeading className="mx-auto max-w-3xl text-5xl sm:text-7xl">
            Empiece por <em>un solo espacio</em>
          </DisplayHeading>
          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-300 sm:text-xl">
            El baño suele ser el lugar más importante. Una foto basta para tener su primer plan.
          </p>
          <a
            href="#empezar"
            className="mt-10 inline-flex min-h-14 items-center rounded-full bg-mint px-8 text-lg font-semibold text-ink shadow-[0_0_40px_-8px] shadow-mint/60 transition hover:bg-mint-soft active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint"
          >
            <RollText>Analizar mi casa</RollText>
          </a>
        </div>
      </div>
    </section>
  );
}
