import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../../lib/api";

// Only the evaluation uses React Query, so it lives in this lazily loaded chunk. One client for
// the whole visit keeps the cache when moving between households or back from the landing page.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Client errors (401/404/…) won't fix themselves; network or 5xx may.
      retry: (failures, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failures < 2,
      refetchOnWindowFocus: true,
      staleTime: 10_000,
    },
  },
});
