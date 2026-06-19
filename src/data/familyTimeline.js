// ============================================================
// FAMILY TIMELINE DATA — Historical events of the clan
// ============================================================

import { buildArchiveRecord } from '@/utils/archive'

const rawFamilyTimeline = [
  {
    id: 'tl-001',
    type: 'foundation',
    title: 'Khai khẩn đất tại Thăng Bình',
    subtitle: 'Khởi dựng dòng họ',
    date: '1850-01-01',
    lunarDate: 'Năm Canh Tuất, tháng Giêng',
    era: 'Thời Tự Đức',
    location: 'Làng Thăng Bình, Quảng Nam',
    description:
      'Cụ Nguyễn Phúc Thành rời quê hương cũ ở Huế, dẫn theo gia quyến vào khai khẩn vùng đất hoang tại Thăng Bình, Quảng Nam. Với đôi bàn tay và ý chí sắt đá, cụ đã biến vùng đất hoang vu thành những thửa ruộng màu mỡ.',
    relatedMembers: ['g1-001', 'g1-002'],
    images: [],
    documents: [],
    quotes: ['Đất đai là máu thịt, là cội rễ của dòng họ — Cụ Nguyễn Phúc Thành'],
    tags: ['khai hoang', 'lập làng', 'thủy tổ', 'Quảng Nam'],
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
      'Sau 40 năm gây dựng cơ nghiệp, cụ Nguyễn Phúc Thành đã tích lũy đủ để xây dựng nhà thờ họ đầu tiên. Ngôi nhà thờ được làm bằng gỗ quý, mang kiến trúc truyền thống Việt Nam với mái ngói đỏ và cột gỗ chạm trổ tinh xảo.',
    relatedMembers: ['g1-001', 'g1-002'],
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
    title: 'Nguyễn Phúc Minh chào đời',
    subtitle: 'Trưởng nam thế hệ thứ hai',
    date: '1880-04-05',
    lunarDate: 'Năm Canh Thìn, tháng Ba',
    era: 'Thời Tự Đức',
    location: 'Thăng Bình, Quảng Nam',
    description:
      'Người con trai trưởng của thủy tổ chào đời, mang theo hi vọng về một thế hệ kế thừa mạnh mẽ. Theo tục lệ, ông được đặt tên Minh — ánh sáng — để mong con cháu luôn sáng suốt.',
    relatedMembers: ['g2-001', 'g1-001', 'g1-002'],
    images: [],
    documents: [],
    quotes: [],
    tags: ['sinh', 'thế hệ 2'],
    importance: 3,
  },
  {
    id: 'tl-004',
    type: 'achievement',
    title: 'Ông Hai Đức tham gia kháng chiến',
    subtitle: 'Hào khí dòng tộc',
    date: '1945-08-20',
    lunarDate: 'Tháng 7, Ất Dậu',
    era: 'Kháng chiến chống Pháp',
    location: 'Quảng Nam',
    description:
      'Nguyễn Phúc Đức, người con thứ của thủy tổ, đã lên đường theo lời kêu gọi kháng chiến của Chủ tịch Hồ Chí Minh. Ông để lại gia đình, ruộng đất, dấn thân vào con đường đấu tranh cho độc lập dân tộc.',
    relatedMembers: ['g2-002'],
    images: [],
    documents: [],
    quotes: ['Nợ nước non chưa trả, không thể an lòng — Nguyễn Phúc Đức, 1945'],
    tags: ['kháng chiến', 'chống Pháp', 'yêu nước', 'chiến tranh'],
    importance: 4,
  },
  {
    id: 'tl-005',
    type: 'achievement',
    title: 'Nguyễn Phúc Thanh tốt nghiệp Y khoa',
    subtitle: 'Bác sĩ đầu tiên của dòng họ',
    date: '1945-06-01',
    lunarDate: 'Tháng 5, Ất Dậu',
    era: 'Kháng chiến chống Pháp',
    location: 'Sài Gòn',
    description:
      'Nguyễn Phúc Thanh trở thành bác sĩ đầu tiên của dòng họ Lê Văn tại Thăng Bình. Tốt nghiệp trường Y Sài Gòn giữa thời loạn lạc, ông ngay lập tức trở về phục vụ quê hương.',
    relatedMembers: ['g3-002'],
    images: [],
    documents: [],
    quotes: [],
    tags: ['giáo dục', 'y khoa', 'thành tựu', 'thế hệ 3'],
    importance: 4,
  },
  {
    id: 'tl-006',
    type: 'war',
    title: 'Liệt sĩ Nguyễn Đức Tài hy sinh',
    subtitle: 'Tuổi 27 dâng hiến cho Tổ quốc',
    date: '1975-04-29',
    lunarDate: 'Tháng 4, Ất Mão',
    era: 'Kháng chiến chống Mỹ',
    location: 'Tây Ninh',
    description:
      'Chiến sĩ Nguyễn Đức Tài đã anh dũng hy sinh trong trận đánh cuối cùng trước ngày thống nhất. Tên ông được khắc lên bia liệt sĩ huyện Thăng Bình, là niềm tự hào và nỗi đau không nguôi của dòng họ.',
    relatedMembers: ['g3-004', 'g3-010'],
    images: [],
    documents: [],
    quotes: [
      'Anh ra đi để chúng tôi được sống trong hòa bình — Lời mẹ liệt sĩ Hoàng Thị Liên',
    ],
    tags: ['liệt sĩ', 'chiến tranh', 'hy sinh', 'thống nhất'],
    importance: 5,
  },
  {
    id: 'tl-007',
    type: 'tradition',
    title: 'Thiết lập Gia huấn dòng họ',
    subtitle: 'Bộ quy tắc đạo đức gia tộc',
    date: '1930-01-15',
    lunarDate: 'Tháng Chạp, Kỷ Tị',
    era: 'Thời Bảo Đại',
    location: 'Nhà thờ họ, Thăng Bình',
    description:
      'Ông Nguyễn Phúc Minh (thế hệ 2) soạn thảo và công bố bộ Gia huấn gồm 10 điều, là kim chỉ nam cho mọi thành viên dòng họ về đạo đức, học vấn, và trách nhiệm với gia tộc.',
    relatedMembers: ['g2-001'],
    images: [],
    documents: ['Bản gia huấn gốc viết tay còn lưu giữ tại nhà thờ họ'],
    quotes: [
      'Hiếu kính cha mẹ, kính trọng tổ tiên, yêu thương anh em — Điều thứ nhất trong Gia huấn họ Lê Văn',
    ],
    tags: ['gia huấn', 'gia quy', 'truyền thống', 'đạo đức'],
    importance: 5,
  },
  {
    id: 'tl-008',
    type: 'reunion',
    title: 'Đại hội dòng họ lần đầu tiên',
    subtitle: 'Gặp mặt ba chi — Ba miền đoàn tụ',
    date: '1985-02-10',
    lunarDate: 'Mùng 1 Tết, Ất Sửu',
    era: 'Thời kỳ đổi mới',
    location: 'Nhà thờ họ, Thăng Bình',
    description:
      'Sau 10 năm thống nhất đất nước, lần đầu tiên toàn bộ các chi trong dòng họ Lê Văn từ ba miền Bắc-Trung-Nam tập hợp về nhà thờ họ. Hơn 100 người cùng về thắp hương tổ tiên, đánh dấu giai đoạn đoàn tụ sau nhiều năm ly tán.',
    relatedMembers: ['g3-001', 'g3-002', 'g3-004', 'g3-005', 'g4-001'],
    images: [],
    documents: [],
    quotes: ['Máu chảy ruột mềm — dù ở nơi đâu vẫn là con cháu một nhà'],
    tags: ['họp mặt', 'đoàn tụ', 'gia tộc', 'đổi mới'],
    importance: 4,
  },
  {
    id: 'tl-009',
    type: 'temple',
    title: 'Trùng tu Nhà thờ họ lần thứ nhất',
    subtitle: 'Nâng cấp di sản sau 100 năm',
    date: '1990-06-20',
    lunarDate: 'Tháng 5, Canh Ngọ',
    era: 'Thời kỳ đổi mới',
    location: 'Thăng Bình, Quảng Nam',
    description:
      'Nhà thờ họ được trùng tu toàn diện lần đầu sau 100 năm xây dựng. Giữ nguyên kiến trúc truyền thống nhưng gia cố nền móng, thay lại mái ngói, và thêm hệ thống chiếu sáng.',
    relatedMembers: ['g4-001', 'g4-002'],
    images: [],
    documents: [],
    quotes: [],
    tags: ['trùng tu', 'nhà thờ họ', 'bảo tồn'],
    importance: 4,
  },
  {
    id: 'tl-010',
    type: 'achievement',
    title: 'Xây dựng Quỹ học bổng dòng họ',
    subtitle: 'Đầu tư cho thế hệ tương lai',
    date: '2005-09-01',
    lunarDate: 'Tháng 8, Ất Dậu',
    era: 'Thời kỳ hiện đại',
    location: 'TP. Hồ Chí Minh',
    description:
      'Trưởng tộc Nguyễn Phúc Khải thành lập Quỹ học bổng dòng họ Lê Văn với mục đích hỗ trợ con cháu hiếu học. Đây là quỹ đầu tiên và lớn nhất trong các dòng họ tại huyện Thăng Bình.',
    relatedMembers: ['g4-001'],
    images: [],
    documents: [],
    quotes: ['Học vấn là di sản không ai cướp được — Trưởng tộc Nguyễn Phúc Khải'],
    tags: ['học bổng', 'giáo dục', 'phát triển', 'thế hệ 4'],
    importance: 4,
  },
  {
    id: 'tl-011',
    type: 'temple',
    title: 'Đại trùng tu Nhà thờ họ — Công trình thế kỷ',
    subtitle: 'Tái thiết kiến trúc gia tộc',
    date: '2010-11-15',
    lunarDate: 'Tháng 10, Canh Dần',
    era: 'Thời kỳ hiện đại',
    location: 'Thăng Bình, Quảng Nam',
    description:
      'Cuộc đại trùng tu quy mô nhất trong lịch sử dòng họ. Nhà thờ được xây dựng lại hoàn toàn trên nền cũ với kiến trúc truyền thống Việt Nam được nâng tầm, sử dụng vật liệu cao cấp. Kinh phí do con cháu khắp nơi đóng góp.',
    relatedMembers: ['g4-001', 'g4-002', 'g4-003', 'g4-007'],
    images: [],
    documents: [],
    quotes: [
      'Nhà thờ họ là tâm điểm của dòng tộc, là nơi hồn thiêng tổ tiên hội tụ — Lời khắc đá nhà thờ họ 2010',
    ],
    tags: ['nhà thờ họ', 'trùng tu', 'kiến trúc', 'di sản'],
    importance: 5,
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
      'Dòng họ Lê Văn tại Thăng Bình chính thức ra mắt nền tảng website gia phả số hóa đầu tiên. Hệ thống lưu trữ toàn bộ lịch sử, hình ảnh, nghi lễ và ký ức của dòng họ qua hơn 170 năm.',
    relatedMembers: ['g4-001', 'g4-007'],
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
      { label: 'Gia pha truyen khau chi truong', holder: 'Ban truong toc' },
      { label: 'Ghi chep khai canh dat Phu Ninh', holder: 'So tay dong toc' },
    ],
    verification: {
      status: 'oral',
      note: 'Moc 1850 hien duoc suy dinh tu tu lieu truyen khau va ghi chu khai canh, chua co dia ba goc de xac nhan ngay cu the.',
    },
  },
  'tl-002': {
    documents: ['Ban ghi chep cong duc xay nha tho ho dau tien'],
    sourceRefs: [
      { label: 'Van te nha tho ho', holder: 'Tu lieu nghi le dong ho' },
      { label: 'Loi khac tren bai vi to tien', holder: 'Nha tho ho Nguyen' },
    ],
    verification: {
      status: 'partial',
      note: 'Nam xay dung da duoc dong thuan trong noi bo dong toc, nhung chua tim thay ban moc cong duc goc con nguyen ven.',
    },
  },
  'tl-003': {
    documents: ['Muc ghi ten truong nam the he thu hai trong so gia pha'],
    sourceRefs: [
      { label: 'So gia pha viet tay doi thu hai', holder: 'Ban tu lieu gia toc' },
      { label: 'Loi ke nhanh truong', holder: 'Hau due truc he' },
    ],
    verification: {
      status: 'partial',
      note: 'Ngay thang hien dung theo so gia pha noi bo; chua co giay khai sinh lich su de doi chieu cheo.',
    },
  },
  'tl-004': {
    documents: ['Ghi chep ky niem chien khu cua chi nhanh Nguyen Phuc Duc'],
    sourceRefs: [
      { label: 'Hoi ky gia dinh ve khang chien 1945', holder: 'Chi Nguyen Phuc Duc' },
      { label: 'Danh muc nhan vat khang chien dia phuong', holder: 'Tu lieu Quang Nam' },
    ],
    verification: {
      status: 'partial',
      note: 'Su kien da co doi chieu qua hoi ky gia dinh va tai lieu dia phuong, can them mot moc luu tru cong khai de xac dinh ngay len duong.',
    },
  },
  'tl-005': {
    documents: ['Ban sao bang tot nghiep Y khoa Sai Gon'],
    sourceRefs: [
      { label: 'Ho so hoc tap Nguyen Phuc Thanh', holder: 'Gia dinh Nguyen Phuc Thanh' },
      { label: 'So ghi cong tac tai que nha', holder: 'Ban lien lac dong ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Hoc vi va thoi diem tot nghiep da doi chieu voi ban sao bang cap va ho so nghe nghiep gia dinh luu giu.',
    },
  },
  'tl-006': {
    documents: ['Ban sao bang To quoc ghi cong', 'Anh bia liet si huyen Phu Ninh'],
    sourceRefs: [
      { label: 'Ho so liet si Nguyen Duc Tai', holder: 'Gia dinh liet si' },
      { label: 'Bia ghi danh liet si huyen Phu Ninh', holder: 'Nghia trang liet si dia phuong' },
    ],
    verification: {
      status: 'verified',
      note: 'Thong tin nhan vat, dia diem va nien diem da doi chieu voi bang To quoc ghi cong va bia liet si dia phuong.',
    },
  },
  'tl-007': {
    sourceRefs: [
      { label: 'Ban goc Gia huan viet tay', holder: 'Nha tho ho Nguyen' },
      { label: 'Ban chep lai khi so hoa nam 2025', holder: 'Du an Gia pha dien tu' },
    ],
    verification: {
      status: 'verified',
      note: 'Noi dung su kien da doi chieu truc tiep voi ban goc Gia huan va ban so hoa sau nay.',
    },
  },
  'tl-008': {
    documents: ['Danh sach tham du Dai hoi dong ho 1985'],
    sourceRefs: [
      { label: 'So hop toc nam 1985', holder: 'Ban truong toc' },
      { label: 'Anh chup dai hoi doan tu 1985', holder: 'Tu lieu chi Sy' },
    ],
    verification: {
      status: 'partial',
      note: 'Moc su kien va boi canh doan tu da ro, nhung danh tinh day du cac nhan vat trong anh va trong danh sach van dang duoc bo sung.',
    },
  },
  'tl-009': {
    documents: ['Bien ban trung tu nha tho ho 1990'],
    sourceRefs: [
      { label: 'So cong duc dot trung tu 1990', holder: 'Ban quan ly nha tho ho' },
      { label: 'Ky yeu trung tu lan thu nhat', holder: 'Ban lien lac dong ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Da co bien ban va so cong duc doi chieu, nen thong tin ve dot trung tu nam 1990 co do tin cay cao.',
    },
  },
  'tl-010': {
    documents: ['Quyet dinh thanh lap Quy hoc bong dong ho'],
    sourceRefs: [
      { label: 'Ho so quy hoc bong 2005', holder: 'Nguyen Phuc Khai' },
      { label: 'Thong bao van dong con chau hieu hoc', holder: 'Ban lien lac dong ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Co tai lieu thanh lap va thong bao van dong, do do su kien co co so doi chieu ro rang.',
    },
  },
  'tl-011': {
    documents: ['Bien ban khanh thanh dai trung tu 2010', 'Danh sach dong gop cong duc 2010'],
    sourceRefs: [
      { label: 'Bo anh dai trung tu nha tho ho', holder: 'Nguyen Thanh Phu' },
      { label: 'Ky yeu dai hoi ho 2010', holder: 'Ban van dong trung tu' },
    ],
    verification: {
      status: 'verified',
      note: 'Nguon anh, bien ban va danh sach dong gop cho phep doi chieu cheo tot giua hinh anh, nhan vat va mốc su kien.',
    },
  },
  'tl-012': {
    documents: ['Bo dac ta san pham website gia pha dien tu'],
    sourceRefs: [
      { label: 'Ho so du an so hoa gia pha', holder: 'Nhom thuc hien 2025' },
      { label: 'Ban demo cong bo noi bo', holder: 'Ban lien lac dong ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Su kien duong dai nen co the doi chieu truc tiep voi ho so du an, ma nguon va lich cong bo noi bo.',
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