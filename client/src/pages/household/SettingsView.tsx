import type { ReactNode } from "react";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { ShareLink } from "../../components/ShareLink";
import { ViewTitle } from "../../components/ViewTitle";
import { useT } from "../../lib/i18n";
import { formatDate } from "../../lib/labels";

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
  const s = useT().settings;
  return (
    <div className="space-y-8">
      <ViewTitle>{s.title}</ViewTitle>

      <Section title={s.languageTitle}>
        <p className="text-base text-stone-300">{s.languageText}</p>
        <LanguageSwitcher inline />
      </Section>

      <ShareLink token={token} />

      <Section title={s.contactsTitle}>
        <p className="text-base text-stone-300">
          {s.contactsBefore} <strong>{s.contactsButton}</strong> {s.contactsAfter}
        </p>
      </Section>

      <Section title={s.privacyTitle}>
        <ul className="list-disc space-y-1 pl-5 text-base text-stone-300">
          <li>{s.privacyPhotos}</li>
          <li>
            {s.availableBefore} <strong>{formatDate(expiresAt)}</strong>
            {s.availableAfter}
          </li>
        </ul>
      </Section>

      <Section title={s.deleteTitle}>
        <p className="text-base text-stone-300">{s.deleteText}</p>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="min-h-12 rounded-lg border-2 border-red-400/60 bg-transparent px-5 text-base font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
        >
          {deleting ? s.deleting : s.delete}
        </button>
      </Section>
    </div>
  );
}
