# 📑 PHASE 1: NỀN TẢNG LỚP PHỦ TRONG SUỐT & GHI CHÚ SPATIAL

> **Mục tiêu:** Xây dựng lớp phủ tàng hình toàn màn hình máy tính với cơ chế Nhấp Xuyên Chuột (Click-Through IPC) và hệ thống giấy dán ghi chú 3D tương tác tự do.

---

## 1. Các Tính Năng Đã Hiện Thực (Delivered)

### 1.1 Lớp Phủ Toàn Màn Hình Tàng Hình (Zero-Frame Overlay)
- `transparent: true`, `frame: false`, `backgroundColor: '#00000000'`, `alwaysOnTop: true, 'screen-saver'`.
- `skipTaskbar: true`: Chạy ngầm dưới dạng System Tray Utility, không chiếm chỗ trên thanh Taskbar Windows.
- Tự động nhận diện kích thước màn hình chính (`screen.getPrimaryDisplay().bounds`).

### 1.2 Cơ Chế Nhấp Xuyên Chuột (Click-Through IPC Protocol)
- Lắng nghe sự kiện di chuyển chuột:
  - Khi chuột ở trên vùng trống: Kích hoạt `setIgnoreMouseEvents(true, { forward: true })` để chuột nhấp xuyên qua ứng dụng khác bên dưới (Chrome, Word, Game).
  - Khi chuột rê vào Ghi chú, Thú cưng, hoặc Nút bấm: Kích hoạt `setIgnoreMouseEvents(false)` để nhận sự kiện kéo thả, gõ chữ, tương tác.

### 1.3 Hệ Thống Ghi Chú Dán (Spatial Sticky Notes)
- **Đinh ghim 3D (Metallic Pushpin):** Đổ bóng kim loại nổi bật ngay đầu mẩu giấy.
- **Danh sách công việc (Checklist To-do):** Thêm các mục việc có ô checkbox `☑ / ⬜` với gạch ngang hoàn thành.
- **Tùy biến đa dạng:**
  - 7 tông màu: `cream`, `mist`, `sage`, `blush`, `neon`, `dark`, `glass`.
  - Phông chữ: `Sans`, `Handwriting (Script)`, `Mono (Code)`.
  - Độ mờ (Opacity Slider): Tùy chỉnh độ trong suốt từ `30%` đến `100%`.
- **Nhấp đúp tạo Note:** Nhấp đúp chuột vào bất kỳ vị trí trống nào trên Desktop để tạo ghi chú mới ngay tại tọa độ con trỏ.
- **Sắp xếp tự động (Arrange Notes):** 1 nút bấm gom toàn bộ ghi chú rải rác thành hàng lối ngay ngắn bên phải màn hình.

---

## 2. Tiêu Chí Kỹ Thuật Đạt Được
- **CPU:** < 0.5% khi nhàn rỗi.
- **RAM:** < 45MB.
- **Độ trễ phản hồi (Input Latency):** < 8ms.
