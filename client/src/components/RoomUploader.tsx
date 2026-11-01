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
  const cameraRef = useRef<HTMLInputElement>(null);
  const ids = { type: useId(), file: useId() };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    onUpload(file, roomType);
    setFile(null);
    for (const input of [inputRef.current, cameraRef.current]) if (input) input.value = "";
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
              each input stays for keyboard and screen readers, a translated button sits on top. */}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {/* Phones: open the rear camera directly, the natural flow while walking the home.
                Hidden where there is no touch camera (desktop opens a file picker anyway). */}
            <label
              className={`hidden min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-mint px-4 font-semibold text-ink hover:bg-mint-soft has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mint [@media(pointer:coarse)]:inline-flex ${busy ? "pointer-events-none opacity-50" : ""}`}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8a2 2 0 0 1 2-2h1.5l1.5-2h6l1.5 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                <circle cx="12" cy="12.5" r="3.5" />
              </svg>
              {a.takePhoto}
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                disabled={busy}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
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
            <span className="min-w-0 basis-full truncate text-sm text-stone-400 sm:basis-auto">
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
