import { useEffect, useRef, useState } from "react";
import {
  CheckSquare,
  CornerDownLeft,
  Folder,
  Lock,
  Pin,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { sounds } from "@/lib/audio";
import { useLumen } from "@/lib/store";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SpotlightSearch() {
  const searchOpen = useLumen((s) => s.searchOpen);
  const setSearchOpen = useLumen((s) => s.setSearchOpen);
  const notes = useLumen((s) => s.notes);
  const trashNotes = useLumen((s) => s.trashNotes);
  const bringNote = useLumen((s) => s.bringNote);
  const updateNote = useLumen((s) => s.updateNote);
  const setHighlightNoteId = useLumen((s) => s.setHighlightNoteId);
  const setSelectedCluster = useLumen((s) => s.setSelectedCluster);
  const addNote = useLumen((s) => s.addNote);
  const restoreNote = useLumen((s) => s.restoreNote);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Global Keyboard Shortcut: Alt+F to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "f" || e.key === "F" || e.code === "KeyF")) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F" || e.code === "KeyF")) {
        const activeTag = (document.activeElement?.tagName || "").toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredNotes = notes.filter((n) => {
    if (!trimmed) return true;
    const inBody = n.body.toLowerCase().includes(trimmed);
    const inTitle = n.title?.toLowerCase().includes(trimmed) ?? false;
    const inCluster = n.cluster?.toLowerCase().includes(trimmed) ?? false;
    const inTodos = n.checkItems?.some((item) => item.text.toLowerCase().includes(trimmed)) ?? false;
    return inBody || inTitle || inCluster || inTodos;
  });

  const filteredTrash = trimmed
    ? (trashNotes || []).filter((n) => {
        const inBody = n.body.toLowerCase().includes(trimmed);
        const inTitle = n.title?.toLowerCase().includes(trimmed) ?? false;
        const inCluster = n.cluster?.toLowerCase().includes(trimmed) ?? false;
        return inBody || inTitle || inCluster;
      })
    : [];

  const handleSelectNote = (targetNote: Note, isTrash = false) => {
    sounds.playChime();
    setSearchOpen(false);

    if (isTrash) {
      restoreNote(targetNote.id);
      setHighlightNoteId(targetNote.id);
      setTimeout(() => setHighlightNoteId(null), 3000);
      return;
    }

    if (targetNote.cluster) {
      setSelectedCluster(targetNote.cluster);
    }
    if (targetNote.collapsed) {
      updateNote(targetNote.id, { collapsed: false });
    }
    bringNote(targetNote.id);
    setHighlightNoteId(targetNote.id);
    setTimeout(() => setHighlightNoteId(null), 3200);
  };

  const handleCreateFromQuery = () => {
    if (!trimmed) return;
    const newId = addNote({ body: query.trim() });
    setSearchOpen(false);
    setHighlightNoteId(newId);
    setTimeout(() => setHighlightNoteId(null), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setSearchOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredNotes.length + filteredTrash.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, filteredNotes.length + filteredTrash.length - 1) : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredNotes.length > 0 && selectedIndex < filteredNotes.length) {
        handleSelectNote(filteredNotes[selectedIndex]);
      } else if (filteredTrash.length > 0 && selectedIndex >= filteredNotes.length) {
        handleSelectNote(filteredTrash[selectedIndex - filteredNotes.length], true);
      } else if (trimmed) {
        handleCreateFromQuery();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[280] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#181A22]/98 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-[#F4F5F7] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search className="size-5 text-[#F5A623] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm kiếm nội dung ghi chú, checklist, cụm nhóm... (Alt+F)"
            className="flex-1 bg-transparent text-sm text-[#F4F5F7] placeholder:text-[#8B90A0]/60 outline-none caret-[#F5A623]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-lg hover:bg-white/10 text-[#8B90A0] hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#8B90A0] bg-white/5 border border-white/10 rounded-md">
            ESC đóng
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 note-scrollbar">
          {filteredNotes.length === 0 && filteredTrash.length === 0 && (
            <div className="py-8 px-4 text-center text-[#8B90A0] flex flex-col items-center gap-2">
              <Sparkles className="size-8 text-[#F5A623]/40" />
              <p className="text-xs">Không tìm thấy ghi chú nào khớp với &quot;{query}&quot;</p>
              {trimmed && (
                <button
                  type="button"
                  onClick={handleCreateFromQuery}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5A623] hover:bg-[#D6871A] text-[#14161D] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Tạo ghi chú mới: &quot;{query.slice(0, 25)}&quot;</span>
                </button>
              )}
            </div>
          )}

          {filteredNotes.map((n, idx) => {
            const isSelected = selectedIndex === idx;
            const completedTodos = n.checkItems?.filter((t) => t.done).length || 0;
            const totalTodos = n.checkItems?.length || 0;

            return (
              <div
                key={n.id}
                onClick={() => handleSelectNote(n)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                  isSelected
                    ? "bg-[#262A35] border-[#F5A623]/40 shadow-md text-white"
                    : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] text-[#F4F5F7]",
                )}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div
                    className={cn(
                      "size-3 rounded-full mt-1 shrink-0 shadow-xs border border-white/20",
                      `bg-note-${n.tint}`,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug line-clamp-2">
                      {n.body.trim() || "(Ghi chú không lời)"}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {n.cluster && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#F5A623] bg-[#F5A623]/10 px-1.5 py-0.5 rounded border border-[#F5A623]/20">
                          <Folder className="size-2.5" />
                          <span>{n.cluster}</span>
                        </span>
                      )}
                      {totalTodos > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-[#3FAE6C] bg-[#3FAE6C]/10 px-1.5 py-0.5 rounded border border-[#3FAE6C]/20">
                          <CheckSquare className="size-2.5" />
                          <span>
                            {completedTodos}/{totalTodos} việc
                          </span>
                        </span>
                      )}
                      {n.pinned && (
                        <span className="flex items-center gap-1 text-[10px] text-[#F5A623] bg-white/5 px-1.5 py-0.5 rounded">
                          <Pin className="size-2.5" />
                          <span>Ghim</span>
                        </span>
                      )}
                      {n.locked && (
                        <span className="flex items-center gap-1 text-[10px] text-[#8B90A0] bg-white/5 px-1.5 py-0.5 rounded">
                          <Lock className="size-2.5" />
                          <span>Khóa</span>
                        </span>
                      )}
                      <span className="text-[10px] text-[#8B90A0]/60">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[#8B90A0]">
                  <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                    <CornerDownLeft className="size-2.5 mr-0.5" /> Nhảy tới
                  </kbd>
                </div>
              </div>
            );
          })}

          {/* Trash Results Section */}
          {filteredTrash.length > 0 && (
            <div className="pt-2 mt-2 border-t border-white/10">
              <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider px-2 block mb-1">
                Trong thùng rác (Nhấn để khôi phục)
              </span>
              {filteredTrash.map((n, idx) => {
                const globalIdx = filteredNotes.length + idx;
                const isSelected = selectedIndex === globalIdx;

                return (
                  <div
                    key={`trash-${n.id}`}
                    onClick={() => handleSelectNote(n, true)}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={cn(
                      "flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all border",
                      isSelected
                        ? "bg-red-500/15 border-red-500/40 text-white"
                        : "bg-white/[0.01] border-transparent hover:bg-red-500/10 text-[#8B90A0]",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs line-through opacity-70 truncate">{n.body}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#3FAE6C] bg-[#3FAE6C]/10 px-2 py-0.5 rounded border border-[#3FAE6C]/20">
                      Khôi phục
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-[#8B90A0]">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-white font-mono">↑↓</strong> Di chuyển
            </span>
            <span>
              <strong className="text-white font-mono">Enter</strong> Mở / Nhảy tới
            </span>
            <span>
              <strong className="text-white font-mono">Ctrl+Z</strong> Hoàn tác xóa
            </span>
          </div>
          <span>{filteredNotes.length} kết quả</span>
        </div>
      </div>
    </div>
  );
}
