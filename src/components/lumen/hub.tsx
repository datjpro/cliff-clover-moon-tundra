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
  { id: "none", name: "Không đội mũ", icon: "❌" },
  { id: "explorer_hat", name: "Mũ Thám Hiểm", icon: "🤠" },
  { id: "sunglasses", name: "Kính Râm Ngầu", icon: "🕶️" },
  { id: "wizard_hat", name: "Mũ Phù Thủy", icon: "🧙" },
  { id: "party_hat", name: "Mũ Sinh Nhật", icon: "🥳" },
  { id: "sleep_cap", name: "Mũ Ngủ Đêm", icon: "🌙" },
];

const BODY_ITEMS: { id: PetBodyItem; name: string; icon: string }[] = [
  { id: "backpack", name: "Ba Lô Da", icon: "🎒" },
  { id: "cape", name: "Áo Choàng", icon: "🦸" },
  { id: "wings", name: "Cánh Tiên", icon: "🧚" },
  { id: "scarf", name: "Khăn Quàng", icon: "🧣" },
  { id: "none", name: "Không mặc gì", icon: "❌" },
];

const ALARM_TONES: { id: AlarmSoundTone; name: string; icon: string; desc: string }[] = [
  { id: "bell_arpeggio", name: "Chuông Game Ngân Vang", icon: "🔔", desc: "Âm chuông đa âm tươi sáng, ngân vang rộn rã" },
  { id: "digital_alarm", name: "Chuông Báo Thức Kêu To", icon: "🚨", desc: "Tiếng Beep-Beep dồn dập, cực kỳ to và rõ ràng" },
  { id: "gentle_chime", name: "Chuông Giai Điệu Dịu Dàng", icon: "🎵", desc: "Hợp âm du dương êm ái, thư giãn tinh thần" },
  { id: "vintage_clock", name: "Chuông Đồng Hồ Cổ Điển", icon: "🕰️", desc: "Tiếng chuông quả lắc sâu lắng, ấm áp hoài niệm" },
];

