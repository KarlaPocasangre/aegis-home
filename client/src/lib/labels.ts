import { t } from "./i18n";
import type { RoomType, Severity } from "./types";

export const roomLabel = (type: RoomType): string => t().rooms[type];

export const severityLabel = (severity: Severity): string => t().severity[severity];

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
      // -700 shades: white numbers need 4.5:1 (amber-600 gives 3.2:1, sky-600 4.1:1).
      marker: "bg-amber-700",
    },
    low: {
      badge: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
      stroke: "#0284c7",
      marker: "bg-sky-700",
    },
  };

// Formatters are cheap; built per call so they follow the current language.
const usd = () => new Intl.NumberFormat(t().meta.locale, { style: "currency", currency: "USD" });

export function formatCost(value: number): string {
  return value === 0 ? t().cost.free : t().cost.approx(usd().format(value));
}

export function formatUsd(value: number): string {
  return usd().format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(t().meta.locale, { dateStyle: "long" }).format(new Date(iso));
}

/** Model labels arrive lowercase ("piso mojado"); display them as sentences. */
export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase("es") + text.slice(1);
}
