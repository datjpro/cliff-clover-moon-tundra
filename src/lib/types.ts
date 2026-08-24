export type ThemeId = "ink" | "paper" | "glass" | "moss";
export type LayoutMode = "stickies" | "sidebar" | "tray" | "corner";
export type NoteTint = "cream" | "mist" | "sage" | "blush";
export type PipMood = "idle" | "wander" | "fetch" | "deliver" | "nudge" | "sleep" | "dance" | "eating" | "focus";
export type PetSkin = "classic" | "matcha" | "amber" | "cyber" | "obsidian";
export type Language = "en" | "vi";

export type Note = {
  id: string;
  body: string;
  x: number;
  y: number;
  rot: number;
  tint: NoteTint;
  z: number;
  createdAt: number;
  pinned?: boolean;
  collapsed?: boolean;
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
  skin: PetSkin;
  happiness: number; // 0 - 100
  energy: number; // 0 - 100
  treatsEaten: number;
  soundEnabled: boolean;
  x: number;
  y: number;
  facing: 1 | -1;
  carrying: boolean;
  moving: boolean;
  speech: string | null;
};
