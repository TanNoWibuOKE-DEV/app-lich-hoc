# Hướng dẫn lấy file APK cho "Lịch học của tôi"

Project này là một app Next.js + Capacitor đã được cấu hình sẵn để đóng gói thành app Android.
Có 2 cách để ra được file `.apk` thật, chọn 1 trong 2 là được.

---

## Cách 1: Build tự động bằng GitHub Actions (không cần cài gì cả) — khuyên dùng

Cách này build "trên mây", bạn chỉ cần trình duyệt và tài khoản GitHub miễn phí.

### Bước 1 — Tạo tài khoản & repo GitHub
1. Vào https://github.com và tạo tài khoản (nếu chưa có).
2. Bấm **New repository**, đặt tên bất kỳ (VD: `lich-hoc-ca-nhan`), để **Public** hoặc **Private** đều được, bấm **Create repository**.

### Bước 2 — Upload toàn bộ project lên repo
1. Trong repo vừa tạo, bấm **Add file → Upload files**.
2. Kéo thả **toàn bộ nội dung** của thư mục project (đã giải nén file zip này) vào, bao gồm cả thư mục ẩn `.github` (nếu trình duyệt không nhận thư mục `.github` khi kéo thả cả folder, bạn có thể kéo thả từng thư mục con: `app`, `components`, `public`, `lib`, `android`, `.github`, và các file lẻ ở gốc).
3. Bấm **Commit changes**.

### Bước 3 — Chạy build
1. Vào tab **Actions** ở repo.
2. Nếu workflow chưa tự chạy, chọn **Build Android APK** ở danh sách bên trái → bấm **Run workflow**.
3. Đợi khoảng 5–10 phút để build xong (có dấu tick xanh ✅).

### Bước 4 — Tải file APK
1. Bấm vào lần chạy build đã xong (dấu tick xanh).
2. Kéo xuống phần **Artifacts**, tải file `lich-hoc-ca-nhan-debug-apk.zip`.
3. Giải nén ra sẽ được file `app-debug.apk` — đây chính là file cài đặt cho Android.
4. Chuyển file này vào điện thoại (qua Google Drive, Zalo, USB...), mở file để cài. Nếu máy chặn, vào **Cài đặt → Bảo mật → Cho phép cài ứng dụng từ nguồn này**.

---

## Cách 2: Build bằng Android Studio trên máy tính

Dùng cách này nếu bạn muốn tự chỉnh sửa code hoặc không muốn dùng GitHub.

1. Cài **Node.js** (https://nodejs.org) và **Android Studio** (https://developer.android.com/studio).
2. Mở terminal tại thư mục project, chạy:
   ```
   npm install -g pnpm
   pnpm install
   pnpm build
   npx cap sync android
   ```
3. Mở thư mục `android` bằng Android Studio (**Open** → chọn folder `android`).
4. Đợi Android Studio tự tải Gradle/SDK lần đầu (cần internet).
5. Vào menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
6. File APK sẽ nằm ở `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Ghi chú
- App hiện lưu dữ liệu (tài khoản, lịch học) bằng `localStorage` ngay trên máy — chưa có server, mỗi máy/app cài riêng sẽ có dữ liệu riêng.
- File APK build theo cách trên là bản **debug**, cài thử trên điện thoại được ngay. Nếu muốn phát hành lên Google Play, cần build bản **release** có ký số (signed) — có thể hỏi thêm khi cần.
