// Application-wide constants

export const APP_CONFIG = {
  name: 'Gia Phả Dòng Họ Lê Văn',
  clannName: 'LÊ VĂN',
  subtitle: 'Lưu giữ cội nguồn qua nhiều thế hệ',
  founded: '1927',
  village: 'Xã Thăng Bình, Thành phố Đà Nẵng',
  totalGenerations: 5,
}

export const ROUTES = {
  HOME: '/',
  TREE: '/gia-pha',
  TIMELINE: '/lich-su',
  CALENDAR: '/nghi-le',
  ACTIVITIES: '/hoat-dong',
  GALLERY: '/hinh-anh',
  TEMPLE: '/nha-tho-ho',
  ARCHIVES: '/luu-tru',
  MAP: '/ban-do',
  STATISTICS: '/thong-ke',
}

export const NAV_ITEMS = [
  { label: 'Tổng quan', path: '/', icon: 'home' },
  { label: 'Gia phả', path: '/gia-pha', icon: 'tree' },
  { label: 'Lịch sử', path: '/lich-su', icon: 'scroll' },
  { label: 'Nghi lễ', path: '/nghi-le', icon: 'calendar' },
  { label: 'Hoạt động', path: '/hoat-dong', icon: 'activity' },
  { label: 'Hình ảnh', path: '/hinh-anh', icon: 'gallery' },
  { label: 'Nhà thờ họ', path: '/nha-tho-ho', icon: 'temple' },
  { label: 'Bản đồ', path: '/ban-do', icon: 'map' },
  { label: 'Thống kê', path: '/thong-ke', icon: 'chart' },
]

export const PRIMARY_NAV_PATHS = [ROUTES.HOME, ROUTES.TREE, ROUTES.TIMELINE, ROUTES.CALENDAR]

export const EXPLORE_NAV_ORDER = [ROUTES.GALLERY, ROUTES.TEMPLE, ROUTES.MAP, ROUTES.STATISTICS, ROUTES.ACTIVITIES]

export const EXPLORE_SUMMARIES = {
  [ROUTES.GALLERY]: 'Tư liệu, ký ức và ảnh gia đình',
  [ROUTES.TEMPLE]: 'Nhà thờ họ và gia huấn dòng tộc',
  [ROUTES.MAP]: 'Quê quán, di cư và dấu mốc',
  [ROUTES.STATISTICS]: 'Chỉ số thế hệ và phân nhánh',
  [ROUTES.ACTIVITIES]: 'Trò chơi và câu hỏi gia tộc',
}

export const PRIMARY_NAV_ITEMS = PRIMARY_NAV_PATHS
  .map((path) => NAV_ITEMS.find((item) => item.path === path))
  .filter(Boolean)

export const EXPLORE_NAV_ITEMS = EXPLORE_NAV_ORDER
  .map((path) => NAV_ITEMS.find((item) => item.path === path))
  .filter(Boolean)
  .map((item) => ({
    ...item,
    summary: EXPLORE_SUMMARIES[item.path],
  }))

export const GENERATION_LABELS = {
  1: 'Thủy tổ',
  2: 'Nhị thế',
  3: 'Tam thế',
  4: 'Tứ thế',
  5: 'Ngũ thế',
}

export const ROLE_LABELS = {
  patriarch: 'Trưởng tộc',
  matriarch: 'Trưởng họ nữ tộc',
  elder: 'Bậc trưởng thượng',
  merit: 'Người có công',
  member: 'Thành viên',
  child: 'Con cháu',
}

export const ROLE_COLORS = {
  patriarch: '#C9A84C',
  matriarch: '#D6B98C',
  elder: '#8C6A43',
  merit: '#C0392B',
  member: '#6B8CAE',
  child: '#4A7C6F',
}

export const BRANCH_LABELS = {
  main: 'Nhánh chính',
  north: 'Chi bắc',
  south: 'Chi nam',
  central: 'Chi trung',
}

export const EVENT_TYPES = {
  birth: { label: 'Sinh', color: '#4A7C6F', icon: '✦' },
  death: { label: 'Mất', color: '#6B5040', icon: '✧' },
  marriage: { label: 'Kết hôn', color: '#C9A84C', icon: '♡' },
  migration: { label: 'Di cư', color: '#6B8CAE', icon: '→' },
  war: { label: 'Chiến tranh', color: '#C0392B', icon: '⚔' },
  achievement: { label: 'Thành tựu', color: '#D6B98C', icon: '★' },
  foundation: { label: 'Lập nghiệp', color: '#8C6A43', icon: '⌂' },
  temple: { label: 'Xây từ đường', color: '#C9A84C', icon: '⛩' },
  tradition: { label: 'Gia huấn', color: '#4A7C6F', icon: '📜' },
  reunion: { label: 'Họp mặt', color: '#D6B98C', icon: '👥' },
}

export const RITUAL_TYPES = {
  ancestor_anniversary: { label: 'Giỗ tổ', color: '#C9A84C' },
  personal_anniversary: { label: 'Giỗ cá nhân', color: '#8C6A43' },
  grave_visit: { label: 'Chạp mả', color: '#6B8CAE' },
  traditional: { label: 'Lễ truyền thống', color: '#4A7C6F' },
  full_moon: { label: 'Rằm', color: '#D6B98C' },
  new_month: { label: 'Mùng 1', color: '#D6B98C' },
  birthday: { label: 'Sinh nhật', color: '#C9A84C' },
  wedding: { label: 'Cưới hỏi', color: '#C0392B' },
  reunion: { label: 'Họp mặt', color: '#4A7C6F' },
  tet: { label: 'Tết cổ truyền', color: '#C9A84C' },
}

export const TREE_LAYOUTS = {
  TOP_DOWN: 'topDown',
  HORIZONTAL: 'horizontal',
  FORCE: 'force',
  CIRCULAR: 'circular',
  BLOODLINE: 'bloodline',
  ANCESTOR: 'ancestor',
}