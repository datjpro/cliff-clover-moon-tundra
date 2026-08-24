import type { LayoutMode, ThemeId } from "./types";

export const THEMES: {
  id: ThemeId;
  name: string;
  line: string;
}[] = [
  { id: "ink", name: "Ink", line: "Dusk desk, cream paper" },
  { id: "paper", name: "Paper", line: "Daylight linen" },
  { id: "glass", name: "Glass", line: "Cool night steel" },
  { id: "moss", name: "Moss", line: "Forest shade" },
];

export const LAYOUTS: {
  id: LayoutMode;
  name: string;
  line: string;
}[] = [
  { id: "stickies", name: "Stickies", line: "Notes float on the desk" },
  { id: "sidebar", name: "Sidebar", line: "A quiet column on the right" },
  { id: "tray", name: "Tray only", line: "Hidden until you ask" },
];
