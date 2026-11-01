import { LandingNavbar } from "./components/LandingNavbar";
import { SiteFooter } from "./components/SiteFooter";
import { useT, useLang } from "./lib/i18n";
import { useRoute } from "./lib/router";
import { HouseholdLayout } from "./pages/household/HouseholdLayout";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  const route = useRoute();
  const tr = useT();
  // SplitText rewrites heading DOM: remount the landing on language change instead of patching it.
  const lang = useLang();

  return (
    <div className="dark flex min-h-dvh flex-col bg-ink text-stone-100">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-mint px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {tr.common.skipToContent}
      </a>
      {route.name === "household" ? (
        <HouseholdLayout key={route.token} route={route} />
      ) : (
        <>
          <LandingNavbar />
          <main id="contenido" className="flex-1">
            <LandingPage key={lang} />
          </main>
          <SiteFooter variant="full" />
        </>
      )}
    </div>
  );
}
