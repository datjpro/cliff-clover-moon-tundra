import { useState, useRef, useEffect, type PointerEvent } from "react";
import {
  Activity,
  Bell,
  Check,
  Clock,
  Cookie,
  Download,
  FileText,
  Folder,
  FolderPlus,
  Globe,
  GripHorizontal,
  Heart,
  Maximize2,
  Move,
  Pin,
  Play,
  Plus,
  RotateCcw,
  Search,
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
  glass: { bg: "bg-slate-800/80", accent: "bg-[#F5A623]", border: "border-white/10" },
  pastel: { bg: "bg-amber-900/30", accent: "bg-[#F5A623]", border: "border-white/10" },
  cyberpunk: { bg: "bg-purple-950/70", accent: "bg-[#F5A623]", border: "border-white/10" },
  minimalist: { bg: "bg-zinc-800", accent: "bg-zinc-200", border: "border-zinc-700" },
  ink: { bg: "bg-stone-900", accent: "bg-[#F5A623]", border: "border-stone-700" },
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
        "flex items-center justify-between rounded-xl px-3 py-2.5 text-xs border transition-all duration-140",
        r.done
          ? "bg-[#14161D]/40 border-white/5 text-[#8B90A0]"
          : "bg-[#262A35]/60 border-white/5 text-[#F4F5F7] hover:border-white/15 shadow-xs",
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{r.done ? "✓" : "⏱"}</span>
          <p className={cn("font-medium truncate text-xs", r.done && "line-through text-[#8B90A0]")}>
            {r.title}
          </p>
          {r.pinToScreen && !r.done ? (
            <span className="bg-[#F5A623]/20 text-[#F5A623] text-[10px] px-1.5 py-0.2 rounded-md font-semibold border border-[#F5A623]/30">
              Ghim Desktop
            </span>
          ) : null}
        </div>
        <p className="font-mono text-xs font-semibold text-[#F5A623] tabular-nums">
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
                  ? "bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40"
                  : "bg-[#14161D] hover:bg-white/10 text-[#8B90A0] border-white/10",
              )}
            >
              <Pin className={cn("size-3", r.pinToScreen && "fill-[#F5A623] text-[#F5A623]")} />
            </button>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => onFire(r.id)}
              className="text-[10px] h-6.5 px-2 border-white/10 bg-[#14161D] hover:bg-[#F5A623]/20 hover:text-[#F5A623] cursor-pointer"
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
            className="text-[10px] h-6.5 px-2 hover:bg-white/10 text-[#8B90A0] cursor-pointer"
          >
            Đóng
          </Button>
        )}
        <button
          type="button"
          onClick={() => onRemove(r.id)}
          title="Xóa hẹn giờ"
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#8B90A0] hover:text-[#EF4444] transition-colors cursor-pointer"
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
  const isVi = lang === "vi";
  const theme = useLumen((s) => s.theme);
  const setTheme = useLumen((s) => s.setTheme);
  const alwaysOnTop = useLumen((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useLumen((s) => s.setAlwaysOnTop);
  const introVideoEnabled = useLumen((s) => s.introVideoEnabled ?? true);
  const setIntroVideoEnabled = useLumen((s) => s.setIntroVideoEnabled);
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

  const selectedCluster = useLumen((s) => s.selectedCluster);
  const setSelectedCluster = useLumen((s) => s.setSelectedCluster);
  const addNote = useLumen((s) => s.addNote);
  const updateNote = useLumen((s) => s.updateNote);
  const removeNote = useLumen((s) => s.removeNote);
  const trashNotes = useLumen((s) => s.trashNotes || []);
  const restoreNote = useLumen((s) => s.restoreNote);
  const emptyTrash = useLumen((s) => s.emptyTrash);
  const permanentDeleteNote = useLumen((s) => s.permanentDeleteNote);

  const [clusterSearch, setClusterSearch] = useState("");
  const txtImportRef = useRef<HTMLInputElement>(null);

  // Group notes by cluster
  const clustersMap = notes.reduce<Record<string, typeof notes>>((acc, note) => {
    const clusterName = note.cluster || "Chung (Không nhóm)";
    if (!acc[clusterName]) acc[clusterName] = [];
    acc[clusterName].push(note);
    return acc;
  }, {});

  const handleExportClusterTxt = (clusterName: string, clusterNotes: typeof notes) => {
    let content = `=== CỤM GHI CHÚ: ${clusterName.toUpperCase()} ===\n`;
    content += `Thời gian xuất: ${new Date().toLocaleString("vi-VN")}\n`;
    content += `Số lượng ghi chú: ${clusterNotes.length}\n\n`;

    clusterNotes.forEach((n, idx) => {
      content += `----------------------------------------\n`;
      content += `[#${idx + 1}] (${new Date(n.createdAt).toLocaleDateString("vi-VN")})\n`;
      if (n.title) content += `Tiêu đề: ${n.title}\n`;
      content += `${n.body}\n`;
      if (n.checkItems && n.checkItems.length > 0) {
        content += `\nChecklist:\n`;
        n.checkItems.forEach((c) => {
          content += `  ${c.done ? "[x]" : "[ ]"} ${c.text}\n`;
        });
      }
      content += `\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lumen_Cluster_${clusterName.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playChime();
    pushToast("Đã lưu file .txt", `Đã xuất cụm "${clusterName}" thành công!`);
  };

  const handleTxtFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string) || "";
        const title = file.name.replace(/\.[^/.]+$/, "");
        addNote({
          title,
          body: text,
          x: 20 + Math.random() * 40,
          y: 15 + Math.random() * 40,
          tint: index % 2 === 0 ? "cream" : "sage",
          cluster: selectedCluster || undefined,
        });
      };
      reader.readAsText(file);
    });

    sounds.playPop(700);
    pushToast("Nhập file thành công", `Đã tạo ${files.length} ghi chú từ file .txt!`);
    if (e.target) e.target.value = "";
  };

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
      const modalWidth = Math.min(540, window.innerWidth - 32);
      const initialX = Math.max(16, Math.round((window.innerWidth - modalWidth) / 2));
      const initialY = Math.max(20, Math.round((window.innerHeight - 600) / 2));
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
    const modalHeight = Math.min(600, window.innerHeight - 32);
    const newX = Math.max(8, Math.min(window.innerWidth - modalWidth - 8, dragRef.current.initX + dx));
    const newY = Math.max(8, Math.min(window.innerHeight - 80, dragRef.current.initY + dy));
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
      y: Math.max(20, Math.round((window.innerHeight - 600) / 2)),
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
        "interactive-el fixed z-[90] flex flex-col overflow-hidden bg-[#1D2029]/95 text-[#F4F5F7] shadow-[0_24px_60px_rgba(0,0,0,0.75)] border border-white/6 rounded-2xl select-none backdrop-blur-2xl",
        "w-[calc(100vw-1.5rem)] max-w-[540px] h-[600px] max-h-[calc(100vh-2rem)]",
        isDragging && "ring-1 ring-[#F5A623]/50 shadow-[0_30px_70px_rgba(0,0,0,0.85)]",
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
      {/* Hidden file input for .txt file import */}
      <input
        type="file"
        ref={txtImportRef}
        onChange={handleTxtFileImport}
        accept=".txt,.md,.json,.csv,.log"
        multiple
        className="hidden"
      />

      {/* Sleek Draggable Header */}
      <header
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        className={cn(
          "flex items-center justify-between px-4 py-2.5 border-b border-white/6 bg-[#14161D]/50 cursor-grab active:cursor-grabbing transition-colors",
          isDragging && "bg-[#14161D]/80",
        )}
        title="Kéo thả để di chuyển bảng cài đặt"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center size-6 rounded-md bg-white/5 text-[#8B90A0] shrink-0 border border-white/5">
            <GripHorizontal className="size-3.5" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <img src="/icon.png" alt="Lumen Logo" className="size-4 object-contain rounded-sm" />
            <p className="font-semibold text-xs tracking-tight text-[#F4F5F7]">
              Lumen Settings & Trung Tâm Cài Đặt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 no-drag">
          <button
            type="button"
            onClick={handleResetPosition}
            className="size-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
            title="Đưa bảng về giữa màn hình"
          >
            <Maximize2 className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => setHubOpen(false)}
            className="size-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
            title="Đóng (Escape)"
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
        <div className="px-3.5 pt-2.5 pb-2 bg-[#14161D]/30 border-b border-white/5">
          <TabsList className="grid grid-cols-6 bg-[#14161D] p-1 rounded-xl h-10 border border-white/6 gap-1">
            <TabsTrigger
              value="remind"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>⏱</span>
              <span className="truncate">Hẹn giờ</span>
              {activeTimersCount > 0 ? (
                <span className="size-3.5 rounded-full bg-[#14161D] text-[#F5A623] text-[9px] flex items-center justify-center font-bold shrink-0 border border-[#F5A623]/30">
                  {activeTimersCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value="clusters"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>🗂</span>
              <span className="truncate">Cụm Note</span>
            </TabsTrigger>
            <TabsTrigger
              value="trash"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>🗑</span>
              <span className="truncate">Thùng rác</span>
              {trashNotes && trashNotes.length > 0 ? (
                <span className="size-3.5 rounded-full bg-red-500/20 text-[#EF4444] text-[9px] flex items-center justify-center font-bold shrink-0 border border-red-500/30">
                  {trashNotes.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger
              value="pip"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>🐾</span>
              <span className="truncate">Thú cưng</span>
            </TabsTrigger>
            <TabsTrigger
              value="look"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>🎨</span>
              <span className="truncate">Giao diện</span>
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>⚙️</span>
              <span className="truncate">Hệ thống</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3 space-y-3 custom-scrollbar">
          {/* TAB 1: SMART TIMERS & COUNTDOWN */}
          <TabsContent value="remind" className="space-y-3 mt-0">
            {/* Quick Smart Input Box */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 border border-white/6 space-y-2.5 shadow-xs">
              <form onSubmit={handleSmartSubmit} className="space-y-2">
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Ví dụ: xây nhà COC : 2g14p, Nấu canh : 15p..."
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    className="bg-[#14161D] border-white/10 focus:border-[#F5A623]/60 text-xs text-[#F4F5F7] placeholder:text-[#8B90A0]/60 h-8 rounded-xl"
                  />
                  <Button
                    type="submit"
                    className="cursor-pointer font-semibold bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] text-xs px-3 h-8 shadow-xs shrink-0 rounded-xl transition-colors duration-140"
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
                      className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#14161D] hover:bg-[#F5A623]/20 hover:text-[#F5A623] text-[#8B90A0] border border-white/6 transition-colors duration-120 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[11px] text-[#8B90A0]">Ghim đồng hồ nổi trên Desktop</span>
                  <Switch checked={pinToDesktop} onCheckedChange={setPinToDesktop} />
                </div>
              </form>
            </div>

            {/* Alarm Audio Customizer */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 border border-white/6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F5F7]">
                  <Volume2 className="size-3.5 text-[#F5A623]" />
                  <span>Chuông báo thức</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#F5A623] hover:text-[#F4F5F7] bg-[#F5A623]/15 border border-[#F5A623]/30 px-2 py-0.5 rounded-lg cursor-pointer transition-colors duration-120"
                >
                  <Play className="size-2.5 fill-current" />
                  <span>Thử chuông</span>
                </button>
              </div>

              {/* Volume Slider & Mute Toggle */}
              <div className="space-y-1.5 bg-[#14161D] p-2 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8B90A0]">
                    {alarmSettings.muted ? (
                      <VolumeX className="size-3.5 text-[#EF4444]" />
                    ) : (
                      <Volume2 className="size-3.5 text-[#F5A623]" />
                    )}
                    <span>{alarmSettings.muted ? "Đã tắt âm thanh chuông" : "Phát âm thanh chuông"}</span>
                  </div>
                  <Switch
                    checked={!alarmSettings.muted}
                    onCheckedChange={(val) => {
                      setAlarmSettings({ muted: !val });
                      sounds.playPop(520);
                    }}
                  />
                </div>

                {!alarmSettings.muted && (
                  <div className="flex items-center gap-2.5 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-[#8B90A0] shrink-0">Âm lượng</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={alarmSettings.volume ?? 100}
                      onChange={(e) => setAlarmSettings({ volume: parseInt(e.target.value, 10) })}
                      className="w-full h-1 bg-[#262A35] rounded-full appearance-none cursor-pointer accent-[#F5A623]"
                    />
                    <span className="font-mono text-[11px] font-semibold text-[#F5A623] shrink-0 tabular-nums">
                      {alarmSettings.volume ?? 100}%
                    </span>
                  </div>
                )}
              </div>

              {/* Alarm Tones Selector */}
              <div className="grid grid-cols-2 gap-1.5">
                {ALARM_TONES.map((tone) => {
                  const isSelected = (alarmSettings.tone || "bell_arpeggio") === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                        setAlarmSettings({ tone: tone.id });
                        sounds.playAlarmTone(tone.id, alarmSettings.volume ?? 100);
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl p-2 text-left border cursor-pointer transition-all duration-140",
                        isSelected
                          ? "border-[#F5A623] bg-[#262A35] text-[#F4F5F7] shadow-xs"
                          : "border-white/5 bg-[#14161D]/70 hover:border-white/15 text-[#8B90A0]",
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">{tone.icon}</span>
                        <p className="text-[11px] font-medium truncate">{tone.name}</p>
                      </div>
                      {isSelected ? (
                        <Check className="size-3 text-[#F5A623] shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Timers List */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
                Hẹn giờ đang chạy ({activeTimersCount})
              </p>

              {reminders.length === 0 ? (
                <div className="rounded-2xl bg-[#262A35]/30 p-4 text-center border border-white/5">
                  <p className="text-[11px] text-[#8B90A0]">Chưa có hẹn giờ nào đang chạy.</p>
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

          {/* TAB 2: NOTE CLUSTERS & ARCHIVE HUB */}
          <TabsContent value="clusters" className="space-y-3 mt-0">
            {/* Action Bar: Search, Import .txt, Export All */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 border border-white/6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B90A0]" />
                  <Input
                    placeholder="Tìm kiếm trong các cụm ghi chú..."
                    value={clusterSearch}
                    onChange={(e) => setClusterSearch(e.target.value)}
                    className="bg-[#14161D] border-white/10 focus:border-[#F5A623]/60 text-xs text-[#F4F5F7] placeholder:text-[#8B90A0]/60 h-8 pl-8 rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => txtImportRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                  title="Mở file .txt hoặc .md từ máy tính để sinh note"
                >
                  <FileText className="size-3.5" />
                  <span>+ Nạp .txt</span>
                </button>
              </div>

              {/* Quick Summary & Desktop Filter state */}
              <div className="flex items-center justify-between text-[11px] text-[#8B90A0] pt-1 border-t border-white/5">
                <span>
                  Tổng cộng: <b className="text-[#F4F5F7]">{notes.length}</b> note trong <b className="text-[#F5A623]">{Object.keys(clustersMap).length}</b> cụm
                </span>
                {selectedCluster ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCluster(null)}
                    className="text-[#F5A623] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <span>Bỏ lọc: {selectedCluster}</span>
                    <X className="size-3" />
                  </button>
                ) : (
                  <span className="text-[#3FAE6C]">Đang hiện tất cả note</span>
                )}
              </div>
            </div>

            {/* Clusters List */}
            <div className="space-y-2.5">
              {Object.entries(clustersMap).map(([clusterName, clusterNotes]) => {
                const isCurrentFilter = selectedCluster === clusterName;
                const filteredClusterNotes = clusterSearch.trim()
                  ? clusterNotes.filter(
                      (n) =>
                        n.body.toLowerCase().includes(clusterSearch.toLowerCase()) ||
                        (n.title && n.title.toLowerCase().includes(clusterSearch.toLowerCase())),
                    )
                  : clusterNotes;

                if (clusterSearch.trim() && filteredClusterNotes.length === 0) return null;

                return (
                  <div
                    key={clusterName}
                    className={cn(
                      "rounded-2xl p-3 border transition-all space-y-2",
                      isCurrentFilter
                        ? "bg-[#262A35]/80 border-[#F5A623]/60 shadow-md ring-1 ring-[#F5A623]/30"
                        : "bg-[#262A35]/40 border-white/6 hover:border-white/12",
                    )}
                  >
                    {/* Cluster Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-lg bg-[#F5A623]/15 text-[#F5A623] flex items-center justify-center shrink-0">
                          <Folder className="size-3.5" />
                        </div>
                        <span className="font-bold text-xs text-[#F4F5F7] truncate">
                          {clusterName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-mono text-[#8B90A0]">
                          {clusterNotes.length}
                        </span>
                      </div>

                      {/* Cluster Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCurrentFilter) {
                              setSelectedCluster(null);
                            } else {
                              setSelectedCluster(clusterName === "Chung (Không nhóm)" ? null : clusterName);
                            }
                          }}
                          className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1",
                            isCurrentFilter
                              ? "bg-[#F5A623] text-[#14161D]"
                              : "bg-white/10 hover:bg-white/15 text-[#F4F5F7]",
                          )}
                          title="Lọc chỉ hiển thị cụm này trên Desktop"
                        >
                          <Pin className="size-2.5" />
                          <span>{isCurrentFilter ? "Đang lọc" : "Lọc Desktop"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportClusterTxt(clusterName, clusterNotes)}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/15 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
                          title="Lưu toàn bộ cụm này thành 1 file .txt"
                        >
                          <Download className="size-3" />
                        </button>
                      </div>
                    </div>

                    {/* Note Item Previews in this cluster */}
                    <div className="space-y-1.5 pt-1">
                      {filteredClusterNotes.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#14161D]/60 border border-white/5 text-xs text-[#8B90A0] hover:text-[#F4F5F7] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className={cn("size-2 rounded-full shrink-0", `note-${n.tint}`)} />
                            <span className="truncate text-[11px]">
                              {n.title ? `[${n.title}] ` : ""}
                              {n.body.trim().slice(0, 50) || "Ghi chú trống"}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono shrink-0 opacity-60">
                            {new Date(n.createdAt).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                      {filteredClusterNotes.length > 4 && (
                        <p className="text-[10px] text-center text-[#8B90A0] pt-0.5">
                          + {filteredClusterNotes.length - 4} ghi chú khác trong cụm
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 3: TRASH & RECOVERY BIN */}
          <TabsContent value="trash" className="space-y-3 mt-0">
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#262A35]/50 border border-white/6">
              <div>
                <h4 className="text-xs font-bold text-[#F4F5F7]">Thùng rác ghi chú</h4>
                <p className="text-[10px] text-[#8B90A0]">
                  Lưu trữ {trashNotes?.length || 0} ghi chú đã xóa gần đây (Ctrl+Z để hoàn tác tức thì)
                </p>
              </div>
              {trashNotes && trashNotes.length > 0 && (
                <button
                  type="button"
                  onClick={() => emptyTrash()}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-[#EF4444] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="size-3" />
                  <span>Dọn sạch</span>
                </button>
              )}
            </div>

            {/* Trash Items List */}
            <div className="space-y-2 max-h-96 overflow-y-auto note-scrollbar">
              {(!trashNotes || trashNotes.length === 0) ? (
                <div className="py-12 text-center text-[#8B90A0] flex flex-col items-center gap-2">
                  <Trash2 className="size-8 text-white/20" />
                  <p className="text-xs">Thùng rác trống</p>
                  <p className="text-[10px] text-[#8B90A0]/60">Các ghi chú bạn xóa sẽ xuất hiện ở đây để khôi phục khi cần</p>
                </div>
              ) : (
                trashNotes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-[#14161D]/70 border border-white/6 space-y-2 hover:border-white/12 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span className={cn("size-2.5 rounded-full mt-1 shrink-0", `note-${n.tint}`)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[#F4F5F7] font-medium line-clamp-3 leading-relaxed">
                            {n.body.trim() || "(Ghi chú không có nội dung)"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#8B90A0]">
                            {n.cluster && (
                              <span className="text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.2 rounded border border-[#F5A623]/20">
                                {n.cluster}
                              </span>
                            )}
                            {n.deletedAt && (
                              <span>Xóa lúc: {new Date(n.deletedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => restoreNote(n.id)}
                          className="px-2.5 py-1 rounded-xl bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          title="Khôi phục ghi chú này lên Desktop"
                        >
                          <RotateCcw className="size-3" />
                          <span>Khôi phục</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => permanentDeleteNote(n.id)}
                          className="p-1.5 rounded-xl hover:bg-red-500/15 text-[#8B90A0] hover:text-[#EF4444] transition-colors cursor-pointer"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB 4: VIRTUAL PET STUDIO & WARDROBE */}
          <TabsContent value="pip" className="space-y-3 mt-0">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#262A35]/50 px-3 py-2.5 border border-white/6">
              <div>
                <p className="text-xs font-semibold text-[#F4F5F7]">{dict.pipStudio.enableCompanion}</p>
                <p className="text-[10px] text-[#8B90A0]">{dict.pipStudio.enableDesc}</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>

            {pip.enabled && (
              <>
                {/* Pet Stage & Happiness Card */}
                <div className="rounded-2xl bg-[#262A35]/50 p-3 border border-white/6 space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-16 items-center justify-center rounded-xl bg-[#14161D] border border-white/10 shrink-0 relative overflow-hidden">
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
                        <span className="text-[11px] font-medium text-[#8B90A0]">Vui vẻ (Happiness)</span>
                        <span className="font-mono text-xs font-bold text-[#F5A623] tabular-nums">{pip.happiness}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#14161D]">
                        <div
                          className="h-full bg-gradient-to-r from-[#F5A623] to-[#3FAE6C] transition-all duration-500"
                          style={{ width: `${pip.happiness}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#8B90A0]">
                        <span>🍪 Đã ăn: <b className="text-[#F4F5F7]">{pip.treatsEaten}</b></span>
                        <span>✨ Mood: <b className="capitalize text-[#F5A623]">{pip.mood}</b></span>
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
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-[#3FAE6C]/30 bg-[#3FAE6C]/10 text-[#3FAE6C] hover:bg-[#3FAE6C]/20 h-7 text-[11px] font-semibold rounded-xl"
                    >
                      <span>🎾</span>
                      <span>Ném bóng</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={petPip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-[#E8779A]/30 bg-[#E8779A]/10 text-[#E8779A] hover:bg-[#E8779A]/20 h-7 text-[11px] font-semibold rounded-xl"
                    >
                      <Heart className="size-3 fill-current" />
                      <span>{dict.pipStudio.petPip}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={feedPip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623] hover:bg-[#F5A623]/20 h-7 text-[11px] font-semibold rounded-xl"
                    >
                      <Cookie className="size-3 fill-current" />
                      <span>{dict.pipStudio.feedSnack}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={dancePip}
                      className="flex items-center justify-center gap-1.5 cursor-pointer border-indigo-400/30 bg-indigo-400/10 text-indigo-300 hover:bg-indigo-400/20 h-7 text-[11px] font-semibold rounded-xl"
                    >
                      <Sparkles className="size-3" />
                      <span>{dict.pipStudio.danceParty}</span>
                    </Button>
                  </div>
                </div>

                {/* Pet Species */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
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
                          "flex items-center justify-between rounded-xl px-3 py-1.5 text-left border transition-all duration-120 cursor-pointer",
                          pip.petType === pt.id
                            ? "border-[#F5A623]/60 bg-[#F5A623]/15 text-[#F4F5F7]"
                            : "border-white/5 bg-[#262A35]/30 hover:border-white/15 text-[#8B90A0]",
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{pt.icon}</span>
                          <span className="text-xs font-semibold">{pt.name}</span>
                        </div>
                        {pip.petType === pt.id ? (
                          <span className="text-[10px] bg-[#F5A623]/20 text-[#F5A623] px-1.5 py-0.2 rounded-md font-semibold border border-[#F5A623]/30">
                            Active
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Wardrobe: Hats */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
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
                          "flex items-center gap-1.5 rounded-xl p-1.5 text-left border transition-all duration-120 cursor-pointer text-xs",
                          (pip.hat || "none") === h.id
                            ? "border-[#F5A623]/60 bg-[#F5A623]/15 text-[#F5A623] font-semibold"
                            : "border-white/5 bg-[#262A35]/30 hover:border-white/15 text-[#8B90A0]",
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
                  <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
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
                          "flex items-center gap-1.5 rounded-xl p-1.5 text-left border transition-all duration-120 cursor-pointer text-xs",
                          (pip.bodyItem || "backpack") === b.id
                            ? "border-[#F5A623]/60 bg-[#F5A623]/15 text-[#F5A623] font-semibold"
                            : "border-white/5 bg-[#262A35]/30 hover:border-white/15 text-[#8B90A0]",
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
              <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
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
                    "flex items-center justify-between rounded-xl px-3 py-2 text-left border cursor-pointer transition-all duration-120",
                    lang === "vi"
                      ? "border-[#F5A623]/60 bg-[#F5A623]/15 text-[#F4F5F7]"
                      : "border-white/5 bg-[#262A35]/30 hover:border-white/15 text-[#8B90A0]",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🇻🇳</span>
                    <span className="text-xs font-semibold">Tiếng Việt</span>
                  </div>
                  {lang === "vi" ? <span className="size-1.5 rounded-full bg-[#F5A623]" /> : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLang("en");
                    sounds.playPop(520);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-left border cursor-pointer transition-all duration-120",
                    lang === "en"
                      ? "border-[#F5A623]/60 bg-[#F5A623]/15 text-[#F4F5F7]"
                      : "border-white/5 bg-[#262A35]/30 hover:border-white/15 text-[#8B90A0]",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🇬🇧</span>
                    <span className="text-xs font-semibold">English</span>
                  </div>
                  {lang === "en" ? <span className="size-1.5 rounded-full bg-[#F5A623]" /> : null}
                </button>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
                Chủ đề không gian
              </p>
              <div className="space-y-1">
                {THEMES.map((t) => {
                  const preview = THEME_PREVIEWS[t.id] || { bg: "bg-[#262A35]", accent: "bg-[#F5A623]", border: "border-white/10" };
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        sounds.playPop(540);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left border cursor-pointer transition-all duration-120",
                        theme === t.id
                          ? "border-[#F5A623]/60 bg-[#F5A623]/15 text-[#F4F5F7]"
                          : "border-white/5 bg-[#262A35]/30 hover:border-white/15 text-[#8B90A0]",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn("size-5 rounded-md border flex items-center justify-center", preview.bg, preview.border)}>
                          <div className={cn("size-1.5 rounded-full", preview.accent)} />
                        </div>
                        <span className="text-xs font-medium">{t.name}</span>
                      </div>
                      {theme === t.id ? (
                        <span className="text-[10px] bg-[#F5A623]/20 text-[#F5A623] px-1.5 py-0.2 rounded-md font-semibold border border-[#F5A623]/30">
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
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#262A35]/30 px-3 py-2.5 border border-white/5">
                <div>
                  <p className="text-xs font-medium text-[#F4F5F7]">{dict.look.alwaysOnTop}</p>
                  <p className="text-[10px] text-[#8B90A0]">{dict.look.alwaysOnTopDesc}</p>
                </div>
                <Switch checked={alwaysOnTop} onCheckedChange={handleAlwaysOnTopChange} />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#262A35]/30 px-3 py-2.5 border border-white/5">
                <div>
                  <p className="text-xs font-medium text-[#F4F5F7]">{isVi ? "Video Intro khi mở ứng dụng" : "Startup Intro Video"}</p>
                  <p className="text-[10px] text-[#8B90A0]">
                    {isVi ? "Phát đoạn intro cinematic khi khởi động (bấm Space để bỏ qua)" : "Play cinematic intro on startup (Space to skip)"}
                  </p>
                </div>
                <Switch checked={introVideoEnabled} onCheckedChange={(val) => setIntroVideoEnabled(val)} />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#262A35]/30 px-3 py-2.5 border border-white/5">
                <div>
                  <p className="text-xs font-medium text-[#F4F5F7]">{dict.look.proceduralAudio}</p>
                  <p className="text-[10px] text-[#8B90A0]">{dict.look.audioDesc}</p>
                </div>
                <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: SYSTEM & TELEMETRY */}
          <TabsContent value="about" className="space-y-3 text-xs text-[#8B90A0] mt-0">
            {/* Live Performance Telemetry */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 space-y-2 border border-white/6">
              <p className="font-semibold text-[#F4F5F7] flex items-center gap-1.5 text-xs">
                <Activity className="size-3 text-[#3FAE6C]" />
                <span>Giám sát hiệu năng</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[#14161D] p-2 rounded-xl border border-white/5">
                  <p className="text-[9px] text-[#8B90A0]">RAM</p>
                  <p className="text-xs font-bold text-[#3FAE6C] mt-0.5">~38 MB</p>
                </div>
                <div className="bg-[#14161D] p-2 rounded-xl border border-white/5">
                  <p className="text-[9px] text-[#8B90A0]">FPS</p>
                  <p className="text-xs font-bold text-[#F5A623] mt-0.5">120 FPS</p>
                </div>
                <div className="bg-[#14161D] p-2 rounded-xl border border-white/5">
                  <p className="text-[9px] text-[#8B90A0]">CPU</p>
                  <p className="text-xs font-bold text-sky-400 mt-0.5">&lt; 0.4%</p>
                </div>
              </div>
            </div>

            {/* Local Backup */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 space-y-2 border border-white/6">
              <p className="font-semibold text-[#F4F5F7] text-xs">Sao lưu & Khôi phục</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportBackup}
                  className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer border-white/10 bg-[#14161D] text-[#F4F5F7] hover:bg-white/10 h-7.5 text-xs rounded-xl"
                >
                  <Download className="size-3" />
                  <span>Xuất JSON</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer border-white/10 bg-[#14161D] text-[#F4F5F7] hover:bg-white/10 h-7.5 text-xs rounded-xl"
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
            <div className="rounded-2xl bg-[#262A35]/50 p-3 space-y-1.5 border border-white/6">
              <p className="font-semibold text-[#F4F5F7] text-xs mb-1">Tổ hợp phím tắt nhanh (Alt):</p>
              <div className="divide-y divide-white/5 text-[11px]">
                <div className="flex items-center justify-between py-1">
                  <span>Ghi chú nhanh:</span>
                  <div className="flex gap-1">
                    <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                      Alt + N
                    </span>
                    <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#8B90A0]">
                      Alt + Q
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Đặt giờ nhanh:</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                    Alt + T
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Bảng cài đặt (Hub):</span>
                  <div className="flex gap-1">
                    <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                      Alt + S
                    </span>
                    <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#8B90A0]">
                      Alt + H
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Sắp xếp ghi chú:</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                    Alt + A
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Ẩn / Hiện tất cả note:</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                    Alt + O
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Bật / Tắt Thú cưng:</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                    Alt + P
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Hiện cửa sổ lên trên:</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                    Alt + L
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Tạo note tại con trỏ:</span>
                  <span className="bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#3FAE6C] font-semibold text-[10px]">
                    Nhấp đúp chuột trên màn hình
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Xoay góc nghiêng note:</span>
                  <span className="bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#3FAE6C] font-semibold text-[10px]">
                    Kéo icon xoay ở góc note
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Đóng cửa sổ / Modal:</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F4F5F7]">
                    Escape
                  </span>
                </div>
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              className="w-full cursor-pointer border-white/10 bg-[#262A35]/30 text-[#EF4444] hover:bg-red-500/10 hover:text-red-300 text-xs h-8 rounded-xl"
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
