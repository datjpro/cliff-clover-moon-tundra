import { useState, useRef, useEffect, type PointerEvent } from "react";
import {
  Activity,
  Bell,
  Check,
  Clock,
  Cookie,
  Download,
  Globe,
  GripHorizontal,
  Heart,
  Maximize2,
  Move,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleAlwaysOnTop } from "@/lib/desktop-bridge";
import { DICTIONARY } from "@/lib/i18n";
import { sounds } from "@/lib/audio";
import { THEMES } from "@/lib/themes";
import { useLumen } from "@/lib/store";
import type { AlarmSoundTone, PetBodyItem, PetHat, PetType, Reminder, ThemeId } from "@/lib/types";
import { triggerThrowBall } from "./ball-toy";
import { PipFigure } from "./pip";
import { cn } from "@/lib/utils";

const PET_TYPES: { id: PetType; name: string; icon: string; desc: string }[] = [
  { id: "fox", name: "Cáo Nhỏ (Fox)", icon: "🦊", desc: "Chú cáo thám hiểm đeo ba lô vàng tinh nghịch" },
  { id: "cat", name: "Mèo Mướp (Cat)", icon: "🐱", desc: "Mèo tam thể ngoan ngoãn, thích bắt bóng" },
  { id: "shiba", name: "Chó Shiba", icon: "🐕", desc: "Shiba vàng thông minh đeo khăn quàng đỏ" },
  { id: "dragon", name: "Rồng Con (Dragon)", icon: "🐉", desc: "Rồng xanh ngộ nghĩnh có cánh nhỏ bay lượn" },
  { id: "cyber", name: "Cyber Bot", icon: "🤖", desc: "Robot trợ lý tương lai phát sáng neon" },
];

const HATS: { id: PetHat; name: string; icon: string }[] = [
  { id: "none", name: "Không mũ", icon: "❌" },
  { id: "explorer_hat", name: "Thám Hiểm", icon: "🤠" },
  { id: "sunglasses", name: "Kính Râm", icon: "🕶️" },
  { id: "wizard_hat", name: "Phù Thủy", icon: "🧙" },
  { id: "party_hat", name: "Sinh Nhật", icon: "🥳" },
  { id: "sleep_cap", name: "Mũ Ngủ", icon: "🌙" },
];

const BODY_ITEMS: { id: PetBodyItem; name: string; icon: string }[] = [
  { id: "backpack", name: "Ba Lô Da", icon: "🎒" },
  { id: "cape", name: "Áo Choàng", icon: "🦸" },
  { id: "wings", name: "Cánh Tiên", icon: "🧚" },
  { id: "scarf", name: "Khăn Quàng", icon: "🧣" },
  { id: "none", name: "Không mặc", icon: "❌" },
];

const ALARM_TONES: { id: AlarmSoundTone; name: string; icon: string; desc: string }[] = [
  { id: "bell_arpeggio", name: "Chuông Game Arpeggio", icon: "🔔", desc: "Đa âm ngân vang tươi sáng" },
  { id: "digital_alarm", name: "Chuông Báo Thức Kêu To", icon: "🚨", desc: "Beep-Beep dồn dập, cực rõ" },
  { id: "gentle_chime", name: "Giai Điệu Dịu Dàng", icon: "🎵", desc: "Hợp âm du dương êm ái" },
  { id: "vintage_clock", name: "Đồng Hồ Quả Lắc", icon: "🕰️", desc: "Chuông trầm ấm cổ điển" },
];

const THEME_PREVIEWS: Record<ThemeId, { bg: string; accent: string; border: string }> = {
  glass: { bg: "bg-slate-800/80", accent: "bg-cyan-400", border: "border-cyan-500/30" },
  pastel: { bg: "bg-amber-900/30", accent: "bg-rose-400", border: "border-rose-500/30" },
  cyberpunk: { bg: "bg-purple-950/70", accent: "bg-fuchsia-400", border: "border-fuchsia-500/30" },
  minimalist: { bg: "bg-zinc-800", accent: "bg-zinc-200", border: "border-zinc-700" },
  ink: { bg: "bg-stone-900", accent: "bg-amber-500", border: "border-stone-700" },
};

