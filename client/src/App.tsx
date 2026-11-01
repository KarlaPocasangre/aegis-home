import { lazy, Suspense, useEffect } from "react";
import { LandingNavbar } from "./components/LandingNavbar";
import { SiteFooter } from "./components/SiteFooter";
import { useT, useLang } from "./lib/i18n";
import { useRoute } from "./lib/router";

// Each area is its own chunk: the landing page carries GSAP, Lenis and the demo data; the
// evaluation carries the data hooks and forms. A visitor only downloads the one they open.
const loadLanding = () => import("./pages/LandingPage");
const loadHousehold = () => import("./pages/household/HouseholdLayout");
const LandingPage = lazy(() => loadLanding().then((m) => ({ default: m.LandingPage })));
const HouseholdLayout = lazy(() => loadHousehold().then((m) => ({ default: m.HouseholdLayout })));

/** Fetches the other area when the browser is idle, so switching to it doesn't wait. */
function usePrefetch(load: () => Promise<unknown>) {
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000));
    idle(() => void load().catch(() => {}));
  }, [load]);
}

const Loading = () => <div className="min-h-dvh flex-1" aria-busy="true" />;

export default function App() {
  const route = useRoute();
  const tr = useT();
  // SplitText rewrites heading DOM: remount the landing on language change instead of patching it.
  const lang = useLang();
  usePrefetch(route.name === "household" ? loadLanding : loadHousehold);

  return (
    <div className="dark flex min-h-dvh flex-col bg-ink text-stone-100">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-mint px-4 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {tr.common.skipToContent}
      </a>
      {route.name === "household" ? (
        <Suspense fallback={<Loading />}>
          <HouseholdLayout key={route.token} route={route} />
        </Suspense>
      ) : (
        <>
          <LandingNavbar />
          <main id="contenido" className="flex-1">
            <Suspense fallback={<Loading />}>
              <LandingPage key={lang} />
            </Suspense>
          </main>
          <SiteFooter variant="full" />
        </>
      )}
    </div>
  );
}
