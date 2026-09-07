import type { CalendarEvent, CalendarEventCategory, Note, RecurrenceRule } from "./types";
import { uid } from "./utils";

/**
 * Format a Date to YYYY-MM-DD string
 */
export function formatDateKey(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format time to HH:mm string
 */
export function formatTimeKey(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Parse YYYY-MM-DD into a local Date object (at start of day)
 */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
}

/**
 * Get days in month matrix for calendar grid (6 rows x 7 cols = 42 days)
 */
export function getCalendarGridDays(year: number, month: number): Date[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...

  // Monday-first indexing: Monday is 0, Sunday is 6
  const adjustedStart = (startingDayOfWeek + 6) % 7;

  const startDate = new Date(year, month, 1 - adjustedStart);
  const days: Date[] = [];

  for (let i = 0; i < 42; i++) {
    const nextDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    days.push(nextDate);
  }

  return days;
}

export type UnifiedCalendarItem =
  | { type: "event"; item: CalendarEvent }
  | { type: "note"; item: Note };

/**
 * Build fast lookup map O(1) by date key (YYYY-MM-DD)
 */
export function buildCalendarLookup(
  events: CalendarEvent[],
  notes: Note[],
  monthDate?: Date
): Map<string, UnifiedCalendarItem[]> {
  const map = new Map<string, UnifiedCalendarItem[]>();

  const append = (dateKey: string, item: UnifiedCalendarItem) => {
    if (!map.has(dateKey)) {
      map.set(dateKey, []);
    }
    map.get(dateKey)!.push(item);
  };

  // Determine window for expanding recurrences
  const rangeStart = monthDate
    ? new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)
    : new Date(Date.now() - 30 * 86400000);
  const rangeEnd = monthDate
    ? new Date(monthDate.getFullYear(), monthDate.getMonth() + 2, 0)
    : new Date(Date.now() + 60 * 86400000);

  // Index events
  for (const event of events) {
    if (!event.recurrence || event.recurrence === "none") {
      append(event.startDate, { type: "event", item: event });
    } else {
      // Expand recurrence
      const instances = expandEventOccurrences(event, rangeStart, rangeEnd);
      for (const inst of instances) {
        append(inst.startDate, { type: "event", item: inst });
      }
    }
  }

  // Index notes with due dates
  for (const note of notes) {
    if (note.deletedAt) continue;
    if (note.dueDate) {
      append(note.dueDate, { type: "note", item: note });
    }
  }

  return map;
}

/**
 * Expand recurring events within a given date range
 */
export function expandEventOccurrences(
  event: CalendarEvent,
  start: Date,
  end: Date
): CalendarEvent[] {
  if (!event.recurrence || event.recurrence === "none") {
    return [event];
  }

  const results: CalendarEvent[] = [];
  const baseDate = parseDateKey(event.startDate);
  const rule = event.recurrence;

  const cur = new Date(baseDate.getTime());
  const maxIterations = 365;
  let count = 0;

  while (cur <= end && count < maxIterations) {
    count++;
    if (cur >= start && cur >= baseDate) {
      const dateKey = formatDateKey(cur);
      results.push({
        ...event,
        id: `${event.id}_occ_${dateKey}`,
        startDate: dateKey,
        endDate: event.endDate ? dateKey : undefined,
      });
    }

    if (rule === "daily") {
      cur.setDate(cur.getDate() + 1);
    } else if (rule === "weekdays") {
      cur.setDate(cur.getDate() + 1);
      const day = cur.getDay();
      if (day === 0) cur.setDate(cur.getDate() + 1); // skip to Monday
      if (day === 6) cur.setDate(cur.getDate() + 2);
    } else if (rule === "weekly") {
      cur.setDate(cur.getDate() + 7);
    } else if (rule === "monthly") {
      cur.setMonth(cur.getMonth() + 1);
    } else {
      break;
    }
  }

  return results;
}

/**
 * Category styling metadata
 */
export const CATEGORY_META: Record<
  CalendarEventCategory,
  { labelEn: string; labelVi: string; colorClass: string; badgeClass: string; hex: string }