const THEME_PREVIEWS: Record<ThemeId, { bg: string; accent: string; border: string }> = {
  glass: { bg: "bg-slate-900/80", accent: "bg-cyan-400", border: "border-cyan-500/30" },
  pastel: { bg: "bg-amber-950/40", accent: "bg-amber-400", border: "border-amber-500/30" },
  cyberpunk: { bg: "bg-purple-950/80", accent: "bg-fuchsia-400", border: "border-fuchsia-500/40" },
  minimalist: { bg: "bg-zinc-900", accent: "bg-zinc-200", border: "border-zinc-700" },
  ink: { bg: "bg-[#1c1917]", accent: "bg-amber-500", border: "border-stone-700" },
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
        "flex items-center justify-between rounded-xl p-3 text-xs border transition-all shadow-sm",
        r.done
          ? "bg-[#292524]/60 border-[#38332e] text-[#78716c]"
          : "bg-[#24201e] border-[#44403c] text-white hover:border-[#57534e]",
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{r.done ? "✅" : "⏳"}</span>
          <p className={cn("font-bold truncate text-xs", r.done && "line-through text-[#78716c]")}>
            {r.title}
          </p>
          {r.pinToScreen && !r.done ? (
            <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0 border-none font-semibold">
              📌 Ghim Desktop
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs font-bold text-amber-400">
            {r.done ? "Đã xong (Chuông đã reo)" : `Còn lại: ${formatCountdown(diff)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {!r.done ? (
          <>
            <button
              type="button"
              onClick={() => onPin(r.id)}
              title={r.pinToScreen ? "Bỏ ghim Desktop" : "Ghim ra Desktop"}
              className={cn(
                "p-1.5 rounded-lg border transition-colors cursor-pointer text-xs",
                r.pinToScreen
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-[#1c1917] hover:bg-white/10 text-[#d6d3d1] border-[#44403c]",
              )}
            >
              <Pin className={cn("size-3.5", r.pinToScreen && "fill-amber-400")} />
            </button>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onFire(r.id)}
              className="text-[11px] h-7 px-2.5 border-[#57534e] bg-[#1c1917] hover:bg-amber-500/20 hover:text-amber-400 cursor-pointer"
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
            className="text-[11px] h-7 px-2.5 hover:bg-white/10 cursor-pointer"
          >
            Đóng
          </Button>
        )}
        <button
          type="button"
          onClick={() => onRemove(r.id)}
          title="Xóa hẹn giờ"
          className="p-1.5 rounded-lg bg-[#1c1917] hover:bg-red-500/20 text-red-400 border border-[#44403c] hover:border-red-500/40 transition-colors cursor-pointer"
        >
          <Trash2 className="size-3.5" />
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

  // Initialize position to comfortable center-left on open
  useEffect(() => {
    if (open && pos === null && typeof window !== "undefined") {
      const modalWidth = Math.min(540, window.innerWidth - 32);
      const initialX = Math.max(16, Math.round((window.innerWidth - modalWidth) / 2));
      const initialY = Math.max(20, Math.round((window.innerHeight - 640) / 2));
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
    const currentX = pos?.x ?? Math.max(16, (window.innerWidth - 540) / 2);
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
    const modalWidth = Math.min(540, window.innerWidth - 32);
    const modalHeight = Math.min(640, window.innerHeight - 32);
    const newX = Math.max(8, Math.min(window.innerWidth - modalWidth - 8, dragRef.current.initX + dx));
    const newY = Math.max(8, Math.min(window.innerHeight - 100, dragRef.current.initY + dy));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUpHeader = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleResetPosition = () => {
    const modalWidth = Math.min(540, window.innerWidth - 32);
    setPos({
      x: Math.max(16, Math.round((window.innerWidth - modalWidth) / 2)),
      y: Math.max(20, Math.round((window.innerHeight - 640) / 2)),
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
          pushToast("Khôi phục dữ liệu", `Đã nạp thành công ${parsed.notes.length} ghi chú!`);
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
        "interactive-el fixed z-[90] flex flex-col overflow-hidden bg-[#1c1917] text-[#f5f5f4] shadow-[0_30px_75px_rgba(0,0,0,0.88)] border border-[#44403c] rounded-2xl select-none",
        "w-[calc(100vw-1.5rem)] max-w-[540px] h-[640px] max-h-[calc(100vh-2rem)]",
        isDragging && "opacity-95 shadow-[0_35px_90px_rgba(0,0,0,0.95)] ring-2 ring-amber-500/60",
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
      aria-label="Lumen Hub Settings"
    >
      {/* Draggable Header Bar */}
      <header
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-[#332f2b] bg-[#171412] cursor-grab active:cursor-grabbing transition-colors",
          isDragging && "bg-[#221c18]",
        )}
        title="Nhấp giữ chuột và kéo để di chuyển bảng cài đặt"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center size-7 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <GripHorizontal className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold tracking-tight flex items-center gap-1.5 text-white">
              <span>🦊</span>
              <span>Lumen Settings</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                Kéo di chuyển
              </span>
            </p>
            <p className="text-[11px] text-[#a8a29e] truncate">
              {dict.appName} · {dict.subtagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 no-drag">
          <button
            type="button"
            onClick={handleResetPosition}
            className="flex size-7 items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-[#a8a29e] hover:text-white"
            title="Đặt lại vị trí giữa màn hình"
            aria-label="Đặt lại vị trí"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setHubOpen(false)}
            className="flex size-7 items-center justify-center rounded-lg hover:bg-red-500/20 hover:text-red-400 cursor-pointer transition-colors text-[#d6d3d1]"
            aria-label={dict.close}
            title={dict.close}
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="px-3 pt-2.5 pb-2 bg-[#171412] border-b border-[#2d2926]">
          <TabsList className="grid grid-cols-4 bg-[#262220] p-1 rounded-xl h-10 border border-[#3d3834]">
            <TabsTrigger
              value="remind"
              className="text-xs font-bold rounded-lg transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black data-[state=active]:shadow-md flex items-center justify-center gap-1 text-[#d6d3d1]"
            >
              <span>⏰</span>
              <span>Hẹn giờ</span>
              {activeTimersCount > 0 ? (
                <span className="size-4 rounded-full bg-black/40 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                  {activeTimersCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value="pip"
              className="text-xs font-bold rounded-lg transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black data-[state=active]:shadow-md flex items-center justify-center gap-1 text-[#d6d3d1]"
            >
              <span>🐾</span>
              <span>Thú cưng</span>
            </TabsTrigger>
            <TabsTrigger
              value="look"
              className="text-xs font-bold rounded-lg transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black data-[state=active]:shadow-md flex items-center justify-center gap-1 text-[#d6d3d1]"
            >
              <span>🎨</span>
              <span>Giao diện</span>
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-xs font-bold rounded-lg transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black data-[state=active]:shadow-md flex items-center justify-center gap-1 text-[#d6d3d1]"
            >
              <span>⚙️</span>
              <span>Hệ thống</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 bg-[#1c1917] scrollbar-thin scrollbar-thumb-[#44403c] scrollbar-track-transparent">
          {/* TAB 1: SMART TIMERS & COUNTDOWN */}
          <TabsContent value="remind" className="space-y-3.5 mt-0">
            {/* Quick Add Timer Card */}
            <div className="rounded-xl bg-[#262220] p-3.5 border border-[#3f3a36] space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  <span>Tạo Hẹn Giờ Thông Minh (Game, Việc, Nấu ăn...)</span>
                </p>
                <Badge className="bg-amber-500/15 text-amber-400 text-[10px] border-none">
                  Ctrl+Shift+T
                </Badge>
              </div>

              <form onSubmit={handleSmartSubmit} className="space-y-2.5">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ví dụ: xây nhà trong COC : 2g14p hoặc Nấu canh : 15p..."
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    className="bg-[#191614] border-[#4f4944] focus:border-amber-500 text-xs text-white placeholder:text-[#78716c] h-9"
                  />
                  <Button
                    type="submit"
                    className="cursor-pointer font-bold bg-amber-500 text-black hover:bg-amber-400 text-xs px-4 h-9 shadow-sm shrink-0"
                  >
                    + Đặt giờ
                  </Button>
                </div>

                {/* Preset Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#a8a29e] uppercase">
                    Gợi ý mẫu hẹn giờ nhanh:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "🏰 Xây nhà COC: 2g14p", val: "xây nhà trong COC : 2g14p" },
                      { label: "🍅 Pomodoro: 25p", val: "Tập trung Pomodoro : 25p" },
                      { label: "☕ Nghỉ ngơi: 5p", val: "Nghỉ ngơi thư giãn : 5p" },
                      { label: "🍲 Nấu ăn: 15p", val: "Nấu ăn canh súp : 15p" },
                      { label: "💧 Uống nước: 30p", val: "Uống nước lọc : 30p" },
                      { label: "⏳ 1 Giờ", val: "Hẹn giờ làm việc : 1g" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSmartInput(preset.val)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1c1917] hover:bg-amber-500/20 hover:text-amber-400 text-[#d6d3d1] border border-[#44403c] transition-colors cursor-pointer font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#38332e]">
                  <div className="flex items-center gap-1.5">
                    <Pin className="size-3.5 text-amber-400" />
                    <span className="text-xs text-[#d6d3d1]">Ghim đồng hồ đếm ngược nổi trên Desktop</span>
                  </div>
                  <Switch checked={pinToDesktop} onCheckedChange={setPinToDesktop} />
                </div>
              </form>
            </div>

            {/* Custom Alarm Sound Settings Card */}
            <div className="rounded-xl bg-[#262220] p-3.5 border border-[#3f3a36] space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                  <Volume2 className="size-3.5 text-amber-400" />
                  <span>Cài đặt âm lượng & Chuông báo thức</span>
                </p>
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className="flex items-center gap-1.5 text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-lg cursor-pointer transition-all shadow-sm active:scale-95"
                >
                  <Play className="size-3 fill-black" />
                  <span>Thử chuông ngay</span>
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5 bg-[#1c1917] p-2.5 rounded-xl border border-[#38332e]">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#a8a29e] flex items-center gap-1">
                    <span>🔊</span> Âm lượng chuông báo
                  </span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {alarmSettings.volume ?? 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={alarmSettings.volume ?? 100}
                  onChange={(e) => setAlarmSettings({ volume: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-[#2d2825] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Alarm Tones Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[#a8a29e] uppercase font-semibold">
                  Chọn kiểu tiếng chuông báo thức:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {ALARM_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                        setAlarmSettings({ tone: tone.id });
                        sounds.playAlarmTone(tone.id, alarmSettings.volume ?? 100);
                      }}
                      className={cn(
                        "flex items-start justify-between rounded-xl bg-[#1c1917] p-2.5 text-left border cursor-pointer transition-all",
                        (alarmSettings.tone || "bell_arpeggio") === tone.id
                          ? "border-amber-500 ring-2 ring-amber-500/50 bg-amber-500/10"
                          : "border-[#38332e] hover:border-[#57534e]",
                      )}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-lg leading-none mt-0.5">{tone.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{tone.name}</p>
                          <p className="text-[10px] text-[#a8a29e] line-clamp-2 leading-tight mt-0.5">
                            {tone.desc}
                          </p>
                        </div>
                      </div>
                      {(alarmSettings.tone || "bell_arpeggio") === tone.id ? (
                        <Check className="size-4 text-amber-400 shrink-0 ml-1" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Timers List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#a8a29e] uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Danh sách hẹn giờ đang chạy ({activeTimersCount})</span>
                </p>
              </div>

              {reminders.length === 0 ? (
                <div className="rounded-xl bg-[#262220] p-6 text-center border border-[#38332e] space-y-1.5">
                  <p className="text-2xl">⏳</p>
                  <p className="text-xs font-semibold text-white">Chưa có hẹn giờ nào</p>
                  <p className="text-[11px] text-[#a8a29e]">
                    Nhập tên việc và thời gian ở trên để bắt đầu đếm ngược thông minh!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
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

          {/* TAB 2: VIRTUAL PET STUDIO & WARDROBE & TOYS */}
          <TabsContent value="pip" className="space-y-3.5 mt-0">
            {/* Enable Companion Toggle */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#262220] px-3.5 py-3 border border-[#3f3a36]">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🐾</span> {dict.pipStudio.enableCompanion}
                </p>
                <p className="text-[11px] text-[#a8a29e]">{dict.pipStudio.enableDesc}</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>

            {pip.enabled && (
              <>
                {/* Pet Stage & Happiness Card */}
                <div className="rounded-xl bg-[#262220] p-3.5 border border-[#3f3a36] space-y-3 shadow-md">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-20 items-center justify-center rounded-xl bg-[#1c1917] border border-[#38332e] shadow-inner relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
                      <PipFigure
                        walking={false}
                        carrying={pip.carrying}
                        facing={1}
                        mood={pip.mood}
                        petType={pip.petType}
                        hat={pip.hat}
                        bodyItem={pip.bodyItem}
                        className="scale-95"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-[#a8a29e] flex items-center gap-1">
                          <Heart className="size-3 text-rose-400 fill-rose-400" />
                          <span>{dict.pipStudio.happiness}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                          {pip.happiness}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#1c1917] border border-[#38332e]">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${pip.happiness}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#a8a29e] bg-[#1c1917] px-2.5 py-1 rounded-lg border border-[#38332e]">
                        <span>🍪 {dict.pipStudio.treatsEaten}: <b className="text-white">{pip.treatsEaten}</b></span>
                        <span>✨ {dict.pipStudio.mood}: <b className="capitalize text-amber-400">{pip.mood}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        triggerThrowBall();
                        setHubOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-lime-500/40 bg-lime-500/15 text-lime-400 hover:bg-lime-500/25 h-8 text-xs font-bold"
                    >
                      <span>🎾</span>
                      <span>Ném bóng bắt đồ</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={petPip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 h-8 text-xs font-bold"
                    >
                      <Heart className="size-3.5 fill-rose-400" />
                      <span>{dict.pipStudio.petPip}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={feedPip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 h-8 text-xs font-bold"
                    >
                      <Cookie className="size-3.5 fill-amber-400" />
                      <span>{dict.pipStudio.feedSnack}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={dancePip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-indigo-500/40 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 h-8 text-xs font-bold"
                    >
                      <Sparkles className="size-3.5" />
                      <span>{dict.pipStudio.danceParty}</span>
                    </Button>
                  </div>
                </div>

                {/* Pet Species Selection */}
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wide text-[#a8a29e] uppercase">
                    Loài thú cưng (Pet Species)
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PET_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => {
                          setPip({ petType: pt.id });
                          sounds.playPop(560);
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-xl bg-[#262220] px-3 py-2 text-left border transition-all cursor-pointer",
                          pip.petType === pt.id
                            ? "ring-2 ring-amber-500 bg-amber-500/15 border-amber-500"
                            : "border-[#3f3a36] hover:border-[#57534e]",
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{pt.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white">{pt.name}</p>
                            <p className="text-[11px] text-[#a8a29e] truncate">{pt.desc}</p>
                          </div>
                        </div>
                        {pip.petType === pt.id ? (
                          <Badge className="bg-amber-500 text-black font-bold text-[10px] shrink-0 ml-2">
                            Active
                          </Badge>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Wardrobe: Hats */}
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wide text-[#a8a29e] uppercase">
                    🎩 Mũ & Phụ kiện đầu (Hats & Caps)
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {HATS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setPip({ hat: h.id });
                          sounds.playPop(580);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl bg-[#262220] p-2 text-left border transition-all cursor-pointer text-xs",
                          (pip.hat || "none") === h.id
                            ? "ring-2 ring-amber-500 bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                            : "border-[#3f3a36] hover:border-[#57534e] text-[#d6d3d1]",
                        )}
                      >
                        <span className="text-base">{h.icon}</span>
                        <span className="truncate text-[11px]">{h.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Wardrobe: Body Items */}
                <div className="space-y-2">
                  <p className="text-xs font-bold tracking-wide text-[#a8a29e] uppercase">
                    🎒 Trang phục & Đồ đeo (Body Outfits)
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BODY_ITEMS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setPip({ bodyItem: b.id });
                          sounds.playPop(580);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl bg-[#262220] p-2 text-left border transition-all cursor-pointer text-xs",
                          (pip.bodyItem || "backpack") === b.id
                            ? "ring-2 ring-amber-500 bg-amber-500/15 border-amber-500 text-amber-400 font-bold"
                            : "border-[#3f3a36] hover:border-[#57534e] text-[#d6d3d1]",
                        )}
                      >
                        <span className="text-base">{b.icon}</span>
                        <span className="truncate text-[11px]">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* TAB 3: LOOK & THEMES */}
          <TabsContent value="look" className="space-y-3.5 mt-0">
            {/* Language Selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wide text-[#a8a29e] uppercase flex items-center gap-1.5">
                <Globe className="size-3.5 text-amber-500" />
                <span>{dict.look.language}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLang("vi");
                    sounds.playPop(520);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-[#262220] px-3.5 py-2.5 text-left border cursor-pointer transition-all",
                    lang === "vi"
                      ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/15"
                      : "border-[#3f3a36] hover:border-[#57534e]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇻🇳</span>
                    <span className="text-xs font-bold text-white">Tiếng Việt</span>
                  </div>
                  {lang === "vi" ? <Badge className="bg-amber-500 text-black font-bold">Active</Badge> : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang("en");
                    sounds.playPop(520);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-[#262220] px-3.5 py-2.5 text-left border cursor-pointer transition-all",
                    lang === "en"
                      ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/15"
                      : "border-[#3f3a36] hover:border-[#57534e]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇬🇧</span>
                    <span className="text-xs font-bold text-white">English</span>
                  </div>
                  {lang === "en" ? <Badge className="bg-amber-500 text-black font-bold">Active</Badge> : null}
                </button>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wide text-[#a8a29e] uppercase">
                {dict.look.theme}
              </p>
              <div className="space-y-1.5">
                {THEMES.map((t) => {
                  const preview = THEME_PREVIEWS[t.id] || { bg: "bg-[#1c1917]", accent: "bg-amber-500", border: "border-stone-700" };
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        sounds.playPop(540);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl bg-[#262220] px-3.5 py-2.5 text-left border cursor-pointer transition-all",
                        theme === t.id
                          ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/15"
                          : "border-[#3f3a36] hover:border-[#57534e]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("size-6 rounded-lg border flex items-center justify-center shadow-sm", preview.bg, preview.border)}>
                          <div className={cn("size-2 rounded-full", preview.accent)} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{t.name}</p>
                          <p className="text-[10px] text-[#a8a29e]">{t.line}</p>
                        </div>
                      </div>
                      {theme === t.id ? <Badge className="bg-amber-500 text-black font-bold">Active</Badge> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Always On Top & Audio Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#262220] px-3.5 py-3 border border-[#3f3a36]">
                <div className="flex items-center gap-2.5">
                  <Pin className="size-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-white">{dict.look.alwaysOnTop}</p>
                    <p className="text-[11px] text-[#a8a29e]">{dict.look.alwaysOnTopDesc}</p>
                  </div>
                </div>
                <Switch checked={alwaysOnTop} onCheckedChange={handleAlwaysOnTopChange} />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#262220] px-3.5 py-3 border border-[#3f3a36]">
                <div className="flex items-center gap-2.5">
                  {pip.soundEnabled ? <Volume2 className="size-4 text-amber-500" /> : <VolumeX className="size-4 text-[#a8a29e]" />}
                  <div>
                    <p className="text-xs font-bold text-white">{dict.look.proceduralAudio}</p>
                    <p className="text-[11px] text-[#a8a29e]">{dict.look.audioDesc}</p>
                  </div>
                </div>
                <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: SYSTEM & TELEMETRY & BACKUP */}
          <TabsContent value="about" className="space-y-3.5 text-xs text-[#a8a29e] mt-0">
            {/* Live Performance Telemetry Card */}
            <div className="rounded-xl bg-[#262220] p-3.5 space-y-2.5 border border-[#3f3a36]">
              <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Activity className="size-3.5 text-emerald-400" />
                <span>Giám Sát Hiệu Năng Thời Gian Thực (Telemetry)</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#1c1917] p-2 rounded-xl border border-[#38332e]">
                  <p className="text-[10px] text-[#a8a29e]">Bộ Nhớ RAM</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">~38 MB</p>
                </div>
                <div className="bg-[#1c1917] p-2 rounded-xl border border-[#38332e]">
                  <p className="text-[10px] text-[#a8a29e]">Khung Hình</p>
                  <p className="text-xs font-bold text-amber-400 mt-0.5">120 FPS</p>
                </div>
                <div className="bg-[#1c1917] p-2 rounded-xl border border-[#38332e]">
                  <p className="text-[10px] text-[#a8a29e]">Tải CPU</p>
                  <p className="text-xs font-bold text-blue-400 mt-0.5">&lt; 0.4%</p>
                </div>
              </div>
            </div>

            {/* Local Backup & LAN Export */}
            <div className="rounded-xl bg-[#262220] p-3.5 space-y-2.5 border border-[#3f3a36]">
              <p className="font-bold text-white text-xs">Sao lưu & Đồng bộ cục bộ (Local Sync)</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportBackup}
                  className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer border-[#4f4944] bg-[#1c1917] text-white hover:bg-white/10 h-8 text-xs font-medium"
                >
                  <Download className="size-3.5" />
                  <span>Xuất file JSON</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer border-[#4f4944] bg-[#1c1917] text-white hover:bg-white/10 h-8 text-xs font-medium"
                >
                  <Upload className="size-3.5" />
                  <span>Nhập file JSON</span>
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

            {/* Shortcuts Cheat Sheet */}
            <div className="rounded-xl bg-[#262220] p-3.5 space-y-2 border border-[#3f3a36]">
              <p className="font-bold text-white text-xs mb-1">{dict.about.shortcutsTitle}:</p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Tạo ghi chú nhanh:</span>
                  <span className="font-mono bg-[#1c1917] px-2 py-0.5 rounded border border-[#38332e] text-amber-400 font-bold">
                    Ctrl + Shift + N
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hẹn giờ nhanh thông minh:</span>
                  <span className="font-mono bg-[#1c1917] px-2 py-0.5 rounded border border-[#38332e] text-amber-400 font-bold">
                    Ctrl + Shift + T
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tạo ghi chú mới trên bàn:</span>
                  <span className="font-mono bg-[#1c1917] px-2 py-0.5 rounded border border-[#38332e] text-white">
                    Nhấp đúp chuột
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kéo thả di chuyển tự do:</span>
                  <span className="font-mono bg-[#1c1917] px-2 py-0.5 rounded border border-[#38332e] text-white">
                    Chuột giữ & Kéo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Đóng cửa sổ / Modal:</span>
                  <span className="font-mono bg-[#1c1917] px-2 py-0.5 rounded border border-[#38332e] text-white">
                    Escape
                  </span>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full cursor-pointer border-[#4f4944] bg-[#262220] text-red-400 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/30 text-xs h-9"
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
