export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-stone-200 bg-white ${className}`}>
      <p className="mx-auto max-w-3xl px-4 py-4 text-sm text-stone-600">
        aegis-home señala riesgos del entorno con inteligencia artificial y puede equivocarse. No da
        consejos médicos, no detecta caídas y no es un servicio de emergencias. Los costos son
        aproximados.
      </p>
    </footer>
  );
}
