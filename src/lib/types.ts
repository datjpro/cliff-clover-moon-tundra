export type ThemeId = "minimalist" | "glass" | "cyberpunk" | "pastel" | "ink";
export type LayoutMode = "stickies" | "sidebar" | "tray" | "corner";
export type NoteTint = "cream" | "mist" | "sage" | "blush" | "neon" | "dark" | "glass";
export type PipMood = "idle" | "wander" | "fetch" | "deliver" | "nudge" | "sleep" | "dance" | "eating" | "focus" | "sitting" | "chasing_ball";
export type PetType = "fox" | "cat" | "shiba" | "dragon" | "cyber";
export type PetSkin = "classic" | "matcha" | "amber" | "cyber" | "obsidian";
export type PetHat = "none" | "explorer_hat" | "sunglasses" | "wizard_hat" | "party_hat" | "sleep_cap";
export type PetBodyItem = "backpack" | "cape" | "wings" | "scarf" | "none";
export type Language = "en" | "vi";

export type CheckItem = {
  id: string;
  text: string;
  done: boolean;
};

export type Note = {
  id: string;
  title?: string;
  body: string;
  x: number; // percentage of screen (0 - 100)
  y: number; // percentage of screen (0 - 100)
  width?: number; // optional width in px
  height?: number; // optional height in px
  rot: number;
  tint: NoteTint;
  opacity?: number; // 0.3 to 1.0
  fontFamily?: "sans" | "handwriting" | "mono";
  fontSize?: "sm" | "base" | "lg";
  checkItems?: CheckItem[];
  z: number;
  createdAt: number;
  pinned?: boolean;
  collapsed?: boolean;
};

export type Reminder = {
  id: string;
  title: string;
  durationMs?: number;
  fireAt: number;
  done: boolean;
  pinToScreen?: boolean;
};

export type ToastItem = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
};

export type PawPrint = {
  id: string;
  x: number;
  y: number;
  rot: number;
  opacity: number;
  createdAt: number;
};

export type BallToy = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
};

export type PipState = {
  enabled: boolean;
  petType: PetType;
  mood: PipMood;
  skin: PetSkin;
  hat: PetHat;
  bodyItem: PetBodyItem;
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
  targetNoteId?: string | null;
};
