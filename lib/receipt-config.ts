import type { ReceiptTheme, ReceiptModule, ModuleId, ThemeId } from "@/types/strava";

export const THEMES: ReceiptTheme[] = [
  {
    id: "thermal",
    label: "Thermal",
    bg: "#fafaf8",
    text: "#1a1a1a",
    accent: "#1a1a1a",
    font: "mono",
  },
  {
    id: "night",
    label: "Night Run",
    bg: "#0d0d1a",
    text: "#e0e0ff",
    accent: "#7c6fff",
    font: "mono",
  },
  {
    id: "neon",
    label: "Neon",
    bg: "#0a0a0a",
    text: "#39ff14",
    accent: "#39ff14",
    font: "mono",
  },
  {
    id: "minimal",
    label: "Minimal",
    bg: "#ffffff",
    text: "#111111",
    accent: "#e63946",
    font: "serif",
  },
];

export const MODULES: ReceiptModule[] = [
  { id: "route", label: "Route Map", icon: "🗺️", defaultEnabled: true },
  { id: "stats", label: "Key Stats", icon: "📊", defaultEnabled: true },
  { id: "pace_chart", label: "Pace Chart", icon: "📈", defaultEnabled: true },
  { id: "elevation", label: "Elevation Profile", icon: "⛰️", defaultEnabled: false },
  { id: "hr_zones", label: "Heart Rate Zones", icon: "❤️", defaultEnabled: true },
  { id: "splits", label: "Split Table", icon: "⏱️", defaultEnabled: false },
  { id: "weather", label: "Weather Stamp", icon: "🌤️", defaultEnabled: true },
  { id: "pr_badge", label: "PR Badge", icon: "🏅", defaultEnabled: true },
  { id: "quote", label: "Motivational Quote", icon: "✨", defaultEnabled: false },
];

export const DEFAULT_CONFIG = {
  enabledModules: Object.fromEntries(MODULES.map((m) => [m.id, m.defaultEnabled])) as Record<
    ModuleId,
    boolean
  >,
  themeId: "thermal" as ThemeId,
};

export const MOTIVATIONAL_QUOTES = [
  "Pain is temporary. Strava is forever.",
  "Run now, brunch later.",
  "I run because I really like snacks.",
  "Every km counts.",
  "Your future self will thank you.",
  "Slow miles still count.",
  "One more km never hurt anyone. Probably.",
];

export function getTheme(id: ThemeId): ReceiptTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
