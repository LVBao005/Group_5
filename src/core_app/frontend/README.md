# HƯỚNG DẪN ĐẦY ĐỦ CÀI ĐẶT & CHẠY DỰ ÁN (DÙNG CMD)

Tài liệu này cung cấp lộ trình đầy đủ các lệnh Command Prompt (CMD) để bạn quản lý và phát triển dự án **PharmaPOS Frontend**.

## 1. Kiểm tra môi trường (Cần làm trước)
Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài Node.js. Mở CMD và gõ:
```cmd
node -v
npm -v
```
*Nếu hiện ra số phiên bản (vd: v18.x.x) là bạn đã sẵn sàng.*

## 2. Di chuyển vào thư mục dự án
Mỗi khi mở CMD mới, bạn cần "đi" vào đúng Folder dự án:
```cmd
cd /d d:\GitHub\Group_5\src\core_app\frontend
```

## 3. Quản lý thư viện (NPM)

### Cài đặt mới hoặc cập nhật:
Lệnh này tải các thư viện từ file `package.json` về thư mục `node_modules` (thư mục này đã được ẩn trong `.gitignore` nên sẽ không bị push lên mạng):
```cmd
npm install
```
*Mẹo: Nếu cài chậm hoặc lỗi, dùng: `npm install --legacy-peer-deps`*

### Xóa và cài lại sạch sẽ (Nếu gặp lỗi lạ):
```cmd
rd /s /q node_modules
del package-lock.json
npm install
```

## 4. Chạy dự án

### Chế độ lập trình (Development):
Chạy lệnh này và giữ cửa sổ CMD luôn mở khi đang code:
```cmd
npm run dev
```

### Đóng gói (Build):
Khi muốn xuất bản dự án để chạy thật (tạo ra thư mục `dist`):
```cmd
npm run build
```

## 5. Lệnh Git cơ bản (Để lưu code lên GitHub)
Nhờ có file `.gitignore`, các file rác sẽ tự động bị loại bỏ qua các lệnh sau:

### Lưu các thay đổi hiện tại:
```cmd
git add .
git commit -m "Ghi chú nội dung bạn vừa sửa ở đây"
```

### Đẩy code lên mạng:
```cmd
git push origin main
```

### Lấy code mới nhất về:
```cmd
git pull origin main
```

---
**Lưu ý quan trọng:**
- Không bao giờ xóa file `.gitignore`.
- Luôn chạy `cd` vào đúng thư mục trước khi gõ lệnh.
- Nếu CMD bị treo hoặc muốn dừng lệnh đang chạy: Nhấn `Ctrl + C` và chọn `Y`.
