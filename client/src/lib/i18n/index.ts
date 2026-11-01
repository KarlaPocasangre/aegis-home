import { useSyncExternalStore } from "react";
import { readJson, writeJson } from "../storage";
import { en } from "./en";
import { es, type Dict } from "./es";
import { pt } from "./pt";

export type Lang = "es" | "pt" | "en";
export type { Dict };

/** Each language is named in itself, so anyone can find theirs. */
export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "es", label: "Español", short: "ES" },
  { code: "pt", label: "Português", short: "PT" },
  { code: "en", label: "English", short: "EN" },
];

const DICTS: Record<Lang, Dict> = { es, pt, en };
const STORAGE_KEY = "aegis:lang";

const isLang = (value: unknown): value is Lang =>
  value === "es" || value === "pt" || value === "en";

// A saved choice wins; otherwise the browser language, falling back to Spanish.
function initialLang(): Lang {
  const saved = readJson(STORAGE_KEY);
  if (isLang(saved)) return saved;
  const browser = (globalThis.navigator?.language || "es").slice(0, 2).toLowerCase();
  return isLang(browser) ? browser : "es";
}

let current: Lang = initialLang();
const listeners = new Set<() => void>();

function applyToDocument() {
  if (typeof document === "undefined") return; // unit tests run without a DOM
  document.documentElement.lang = current;
  document.title = DICTS[current].meta.title;
}
applyToDocument();

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  writeJson(STORAGE_KEY, lang);
  applyToDocument();
  for (const listener of listeners) listener();
}

export const getLang = () => current;

/** Current dictionary, for code outside React (formatters, error messages). */
export const t = (): Dict => DICTS[current];

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang);
}

/** Dictionary for the current language; re-renders the component when it changes. */
export function useT(): Dict {
  return DICTS[useLang()];
}
