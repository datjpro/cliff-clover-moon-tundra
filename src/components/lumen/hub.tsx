import { useState, useRef, useEffect, type PointerEvent } from "react";
import {
  Activity,
  Check,
  Cookie,
  Download,
  GripHorizontal,
  Heart,
  Maximize2,
  Play,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleAlwaysOnTop } from "@/lib/desktop-bridge";
import { DICTIONARY } from "@/lib/i18n";
import { sounds } from "@/lib/audio";
import { THEMES } from "@/lib/themes";
import { useLumen } from "@/lib/store";
import type { AlarmSoundTone, CalendarDockPosition, PetBodyItem, PetHat, PetType, ThemeId } from "@/lib/types";
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
  const setSetupWizardMode = useLumen((s) => s.setSetupWizardMode);
  const calendarDockPosition = useLumen((s) => s.calendarDockPosition || "top-right");
  const setCalendarDockPosition = useLumen((s) => s.setCalendarDockPosition);
  const pip = useLumen((s) => s.pip);
  const setPip = useLumen((s) => s.setPip);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const feedPip = useLumen((s) => s.feedPip);
  const petPip = useLumen((s) => s.petPip);
  const dancePip = useLumen((s) => s.dancePip);
  const toggleSound = useLumen((s) => s.toggleSound);
  const notes = useLumen((s) => s.notes);
  const reminders = useLumen((s) => s.reminders);
  const calendarEvents = useLumen((s) => s.calendarEvents);
  const alarmSettings = useLumen((s) => s.alarmSettings || { volume: 100, tone: "bell_arpeggio", loopIntervalSec: 3 });
  const setAlarmSettings = useLumen((s) => s.setAlarmSettings);
  const resetDemo = useLumen((s) => s.resetDemo);
  const pushToast = useLumen((s) => s.pushToast);

  // Position & Drag state for Settings Modal
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("look");

  const dict = DICTIONARY[lang];

  // Initialize position on open
  useEffect(() => {
    if (open && pos === null && typeof window !== "undefined") {
      const modalWidth = Math.min(540, window.innerWidth - 32);
      const initialX = Math.max(16, Math.round((window.innerWidth - modalWidth) / 2));
      const initialY = Math.max(20, Math.round((window.innerHeight - 560) / 2));
      setPos({ x: initialX, y: initialY });
    }
  }, [open, pos]);

  if (!open) return null;

  const handleAlwaysOnTopChange = (val: boolean) => {
    setAlwaysOnTop(val);
    void toggleAlwaysOnTop(val);
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
    const modalHeight = Math.min(560, window.innerHeight - 32);
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
      y: Math.max(20, Math.round((window.innerHeight - 560) / 2)),
    });
    sounds.playPop(520);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const data = {
      notes,
      reminders,
      calendarEvents,
      theme,
      pip,
      alarmSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumen-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playChime();
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
        }
        if (parsed.calendarEvents && Array.isArray(parsed.calendarEvents)) {
          useLumen.setState({ calendarEvents: parsed.calendarEvents });
        }
        if (parsed.theme) {
          useLumen.setState({ theme: parsed.theme });
        }
        if (parsed.alarmSettings) {
          useLumen.setState({ alarmSettings: parsed.alarmSettings });
        }
        sounds.playPop(620);
        pushToast("Khôi phục dữ liệu", "Đã nạp cài đặt và dữ liệu thành công!");
      } catch {
        pushToast("Lỗi nhập dữ liệu", "File JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <section
      className={cn(
        "interactive-el fixed z-[90] flex flex-col overflow-hidden bg-[#1D2029]/95 text-[#F4F5F7] shadow-[0_24px_60px_rgba(0,0,0,0.75)] border border-white/6 rounded-2xl select-none backdrop-blur-2xl",
        "w-[calc(100vw-1.5rem)] max-w-[540px] h-[560px] max-h-[calc(100vh-2rem)]",
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
              {isVi ? "Cài Đặt Hệ Thống & Tùy Biến" : "System Preferences & Settings"}
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

      {/* Streamlined Pill-Switch Navigation Tabs (4 strictly preference tabs) */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="px-3.5 pt-2.5 pb-2 bg-[#14161D]/30 border-b border-white/5">
          <TabsList className="grid grid-cols-4 bg-[#14161D] p-1 rounded-xl h-10 border border-white/6 gap-1">
            <TabsTrigger
              value="look"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>🎨</span>
              <span className="truncate">{isVi ? "Giao diện" : "Appearance"}</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>⚙️</span>
              <span className="truncate">{isVi ? "Tùy chọn" : "Preferences"}</span>
            </TabsTrigger>
            <TabsTrigger
              value="pip"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>🐾</span>
              <span className="truncate">{isVi ? "Thú cưng" : "Companion"}</span>
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-[11px] font-semibold rounded-lg transition-all duration-180 data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#14161D] data-[state=active]:shadow-sm flex items-center justify-center gap-1 text-[#8B90A0] px-1 py-1"
            >
              <span>📊</span>
              <span className="truncate">{isVi ? "Hệ thống" : "System & About"}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3 space-y-3 custom-scrollbar">
          {/* TAB 1: LOOK & THEMES */}
          <TabsContent value="look" className="space-y-3 mt-0">
            {/* Themes Grid */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
                {isVi ? "Bảng màu chủ đề (Spatial Themes)" : "Spatial Themes"}
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

            {/* Language Selection */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
                {isVi ? "Ngôn ngữ hiển thị (Language)" : "Display Language"}
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
          </TabsContent>

          {/* TAB 2: SYSTEM PREFERENCES & AUDIO */}
          <TabsContent value="preferences" className="space-y-3 mt-0">
            {/* Window & App Behavior */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-[#8B90A0] uppercase tracking-wider">
                {isVi ? "Cửa sổ & Khởi động" : "Window & Startup"}
              </p>
              <div className="divide-y divide-white/5 rounded-2xl bg-[#262A35]/30 border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-[#F4F5F7]">{dict.look.alwaysOnTop}</p>
                    <p className="text-[10px] text-[#8B90A0]">{dict.look.alwaysOnTopDesc}</p>
                  </div>
                  <Switch checked={alwaysOnTop} onCheckedChange={handleAlwaysOnTopChange} />
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-[#F4F5F7]">
                      {isVi ? "Video Intro khi khởi động" : "Startup Intro Video"}
                    </p>
                    <p className="text-[10px] text-[#8B90A0]">
                      {isVi ? "Phát cinematic intro khi mở app (phím Space để bỏ qua)" : "Play cinematic intro on startup (Space to skip)"}
                    </p>
                  </div>
                  <Switch checked={introVideoEnabled} onCheckedChange={(val) => setIntroVideoEnabled(val)} />
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-[#F4F5F7]">{dict.look.proceduralAudio}</p>
                    <p className="text-[10px] text-[#8B90A0]">{dict.look.audioDesc}</p>
                  </div>
                  <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
                </div>
              </div>
            </div>

            {/* Alarm & Sound Tone Preferences */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 border border-white/6 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F5F7]">
                  <Volume2 className="size-3.5 text-[#F5A623]" />
                  <span>{isVi ? "Âm thanh chuông báo (Alarm Tone)" : "Alarm Sound Tone"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestAlarm}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#F5A623] hover:text-[#F4F5F7] bg-[#F5A623]/15 border border-[#F5A623]/30 px-2 py-0.5 rounded-lg cursor-pointer transition-colors duration-120"
                >
                  <Play className="size-2.5 fill-current" />
                  <span>{isVi ? "Thử chuông" : "Test Tone"}</span>
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
                    <span>{alarmSettings.muted ? (isVi ? "Đã tắt âm chuông" : "Muted") : (isVi ? "Bật âm chuông báo" : "Sound Enabled")}</span>
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
                    <span className="text-[10px] text-[#8B90A0] shrink-0">{isVi ? "Âm lượng" : "Volume"}</span>
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

            {/* Calendar Mini-Widget Corner Dock Position */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 border border-white/6 space-y-2.5 shadow-xs">
              <div>
                <p className="text-xs font-semibold text-[#F4F5F7]">
                  {isVi ? "Vị trí Dock Lịch thu gọn (Calendar Corner Dock)" : "Compact Calendar Corner Dock"}
                </p>
                <p className="text-[10px] text-[#8B90A0]">
                  {isVi
                    ? "Góc màn hình để ghim widget lịch khi ở chế độ thu gọn (Mặc định: Góc trên bên phải)"
                    : "Screen corner to dock the mini calendar widget (Default: Top-Right)"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "top-left", name: isVi ? "Góc trên Trái (Top-Left)" : "Top-Left", icon: "↖️" },
                  { id: "top-right", name: isVi ? "Góc trên Phải (Top-Right)" : "Top-Right", icon: "↗️" },
                  { id: "bottom-left", name: isVi ? "Góc dưới Trái (Bottom-Left)" : "Bottom-Left", icon: "↙️" },
                  { id: "bottom-right", name: isVi ? "Góc dưới Phải (Bottom-Right)" : "Bottom-Right", icon: "↘️" },
                ].map((posOption) => {
                  const isSelected = calendarDockPosition === posOption.id;
                  return (
                    <button
                      key={posOption.id}
                      type="button"
                      onClick={() => {
                        setCalendarDockPosition(posOption.id as CalendarDockPosition);
                        sounds.playPop(560);
                      }}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-120",
                        isSelected
                          ? "bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]"
                          : "bg-[#14161D]/70 border-white/5 hover:border-white/15 text-[#8B90A0]",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{posOption.icon}</span>
                        <span className="text-[11px] font-semibold">{posOption.name}</span>
                      </div>
                      {isSelected && <Check className="size-3 text-[#F5A623] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: VIRTUAL PET STUDIO & WARDROBE */}
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
                  <span>Lịch trình & Kế hoạch (Calendar):</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                    Alt + C
                  </span>
                </div>
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
                  <span>Bảng cài đặt (Settings):</span>
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
                  <span>Tìm kiếm nhanh (Spotlight):</span>
                  <span className="font-mono bg-[#14161D] px-1.5 py-0.5 rounded-md border border-white/5 text-[#F5A623] font-semibold">
                    Alt + F
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

            {/* Custom Installer & Uninstaller Wizard Showcase */}
            <div className="rounded-2xl bg-[#262A35]/50 p-3 space-y-2 border border-white/6">
              <p className="font-semibold text-[#F4F5F7] text-xs flex items-center gap-1.5">
                <Sparkles className="size-3 text-[#F5A623]" />
                <span>{isVi ? "Trình Cài Đặt & Gỡ Cài Đặt Tùy Chỉnh" : "Custom Setup & Uninstall Wizard"}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    sounds.playPop(620);
                    setSetupWizardMode("install");
                  }}
                  className="flex items-center justify-center gap-1.5 cursor-pointer border-white/10 bg-[#14161D] text-[#F4F5F7] hover:bg-[#F5A623]/20 hover:text-[#F5A623] hover:border-[#F5A623]/30 h-8 text-xs rounded-xl transition-all"
                >
                  <Zap className="size-3 text-[#F5A623]" />
                  <span>{isVi ? "Xem Trình Cài Đặt" : "Setup Wizard"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    sounds.playPop(400);
                    setSetupWizardMode("uninstall");
                  }}
                  className="flex items-center justify-center gap-1.5 cursor-pointer border-white/10 bg-[#14161D] text-[#8B90A0] hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 h-8 text-xs rounded-xl transition-all"
                >
                  <Trash2 className="size-3 text-red-400" />
                  <span>{isVi ? "Xem Gỡ Cài Đặt" : "Uninstaller"}</span>
                </Button>
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
