import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sounds } from "./audio";
import { DICTIONARY } from "./i18n";
import type { AlarmSettings, Language, LayoutMode, Note, NoteTint, PetSkin, PipState, ProFeatureId, ProLicense, Reminder, ThemeId, ToastItem } from "./types";
import { uid } from "./utils";

export const FREE_MAX_NOTES = 5;
export const FREE_MAX_TIMERS = 1;

const SEED_NOTES: Note[] = [
  {
    id: "seed-intro",
    body: "Chào mừng bạn đến với Lumen! 🦊\n\nKhông gian ghi chú sống động cùng chú Cáo đồng hành trên Desktop.\n\n• Nhấp đúp vào màn hình để tạo note mới\n• Kéo thả tự do để sắp xếp ghi chú\n• Alt+N: Ghi chú nhanh | Alt+T: Hẹn giờ",
    x: 38,
    y: 25,
    rot: -0.5,
    tint: "cream",
    z: 1,
    createdAt: Date.now(),
    collapsed: false,
    cluster: "Hướng dẫn",
  },
];

const SEED_TIMERS: Reminder[] = [];

type LumenState = {
  hydrated: boolean;
  lang: Language;
  theme: ThemeId;
  layout: LayoutMode;
  alwaysOnTop: boolean;
  transparentOverlay: boolean;
  hubOpen: boolean;
  captureOpen: boolean;
  quickTimerOpen: boolean;
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
  setQuickTimerOpen: (open: boolean) => void;
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
  selectedCluster: string | null;
  setSelectedCluster: (cluster: string | null) => void;
  trashNotes: Note[];
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  highlightNoteId: string | null;
  setHighlightNoteId: (id: string | null) => void;
  toggleNoteLock: (id: string) => void;
  restoreNote: (id: string) => void;
  undoDeleteNote: () => void;
  emptyTrash: () => void;
  permanentDeleteNote: (id: string) => void;
  requestNoteFromPip: () => void;
  resetDemo: () => void;
  appLoaded: boolean;
  setAppLoaded: (loaded: boolean) => void;
  introVideoEnabled: boolean;
  setIntroVideoEnabled: (enabled: boolean) => void;
  setupWizardMode: "install" | "uninstall" | null;
  setSetupWizardMode: (mode: "install" | "uninstall" | null) => void;
  showClusterDock: boolean;
  setShowClusterDock: (show: boolean) => void;
  pro: ProLicense;
  proModalOpen: boolean;
  proModalFeature: ProFeatureId | null;
  setProModalOpen: (open: boolean, feature?: ProFeatureId | null) => void;
  activatePro: (licenseKey: string) => { success: boolean; message: string };
  deactivatePro: () => void;
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
      appLoaded: false,
      setAppLoaded: (appLoaded) => set({ appLoaded }),
      introVideoEnabled: true,
      setIntroVideoEnabled: (introVideoEnabled) => set({ introVideoEnabled }),
      setupWizardMode: null,
      setSetupWizardMode: (setupWizardMode) => set({ setupWizardMode }),
      showClusterDock: true,
      setShowClusterDock: (showClusterDock) => set({ showClusterDock }),
      lang: "vi",
      theme: "ink",
      layout: "stickies",
      alwaysOnTop: true,
      transparentOverlay: true,
      hubOpen: false,
      captureOpen: false,
      quickTimerOpen: false,
      onboarding: false,
      notes: SEED_NOTES,
      reminders: SEED_TIMERS,
      toasts: [],
      pip: emptyPip(),
      maxZ: 5,
      pro: {
        isPro: false,
        plan: "free",
      },
      proModalOpen: false,
      proModalFeature: null,
      setProModalOpen: (proModalOpen, proModalFeature = null) => {
        sounds.playPop(520);
        set({ proModalOpen, proModalFeature });
      },
      activatePro: (licenseKey: string) => {
        const cleaned = licenseKey.trim().toUpperCase();
        if (cleaned.length < 4) {
          return {
            success: false,
            message: get().lang === "vi" ? "Mã bản quyền không hợp lệ" : "Invalid license key format",
          };
        }
        sounds.playChime();
        set({
          pro: {
            isPro: true,
            licenseKey: cleaned,
            activatedAt: Date.now(),
            plan: "lifetime",
          },
          proModalOpen: false,
        });
        return { success: true, message: "OK" };
      },
      deactivatePro: () => {
        sounds.playPop(400);
        set({
          pro: {
            isPro: false,
            plan: "free",
          },
        });
      },
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
        set({
          hubOpen,
          captureOpen: hubOpen ? false : get().captureOpen,
          quickTimerOpen: hubOpen ? false : get().quickTimerOpen,
        });
      },
      setCaptureOpen: (captureOpen) => {
        sounds.playPop(550);
        set({
          captureOpen,
          hubOpen: captureOpen ? false : get().hubOpen,
          quickTimerOpen: captureOpen ? false : get().quickTimerOpen,
        });
      },
      setQuickTimerOpen: (quickTimerOpen) => {
        sounds.playPop(580);
        set({
          quickTimerOpen,
          hubOpen: quickTimerOpen ? false : get().hubOpen,
          captureOpen: quickTimerOpen ? false : get().captureOpen,
        });
      },
      selectedCluster: null,
      setSelectedCluster: (selectedCluster) => {
        sounds.playPop(520);
        set({ selectedCluster });
      },
      trashNotes: [],
      searchOpen: false,
      setSearchOpen: (searchOpen) => {
        sounds.playPop(580);
        set({
          searchOpen,
          hubOpen: searchOpen ? false : get().hubOpen,
          captureOpen: searchOpen ? false : get().captureOpen,
          quickTimerOpen: searchOpen ? false : get().quickTimerOpen,
        });
      },
      highlightNoteId: null,
      setHighlightNoteId: (highlightNoteId) => set({ highlightNoteId }),
      toggleNoteLock: (id) => {
        sounds.playPop(550);
        set({
          notes: get().notes.map((n) => (n.id === id ? { ...n, locked: !n.locked } : n)),
        });
      },
      dismissOnboarding: () => set({ onboarding: false }),
      addNote: (partial) => {
        const pro = get().pro;
        const currentNotes = get().notes;
        const isVi = get().lang === "vi";

        if (!pro.isPro && currentNotes.length >= FREE_MAX_NOTES) {
          get().setProModalOpen(true, "unlimited_notes");
          get().pushToast(
            isVi ? "Đã đạt giới hạn 5 ghi chú miễn phí" : "Free limit reached (5 notes)",
            isVi ? "Nâng cấp Pro để tạo không giới hạn ghi chú!" : "Upgrade to Pro for unlimited notes!",
          );
          return "";
        }

        const id = partial?.id ?? uid();
        const z = get().maxZ + 1;
        const note: Note = {
          id,
          title: partial?.title,
          body: partial?.body ?? "",
          x: partial?.x ?? 20 + Math.random() * 50,
          y: partial?.y ?? 15 + Math.random() * 45,
          width: partial?.width,
          height: partial?.height,
          rot: partial?.rot ?? (Math.random() - 0.5) * 4,
          tint: partial?.tint ?? "cream",
          z: partial?.z ?? z,
          createdAt: Date.now(),
          collapsed: false,
          pinned: false,
          locked: false,
          cluster: partial?.cluster ?? get().selectedCluster ?? undefined,
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
        const target = get().notes.find((n) => n.id === id);
        if (!target) return;
        const deletedNote: Note = { ...target, deletedAt: Date.now() };
        const remainingNotes = get().notes.filter((n) => n.id !== id);
        const updatedTrash = [deletedNote, ...(get().trashNotes || [])].slice(0, 50);
        set({ notes: remainingNotes, trashNotes: updatedTrash });
        const isVi = get().lang === "vi";
        get().pushToast(
          isVi ? "Đã chuyển vào thùng rác" : "Moved to Trash",
          isVi ? `Ghi chú "${target.body.trim().slice(0, 18) || "trống"}..." đã được lưu (Ctrl+Z để hoàn tác)` : `Note saved to trash (Ctrl+Z to undo)`,
        );
      },
      undoDeleteNote: () => {
        const trash = get().trashNotes || [];
        if (trash.length === 0) return;
        const [lastDeleted, ...remainingTrash] = trash;
        const restoredNote: Note = { ...lastDeleted, deletedAt: undefined, z: get().maxZ + 1 };
        set({
          notes: [...get().notes, restoredNote],
          trashNotes: remainingTrash,
          maxZ: get().maxZ + 1,
        });
        sounds.playChime();
        const isVi = get().lang === "vi";
        get().pushToast(
          isVi ? "Đã hoàn tác khôi phục ghi chú" : "Note Restored",
          isVi ? "Ghi chú vừa xóa đã được đưa trở lại màn hình" : "Restored note to canvas",
        );
      },
      restoreNote: (id) => {
        const target = (get().trashNotes || []).find((n) => n.id === id);
        if (!target) return;
        const restoredNote: Note = { ...target, deletedAt: undefined, z: get().maxZ + 1 };
        set({
          notes: [...get().notes, restoredNote],
          trashNotes: (get().trashNotes || []).filter((n) => n.id !== id),
          maxZ: get().maxZ + 1,
        });
        sounds.playChime();
        const isVi = get().lang === "vi";
        get().pushToast(
          isVi ? "Đã khôi phục ghi chú" : "Note Restored",
          isVi ? "Đã đưa ghi chú trở lại không gian làm việc" : "Note restored to workspace",
        );
      },
      permanentDeleteNote: (id) => {
        sounds.playPop(340);
        set({
          trashNotes: (get().trashNotes || []).filter((n) => n.id !== id),
        });
      },
      emptyTrash: () => {
        sounds.playPop(340);
        set({ trashNotes: [] });
        const isVi = get().lang === "vi";
        get().pushToast(
          isVi ? "Đã dọn sạch thùng rác" : "Trash Emptied",
          isVi ? "Đã xóa vĩnh viễn tất cả ghi chú trong thùng rác" : "All trash notes permanently removed",
        );
      },
      bringNote: (id) => {
        const z = get().maxZ + 1;
        set({
          notes: get().notes.map((n) => (n.id === id ? { ...n, z } : n)),
          maxZ: z,
        });
      },
      addReminder: (title, delayMs, pinToScreen = false) => {
        const pro = get().pro;
        const activeTimers = get().reminders.filter((r) => !r.done);
        const isVi = get().lang === "vi";

        if (!pro.isPro && activeTimers.length >= FREE_MAX_TIMERS) {
          get().setProModalOpen(true, "multi_timers");
          get().pushToast(
            isVi ? "Gói Miễn phí chỉ chạy 1 hẹn giờ đồng thời" : "Free tier allows 1 concurrent timer",
            isVi ? "Nâng cấp Pro để chạy không giới hạn đa hẹn giờ!" : "Upgrade to Pro for multi-timer tracking!",
          );
          return;
        }

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
        muted: false,
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
        const isMuted = get().alarmSettings?.muted;
        if (!isMuted) {
          const tone = get().alarmSettings?.tone || "bell_arpeggio";
          const vol = get().alarmSettings?.volume ?? 100;
          sounds.startAlarmLoop(tone, vol);
        }
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
        alarmSettings: s.alarmSettings,
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
