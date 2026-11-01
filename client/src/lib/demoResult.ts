import type { Hazard } from "./types";

// Real Muse Spark + SAM 3.1 output for the bathroom sample, copied from
// server/fixtures/6769335b….json (recorded with `npm run record-fixture`). Shown on the landing
// page as a labeled example, so visitors see a result before creating anything.
export const DEMO_IMAGE = "/samples/bathroom-wet-floor.jpg";

export const DEMO_HAZARDS: Hazard[] = [
  {
    id: "demo-h1",
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
    id: "demo-h2",
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
    id: "demo-h3",
    aiId: "h3",
    labelEn: "missing grab bar",
    labelEs: "barra de apoyo faltante",
    severity: "medium",
    descriptionEs:
      "No hay barra de apoyo en la zona de la ducha para sostenerse al entrar y salir sobre el piso mojado.",
    fixEs: "Instale una barra de apoyo atornillada a la pared de la ducha a la altura de la mano.",
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
    id: "demo-h4",
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
];
