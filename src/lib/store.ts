import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sounds } from "./audio";
import { DICTIONARY } from "./i18n";
import type { AlarmSettings, Language, LayoutMode, Note, NoteTint, PetSkin, PipState, Reminder, ThemeId, ToastItem } from "./types";
import { uid } from "./utils";

const SEED_NOTES: Note[] = [
  {
    id: "seed-1",
    body: "Ghi chú số 1: Mục tiêu tuần này 🚀\n- Hoàn thiện ứng dụng Lumen siêu nhẹ\n- Chạy nền tiết kiệm <40MB RAM\n- Tương tác mượt mà cùng chú Cáo",
    x: 12,
    y: 12,
    rot: -1.5,
    tint: "cream",
    z: 2,
    createdAt: 1,
    collapsed: false,
  },
  {
    id: "seed-2",
    body: "Ghi chú số 2: Ý tưởng phát triển 💡\n- Đồng hồ đếm ngược thông minh (COC, nấu ăn)\n- Giao diện Glassmorphism tối giản\n- Phím tắt nhanh Ctrl+Shift+N",
    x: 64,
    y: 10,
    rot: 1.2,
    tint: "sage",
    z: 1,
    createdAt: 2,
    collapsed: false,
  },
  {
    id: "seed-3",
    body: "Chào mừng bạn đến với Lumen! 🦊\nKhông gian ghi chú không gian sống động ngay trên Desktop.\n\n• Nhấp đúp chuột để tạo nhanh note mới\n• Kéo thả tự do di chuyển khắp màn hình",
    x: 36,
    y: 26,
    rot: 0,
    tint: "cream",
    z: 3,
    createdAt: 3,
    collapsed: false,
  },
  {
    id: "seed-4",
    body: "Ghi chú số 3: Tối ưu UI/UX ✨\n- Màn hình trong suốt phủ toàn Desktop\n- Sắp xếp note tự động bằng nút Sắp xếp\n- Âm thanh chuông báo thức rõ ràng",
    x: 18,
    y: 46,
    rot: 1.8,
    tint: "mist",
    z: 4,
    createdAt: 4,
    collapsed: false,
  },
  {
    id: "seed-5",
    body: "Ghi chú số 4: Bạn đồng hành Cáo nhỏ 🐾\n- Vuốt ve & thưởng bánh quy\n- Ném bóng để Cáo chạy đuổi bắt\n- Tự động nhảy múa khi chuông reo",
    x: 62,
    y: 52,
    rot: -1.8,
    tint: "blush",
    z: 5,
    createdAt: 5,
    collapsed: false,
  },
];

const SEED_TIMERS: Reminder[] = [
  {
    id: "timer-1",
    title: "Xây nhà trong COC (Clash of Clans)",
    durationMs: 2 * 3600 * 1000 + 14 * 60 * 1000,
    fireAt: Date.now() + (2 * 3600 * 1000 + 14 * 60 * 1000),
    done: false,
    pinToScreen: true,
  },
];

type LumenState = {
  hydrated: boolean;
  lang: Language;
  theme: ThemeId;
  layout: LayoutMode;
  alwaysOnTop: boolean;
  transparentOverlay: boolean;
  hubOpen: boolean;
  captureOpen: boolean;
  onboarding: boolean;
  notes: Note[];
  reminders: Reminder[];
  toasts: ToastItem[];
  pip: PipState;
  maxZ: number;
  markHydrated: () => void;
  setLang: (lang: Language) => void;
  setTheme: (theme: ThemeId) => void;
  setLayout: (layout: LayoutMode) => void;
  setAlwaysOnTop: (val: boolean) => void;
  setTransparentOverlay: (val: boolean) => void;
  setHubOpen: (open: boolean) => void;
  setCaptureOpen: (open: boolean) => void;
  dismissOnboarding: () => void;
  addNote: (partial?: Partial<Note>) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  toggleNoteCollapse: (id: string) => void;
  toggleNotePin: (id: string) => void;
  tidyNotes: () => void;
  removeNote: (id: string) => void;
  bringNote: (id: string) => void;
  alarmSettings: AlarmSettings;
  activeAlarm: Reminder | null;
  setAlarmSettings: (patch: Partial<AlarmSettings>) => void;
  dismissActiveAlarm: () => void;
  snoozeReminder: (id: string, mins?: number) => void;
  addReminder: (title: string, delayMs: number, pinToScreen?: boolean) => void;
  removeReminder: (id: string) => void;
  togglePinReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  fireReminder: (id: string) => void;
  pushToast: (title: string, body: string) => void;
  dismissToast: (id: string) => void;
  setPip: (patch: Partial<PipState>) => void;
  setPipEnabled: (enabled: boolean) => void;
  setPipSkin: (skin: PetSkin) => void;
  feedPip: () => void;
  petPip: () => void;
  dancePip: () => void;
  toggleSound: (enabled?: boolean) => void;
  requestNoteFromPip: () => void;
  resetDemo: () => void;
};

