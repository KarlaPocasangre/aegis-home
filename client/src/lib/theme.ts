import { useSyncExternalStore } from "react";
import { readJson, writeJson } from "./storage";

export type ThemePref = "system" | "light" | "dark";
export type Theme = "light" | "dark";

const STORAGE_KEY = "aegis:theme";
const isPref = (v: unknown): v is ThemePref => v === "system" || v === "light" || v === "dark";

const media =
  typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: light)") : null;

let pref: ThemePref = (() => {
  const saved = readJson(STORAGE_KEY);
  return isPref(saved) ? saved : "system";
})();

const resolve = (): Theme => (pref === "system" ? (media?.matches ? "light" : "dark") : pref);

const listeners = new Set<() => void>();
const notify = () => {
  // data-theme switches the palette in index.css; the snapshot is a string so React compares it.
  if (typeof document !== "undefined") document.documentElement.dataset.theme = resolve();
  for (const listener of listeners) listener();
};
notify();
media?.addEventListener("change", () => pref === "system" && notify());

export function setThemePref(next: ThemePref) {
  pref = next;
  writeJson(STORAGE_KEY, next);
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const snapshot = () => `${pref}:${resolve()}`;

/** The saved preference and the theme actually shown (system resolves to light or dark). */
export function useTheme(): { pref: ThemePref; theme: Theme } {
  const [p, t] = useSyncExternalStore(subscribe, snapshot).split(":") as [ThemePref, Theme];
  return { pref: p, theme: t };
}
