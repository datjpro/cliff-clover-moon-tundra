import { useState, useMemo, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Check,
  Download,
  Upload,
  StickyNote as NoteIcon,
  Filter,
  Sparkles,
  Bell,
  RotateCcw,
  Repeat,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useLumen } from "@/lib/store";
import { DICTIONARY } from "@/lib/i18n";
import { sounds } from "@/lib/audio";
import {
  buildCalendarLookup,
  CATEGORY_META,
  formatDateKey,
  formatTimeKey,
  getCalendarGridDays,
  parseDateKey,
  parseICalendar,
} from "@/lib/calendar-utils";
import type { CalendarEvent, CalendarEventCategory, CalendarViewMode, RecurrenceRule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function CalendarHub() {
  const lang = useLumen((s) => s.lang);
  const calendarEvents = useLumen((s) => s.calendarEvents);
  const notes = useLumen((s) => s.notes);
  const selectedDateKey = useLumen((s) => s.selectedCalendarDate);
  const setSelectedDateKey = useLumen((s) => s.setSelectedCalendarDate);
  const viewMode = useLumen((s) => s.calendarViewMode);
  const setViewMode = useLumen((s) => s.setCalendarViewMode);
  const filter = useLumen((s) => s.calendarFilter);
  const setFilter = useLumen((s) => s.setCalendarFilter);

  const addCalendarEvent = useLumen((s) => s.addCalendarEvent);
  const updateCalendarEvent = useLumen((s) => s.updateCalendarEvent);
  const deleteCalendarEvent = useLumen((s) => s.deleteCalendarEvent);
  const toggleCalendarEventComplete = useLumen((s) => s.toggleCalendarEventComplete);
  const importCalendarEvents = useLumen((s) => s.importCalendarEvents);
  const exportCalendarEventsICS = useLumen((s) => s.exportCalendarEventsICS);
  const createNoteFromEvent = useLumen((s) => s.createNoteFromEvent);
  const bringNote = useLumen((s) => s.bringNote);

  const dict = DICTIONARY[lang];
  const isVi = lang === "vi";

  // State for active month viewing (can be navigated independently of selected date)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => parseDateKey(selectedDateKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(selectedDateKey);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(selectedDateKey);
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState<CalendarEventCategory>("work");
  const [recurrence, setRecurrence] = useState<RecurrenceRule>("none");
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(10);

  const icsInputRef = useRef<HTMLInputElement>(null);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  // Compute 42 grid days for current month view
  const gridDays = useMemo(() => {
    return getCalendarGridDays(currentMonthDate.getFullYear(), currentMonthDate.getMonth());
  }, [currentMonthDate]);

  // Lookup map for fast O(1) rendering
  const lookup = useMemo(() => {
    return buildCalendarLookup(calendarEvents, notes, currentMonthDate);
  }, [calendarEvents, notes, currentMonthDate]);

  // Filtered events for the selected date
  const selectedDayItems = useMemo(() => {
    const rawItems = lookup.get(selectedDateKey) ?? [];
    return rawItems.filter((entry) => {
      if (entry.type === "event") {
        if (filter.category && filter.category !== "all" && entry.item.category !== filter.category) {
          return false;
        }
        if (!filter.showCompleted && entry.item.completed) {
          return false;
        }
        if (filter.searchQuery && filter.searchQuery.trim()) {
          const q = filter.searchQuery.toLowerCase();
          return (
            entry.item.title.toLowerCase().includes(q) ||
            (entry.item.description && entry.item.description.toLowerCase().includes(q))
          );
        }
      }
      return true;
    });
  }, [lookup, selectedDateKey, filter]);

  // Navigation handlers
  const handlePrevMonth = () => {
    sounds.playPop(520);
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    sounds.playPop(560);
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    sounds.playChime();
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
  };

  // Open modal for new event
  const handleOpenCreateModal = (presetDate?: string) => {
    sounds.playPop(580);
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    const targetDate = presetDate || selectedDateKey;
    setStartDate(targetDate);
    setEndDate(targetDate);
    setStartTime(formatTimeKey(new Date()));
    setEndTime("");
    setAllDay(false);
    setCategory("work");
    setRecurrence("none");
    setAlarmEnabled(true);
    setReminderMinutesBefore(10);
    setModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (event: CalendarEvent) => {
    sounds.playPop(520);
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    setStartDate(event.startDate);
    setEndDate(event.endDate || event.startDate);
    setStartTime(event.startTime || "09:00");
    setEndTime(event.endTime || "");
    setAllDay(event.allDay ?? false);
    setCategory(event.category);
    setRecurrence(event.recurrence || "none");
    setAlarmEnabled(event.alarmEnabled ?? false);
    setReminderMinutesBefore(event.reminderMinutesBefore ?? 10);
    setModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEventId) {
      updateCalendarEvent(editingEventId, {
        title: title.trim(),
        description: description.trim(),
        startDate,
        startTime: allDay ? undefined : startTime,
        endDate: endDate || startDate,
        endTime: allDay ? undefined : endTime,
        allDay,
        category,
        recurrence,
        alarmEnabled,
        reminderMinutesBefore,
      });
    } else {
      addCalendarEvent({
        title: title.trim(),
        description: description.trim(),
        startDate,
        startTime: allDay ? undefined : startTime,
        endDate: endDate || startDate,
        endTime: allDay ? undefined : endTime,
        allDay,
        category,
        recurrence,
        alarmEnabled,
        reminderMinutesBefore,
        completed: false,
      });
    }

    setModalOpen(false);
  };

  const handleExportICS = () => {
    const icsData = exportCalendarEventsICS();
    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lumen_calendar_${formatDateKey(new Date())}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportICSFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseICalendar(content);
        importCalendarEvents(parsed);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const monthName = isVi
    ? `Tháng ${currentMonthDate.getMonth() + 1}, ${currentMonthDate.getFullYear()}`
    : currentMonthDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const weekHeaders = isVi
    ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Hidden ICS File Input */}
      <input
        type="file"
        ref={icsInputRef}
        onChange={handleImportICSFile}
        accept=".ics,text/calendar"
        className="hidden"
      />

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#262A35]/50 border border-white/6">
        {/* Month Navigator */}
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrevMonth}
            className="size-7 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623]"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="text-xs font-bold text-[#F4F5F7] tracking-tight min-w-[120px] text-center">
            {monthName}
          </span>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleNextMonth}
            className="size-7 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623]"
          >
            <ChevronRight className="size-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleGoToday}
            className="h-7 text-[11px] px-2 rounded-lg bg-white/5 hover:bg-[#F5A623]/20 hover:text-[#F5A623] text-[#8B90A0] border border-white/5"
          >
            {dict.calendar.today}
          </Button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#14161D] p-0.5 rounded-xl border border-white/5">
          {(["month", "agenda", "day"] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all duration-140 cursor-pointer",
                viewMode === mode
                  ? "bg-[#F5A623] text-[#14161D] shadow-xs"
                  : "text-[#8B90A0] hover:text-[#F4F5F7]"
              )}
            >
              {mode === "month"
                ? dict.calendar.monthView
                : mode === "agenda"
                ? dict.calendar.agendaView
                : dict.calendar.dayView}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={() => handleOpenCreateModal()}
            className="h-7 text-xs font-semibold bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] rounded-xl shadow-xs cursor-pointer gap-1 px-2.5"
          >
            <Plus className="size-3.5" />
            <span>{dict.calendar.newEvent}</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => icsInputRef.current?.click()}
            title={dict.calendar.importIcs}
            className="size-7 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623]"
          >
            <Upload className="size-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleExportICS}
            title={dict.calendar.exportIcs}
            className="size-7 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623]"
          >
            <Download className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
        <button
          type="button"
          onClick={() => setFilter({ category: "all" })}
          className={cn(
            "px-2 py-0.5 rounded-md font-medium transition-all shrink-0 border cursor-pointer",
            filter.category === "all" || !filter.category
              ? "bg-white/15 text-white border-white/20"
              : "bg-white/5 text-[#8B90A0] border-transparent hover:bg-white/10"
          )}
        >
          {dict.calendar.categories.all}
        </button>

        {(Object.keys(CATEGORY_META) as CalendarEventCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const active = filter.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter({ category: active ? "all" : cat })}
              className={cn(
                "px-2 py-0.5 rounded-md font-medium transition-all shrink-0 border flex items-center gap-1 cursor-pointer",
                active
                  ? meta.colorClass + " border-current font-bold"
                  : "bg-white/5 text-[#8B90A0] border-transparent hover:bg-white/10"
              )}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.hex }} />
              <span>{isVi ? meta.labelVi : meta.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW MODES */}
      {viewMode === "month" && (
        <div className="flex flex-col flex-1 min-h-0 bg-[#1A1C24]/60 rounded-2xl border border-white/6 p-2 space-y-1.5 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-[#8B90A0] py-1 border-b border-white/5">
            {weekHeaders.map((h, i) => (
              <div key={i} className={cn(i >= 5 && "text-[#F5A623]/80")}>
                {h}
              </div>
            ))}
          </div>

          {/* 42 Days Matrix Grid */}
          <div className="grid grid-cols-7 grid-rows-6 gap-1 flex-1 min-h-0">
            {gridDays.map((date, idx) => {
              const dateKey = formatDateKey(date);
              const isCurrentMonth = date.getMonth() === currentMonthDate.getMonth();
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;
              const items = lookup.get(dateKey) ?? [];

              const events = items.filter((i) => i.type === "event");
              const dueNotes = items.filter((i) => i.type === "note");

              return (
                <div
                  key={idx}
                  onClick={() => {
                    sounds.playPop(500);
                    setSelectedDateKey(dateKey);
                  }}
                  onDoubleClick={() => handleOpenCreateModal(dateKey)}
                  className={cn(
                    "relative flex flex-col p-1 rounded-xl transition-all duration-120 cursor-pointer select-none overflow-hidden group border",
                    isSelected
                      ? "bg-[#2A2E3D] border-[#F5A623] shadow-xs"
                      : isToday
                      ? "bg-[#232734] border-[#F5A623]/40"
                      : isCurrentMonth
                      ? "bg-[#14161D]/70 border-white/5 hover:border-white/20 hover:bg-[#1A1E29]"
                      : "bg-[#14161D]/30 border-transparent opacity-40 hover:opacity-75"
                  )}
                >
                  {/* Top Bar: Date Number + Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[10px] font-bold size-4 flex items-center justify-center rounded-full leading-none",
                        isToday
                          ? "bg-[#F5A623] text-[#14161D]"
                          : isSelected
                          ? "text-[#F5A623]"
                          : "text-[#8B90A0]"
                      )}
                    >
                      {date.getDate()}
                    </span>

                    {/* Due note indicator */}
                    {dueNotes.length > 0 && (
                      <span
                        className="size-3 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[8px]"
                        title={`${dueNotes.length} note(s) due`}
                      >
                        📝
                      </span>
                    )}
                  </div>

                  {/* Event Badges List (up to 2 visible, +N more) */}
                  <div className="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                    {events.slice(0, 2).map((evItem, evIdx) => {
                      const ev = evItem.item as CalendarEvent;
                      const meta = CATEGORY_META[ev.category];
                      return (
                        <div
                          key={ev.id || evIdx}
                          className={cn(
                            "truncate px-1 py-0.2 rounded text-[8px] font-medium leading-tight border",
                            ev.completed
                              ? "line-through opacity-50 bg-white/5 text-[#8B90A0] border-transparent"
                              : meta.colorClass
                          )}
                        >
                          {ev.startTime ? `${ev.startTime} ` : ""}
                          {ev.title}
                        </div>
                      );
                    })}

                    {events.length > 2 && (
                      <span className="text-[8px] text-[#8B90A0] font-semibold leading-none pl-0.5">
                        +{events.length - 2} {isVi ? "khác" : "more"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Agenda / Detail View */}
      <div className="flex flex-col flex-1 min-h-[200px] bg-[#1A1C24]/60 rounded-2xl border border-white/6 p-3 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-white/6 pb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-[#F5A623]" />
            <h4 className="text-xs font-bold text-[#F4F5F7]">
              {isVi ? `Lịch trình ngày: ${selectedDateKey}` : `Agenda for: ${selectedDateKey}`}
            </h4>
            {selectedDateKey === todayKey && (
              <Badge className="bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/30 text-[9px] py-0">
                {dict.calendar.today}
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenCreateModal(selectedDateKey)}
            className="h-6 text-[10px] px-2 rounded-lg bg-white/5 hover:bg-[#F5A623]/20 hover:text-[#F5A623] text-[#8B90A0]"
          >
            + {dict.calendar.newEvent}
          </Button>
        </div>

        {/* Events & Due Notes List */}
        {selectedDayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-[#8B90A0] space-y-1.5">
            <CalendarIcon className="size-8 text-white/10" />
            <p className="text-xs">{dict.calendar.noEvents}</p>
            <p className="text-[10px] text-[#8B90A0]/60">{dict.calendar.dragNoteHint}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedDayItems.map((entry, idx) => {
              if (entry.type === "event") {
                const ev = entry.item;
                const meta = CATEGORY_META[ev.category];
                return (
                  <div
                    key={ev.id || idx}
                    className={cn(
                      "flex items-start justify-between p-2.5 rounded-xl border transition-all duration-120 group",
                      ev.completed
                        ? "bg-[#14161D]/40 border-white/5 opacity-60"
                        : "bg-[#262A35]/60 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleCalendarEventComplete(ev.id)}
                        className={cn(
                          "size-4 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors cursor-pointer",
                          ev.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-white/20 hover:border-[#F5A623]"
                        )}
                      >
                        {ev.completed && <Check className="size-3 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p
                            className={cn(
                              "text-xs font-semibold tracking-tight text-[#F4F5F7] truncate",
                              ev.completed && "line-through text-[#8B90A0]"
                            )}
                          >
                            {ev.title}
                          </p>

                          <Badge className={cn("text-[9px] py-0 px-1.5", meta.colorClass)}>
                            {isVi ? meta.labelVi : meta.labelEn}
                          </Badge>

                          {ev.recurrence && ev.recurrence !== "none" && (
                            <span className="text-[9px] text-[#8B90A0] flex items-center gap-0.5">
                              <Repeat className="size-2.5" />
                              {dict.calendar.recurrences[ev.recurrence]}
                            </span>
                          )}

                          {ev.alarmEnabled && (
                            <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                              <Bell className="size-2.5" />
                            </span>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-[11px] text-[#8B90A0] line-clamp-2">{ev.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-[#8B90A0]">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {ev.allDay
                              ? dict.calendar.allDay
                              : `${ev.startTime || "09:00"} - ${ev.endTime || "10:00"}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions on Event */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Send to Desk Sticky Note */}
                      <button
                        type="button"
                        onClick={() => createNoteFromEvent(ev.id)}
                        className="p-1 rounded-md hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] cursor-pointer"
                        title={dict.calendar.createNoteFromEvent}
                      >
                        <NoteIcon className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ev)}
                        className="p-1 rounded-md hover:bg-white/10 text-[#8B90A0] hover:text-white cursor-pointer"
                        title="Sửa sự kiện"
                      >
                        <Sparkles className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteCalendarEvent(ev.id)}
                        className="p-1 rounded-md hover:bg-red-500/20 text-[#8B90A0] hover:text-red-400 cursor-pointer"
                        title="Xóa sự kiện"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              } else {
                // Sticky Note Item
                const note = entry.item;
                return (
                  <div
                    key={`note_${note.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all duration-120 group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <NoteIcon className="size-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F4F5F7] truncate">
                          {note.title || (note.body.split("\n")[0] ?? "Sticky Note")}
                        </p>
                        <p className="text-[10px] text-amber-400/80">
                          {isVi ? `Hạn chót Note: ${note.dueTime || "Cả ngày"}` : `Note Due: ${note.dueTime || "All day"}`}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => bringNote(note.id)}
                      className="h-6 text-[10px] px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                    >
                      <ExternalLink className="size-3 mr-1" />
                      {isVi ? "Xem Note" : "Focus Note"}
                    </Button>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1A1C24] border border-white/10 p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-140">
            <div className="flex items-center justify-between border-b border-white/6 pb-2">
              <h3 className="text-sm font-bold text-[#F4F5F7]">
                {editingEventId
                  ? isVi
                    ? "Chỉnh sửa Sự kiện"
                    : "Edit Event"
                  : isVi
                  ? "Tạo Sự kiện Lịch mới"
                  : "Create New Event"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="size-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#8B90A0] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8B90A0]">
                  {dict.calendar.eventTitle}
                </label>
                <Input
                  autoFocus
                  required
                  placeholder={dict.calendar.eventTitlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#14161D] border-white/10 text-xs text-[#F4F5F7]"
                />
              </div>

              {/* Date & Time Pickers */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8B90A0]">
                    {dict.calendar.startDate}
                  </label>
                  <Input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#14161D] border-white/10 text-xs text-[#F4F5F7]"
                  />
                </div>

                {!allDay && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#8B90A0]">
                      {dict.calendar.startTime}
                    </label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-[#14161D] border-white/10 text-xs text-[#F4F5F7]"
                    />
                  </div>
                )}
              </div>

              {/* All-Day Toggle & Category Selector */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#14161D]/50 border border-white/5">
                <label className="text-[11px] font-medium text-[#F4F5F7] flex items-center gap-2">
                  <Switch checked={allDay} onCheckedChange={setAllDay} />
                  <span>{dict.calendar.allDay}</span>
                </label>

                {/* Category Select */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CalendarEventCategory)}
                  className="bg-[#1A1C24] text-[#F4F5F7] text-[11px] font-medium rounded-lg border border-white/10 px-2 py-1 outline-none"
                >
                  <option value="work">{dict.calendar.categories.work}</option>
                  <option value="personal">{dict.calendar.categories.personal}</option>
                  <option value="meeting">{dict.calendar.categories.meeting}</option>
                  <option value="reminder">{dict.calendar.categories.reminder}</option>
                  <option value="focus">{dict.calendar.categories.focus}</option>
                </select>
              </div>

              {/* Recurrence & Alarm Options */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8B90A0]">
                    {dict.calendar.recurrence}
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}
                    className="w-full bg-[#14161D] text-[#F4F5F7] text-[11px] font-medium rounded-lg border border-white/10 px-2 py-1.5 outline-none"
                  >
                    <option value="none">{dict.calendar.recurrences.none}</option>
                    <option value="daily">{dict.calendar.recurrences.daily}</option>
                    <option value="weekdays">{dict.calendar.recurrences.weekdays}</option>
                    <option value="weekly">{dict.calendar.recurrences.weekly}</option>
                    <option value="monthly">{dict.calendar.recurrences.monthly}</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-[#F4F5F7] cursor-pointer pb-1.5">
                    <Switch checked={alarmEnabled} onCheckedChange={setAlarmEnabled} />
                    <span className="truncate">{dict.calendar.alarmEnabled}</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8B90A0]">
                  {isVi ? "Ghi chú thêm" : "Description / Notes"}
                </label>
                <textarea
                  rows={2}
                  placeholder={isVi ? "Chi tiết nội dung sự kiện…" : "Add notes, zoom links, agenda…"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#14161D] border border-white/10 rounded-xl p-2 text-xs text-[#F4F5F7] placeholder:text-[#8B90A0]/60 resize-none outline-none focus:border-[#F5A623]/60"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-1 border-t border-white/6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                  className="text-xs text-[#8B90A0] hover:text-white"
                >
                  {dict.cancel}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-semibold text-xs px-4 rounded-xl"
                >
                  {dict.save}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
