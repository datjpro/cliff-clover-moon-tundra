# 📦 Lumen Desktop Releases & Distribution

> **Current Production Version:** `v1.0.1`  
> **Release Date:** September 7, 2026  
> **Target Platforms:** Windows (x64 / ARM64), macOS (Apple Silicon / Intel), Linux  

---

## 🌟 Lumen v1.0.1 — Spatial Calendar & Pro Trial Release

### 📥 Download Packages & Artifacts

| Platform | Format | Architecture | Download / Target |
|---|---|---|---|
| **Windows 10 / 11** | Installer `.exe` (NSIS) | x64 | `dist-electron/Lumen-Setup-1.0.1.exe` / `src-tauri/target/release` |
| **Windows Portable** | Standalone Folder | x64 | `dist-electron/win-unpacked/Lumen.exe` |
| **Web / PWA Preview** | Static Bundle | Modern Web | `.vercel/output/static/index.html` |

---

### ✨ What's New in v1.0.1

#### 1. 📅 Dedicated Standalone Spatial Calendar
- Standalone spatial planner decoupled from settings with `Alt+C` global shortcut.
- Expansive 42-day dual-pane month layout + corner-docked floating Today's Agenda widget (`top-right`, `top-left`, `bottom-right`, `bottom-left`).
- Drag-to-resize viewport with ergonomic minimum boundaries (680x480).
- In-place embedded event creator and editor: zero popup window obstruction and zero data loss on outside clicks.
- Novel 24-hour tactical rotary barrel-wheel time picker with mechanical audio feedback.
- Two-way sync linking calendar events directly to spatial desktop sticky notes.
- iCalendar `.ics` import and export support.

#### 2. 👑 Pro Upgrade Overhaul & 3-Day Free Trial
- **Mã Kích Hoạt Dùng Thử 3 Ngày:** `LUMENTRIAL3DAY` (Kích hoạt 72 giờ trải nghiệm 100% tính năng Pro miễn phí).
- **Giao diện Obsidian VIP Glassmorphism:** Bảng so sánh 3 gói truy cập (Bản Miễn Phí, Dùng Thử 3 Ngày, Pro Trọn Đời).
- **Đồng hồ đếm ngược thời gian thực:** Hiển thị chi tiết số ngày, số giờ còn lại của gói dùng thử.

#### 3. 🛡️ Data Hygiene & Performance
- Tự động thanh lọc dữ liệu mẫu (Clean Empty State) qua migration engine v2.
- 127/127 bài kiểm thử tự động đạt 100% PASS.
- Hoàn toàn tuân thủ ngân sách khung hình Sub-16ms GPU compositing.
