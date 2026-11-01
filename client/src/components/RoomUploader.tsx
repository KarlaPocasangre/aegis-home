import { useEffect, useId, useRef, useState, type FormEvent } from "react";
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
  // No preselected room: a silent default ("Baño") filed living rooms and kitchens as bathrooms.
  const [roomType, setRoomType] = useState<RoomType | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sampleUrl, setSampleUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState({ room: false, photo: false });
  const selectRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ids = { type: useId(), file: useId(), roomError: useId(), photoError: useId() };

  // A local thumbnail so the user can confirm the right photo before sending it. The file is
  // kept after submit: if the analysis fails, retrying needs no new pick (success navigates away).
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = (picked: File | null) => {
    setFile(picked);
    if (picked) setMissing((m) => ({ ...m, photo: false }));
  };

  // The button stays enabled: a tap with something missing says what, next to that field.
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setMissing({ room: roomType === "", photo: file === null });
    if (roomType === "") return selectRef.current?.focus();
    if (!file) return inputRef.current?.focus();
    setSampleUrl(null);
    onUpload(file, roomType);
  };

  const pickSample = (sample: SampleImage) => {
    setSampleUrl(sample.url);
    onSample(sample);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor={ids.type} className="block text-base font-semibold text-stone-200">
            {a.roomQuestion}
          </label>
          <select
            ref={selectRef}
            id={ids.type}
            value={roomType}
            onChange={(e) => {
              setRoomType(e.target.value as RoomType);
              setMissing((m) => ({ ...m, room: false }));
            }}
            disabled={busy}
            aria-invalid={missing.room || undefined}
            aria-describedby={missing.room ? ids.roomError : undefined}
            className={`mt-1 block min-h-12 w-full rounded-lg border bg-ink-2 px-3 text-base text-white ${missing.room ? "border-red-400" : "border-white/15"}`}
          >
            <option value="" disabled>
              {a.roomPlaceholder}
            </option>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {roomLabel(type)}
              </option>
            ))}
          </select>
          {missing.room && (
            <p
              id={ids.roomError}
              role="alert"
              className="mt-1 text-base font-semibold text-red-300"
            >
              {a.roomRequired}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={ids.file} className="block text-base font-semibold text-stone-200">
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
                type="file"
                accept="image/*"
                capture="environment"
                disabled={busy}
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
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
                aria-invalid={missing.photo || undefined}
                aria-describedby={missing.photo ? ids.photoError : undefined}
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            {!file && (
              <span className="min-w-0 basis-full text-base text-stone-400 sm:basis-auto">
                {a.noFile}
              </span>
            )}
          </div>
          {file && preview && !busy && (
            <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/5 p-2">
              <img
                src={preview}
                alt={a.chosenAlt}
                className="size-20 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-stone-300">{file.name}</p>
                <label
                  htmlFor={ids.file}
                  className="mt-1 inline-flex min-h-12 cursor-pointer items-center text-base font-semibold text-mint underline underline-offset-4"
                >
                  {a.changePhoto}
                </label>
              </div>
            </div>
          )}
          {missing.photo && (
            <p
              id={ids.photoError}
              role="alert"
              className="mt-1 text-base font-semibold text-red-300"
            >
              {a.photoRequired}
            </p>
          )}
          <p className="mt-2 text-base text-stone-400">{a.photoHint}</p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 w-full rounded-lg bg-mint px-4 py-3 text-base font-semibold text-ink hover:bg-mint-soft disabled:opacity-60"
        >
          {busy ? a.analyzing : a.submit}
        </button>
      </form>

      {busy && <AnalysisProgress previewUrl={sampleUrl ?? preview ?? undefined} />}
      {error && !busy && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <SampleImagePicker onPick={pickSample} disabled={busy} />
    </div>
  );
}
