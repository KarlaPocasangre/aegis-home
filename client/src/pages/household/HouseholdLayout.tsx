import { useEffect, useState } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { EmergencyContactButton } from "../../components/EmergencyContactButton";
import { Logo } from "../../components/Logo";
import { Navbar } from "../../components/Navbar";
import { SiteFooter } from "../../components/SiteFooter";
import {
  useAnalyzeRoom,
  useAssessment,
  useHousehold,
  useSetHazardStatus,
} from "../../hooks/useAssessment";
import { api } from "../../lib/api";
import { isUnauthorized, userMessage } from "../../lib/errors";
import { roomImages } from "../../lib/roomImages";
import { navigate, parseRoute, roomPath, type Route } from "../../lib/router";
import { fetchSample, type SampleImage } from "../../lib/samples";
import { t, useT } from "../../lib/i18n";
import { lastHousehold } from "../../lib/storage";
import type { RoomType } from "../../lib/types";
import { AnalyzeView } from "./AnalyzeView";
import { PlanView } from "./PlanView";
import { RoomsView } from "./RoomsView";
import { queryClient } from "./queryClient";
import { SettingsView } from "./SettingsView";

type HouseholdRoute = Extract<Route, { name: "household" }>;

/**
 * Owns all household state (queries, mutations, deletion) and stays mounted while the user
 * moves between views, so a running analysis or an optimistic update survives navigation.
 * Views only render what they receive.
 */
export function HouseholdLayout({ route }: { route: HouseholdRoute }) {
  return (
    <QueryClientProvider client={queryClient}>
      <HouseholdArea route={route} />
    </QueryClientProvider>
  );
}

function HouseholdArea({ route }: { route: HouseholdRoute }) {
  const { token, view } = route;
  const tr = useT();
  const queryClient = useQueryClient();
  const household = useHousehold(token);
  // Newest assessment first: re-checks get their own assessment.
  const assessmentId = household.data?.assessments.at(-1)?.id;
  const assessment = useAssessment(token, assessmentId);
  const analyze = useAnalyzeRoom(token, assessmentId);
  const setStatus = useSetHazardStatus(token, assessmentId);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (household.isSuccess) lastHousehold.set(token);
    if (isUnauthorized(household.error) && lastHousehold.get() === token) lastHousehold.clear();
  }, [household.isSuccess, household.error, token]);

  const runAnalysis = (input: { image: Blob; roomType: RoomType; previewUrl?: string }) => {
    setSampleError(null);
    analyze.mutate(input, {
      // Show the new room right away, unless the user went elsewhere while waiting.
      onSuccess: (room) => {
        const current = parseRoute(window.location.pathname);
        if (current.name === "household" && current.view === "analizar") {
          navigate(roomPath(token, room.id));
        }
      },
    });
  };

  const analyzeSample = async (sample: SampleImage) => {
    setSampleError(null);
    try {
      const image = await fetchSample(sample);
      runAnalysis({ image, roomType: sample.roomType, previewUrl: sample.url });
    } catch (err) {
      setSampleError(userMessage(err));
    }
  };

  const remove = async () => {
    if (!window.confirm(t().household.confirmDelete)) return;
    setDeleting(true);
    try {
      await api.deleteHousehold(token);
      lastHousehold.clear();
      roomImages.clear();
      queryClient.removeQueries({ queryKey: ["household", token] });
      queryClient.removeQueries({ queryKey: ["assessment", token] });
      navigate("/");
    } catch (err) {
      window.alert(userMessage(err));
      setDeleting(false);
    }
  };

  if (household.isError || assessment.isError) {
    const expired = isUnauthorized(household.error);
    return (
      <>
        <header className="border-b border-white/10 bg-ink-2">
          <div className="mx-auto flex max-w-5xl px-4 py-2">
            <Logo />
          </div>
        </header>
        <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 text-center">
          <h1 className="text-xl font-bold">
            {expired ? tr.household.expired : userMessage(household.error ?? assessment.error)}
          </h1>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 min-h-12 rounded-lg bg-mint px-5 text-base font-semibold text-ink hover:bg-mint-soft"
          >
            {tr.household.goHome}
          </button>
        </main>
        <SiteFooter />
      </>
    );
  }

  const data = assessment.data;
  const pendingCount = data ? data.plan.totalHazards - data.plan.resolved : 0;

  return (
    <>
      <Navbar
        token={token}
        view={view}
        householdName={household.data?.name ?? null}
        pendingCount={pendingCount}
        analyzing={analyze.isPending}
      />

      {/* Bottom padding keeps the last content clear of the tab bar and the contact button. */}
      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-44 sm:pb-28">
        {!data || !household.data ? (
          <p className="py-12 text-center text-lg text-stone-400">{tr.household.loading}</p>
        ) : view === "plan" ? (
          <PlanView
            token={token}
            householdName={household.data.name}
            assessment={data}
            pendingHazardId={setStatus.isPending ? (setStatus.variables?.hazardId ?? null) : null}
            statusError={setStatus.error ? userMessage(setStatus.error) : null}
            onSetStatus={(hazardId, status) => setStatus.mutate({ hazardId, status })}
          />
        ) : view === "analizar" ? (
          <AnalyzeView
            busy={analyze.isPending}
            error={analyze.error ? userMessage(analyze.error) : sampleError}
            onUpload={(image, roomType) => runAnalysis({ image, roomType })}
            onSample={analyzeSample}
          />
        ) : view === "espacios" ? (
          <RoomsView
            key={route.roomId ?? "all"}
            token={token}
            rooms={data.rooms}
            roomId={route.roomId}
            hazardId={route.hazardId}
          />
        ) : (
          <SettingsView
            token={token}
            expiresAt={household.data.expiresAt}
            deleting={deleting}
            onDelete={remove}
          />
        )}
      </main>

      <SiteFooter className="pb-20 sm:pb-0" />
      <EmergencyContactButton />
    </>
  );
}
