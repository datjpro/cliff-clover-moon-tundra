# 🚀 PHASE 4 & 5: KẾ HOẠCH MỞ RỘNG, ĐỒNG BỘ CỤC BỘ & ĐÓNG GÓI PHÂN PHỐI

> **Mục tiêu:** Định hướng nâng cấp dài hạn cho Lumen: đồng bộ hóa dữ liệu cục bộ an toàn, hệ sinh thái phụ kiện thú cưng, đóng gói bản phát hành đa nền tảng và kiểm thử hiệu năng.

---

## 1. Phase 4: Mở Rộng Tính Năng & Hệ Sinh Thái Thú Cưng

### 1.1 Phụ Kiện & Tùy Biến Thú Cưng (Pet Wardrobe & Accessories)
- Thêm các phụ kiện: Mũ thám hiểm, kính râm, nơ cổ, ba lô phong cách khác nhau.
- Tự động thay đổi hành vi theo thời gian thực (ví dụ: Buổi tối thú cưng tự đeo mũ ngủ, trời mưa xuất hiện ô nhỏ).

### 1.2 Đồng Bộ Hóa Cục Bộ (Local-First LAN Sync)
- Đồng bộ ghi chú và hẹn giờ giữa máy tính bàn và laptop trong cùng mạng WiFi nội bộ mà không cần gửi dữ liệu lên server bên thứ ba (WebRTC / Local SQLite Sync).
- Hỗ trợ mã hóa đầu cuối E2EE (End-to-End Encryption).

### 1.3 Tiện Ích Mở Rộng & Widget Mini
- Mini-game tương tác ngắn khi thú cưng buồn chán (ném bóng bắt đồ, câu cá).
- Hỗ trợ ghi chú định dạng Markdown nâng cao, chèn bảng và hình ảnh nhanh.

---

## 2. Phase 5: Đóng Gói Bộ Cài & Tối Ưu Phân Phối Đa Nền Tảng

### 2.1 Bộ Cài Đặt Tự Động (Native Installers)
- **Windows:** File cài đặt `Lumen-Setup.exe` (NSIS) hoặc `.msi`, tự động đăng ký khởi động cùng Windows (Startup Daemon) và icon System Tray.
- **macOS:** File `.dmg` ký số, hỗ trợ Apple Silicon (M1/M2/M3/M4) và Intel x64.
- **Linux:** Gói `.AppImage` và `.deb` tối ưu cho Ubuntu/Arch/Fedora.

### 2.2 Tối Ưu Hóa Bộ Nhớ & CPU
- Đảm bảo RAM hoạt động ổn định dưới 45MB khi chạy nền 24/7.
- Tự động hạ tần số quét vòng lặp vật lý khi màn hình tắt hoặc khi người dùng chạy ứng dụng toàn màn hình độc quyền (Exclusive Fullscreen Games).