> = {
  work: {
    labelEn: "Work",
    labelVi: "Công việc",
    colorClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    badgeClass: "bg-blue-500 text-white",
    hex: "#3b82f6",
  },
  personal: {
    labelEn: "Personal",
    labelVi: "Cá nhân",
    colorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    badgeClass: "bg-emerald-500 text-white",
    hex: "#10b981",
  },
  meeting: {
    labelEn: "Meeting",
    labelVi: "Cuộc họp",
    colorClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    badgeClass: "bg-purple-500 text-white",
    hex: "#a855f7",
  },
  reminder: {
    labelEn: "Reminder",
    labelVi: "Nhắc nhở",
    colorClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    badgeClass: "bg-amber-500 text-white",
    hex: "#f59e0b",
  },
  focus: {
    labelEn: "Focus Time",
    labelVi: "Tập trung",
    colorClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    badgeClass: "bg-rose-500 text-white",
    hex: "#f43f5e",
  },
};

/**
 * Generate standard iCalendar (.ics) string for export
 */
export function exportToICalendar(events: CalendarEvent[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lumen Workspace//Lumen Calendar 1.0.1//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const ev of events) {
    const startStr = ev.startDate.replace(/-/g, "");
    const timeStr = ev.startTime ? ev.startTime.replace(":", "") + "00" : "090000";
    const dtStart = ev.allDay ? `VALUE=DATE:${startStr}` : `:${startStr}T${timeStr}`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.id}@lumen.desktop`);
    lines.push(`DTSTAMP:${formatDateKey(new Date()).replace(/-/g, "")}T000000Z`);
    lines.push(`DTSTART;${dtStart}`);
    if (ev.endTime && !ev.allDay) {
      const endStr = (ev.endDate || ev.startDate).replace(/-/g, "");
      const endTimeStr = ev.endTime.replace(":", "") + "00";
      lines.push(`DTEND:${endStr}T${endTimeStr}`);
    }
    lines.push(`SUMMARY:${ev.title.replace(/\n/g, " ")}`);
    if (ev.description) {
      lines.push(`DESCRIPTION:${ev.description.replace(/\n/g, "\\n")}`);
    }
    lines.push(`CATEGORIES:${ev.category.toUpperCase()}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Basic parse iCalendar (.ics) string
 */
export function parseICalendar(icsContent: string): Partial<CalendarEvent>[] {
  const events: Partial<CalendarEvent>[] = [];
  const lines = icsContent.split(/\r\n|\n|\r/);
  let inEvent = false;
  let currentEvent: Partial<CalendarEvent> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VEVENT") {
      inEvent = true;
      currentEvent = {
        id: uid(),
        category: "work",
        createdAt: Date.now(),
        allDay: false,
      };
    } else if (trimmed === "END:VEVENT") {
      if (inEvent && currentEvent.title && currentEvent.startDate) {
        events.push(currentEvent);
      }
      inEvent = false;
      currentEvent = {};
    } else if (inEvent) {
      if (trimmed.startsWith("SUMMARY:")) {
        currentEvent.title = trimmed.substring(8);
      } else if (trimmed.startsWith("DESCRIPTION:")) {
        currentEvent.description = trimmed.substring(12).replace(/\\n/g, "\n");
      } else if (trimmed.startsWith("DTSTART")) {
        const value = trimmed.split(":")[1] || "";
        if (value.length >= 8) {
          const y = value.substring(0, 4);
          const m = value.substring(4, 6);
          const d = value.substring(6, 8);
          currentEvent.startDate = `${y}-${m}-${d}`;
          if (value.includes("T") && value.length >= 13) {
            const tIdx = value.indexOf("T");
            const hh = value.substring(tIdx + 1, tIdx + 3);
            const mm = value.substring(tIdx + 3, tIdx + 5);
            currentEvent.startTime = `${hh}:${mm}`;
          } else {
            currentEvent.allDay = true;
          }
        }
      }
    }
  }

  return events;
}
