import { LandingNavbar } from "./components/LandingNavbar";
import { SiteFooter } from "./components/SiteFooter";
import { useRoute } from "./lib/router";
import { HouseholdLayout } from "./pages/household/HouseholdLayout";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  const route = useRoute();

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-teal-800 px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      {route.name === "household" ? (
        <HouseholdLayout key={route.token} route={route} />
      ) : (
        <>
          <LandingNavbar />
          <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
            <LandingPage />
          </main>
          <SiteFooter />
        </>
      )}
    </div>
  );
}
