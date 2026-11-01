import { useSyncExternalStore, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { isToken } from "./storage";

// A handful of routes don't justify a router dependency.
export type HouseholdView = "plan" | "analizar" | "espacios" | "ajustes";

export type Route =
  | { name: "landing" }
  | {
      name: "household";
      token: string;
      view: HouseholdView;
      /** Only on /espacios/:roomId; `hazardId` comes from ?riesgo= to preselect a hazard. */
      roomId?: string;
      hazardId?: string;
    };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export function navigate(path: string) {
  const go = () => {
    window.history.pushState(null, "", path);
    // flushSync: the new view must be in the DOM before the transition snapshots it.
    flushSync(() => window.dispatchEvent(new PopStateEvent("popstate")));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduced) document.startViewTransition(go);
  else go();
}

/** For <a href> elements: client-side navigation, but ctrl/cmd-click still opens a new tab. */
export function linkHandler(path: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    navigate(path);
  };
}

export function parseRoute(pathname: string, search = ""): Route {
  const match = /^\/h\/([^/]+)(?:\/(analizar|espacios|ajustes)(?:\/([^/]+))?)?\/?$/.exec(pathname);
  const [, token, view = "plan", roomId] = match ?? [];
  if (!token || !isToken(token)) return { name: "landing" };
  if (roomId !== undefined && (view !== "espacios" || !UUID.test(roomId))) {
    return { name: "landing" };
  }

  const route: Route = { name: "household", token, view: view as HouseholdView };
  if (roomId) {
    route.roomId = roomId;
    const hazardId = new URLSearchParams(search).get("riesgo");
    if (hazardId && UUID.test(hazardId)) route.hazardId = hazardId;
  }
  return route;
}

const snapshot = () => window.location.pathname + window.location.search;

export function useRoute(): Route {
  const url = useSyncExternalStore(subscribe, snapshot);
  const [pathname = "", search = ""] = url.split(/(?=\?)/);
  return parseRoute(pathname, search);
}

export function householdPath(token: string, view: HouseholdView = "plan") {
  return view === "plan" ? `/h/${token}` : `/h/${token}/${view}`;
}

export function roomPath(token: string, roomId: string, hazardId?: string) {
  const path = `${householdPath(token, "espacios")}/${roomId}`;
  return hazardId ? `${path}?riesgo=${encodeURIComponent(hazardId)}` : path;
}
