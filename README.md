# YouTube Personal Web Player

Đây là một ứng dụng web mô phỏng giao diện YouTube cá nhân, được xây dựng bằng **Next.js** và **TypeScript**, cho phép tìm kiếm và xem video YouTube trực tiếp.

## 🌟 Chức năng chính

- Tìm kiếm video từ YouTube theo từ khóa
- Hiển thị kết quả tìm kiếm với hình ảnh thu nhỏ và tiêu đề
- Phát video trực tiếp bằng trình phát tích hợp
- Hiển thị thông tin chi tiết video (tiêu đề, mô tả, ngày đăng, v.v.)
- Thiết kế responsive, hỗ trợ nhiều kích thước màn hình
- Tự động tìm kiếm với từ khóa mặc định khi tải trang

## ⚙️ Công nghệ sử dụng

- **Next.js** – Framework React
- **TypeScript**
- **YouTube Data API v3**
- **Axios** – Gửi HTTP request
- **Material UI** – Giao diện người dùng
- **React Hooks** – Quản lý trạng thái
- **CSS Modules** – Styling riêng biệt theo component

## 🚀 Hướng dẫn chạy source

### 🔧 Yêu cầu

- Node.js v14 hoặc mới hơn
- API key của YouTube (lấy tại [Google Cloud Console](https://console.cloud.google.com))

### 🛠 Cài đặt

1. **Clone source về máy**:

```bash
git clone https://github.com/your-username/youtube-web-player.git
cd youtube-web-player
```

2. **Cài đặt**:
```bash
npm install
# hoặc
yarn install
```

3. **Chạy ứng dụng**:
```bash
npm run dev
# hoặc
yarn dev
```

📁 Cấu trúc dự án cơ bản
youtube-web-player/
├── components/             # Các component giao diện
│   ├── SearchBox/          # Ô tìm kiếm
│   ├── VideoList/          # Danh sách video
│   ├── VideoPlayer/        # Trình phát video
│   └── VideoThumbnail/     # Video dạng thumbnail
├── hooks/                 
│   └── useYouTubeApi/      # Custom hook gọi API
├── pages/                  # Trang Next.js
│   ├── api/                # API routes
│   ├── _app.tsx            # App layout chính
│   └── index.tsx           # Trang chủ
├── styles/                 # CSS toàn cục
├── types/                  # Định nghĩa TypeScript
└── utils/                  # Hàm tiện ích


