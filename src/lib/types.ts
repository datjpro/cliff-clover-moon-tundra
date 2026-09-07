export type ThemeId = "minimalist" | "glass" | "cyberpunk" | "pastel" | "ink";
export type LayoutMode = "stickies" | "sidebar" | "tray" | "corner";
export type NoteTint = "cream" | "mist" | "sage" | "blush" | "neon" | "dark" | "glass";
export type PipMood = "idle" | "wander" | "fetch" | "deliver" | "nudge" | "sleep" | "dance" | "eating" | "focus" | "sitting" | "chasing_ball";
export type PetType = "fox" | "cat" | "shiba" | "dragon" | "cyber";
export type PetSkin = "classic" | "matcha" | "amber" | "cyber" | "obsidian";
export type PetHat = "none" | "explorer_hat" | "sunglasses" | "wizard_hat" | "party_hat" | "sleep_cap";
export type PetBodyItem = "backpack" | "cape" | "wings" | "scarf" | "none";
export type Language = "en" | "vi";
export type AlarmSoundTone = "bell_arpeggio" | "digital_alarm" | "gentle_chime" | "vintage_clock";

export type AlarmSettings = {
  volume: number; // 0 - 100
  tone: AlarmSoundTone;
  loopIntervalSec: number;
  muted?: boolean; // Tắt/bật âm thanh chuông báo thức
};

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
  fontSize?: number | "sm" | "base" | "lg";
  checkItems?: CheckItem[];
  z: number;
  createdAt: number;
  pinned?: boolean;
  locked?: boolean; // Khóa cố định vị trí ghi chú chống kéo nhầm
  collapsed?: boolean;
  cluster?: string; // Tên cụm / nhóm ghi chú (VD: "Công việc", "Dự án Alpha", "Game")
  deletedAt?: number; // Thời gian chuyển vào thùng rác
  dueDate?: string; // Hạn chót dạng YYYY-MM-DD
  dueTime?: string; // Giờ hạn chót dạng HH:mm
};

export type CalendarEventCategory = "work" | "personal" | "meeting" | "reminder" | "focus";
export type RecurrenceRule = "none" | "daily" | "weekly" | "monthly" | "weekdays";
export type CalendarViewMode = "month" | "agenda" | "day";

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (24h)
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm (24h)
  allDay?: boolean;
  category: CalendarEventCategory;
  color?: string; // Custom color or theme color key
  reminderMinutesBefore?: number; // 0, 5, 15, 30, 60...
  alarmEnabled?: boolean; // Tự động phát chuông báo thức khi đến giờ
  linkedNoteId?: string; // Liên kết 2 chiều với Sticky Note
  recurrence?: RecurrenceRule;
  completed?: boolean;
  createdAt: number;
  updatedAt?: number;
};

export type CalendarFilter = {
  category?: CalendarEventCategory | "all";
  searchQuery?: string;
  showCompleted?: boolean;
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

export type ProFeatureId =
  | "unlimited_notes"
  | "multi_timers"
  | "pro_themes"
  | "exclusive_skins"
  | "ai_cluster"
  | "pin_lock";

export type ProLicense = {
  isPro: boolean;
  licenseKey?: string;
  activatedAt?: number;
  plan?: "lifetime" | "annual" | "monthly" | "free";
  expiresAt?: number;
};