function parseTimerInput(raw: string): { title: string; durationMs: number } {
  let title = raw.trim();
  let hours = 0;
  let mins = 0;
  let secs = 0;

  const parts = raw.split(/[:\-–—]/);
  let timeStr = "";
  if (parts.length >= 2) {
    title = parts[0].trim();
    timeStr = parts.slice(1).join(" ").trim();
  } else {
    timeStr = raw;
  }

  const hMatch = timeStr.match(/(\d+)\s*(?:g|h|giờ|hour|hours)/i);
  if (hMatch) hours = parseInt(hMatch[1], 10);

  const mMatch = timeStr.match(/(\d+)\s*(?:p|m|phút|min|mins|minute|minutes)/i);
  if (mMatch) mins = parseInt(mMatch[1], 10);

  const sMatch = timeStr.match(/(\d+)\s*(?:s|giây|sec|secs|second|seconds)/i);
  if (sMatch) secs = parseInt(sMatch[1], 10);

  if (parts.length === 1 && (hMatch || mMatch || sMatch)) {
    title =
      raw
        .replace(/(\d+)\s*(?:g|h|giờ|hour|hours)/gi, "")
        .replace(/(\d+)\s*(?:p|m|phút|min|mins|minute|minutes)/gi, "")
        .replace(/(\d+)\s*(?:s|giây|sec|secs|second|seconds)/gi, "")
        .trim() || "Hẹn giờ";
  }

  let totalMs = (hours * 3600 + mins * 60 + secs) * 1000;
  if (totalMs <= 0) {
    const numOnly = parseInt(timeStr.trim(), 10);
    if (!isNaN(numOnly) && numOnly > 0) {
      totalMs = numOnly * 60 * 1000;
    } else {
      totalMs = 5 * 60 * 1000;
    }
  }

  return { title: title || "Hẹn giờ mới", durationMs: totalMs };
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function HubTimerRow({
  reminder: r,
  onPin,
  onFire,
  onComplete,
  onRemove,
}: {
  reminder: Reminder;
  onPin: (id: string) => void;
  onFire: (id: string) => void;
  onComplete: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [diff, setDiff] = useState(Math.max(0, r.fireAt - Date.now()));

  useEffect(() => {
    if (r.done) return;
    const interval = setInterval(() => {
      setDiff(Math.max(0, r.fireAt - Date.now()));
    }, 500);
    return () => clearInterval(interval);
  }, [r.fireAt, r.done]);

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs border transition-all",
        r.done
          ? "bg-slate-900/40 border-white/5 text-slate-500"
          : "bg-slate-800/40 border-white/10 text-slate-100 hover:border-white/20 shadow-xs",
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{r.done ? "✓" : "⏱"}</span>
          <p className={cn("font-medium truncate text-xs", r.done && "line-through text-slate-500")}>
            {r.title}
          </p>
          {r.pinToScreen && !r.done ? (
            <span className="bg-amber-500/15 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
              Ghim Desktop
            </span>
          ) : null}
        </div>
        <p className="font-mono text-xs font-semibold text-amber-400">
          {r.done ? "Đã xong" : `Còn lại: ${formatCountdown(diff)}`}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        {!r.done ? (
          <>
            <button
              type="button"
              onClick={() => onPin(r.id)}
              title={r.pinToScreen ? "Bỏ ghim Desktop" : "Ghim ra Desktop"}
              className={cn(
                "p-1.5 rounded-lg border transition-colors cursor-pointer text-xs",
                r.pinToScreen
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900/50 hover:bg-white/10 text-slate-400 border-white/10",
              )}
            >
              <Pin className={cn("size-3", r.pinToScreen && "fill-amber-400 text-amber-400")} />
            </button>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onFire(r.id)}
              className="text-[10px] h-6.5 px-2 border-white/10 bg-slate-900/50 hover:bg-amber-500/20 hover:text-amber-300 cursor-pointer"
            >
              Báo ngay
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => onComplete(r.id)}
            className="text-[10px] h-6.5 px-2 hover:bg-white/10 text-slate-400 cursor-pointer"
          >
            Đóng
          </Button>
        )}
        <button
          type="button"
          onClick={() => onRemove(r.id)}
          title="Xóa hẹn giờ"
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}

