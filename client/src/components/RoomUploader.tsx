import { useId, useRef, useState, type FormEvent } from "react";
import { useT } from "../lib/i18n";
import { roomLabel } from "../lib/labels";
import type { SampleImage } from "../lib/samples";
import { ROOM_TYPES, type RoomType } from "../lib/types";
import { AnalysisProgress } from "./AnalysisProgress";
import { SampleImagePicker } from "./SampleImagePicker";

interface Props {
  busy: boolean;
  error: string | null;
  onUpload: (file: File, roomType: RoomType) => void;
  onSample: (sample: SampleImage) => void;
}

export function RoomUploader({ busy, error, onUpload, onSample }: Props) {
  const a = useT().analyze;
  const [roomType, setRoomType] = useState<RoomType>("bathroom");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ids = { type: useId(), file: useId() };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    onUpload(file, roomType);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor={ids.type} className="block text-sm font-semibold text-stone-300">
            {a.roomQuestion}
          </label>
          <select
            id={ids.type}
            value={roomType}
            onChange={(e) => setRoomType(e.target.value as RoomType)}
            disabled={busy}
            className="mt-1 block min-h-12 w-full rounded-lg border border-white/15 bg-ink-2 px-3 text-white"
          >
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {roomLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.file} className="block text-sm font-semibold text-stone-300">
            {a.photoLabel}
          </label>
          {/* The native file button is labeled in the browser's language, not the app's:
              the input stays for keyboard and screen readers, a translated button sits on top. */}
          <div className="mt-1 flex items-center gap-3">
            <label
              htmlFor={ids.file}
              className={`inline-flex min-h-12 shrink-0 cursor-pointer items-center rounded-lg bg-white/10 px-4 font-semibold text-white hover:bg-white/20 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-mint ${busy ? "pointer-events-none opacity-50" : ""}`}
            >
              {a.choosePhoto}
              <input
                ref={inputRef}
                id={ids.file}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            <span className="min-w-0 truncate text-sm text-stone-400">
              {file ? file.name : a.noFile}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-400">{a.photoHint}</p>
        </div>
        <button
          type="submit"
          disabled={busy || !file}
          className="w-full rounded-lg bg-mint px-4 py-3 font-semibold text-ink hover:bg-mint-soft disabled:opacity-50"
        >
          {busy ? a.analyzing : a.submit}
        </button>
      </form>

      {busy && <AnalysisProgress />}
      {error && !busy && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <SampleImagePicker onPick={onSample} disabled={busy} />
    </div>
  );
}
