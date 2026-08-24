import { useState } from "react";
import { Cookie, Heart, Music, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LAYOUTS, THEMES } from "@/lib/themes";
import { PET_SKINS, useLumen } from "@/lib/store";
import { PipFigure } from "./pip";
import { cn } from "@/lib/utils";

export function Hub() {
  const open = useLumen((s) => s.hubOpen);
  const setHubOpen = useLumen((s) => s.setHubOpen);
  const theme = useLumen((s) => s.theme);
  const setTheme = useLumen((s) => s.setTheme);
  const layout = useLumen((s) => s.layout);
  const setLayout = useLumen((s) => s.setLayout);
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

  if (!open) return null;

  return (
    <section
      className={cn(
        "absolute z-[70] flex flex-col overflow-hidden bg-surface text-fg shadow-[var(--shadow-float)]",
        "inset-x-3 bottom-16 top-auto max-h-[min(600px,calc(100%-5.5rem))] rounded-xl sm:inset-auto sm:top-16 sm:left-6 sm:h-[560px] sm:w-[400px]",
      )}
      role="dialog"
      aria-label="Lumen hub"
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg font-medium tracking-tight">Lumen Hub</p>
          <p className="text-xs text-muted">Desk Companion & Spatial Workspace</p>
        </div>
        <button
          type="button"
          onClick={() => setHubOpen(false)}
          className="flex size-9 items-center justify-center rounded-md hover:bg-elevated"
          aria-label="Close hub"
        >
          <X className="size-4" />
        </button>
      </header>
      <Separator />
      <Tabs defaultValue="pip" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3 pt-3">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="pip">Pip</TabsTrigger>
            <TabsTrigger value="look">Look</TabsTrigger>
            <TabsTrigger value="remind">Remind</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {/* PET COMPANION STUDIO TAB */}
          <TabsContent value="pip" className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
              <div>
                <p className="text-sm font-medium">Enable Companion</p>
                <p className="text-xs text-muted">Pip roams your desk and fetches notes</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>

            {pip.enabled ? (
              <>
                {/* Pet Status Card & Preview */}
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
                      <span className="text-xs font-semibold tracking-wide uppercase text-muted">Happiness</span>
                      <span className="text-xs font-mono text-emerald-400">{pip.happiness}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${pip.happiness}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted">
                      <span>Treats Eaten: <b>{pip.treatsEaten}</b></span>
                      <span>Mood: <b className="capitalize text-fg">{pip.mood}</b></span>
                    </div>
                  </div>
                </div>

                {/* Pet Quick Actions */}
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Pet Interactions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={petPip}
                      className="flex items-center gap-1.5 justify-center"
                    >
                      <Heart className="size-3.5 text-rose-400 fill-rose-400/30" />
                      <span>Pet Pip</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={feedPip}
                      className="flex items-center gap-1.5 justify-center"
                    >
                      <Cookie className="size-3.5 text-amber-400" />
                      <span>Feed Snack</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={dancePip}
                      className="flex items-center gap-1.5 justify-center"
                    >
                      <Sparkles className="size-3.5 text-indigo-400" />
                      <span>Dance Party</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestNoteFromPip}
                      className="flex items-center gap-1.5 justify-center"
                    >
                      <Music className="size-3.5 text-emerald-400" />
                      <span>Fetch Note</span>
                    </Button>
                  </div>
                </div>

                {/* Pet Skin Selector */}
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Pet Skin & Palette</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {PET_SKINS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPipSkin(s.id)}
                        className={cn(
                          "flex items-center justify-between rounded-lg bg-elevated px-3 py-2 text-left shadow-[var(--shadow-border)] transition-all",
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
                        {pip.skin === s.id ? <Badge className="bg-accent/20 text-accent">Active</Badge> : null}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted text-center py-6">Enable Pip above to interact with your desktop companion.</p>
            )}
          </TabsContent>

          {/* LOOK & THEME TAB */}
          <TabsContent value="look" className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "rounded-lg bg-elevated px-3 py-3 text-left shadow-[var(--shadow-border)]",
                      theme === t.id && "ring-2 ring-accent",
                    )}
                  >
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.line}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Layout</p>
              <div className="space-y-2">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLayout(l.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg bg-elevated px-3 py-3 text-left shadow-[var(--shadow-border)]",
                      layout === l.id && "ring-2 ring-accent",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium">{l.name}</span>
                      <span className="block text-xs text-muted">{l.line}</span>
                    </span>
                    {layout === l.id ? <Badge>On</Badge> : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Effects Switch */}
            <div className="flex items-center justify-between gap-3 rounded-lg bg-elevated px-3 py-3 shadow-[var(--shadow-border)]">
              <div className="flex items-center gap-2">
                {pip.soundEnabled ? <Volume2 className="size-4 text-accent" /> : <VolumeX className="size-4 text-muted" />}
                <div>
                  <p className="text-sm font-medium">Procedural Audio</p>
                  <p className="text-xs text-muted">Tactile sound effects & pet purrs</p>
                </div>
              </div>
              <Switch checked={pip.soundEnabled} onCheckedChange={(val) => toggleSound(val)} />
            </div>

            <p className="text-xs text-subtle">{notes.length} notes currently on desk</p>
          </TabsContent>

          {/* REMINDERS TAB */}
          <TabsContent value="remind" className="space-y-4">
            <p className="text-xs text-muted">
              Reminders trigger a toast and ask Pip to gently nudge you.
            </p>
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
                placeholder="In 2 minutes: stretch, hydrate…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button type="submit">Add</Button>
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
                        {r.done ? "Fired" : `in ~${Math.ceil(diff / 60)}m (${diff}s)`}
                      </p>
                    </div>
                    {!r.done ? (
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => fireReminder(r.id)}
                      >
                        Fire now
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => completeReminder(r.id)}
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="space-y-4 text-sm text-muted">
            <p className="leading-relaxed">
              <strong className="text-fg">Lumen</strong> is a desktop spatial workspace built for focus, warmth, and craftmanship. All notes stay strictly on your device.
            </p>
            <div className="rounded-lg bg-elevated p-3 text-xs space-y-1">
              <p>• <b>Ctrl + Shift + N</b>: Quick Capture</p>
              <p>• <b>Click / Double-click Pip</b>: Pet & Snack Menu</p>
              <p>• <b>Escape</b>: Close Hub & Overlays</p>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={resetDemo}>
              Reset Demo to Seed Notes
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
