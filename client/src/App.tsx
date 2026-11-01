import { AssessmentPage } from "./pages/AssessmentPage";
import { LandingPage } from "./pages/LandingPage";
import { navigate, useRoute } from "./lib/router";

export default function App() {
  const route = useRoute();

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            className="flex items-center gap-2 text-lg font-bold text-teal-800"
          >
            <img src="/favicon.svg" alt="" className="size-7" />
            aegis-home
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {route.name === "household" ? (
          <AssessmentPage key={route.token} token={route.token} />
        ) : (
          <LandingPage />
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <p className="mx-auto max-w-3xl px-4 py-4 text-xs text-stone-500">
          aegis-home señala riesgos del entorno con inteligencia artificial y puede equivocarse. No
          da consejos médicos, no detecta caídas y no es un servicio de emergencias. Los costos son
          aproximados.
        </p>
      </footer>
    </div>
  );
}
