import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sounds } from "./audio";
import { DICTIONARY } from "./i18n";
import type { Language, LayoutMode, Note, NoteTint, PetSkin, PipState, Reminder, ThemeId, ToastItem } from "./types";
import { uid } from "./utils";

const SEED_NOTES: Note[] = [
  {
    id: "seed-1",
    body: "🐾 Gặp gỡ Pip! Pip có thể đi dạo khắp toàn màn hình máy tính của bạn.",
    x: 8,
    y: 14,
    rot: -2.4,
    tint: "cream",
    z: 2,
    createdAt: 1,
    collapsed: false,
  },
  {
    id: "seed-2",
    body: "🎨 Bàn làm việc trong suốt: Bạn có thể kéo thả giấy ghi chú đặt ở BẤT KỲ ĐÂU trên màn hình!",
    x: 34,
    y: 36,
    rot: 1.8,
    tint: "mist",
    z: 1,
    createdAt: 2,
    collapsed: false,
  },
  {
    id: "seed-3",
    body: "🧹 Nút 'Sắp xếp ghi chú': Bấm vào nút quét dọn trên thanh tiêu đề để thu gọn các note lại ngay ngắn.",
    x: 64,
    y: 16,
    rot: -1.1,
    tint: "sage",
    z: 3,
    createdAt: 3,
    collapsed: false,
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
  addReminder: (title: string, delayMs: number) => void;
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
    mood: "wander",
    skin: "classic",
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
      reminders: [],
      toasts: [],
      pip: emptyPip(),
      maxZ: 4,
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
      addReminder: (title, delayMs) => {
        sounds.playChime();
        set({
          reminders: [
            ...get().reminders,
            { id: uid(), title, fireAt: Date.now() + delayMs, done: false },
          ],
        });
      },
      completeReminder: (id) => {
        sounds.playChime();
        set({
          reminders: get().reminders.map((r) => (r.id === id ? { ...r, done: true } : r)),
        });
      },
      fireReminder: (id) => {
        const r = get().reminders.find((x) => x.id === id);
        if (!r || r.done) return;
        set({
          reminders: get().reminders.map((x) => (x.id === id ? { ...x, done: true } : x)),
        });
        sounds.playChime();
        const currentLang = get().lang;
        const dict = DICTIONARY[currentLang];
        get().pushToast(dict.toasts.reminderTitle, r.title);
        if (get().pip.enabled) {
          get().setPip({ mood: "nudge", speech: `⏰ ${r.title}` });
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
          reminders: [
            {
              id: uid(),
              title: "Đứng dậy vươn vai và uống nước",
              fireAt: Date.now() + 8 * 60 * 1000,
              done: false,
            },
          ],
          toasts: [],
          pip: emptyPip(),
          maxZ: 4,
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
];

export const PET_SKINS: { id: PetSkin; name: string; bodyColor: string; shadeColor: string; eyeColor: string }[] = [
  { id: "classic", name: "Classic Mochi", bodyColor: "#f3eee4", shadeColor: "#d6cfc3", eyeColor: "#1c1917" },
  { id: "matcha", name: "Matcha Sprite", bodyColor: "#dceadb", shadeColor: "#b2cfb0", eyeColor: "#182c18" },
  { id: "amber", name: "Amber Fox", bodyColor: "#fbe4c8", shadeColor: "#e6be94", eyeColor: "#452410" },
  { id: "cyber", name: "Cyber Neon", bodyColor: "#d4f4fa", shadeColor: "#93dfec", eyeColor: "#083344" },
  { id: "obsidian", name: "Obsidian Void", bodyColor: "#333b47", shadeColor: "#1e2430", eyeColor: "#f1f5f9" },
];
