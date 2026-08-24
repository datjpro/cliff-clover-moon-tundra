import { useState } from "react";
import { Cookie, Globe, Heart, Music, Pin, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleAlwaysOnTop } from "@/lib/desktop-bridge";
import { DICTIONARY, type Language } from "@/lib/i18n";
import { LAYOUTS, THEMES } from "@/lib/themes";
import { PET_SKINS, useLumen } from "@/lib/store";
import { PipFigure } from "./pip";
import { cn } from "@/lib/utils";

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
  const pip = useLumen((s) => s.pip);
  const setPipEnabled = useLumen((s) => s.setPipEnabled);
  const setPipSkin = useLumen((s) => s.setPipSkin);
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
  const [title, setTitle] = useState("");

  const dict = DICTIONARY[lang];

  if (!open) return null;

  const handleAlwaysOnTopChange = (val: boolean) => {
    setAlwaysOnTop(val);
    void toggleAlwaysOnTop(val);
  };

  return (
    <section
      className={cn(
        "absolute z-[70] flex flex-col overflow-hidden bg-surface text-fg shadow-[var(--shadow-float)]",
        "inset-x-3 bottom-16 top-auto max-h-[min(600px,calc(100%-5.5rem))] rounded-xl sm:inset-auto sm:top-16 sm:left-6 sm:h-[560px] sm:w-[420px]",
      )}
      role="dialog"
      aria-label="Lumen hub"
    >
      {/* Hub Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg font-medium tracking-tight">{dict.appName}</p>
          <p className="text-xs text-muted">{dict.subtagline}</p>
        </div>
        <button
          type="button"
          onClick={() => setHubOpen(false)}
          className="flex size-9 items-center justify-center rounded-md hover:bg-elevated cursor-pointer"
          aria-label={dict.close}
        >
          <X className="size-4" />
        </button>
      </header>
      <Separator />

      <Tabs defaultValue="pip" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3 pt-3">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="pip">{dict.tabs.pip}</TabsTrigger>
            <TabsTrigger value="look">{dict.tabs.look}</TabsTrigger>
            <TabsTrigger value="remind">{dict.tabs.remind}</TabsTrigger>
            <TabsTrigger value="about">{dict.tabs.about}</TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {/* TAB 1: PIP COMPANION STUDIO */}
          <TabsContent value="pip" className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
              <div>
                <p className="text-sm font-medium">{dict.pipStudio.enableCompanion}</p>
                <p className="text-xs text-muted">{dict.pipStudio.enableDesc}</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>

            {pip.enabled ? (
              <>
                {/* Pet Status Card & Live Avatar Preview */}
                <div className="flex items-center gap-4 rounded-xl bg-elevated/70 p-3 ring-1 ring-border">
                  <div className="flex size-16 items-center justify-center rounded-lg bg-surface shadow-inner">
                    <PipFigure
                      walking={false}
                      carrying={pip.carrying}
                      facing={1}
                      mood={pip.mood}
                      skin={pip.skin}
                      className="scale-90"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide uppercase text-muted">
                        {dict.pipStudio.happiness}
                      </span>
                      <span className="text-xs font-mono text-emerald-400">{pip.happiness}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${pip.happiness}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted">
                      <span>
                        {dict.pipStudio.treatsEaten}: <b>{pip.treatsEaten}</b>
                      </span>
                      <span>
                        {dict.pipStudio.mood}: <b className="capitalize text-fg">{pip.mood}</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Pet Interactions */}
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                    {dict.pipStudio.petInteractions}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={petPip}
                      className="flex items-center gap-1.5 justify-center cursor-pointer"
                    >
                      <Heart className="size-3.5 text-rose-400 fill-rose-400/30" />
                      <span>{dict.pipStudio.petPip}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={feedPip}
                      className="flex items-center gap-1.5 justify-center cursor-pointer"
                    >
                      <Cookie className="size-3.5 text-amber-400" />
                      <span>{dict.pipStudio.feedSnack}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={dancePip}
                      className="flex items-center gap-1.5 justify-center cursor-pointer"
                    >
                      <Sparkles className="size-3.5 text-indigo-400" />
                      <span>{dict.pipStudio.danceParty}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestNoteFromPip}
                      className="flex items-center gap-1.5 justify-center cursor-pointer"
                    >
                      <Music className="size-3.5 text-emerald-400" />
                      <span>{dict.pipStudio.fetchNote}</span>
                    </Button>
                  </div>
                </div>

                {/* Pet Skins Palette */}
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                    {dict.pipStudio.skinsAndPalette}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PET_SKINS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPipSkin(s.id)}
                        className={cn(
                          "flex items-center justify-between rounded-lg bg-elevated px-3 py-2 text-left shadow-[var(--shadow-border)] transition-all cursor-pointer",
                          pip.skin === s.id && "ring-2 ring-accent",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="size-4 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: s.bodyColor }}
                          />
                          <span className="text-xs font-medium">{s.name}</span>
                        </div>
                        {pip.skin === s.id ? (
                          <Badge className="bg-accent/20 text-accent">{dict.active}</Badge>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted text-center py-6">{dict.pipStudio.disabledDesc}</p>
            )}
          </TabsContent>

          {/* TAB 2: LOOK & LANGUAGE & DESKTOP SETTINGS */}
          <TabsContent value="look" className="space-y-5">
            {/* Language Switcher */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase flex items-center gap-1.5">
                <Globe className="size-3.5 text-accent" />
                <span>{dict.look.language}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLang("vi")}
                  className={cn(
                    "flex items-center justify-between rounded-lg bg-elevated px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-all cursor-pointer",
                    lang === "vi" && "ring-2 ring-accent",
                  )}
                >
                  <span className="text-sm font-medium">🇻🇳 Tiếng Việt</span>
                  {lang === "vi" ? <Badge className="bg-accent/20 text-accent">Active</Badge> : null}
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={cn(
                    "flex items-center justify-between rounded-lg bg-elevated px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-all cursor-pointer",
                    lang === "en" && "ring-2 ring-accent",
                  )}
                >
                  <span className="text-sm font-medium">🇬🇧 English</span>
                  {lang === "en" ? <Badge className="bg-accent/20 text-accent">Active</Badge> : null}
                </button>
              </div>
            </div>

            {/* Always-on-top Desktop Pin */}
            <div className="flex items-center justify-between gap-3 rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center gap-2">
                <Pin className="size-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">{dict.look.alwaysOnTop}</p>
                  <p className="text-xs text-muted">{dict.look.alwaysOnTopDesc}</p>
                </div>
              </div>
              <Switch checked={alwaysOnTop} onCheckedChange={handleAlwaysOnTopChange} />
            </div>

            {/* Themes */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                {dict.look.theme}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "rounded-lg bg-elevated px-3 py-3 text-left shadow-[var(--shadow-border)] cursor-pointer transition-all",
                      theme === t.id && "ring-2 ring-accent",
                    )}
                  >
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.line}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Layouts */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                {dict.look.layout}
              </p>
              <div className="space-y-2">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLayout(l.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg bg-elevated px-3 py-3 text-left shadow-[var(--shadow-border)] cursor-pointer transition-all",
                      layout === l.id && "ring-2 ring-accent",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium">{l.name}</span>
                      <span className="block text-xs text-muted">{l.line}</span>
                    </span>
                    {layout === l.id ? <Badge className="bg-accent/20 text-accent">{dict.on}</Badge> : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Procedural Audio Switch */}
            <div className="flex items-center justify-between gap-3 rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center gap-2">
                {pip.soundEnabled ? (
                  <Volume2 className="size-4 text-accent" />
                ) : (
                  <VolumeX className="size-4 text-muted" />
                )}
                <div>
                  <p className="text-sm font-medium">{dict.look.proceduralAudio}</p>
                  <p className="text-xs text-muted">{dict.look.audioDesc}</p>
                </div>
              </div>
              <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
            </div>

            <p className="text-xs text-subtle">{notes.length} {dict.notesOnDesk}</p>
          </TabsContent>

          {/* TAB 3: REMINDERS */}
          <TabsContent value="remind" className="space-y-4">
            <p className="text-xs text-muted">{dict.remindHint}</p>
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
              <Button type="submit" className="cursor-pointer">
                {dict.add}
              </Button>
            </form>
            <div className="space-y-2">
              {reminders.map((r) => {
                const diff = Math.max(0, Math.round((r.fireAt - Date.now()) / 1000));
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg bg-elevated px-3 py-2 text-sm shadow-[var(--shadow-border)]"
                  >
                    <div>
                      <p className={r.done ? "line-through text-muted" : "font-medium"}>{r.title}</p>
                      <p className="text-xs text-muted">
                        {r.done ? dict.fired : `${dict.reminderIn} ~${Math.ceil(diff / 60)}m (${diff}s)`}
                      </p>
                    </div>
                    {!r.done ? (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        className="cursor-pointer"
                        onClick={() => fireReminder(r.id)}
                      >
                        {dict.fireNow}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        className="cursor-pointer"
                        onClick={() => completeReminder(r.id)}
                      >
                        {dict.dismiss}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 4: ABOUT & SHORTCUTS */}
          <TabsContent value="about" className="space-y-4 text-sm text-muted">
            <p className="leading-relaxed">{dict.about.desc}</p>
            <div className="rounded-lg bg-elevated p-3 text-xs space-y-1.5">
              <p className="font-semibold text-fg mb-1">{dict.about.shortcutsTitle}:</p>
              <p>• <b>Ctrl + Shift + N</b>: {dict.about.shortcutCapture}</p>
              <p>• <b>Click / Double-click Pip</b>: {dict.about.shortcutPet}</p>
              <p>• <b>Escape</b>: {dict.about.shortcutEsc}</p>
            </div>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
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
