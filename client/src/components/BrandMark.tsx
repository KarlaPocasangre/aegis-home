// Aegis Home shield (brand identity). "dark" is the version for dark backgrounds: light shield,
// navy house. "light" is the primary version: navy shield, white house. Door is always amber.
const VARIANTS = {
  light: { shield: "#10293b", outline: "#1f7f80", house: "#ffffff" },
  dark: { shield: "#eef4f7", outline: "#8fcfd6", house: "#10293b" },
} as const;

export const BRAND_DOOR = "#f5a524";

export function BrandMark({
  variant = "dark",
  className = "size-9",
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const c = VARIANTS[variant];
  return (
    <svg viewBox="0 0 64 72" className={className} aria-hidden focusable="false">
      <path fill={c.shield} d="M32 2 60 12v22c0 18-12.5 30-28 36C16.5 64 4 52 4 34V12L32 2Z" />
      <path
        fill="none"
        stroke={c.outline}
        strokeWidth={2.4}
        strokeLinejoin="round"
        d="M32 8.5 54 16.4V34c0 14.3-9.6 24.2-22 29.4C19.6 58.2 10 48.3 10 34V16.4L32 8.5Z"
      />
      <path fill={c.house} d="M32 20.5 48.5 36H44v14.5H20V36h-4.5L32 20.5Z" />
      <path fill={BRAND_DOOR} d="M28.8 50.5v-6.7a3.2 3.2 0 0 1 6.4 0v6.7h-6.4Z" />
    </svg>
  );
}
