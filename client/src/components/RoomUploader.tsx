import { useId, useRef, useState, type FormEvent } from "react";
import { ROOM_LABELS } from "../lib/labels";
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
            ¿Qué espacio es?
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
                {ROOM_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.file} className="block text-sm font-semibold text-stone-300">
            Foto del espacio
          </label>
          <input
            ref={inputRef}
            id={ids.file}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:px-4 file:py-2.5 file:font-semibold hover:file:bg-white/20"
          />
          <p className="mt-1 text-xs text-stone-400">
            Tome la foto de pie, mostrando el piso y los lugares por donde se camina.
          </p>
        </div>
        <button
          type="submit"
          disabled={busy || !file}
          className="w-full rounded-lg bg-mint px-4 py-3 font-semibold text-ink hover:bg-mint-soft disabled:opacity-50"
        >
          Analizar foto
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
