import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { prepareImage } from "../lib/image";
import { withHazardStatus } from "../lib/plan";
import { roomImages } from "../lib/roomImages";
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

/**
 * Prepares the photo client-side, uploads it, and keeps a local preview for the overlay.
 * `previewUrl` is passed for bundled samples, which are already public files.
 */
export async function analyzeRoom(
  token: string,
  assessmentId: string,
  image: Blob,
  roomType: RoomType,
  previewUrl?: string,
) {
  const prepared = await prepareImage(image);
  const room = await api.uploadRoom(token, assessmentId, roomType, prepared);
  roomImages.set(room.id, previewUrl ?? URL.createObjectURL(prepared));
  return room;
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
