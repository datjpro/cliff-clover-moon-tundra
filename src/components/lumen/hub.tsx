import { useState, useRef } from "react";
import { Cookie, Download, Globe, Heart, Moon, Pin, Sparkles, Sun, Upload, Volume2, VolumeX, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleAlwaysOnTop } from "@/lib/desktop-bridge";
import { DICTIONARY } from "@/lib/i18n";
import { LAYOUTS, THEMES } from "@/lib/themes";
import { useLumen } from "@/lib/store";
import type { PetType } from "@/lib/types";
import { PipFigure } from "./pip";
import { cn } from "@/lib/utils";

const PET_TYPES: { id: PetType; name: string; icon: string; desc: string }[] = [
  { id: "fox", name: "Cáo Nhỏ (Fox)", icon: "🦊", desc: "Chú cáo thám hiểm đeo ba lô vàng" },
  { id: "cat", name: "Mèo Mướp (Cat)", icon: "🐱", desc: "Mèo tam thể ngoan ngoãn vẫy đuôi" },
  { id: "shiba", name: "Chó Shiba", icon: "🐕", desc: "Shiba vàng đeo khăn quàng đỏ" },
  { id: "dragon", name: "Rồng Con (Dragon)", icon: "🐉", desc: "Rồng xanh ngộ nghĩnh có cánh nhỏ" },
  { id: "cyber", name: "Cyber Bot", icon: "🤖", desc: "Robot tương lai phát sáng neon" },
];

