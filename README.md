# Sổ chỉnh sửa bản vẽ

Trang web theo dõi các lần chỉnh sửa bản vẽ: mã bản vẽ, revision, nội dung sửa, lý do, người sửa, trạng thái.
Giao diện chạy trên **GitHub Pages**, dữ liệu lưu trong **Google Sheets**. Ai có link web đều xem và nhập được, không cần tài khoản.

Repo gồm:

- `index.html`: trang web.
- `Code.gs`: mã cho Google Apps Script. Đây là cầu nối giữa trang web và Google Sheet, **không cần đẩy lên GitHub**.

---

## Bước 1. Tạo Google Sheet và Web App

1. Vào https://sheets.new để tạo một Google Sheet mới, đặt tên, ví dụ `So chinh sua ban ve`.
2. Trên thanh menu, chọn **Extensions (Tiện ích mở rộng) → Apps Script**.
3. Xóa hết code mẫu trong `Code.gs`, dán toàn bộ nội dung file `Code.gs` của repo này vào, rồi bấm **Save** (biểu tượng đĩa mềm).
4. *(Tùy chọn)* Muốn đặt mã bảo vệ thì sửa dòng `const ACCESS_KEY = "";` thành mã của bạn, ví dụ `"TDI2026"`, rồi Save.
5. Bấm **Deploy → New deployment**.
   - Ở biểu tượng bánh răng **Select type**, chọn **Web app**.
   - **Execute as**: `Me`.
   - **Who has access**: `Anyone`.
   - Bấm **Deploy**.
6. Google sẽ hỏi cấp quyền. Bấm **Authorize access** và chọn tài khoản Google của bạn.
   - Nếu hiện cảnh báo "Google hasn't verified this app", bấm **Advanced → Go to ... (unsafe)**. Đây là script do chính bạn tạo, nên bước này an toàn.
7. Copy **Web app URL**, dạng `https://script.google.com/macros/s/XXXX/exec`.

Sheet `revisions` sẽ tự được tạo khi có bản ghi đầu tiên.

## Bước 2. Dán URL vào trang web

Mở `index.html` (trên GitHub: bấm vào file → biểu tượng bút chì). Tìm dòng sau ở đầu phần `<script>`:

```js
const SCRIPT_URL = "";
```

Dán URL vào giữa hai dấu ngoặc kép:

```js
const SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
```

Rồi bấm **Commit changes**.

## Bước 3. Bật GitHub Pages

1. Vào repo → **Settings → Pages**.
2. Ở **Build and deployment**:
   - **Source**: `Deploy from a branch`.
   - **Branch**: `main`, thư mục `/ (root)`.
   - Bấm **Save**.
3. Sau 1–2 phút, link web hiện ở đầu trang Pages, dạng `https://<tài-khoản>.github.io/<tên-repo>/`.

Gói GitHub miễn phí chỉ chạy Pages với repo **Public**. Repo Private cần gói trả phí.

---

## Lưu ý

- **Bảo mật**: ai có link web (và mã truy cập, nếu bạn đặt) đều xem, thêm, sửa, xóa được. Không dùng sổ này cho thông tin mật.
- **Xem và sửa trực tiếp trong Google Sheet**: được. Chỉ giữ nguyên dòng tiêu đề và cột `id`.
- **Sau khi sửa `Code.gs`**, phải triển khai lại thì thay đổi mới có hiệu lực: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. URL giữ nguyên.
- **Cập nhật dữ liệu**: trang tự tải lại mỗi 30 giây. Bấm **Làm mới** để cập nhật ngay.
- **Mã bộ môn** trong sheet: KT, KC, DIEN, NUOC, HVAC, PCCC, HT, KHAC.
- **Mã trạng thái** trong sheet: dang (Đang sửa), cho (Chờ duyệt), duyet (Đã duyệt), phat (Đã phát hành), huy (Hủy bỏ).
