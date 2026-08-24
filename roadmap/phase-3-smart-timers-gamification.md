# ⏰ PHASE 3: BẤM GIỜ THÔNG MINH, THẺ ĐẾM NGƯỢC NỔI & CHUÔNG BÁO

> **Mục tiêu:** Xây dựng hệ thống hẹn giờ/bấm giờ thông minh với khả năng phân tích ngôn ngữ tự nhiên (cho game như COC, công việc, nấu ăn), thẻ đồng hồ đếm ngược nổi trên Desktop và chuông báo âm thanh đa âm sắc.

---

## 1. Các Tính Năng Đã Hiện Thực (Delivered)

### 1.1 Bộ Phân Tích Cú Pháp Ngôn Ngữ Tự Nhiên (Natural Language Parser)
- Tự động tách tên mục tiêu và thời lượng:
  - `xây nhà trong COC : 2g14p` ➔ Tiêu đề: *Xây nhà trong COC*, Thời lượng: *2 giờ 14 phút* (`02:14:00`).
  - `pomodoro 25p` ➔ Tiêu đề: *Pomodoro*, Thời lượng: *25 phút*.
  - `tập gym 45p` ➔ Tiêu đề: *Tập gym*, Thời lượng: *45 phút*.
  - `nấu canh súp : 15p30s` ➔ Tiêu đề: *Nấu canh súp*, Thời lượng: *15 phút 30 giây*.
- Nút bấm nhanh tiện lợi: `+5p`, `+15p`, `+25p`, `+1g`, `Xây nhà COC (2g14p)`.

### 1.2 Thẻ Đồng Hồ Đếm Ngược Nổi Trên Màn Hình (Floating Desktop Timers)
- Hiển thị trực tiếp đồng hồ kỹ thuật số `HH:MM:SS` đếm ngược thời gian thực.
- Thanh tiến trình phần trăm trực quan.
- Tự do kéo thả vị trí thẻ đồng hồ đến bất kỳ vị trí nào trên màn hình máy tính (gần game hoặc góc taskbar).
- Nút gia hạn nhanh `+5p` trực tiếp trên thẻ.

### 1.3 Chuông Báo Động & Tương Tác Thú Cưng Khi Hết Giờ
- **Bộ tổng hợp âm thanh Web Audio Synthesizer:** Phát chuông báo động đa âm rõ ràng, êm tai.
- **Native Desktop Notification:** Gửi thông báo hệ thống Windows Notification nổi góc màn hình.
- **Thú cưng Pip thông báo:** Chú cáo nhảy múa và hiện bong bóng thoại chúc mừng mục tiêu hoàn thành.
