import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionPlan } from "../components/ActionPlan";
import { EmergencyContactButton } from "../components/EmergencyContactButton";
import { RoomCard } from "../components/RoomCard";
import { RoomUploader } from "../components/RoomUploader";
import { ShareLink } from "../components/ShareLink";
import {
  useAnalyzeRoom,
  useAssessment,
  useHousehold,
  useSetHazardStatus,
} from "../hooks/useAssessment";
import { api } from "../lib/api";
import { isUnauthorized, userMessage } from "../lib/errors";
import { roomImages } from "../lib/roomImages";
import { navigate } from "../lib/router";
import { fetchSample } from "../lib/samples";
import { lastHousehold } from "../lib/storage";

const dateFormat = new Intl.DateTimeFormat("es-SV", { dateStyle: "long" });

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function AssessmentPage({ token }: { token: string }) {
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

  if (household.isPending || (assessmentId && assessment.isPending)) {
    return <p className="py-12 text-center text-stone-600">Cargando la evaluación…</p>;
  }

  if (household.isError || assessment.isError || !assessment.data) {
    const expired = isUnauthorized(household.error);
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-lg font-semibold">
          {expired
            ? "Este enlace ya no es válido o la evaluación expiró."
            : userMessage(household.error ?? assessment.error)}
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white"
        >
          Ir al inicio
        </button>
      </div>
    );
  }

  const data = assessment.data;
  const remove = async () => {
    if (
      !window.confirm(
        "¿Borrar esta evaluación y todos sus datos? Esta acción no se puede deshacer.",
      )
    )
      return;
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

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {household.data.name ?? "Evaluación de la casa"}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Disponible hasta el {dateFormat.format(new Date(household.data.expiresAt))}
        </p>
      </header>

      <Section title="Agregar un espacio">
        <div className="rounded-xl bg-stone-100 p-4 sm:p-5">
          <RoomUploader
            busy={analyze.isPending}
            error={analyze.error ? userMessage(analyze.error) : sampleError}
            onUpload={(image, roomType) => {
              setSampleError(null);
              analyze.mutate({ image, roomType });
            }}
            onSample={async (sample) => {
              setSampleError(null);
              try {
                const image = await fetchSample(sample);
                analyze.mutate({ image, roomType: sample.roomType, previewUrl: sample.url });
              } catch (err) {
                setSampleError(userMessage(err));
              }
            }}
          />
        </div>
      </Section>

      <Section title="Plan de acción">
        <ActionPlan
          assessment={data}
          pendingHazardId={setStatus.isPending ? (setStatus.variables?.hazardId ?? null) : null}
          onSetStatus={(hazardId, status) => setStatus.mutate({ hazardId, status })}
        />
        {setStatus.error && (
          <p role="alert" className="text-sm text-red-700">
            {userMessage(setStatus.error)}
          </p>
        )}
      </Section>

      {data.rooms.length > 0 && (
        <Section title="Espacios analizados">
          <div className="space-y-4">
            {[...data.rooms].reverse().map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </Section>
      )}

      <ShareLink token={token} />

      <div className="border-t border-stone-200 pt-6">
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="text-sm font-semibold text-red-700 underline hover:text-red-800 disabled:opacity-50"
        >
          {deleting ? "Borrando…" : "Borrar esta evaluación y sus datos"}
        </button>
      </div>

      <EmergencyContactButton />
    </div>
  );
}
