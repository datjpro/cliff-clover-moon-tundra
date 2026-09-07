export interface ReleaseHighlight {
  icon: string;
  badge: "feat" | "fix" | "perf" | "pro" | "ui";
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
}

export interface VersionRelease {
  version: string;
  releaseName: string;
  releaseDate: string;
  isLatest?: boolean;
  highlights: ReleaseHighlight[];
}

export const APP_RELEASES: VersionRelease[] = [
  {
    version: "1.1.0",
    releaseName: "Lumen v1.1.0 — In-App Update Engine & Spatial Calendar Evolution",
    releaseDate: "2026-09-07",
    isLatest: true,
    highlights: [
      {
        icon: "🔄",
        badge: "feat",
        titleVi: "Kiểm Tra Cập Nhật Thông Minh & Guard Ngoại Tuyến",
        titleEn: "Smart In-App Update Checker & Offline Guard",
        descriptionVi:
          "Hỗ trợ kiểm tra bản cập nhật mới theo yêu cầu với thông báo mất kết nối mạng, giao diện xem trước tính năng mới và tùy chọn Cập nhật / Bỏ qua phiên bản.",
        descriptionEn:
          "On-demand update verification with offline network connectivity guard, rich release highlights modal, and Update / Skip / Remind options.",
      },
      {
        icon: "📅",
        badge: "feat",
        titleVi: "Module Lịch Trình Độc Lập (Spatial Calendar Standalone)",
        titleEn: "Standalone Spatial Calendar & Agenda Widget",
        descriptionVi:
          "Tách hoàn toàn Lịch trình thành module độc lập (Alt+C) với giao diện mở rộng 2 cột, lọc đúng sự kiện hôm nay ở chế độ thu gọn và dock 4 góc màn hình.",
        descriptionEn:
          "Dedicated standalone calendar module (Alt+C) with expansive dual-pane view, strict Today's Agenda filtering in compact capsule, and 4-corner dock.",
      },
      {
        icon: "🎯",
        badge: "ui",
        titleVi: "Bộ Chọn Giờ Ống Ngắm 24H (Barrel-Wheel Scope Picker)",
        titleEn: "Tactical 24H Scope Rotary Time Picker",
        descriptionVi:
          "Bộ chọn giờ xoay 24H phong cách Tactical Scope với âm thanh click cơ học, cuộn vô tận 00-23 và 00-59 cực kỳ mượt mà.",
        descriptionEn:
          "Tactical 24H scope rotary barrel wheel with mechanical audio clicks and seamless infinite scrolling (00-23h, 00-59m).",
      },
      {
        icon: "🎁",
        badge: "pro",
        titleVi: "Mã Dùng Thử Lumen Pro 3 Ngày (LUMENTRIAL3DAY)",
        titleEn: "3-Day Pro Trial Engine (Code: LUMENTRIAL3DAY)",
        descriptionVi:
          "Giao diện nâng cấp Pro sang trọng kèm hệ thống kích hoạt dùng thử 3 ngày miễn phí với mã LUMENTRIAL3DAY và bộ đếm ngược thời gian hết hạn.",
        descriptionEn:
          "Revamped luxury Pro upgrade modal with instant 3-day full Pro trial pass using code LUMENTRIAL3DAY and live countdown timer.",
      },
      {
        icon: "🛡️",
        badge: "fix",
        titleVi: "Form Thêm Việc Nhúng Chống Tràn & Dọn Dữ Liệu Mẫu",
        titleEn: "In-Place Fluid Event Form & Clean Seed Data",
        descriptionVi:
          "Khắc phục hoàn toàn lỗi tràn layout form thêm việc, chống mất dữ liệu khi click ra ngoài và thanh lọc 100% dữ liệu mẫu gây hiểu lầm.",
        descriptionEn:
          "Fixed modal overflow scaling, prevented accidental form closing on outside click, and purged all legacy seed mock events.",
      },
    ],
  },
  {
    version: "1.0.1",
    releaseName: "Lumen v1.0.1 — Pro Upgrade & Stability Pass",
    releaseDate: "2026-09-07",
    highlights: [
      {
        icon: "👑",
        badge: "pro",
        titleVi: "Hệ thống Bản quyền Pro & Kích hoạt Mã",
        titleEn: "Pro License Management System",
        descriptionVi: "Hỗ trợ kích hoạt License Key bản quyền vĩnh viễn và gói dùng thử có thời hạn.",
        descriptionEn: "Support for lifetime Pro license key activation and temporary trial periods.",
      },
      {
        icon: "⚡",
        badge: "perf",
        titleVi: "Tối ưu hóa GPU Compositing & Bộ đệm Render",
        titleEn: "GPU Compositing & Frame Budget Polish",
        descriptionVi: "Duy trì ổn định 60-120 FPS với cơ chế click-through OS cải tiến không chiếm dụng CPU.",
        descriptionEn: "Maintained solid 60-120 FPS rendering with optimized OS click-through IPC toggling.",
      },
    ],
  },
  {
    version: "1.0.0",
    releaseName: "Lumen v1.0.0 — Official Genesis Desktop Release",
    releaseDate: "2026-09-01",
    highlights: [
      {
        icon: "🐾",
        badge: "feat",
        titleVi: "Thú ảo Pip tương tác & Tủ đồ 5 loài",
        titleEn: "Interactive Pip Companion & 5 Pet Species",
        descriptionVi: "5 loài thú ảo với tương tác ném bóng, xoa đầu, cho ăn bánh, nhảy múa và lấy giấy.",
        descriptionEn: "5 procedural pet species with ball throwing, petting, feeding, and paper delivery.",
      },
      {
        icon: "📝",
        badge: "feat",
        titleVi: "Ghi chú dán không gian xoay 360°",
        titleEn: "Spatial Sticky Notes with 360° Rotation",
        descriptionVi: "Ghi chú dán tự do với xoay 360°, hít mép màn hình và tùy chỉnh phông chữ, độ mờ.",
        descriptionEn: "Spatial notes with continuous 360° rotation, bezel snapping, and custom Word fonts.",
      },
      {
        icon: "⏱️",
        badge: "feat",
        titleVi: "Hẹn giờ thông minh ngôn ngữ tự nhiên",
        titleEn: "Smart Timers & Procedural Alarm Synthesizer",
        descriptionVi: "Phân tích cú pháp hẹn giờ tự nhiên ('Pomodoro 25p') và 4 chuông báo âm lượng lớn.",
        descriptionEn: "Natural language timer parser and 4 procedural web audio synthesized alarm tones.",
      },
    ],
  },
];