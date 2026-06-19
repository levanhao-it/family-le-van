# Family Genealogy Platform — Ultra Premium Version

Nền tảng website gia phả thế hệ mới mang đẳng cấp **cinematic luxury experience**.

## Tech Stack

- **React 19** + Vite 6
- **HeroUI** (NextUI) — UI component system
- **TailwindCSS** 3 — với custom design tokens
- **Framer Motion** 12 — cinematic animations
- **React Flow** 11 — family tree visualization
- **Zustand** — state management
- **React Router DOM** 7 — routing

## Quick Start

```bash
# 1. Vào thư mục
cd version_react_hero_ui

# 2. Cài dependencies
npm install

# 3. Chạy dev server
npm run dev

# 4. Mở trình duyệt
# http://localhost:3000
```

Hoặc chạy file `start.bat` (Windows).

## Cấu trúc thư mục

```
src/
├── app/          — App root, router
├── components/
│   ├── common/   — AtmosphericBackground, shared UI
│   └── layout/   — Navigation, Footer, MainLayout
├── constants/    — App constants, nav items, labels
├── data/         — Mock data (familyMembers, timeline, etc.)
├── features/
│   ├── hero/         — Cinematic landing hero
│   ├── home/         — Home page sections
│   ├── family-tree/  — React Flow tree + profile modal
│   ├── timeline/     — Historical timeline
│   ├── calendar/     — Ritual calendar
│   ├── activities/   — Lucky wheel + question cards
│   ├── gallery/      — Photo gallery + lightbox
│   ├── temple/       — Family temple + gia huấn
│   └── map/          — Heritage map
├── lib/          — Motion presets
├── pages/        — Page components (lazy-loaded)
├── stores/       — Zustand stores
├── styles/       — Global CSS
└── utils/        — Utility functions
```

## Trang chính

| Route | Trang |
|---|---|
| `/` | Trang chủ cinematic |
| `/gia-pha` | Cây gia phả React Flow |
| `/lich-su` | Dòng thời gian lịch sử |
| `/nghi-le` | Lịch nghi lễ |
| `/hoat-dong` | Lucky wheel + Question cards |
| `/hinh-anh` | Album ảnh |
| `/nha-tho-ho` | Nhà thờ họ + Gia huấn |
| `/ban-do` | Bản đồ di sản |

## Dữ liệu mock

- **22 thành viên** — 4 thế hệ dòng họ Lê Văn
- **12 sự kiện** lịch sử (1850—2025)
- **12 nghi lễ** âm lịch hàng năm
- **20 câu hỏi** gia tộc (6 danh mục)
- **12 hình ảnh** gallery

## Design System

Màu chủ đạo:
- `#1F1A17` — Obsidian (nền chính)
- `#D6B98C` — Bronze (accent chính)
- `#C9A84C` — Gold (highlight)
- `#F5EFE6` — Ivory (text)

Font:
- **Cinzel** — headings, display
- **Playfair Display** — subheadings, quotes
- **Be Vietnam Pro** — body text