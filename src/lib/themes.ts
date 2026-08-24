import type { LayoutMode, ThemeId } from "./types";

export const THEMES: {
  id: ThemeId;
  name: string;
  line: string;
}[] = [
  { id: "glass", name: "Glassmorphism", line: "Frosted acrylic glass with blurred backdrop" },
  { id: "pastel", name: "Pastel Dream", line: "Soft warm colors, calm paper notes" },
  { id: "cyberpunk", name: "Cyberpunk Neon", line: "Vibrant neon glow & futuristic dark glass" },
  { id: "minimalist", name: "Minimalist", line: "Ultra-clean monochrome typography" },
  { id: "ink", name: "Ink & Wood", line: "Classic dark obsidian desk theme" },
];

export const LAYOUTS: {
  id: LayoutMode;
  name: string;
  line: string;
}[] = [
  { id: "stickies", name: "Stickies Freeform", line: "Notes float anywhere on your screen" },
  { id: "sidebar", name: "Sidebar Dock", line: "Neat column docked to the right edge" },
  { id: "tray", name: "Tray Hidden", line: "Notes minimized to system tray" },
];
