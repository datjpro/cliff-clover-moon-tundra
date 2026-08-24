import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sounds } from "./audio";
import type { LayoutMode, Note, NoteTint, PetSkin, PipState, Reminder, ThemeId, ToastItem } from "./types";
import { uid } from "./utils";

const SEED_NOTES: Note[] = [
  {
    id: "seed-1",
    body: "🐾 Meet Pip! Click the companion to pet, feed snacks, or ask for a fresh note.",
    x: 12,
    y: 18,
    rot: -2.4,
    tint: "cream",
    z: 2,
    createdAt: 1,
  },
  {
    id: "seed-2",
    body: "🎨 Switch themes & pet skins in the Hub (Ink, Paper, Glass, Moss).\nTry Cyber or Matcha Pip!",
    x: 38,
    y: 42,
    rot: 1.8,
    tint: "mist",
    z: 1,
    createdAt: 2,
  },
  {
    id: "seed-3",
    body: "⚡ Quick capture: Ctrl + Shift + N\n(or click the paper stack)",
    x: 62,
    y: 16,
    rot: -1.1,
    tint: "sage",
    z: 3,
    createdAt: 3,
  },
];

type LumenState = {
  hydrated: boolean;
  theme: ThemeId;
  layout: LayoutMode;
  hubOpen: boolean;
  captureOpen: boolean;
  onboarding: boolean;
  notes: Note[];
  reminders: Reminder[];
  toasts: ToastItem[];
  pip: PipState;
  maxZ: number;
  markHydrated: () => void;
  setTheme: (theme: ThemeId) => void;
  setLayout: (layout: LayoutMode) => void;
  setHubOpen: (open: boolean) => void;
  setCaptureOpen: (open: boolean) => void;
  dismissOnboarding: () => void;
  addNote: (partial?: Partial<Note>) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
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
    happiness: 88,
    energy: 92,
    treatsEaten: 0,
    soundEnabled: true,
    x: 72,
    y: 58,
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
      theme: "ink",
      layout: "stickies",
      hubOpen: false,
      captureOpen: false,
      onboarding: true,
      notes: SEED_NOTES,
      reminders: [],
      toasts: [],
      pip: emptyPip(),
      maxZ: 4,
      markHydrated: () => set({ hydrated: true }),
      setTheme: (theme) => {
        sounds.playPop(600);
        set({ theme });
      },
      setLayout: (layout) => {
        sounds.playPop(520);
        set({ layout });
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
          x: partial?.x ?? 28 + Math.random() * 24,
          y: partial?.y ?? 22 + Math.random() * 18,
          rot: partial?.rot ?? (Math.random() - 0.5) * 4,
          tint: partial?.tint ?? "cream",
          z: partial?.z ?? z,
          createdAt: Date.now(),
        };
        sounds.playPop(640);
        set({ notes: [...get().notes, note], maxZ: z });
        return id;
      },
      updateNote: (id, patch) =>
        set({ notes: get().notes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }),
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
        get().pushToast("Reminder", r.title);
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
            speech: enabled ? "Hello!" : null,
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
        set({
          pip: {
            ...p,
            mood: "eating",
            happiness: Math.min(100, p.happiness + 8),
            energy: Math.min(100, p.energy + 10),
            treatsEaten: p.treatsEaten + 1,
            speech: "Nom nom! Delicious berry 🍓",
          },
        });
      },
      petPip: () => {
        const p = get().pip;
        sounds.playPurr();
        set({
          pip: {
            ...p,
            mood: "dance",
            happiness: Math.min(100, p.happiness + 5),
            speech: "Purrrr~ ❤️ (*happy purrs*)",
          },
        });
      },
      dancePip: () => {
        const p = get().pip;
        sounds.playChime();
        set({
          pip: {
            ...p,
            mood: "dance",
            happiness: 100,
            speech: "✨ Wheee! (*spins joyfully*)",
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
        get().setPip({ mood: "fetch", speech: "Fetching a fresh note for you!", carrying: false });
      },
      resetDemo: () =>
        set({
          theme: "ink",
          layout: "stickies",
          hubOpen: false,
          captureOpen: false,
          onboarding: true,
          notes: SEED_NOTES,
          reminders: [
            {
              id: uid(),
              title: "Stand up and stretch",
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
        theme: s.theme,
        layout: s.layout,
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
