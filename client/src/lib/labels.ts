import type { RoomType, Severity } from "./types";

export const ROOM_LABELS: Record<RoomType, string> = {
  bathroom: "Baño",
  kitchen: "Cocina",
  bedroom: "Dormitorio",
  living_room: "Sala",
  hallway: "Pasillo",
  stairs: "Escaleras",
  entrance: "Entrada",
  outdoor: "Patio o exterior",
  other: "Otro espacio",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  high: "Riesgo alto",
  medium: "Riesgo medio",
  low: "Riesgo bajo",
};

export const SEVERITY_STYLES: Record<Severity, { badge: string; stroke: string; marker: string }> =
  {
    high: {
      badge: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
      stroke: "#dc2626",
      marker: "bg-red-600",
    },
    medium: {
      badge: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
      stroke: "#d97706",
      marker: "bg-amber-600",
    },
    low: {
      badge: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
      stroke: "#0284c7",
      marker: "bg-sky-600",
    },
  };

const usd = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });

export function formatCost(value: number): string {
  return value === 0 ? "Sin costo" : `Aprox. ${usd.format(value)}`;
}

export function formatUsd(value: number): string {
  return usd.format(value);
}

/** Model labels arrive lowercase ("piso mojado"); display them as sentences. */
export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase("es") + text.slice(1);
}
