// Shown before the first upload (docs/SECURITY.md §1).
export function PrivacyNotice({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-700">
      <p className="font-semibold text-stone-900">Antes de empezar</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Las fotos se analizan con inteligencia artificial de Meta y esta app no las guarda.</li>
        <li>Evite fotos con personas, rostros o documentos.</li>
        <li>
          El análisis señala riesgos del entorno; no reemplaza la opinión de un profesional ni da
          consejos médicos.
        </li>
        <li>No es un servicio de emergencias.</li>
      </ul>
      <label className="mt-3 flex items-start gap-2 font-medium text-stone-900">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-4"
        />
        Entiendo y quiero continuar
      </label>
    </div>
  );
}
