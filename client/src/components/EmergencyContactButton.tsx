import { useId, useRef, useState, type FormEvent } from "react";
import {
  contactLinks,
  helpMessage,
  loadContacts,
  MAX_CONTACTS,
  normalizeName,
  normalizePhone,
  saveContacts,
  type Contact,
} from "../lib/contacts";

type LocationState =
  | { status: "off" }
  | { status: "locating" }
  | { status: "on"; lat: number; lng: number }
  | { status: "error" };

// A shortcut to the user's own contacts via native phone links. Not an emergency service.
export function EmergencyContactButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);
  const [location, setLocation] = useState<LocationState>({ status: "off" });
  const [formError, setFormError] = useState<string | null>(null);
  const ids = { name: useId(), phone: useId(), title: useId() };

  const updateContacts = (next: Contact[]) => {
    setContacts(next);
    saveContacts(next);
  };

  // Geolocation is requested only when the user ticks the box.
  const toggleLocation = (checked: boolean) => {
    if (!checked) return setLocation({ status: "off" });
    if (!("geolocation" in navigator)) return setLocation({ status: "error" });
    setLocation({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ status: "on", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ status: "error" }),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  };

  const addContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = normalizeName(String(data.get("name") ?? ""));
    const phone = normalizePhone(String(data.get("phone") ?? ""));
    if (!name) return setFormError("Escriba un nombre (máximo 40 letras).");
    if (!phone) {
      return setFormError("Escriba el número con código de país, por ejemplo +503 7000 0000.");
    }
    setFormError(null);
    updateContacts([...contacts, { name, phone }]);
    event.currentTarget.reset();
  };

  const message = helpMessage(location.status === "on" ? location : undefined);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 sm:bottom-6 flex items-center gap-2 rounded-full bg-rose-700 px-5 py-3.5 font-semibold text-white shadow-lg hover:bg-rose-800"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-current">
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
        </svg>
        Contactar a un familiar
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={ids.title}
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl bg-ink-2 p-0 text-stone-100 ring-1 ring-white/10 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="max-h-[85dvh] overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 id={ids.title} className="text-xl font-bold">
              Contactar a un familiar
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg px-2 py-1 text-stone-400 hover:bg-white/5"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-stone-300">
            Este botón abre su teléfono para llamar o escribir a sus contactos. No es un servicio de
            emergencias y no avisa a nadie por sí solo. En una emergencia, llame al 911.
          </p>

          {contacts.length > 0 && (
            <>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-mint"
                  checked={location.status === "on" || location.status === "locating"}
                  onChange={(e) => toggleLocation(e.target.checked)}
                />
                Incluir mi ubicación en el mensaje
              </label>
              {location.status === "locating" && (
                <p className="mt-1 text-xs text-stone-400">Obteniendo ubicación…</p>
              )}
              {location.status === "error" && (
                <p className="mt-1 text-xs text-red-300">
                  No se pudo obtener la ubicación. El mensaje se enviará sin ella.
                </p>
              )}

              <ul className="mt-4 space-y-3">
                {contacts.map((contact, index) => {
                  const links = contactLinks(contact.phone, message);
                  if (!links) return null;
                  return (
                    <li
                      key={`${contact.phone}-${index}`}
                      className="rounded-lg border border-white/10 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{contact.name}</p>
                        <button
                          type="button"
                          onClick={() => updateContacts(contacts.filter((_, i) => i !== index))}
                          className="text-xs text-stone-400 underline hover:text-red-300"
                        >
                          Quitar
                        </button>
                      </div>
                      <p className="text-sm text-stone-400">{contact.phone}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
                        <a
                          href={links.call}
                          className="rounded-lg bg-mint px-2 py-2.5 text-ink hover:bg-mint-soft"
                        >
                          Llamar
                        </a>
                        <a
                          href={links.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-emerald-500 px-2 py-2.5 text-ink hover:bg-emerald-400"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={links.sms}
                          className="rounded-lg bg-white/10 px-2 py-2.5 text-white hover:bg-white/20"
                        >
                          SMS
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {contacts.length < MAX_CONTACTS && (
            <form
              onSubmit={addContact}
              className="mt-5 space-y-3 border-t border-white/10 pt-4"
              noValidate
            >
              <p className="font-semibold">
                {contacts.length === 0
                  ? "Agregue un contacto de confianza"
                  : "Agregar otro contacto"}
              </p>
              <p className="text-xs text-stone-400">
                Los contactos se guardan solo en este teléfono o computadora.
              </p>
              <div>
                <label htmlFor={ids.name} className="block text-sm font-semibold text-stone-300">
                  Nombre
                </label>
                <input
                  id={ids.name}
                  name="name"
                  maxLength={40}
                  autoComplete="off"
                  className="mt-1 block min-h-12 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-white placeholder:text-stone-500"
                />
              </div>
              <div>
                <label htmlFor={ids.phone} className="block text-sm font-semibold text-stone-300">
                  Teléfono con código de país
                </label>
                <input
                  id={ids.phone}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="+503 7000 0000"
                  autoComplete="off"
                  className="mt-1 block min-h-12 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-white placeholder:text-stone-500"
                />
              </div>
              {formError && (
                <p role="alert" className="text-sm text-red-300">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg border border-mint/60 px-4 py-2.5 font-semibold text-mint hover:bg-mint/10"
              >
                Guardar contacto
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
