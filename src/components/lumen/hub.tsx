import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LAYOUTS, THEMES } from "@/lib/themes";
import { useLumen } from "@/lib/store";
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
        "inset-x-3 bottom-16 top-auto max-h-[min(560px,calc(100%-5.5rem))] rounded-xl sm:inset-auto sm:top-16 sm:left-6 sm:h-[520px] sm:w-[380px]",
      )}
      role="dialog"
      aria-label="Lumen hub"
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-display text-lg font-medium tracking-tight">Lumen</p>
          <p className="text-xs text-muted">Desk companion · local only</p>
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
      <Tabs defaultValue="look" className="flex min-h-0 flex-1 flex-col">
        <div className="px-3 pt-3">
          <TabsList>
            <TabsTrigger value="look">Look</TabsTrigger>
            <TabsTrigger value="pip">Pip</TabsTrigger>
            <TabsTrigger value="remind">Remind</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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
            <p className="text-xs text-subtle">{notes.length} notes on this desk</p>
          </TabsContent>

          <TabsContent value="pip" className="space-y-5">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-elevated px-3 py-3">
              <div>
                <p className="text-sm font-medium">Show Pip</p>
                <p className="text-xs text-muted">Walks the desk. Click to fetch a note.</p>
              </div>
              <Switch checked={pip.enabled} onCheckedChange={setPipEnabled} />
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Pip is a desktop pet. In a real install this is a tiny always-on-top window the
              core moves around your monitors — toggle off and the process is gone.
            </p>
            <Button onClick={requestNoteFromPip} disabled={!pip.enabled} className="w-full">
              Ask Pip for a note
            </Button>
          </TabsContent>

          <TabsContent value="remind" className="space-y-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const t = title.trim();
                if (!t) return;
                addReminder(t, 8000);
                setTitle("");
              }}
            >
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Remind me in 8 seconds…"
                aria-label="Reminder title"
              />
              <Button type="submit" size="sm" className="h-10 shrink-0">
                Add
              </Button>
            </form>
            <ul className="space-y-2">
              {reminders.length === 0 ? (
                <li className="text-sm text-muted">No reminders yet.</li>
              ) : (
                reminders.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-elevated px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className={cn("truncate text-sm", r.done && "text-subtle line-through")}>
                        {r.title}
                      </p>
                      <p className="text-[11px] text-subtle tabular-nums">
                        {r.done ? "Done" : new Date(r.fireAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!r.done ? (
                      <Button size="sm" variant="secondary" onClick={() => fireReminder(r.id)}>
                        Fire
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => completeReminder(r.id)}>
                        Hide
                      </Button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </TabsContent>

          <TabsContent value="about" className="space-y-3 text-sm leading-relaxed text-muted">
            <p>
              This preview simulates a tray companion: stickies, themes, reminders, and Pip
              fetching paper across the desk.
            </p>
            <p>
              A shipped Windows build would use Tauri 2 — Rust core idle in the tray, WebView
              only when a window is open. Target idle RAM is under 40 MB with Pip off.
            </p>
            <Button variant="outline" onClick={resetDemo} className="w-full">
              Reset demo
            </Button>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
