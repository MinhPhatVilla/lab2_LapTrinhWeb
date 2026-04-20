# LAB 2: Backend với Node.js & Express
## Xây dựng RESTful API Quản lý Đơn hàng (CRUD)
**Nhóm 2**

---

## 1. Đề bài yêu cầu

Xây dựng một RESTful API quản lý đơn hàng sử dụng **Node.js**, **Express** và **MongoDB Atlas**, bao gồm:

- Thiết kế cấu trúc project theo mô hình MVC
- Định nghĩa Model đơn hàng với Mongoose
- Viết đầy đủ 5 API CRUD (Tạo, Đọc, Sửa, Xóa)
- **Challenge:** Lọc theo trạng thái, tìm kiếm theo tên, sắp xếp theo tổng tiền

---

## 2. Những gì đã thực hiện

### 2.1. Khởi tạo dự án
- Tạo project Node.js, cài đặt các thư viện: `express`, `mongoose`, `dotenv`, `cors`, `nodemon`
- Tổ chức thư mục theo mô hình MVC:

```
order-management-api/
├── models/Order.js        # Schema đơn hàng
├── routes/orderRoutes.js  # Các API endpoints
├── .env                   # Biến môi trường (MongoDB URI)
├── .gitignore             # Loại trừ node_modules, .env
├── server.js              # Khởi tạo server, kết nối DB
└── package.json
```

### 2.2. Kết nối MongoDB Atlas
- Tạo Cluster `lab2` trên MongoDB Atlas
- Cấu hình connection string trong file `.env`
- Kết nối thành công từ server qua Mongoose

### 2.3. Định nghĩa Model đơn hàng (`models/Order.js`)

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| customerName | String (bắt buộc) | Tên khách hàng |
| customerEmail | String (bắt buộc) | Email khách hàng |
| items | Array | Danh sách sản phẩm (productName, quantity, unitPrice) |
| totalAmount | Number (bắt buộc) | Tổng tiền đơn hàng |
| status | String (enum) | Trạng thái: pending, confirmed, shipped, delivered, cancelled |
| createdAt | Date | Ngày tạo (tự động) |

### 2.4. Viết 5 API CRUD (`routes/orderRoutes.js`)

| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| GET | `/api/orders` | Lấy toàn bộ đơn hàng |
| GET | `/api/orders/:id` | Lấy đơn hàng theo ID |
| POST | `/api/orders` | Tạo đơn hàng mới |
| PUT | `/api/orders/:id` | Cập nhật đơn hàng |
| DELETE | `/api/orders/:id` | Xóa đơn hàng |

### 2.5. Hoàn thành 3 Challenge

| # | Yêu cầu | Cách thực hiện |
|---|---------|---------------|
| 1 | Lọc theo trạng thái | `GET /api/orders?status=pending` — Dùng `Order.find({ status })` |
| 2 | Tìm kiếm theo tên KH | `GET /api/orders/search?name=Nguyen` — Dùng Regex `{ $regex, $options: 'i' }` |
| 3 | Sắp xếp theo tổng tiền | `GET /api/orders?sort=asc` — Dùng `.sort({ totalAmount: 1 hoặc -1 })` |

---

## 3. Kết quả kiểm thử

Đã test toàn bộ API: **22/22 test cases PASS**

```
✅ GET /            — Server hoạt động
✅ POST /api/orders  — Tạo 3 đơn hàng thành công (status 201)
✅ GET /api/orders   — Lấy đúng 3 đơn hàng
✅ GET /api/orders/:id — Lấy đúng theo ID, trả 404 nếu không tìm thấy
✅ PUT /api/orders/:id — Cập nhật status pending → confirmed → shipped
✅ DELETE /api/orders/:id — Xóa thành công, xác nhận còn 2 đơn
✅ Challenge 1: Lọc status=confirmed → 1 kết quả đúng
✅ Challenge 2: Tìm name=Nguyen → đúng, name=XYZ → 0 kết quả
✅ Challenge 3: sort=asc → 26tr → 35tr, sort=desc → 35tr → 26tr
```

---

## 4. Cách chạy dự án

```bash
# 1. Clone repo
git clone https://github.com/MinhPhatVilla/lab2_LapTrinhWeb.git
cd lab2_LapTrinhWeb

# 2. Cài đặt thư viện
npm install

# 3. Tạo file .env
# PORT=5000
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/OrderDB

# 4. Chạy server
npm run dev
```

Server chạy tại: `http://localhost:5000`

---

**GitHub:** https://github.com/MinhPhatVilla/lab2_LapTrinhWeb
