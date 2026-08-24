# 🐾 PHASE 2: ĐỘNG CƠ THÚ CƯNG ẢO & VẬT LÝ CHUYỂN ĐỘNG 120 FPS

> **Mục tiêu:** Xây dựng hệ thống thú cưng ảo (Pip & Companions) di chuyển mượt mà trên toàn màn hình với vòng lặp vật lý tách rời, dấu chân mờ dần và 5 loài thú cưng khác nhau.

---

## 1. Các Tính Năng Đã Hiện Thực (Delivered)

### 1.1 Vòng Lặp Chuyển Động Chuẩn GPU (120 FPS Physics)
- **Tọa độ thực tế dựa trên phần cứng (`translate3d(x px, y px, 0)`):** Loại bỏ hoàn toàn việc tính toán phần trăm `%` gây giật layout trình duyệt.
- **Hoạt họa bước chân lượng giác:**
  - Chân trái & phải sải bước: `Math.sin(walkPhase) * 22deg`.
  - Thân mình nhấp nhô theo nhịp: `Math.abs(Math.sin(walkPhase)) * -3.5px`.
  - Đuôi vẫy vui vẻ khi dạo bước: `Math.sin(walkPhase * 0.8) * 18deg`.
- **Tách biệt React State:** Vòng lặp vật lý chạy độc lập với React state, đảm bảo 0% giật cục và tối đa hiệu năng.

### 1.2 Dấu Vết Bước Chân (Fading Paw Prints Trail 🐾)
- Khi di chuyển, thú cưng để lại những vết chân nhỏ mờ dần theo hướng bước đi.
- Tự động dọn dẹp bộ nhớ theo cơ chế FIFO (giới hạn 24 vết chân và mờ dần trong 10 giây).

### 1.3 5 Loài Thú Cưng Phong Phú
1. 🦊 **Cáo Nhỏ (Adventurer Fox):** Chú cáo thám hiểm đeo ba lô da nâu và khóa vàng (theo chuẩn thiết kế gốc).
2. 🐱 **Mèo Mướp (Cozy Cat):** Mèo tam thể với râu mèo xinh xắn và vẫy đuôi.
3. 🐕 **Chó Shiba:** Shiba vàng đeo khăn quàng đỏ.
4. 🐉 **Rồng Con (Baby Dragon):** Rồng xanh với đôi cánh nhỏ ngộ nghĩnh.
5. 🤖 **Cyber Bot:** Robot tương lai phát sáng neon.

### 1.4 Tương Tác Trực Tiếp & Ẩn/Hiện Thú Cưng
- **Kéo thả:** Dùng chuột nhấc thú cưng đặt ở bất kỳ đâu trên màn hình.
- **Hành vi tương tác:** Xoa đầu (Pet), Cho ăn dâu (Feed), Nhảy múa (Dance), Đi ngủ/Đánh thức (Sleep/Wake), Lấy giấy note (Fetch Note).
- **Ẩn / Hiện Thú Cưng:** Bấm nút ẩn trên menu thú cưng hoặc trong Khay hệ thống bất kỳ lúc nào.