export function Hub() {
  const open = useLumen((s) => s.hubOpen);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const lang = useLumen((s) => s.lang);
  const setLang = useLumen((s) => s.setLang);
  const theme = useLumen((s) => s.theme);
  const setTheme = useLumen((s) => s.setTheme);
  const layout = useLumen((s) => s.layout);
  const setLayout = useLumen((s) => s.setLayout);
  const alwaysOnTop = useLumen((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useLumen((s) => s.setAlwaysOnTop);
  const transparentOverlay = useLumen((s) => s.transparentOverlay);
  const setTransparentOverlay = useLumen((s) => s.setTransparentOverlay);
  const pip = useLumen((s) => s.pip);
  const setPip = useLumen((s) => s.setPip);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const feedPip = useLumen((s) => s.feedPip);
  const petPip = useLumen((s) => s.petPip);
  const dancePip = useLumen((s) => s.dancePip);
  const toggleSound = useLumen((s) => s.toggleSound);
  const requestNoteFromPip = useLumen((s) => s.requestNoteFromPip);
  const notes = useLumen((s) => s.notes);
  const reminders = useLumen((s) => s.reminders);
  const addReminder = useLumen((s) => s.addReminder);
  const fireReminder = useLumen((s) => s.fireReminder);
  const completeReminder = useLumen((s) => s.completeReminder);
  const resetDemo = useLumen((s) => s.resetDemo);
  const pushToast = useLumen((s) => s.pushToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");

  const dict = DICTIONARY[lang];

  if (!open) return null;

  const handleAlwaysOnTopChange = (val: boolean) => {
    setAlwaysOnTop(val);
    void toggleAlwaysOnTop(val);
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
        "absolute z-[90] flex flex-col overflow-hidden bg-surface/95 text-fg shadow-[0_24px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-border",
        "inset-x-3 bottom-16 top-auto max-h-[min(640px,calc(100%-5.5rem))] rounded-2xl sm:inset-auto sm:top-16 sm:left-8 sm:h-[600px] sm:w-[460px]",
      )}
      role="dialog"
      aria-label="Lumen Hub Settings"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="font-display text-base font-bold tracking-tight flex items-center gap-1.5">
            <span>🦊</span> {dict.appName}
          </p>
          <p className="text-xs text-muted">{dict.subtagline}</p>
        </div>
        <button
          type="button"
          onClick={() => setHubOpen(false)}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-elevated cursor-pointer transition-colors"
          aria-label={dict.close}
        >
          <X className="size-4" />
        </button>
      </header>

      <Tabs defaultValue="pip" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3 pt-3">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="pip">{dict.tabs.pip}</TabsTrigger>
            <TabsTrigger value="look">{dict.tabs.look}</TabsTrigger>
            <TabsTrigger value="remind">{dict.tabs.remind}</TabsTrigger>
            <TabsTrigger value="about">{dict.tabs.about}</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* TAB 1: VIRTUAL PET STUDIO */}
          <TabsContent value="pip" className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-elevated px-3.5 py-3 ring-1 ring-border">
              <div>
                <p className="text-sm font-semibold">{dict.pipStudio.enableCompanion}</p>
                <p className="text-xs text-muted">{dict.pipStudio.enableDesc}</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>

            {pip.enabled && (
              <>
                {/* Live Pet Preview Card */}
                <div className="flex items-center gap-4 rounded-xl bg-elevated/70 p-3.5 ring-1 ring-border">
                  <div className="flex size-18 items-center justify-center rounded-xl bg-surface/90 shadow-inner">
                    <PipFigure
                      walking={false}
                      carrying={pip.carrying}
                      facing={1}
                      mood={pip.mood}
                      petType={pip.petType}
                      className="scale-95"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-muted">
                        {dict.pipStudio.happiness}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-500">{pip.happiness}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${pip.happiness}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted">
                      <span>{dict.pipStudio.treatsEaten}: <b>{pip.treatsEaten}</b></span>
                      <span>{dict.pipStudio.mood}: <b className="capitalize text-fg">{pip.mood}</b></span>
                    </div>
                  </div>
                </div>

                {/* Pet Species Selection */}
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                    Loài thú cưng (Pet Species)
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PET_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setPip({ petType: pt.id })}
                        className={cn(
                          "flex items-center justify-between rounded-xl bg-elevated px-3 py-2 text-left ring-1 ring-border transition-all cursor-pointer",
                          pip.petType === pt.id && "ring-2 ring-amber-500 bg-amber-500/10",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{pt.icon}</span>
                          <div>
                            <p className="text-xs font-bold">{pt.name}</p>
                            <p className="text-[10px] text-muted">{pt.desc}</p>
                          </div>
                        </div>
                        {pip.petType === pt.id ? (
                          <Badge className="bg-amber-500 text-black font-bold">Active</Badge>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Pet Actions */}
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                    {dict.pipStudio.petInteractions}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={petPip} className="flex items-center gap-1.5 cursor-pointer">
                      <Heart className="size-3.5 text-rose-400 fill-rose-400/30" />
                      <span>{dict.pipStudio.petPip}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={feedPip} className="flex items-center gap-1.5 cursor-pointer">
                      <Cookie className="size-3.5 text-amber-400" />
                      <span>{dict.pipStudio.feedSnack}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={dancePip} className="flex items-center gap-1.5 cursor-pointer">
                      <Sparkles className="size-3.5 text-indigo-400" />
                      <span>{dict.pipStudio.danceParty}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPip({ mood: pip.mood === "sleep" ? "wander" : "sleep" })}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      {pip.mood === "sleep" ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5 text-blue-400" />}
                      <span>{pip.mood === "sleep" ? "Đánh thức" : "Cho ngủ"}</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* TAB 2: LOOK & THEMES & TRANSPARENCY */}
          <TabsContent value="look" className="space-y-4">
            {/* Language */}
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase flex items-center gap-1.5">
                <Globe className="size-3.5 text-amber-500" />
                <span>{dict.look.language}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLang("vi")}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-elevated px-3 py-2 text-left ring-1 ring-border cursor-pointer",
                    lang === "vi" && "ring-2 ring-amber-500",
                  )}
                >
                  <span className="text-xs font-bold">🇻🇳 Tiếng Việt</span>
                  {lang === "vi" ? <Badge className="bg-amber-500 text-black">Active</Badge> : null}
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={cn(
                    "flex items-center justify-between rounded-xl bg-elevated px-3 py-2 text-left ring-1 ring-border cursor-pointer",
                    lang === "en" && "ring-2 ring-amber-500",
                  )}
                >
                  <span className="text-xs font-bold">🇬🇧 English</span>
                  {lang === "en" ? <Badge className="bg-amber-500 text-black">Active</Badge> : null}
                </button>
              </div>
            </div>

            {/* Transparent Overlay Switch */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-elevated px-3.5 py-3 ring-1 ring-border">
              <div>
                <p className="text-sm font-semibold">Màn hình trong suốt (Transparent Screen)</p>
                <p className="text-xs text-muted">Hiển thị trực tiếp trên hình nền Windows</p>
              </div>
              <Switch checked={transparentOverlay} onCheckedChange={setTransparentOverlay} />
            </div>

            {/* Always on top */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-elevated px-3.5 py-3 ring-1 ring-border">
              <div className="flex items-center gap-2">
                <Pin className="size-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold">{dict.look.alwaysOnTop}</p>
                  <p className="text-xs text-muted">{dict.look.alwaysOnTopDesc}</p>
                </div>
              </div>
              <Switch checked={alwaysOnTop} onCheckedChange={handleAlwaysOnTopChange} />
            </div>

            {/* Themes */}
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
                {dict.look.theme}
              </p>
              <div className="space-y-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl bg-elevated px-3 py-2.5 text-left ring-1 ring-border cursor-pointer transition-all",
                      theme === t.id && "ring-2 ring-amber-500",
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold">{t.name}</p>
                      <p className="text-[10px] text-muted">{t.line}</p>
                    </div>
                    {theme === t.id ? <Badge className="bg-amber-500 text-black">Active</Badge> : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Procedural Audio */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-elevated px-3.5 py-3 ring-1 ring-border">
              <div className="flex items-center gap-2">
                {pip.soundEnabled ? <Volume2 className="size-4 text-amber-500" /> : <VolumeX className="size-4 text-muted" />}
                <div>
                  <p className="text-sm font-semibold">{dict.look.proceduralAudio}</p>
                  <p className="text-xs text-muted">{dict.look.audioDesc}</p>
                </div>
              </div>
              <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
            </div>
          </TabsContent>

          {/* TAB 3: REMINDERS */}
          <TabsContent value="remind" className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim()) return;
                addReminder(title.trim(), 2 * 60 * 1000);
                setTitle("");
              }}
              className="flex gap-2"
            >
              <Input
                placeholder={dict.remindPlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button type="submit" className="cursor-pointer font-bold bg-amber-500 text-black hover:bg-amber-400">
                {dict.add}
              </Button>
            </form>
            <div className="space-y-2">
              {reminders.map((r) => {
                const diff = Math.max(0, Math.round((r.fireAt - Date.now()) / 1000));
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-elevated px-3.5 py-2.5 text-xs ring-1 ring-border"
                  >
                    <div>
                      <p className={r.done ? "line-through text-muted" : "font-semibold"}>{r.title}</p>
                      <p className="text-[10px] text-muted">
                        {r.done ? dict.fired : `${dict.reminderIn} ~${Math.ceil(diff / 60)}m (${diff}s)`}
                      </p>
                    </div>
                    {!r.done ? (
                      <Button size="sm" variant="outline" type="button" onClick={() => fireReminder(r.id)}>
                        {dict.fireNow}
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" type="button" onClick={() => completeReminder(r.id)}>
                        {dict.dismiss}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 4: BACKUP & ABOUT */}
          <TabsContent value="about" className="space-y-4 text-xs text-muted">
            <p className="leading-relaxed">{dict.about.desc}</p>

            {/* Local Backup & Restore */}
            <div className="rounded-xl bg-elevated p-3.5 space-y-2.5 ring-1 ring-border">
              <p className="font-bold text-fg">Sao lưu & Khôi phục cục bộ (100% Offline)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportBackup} className="flex-1 flex items-center gap-1.5 cursor-pointer">
                  <Download className="size-3.5" />
                  <span>Xuất file JSON</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center gap-1.5 cursor-pointer"
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
            <div className="rounded-xl bg-elevated p-3 space-y-1.5 ring-1 ring-border">
              <p className="font-bold text-fg mb-1">{dict.about.shortcutsTitle}:</p>
              <p>• <b>Ctrl + Shift + N</b>: {dict.about.shortcutCapture}</p>
              <p>• <b>Nhấp đúp chuột vào màn hình</b>: Tạo nhanh ghi chú mới</p>
              <p>• <b>Kéo thả chú Cáo / Note</b>: Tự do di chuyển trên màn hình</p>
              <p>• <b>Escape</b>: {dict.about.shortcutEsc}</p>
            </div>

            <Button variant="outline" className="w-full cursor-pointer" type="button" onClick={resetDemo}>
              {dict.about.resetButton}
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
