# 🗺️ LUMEN DESKTOP ENGINEERING ROADMAP & DEVELOPMENT PHASES

> **Project:** Lumen — Pure Transparent Desktop Overlay, Spatial Sticky Notes & Virtual Companion  
> **Target Platforms:** Windows (x64/ARM64), macOS (Apple Silicon/Intel), Linux (X11/Wayland)  
> **Architectural Paradigm:** Zero-Frame Transparent Overlay • 100% Offline Local-First • Sub-50MB RAM • 60/120 FPS Motion Physics  

---

## 🏗️ Tổng Quan Kiến Trúc & Hệ Thống Các Phase Phát Triển

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   LUMEN ROADMAP OVERVIEW                                 │
├───────────────────┬───────────────────┬───────────────────┬──────────────────────────────┤
│ PHASE 1: FOUNDATION│ PHASE 2: COMPANION │ PHASE 3: TIMERS   │ PHASE 4: EXTENSIONS & SYNC   │
│ • Full-screen Overlay│ • 120fps GPU Motion│ • Natural Syntax  │ • P2P / Local Sync           │
│ • Click-Through IPC│ • 5 Pet Species   │ • Floating Cards  │ • Custom Themes & Plugins    │
│ • 3D Post-it Notes│ • Paw Prints Trail│ • Alarm Synthesis │ • Pet Mini-games & Widgets   │
│ • System Tray Hub │ • Snack & Petting │ • Game Timers     │ • Cross-Platform Packaging   │
└───────────────────┴───────────────────┴───────────────────┴──────────────────────────────┘
```

---

## 📌 Mục Lục Các Tài Liệu Chi Tiết

| Tài liệu | Nội dung trọng tâm | Trạng thái |
|---|---|---|
| [Phase 1: Nền Tảng Lớp Phủ & Ghi Chú](./phase-1-mvp-foundation.md) | Kiến trúc Overlay trong suốt, Click-through IPC, Đinh ghim 3D, Checklists, Tùy biến font & màu | **Hoàn thành 100%** |
| [Phase 2: Động Cơ Thú Cưng Ảo](./phase-2-companion-engine.md) | Thuật toán di chuyển lượng giác 120 FPS GPU, 5 loài pet (Cáo, Mèo, Shiba, Rồng, Robot), Vết chân mờ, Kéo thả | **Hoàn thành 100%** |
| [Phase 3: Bấm Giờ Thông Minh & Âm Thanh](./phase-3-smart-timers-gamification.md) | Xử lý ngôn ngữ tự nhiên (COC, nấu ăn, Pomodoro), Thẻ đếm ngược nổi trên Desktop, Chuông báo động đa âm | **Hoàn thành 100%** |
| [Phase 4: Mở Rộng & Đồng Bộ Cục Bộ](./phase-4-cloud-sync-plugins.md) | Tùy biến phụ kiện thú cưng, Đồng bộ hóa cục bộ mạng LAN/P2P, Plugin ghi chú Markdown cao cấp | **Kế hoạch mở rộng** |
| [Phase 5: Đóng Gói & Tối Ưu Phân Phối](./phase-5-performance-distribution.md) | Đóng gói bộ cài Windows Setup (.exe/.msi), macOS (.dmg), Auto-updater, Kiểm thử rò rỉ bộ nhớ <50MB RAM | **Kế hoạch phát hành** |

---

## 💡 Nguyên Tắc Thiết Kế Cốt Lõi (Core Directives)
1. **Zero-Frame Background Daemon:** Tuyệt đối không để lộ khung cửa sổ ứng dụng truyền thống. Toàn bộ trải nghiệm diễn ra trực tiếp trên Desktop.
2. **True Click-Through:** Con trỏ chuột trên vùng trống phải xuyên thẳng xuống hệ điều hành mà không gây cản trở công việc.
3. **Deterministic Teardown & 0 Memory Leaks:** Dọn dẹp đối xứng mọi Timer, AudioContext, và Event Listener trong chu kỳ sống.
4. **Local-First Privacy:** Dữ liệu thuộc quyền sở hữu của người dùng, hoạt động hoàn hảo khi không có Internet.
