export type ThemeId = "ink" | "paper" | "glass" | "moss";
export type LayoutMode = "stickies" | "sidebar" | "tray";
export type NoteTint = "cream" | "mist" | "sage" | "blush";
export type PipMood = "idle" | "wander" | "fetch" | "deliver" | "nudge" | "sleep";

export type Note = {
  id: string;
  body: string;
  x: number;
  y: number;
  rot: number;
  tint: NoteTint;
  z: number;
  createdAt: number;
};

export type Reminder = {
  id: string;
  title: string;
  fireAt: number;
  done: boolean;
};

export type ToastItem = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
};

export type PipState = {
  enabled: boolean;
  mood: PipMood;
  x: number;
  y: number;
  facing: 1 | -1;
  carrying: boolean;
  moving: boolean;
  speech: string | null;
};
