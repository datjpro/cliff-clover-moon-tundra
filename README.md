# 🌟 Lumen — Desktop Companion & Spatial Workspace

> **Bilingual Documentation / Tài liệu Song ngữ (English & Tiếng Việt)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-v5.0-orange.svg)](https://zustand-demo.pmnd.rs/)
[![TanStack Router](https://img.shields.io/badge/TanStack-Router-FF4154.svg)](https://tanstack.com/router)

---

## 📑 Table of Contents / Mục Lục

- [English Documentation](#-english-documentation)
  - [Overview](#overview)
  - [Key Features](#key-features)
  - [Architecture & Tech Stack](#architecture--tech-stack)
  - [Getting Started](#getting-started)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Desktop Native Roadmap (Tauri v2)](#desktop-native-roadmap-tauri-v2)
- [Tài Liệu Tiếng Việt](#-tài-liệu-tiếng-việt)
  - [Tổng Quan Dự Án](#tổng-quan-dự-án)
  - [Tính Năng Nổi Bật](#tính-năng-nổi-bật)
  - [Kiến Trúc & Công Nghệ](#kiến-trúc--công-nghệ)
  - [Cài Đặt & Chạy Thử Nghiệm](#cài-đặt--chạy-thử-nghiệm)
  - [Phím Tắt Tiện Ích](#phím-tắt-tiện-ích)
  - [Lộ Trình Phát Triển Desktop Ứng Dụng Chuyên Nghiệp](#lộ-trình-phát-triển-desktop-ứng-dụng-chuyên-nghiệp)

---

# 🇬🇧 English Documentation

## Overview

**Lumen** is a lightweight, artisanal desktop companion and spatial note-taking application designed to bring warmth, focus, and playful utility to your daily workflow. It features **Pip**, an animated desktop pet that interacts with your workspace, fetches sticky notes, nudges you for reminders, and wanders peacefully across your screen.

---

## Key Features

- 🐾 **Pip the Companion:** An animated, procedural desktop pet with multiple emotional & behavioral states (`idle`, `wander`, `fetch`, `deliver`, `nudge`, `sleep`). Pip can physically bring you new notes upon request!
- 📝 **Spatial Sticky Notes:** Freely drag, rotate, color-tint, and position notes anywhere across your desktop canvas with smooth GPU-accelerated transforms.
- ⚡ **Global Quick Capture:** Instant note taking triggered via `Ctrl + Shift + N` or the dock tray.
- 🎨 **Artisanal Dynamic Themes:** 4 hand-crafted OKLCH themes designed for varied lighting conditions:
  - `Ink`: Deep obsidian & warm embers for night-owl focus.
  - `Paper`: Tactile, warm-toned cream for daylight reading.
  - `Glass`: Modern translucent dark-slate for high-tech aesthetics.
  - `Moss`: Calming forest green inspired by nature.
- 📐 **Adaptive Layouts:** Toggle seamlessly between `Stickies` (free spatial canvas), `Sidebar` (docked column), and `Tray` (clean backdrop).
- 💾 **Local-First Persistence:** Instant offline startup with zero latency, backed by Zustand state rehydration.

---

## Architecture & Tech Stack

```
lumen/
├── src/
│   ├── components/
│   │   ├── lumen/          # Domain components (Companion, StickyNote, Hub, Tray, Pip)
│   │   └── ui/             # Reusable design primitives (Radix UI wrappers)
│   ├── lib/
│   │   ├── store.ts        # Core Zustand store with local persistence
│   │   ├── types.ts        # TypeScript domain interfaces
│   │   ├── themes.ts       # Visual theme definitions & tokens
│   │   └── utils.ts        # Utility helpers
│   ├── routes/             # TanStack file-based route definitions
│   └── styles.css          # Tailwind CSS v4 design tokens & keyframes
```

- **Frontend Core:** React 19, TypeScript 5.7+
- **State Management:** Zustand 5.0 with `persist` middleware
- **Styling:** Tailwind CSS v4 + Native CSS Custom Properties
- **Routing:** TanStack Router & Start
- **Components:** Radix UI Primitives + Lucide Icons

---

## Getting Started

### Prerequisites
- **Node.js:** `v20.0.0` or higher (Recommended: Node 22 LTS)
- **Package Manager:** `npm` or `pnpm`

### Installation & Run

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Start the local development server (runs on 0.0.0.0:8080)
npm run dev

# 3. Type-check codebase
npm run typecheck

# 4. Build for production
npm run build
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + N` / `Cmd + Shift + N` | Open Quick Capture modal |
| `Escape` | Close Hub or Quick Capture dialog |
| `Click on Pip` | Trigger companion interaction / Fetch note |

---

## Desktop Native Roadmap (Tauri v2)

To deliver a true 10-year veteran desktop application experience, Lumen is architected to package into a native binary via **Tauri v2 (Rust)**:
1. **Window Transparency & Click-through:** Pip roaming freely across the OS desktop wallpaper over active windows.
2. **Native System Tray & Global Hotkeys:** OS-level registration of shortcuts even when the app is unfocused.
3. **Local SQLite / Vector Database:** Instant full-text and semantic search across thousands of historical notes.
4. **Sub-30MB RAM Footprint:** Eliminating heavy Chromium overhead using native webview rendering.

---

# 🇻🇳 Tài Liệu Tiếng Việt

## Tổng Quan Dự Án

**Lumen** là ứng dụng không gian làm việc (spatial workspace) và ghi chú tương tác kết hợp người bạn đồng hành ảo (**Pip**), mang lại trải nghiệm làm việc nhẹ nhàng, tập trung và đầy cảm hứng. Khác biệt hoàn toàn với các app ghi chú truyền thống, Lumen kết hợp giữa đồ họa tương tác 60FPS mượt mà và hệ thống quản trị dữ liệu local-first an toàn, bảo mật.

---

## Tính Năng Nổi Bật

- 🐾 **Thú cưng Desktop (Pip):** Nhân vật hoạt hình với máy trạng thái hành vi thông minh (`idle`, `wander`, `fetch`, `deliver`, `nudge`, `sleep`). Pip có thể đi lấy giấy ghi chú và mang trực tiếp đến cho bạn.
- 📝 **Canvas Ghi Chú Đa Chiều (Spatial Canvas):** Kéo thả tự do, xoay góc tự nhiên, gắn màu phong phú (Cream, Mist, Sage, Blush) trên mặt phẳng không gian desktop.
- ⚡ **Ghi Chú Nhanh (Quick Capture):** Bật bảng soạn thảo tức thì bằng tổ hợp phím `Ctrl + Shift + N`.
- 🎨 **4 Bộ Giao Diện Thủ Công Tinh Tế:**
  - `Ink`: Nền tối ấm áp, bảo vệ mắt khi làm việc ban đêm.
  - `Paper`: Giấy thủ công cổ điển, dịu mắt dưới ánh sáng ngày.
  - `Glass`: Phong cách kính mờ hiện đại, sắc sảo.
  - `Moss`: Xanh rêu tự nhiên tạo cảm giác thư giãn.
- 📐 **3 Chế Độ Hiển Thị:** `Stickies` (phân tán tự do), `Sidebar` (gọn gàng bên cạnh), `Tray` (ẩn ghi chú để tập trung).
- 💾 **Local-First & Bảo Mật:** Khởi động tức thì, lưu trữ cục bộ, không gửi dữ liệu ra máy chủ ngoài khi chưa được phép.

---

## Kiến Trúc & Công Nghệ

Ứng dụng được xây dựng theo tiêu chuẩn kỹ thuật hiện đại:
- **Ngôn ngữ & Thư viện UI:** React 19, TypeScript, Radix UI.
- **Quản lý State:** Zustand v5 (kết hợp Middleware Persist lưu trữ tự động).
- **Hệ thống Design Token:** Tailwind CSS v4, tối ưu hóa qua CSS Variables và OKLCH Color Space.
- **Điều hướng & Tối ưu:** TanStack Router, render mượt mà 60 FPS với rAF delta-time physics.

---

## Cài Đặt & Chạy Thử Nghiệm

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi động môi trường phát triển (chạy tại cổng 8080)
npm run dev

# 3. Kiểm tra tính toàn vẹn kiểu dữ liệu TypeScript
npm run typecheck

# 4. Đóng gói bản Production
npm run build
```

---

## Phím Tắt Tiện Ích

| Phím Tắt | Chức Năng |
|---|---|
| `Ctrl + Shift + N` / `Cmd + Shift + N` | Bật cửa sổ Ghi chú nhanh (Quick Capture) |
| `Escape` | Đóng Hub cài đặt hoặc cửa sổ ghi chú nhanh |
| `Nhấp chuột vào Pip` | Tương tác với thú cưng / Nhờ Pip lấy giấy ghi chú |

---

## Lộ Trình Phát Triển Desktop Ứng Dụng Chuyên Nghiệp

Dựa trên kinh nghiệm 10 năm phát triển ứng dụng Desktop hiệu năng cao, dự án sẽ tiến hành các giai đoạn chuyển đổi:
1. **Tích hợp Native Bridge (Tauri v2 + Rust):** Chạy ứng dụng dưới dạng cửa sổ trong suốt (Transparent Overlay), hỗ trợ click-through xuyên qua cửa sổ khi không thao tác với thú cưng.
2. **System Tray & Global Shortcut:** Chạy ngầm mượt mà dưới khay hệ thống Windows/macOS, gọi ghi chú nhanh từ bất kỳ ứng dụng nào.
3. **Bộ Nhớ Siêu Nhẹ (Low Memory Footprint):** Giảm mức tiêu thụ RAM xuống dưới 30MB nhờ Native Webview thay vì đóng gói Chromium nặng nề.
4. **Lưu Trữ SQLite & Tìm Kiếm Ngữ Nghĩa (Vector Search):** Tích hợp AI cục bộ (Local LLM / Ollama) để thú cưng Pip có thể trò chuyện và phân tích ghi chú của bạn.

---

## 📄 License & Attribution

Distributed under the MIT License. Designed & engineered with craftmanship for high-performance desktop productivity.