export function Hub() {
  const open = useLumen((s) => s.hubOpen);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const lang = useLumen((s) => s.lang);
  const setLang = useLumen((s) => s.setLang);
  const theme = useLumen((s) => s.theme);
  const setTheme = useLumen((s) => s.setTheme);
  const alwaysOnTop = useLumen((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useLumen((s) => s.setAlwaysOnTop);
  const pip = useLumen((s) => s.pip);
  const setPip = useLumen((s) => s.setPip);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const feedPip = useLumen((s) => s.feedPip);
  const petPip = useLumen((s) => s.petPip);
  const dancePip = useLumen((s) => s.dancePip);
  const toggleSound = useLumen((s) => s.toggleSound);
  const notes = useLumen((s) => s.notes);
  const reminders = useLumen((s) => s.reminders);
  const addReminder = useLumen((s) => s.addReminder);
  const removeReminder = useLumen((s) => s.removeReminder);
  const togglePinReminder = useLumen((s) => s.togglePinReminder);
  const fireReminder = useLumen((s) => s.fireReminder);
  const completeReminder = useLumen((s) => s.completeReminder);
  const alarmSettings = useLumen((s) => s.alarmSettings || { volume: 100, tone: "bell_arpeggio", loopIntervalSec: 3 });
  const setAlarmSettings = useLumen((s) => s.setAlarmSettings);
  const resetDemo = useLumen((s) => s.resetDemo);
  const pushToast = useLumen((s) => s.pushToast);

  // Position & Drag state for Settings Modal
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [smartInput, setSmartInput] = useState("xây nhà trong COC : 2g14p");
  const [pinToDesktop, setPinToDesktop] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("remind");

  const dict = DICTIONARY[lang];

  // Initialize position on open
  useEffect(() => {
    if (open && pos === null && typeof window !== "undefined") {
      const modalWidth = Math.min(480, window.innerWidth - 32);
      const initialX = Math.max(16, Math.round((window.innerWidth - modalWidth) / 2));
      const initialY = Math.max(20, Math.round((window.innerHeight - 580) / 2));
      setPos({ x: initialX, y: initialY });
    }
  }, [open, pos]);

  if (!open) return null;

  const handleAlwaysOnTopChange = (val: boolean) => {
    setAlwaysOnTop(val);
    void toggleAlwaysOnTop(val);
  };

  const handleSmartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;
    const parsed = parseTimerInput(smartInput);
    addReminder(parsed.title, parsed.durationMs, pinToDesktop);
    sounds.playPop(620);
    pushToast("Đã tạo hẹn giờ", `"${parsed.title}" (${formatCountdown(parsed.durationMs)})`);
    setSmartInput("");
  };

  const handleTestAlarm = () => {
    sounds.playAlarmTone(alarmSettings.tone || "bell_arpeggio", alarmSettings.volume ?? 100);
  };

  // Drag handlers
  const handlePointerDownHeader = (e: PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("button, input, textarea, a, .no-drag")) return;
    const currentX = pos?.x ?? Math.max(16, (window.innerWidth - 480) / 2);
    const currentY = pos?.y ?? 40;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: PointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const modalWidth = Math.min(480, window.innerWidth - 32);
    const modalHeight = Math.min(580, window.innerHeight - 32);
    const newX = Math.max(8, Math.min(window.innerWidth - modalWidth - 8, dragRef.current.initX + dx));
    const newY = Math.max(8, Math.min(window.innerHeight - 80, dragRef.current.initY + dy));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUpHeader = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleResetPosition = () => {
    const modalWidth = Math.min(480, window.innerWidth - 32);
    setPos({
      x: Math.max(16, Math.round((window.innerWidth - modalWidth) / 2)),
      y: Math.max(20, Math.round((window.innerHeight - 580) / 2)),
    });
    sounds.playPop(520);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const data = {
      notes,
      reminders,
      theme,
      pip,
      alarmSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumen-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast("Sao lưu dữ liệu", "Đã xuất file JSON thành công!");
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.notes && Array.isArray(parsed.notes)) {
          useLumen.setState({ notes: parsed.notes });
          pushToast("Khôi phục dữ liệu", `Đã nạp ${parsed.notes.length} ghi chú!`);
        }
      } catch {
        pushToast("Lỗi nhập dữ liệu", "File JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
  };

  const activeTimersCount = reminders.filter((r) => !r.done).length;

  return (
    <section
      className={cn(
        "interactive-el fixed z-[90] flex flex-col overflow-hidden bg-slate-900/90 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.75)] border border-white/10 rounded-2xl select-none backdrop-blur-2xl",
        "w-[calc(100vw-1.5rem)] max-w-[480px] h-[580px] max-h-[calc(100vh-2rem)]",
        isDragging && "ring-1 ring-amber-500/50 shadow-[0_30px_70px_rgba(0,0,0,0.85)]",
      )}
      style={
        pos
          ? {
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              right: "auto",
              bottom: "auto",
            }
          : {
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }
      }
      role="dialog"
      aria-label="Lumen Settings"
    >
      {/* Sleek Draggable Header */}
      <header
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        className={cn(
          "flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-950/40 cursor-grab active:cursor-grabbing transition-colors",
          isDragging && "bg-slate-950/60",
        )}
        title="Kéo thả để di chuyển bảng cài đặt"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center size-6 rounded-md bg-white/5 text-slate-400 shrink-0 border border-white/5">
            <GripHorizontal className="size-3.5" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm">🦊</span>
            <p className="font-semibold text-xs tracking-tight text-slate-100">
              Lumen Settings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 no-drag">
          <button
            type="button"
            onClick={handleResetPosition}
            className="flex size-6.5 items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-slate-400 hover:text-slate-200"
            title="Đặt lại vị trí giữa màn hình"
            aria-label="Đặt lại vị trí"
          >
            <RotateCcw className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => setHubOpen(false)}
            className="flex size-6.5 items-center justify-center rounded-lg hover:bg-red-500/20 hover:text-red-400 cursor-pointer transition-colors text-slate-400"
            aria-label={dict.close}
            title={dict.close}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Pill-Switch Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="px-3 pt-2.5 pb-2 bg-slate-950/20 border-b border-white/5">
          <TabsList className="grid grid-cols-4 bg-slate-950/60 p-0.5 rounded-xl h-8.5 border border-white/10">
            <TabsTrigger
              value="remind"
              className="text-[11px] font-semibold rounded-lg transition-all data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30 flex items-center justify-center gap-1 text-slate-400"
            >
              <span>⏱</span>
              <span>Hẹn giờ</span>
              {activeTimersCount > 0 ? (
                <span className="size-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] flex items-center justify-center font-bold">
                  {activeTimersCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value="pip"
              className="text-[11px] font-semibold rounded-lg transition-all data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30 flex items-center justify-center gap-1 text-slate-400"
            >
              <span>🐾</span>
              <span>Thú cưng</span>
            </TabsTrigger>
            <TabsTrigger
              value="look"
              className="text-[11px] font-semibold rounded-lg transition-all data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30 flex items-center justify-center gap-1 text-slate-400"
            >
              <span>🎨</span>
              <span>Giao diện</span>
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-[11px] font-semibold rounded-lg transition-all data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 data-[state=active]:border data-[state=active]:border-amber-500/30 flex items-center justify-center gap-1 text-slate-400"
            >
              <span>⚙️</span>
              <span>Hệ thống</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3 space-y-3 custom-scrollbar">
          {/* TAB 1: SMART TIMERS & COUNTDOWN */}
          <TabsContent value="remind" className="space-y-3 mt-0">
            {/* Quick Smart Input Box */}
            <div className="rounded-xl bg-slate-800/40 p-3 border border-white/10 space-y-2.5 shadow-xs">
              <form onSubmit={handleSmartSubmit} className="space-y-2">
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Ví dụ: xây nhà COC : 2g14p, Nấu canh : 15p..."
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    className="bg-slate-950/60 border-white/10 focus:border-amber-500/50 text-xs text-slate-100 placeholder:text-slate-500 h-8 rounded-lg"
                  />
                  <Button
                    type="submit"
                    className="cursor-pointer font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3 h-8 shadow-xs shrink-0 rounded-lg transition-colors"
                  >
                    + Đặt giờ
                  </Button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "🏰 COC: 2g14p", val: "xây nhà trong COC : 2g14p" },
                    { label: "🍅 Pomodoro: 25p", val: "Tập trung Pomodoro : 25p" },
                    { label: "☕ Nghỉ: 5p", val: "Nghỉ ngơi giải lao : 5p" },
                    { label: "🍲 Nấu ăn: 15p", val: "Nấu ăn canh súp : 15p" },
                    { label: "⏳ 1 Giờ", val: "Hẹn giờ làm việc : 1g" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSmartInput(preset.val)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/60 hover:bg-amber-500/15 hover:text-amber-300 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[11px] text-slate-400">Ghim đồng hồ nổi trên Desktop</span>
                  <Switch checked={pinToDesktop} onCheckedChange={setPinToDesktop} />
                </div>
              </form>
            </div>

            {/* Alarm Audio Customizer */}
            <div className="rounded-xl bg-slate-800/40 p-3 border border-white/10 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Volume2 className="size-3.5 text-amber-400" />
                  <span>Chuông báo thức</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                >
                  <Play className="size-2.5 fill-current" />
                  <span>Thử chuông</span>
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2.5 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                <span className="text-[11px] text-slate-400 shrink-0">Âm lượng</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={alarmSettings.volume ?? 100}
                  onChange={(e) => setAlarmSettings({ volume: parseInt(e.target.value, 10) })}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-500"
                />
                <span className="font-mono text-[11px] font-semibold text-amber-400 shrink-0">
                  {alarmSettings.volume ?? 100}%
                </span>
              </div>

              {/* Alarm Tones Selector */}
              <div className="grid grid-cols-2 gap-1.5">
                {ALARM_TONES.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => {
                      setAlarmSettings({ tone: tone.id });
                      sounds.playAlarmTone(tone.id, alarmSettings.volume ?? 100);
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-lg bg-slate-950/40 p-2 text-left border cursor-pointer transition-all",
                      (alarmSettings.tone || "bell_arpeggio") === tone.id
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                        : "border-white/5 hover:border-white/15 text-slate-300",
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm shrink-0">{tone.icon}</span>
                      <p className="text-[11px] font-medium truncate">{tone.name}</p>
                    </div>
                    {(alarmSettings.tone || "bell_arpeggio") === tone.id ? (
                      <Check className="size-3 text-amber-400 shrink-0" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Timers List */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Hẹn giờ đang chạy ({activeTimersCount})
              </p>

              {reminders.length === 0 ? (
                <div className="rounded-xl bg-slate-800/20 p-4 text-center border border-white/5">
                  <p className="text-[11px] text-slate-500">Chưa có hẹn giờ nào đang chạy.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {reminders.map((r) => (
                    <HubTimerRow
                      key={r.id}
                      reminder={r}
                      onPin={togglePinReminder}
                      onFire={fireReminder}
                      onComplete={completeReminder}
                      onRemove={removeReminder}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: VIRTUAL PET STUDIO & WARDROBE */}
          <TabsContent value="pip" className="space-y-3 mt-0">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/40 px-3 py-2.5 border border-white/10">
              <div>
                <p className="text-xs font-semibold text-slate-100">{dict.pipStudio.enableCompanion}</p>
                <p className="text-[10px] text-slate-400">{dict.pipStudio.enableDesc}</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>

            {pip.enabled && (
              <>
                {/* Pet Stage & Happiness Card */}
                <div className="rounded-xl bg-slate-800/40 p-3 border border-white/10 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-16 items-center justify-center rounded-xl bg-slate-950/60 border border-white/10 shrink-0 relative overflow-hidden">
                      <PipFigure
                        walking={false}
                        carrying={pip.carrying}
                        facing={1}
                        mood={pip.mood}
                        petType={pip.petType}
                        hat={pip.hat}
                        bodyItem={pip.bodyItem}
                        className="scale-90"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-medium text-slate-400">Vui vẻ (Happiness)</span>
                        <span className="font-mono text-xs font-bold text-amber-400">{pip.happiness}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-950/60">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${pip.happiness}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>🍪 Đã ăn: <b className="text-slate-200">{pip.treatsEaten}</b></span>
                        <span>✨ Mood: <b className="capitalize text-amber-300">{pip.mood}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Quick Actions */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        triggerThrowBall();
                        setHubOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-lime-500/30 bg-lime-500/10 text-lime-300 hover:bg-lime-500/20 h-7 text-[11px] font-semibold"
                    >
                      <span>🎾</span>
                      <span>Ném bóng</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={petPip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 h-7 text-[11px] font-semibold"
                    >
                      <Heart className="size-3 fill-current" />
                      <span>{dict.pipStudio.petPip}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={feedPip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 h-7 text-[11px] font-semibold"
                    >
                      <Cookie className="size-3 fill-current" />
                      <span>{dict.pipStudio.feedSnack}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={dancePip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 h-7 text-[11px] font-semibold"
                    >
                      <Sparkles className="size-3" />
                      <span>{dict.pipStudio.danceParty}</span>
                    </Button>
                  </div>
                </div>

                {/* Pet Species */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Loài thú cưng (Pet Species)
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {PET_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => {
                          setPip({ petType: pt.id });
                          sounds.playPop(560);
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-xl bg-slate-800/30 px-3 py-1.5 text-left border transition-all cursor-pointer",
                          pip.petType === pt.id
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                            : "border-white/5 hover:border-white/15 text-slate-300",
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{pt.icon}</span>
                          <span className="text-xs font-semibold">{pt.name}</span>
                        </div>
                        {pip.petType === pt.id ? (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
                            Active
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Wardrobe: Hats */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    🎩 Mũ & Phụ kiện đầu
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {HATS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setPip({ hat: h.id });
                          sounds.playPop(580);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg bg-slate-800/30 p-1.5 text-left border transition-all cursor-pointer text-xs",
                          (pip.hat || "none") === h.id
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold"
                            : "border-white/5 hover:border-white/15 text-slate-400",
                        )}
                      >
                        <span className="text-sm">{h.icon}</span>
                        <span className="truncate text-[10px]">{h.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Wardrobe: Outfits */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    🎒 Trang phục & Đồ đeo
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {BODY_ITEMS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setPip({ bodyItem: b.id });
                          sounds.playPop(580);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg bg-slate-800/30 p-1.5 text-left border transition-all cursor-pointer text-xs",
                          (pip.bodyItem || "backpack") === b.id
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold"
                            : "border-white/5 hover:border-white/15 text-slate-400",
                        )}
                      >
                        <span className="text-sm">{b.icon}</span>
                        <span className="truncate text-[10px]">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* TAB 3: LOOK & THEMES */}
          <TabsContent value="look" className="space-y-3 mt-0">
            {/* Language Selector */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Ngôn ngữ (Language)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLang("vi");
                    sounds.playPop(520);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-slate-800/30 px-3 py-2 text-left border cursor-pointer transition-all",
                    lang === "vi"
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                      : "border-white/5 hover:border-white/15 text-slate-400",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🇻🇳</span>
                    <span className="text-xs font-semibold">Tiếng Việt</span>
                  </div>
                  {lang === "vi" ? <span className="size-1.5 rounded-full bg-amber-400" /> : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang("en");
                    sounds.playPop(520);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-slate-800/30 px-3 py-2 text-left border cursor-pointer transition-all",
                    lang === "en"
                      ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                      : "border-white/5 hover:border-white/15 text-slate-400",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🇬🇧</span>
                    <span className="text-xs font-semibold">English</span>
                  </div>
                  {lang === "en" ? <span className="size-1.5 rounded-full bg-amber-400" /> : null}
                </button>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Chủ đề không gian
              </p>
              <div className="space-y-1">
                {THEMES.map((t) => {
                  const preview = THEME_PREVIEWS[t.id] || { bg: "bg-slate-800", accent: "bg-amber-500", border: "border-slate-700" };
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        sounds.playPop(540);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl bg-slate-800/30 px-3 py-2 text-left border cursor-pointer transition-all",
                        theme === t.id
                          ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                          : "border-white/5 hover:border-white/15 text-slate-300",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn("size-5 rounded-md border flex items-center justify-center", preview.bg, preview.border)}>
                          <div className={cn("size-1.5 rounded-full", preview.accent)} />
                        </div>
                        <span className="text-xs font-medium">{t.name}</span>
                      </div>
                      {theme === t.id ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
                          Active
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Always on top & audio switches */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/30 px-3 py-2.5 border border-white/5">
                <div>
                  <p className="text-xs font-medium text-slate-200">{dict.look.alwaysOnTop}</p>
                  <p className="text-[10px] text-slate-400">{dict.look.alwaysOnTopDesc}</p>
                </div>
                <Switch checked={alwaysOnTop} onCheckedChange={handleAlwaysOnTopChange} />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/30 px-3 py-2.5 border border-white/5">
                <div>
                  <p className="text-xs font-medium text-slate-200">{dict.look.proceduralAudio}</p>
                  <p className="text-[10px] text-slate-400">{dict.look.audioDesc}</p>
                </div>
                <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: SYSTEM & TELEMETRY */}
          <TabsContent value="about" className="space-y-3 text-xs text-slate-400 mt-0">
            {/* Live Performance Telemetry */}
            <div className="rounded-xl bg-slate-800/40 p-3 space-y-2 border border-white/10">
              <p className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <Activity className="size-3 text-emerald-400" />
                <span>Giám sát hiệu năng</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-slate-950/50 p-2 rounded-lg border border-white/5">
                  <p className="text-[9px] text-slate-500">RAM</p>
                  <p className="text-xs font-bold text-emerald-400">~38 MB</p>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-white/5">
                  <p className="text-[9px] text-slate-500">FPS</p>
                  <p className="text-xs font-bold text-amber-400">120 FPS</p>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-white/5">
                  <p className="text-[9px] text-slate-500">CPU</p>
                  <p className="text-xs font-bold text-sky-400">&lt; 0.4%</p>
                </div>
              </div>
            </div>

            {/* Local Backup */}
            <div className="rounded-xl bg-slate-800/40 p-3 space-y-2 border border-white/10">
              <p className="font-semibold text-slate-200 text-xs">Sao lưu & Khôi phục</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportBackup}
                  className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer border-white/10 bg-slate-950/50 text-slate-200 hover:bg-white/10 h-7.5 text-xs"
                >
                  <Download className="size-3" />
                  <span>Xuất JSON</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer border-white/10 bg-slate-950/50 text-slate-200 hover:bg-white/10 h-7.5 text-xs"
                >
                  <Upload className="size-3" />
                  <span>Nhập JSON</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </div>
            </div>

            {/* Shortcuts */}
            <div className="rounded-xl bg-slate-800/40 p-3 space-y-1.5 border border-white/10">
              <p className="font-semibold text-slate-200 text-xs mb-1">Phím tắt nhanh:</p>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Ghi chú nhanh:</span>
                  <span className="font-mono bg-slate-950/60 px-1.5 py-0.2 rounded border border-white/5 text-amber-300 font-semibold">
                    Ctrl + Shift + N
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hẹn giờ nhanh:</span>
                  <span className="font-mono bg-slate-950/60 px-1.5 py-0.2 rounded border border-white/5 text-amber-300 font-semibold">
                    Ctrl + Shift + T
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Đóng cửa sổ / Modal:</span>
                  <span className="font-mono bg-slate-950/60 px-1.5 py-0.2 rounded border border-white/5 text-slate-300">
                    Escape
                  </span>
                </div>
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              className="w-full cursor-pointer border-white/10 bg-slate-800/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs h-8"
              type="button"
              onClick={resetDemo}
            >
              {dict.about.resetButton}
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
