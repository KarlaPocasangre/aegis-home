import { t } from "./i18n";
import { readJson, writeJson } from "./storage";

export interface Contact {
  name: string;
  phone: string; // E.164: "+" and 8–15 digits
}

const CONTACTS_KEY = "aegis:contacts";
const MAX_CONTACTS = 3;
const MAX_NAME = 40;

/** "+503 7000-0000" → "+50370000000"; null when it isn't an international number. */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("+")) return null;
  const digits = trimmed.slice(1).replace(/[\s\-().]/g, "");
  return /^\d{8,15}$/.test(digits) ? `+${digits}` : null;
}

export function normalizeName(input: string): string | null {
  const name = input.trim().replace(/\s+/g, " ");
  return name.length >= 1 && name.length <= MAX_NAME ? name : null;
}

export function helpMessage(coords?: { lat: number; lng: number }): string {
  const { help, myLocation } = t().contact;
  const base = help;
  if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return base;
  const lat = coords.lat.toFixed(5);
  const lng = coords.lng.toFixed(5);
  return `${base} ${myLocation} https://maps.google.com/?q=${lat},${lng}`;
}

/** Native phone links only: no server involved (docs/API_SPECS.md §3). */
export function contactLinks(phone: string, message: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const text = encodeURIComponent(message);
  return {
    call: `tel:${normalized}`,
    sms: `sms:${normalized}?body=${text}`,
    whatsapp: `https://wa.me/${normalized.slice(1)}?text=${text}`,
  };
}

// Stored contacts are re-validated: anything malformed is dropped.
export function loadContacts(): Contact[] {
  const raw = readJson(CONTACTS_KEY);
  if (!Array.isArray(raw)) return [];
  const contacts: Contact[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const { name, phone } = item as Record<string, unknown>;
    const n = typeof name === "string" ? normalizeName(name) : null;
    const p = typeof phone === "string" ? normalizePhone(phone) : null;
    if (n && p) contacts.push({ name: n, phone: p });
  }
  return contacts.slice(0, MAX_CONTACTS);
}

export function saveContacts(contacts: Contact[]): void {
  writeJson(CONTACTS_KEY, contacts.slice(0, MAX_CONTACTS));
}

export { MAX_CONTACTS };
