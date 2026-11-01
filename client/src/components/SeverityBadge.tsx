import { SEVERITY_STYLES, severityLabel } from "../lib/labels";
import type { Severity } from "../lib/types";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[severity].badge}`}
    >
      {severityLabel(severity)}
    </span>
  );
}
