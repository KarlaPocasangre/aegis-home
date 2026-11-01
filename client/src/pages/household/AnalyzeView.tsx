import type { ComponentProps } from "react";
import { RoomUploader } from "../../components/RoomUploader";
import { ViewTitle } from "../../components/ViewTitle";

export function AnalyzeView(props: ComponentProps<typeof RoomUploader>) {
  return (
    <div className="space-y-6">
      <ViewTitle subtitle="Una foto por espacio. Al terminar verá los riesgos resaltados.">
        Analizar un espacio
      </ViewTitle>
      <div className="rounded-xl bg-white/5 p-4 sm:p-5">
        <RoomUploader {...props} />
      </div>
    </div>
  );
}
