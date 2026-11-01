// Generates the bundled sample images (original illustrations, no third-party assets):
//   node client/scripts/generate-samples.mjs
// Replace them with real photos you own for better results with the model.
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const outDir = fileURLToPath(new URL("../public/samples/", import.meta.url));
mkdirSync(outDir, { recursive: true });

const tiles = (x0, y0, x1, y1, size, fill, stroke) => {
  let out = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${fill}"/>`;
  for (let x = x0; x <= x1; x += size)
    out += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${stroke}" stroke-width="2"/>`;
  for (let y = y0; y <= y1; y += size)
    out += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${stroke}" stroke-width="2"/>`;
  return out;
};

// Bathroom: wet glossy floor tiles, loose bath mat, toilet without grab bar, shower step.
const bathroom = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="768" viewBox="0 0 1024 768">
  <defs>
    <linearGradient id="light" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#000000" stop-opacity="0.15"/>
    </linearGradient>
    <radialGradient id="puddle" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#e0f2fe" stop-opacity="0.95"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0.35"/>
    </radialGradient>
  </defs>
  ${tiles(0, 0, 1024, 470, 64, "#dbeafe", "#bfdbfe")}
  <polygon points="0,470 1024,470 1024,768 0,768" fill="#d6d3d1"/>
  ${tiles(0, 470, 1024, 768, 74, "#e7e5e4", "#a8a29e")}
  <!-- shower area with low step -->
  <rect x="660" y="80" width="364" height="420" fill="#bae6fd" opacity="0.6"/>
  <rect x="650" y="470" width="374" height="34" fill="#f5f5f4" stroke="#a8a29e" stroke-width="3"/>
  <line x1="650" y1="70" x2="1024" y2="70" stroke="#78716c" stroke-width="8"/>
  <path d="M660 74 q20 210 0 420 h40 q-20 -210 0 -420 z" fill="#f9a8d4" opacity="0.85"/>
  <circle cx="900" cy="150" r="28" fill="#a8a29e"/><rect x="895" y="170" width="10" height="60" fill="#a8a29e"/>
  <!-- toilet, no grab bar on the wall -->
  <rect x="90" y="250" width="150" height="150" rx="10" fill="#fafaf9" stroke="#d6d3d1" stroke-width="4"/>
  <ellipse cx="190" cy="455" rx="120" ry="45" fill="#fafaf9" stroke="#d6d3d1" stroke-width="4"/>
  <rect x="140" y="455" width="100" height="110" fill="#f5f5f4" stroke="#d6d3d1" stroke-width="4"/>
  <!-- water on the floor -->
  <ellipse cx="560" cy="600" rx="190" ry="55" fill="url(#puddle)"/>
  <ellipse cx="760" cy="560" rx="110" ry="30" fill="url(#puddle)"/>
  <ellipse cx="420" cy="690" rx="120" ry="32" fill="url(#puddle)"/>
  <path d="M480 590 q40 -12 90 0" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.9"/>
  <!-- loose bath mat with a curled corner -->
  <g transform="rotate(-9 560 690)">
    <rect x="430" y="650" width="270" height="95" rx="8" fill="#f97316" opacity="0.9"/>
    <rect x="445" y="662" width="240" height="70" rx="6" fill="none" stroke="#fed7aa" stroke-width="4" stroke-dasharray="10 8"/>
  </g>
  <path d="M700 662 q30 -6 22 -40 l-28 30 z" fill="#ea580c"/>
  <!-- towel on the floor -->
  <path d="M300 700 q60 -40 120 0 l-10 50 q-50 -20 -100 0 z" fill="#14b8a6"/>
  <rect width="1024" height="768" fill="url(#light)"/>
</svg>`;

// Stairs: steep steps without handrail, objects left on the steps, dim light.
const stairStep = (i) => {
  const x = 120 + i * 95;
  const y = 690 - i * 72;
  return `
    <rect x="${x}" y="${y}" width="${1024 - x}" height="20" fill="#92400e"/>
    <rect x="${x}" y="${y + 20}" width="${1024 - x}" height="52" fill="#b45309"/>`;
};

const stairs = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="768" viewBox="0 0 1024 768">
  <defs>
    <radialGradient id="dim" cx="0.85" cy="0.1" r="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="768" fill="#e7e5e4"/>
  <rect x="0" y="0" width="1024" height="768" fill="#d6d3d1"/>
  <rect x="0" y="690" width="1024" height="78" fill="#78716c"/>
  ${Array.from({ length: 9 }, (_, i) => stairStep(i)).join("")}
  <!-- bare wall: no handrail anywhere -->
  <line x1="90" y1="600" x2="980" y2="0" stroke="#a8a29e" stroke-width="3" stroke-dasharray="4 14" opacity="0.6"/>
  <!-- objects on the steps -->
  <rect x="330" y="500" width="110" height="64" fill="#a16207" stroke="#713f12" stroke-width="4"/>
  <line x1="330" y1="532" x2="440" y2="532" stroke="#713f12" stroke-width="3"/>
  <ellipse cx="560" cy="405" rx="38" ry="14" fill="#1c1917"/>
  <ellipse cx="610" cy="410" rx="38" ry="14" fill="#1c1917"/>
  <rect x="700" y="290" width="70" height="40" rx="6" fill="#2563eb"/>
  <!-- single weak bulb at the top -->
  <circle cx="880" cy="60" r="16" fill="#fde68a"/>
  <rect width="1024" height="768" fill="url(#dim)"/>
</svg>`;

const samples = { "bathroom-wet-floor.jpg": bathroom, "stairs-no-handrail.jpg": stairs };
for (const [file, svg] of Object.entries(samples)) {
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(`${outDir}${file}`);
  console.log(`wrote public/samples/${file}`);
}
