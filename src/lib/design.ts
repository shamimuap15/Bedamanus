/**
 * Design system for the landing page. Everything the admin can customise on the
 * "Design" screen is declared here and turned into CSS variables, so the page
 * (and the admin live preview) restyle without touching component code.
 */

export type Palette = {
  ground: string; band: string; card: string; line: string; line2: string;
  fg: string; soft: string; muted: string; tile: string;
};

export const THEMES = {
  dark: { label: "Dark", p: { ground: "#1f1f1f", band: "#19191b", card: "#29292d", line: "#34343a", line2: "#48484f", fg: "#f4f2ee", soft: "#d6d4cf", muted: "#ababb2", tile: "#efede8" } },
  midnight: { label: "Midnight", p: { ground: "#0d1220", band: "#0a0e1a", card: "#151c30", line: "#232c47", line2: "#34406a", fg: "#eef1fb", soft: "#c9d0e8", muted: "#98a2c4", tile: "#e9ecf6" } },
  light: { label: "Light", p: { ground: "#ffffff", band: "#f5f4f0", card: "#ffffff", line: "#e7e5df", line2: "#cfccc3", fg: "#16161a", soft: "#3d3d44", muted: "#6f6e76", tile: "#efede8" } },
  warm: { label: "Warm cream", p: { ground: "#fbf6ec", band: "#f3ebda", card: "#fffaf0", line: "#e6dcc4", line2: "#d3c6a6", fg: "#2a2118", soft: "#4d4234", muted: "#85796a", tile: "#f0e6d0" } },
} as const satisfies Record<string, { label: string; p: Palette }>;
export type ThemeKey = keyof typeof THEMES;

export const FONTS = {
  hind: { label: "Hind Siliguri", family: "Hind Siliguri", css: "Hind+Siliguri:wght@400;500;600;700" },
  noto: { label: "Noto Sans Bengali", family: "Noto Sans Bengali", css: "Noto+Sans+Bengali:wght@400;500;600;700" },
  anek: { label: "Anek Bangla", family: "Anek Bangla", css: "Anek+Bangla:wght@400;500;600;700;800" },
  baloo: { label: "Baloo Da 2", family: "Baloo Da 2", css: "Baloo+Da+2:wght@400;500;600;700;800" },
} as const;
export type FontKey = keyof typeof FONTS;

export const RADII = { sharp: { label: "Sharp", r: 6 }, soft: { label: "Soft", r: 22 }, round: { label: "Extra round", r: 32 } } as const;
export const SPACINGS = { compact: { label: "Compact", sy: 28 }, comfortable: { label: "Comfortable", sy: 40 }, airy: { label: "Airy", sy: 56 } } as const;
export const BUTTONS = { rounded: { label: "Match corners" }, pill: { label: "Pill" } } as const;
export const HEADLINES = { normal: { label: "Normal", px: 36 }, big: { label: "Big", px: 42 }, huge: { label: "Huge", px: 48 } } as const;

export const STICKY_STYLES = { classic: { label: "Call + big button" }, price: { label: "Price + button" } } as const;

export const DESIGN_DEFAULTS = {
  theme: "dark",
  accentColor: "#C8FF3D",
  accentTextColor: "#1F1F1F",
  font: "hind",
  radius: "soft",
  spacing: "comfortable",
  buttonShape: "rounded",
  headlineSize: "normal",
  stickyStyle: "classic",
} as const;

const hex = (v: unknown, fb: string) => (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : fb);
const pick = <T extends Record<string, unknown>>(table: T, v: unknown, fb: keyof T): keyof T =>
  typeof v === "string" && v in table ? (v as keyof T) : fb;

/** Resolve settings into the inline CSS variables used across the landing page. */
export function designVars(s: Record<string, unknown>): React.CSSProperties {
  const theme = THEMES[pick(THEMES, s.theme, "dark")].p;
  const font = FONTS[pick(FONTS, s.font, "hind")];
  const r = RADII[pick(RADII, s.radius, "soft")].r;
  const sy = SPACINGS[pick(SPACINGS, s.spacing, "comfortable")].sy;
  const h1 = HEADLINES[pick(HEADLINES, s.headlineSize, "normal")].px;
  const pill = s.buttonShape === "pill";
  return {
    ["--accent" as string]: hex(s.accentColor, DESIGN_DEFAULTS.accentColor),
    ["--on-accent" as string]: hex(s.accentTextColor, DESIGN_DEFAULTS.accentTextColor),
    ["--color-ground" as string]: theme.ground,
    ["--color-band" as string]: theme.band,
    ["--color-card" as string]: theme.card,
    ["--color-line" as string]: theme.line,
    ["--color-line2" as string]: theme.line2,
    ["--color-fg" as string]: theme.fg,
    ["--color-soft" as string]: theme.soft,
    ["--color-muted" as string]: theme.muted,
    ["--color-tile" as string]: theme.tile,
    ["--r" as string]: `${r}px`,
    ["--btn-r" as string]: pill ? "999px" : `${Math.round(r * 0.7)}px`,
    ["--sy" as string]: `${sy}px`,
    ["--h1" as string]: `${h1}px`,
    fontFamily: `"${font.family}", ui-sans-serif, system-ui, sans-serif`,
  };
}

export function fontHref(s: Record<string, unknown>): string | null {
  const key = pick(FONTS, s.font, "hind");
  return key === "hind" ? null : `https://fonts.googleapis.com/css2?family=${FONTS[key].css}&display=swap`;
}
