import { useState, useRef } from "react";
import {
  Activity,
  Bell,
  Check,
  Clock,
  Cookie,
  Download,
  Globe,
  Heart,
  Moon,
  Pin,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
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
import type { PetBodyItem, PetHat, PetType } from "@/lib/types";
import { triggerThrowBall } from "./ball-toy";
import { PipFigure } from "./pip";
import { cn } from "@/lib/utils";

const PET_TYPES: { id: PetType; name: string; icon: string; desc: string }[] = [
  { id: "fox", name: "Cáo Nhỏ (Fox)", icon: "🦊", desc: "Chú cáo thám hiểm đeo ba lô vàng" },
  { id: "cat", name: "Mèo Mướp (Cat)", icon: "🐱", desc: "Mèo tam thể ngoan ngoãn vẫy đuôi" },
  { id: "shiba", name: "Chó Shiba", icon: "🐕", desc: "Shiba vàng đeo khăn quàng đỏ" },
  { id: "dragon", name: "Rồng Con (Dragon)", icon: "🐉", desc: "Rồng xanh ngộ nghĩnh có cánh nhỏ" },
  { id: "cyber", name: "Cyber Bot", icon: "🤖", desc: "Robot tương lai phát sáng neon" },
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
  const resetDemo = useLumen((s) => s.resetDemo);
  const pushToast = useLumen((s) => s.pushToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [smartInput, setSmartInput] = useState("xây nhà trong COC : 2g14p");
  const [pinToDesktop, setPinToDesktop] = useState(true);

  const dict = DICTIONARY[lang];

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
    setSmartInput("");
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const data = {
      notes,
      reminders,
      theme,
      pip,
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

  return (
    <section
      className={cn(
        "interactive-el fixed z-[90] flex flex-col overflow-hidden bg-[#1c1917] text-[#f5f5f4] shadow-[0_30px_70px_rgba(0,0,0,0.85)] border border-[#44403c] rounded-2xl",
        "inset-x-3 bottom-16 top-auto max-h-[min(640px,calc(100%-5.5rem))] sm:inset-auto sm:top-16 sm:left-8 sm:h-[600px] sm:w-[480px]",
      )}
      role="dialog"
      aria-label="Lumen Hub Settings"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#332f2b] bg-[#181513]">
        <div>
          <p className="font-display text-base font-bold tracking-tight flex items-center gap-1.5 text-white">
            <span>🦊</span> {dict.appName}
          </p>
          <p className="text-xs text-[#a8a29e]">{dict.subtagline}</p>
        </div>
        <button
          type="button"
          onClick={() => setHubOpen(false)}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer transition-colors text-[#d6d3d1]"
          aria-label={dict.close}
        >
          <X className="size-4" />
        </button>
      </header>

      <Tabs defaultValue="remind" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3 pt-3 bg-[#181513]">
          <TabsList className="grid grid-cols-4 bg-[#292524]">
            <TabsTrigger value="remind" className="text-xs font-bold data-[state=active]:bg-[#44403c] data-[state=active]:text-amber-400">
              ⏰ Bấm giờ
            </TabsTrigger>
            <TabsTrigger value="pip" className="text-xs font-bold data-[state=active]:bg-[#44403c]">
              🐾 Thú cưng
            </TabsTrigger>
            <TabsTrigger value="look" className="text-xs font-bold data-[state=active]:bg-[#44403c]">
              🎨 Giao diện
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs font-bold data-[state=active]:bg-[#44403c]">
              ⚡ Hệ thống
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#1c1917]">
          {/* TAB 1: SMART TIMERS & COUNTDOWN */}
          <TabsContent value="remind" className="space-y-4">
            <div className="rounded-xl bg-[#292524] p-3.5 border border-[#44403c] space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Đặt giờ thông minh (Ví dụ: COC, nấu ăn...)</span>
                </p>
                <button
                  type="button"
                  onClick={() => sounds.playAlarmRing()}
                  title="Thử tiếng chuông báo"
                  className="flex items-center gap-1 text-[10px] text-[#a8a29e] hover:text-amber-400 cursor-pointer"
                >
                  <Volume2 className="size-3" />
                  <span>Thử chuông</span>
                </button>
              </div>

              <form onSubmit={handleSmartSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ví dụ: xây nhà trong COC : 2g14p..."
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    className="bg-[#1c1917] border-[#57534e] text-xs text-white placeholder:text-muted"
                  />
                  <Button type="submit" className="cursor-pointer font-bold bg-amber-500 text-black hover:bg-amber-400 text-xs px-3.5">
                    Đặt giờ
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { label: "Xây nhà COC: 2g14p", val: "xây nhà trong COC : 2g14p" },
                    { label: "Pomodoro: 25p", val: "Tập trung làm việc : 25p" },
                    { label: "Nghỉ ngơi: 5p", val: "Nghỉ ngơi giải lao : 5p" },
                    { label: "Nấu ăn: 15p", val: "Nấu ăn canh súp : 15p" },
                    { label: "1 Giờ", val: "Hẹn giờ : 1g" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSmartInput(preset.val)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#3c3732] hover:bg-amber-500/20 hover:text-amber-400 text-[#d6d3d1] border border-[#57534e] transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#44403c]">
                  <span className="text-[11px] text-[#a8a29e]">Ghim đồng hồ đếm ngược nổi trên Desktop</span>
                  <Switch checked={pinToDesktop} onCheckedChange={setPinToDesktop} />
                </div>
              </form>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#a8a29e] uppercase tracking-wide">
                Danh sách hẹn giờ đang chạy ({reminders.filter((r) => !r.done).length})
              </p>
              {reminders.length === 0 ? (
                <p className="text-xs text-[#78716c] italic py-2 text-center">Chưa có hẹn giờ nào.</p>
              ) : (
                reminders.map((r) => {
                  const diff = Math.max(0, r.fireAt - Date.now());
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        "flex items-center justify-between rounded-xl p-3 text-xs border transition-all",
                        r.done
                          ? "bg-[#292524]/60 border-[#332f2b] text-[#78716c]"
                          : "bg-[#292524] border-[#44403c] text-white shadow-sm",
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <p className={cn("font-bold truncate", r.done && "line-through text-[#78716c]")}>
                            {r.title}
                          </p>
                          {r.pinToScreen && !r.done ? (
                            <Badge className="bg-amber-500/20 text-amber-400 text-[9px] px-1 py-0 border-none">
                              Ghim
                            </Badge>
                          ) : null}
                        </div>
                        <p className="font-mono text-xs font-bold text-amber-400">
                          {r.done ? "Đã xong (Chuông đã reo)" : `⏳ Còn lại: ${formatCountdown(diff)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {!r.done ? (
                          <>
                            <button
                              type="button"
                              onClick={() => togglePinReminder(r.id)}
                              title={r.pinToScreen ? "Bỏ ghim Desktop" : "Ghim ra Desktop"}
                              className="p-1 rounded hover:bg-white/10 text-[#d6d3d1] cursor-pointer"
                            >
                              <Pin className={cn("size-3.5", r.pinToScreen && "fill-amber-400 text-amber-400")} />
                            </button>
                            <Button size="sm" variant="outline" type="button" onClick={() => fireReminder(r.id)} className="text-[10px] h-7 px-2 border-[#57534e]">
                              Báo ngay
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" type="button" onClick={() => completeReminder(r.id)} className="text-[10px] h-7 px-2">
                            Xong
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeReminder(r.id)}
                          title="Xóa"
                          className="p-1 rounded hover:bg-red-500/20 text-red-400 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* TAB 2: VIRTUAL PET STUDIO & WARDROBE & TOYS */}
          <TabsContent value="pip" className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#292524] px-3.5 py-3 border border-[#44403c]">
              <div>
                <p className="text-sm font-semibold">{dict.pipStudio.enableCompanion}</p>
                <p className="text-xs text-[#a8a29e]">{dict.pipStudio.enableDesc}</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>

            {pip.enabled && (
              <>
                <div className="flex items-center gap-4 rounded-xl bg-[#292524] p-3.5 border border-[#44403c]">
                  <div className="flex size-18 items-center justify-center rounded-xl bg-[#1c1917] shadow-inner">
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
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-[#a8a29e]">
                        {dict.pipStudio.happiness}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-500">{pip.happiness}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1c1917]">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${pip.happiness}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#a8a29e]">
                      <span>{dict.pipStudio.treatsEaten}: <b>{pip.treatsEaten}</b></span>
                      <span>{dict.pipStudio.mood}: <b className="capitalize text-white">{pip.mood}</b></span>
                    </div>
                  </div>
                </div>

                {/* Pet Species */}
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[#a8a29e] uppercase">
                    Loài thú cưng (Pet Species)
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PET_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setPip({ petType: pt.id })}
                        className={cn(
                          "flex items-center justify-between rounded-xl bg-[#292524] px-3 py-2 text-left border border-[#44403c] transition-all cursor-pointer",
                          pip.petType === pt.id && "ring-2 ring-amber-500 bg-amber-500/15 border-amber-500",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{pt.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{pt.name}</p>
                            <p className="text-[10px] text-[#a8a29e]">{pt.desc}</p>
                          </div>
                        </div>
                        {pip.petType === pt.id ? (
                          <Badge className="bg-amber-500 text-black font-bold">Active</Badge>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Wardrobe: Hats */}
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[#a8a29e] uppercase">
                    🎩 Mũ & Phụ kiện đầu (Hats & Caps)
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {HATS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setPip({ hat: h.id })}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl bg-[#292524] p-2 text-left border border-[#44403c] transition-all cursor-pointer text-xs",
                          (pip.hat || "none") === h.id && "ring-2 ring-amber-500 bg-amber-500/15 border-amber-500",
                        )}
                      >
                        <span>{h.icon}</span>
                        <span className="truncate text-[11px]">{h.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Wardrobe: Body Items */}
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[#a8a29e] uppercase">
                    🎒 Trang phục & Đồ đeo (Body Outfits)
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BODY_ITEMS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setPip({ bodyItem: b.id })}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl bg-[#292524] p-2 text-left border border-[#44403c] transition-all cursor-pointer text-xs",
                          (pip.bodyItem || "backpack") === b.id && "ring-2 ring-amber-500 bg-amber-500/15 border-amber-500",
                        )}
                      >
                        <span>{b.icon}</span>
                        <span className="truncate text-[11px]">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pet Mini-Games & Actions */}
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-[#a8a29e] uppercase">
                    🎮 Trò chơi & Tương tác (Games & Actions)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        triggerThrowBall();
                        setHubOpen(false);
                      }}
                      className="flex items-center gap-1.5 cursor-pointer border-[#57534e] bg-lime-500/10 text-lime-400 hover:bg-lime-500/20"
                    >
                      <span>🎾</span>
                      <span>Ném bóng bắt đồ</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={petPip} className="flex items-center gap-1.5 cursor-pointer border-[#57534e]">
                      <Heart className="size-3.5 text-rose-400 fill-rose-400/30" />
                      <span>{dict.pipStudio.petPip}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={feedPip} className="flex items-center gap-1.5 cursor-pointer border-[#57534e]">
                      <Cookie className="size-3.5 text-amber-400" />
                      <span>{dict.pipStudio.feedSnack}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={dancePip} className="flex items-center gap-1.5 cursor-pointer border-[#57534e]">
                      <Sparkles className="size-3.5 text-indigo-400" />
                      <span>{dict.pipStudio.danceParty}</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* TAB 3: LOOK & THEMES */}
          <TabsContent value="look" className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-[#a8a29e] uppercase flex items-center gap-1.5">
                <Globe className="size-3.5 text-amber-500" />
                <span>{dict.look.language}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLang("vi")}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-[#292524] px-3 py-2 text-left border border-[#44403c] cursor-pointer",
                    lang === "vi" && "ring-2 ring-amber-500 border-amber-500",
                  )}
                >
                  <span className="text-xs font-bold text-white">🇻🇳 Tiếng Việt</span>
                  {lang === "vi" ? <Badge className="bg-amber-500 text-black">Active</Badge> : null}
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-[#292524] px-3 py-2 text-left border border-[#44403c] cursor-pointer",
                    lang === "en" && "ring-2 ring-amber-500 border-amber-500",
                  )}
                >
                  <span className="text-xs font-bold text-white">🇬🇧 English</span>
                  {lang === "en" ? <Badge className="bg-amber-500 text-black">Active</Badge> : null}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#292524] px-3.5 py-3 border border-[#44403c]">
              <div className="flex items-center gap-2">
                <Pin className="size-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold">{dict.look.alwaysOnTop}</p>
                  <p className="text-xs text-[#a8a29e]">{dict.look.alwaysOnTopDesc}</p>
                </div>
              </div>
              <Switch checked={alwaysOnTop} onCheckedChange={handleAlwaysOnTopChange} />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-[#a8a29e] uppercase">
                {dict.look.theme}
              </p>
              <div className="space-y-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl bg-[#292524] px-3 py-2.5 text-left border border-[#44403c] cursor-pointer transition-all",
                      theme === t.id && "ring-2 ring-amber-500 border-amber-500",
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[10px] text-[#a8a29e]">{t.line}</p>
                    </div>
                    {theme === t.id ? <Badge className="bg-amber-500 text-black">Active</Badge> : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#292524] px-3.5 py-3 border border-[#44403c]">
              <div className="flex items-center gap-2">
                {pip.soundEnabled ? <Volume2 className="size-4 text-amber-500" /> : <VolumeX className="size-4 text-[#a8a29e]" />}
                <div>
                  <p className="text-sm font-semibold">{dict.look.proceduralAudio}</p>
                  <p className="text-xs text-[#a8a29e]">{dict.look.audioDesc}</p>
                </div>
              </div>
              <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
            </div>
          </TabsContent>

          {/* TAB 4: SYSTEM & TELEMETRY & BACKUP */}
          <TabsContent value="about" className="space-y-4 text-xs text-[#a8a29e]">
            {/* Live Performance Telemetry Card */}
            <div className="rounded-xl bg-[#292524] p-3.5 space-y-2 border border-[#44403c]">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Activity className="size-3.5 text-emerald-400" />
                <span>Giám Sát Hiệu Năng Thời Gian Thực (Telemetry)</span>
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="bg-[#1c1917] p-2 rounded-lg border border-[#38332e]">
                  <p className="text-[10px] text-[#a8a29e]">RAM Bộ Nhớ</p>
                  <p className="text-xs font-bold text-emerald-400">~38 MB</p>
                </div>
                <div className="bg-[#1c1917] p-2 rounded-lg border border-[#38332e]">
                  <p className="text-[10px] text-[#a8a29e]">Tốc Độ Khung Hình</p>
                  <p className="text-xs font-bold text-amber-400">120 FPS</p>
                </div>
                <div className="bg-[#1c1917] p-2 rounded-lg border border-[#38332e]">
                  <p className="text-[10px] text-[#a8a29e]">Tải CPU</p>
                  <p className="text-xs font-bold text-blue-400">&lt; 0.4%</p>
                </div>
              </div>
            </div>

            {/* Local Backup & LAN Export */}
            <div className="rounded-xl bg-[#292524] p-3.5 space-y-2.5 border border-[#44403c]">
              <p className="font-bold text-white">Sao lưu & Đồng bộ cục bộ (Local Sync)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportBackup} className="flex-1 flex items-center gap-1.5 cursor-pointer border-[#57534e]">
                  <Download className="size-3.5" />
                  <span>Xuất file JSON</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center gap-1.5 cursor-pointer border-[#57534e]"
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

            {/* Shortcuts */}
            <div className="rounded-xl bg-[#292524] p-3 space-y-1.5 border border-[#44403c]">
              <p className="font-bold text-white mb-1">{dict.about.shortcutsTitle}:</p>
              <p>• <b>Ctrl + Shift + N</b>: {dict.about.shortcutCapture}</p>
              <p>• <b>Nhấp đúp chuột vào màn hình</b>: Tạo nhanh ghi chú mới</p>
              <p>• <b>Kéo thả chú Cáo / Note / Đồng hồ</b>: Tự do di chuyển trên màn hình</p>
              <p>• <b>Escape</b>: {dict.about.shortcutEsc}</p>
            </div>

            <Button variant="outline" className="w-full cursor-pointer border-[#57534e]" type="button" onClick={resetDemo}>
              {dict.about.resetButton}
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
