import type { ComponentProps } from "react";
import { RoomUploader } from "../../components/RoomUploader";
import { ViewTitle } from "../../components/ViewTitle";
import { useT } from "../../lib/i18n";

export function AnalyzeView(props: ComponentProps<typeof RoomUploader>) {
  const a = useT().analyze;
  return (
    <div className="space-y-6">
      <ViewTitle subtitle={a.subtitle}>{a.title}</ViewTitle>
      <div className="rounded-xl bg-white/5 p-4 sm:p-5">
        <RoomUploader {...props} />
      </div>
    </div>
  );
}
