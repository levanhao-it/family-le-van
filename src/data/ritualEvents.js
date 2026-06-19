// ============================================================
// RITUAL EVENTS DATA — Nghi lễ & Giỗ chạp dòng họ
// ============================================================

export const ritualEvents = [
  // ==================== GIỖ TỔ ====================
  {
    id: 're-001',
    type: 'ancestor_anniversary',
    title: 'Giỗ Tổ Thủy tổ Nguyễn Phúc Thành',
    lunarDate: { day: 20, month: 7 },
    solarDate: null, // Computed from lunar
    recurrence: 'yearly',
    relatedMembers: ['g1-001'],
    location: 'Nhà thờ họ Lê Văn, Thăng Bình, Quảng Nam',
    ritualNotes:
      'Toàn bộ con cháu tập trung tại nhà thờ họ. Lễ cúng được tiến hành lúc 8:00 sáng. Dâng cỗ tam sinh (lợn, gà, vịt) và hương đèn. Đọc bài vị và gia phả.',
    preparation: [
      'Cỗ tam sinh (lợn quay, gà, vịt)',
      'Xôi gấc đỏ',
      'Bánh chưng, bánh giày',
      'Hương đèn, vàng mã',
      'Hoa cúc vàng, hoa huệ',
      'Rượu cúng',
      'Trái cây 5 loại',
    ],
    images: [],
    importance: 5,
  },
  {
    id: 're-002',
    type: 'ancestor_anniversary',
    title: 'Giỗ cụ bà Thủy tổ Trần Thị Lan',
    lunarDate: { day: 15, month: 2 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: ['g1-002'],
    location: 'Nhà thờ họ Lê Văn, Thăng Bình',
    ritualNotes: 'Cúng bái trong gia đình, do chi trưởng chủ lễ.',
    preparation: ['Cỗ mặn', 'Hương đèn', 'Hoa tươi', 'Vàng mã'],
    images: [],
    importance: 4,
  },

  // ==================== CHẠP MẢ ====================
  {
    id: 're-003',
    type: 'grave_visit',
    title: 'Chạp mả tháng Chạp',
    lunarDate: { day: 25, month: 11 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: ['g1-001', 'g1-002', 'g2-001', 'g2-002'],
    location: 'Nghĩa địa dòng họ, Thăng Bình',
    ritualNotes:
      'Tập trung dọn dẹp mộ tổ tiên, sơn sửa bia mộ. Thắp hương, cúng bái tại mỗi phần mộ. Họp mặt ăn cỗ sau lễ.',
    preparation: [
      'Cỗ cúng mỗi phần mộ',
      'Dụng cụ dọn dẹp',
      'Sơn, xi măng sửa mộ',
      'Hương đèn',
      'Hoa tươi',
    ],
    images: [],
    importance: 4,
  },

  // ==================== TẾT ====================
  {
    id: 're-004',
    type: 'tet',
    title: 'Tết Nguyên Đán — Cúng giao thừa',
    lunarDate: { day: 30, month: 12 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: [],
    location: 'Nhà thờ họ Lê Văn',
    ritualNotes:
      'Cúng giao thừa lúc 12 giờ đêm. Dâng hương tổ tiên, cầu nguyện cho năm mới an khang thịnh vượng. Con cháu quây quần.',
    preparation: [
      'Mâm ngũ quả',
      'Bánh chưng, dưa hành',
      'Hương đèn',
      'Rượu',
      'Giấy tiền vàng mã',
    ],
    images: [],
    importance: 5,
  },
  {
    id: 're-005',
    type: 'tet',
    title: 'Tết Nguyên Đán — Cúng Mùng 1',
    lunarDate: { day: 1, month: 1 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: [],
    location: 'Nhà thờ họ Lê Văn',
    ritualNotes: 'Lễ đầu năm. Con cháu lên mừng tuổi trưởng tộc và các bậc cao niên.',
    preparation: ['Mâm cúng', 'Trầu cau', 'Rượu', 'Hương đèn'],
    images: [],
    importance: 5,
  },

  // ==================== RẰM ====================
  {
    id: 're-006',
    type: 'full_moon',
    title: 'Rằm tháng Giêng — Lễ khai xuân dòng họ',
    lunarDate: { day: 15, month: 1 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: [],
    location: 'Nhà thờ họ Lê Văn',
    ritualNotes: 'Họp mặt đầu năm, phát học bổng cho con cháu hiếu học.',
    preparation: ['Cỗ chay', 'Hương đèn', 'Bằng khen học bổng'],
    images: [],
    importance: 4,
  },

  // ==================== GIỖ CÁ NHÂN ====================
  {
    id: 're-007',
    type: 'personal_anniversary',
    title: 'Giỗ Ông Nguyễn Phúc Minh',
    lunarDate: { day: 22, month: 10 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: ['g2-001', 'g2-004'],
    location: 'Thăng Bình, Quảng Nam',
    ritualNotes: 'Tổ chức tại nhà thờ chi trưởng.',
    preparation: ['Cỗ mặn 8 món', 'Hương đèn', 'Vàng mã'],
    images: [],
    importance: 3,
  },
  {
    id: 're-008',
    type: 'personal_anniversary',
    title: 'Giỗ Liệt sĩ Nguyễn Đức Tài',
    lunarDate: { day: 29, month: 3 },
    solarDate: '1975-04-29',
    recurrence: 'yearly',
    relatedMembers: ['g3-004', 'g3-010', 'g4-006'],
    location: 'Đà Nẵng',
    ritualNotes:
      'Cúng bái trang trọng, thắp hương bàn thờ liệt sĩ. Đọc lại thành tích chiến đấu của người anh hùng.',
    preparation: ['Cỗ mặn', 'Hoa tươi', 'Hương đèn', 'Di ảnh liệt sĩ'],
    images: [],
    importance: 4,
  },

  // ==================== SINH NHẬT ====================
  {
    id: 're-009',
    type: 'birthday',
    title: 'Sinh nhật Chú Phát — 100 tuổi',
    lunarDate: { day: 4, month: 6 },
    solarDate: '2026-07-04',
    recurrence: 'once',
    relatedMembers: ['g3-005', 'g3-011'],
    location: 'Đà Nẵng',
    ritualNotes: 'Lễ mừng thọ 100 tuổi của thành viên cao niên nhất còn sống. Đây là dịp đặc biệt hiếm có.',
    preparation: ['Bánh sinh nhật', 'Tiệc gia đình', 'Quà tặng từ con cháu'],
    images: [],
    importance: 5,
  },

  // ==================== HỌP MẶT ====================
  {
    id: 're-010',
    type: 'reunion',
    title: 'Đại hội họ Lê Văn thường niên',
    lunarDate: { day: 10, month: 8 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: [],
    location: 'Nhà thờ họ Lê Văn, Thăng Bình, Quảng Nam',
    ritualNotes:
      'Toàn thể con cháu tụ họp một năm một lần. Báo cáo tình hình dòng họ, tặng học bổng, giao lưu văn nghệ. Ăn cỗ chung.',
    preparation: [
      'Cỗ lớn 30 mâm',
      'Phông bạt, bàn ghế',
      'Hệ thống âm thanh',
      'Học bổng',
      'Album ảnh năm',
    ],
    images: [],
    importance: 5,
  },

  // ==================== LỄ TRUYỀN THỐNG ====================
  {
    id: 're-011',
    type: 'traditional',
    title: 'Lễ Trung Thu — Vui chơi cho thiếu nhi',
    lunarDate: { day: 15, month: 8 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: [],
    location: 'Sân Nhà thờ họ',
    ritualNotes: 'Tổ chức cho các cháu nhỏ trong dòng họ. Múa lân, phá cỗ, tặng quà.',
    preparation: ['Bánh trung thu', 'Lồng đèn', 'Tặng phẩm trẻ em', 'Đội múa lân'],
    images: [],
    importance: 3,
  },
  {
    id: 're-012',
    type: 'traditional',
    title: 'Lễ Đoan Ngọ — Giết sâu bọ',
    lunarDate: { day: 5, month: 5 },
    solarDate: null,
    recurrence: 'yearly',
    relatedMembers: [],
    location: 'Gia đình các chi',
    ritualNotes: 'Cúng lễ Đoan Ngọ tại từng nhà, ăn rượu nếp, chè kê, trái cây mùa hè.',
    preparation: ['Rượu nếp', 'Bánh ú tro', 'Trái cây mùa hè', 'Hương đèn'],
    images: [],
    importance: 2,
  },
]

// Get upcoming rituals (next 30 days, based on current date)
export const getUpcomingRituals = (daysAhead = 30) => {
  // Returns rituals sorted by next occurrence
  return [...ritualEvents].sort((a, b) => a.lunarDate.month - b.lunarDate.month)
}

// Get rituals by type
export const getRitualsByType = (type) => ritualEvents.filter((r) => r.type === type)

// Get high importance rituals
export const getMajorRituals = () => ritualEvents.filter((r) => r.importance >= 4)