// ============================================================
// FAMILY TIMELINE DATA — Historical events of the clan
// ============================================================

import { buildArchiveRecord } from '@/utils/archive'

const rawFamilyTimeline = [
  {
    id: 'tl-001',
    type: 'foundation',
    title: 'Khai khẩn đất tại Phước Long, Sông Bé cũ (nay là Phường Phước Long, TP. Đồng Nai)',
    subtitle: 'Di dân mở mang vùng đất hoang',
    date: '1945-01-01',
    lunarDate: 'Tháng Chạp, Giáp Thân',
    era: 'Thời kỳ kháng chiến chống Pháp',
    location: 'Phước Long, Sông Bé cũ (nay là Phường Phước Long, TP. Đồng Nai)',
    description:
      'Cụ Lê Tiệm rời quê hương Thăng Bình, Quảng Nam, dẫn theo gia quyến vào khai khẩn vùng đất hoang tại Phước Long, tỉnh Sông Bé cũ. Với đôi bàn tay và ý chí sắt đá, ông đã biến vùng đất hoang vu thành những thửa ruộng màu mỡ.',
    relatedMembers: ['g1-001', 'g1-002'],
    images: [],
    documents: [],
    quotes: ['Đất đai là máu thịt, là cội rễ của dòng họ — Cụ Lê Tiệm'],
    tags: ['khai hoang', 'lập làng', 'thủy tổ', 'Đồng Nai'],
    importance: 5,
  },
  {
    id: 'tl-002',
    type: 'temple',
    title: 'Xây dựng Nhà thờ họ đầu tiên',
    subtitle: 'Dấu mốc thiêng liêng',
    date: '1890-03-15',
    lunarDate: 'Năm Canh Dần, tháng Hai',
    era: 'Thời Thành Thái',
    location: 'Thăng Bình, Quảng Nam',
    description:
      'Các bậc tiền nhân đã xây dựng nhà thờ họ đầu tiên trên mảnh đất tổ tiên. Ngôi nhà thờ được làm bằng gỗ quý, mang kiến trúc truyền thống Việt Nam với mái ngói đỏ và cột gỗ chạm trổ tinh xảo.',
    relatedMembers: [],
    images: [],
    documents: [],
    quotes: [
      'Chốn linh thiêng là nơi hội tụ hồn thiêng dòng tộc — Lời khắc trên bài vị tổ tiên',
    ],
    tags: ['nhà thờ họ', 'kiến trúc', 'di sản'],
    importance: 5,
  },
  {
    id: 'tl-003',
    type: 'birth',
    title: 'Lê Văn Sỹ chào đời',
    subtitle: 'Trưởng nam thế hệ thứ hai',
    date: '1956-01-01',
    lunarDate: 'Tháng Chạp, Ất Mùi',
    era: 'Thời kỳ xây dựng hòa bình',
    location: 'Phước Long, Đồng Nai',
    description:
      'Người con trai trưởng của thủy tổ Lê Tiệm chào đời, mang theo niềm hy vọng kế thừa dòng họ. Theo gia phả, ông được đặt tên Sỹ.',
    relatedMembers: ['g2-001', 'g1-001', 'g1-002'],
    images: [],
    documents: [],
    quotes: [],
    tags: ['sinh', 'thế hệ 2', 'trưởng nam'],
    importance: 3,
  },
  {
    id: 'tl-004',
    type: 'birth',
    title: 'Lê Văn Nhứt chào đời',
    subtitle: 'Người con trai thứ hai',
    date: '1958-01-01',
    lunarDate: 'Tháng Chạp, Mậu Tuất',
    era: 'Thời kỳ xây dựng hòa bình',
    location: 'Phước Long, Đồng Nai',
    description:
      'Người con trai thứ hai của thủy tổ Lê Tiệm chào đời, tiếp tục nối dõi dòng họ. Theo gia phả, ông được đặt tên Nhứt.',
    relatedMembers: ['g2-002', 'g1-001', 'g1-002'],
    images: [],
    documents: [],
    quotes: [],
    tags: ['sinh', 'thế hệ 2', 'thứ nam'],
    importance: 3,
  },
  {
    id: 'tl-012',
    type: 'tradition',
    title: 'Ra mắt Website Gia phả Điện tử',
    subtitle: 'Số hóa di sản gia tộc',
    date: '2025-01-15',
    lunarDate: 'Tháng Chạp, Giáp Thìn',
    era: 'Kỷ nguyên số',
    location: 'Toàn cầu — Online',
    description:
      'Dòng họ Lê Văn tại Thăng Bình chính thức ra mắt nền tảng website gia phả số hóa đầu tiên. Hệ thống lưu trữ toàn bộ lịch sử, hình ảnh, nghi lễ và ký ức của dòng họ qua hơn 100 năm.',
    relatedMembers: ['g2-007'],
    images: [],
    documents: [],
    quotes: [
      'Cội nguồn không thể phai mờ — dù con cháu có đi đâu, dòng họ vẫn là ngôi nhà tinh thần',
    ],
    tags: ['công nghệ', 'số hóa', 'gia phả', 'hiện đại'],
    importance: 4,
  },
]

