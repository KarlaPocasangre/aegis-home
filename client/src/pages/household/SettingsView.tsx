import type { ReactNode } from "react";
import { ShareLink } from "../../components/ShareLink";
import { ViewTitle } from "../../components/ViewTitle";

const dateFormat = new Intl.DateTimeFormat("es-SV", { dateStyle: "long" });

interface Props {
  token: string;
  expiresAt: string;
  deleting: boolean;
  onDelete: () => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsView({ token, expiresAt, deleting, onDelete }: Props) {
  return (
    <div className="space-y-8">
      <ViewTitle>Ajustes</ViewTitle>

      <ShareLink token={token} />

      <Section title="Contactos de confianza">
        <p className="text-base text-stone-300">
          Use el botón rojo <strong>Contactar a un familiar</strong> para agregar hasta 3 contactos
          y llamarlos o escribirles. Se guardan solo en este dispositivo.
        </p>
      </Section>

      <Section title="Privacidad">
        <ul className="list-disc space-y-1 pl-5 text-base text-stone-300">
          <li>Las fotos se analizan y no se guardan; solo se guarda la lista de riesgos.</li>
          <li>
            Esta evaluación estará disponible hasta el{" "}
            <strong>{dateFormat.format(new Date(expiresAt))}</strong>. Después se borra sola.
          </li>
        </ul>
      </Section>

      <Section title="Borrar datos">
        <p className="text-base text-stone-300">
          Borra la evaluación, sus espacios y riesgos. El enlace compartido dejará de funcionar.
        </p>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="min-h-12 rounded-lg border-2 border-red-400/60 bg-transparent px-5 text-base font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
        >
          {deleting ? "Borrando…" : "Borrar esta evaluación y sus datos"}
        </button>
      </Section>
    </div>
  );
}
