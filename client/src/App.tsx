import { LandingNavbar } from "./components/LandingNavbar";
import { SiteFooter } from "./components/SiteFooter";
import { useRoute } from "./lib/router";
import { HouseholdLayout } from "./pages/household/HouseholdLayout";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  const route = useRoute();

  return (
    <div className="dark flex min-h-dvh flex-col bg-ink text-stone-100">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-mint px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      {route.name === "household" ? (
        <HouseholdLayout key={route.token} route={route} />
      ) : (
        <>
          <LandingNavbar />
          <main id="contenido" className="flex-1">
            <LandingPage />
          </main>
          <SiteFooter variant="full" />
        </>
      )}
    </div>
  );
}
