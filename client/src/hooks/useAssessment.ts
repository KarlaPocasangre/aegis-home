import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeRoom } from "../lib/analyzeRoom";
import { api } from "../lib/api";
import { withHazardStatus } from "../lib/plan";
import type { Assessment, HazardStatus, RoomType } from "../lib/types";

export const queryKeys = {
  household: (token: string) => ["household", token] as const,
  assessment: (token: string, id: string) => ["assessment", token, id] as const,
};

export function useHousehold(token: string) {
  return useQuery({
    queryKey: queryKeys.household(token),
    queryFn: () => api.getHousehold(token),
  });
}

export function useAssessment(token: string, assessmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assessment(token, assessmentId ?? ""),
    queryFn: () => api.getAssessment(token, assessmentId!),
    enabled: Boolean(assessmentId),
  });
}

export function useAnalyzeRoom(token: string, assessmentId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { image: Blob; roomType: RoomType; previewUrl?: string }) =>
      analyzeRoom(token, assessmentId!, input.image, input.roomType, input.previewUrl),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.assessment(token, assessmentId ?? "") }),
  });
}

export function useSetHazardStatus(token: string, assessmentId: string | undefined) {
  const queryClient = useQueryClient();
  const key = queryKeys.assessment(token, assessmentId ?? "");
  return useMutation({
    // Serial: an "undo" tapped while "fixed" is still saving runs after it, never races it.
    scope: { id: `hazard-status-${token}` },
    mutationFn: (input: { hazardId: string; status: HazardStatus }) =>
      api.setHazardStatus(token, input.hazardId, input.status),
    // Optimistic: the plan updates on tap; rolled back if the request fails.
    onMutate: async ({ hazardId, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Assessment>(key);
      if (previous) queryClient.setQueryData(key, withHazardStatus(previous, hazardId, status));
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
