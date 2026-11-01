import { useSyncExternalStore } from "react";
import { isToken } from "./storage";

// Two routes don't justify a router dependency.
export type Route = { name: "landing" } | { name: "household"; token: string };

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export function navigate(path: string) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

export function parseRoute(pathname: string): Route {
  const token = /^\/h\/([^/]+)\/?$/.exec(pathname)?.[1];
  return token && isToken(token) ? { name: "household", token } : { name: "landing" };
}

export function useRoute(): Route {
  const pathname = useSyncExternalStore(subscribe, () => window.location.pathname);
  return parseRoute(pathname);
}

export const householdPath = (token: string) => `/h/${token}`;