const timelineArchiveMeta = {
  'tl-001': {
    sourceRefs: [
      { label: 'Gia phả truyền khẩu chi trưởng', holder: 'Ban trưởng tộc' },
      { label: 'Ghi chép khai canh đất Phú Ninh', holder: 'Sổ tay dòng tộc' },
    ],
    verification: {
      status: 'oral',
      note: 'Mốc 1850 hiện được suy định từ tư liệu truyền khẩu và ghi chú khai canh, chưa có địa bạ gốc để xác nhận ngày cụ thể.',
    },
  },
  'tl-002': {
    documents: ['Bản ghi chép công đức xây nhà thờ họ đầu tiên'],
    sourceRefs: [
      { label: 'Văn tế nhà thờ họ', holder: 'Tư liệu nghi lễ dòng họ' },
      { label: 'Lời khắc trên bài vị tổ tiên', holder: 'Nhà thờ họ Nguyễn' },
    ],
    verification: {
      status: 'partial',
      note: 'Năm xây dựng đã được đồng thuận trong nội bộ dòng tộc, nhưng chưa tìm thấy bản mộc công đức gốc còn nguyên vẹn.',
    },
  },
  'tl-003': {
    documents: [],
    sourceRefs: [
      { label: 'Gia phả nội bộ dòng họ', holder: 'Ban trưởng tộc' },
      { label: 'Lời kể của thành viên gia đình', holder: 'Gia đình Lê Văn Sỹ' },
    ],
    verification: {
      status: 'oral',
      note: 'Ngày sinh được ghi nhận trong gia phả và được người thân xác nhận, chưa có giấy khai sinh gốc.',
    },
  },
  'tl-012': {
    documents: ['Bộ đặc tả sản phẩm website gia phả điện tử'],
    sourceRefs: [
      { label: 'Hồ sơ dự án số hóa gia phả', holder: 'Nhóm thực hiện 2025' },
      { label: 'Bản demo công bố nội bộ', holder: 'Ban liên lạc dòng họ' },
    ],
    verification: {
      status: 'verified',
      note: 'Sự kiện đương đại nên có thể đối chiếu trực tiếp với hồ sơ dự án, mã nguồn và lịch công bố nội bộ.',
    },
  },
}

export const familyTimeline = rawFamilyTimeline.map((event) => {
  const meta = timelineArchiveMeta[event.id] ?? {}
  const documents = [...new Set([...(event.documents ?? []), ...(meta.documents ?? [])])]
  const images = [...new Set([...(event.images ?? []), ...(meta.images ?? [])])]
  const archive = buildArchiveRecord({
    relatedMembers: meta.relatedMembers ?? event.relatedMembers ?? [],
    location: meta.location ?? event.location,
    locationNote: meta.locationNote,
    timeLabel: meta.timeLabel ?? [event.date, event.lunarDate].filter(Boolean).join(' · '),
    sourceRefs: meta.sourceRefs ?? [],
    verification: meta.verification,
    documents,
    images,
  })

  return {
    ...event,
    ...meta,
    relatedMembers: archive.people,
    location: archive.location.label,
    documents: archive.evidence.documents,
    images: archive.evidence.images,
    sourceRefs: archive.sources,
    verification: archive.verification,
    timeLabel: archive.timeframe.label,
    archive,
  }
})

// Get events by type
export const getEventsByType = (type) => familyTimeline.filter((e) => e.type === type)

// Get events by era
export const getEventsByEra = (era) => familyTimeline.filter((e) => e.era === era)

// Get events sorted by importance
export const getTopEvents = (n = 5) =>
  [...familyTimeline].sort((a, b) => b.importance - a.importance).slice(0, n)