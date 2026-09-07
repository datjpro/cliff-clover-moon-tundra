import { useState, useMemo, useRef, useEffect, type PointerEvent } from "react";
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
  Sparkles,
  Bell,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  GripHorizontal,
  Maximize2,
  Minimize2,
  X,
  Target,
  Crosshair,
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
import type { CalendarDockPosition, CalendarEvent, CalendarEventCategory, RecurrenceRule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScopeRotaryTimePicker } from "./scope-time-picker";

const DOCK_POSITION_CLASSES: Record<CalendarDockPosition, string> = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-20 right-4",
  "bottom-left": "bottom-6 left-4",
};

export function StandaloneCalendar() {
  const calendarOpen = useLumen((s) => s.calendarOpen);
  const setCalendarOpen = useLumen((s) => s.setCalendarOpen);
  const isCompact = useLumen((s) => s.calendarCompact);
  const toggleCompact = useLumen((s) => s.toggleCalendarCompact);
  const dockPos = useLumen((s) => s.calendarDockPosition || "top-right");
  const lang = useLumen((s) => s.lang);
  const calendarEvents = useLumen((s) => s.calendarEvents);
  const notes = useLumen((s) => s.notes);
  const selectedDateKey = useLumen((s) => s.selectedCalendarDate);
  const setSelectedDateKey = useLumen((s) => s.setSelectedCalendarDate);
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

  // Draggable window state (for expansive mode)
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hasCustomPos, setHasCustomPos] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  // Navigation & Modal State
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => parseDateKey(selectedDateKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Time Picker Popovers
  const [activeScopePicker, setActiveScopePicker] = useState<"start" | "end" | null>(null);

  // Form State & Validation
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const icsInputRef = useRef<HTMLInputElement>(null);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const currentTimeKey = useMemo(() => formatTimeKey(new Date()), []);

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

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!calendarOpen) return;
      if (e.key === "Escape") {
        if (activeScopePicker) {
          setActiveScopePicker(null);
        } else if (modalOpen) {
          setModalOpen(false);
        } else {
          setCalendarOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calendarOpen, modalOpen, activeScopePicker, setCalendarOpen]);

  // Drag Handlers for Expansive Mode
  const handlePointerDownHeader = (e: PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input") || (e.target as HTMLElement).closest(".no-drag")) {
      return;
    }
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: PointerEvent<HTMLElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({
      x: dragStart.current.initialX + dx,
      y: dragStart.current.initialY + dy,
    });
    setHasCustomPos(true);
  };

  const handlePointerUpHeader = () => {
    setIsDragging(false);
  };

  const handleResetPosition = () => {
    setPos({ x: 0, y: 0 });
    setHasCustomPos(false);
    sounds.playPop(520);
  };

  // Month navigation
  const handlePrevMonth = () => {
    sounds.playPop(480);
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    sounds.playPop(520);
    setCurrentMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    sounds.playChime();
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
  };

  // Open modal for new event with strict past-date validation
  const handleOpenCreateModal = (presetDate?: string) => {
    sounds.playPop(580);
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setValidationError(null);

    // Enforce future / present date for new events
    let targetDate = presetDate || selectedDateKey;
    if (targetDate < todayKey) {
      targetDate = todayKey;
    }

    setStartDate(targetDate);
    setEndDate(targetDate);

    // Calculate smart upcoming time (next 15m slot)
    const now = new Date();
    const nextSlotMin = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(nextSlotMin);
    const initialStart = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes() % 60).padStart(2, "0")}`;
    const nextHour = (now.getHours() + 1) % 24;
    const initialEnd = `${String(nextHour).padStart(2, "0")}:${String(now.getMinutes() % 60).padStart(2, "0")}`;

    setStartTime(initialStart);
    setEndTime(initialEnd);
    setAllDay(false);
    setCategory("work");
    setRecurrence("none");
    setAlarmEnabled(true);
    setReminderMinutesBefore(10);
    setModalOpen(true);
  };

  // Open modal for editing existing event
  const handleOpenEditModal = (event: CalendarEvent) => {
    sounds.playPop(520);
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    setStartDate(event.startDate);
    setEndDate(event.endDate || event.startDate);
    setStartTime(event.startTime || "09:00");
    setEndTime(event.endTime || "10:00");
    setAllDay(event.allDay ?? false);
    setCategory(event.category);
    setRecurrence(event.recurrence || "none");
    setAlarmEnabled(event.alarmEnabled ?? false);
    setReminderMinutesBefore(event.reminderMinutesBefore ?? 10);
    setValidationError(null);
    setModalOpen(true);
  };

  // Comprehensive Business Logic & Validation Engine
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setValidationError(isVi ? "Vui lòng nhập tiêu đề sự kiện" : "Please enter an event title");
      return false;
    }

    // Retrospective booking check for new events
    if (!editingEventId) {
      if (startDate < todayKey) {
        setValidationError(isVi ? "Không thể tạo sự kiện trong quá khứ" : "Cannot schedule events in the past");
        return false;
      }
      if (startDate === todayKey && !allDay && startTime < currentTimeKey) {
        setValidationError(isVi ? "Giờ bắt đầu không thể trước thời gian hiện tại" : "Start time cannot be in the past");
        return false;
      }
    }

    // End date/time logical consistency check
    if (endDate < startDate) {
      setValidationError(isVi ? "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu" : "End date must be on or after start date");
      return false;
    }

    if (endDate === startDate && !allDay && endTime && endTime <= startTime) {
      setValidationError(isVi ? "Giờ kết thúc phải sau giờ bắt đầu" : "End time must be later than start time");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      sounds.playPop(350);
      return;
    }

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
      sounds.playChime();
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
      sounds.playScopeLock();
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
    sounds.playChime();
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

  if (!calendarOpen) return null;

  // 1. MINIMIZED VIEW: CORNER-DOCKED FLOATING CAPSULE WIDGET
  if (isCompact) {
    const dockClass = DOCK_POSITION_CLASSES[dockPos] || "top-4 right-4";
    return (
      <aside
        role="region"
        aria-label="Lumen Calendar Dock"
        className={cn(
          "interactive-el fixed z-[88] flex flex-col w-84 rounded-3xl bg-[#181A22]/95 border border-white/12 text-[#F4F5F7] shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-2xl select-none overflow-hidden animate-in fade-in zoom-in-95 duration-140",
          dockClass,
        )}
      >
        {/* Compact Dock Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#14161D]/70 border-b border-white/8">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-6 rounded-lg bg-[#F5A623]/20 text-[#F5A623] flex items-center justify-center shrink-0 border border-[#F5A623]/30">
              <CalendarIcon className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-[#F4F5F7] truncate block">{monthName}</span>
              <span className="text-[9px] font-mono text-[#8B90A0]">DOCK: {dockPos.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevMonth}
              className="size-6 rounded-md hover:bg-white/10 text-[#8B90A0]"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNextMonth}
              className="size-6 rounded-md hover:bg-white/10 text-[#8B90A0]"
            >
              <ChevronRight className="size-3" />
            </Button>
            <button
              type="button"
              onClick={toggleCompact}
              className="size-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
              title="Mở rộng giao diện lớn (Expansive Mode)"
            >
              <Maximize2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              className="size-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
              title="Đóng (Escape)"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* 7-Day Mini Horizontal Rail Strip */}
        <div className="p-2.5 space-y-2">
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekHeaders.map((h, i) => (
              <span key={i} className="text-[9px] font-bold text-[#8B90A0]">
                {h}
              </span>
            ))}
          </div>

          {/* Mini Calendar 42-day matrix */}
          <div className="grid grid-cols-7 grid-rows-6 gap-1 h-36">
            {gridDays.map((date, idx) => {
              const dateKey = formatDateKey(date);
              const isCurrentMonth = date.getMonth() === currentMonthDate.getMonth();
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;
              const isPast = dateKey < todayKey;
              const items = lookup.get(dateKey) ?? [];

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    sounds.playPop(500);
                    setSelectedDateKey(dateKey);
                  }}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#F5A623] text-[#14161D] shadow-xs"
                      : isToday
                      ? "bg-white/15 text-[#F5A623] border border-[#F5A623]/50"
                      : isPast
                      ? "text-[#8B90A0]/40 hover:bg-white/5"
                      : isCurrentMonth
                      ? "text-[#F4F5F7] hover:bg-white/10"
                      : "text-[#8B90A0]/20",
                  )}
                >
                  <span>{date.getDate()}</span>
                  {items.length > 0 && !isSelected && (
                    <span className="size-1 rounded-full bg-[#F5A623] absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Selected Day Agenda Snippet */}
          <div className="rounded-2xl bg-[#14161D]/80 border border-white/6 p-2.5 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-1 border-b border-white/5 text-[11px] font-bold text-[#F4F5F7]">
              <span>{selectedDateKey} {selectedDateKey === todayKey && "(Hôm nay)"}</span>
              <button
                type="button"
                onClick={() => handleOpenCreateModal(selectedDateKey)}
                className="text-[10px] font-semibold text-[#F5A623] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Thêm việc</span>
              </button>
            </div>

            {selectedDayItems.length === 0 ? (
              <p className="text-[10px] text-[#8B90A0] text-center py-2">
                {selectedDateKey < todayKey ? "Không có sự kiện quá khứ" : dict.calendar.noEvents}
              </p>
            ) : (
              selectedDayItems.map((entry, idx) => {
                if (entry.type === "event") {
                  const ev = entry.item;
                  return (
                    <div
                      key={ev.id || idx}
                      className="flex items-center justify-between p-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleCalendarEventComplete(ev.id)}
                          className={cn(
                            "size-3 rounded border flex items-center justify-center cursor-pointer shrink-0",
                            ev.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/30",
                          )}
                        >
                          {ev.completed && <Check className="size-2" />}
                        </button>
                        <span className={cn("truncate text-[11px]", ev.completed && "line-through text-[#8B90A0]")}>
                          {ev.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[#8B90A0] shrink-0 ml-1">
                        {ev.startTime || "Cả ngày"}
                      </span>
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>
        </div>

        {/* Modal Event Creator when launched from Compact Mode */}
        {modalOpen && renderEventModal()}
      </aside>
    );
  }

  // 2. EXPANSIVE FULL DUAL-PANE CALENDAR MODE
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs select-none pointer-events-auto animate-in fade-in duration-150"
      onClick={() => setCalendarOpen(false)}
    >
      {/* Hidden ICS File Input */}
      <input
        type="file"
        ref={icsInputRef}
        onChange={handleImportICSFile}
        accept=".ics,text/calendar"
        className="hidden"
      />

      <div
        style={{
          transform: hasCustomPos ? `translate3d(${pos.x}px, ${pos.y}px, 0)` : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col rounded-3xl bg-[#181A22]/98 border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-[#F4F5F7] backdrop-blur-2xl overflow-hidden w-[840px] max-w-[95vw] h-[640px] max-h-[92vh] transition-all duration-200"
      >
        {/* Sleek Draggable Header */}
        <header
          onPointerDown={handlePointerDownHeader}
          onPointerMove={handlePointerMoveHeader}
          onPointerUp={handlePointerUpHeader}
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#14161D]/60 cursor-grab active:cursor-grabbing select-none",
            isDragging && "bg-[#14161D]/90",
          )}
          title="Kéo thả để di chuyển bảng lịch"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center size-7 rounded-lg bg-[#F5A623]/20 text-[#F5A623] shrink-0 border border-[#F5A623]/30">
              <CalendarIcon className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs tracking-tight text-[#F4F5F7]">
                  {isVi ? "Lumen Spatial Planner — Lịch Không Gian" : "Lumen Spatial Planner"}
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-white/10 text-[#8B90A0]">
                  v1.0.1
                </span>
              </div>
              <p className="text-[10px] text-[#8B90A0]">
                {isVi ? "Lập kế hoạch công việc & liên kết ghi chú bàn làm việc" : "Desk calendar & note schedule manager"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 no-drag">
            {/* Quick New Event Button */}
            <Button
              size="sm"
              onClick={() => handleOpenCreateModal()}
              className="h-7 text-xs font-semibold bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] rounded-xl shadow-xs cursor-pointer gap-1 px-2.5 mr-1"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">{dict.calendar.newEvent}</span>
            </Button>

            {/* Toggle Compact / Corner Dock Mode */}
            <button
              type="button"
              onClick={toggleCompact}
              className="size-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
              title="Thu nhỏ thành Widget góc màn hình (Compact Dock Mode)"
            >
              <Minimize2 className="size-3.5" />
            </button>

            {/* Reset Position */}
            {hasCustomPos && (
              <button
                type="button"
                onClick={handleResetPosition}
                className="size-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
                title="Đưa về giữa màn hình"
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              className="size-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
              title="Đóng (Escape)"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {/* Full Dual-Pane Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* LEFT PANE: Month Grid & Category Filters (60% width) */}
          <div className="flex flex-col flex-[1.3] min-w-0 p-3.5 space-y-2.5 border-r border-white/8">
            {/* Controls Bar: Prev/Next Month, Today, Category Chips */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePrevMonth}
                  className="size-7 rounded-lg hover:bg-white/10 text-[#8B90A0]"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs font-bold text-[#F4F5F7] min-w-[130px] text-center">
                  {monthName}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleNextMonth}
                  className="size-7 rounded-lg hover:bg-white/10 text-[#8B90A0]"
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

              {/* ICS Import / Export Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => icsInputRef.current?.click()}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
                  title={dict.calendar.importIcs}
                >
                  <Upload className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleExportICS}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-[#F5A623] transition-colors cursor-pointer"
                  title={dict.calendar.exportIcs}
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
              {(["all", "work", "personal", "meeting", "reminder", "focus"] as const).map((cat) => {
                const isActive = (filter.category || "all") === cat;
                const label =
                  cat === "all"
                    ? isVi
                      ? "Tất cả"
                      : "All"
                    : isVi
                    ? CATEGORY_META[cat].labelVi
                    : CATEGORY_META[cat].labelEn;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      sounds.playPop(520);
                      setFilter({ ...filter, category: cat });
                    }}
                    className={cn(
                      "text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-120 shrink-0 cursor-pointer",
                      isActive
                        ? "bg-[#F5A623] text-[#14161D] shadow-xs"
                        : "bg-white/5 text-[#8B90A0] hover:text-[#F4F5F7] hover:bg-white/10",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center py-0.5">
              {weekHeaders.map((h, i) => (
                <span key={i} className="text-[10px] font-bold text-[#8B90A0]">
                  {h}
                </span>
              ))}
            </div>

            {/* 42-Day Month Grid */}
            <div className="grid grid-cols-7 grid-rows-6 gap-1.5 flex-1 min-h-0">
              {gridDays.map((date, idx) => {
                const dateKey = formatDateKey(date);
                const isCurrentMonth = date.getMonth() === currentMonthDate.getMonth();
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDateKey;
                const isPast = dateKey < todayKey;
                const dayItems = lookup.get(dateKey) ?? [];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      sounds.playPop(500);
                      setSelectedDateKey(dateKey);
                    }}
                    className={cn(
                      "relative flex flex-col justify-between p-1.5 rounded-2xl border transition-all duration-120 cursor-pointer group",
                      isSelected
                        ? "bg-[#262A35] border-[#F5A623] shadow-md ring-1 ring-[#F5A623]/50"
                        : isToday
                        ? "bg-[#262A35]/60 border-[#F5A623]/60 shadow-xs"
                        : isPast
                        ? "bg-[#14161D]/30 border-white/4 opacity-60 hover:opacity-100 hover:border-white/10"
                        : isCurrentMonth
                        ? "bg-[#14161D]/60 border-white/6 hover:border-white/15"
                        : "bg-[#14161D]/20 border-transparent text-[#8B90A0]/25",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "size-5 rounded-full flex items-center justify-center text-[11px] font-bold",
                          isToday
                            ? "bg-[#F5A623] text-[#14161D]"
                            : isSelected
                            ? "text-[#F5A623]"
                            : isCurrentMonth
                            ? "text-[#F4F5F7]"
                            : "text-[#8B90A0]/30",
                        )}
                      >
                        {date.getDate()}
                      </span>

                      {/* Item Count Pill */}
                      {dayItems.length > 0 && (
                        <span className="text-[9px] font-mono text-[#8B90A0] bg-white/5 px-1 rounded">
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    {/* Miniature event indicator chips in day cell */}
                    <div className="space-y-0.5 overflow-hidden max-h-7">
                      {dayItems.slice(0, 2).map((entry, itemIdx) => {
                        if (entry.type === "event") {
                          const ev = entry.item;
                          const meta = CATEGORY_META[ev.category];
                          return (
                            <div
                              key={ev.id || itemIdx}
                              className={cn(
                                "text-[9px] px-1 py-0.2 rounded truncate font-medium flex items-center gap-1",
                                meta.colorClass,
                              )}
                            >
                              <span className="size-1 rounded-full bg-current shrink-0" />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        } else {
                          const note = entry.item;
                          return (
                            <div
                              key={`n_${note.id}`}
                              className="text-[9px] px-1 py-0.2 rounded truncate font-medium bg-amber-500/20 text-amber-300 flex items-center gap-1"
                            >
                              <NoteIcon className="size-2 shrink-0 text-amber-400" />
                              <span className="truncate">{note.title || note.body.slice(0, 15)}</span>
                            </div>
                          );
                        }
                      })}
                      {dayItems.length > 2 && (
                        <span className="text-[8px] text-[#8B90A0] block pl-1">
                          +{dayItems.length - 2} khác
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANE: Selected Date Agenda & Task Details (40% width) */}
          <div className="flex flex-col flex-1 min-w-0 p-3.5 space-y-3 bg-[#14161D]/40 overflow-hidden">
            {/* Selected Date Header Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/6">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#F4F5F7]">{selectedDateKey}</h4>
                  {selectedDateKey === todayKey && (
                    <Badge className="bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40 text-[9px] px-1.5 py-0">
                      {dict.calendar.today}
                    </Badge>
                  )}
                  {selectedDateKey < todayKey && (
                    <Badge className="bg-white/10 text-[#8B90A0] border-white/10 text-[9px] px-1.5 py-0">
                      {isVi ? "Đã qua" : "Past"}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-[#8B90A0]">
                  {selectedDayItems.length} {isVi ? "nhiệm vụ & lịch hẹn" : "events & tasks"}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => handleOpenCreateModal(selectedDateKey)}
                className="h-7 text-xs font-semibold bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] rounded-xl shadow-xs cursor-pointer gap-1 px-2.5"
              >
                <Plus className="size-3.5" />
                <span>{isVi ? "Thêm việc" : "Add"}</span>
              </Button>
            </div>

            {/* Agenda Items List */}
            <div className="flex-1 min-h-0 space-y-2 overflow-y-auto custom-scrollbar pr-1">
              {selectedDayItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8B90A0] space-y-2">
                  <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center">
                    <CalendarIcon className="size-5 text-white/20" />
                  </div>
                  <p className="text-xs font-medium">{dict.calendar.noEvents}</p>
                  <p className="text-[10px] text-[#8B90A0]/60 max-w-[200px]">
                    {selectedDateKey < todayKey
                      ? isVi
                        ? "Không có sự kiện được ghi nhận trong ngày này."
                        : "No events recorded for this past date."
                      : isVi
                      ? "Nhấp '+ Thêm việc' để lên lịch trình công việc cho ngày này."
                      : "Click '+ Add' to plan your agenda for this day."}
                  </p>
                </div>
              ) : (
                selectedDayItems.map((entry, idx) => {
                  if (entry.type === "event") {
                    const ev = entry.item;
                    const meta = CATEGORY_META[ev.category];
                    return (
                      <div
                        key={ev.id || idx}
                        className={cn(
                          "flex items-start justify-between p-2.5 rounded-2xl border transition-all duration-120 group",
                          ev.completed
                            ? "bg-[#14161D]/40 border-white/5 opacity-60"
                            : "bg-[#1D2029] border-white/10 hover:border-white/20",
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleCalendarEventComplete(ev.id)}
                            className={cn(
                              "size-4 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors cursor-pointer",
                              ev.completed
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-white/20 hover:border-[#F5A623]",
                            )}
                          >
                            {ev.completed && <Check className="size-3 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p
                                className={cn(
                                  "text-xs font-semibold tracking-tight text-[#F4F5F7] truncate",
                                  ev.completed && "line-through text-[#8B90A0]",
                                )}
                              >
                                {ev.title}
                              </p>
                              <Badge className={cn("text-[9px] py-0 px-1.5", meta.colorClass)}>
                                {isVi ? meta.labelVi : meta.labelEn}
                              </Badge>
                              {ev.alarmEnabled && (
                                <span className="text-[9px] text-amber-400">
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
                                {ev.allDay ? dict.calendar.allDay : `${ev.startTime || "09:00"} - ${ev.endTime || "10:00"}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    const note = entry.item;
                    return (
                      <div
                        key={`note_${note.id}`}
                        className="flex items-center justify-between p-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all duration-120 group"
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
                          onClick={() => {
                            bringNote(note.id);
                            setCalendarOpen(false);
                          }}
                          className="h-6 text-[10px] px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                        >
                          <ExternalLink className="size-3 mr-1" />
                          {isVi ? "Xem Note" : "Focus Note"}
                        </Button>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </div>
        </div>

        {/* CREATE / EDIT EVENT MODAL */}
        {modalOpen && renderEventModal()}
      </div>
    </div>
  );

  // Helper render for Event Creator Modal with Scope Rotary Time Picker Integration
  function renderEventModal() {
    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#1A1C24] border border-white/10 p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-140 relative">
          <div className="flex items-center justify-between border-b border-white/6 pb-2">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-[#F5A623]/20 text-[#F5A623] flex items-center justify-center">
                <Target className="size-3.5" />
              </div>
              <h3 className="text-sm font-bold text-[#F4F5F7]">
                {editingEventId
                  ? isVi
                    ? "Chỉnh sửa Sự kiện"
                    : "Edit Event"
                  : isVi
                  ? "Tạo Sự kiện Lịch mới"
                  : "Create New Event"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setActiveScopePicker(null);
              }}
              className="size-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-[#8B90A0] hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Validation Alert Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs animate-in fade-in">
              <AlertCircle className="size-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#8B90A0]">
                {dict.calendar.eventTitle} <span className="text-red-400">*</span>
              </label>
              <Input
                autoFocus
                required
                placeholder={dict.calendar.eventTitlePlaceholder}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className="bg-[#14161D] border-white/10 text-xs text-[#F4F5F7] focus:border-[#F5A623]"
              />
            </div>

            {/* Date & Rotary Time Pickers */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8B90A0]">
                  {dict.calendar.startDate}
                </label>
                <Input
                  type="date"
                  required
                  min={editingEventId ? undefined : todayKey}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate < e.target.value) setEndDate(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="bg-[#14161D] border-white/10 text-xs text-[#F4F5F7]"
                />
              </div>

              {!allDay ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8B90A0] flex items-center justify-between">
                    <span>{dict.calendar.startTime}</span>
                    <span className="text-[9px] text-[#F5A623] font-mono">SCOPE ROTARY</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playMechanicalClick(1.0);
                      setActiveScopePicker(activeScopePicker === "start" ? null : "start");
                    }}
                    className="w-full flex items-center justify-between px-2.5 h-8.5 rounded-xl bg-[#14161D] border border-white/10 hover:border-[#F5A623]/60 text-xs text-[#F4F5F7] font-mono cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Crosshair className="size-3.5 text-[#F5A623]" />
                      <span>{startTime || "09:00"}</span>
                    </span>
                    <span className="text-[10px] text-[#8B90A0]">Xoay 24H</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8B90A0]">Ngày kết thúc</label>
                  <Input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[#14161D] border-white/10 text-xs text-[#F4F5F7]"
                  />
                </div>
              )}
            </div>

            {/* Scope Rotary Time Picker Popover for Start Time */}
            {activeScopePicker === "start" && (
              <div className="animate-in fade-in zoom-in-95 duration-100">
                <ScopeRotaryTimePicker
                  value={startTime}
                  onChange={(newT) => {
                    setStartTime(newT);
                    if (validationError) setValidationError(null);
                  }}
                  isPastDisabled={!editingEventId && startDate === todayKey}
                  minTime={currentTimeKey}
                  onClose={() => setActiveScopePicker(null)}
                />
              </div>
            )}

            {/* End Time Selector with Scope Rotary */}
            {!allDay && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8B90A0]">Ngày kết thúc</label>
                  <Input
                    type="date"
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[#14161D] border-white/10 text-xs text-[#F4F5F7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8B90A0] flex items-center justify-between">
                    <span>Giờ kết thúc</span>
                    <span className="text-[9px] text-[#F5A623] font-mono">SCOPE ROTARY</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playMechanicalClick(1.0);
                      setActiveScopePicker(activeScopePicker === "end" ? null : "end");
                    }}
                    className="w-full flex items-center justify-between px-2.5 h-8.5 rounded-xl bg-[#14161D] border border-white/10 hover:border-[#F5A623]/60 text-xs text-[#F4F5F7] font-mono cursor-pointer transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Target className="size-3.5 text-[#F5A623]" />
                      <span>{endTime || "10:00"}</span>
                    </span>
                    <span className="text-[10px] text-[#8B90A0]">Xoay 24H</span>
                  </button>
                </div>
              </div>
            )}

            {/* Scope Rotary Time Picker Popover for End Time */}
            {activeScopePicker === "end" && (
              <div className="animate-in fade-in zoom-in-95 duration-100">
                <ScopeRotaryTimePicker
                  value={endTime}
                  onChange={(newT) => {
                    setEndTime(newT);
                    if (validationError) setValidationError(null);
                  }}
                  isPastDisabled={false}
                  onClose={() => setActiveScopePicker(null)}
                />
              </div>
            )}

            {/* All-day & Category Selector */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#14161D]/50 border border-white/5">
              <label className="text-[11px] font-medium text-[#F4F5F7] flex items-center gap-2 cursor-pointer">
                <Switch checked={allDay} onCheckedChange={setAllDay} />
                <span>{dict.calendar.allDay}</span>
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CalendarEventCategory)}
                className="bg-[#1A1C24] text-[#F4F5F7] text-[11px] font-medium rounded-lg border border-white/10 px-2 py-1 outline-none cursor-pointer"
              >
                <option value="work">{dict.calendar.categories.work}</option>
                <option value="personal">{dict.calendar.categories.personal}</option>
                <option value="meeting">{dict.calendar.categories.meeting}</option>
                <option value="reminder">{dict.calendar.categories.reminder}</option>
                <option value="focus">{dict.calendar.categories.focus}</option>
              </select>
            </div>

            {/* Recurrence & Alarm Notification */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#8B90A0]">
                  {dict.calendar.recurrence}
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}
                  className="w-full bg-[#14161D] text-[#F4F5F7] text-[11px] font-medium rounded-lg border border-white/10 px-2 py-1.5 outline-none cursor-pointer"
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

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-1 border-t border-white/6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setModalOpen(false);
                  setActiveScopePicker(null);
                }}
                className="text-xs text-[#8B90A0] hover:text-white cursor-pointer"
              >
                {dict.cancel}
              </Button>
              <Button
                type="submit"
                className="bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold text-xs px-4 rounded-xl cursor-pointer"
              >
                {dict.save}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
