import type { ContentLanguage, Hazard } from "./types";

// Real Muse Spark + SAM 3.1 output for the bathroom sample in each language, copied from
// server/fixtures/6769335b…[.pt|.en].json (recorded with `npm run record-fixture`). Shown on the
// landing page as a labeled example, so visitors see a result before creating anything.
// The model was asked once per language, so the hazards found can differ slightly between them.
export const DEMO_IMAGE = "/samples/bathroom-wet-floor.jpg";

const DEMO: Record<ContentLanguage, Hazard[]> = {
  es: [
    {
      id: "demo-es-h1",
      aiId: "h1",
      labelEn: "wet floor",
      labelEs: "piso mojado",
      severity: "high",
      descriptionEs:
        "Hay un charco grande de agua en el piso de loseta frente a la ducha, muy resbaloso para una persona mayor.",
      fixEs:
        "Seque el agua con un trapeador y coloque un tapete antideslizante plano fuera de la ducha.",
      costEstimateUsd: 5,
      confidence: 0.95,
      region: {
        type: "bbox",
        points: [0.333, 0.6880000000000001, 0.579, 0.169],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-es-h2",
      aiId: "h2",
      labelEn: "loose bath mat",
      labelEs: "tapete enrollado",
      severity: "high",
      descriptionEs:
        "El tapete naranja está doblado y arrugado sobre el piso mojado y puede hacer tropezar.",
      fixEs: "Extienda el tapete bien plano sobre el piso seco y fíjelo con base antideslizante.",
      costEstimateUsd: 5,
      confidence: 0.9,
      region: {
        type: "bbox",
        points: [0.388, 0.815, 0.34600000000000003, 0.17700000000000002],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-es-h3",
      aiId: "h3",
      labelEn: "missing grab bar",
      labelEs: "barra de apoyo faltante",
      severity: "medium",
      descriptionEs:
        "No hay barra de apoyo en la zona de la ducha para sostenerse al entrar y salir sobre el piso mojado.",
      fixEs:
        "Instale una barra de apoyo atornillada a la pared de la ducha a la altura de la mano.",
      costEstimateUsd: 20,
      confidence: 0.6,
      region: {
        type: "bbox",
        points: [0.72, 0.35000000000000003, 0.265, 0.06999999999999999],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-es-h4",
      aiId: "h4",
      labelEn: "loose slipper",
      labelEs: "chancla suelta",
      severity: "medium",
      descriptionEs:
        "Hay una chancla verde suelta sobre el piso mojado que puede causar un resbalón o tropezón.",
      fixEs: "Recoja la chancla del piso y mantenga el piso libre de objetos pequeños.",
      costEstimateUsd: 0,
      confidence: 0.65,
      region: {
        type: "bbox",
        points: [0.292, 0.886, 0.116, 0.09200000000000001],
      },
      status: "pending",
      resolvedAt: null,
    },
  ],
  pt: [
    {
      id: "demo-pt-h1",
      aiId: "h1",
      labelEn: "wet floor",
      labelEs: "piso molhado",
      severity: "high",
      descriptionEs:
        "Grande poça de água no piso de cerâmica entre o vaso e o box, deixa o chão muito escorregadio.",
      fixEs: "Seque toda a água com pano agora e coloque um tapete antiderrapante na saída do box.",
      costEstimateUsd: 10,
      confidence: 0.95,
      region: {
        type: "bbox",
        points: [0.32, 0.69, 0.555, 0.218],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-pt-h2",
      aiId: "h2",
      labelEn: "bunched bath mat",
      labelEs: "tapete enrolado",
      severity: "high",
      descriptionEs:
        "Tapete de banho laranja todo amontoado e enrolado sobre o chão molhado, fácil de tropeçar.",
      fixEs: "Estique o tapete no chão seco e coloque base ou fita antiderrapante embaixo dele.",
      costEstimateUsd: 5,
      confidence: 0.92,
      region: {
        type: "bbox",
        points: [0.44, 0.815, 0.29, 0.18000000000000002],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-pt-h3",
      aiId: "h3",
      labelEn: "loose slipper",
      labelEs: "chinelo solto",
      severity: "medium",
      descriptionEs: "Chinelo verde largado no chão ao lado do tapete, no meio da passagem.",
      fixEs:
        "Retire o chinelo do caminho e guarde os calçados sempre no mesmo lugar fora da passagem.",
      costEstimateUsd: 0,
      confidence: 0.8,
      region: {
        type: "bbox",
        points: [0.32, 0.884, 0.09, 0.09300000000000001],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-pt-h4",
      aiId: "h4",
      labelEn: "missing grab bar",
      labelEs: "sem barra de apoio",
      severity: "medium",
      descriptionEs:
        "Parede do box do chuveiro sem barra de apoio para segurar ao entrar, tomar banho e sair.",
      fixEs: "Instale uma barra de apoio firme na parede do box com ajuda de um profissional.",
      costEstimateUsd: 25,
      confidence: 0.75,
      region: {
        type: "bbox",
        points: [0.7000000000000001, 0.27999999999999997, 0.2, 0.27999999999999997],
      },
      status: "pending",
      resolvedAt: null,
    },
  ],
  en: [
    {
      id: "demo-en-h1",
      aiId: "h1",
      labelEn: "wet floor",
      labelEs: "wet floor",
      severity: "high",
      descriptionEs: "There is a large puddle of water on the floor in front of the shower.",
      fixEs:
        "Wipe up the water right away and keep the floor dry. Put a non-slip bath mat outside the shower.",
      costEstimateUsd: 5,
      confidence: 0.95,
      region: {
        type: "bbox",
        points: [0.29, 0.6890000000000001, 0.587, 0.219],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-en-h2",
      aiId: "h2",
      labelEn: "bunched bath mat",
      labelEs: "bunched bath mat",
      severity: "high",
      descriptionEs: "The orange bath mat is bunched up and not flat on the floor.",
      fixEs:
        "Lay the mat flat and tape the edges down or get a mat with a rubber back that does not slip.",
      costEstimateUsd: 10,
      confidence: 0.9,
      region: {
        type: "bbox",
        points: [0.41400000000000003, 0.8119999999999999, 0.322, 0.18100000000000002],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-en-h3",
      aiId: "h3",
      labelEn: "small floor clutter",
      labelEs: "small floor clutter",
      severity: "medium",
      descriptionEs: "A small green object is left on the floor near the mat.",
      fixEs: "Pick up the small object and keep the bathroom floor clear of clutter.",
      costEstimateUsd: 0,
      confidence: 0.7,
      region: {
        type: "bbox",
        points: [0.292, 0.883, 0.091, 0.09500000000000001],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-en-h4",
      aiId: "h4",
      labelEn: "raised shower step",
      labelEs: "raised shower step",
      severity: "medium",
      descriptionEs: "There is a raised white step at the shower entrance that can catch a foot.",
      fixEs: "Mark the edge with bright tape and step slowly. Add a non-slip strip on the step.",
      costEstimateUsd: 3,
      confidence: 0.85,
      region: {
        type: "bbox",
        points: [0.633, 0.61, 0.367, 0.049999999999999996],
      },
      status: "pending",
      resolvedAt: null,
    },
    {
      id: "demo-en-h5",
      aiId: "h5",
      labelEn: "missing grab bar",
      labelEs: "missing grab bar",
      severity: "medium",
      descriptionEs: "There is no grab bar near the shower to hold while stepping in and out.",
      fixEs: "Add a wall grab bar by the shower entrance for hand support.",
      costEstimateUsd: 20,
      confidence: 0.8,
      region: {
        type: "bbox",
        points: [0.745, 0.32, 0.22, 0.19999999999999998],
      },
      status: "pending",
      resolvedAt: null,
    },
  ],
};

export const demoHazards = (lang: ContentLanguage): Hazard[] => DEMO[lang];
