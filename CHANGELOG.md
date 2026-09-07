# 📋 Changelog — Lumen Desktop Workspace

All notable changes to the **Lumen** spatial desktop companion will be documented in this file.
The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] — 2026-09-07

### 🚀 Major Highlights & Features

#### 📅 Spatial Calendar & Agenda Module (Standalone Workspace)
- **Decoupled Standalone Module:** Independent, expansive spatial calendar window (`Alt+C`), stripped completely of Settings modal embedding.
- **Dual-Pane Layout & Corner Dock Widget:**
  - **Expansive Dual-Pane Window:** 42-day interactive month grid (60% width) with category chips (`Work`, `Personal`, `Meeting`, `Reminder`, `Focus`) and daily agenda pane (40% width).
  - **Corner-Docked Mini-Widget:** Floating compact agenda docked to screen corners (`top-right`, `top-left`, `bottom-right`, `bottom-left`) scoped strictly to Today's Agenda without grid clutter.
- **Drag-to-Resize Canvas:** Dynamically scale calendar bounds with lower-right grip (minimum safe bounds: 680x480px).
- **In-Place Embedded Form:** Add/Edit event forms render in-place directly in the right panel and compact widget, eliminating modal popup overlays, window clipping, and accidental data loss on outside clicks.
- **Scope-Style Rotary Time Picker:** Tactical 24-hour barrel-wheel rotary time picker with custom mechanical audio click feedback.
- **2-Way Sticky Note Linkage & iCalendar Sync:** Bi-directional note focus links and standard `.ics` import/export support.

#### 🎁 Pro Upgrade Overhaul & 3-Day Trial Pass (`LUMENTRIAL3DAY`)
- **Promotional 3-Day Trial Code:** Enter `LUMENTRIAL3DAY` to unlock 100% full Pro access for 72 hours with zero credit card requirements.
- **Live Trial Countdown Engine:** Real-time countdown clock displayed in the Pro dashboard with graceful expiration handling.
- **3-Tier Pricing & Comparison Cards:** Free Starter vs. 3-Day Trial Pass vs. Pro Lifetime Master.
- **Visual Perk Matrix:** Detailed showcase for Unlimited Notes, Multi-Timers, VIP Themes, Exclusive Fox Skins, AI Clustering, and PIN Security.

#### 🧹 Data Cleanse & Integrity
- **Mock Data Cleanse:** Clean initial production state with automatic database migration (`version: 2`) stripping legacy seed events.
- **Validation Engine:** Strict validation rules preventing past-date scheduling and backward time sequences.

---

## [1.0.0] — 2026-09-05

### Initial Stable Release
- **Pip Virtual Desktop Pet:** 5 species (Fox, Cat, Shiba, Dragon, Cyber) with procedural gaits and interactive physics.
- **Spatial Sticky Notes:** Draggable, rotatable, pastel/dark sticky notes with Word font sizing and PIN lock.
- **Natural Language Smart Timers:** Multi-timer system supporting natural language prompt inputs (e.g. `Pomodoro 25p`, `COC 2h14m`).
- **Local-First & Transparent Overlay:** Zero-flicker Windows DWM desktop pass-through with PGLite / SQLite storage.