function emptyPip(): PipState {
  return {
    enabled: true,
    petType: "fox",
    mood: "wander",
    skin: "classic",
    hat: "none",
    bodyItem: "backpack",
    happiness: 92,
    energy: 95,
    treatsEaten: 0,
    soundEnabled: true,
    x: 50,
    y: 50,
    facing: -1,
    carrying: false,
    moving: false,
    speech: null,
  };
}

export const useLumen = create<LumenState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      lang: "vi",
      theme: "ink",
      layout: "stickies",
      alwaysOnTop: true,
      transparentOverlay: true,
      hubOpen: false,
      captureOpen: false,
      onboarding: true,
      notes: SEED_NOTES,
      reminders: SEED_TIMERS,
      toasts: [],
      pip: emptyPip(),
      maxZ: 5,
      markHydrated: () => set({ hydrated: true }),
      setLang: (lang) => {
        sounds.playPop(560);
        set({ lang });
      },
      setTheme: (theme) => {
        sounds.playPop(600);
        set({ theme });
      },
      setLayout: (layout) => {
        sounds.playPop(520);
        set({ layout });
      },
      setAlwaysOnTop: (alwaysOnTop) => {
        sounds.playPop(500);
        set({ alwaysOnTop });
      },
      setTransparentOverlay: (transparentOverlay) => {
        sounds.playPop(520);
        set({ transparentOverlay });
      },
      setHubOpen: (hubOpen) => {
        sounds.playPop(480);
        set({ hubOpen, captureOpen: hubOpen ? false : get().captureOpen });
      },
      setCaptureOpen: (captureOpen) => {
        sounds.playPop(550);
        set({ captureOpen, hubOpen: captureOpen ? false : get().hubOpen });
      },
      dismissOnboarding: () => set({ onboarding: false }),
      addNote: (partial) => {
        const id = partial?.id ?? uid();
        const z = get().maxZ + 1;
        const note: Note = {
          id,
          body: partial?.body ?? "",
          x: partial?.x ?? 20 + Math.random() * 50,
          y: partial?.y ?? 15 + Math.random() * 45,
          rot: partial?.rot ?? (Math.random() - 0.5) * 4,
          tint: partial?.tint ?? "cream",
          z: partial?.z ?? z,
          createdAt: Date.now(),
          collapsed: false,
          pinned: false,
        };
        sounds.playPop(640);
        set({ notes: [...get().notes, note], maxZ: z });
        return id;
      },
      updateNote: (id, patch) =>
        set({ notes: get().notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }),
      toggleNoteCollapse: (id) => {
        sounds.playPop(580);
        set({
          notes: get().notes.map((n) => (n.id === id ? { ...n, collapsed: !n.collapsed } : n)),
        });
      },
      toggleNotePin: (id) => {
        sounds.playPop(600);
        set({
          notes: get().notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        });
      },
      tidyNotes: () => {
        sounds.playChime();
        const notes = get().notes;
        const updated = notes.map((n, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return {
            ...n,
            x: 60 + col * 12,
            y: 12 + row * 22,
            rot: 0,
            collapsed: false,
          };
        });
        set({ notes: updated });
        const isVi = get().lang === "vi";
        get().pushToast(
          isVi ? "Đã sắp xếp ghi chú" : "Notes Organized",
          isVi ? "Tất cả ghi chú đã được gom lại ngay ngắn" : "All notes gathered neatly",
        );
      },
      removeNote: (id) => {
        sounds.playPop(380);
        set({ notes: get().notes.filter((n) => n.id !== id) });
      },
      bringNote: (id) => {
        const z = get().maxZ + 1;
        set({
          notes: get().notes.map((n) => (n.id === id ? { ...n, z } : n)),
          maxZ: z,
        });
      },
      addReminder: (title, delayMs, pinToScreen = false) => {
        sounds.playChime();
        const item: Reminder = {
          id: uid(),
          title,
          durationMs: delayMs,
          fireAt: Date.now() + delayMs,
          done: false,
          pinToScreen,
        };
        set({
          reminders: [...get().reminders, item],
        });
        const isVi = get().lang === "vi";
        get().pushToast(
          isVi ? "Đã đặt hẹn giờ" : "Timer Set",
          `⏰ ${title} (${Math.round(delayMs / 60000)}m)`,
        );
      },
      removeReminder: (id) => {
        sounds.playPop(380);
        set({ reminders: get().reminders.filter((r) => r.id !== id) });
      },
      togglePinReminder: (id) => {
        sounds.playPop(520);
        set({
          reminders: get().reminders.map((r) =>
            r.id === id ? { ...r, pinToScreen: !r.pinToScreen } : r,
          ),
        });
      },
      alarmSettings: {
        volume: 100,
        tone: "bell_arpeggio",
        loopIntervalSec: 3,
      },
      activeAlarm: null,
      setAlarmSettings: (patch) => {
        set({ alarmSettings: { ...get().alarmSettings, ...patch } });
      },
      dismissActiveAlarm: () => {
        sounds.stopAlarmLoop();
        sounds.playPop(500);
        set({ activeAlarm: null });
      },
      snoozeReminder: (id, mins = 5) => {
        sounds.stopAlarmLoop();
        sounds.playPop(520);
        const newFireAt = Date.now() + mins * 60 * 1000;
        set({
          reminders: get().reminders.map((r) =>
            r.id === id
              ? { ...r, fireAt: newFireAt, done: false, durationMs: mins * 60 * 1000 }
              : r,
          ),
          activeAlarm: null,
        });
        const isVi = get().lang === "vi";
        get().pushToast(
          isVi ? "Báo lại sau 5 phút" : "Snoozed 5m",
          isVi ? "Sẽ báo lại chuông sau 5 phút nữa" : "Will alarm again in 5 minutes",
        );
      },
      completeReminder: (id) => {
        sounds.stopAlarmLoop();
        sounds.playChime();
        set({
          reminders: get().reminders.map((r) => (r.id === id ? { ...r, done: true } : r)),
          activeAlarm: get().activeAlarm?.id === id ? null : get().activeAlarm,
        });
      },
      fireReminder: (id) => {
        const r = get().reminders.find((x) => x.id === id);
        if (!r || r.done) return;
        set({
          reminders: get().reminders.map((x) => (x.id === id ? { ...x, done: true } : x)),
          activeAlarm: r,
        });
        const tone = get().alarmSettings?.tone || "bell_arpeggio";
        const vol = get().alarmSettings?.volume ?? 100;
        sounds.startAlarmLoop(tone, vol);
        const currentLang = get().lang;
        get().pushToast("⏰ " + r.title, currentLang === "vi" ? "ĐÃ HẾT GIỜ! Bấm để tắt chuông." : "TIME UP! Click to dismiss.");
        if (get().pip.enabled) {
          get().setPip({
            mood: "dance",
            happiness: 100,
            speech: `⏰ ${r.title} ${currentLang === "vi" ? "đã xong rồi nè!" : "is finished!"}`,
          });
        }
      },
      pushToast: (title, body) => {
        const toast: ToastItem = { id: uid(), title, body, createdAt: Date.now() };
        set({ toasts: [...get().toasts.slice(-3), toast] });
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
      setPip: (patch) => set({ pip: { ...get().pip, ...patch } }),
      setPipEnabled: (enabled) =>
        set({
          pip: {
            ...get().pip,
            enabled,
            mood: enabled ? "wander" : "idle",
            speech: enabled ? (get().lang === "vi" ? "Xin chào bạn!" : "Hello!") : null,
            carrying: false,
            moving: false,
          },
        }),
      setPipSkin: (skin) => {
        sounds.playPop(580);
        set({ pip: { ...get().pip, skin } });
      },
      feedPip: () => {
        const p = get().pip;
        sounds.playSnack();
        const dict = DICTIONARY[get().lang];
        set({
          pip: {
            ...p,
            mood: "eating",
            happiness: Math.min(100, p.happiness + 8),
            energy: Math.min(100, p.energy + 10),
            treatsEaten: p.treatsEaten + 1,
            speech: dict.toasts.berrySpeech,
          },
        });
      },
      petPip: () => {
        const p = get().pip;
        sounds.playPurr();
        const dict = DICTIONARY[get().lang];
        set({
          pip: {
            ...p,
            mood: "dance",
            happiness: Math.min(100, p.happiness + 5),
            speech: dict.toasts.purrSpeech,
          },
        });
      },
      dancePip: () => {
        const p = get().pip;
        sounds.playChime();
        const dict = DICTIONARY[get().lang];
        set({
          pip: {
            ...p,
            mood: "dance",
            happiness: 100,
            speech: dict.toasts.danceSpeech,
          },
        });
      },
      toggleSound: (val) => {
        const next = val ?? !get().pip.soundEnabled;
        sounds.setEnabled(next);
        set({ pip: { ...get().pip, soundEnabled: next } });
      },
      requestNoteFromPip: () => {
        const { pip } = get();
        if (!pip.enabled) {
          get().setCaptureOpen(true);
          return;
        }
        if (pip.mood === "fetch" || pip.mood === "deliver") return;
        sounds.playPop(500);
        const dict = DICTIONARY[get().lang];
        get().setPip({ mood: "fetch", speech: dict.toasts.onIt, carrying: false });
      },
      resetDemo: () =>
        set({
          lang: "vi",
          theme: "ink",
          layout: "stickies",
          alwaysOnTop: true,
          transparentOverlay: true,
          hubOpen: false,
          captureOpen: false,
          onboarding: true,
          notes: SEED_NOTES,
          reminders: SEED_TIMERS,
          toasts: [],
          pip: emptyPip(),
          maxZ: 5,
        }),
    }),
    {
      name: "lumen-demo-v1",
      skipHydration: true,
      partialize: (s) => ({
        lang: s.lang,
        theme: s.theme,
        layout: s.layout,
        alwaysOnTop: s.alwaysOnTop,
        transparentOverlay: s.transparentOverlay,
        onboarding: s.onboarding,
        notes: s.notes,
        reminders: s.reminders,
        pip: {
          ...s.pip,
          mood: "wander" as const,
          carrying: false,
          speech: null,
          moving: false,
        },
        maxZ: s.maxZ,
      }),
    },
  ),
);

