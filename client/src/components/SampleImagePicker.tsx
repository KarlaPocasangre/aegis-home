import { useT } from "../lib/i18n";
import { SAMPLE_IMAGES, type SampleImage } from "../lib/samples";

interface Props {
  onPick: (sample: SampleImage) => void;
  disabled?: boolean;
}

export function SampleImagePicker({ onPick, disabled }: Props) {
  const tr = useT();
  return (
    <div>
      <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
        {tr.common.noPhotoAtHand}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {SAMPLE_IMAGES.map((sample) => (
          <button
            key={sample.url}
            type="button"
            disabled={disabled}
            onClick={() => onPick(sample)}
            className="group overflow-hidden rounded-lg border border-stone-200 bg-white text-left transition hover:border-teal-600 disabled:opacity-50 dark:border-white/10 dark:bg-ink-2 dark:hover:border-mint/60"
          >
            <img
              src={sample.url}
              alt=""
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <span className="block px-3 py-2 text-sm">
              <span className="block font-semibold text-teal-800 group-hover:underline dark:text-mint">
                {tr.common.useSample}
              </span>
              <span className="text-stone-600 dark:text-stone-400">
                {tr.samples[sample.labelKey]}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