export const NOTE_TINTS: { id: NoteTint; label: string }[] = [
  { id: "cream", label: "Cream" },
  { id: "mist", label: "Mist" },
  { id: "sage", label: "Sage" },
  { id: "blush", label: "Blush" },
  { id: "neon", label: "Neon" },
  { id: "dark", label: "Dark" },
  { id: "glass", label: "Glass" },
];

export const PET_SKINS: { id: PetSkin; name: string; bodyColor: string; shadeColor: string; eyeColor: string }[] = [
  { id: "classic", name: "Classic Mochi", bodyColor: "#f3eee4", shadeColor: "#d6cfc3", eyeColor: "#1c1917" },
  { id: "matcha", name: "Matcha Sprite", bodyColor: "#dceadb", shadeColor: "#b2cfb0", eyeColor: "#182c18" },
  { id: "amber", name: "Amber Fox", bodyColor: "#fbe4c8", shadeColor: "#e6be94", eyeColor: "#452410" },
  { id: "cyber", name: "Cyber Neon", bodyColor: "#d4f4fa", shadeColor: "#93dfec", eyeColor: "#083344" },
  { id: "obsidian", name: "Obsidian Void", bodyColor: "#333b47", shadeColor: "#1e2430", eyeColor: "#f1f5f9" },
];
