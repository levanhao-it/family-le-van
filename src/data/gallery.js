// ============================================================
// FAMILY GALLERY DATA
// ============================================================

import { buildArchiveRecord } from '@/utils/archive'

const rawGalleryImages = [
  // ==================== NHÓM: NHÀ THỜ HỌ ====================
  {
    id: 'gal-001',
    title: 'Nhà thờ họ Lê Văn — Toàn cảnh',
    description: 'Nhà thờ họ Lê Văn nhìn từ bên ngoài sau lần đại trùng tu năm 2010.',
    category: 'temple',
    categoryLabel: 'Nhà thờ họ',
    year: 2010,
    photographer: 'Nguyễn Thanh Phú',
    location: 'Thăng Bình, Quảng Nam',
    relatedMembers: ['g4-001', 'g4-002'],
    tags: ['nhà thờ họ', 'kiến trúc', '2010'],
    url: null, // Placeholder
    thumbnail: null,
    isFeature: true,
  },
  {
    id: 'gal-002',
    title: 'Bàn thờ tổ tiên',
    description: 'Bàn thờ chính trong nhà thờ họ với bài vị các đời thủy tổ.',
    category: 'temple',
    categoryLabel: 'Nhà thờ họ',
    year: 2010,
    photographer: 'Nguyễn Thanh Phú',
    location: 'Thăng Bình, Quảng Nam',
    relatedMembers: [],
    tags: ['bàn thờ', 'bài vị', 'tâm linh'],
    url: null,
    thumbnail: null,
    isFeature: false,
  },
  {
    id: 'gal-003',
    title: 'Bia đá khắc Gia huấn dòng họ',
    description: 'Bia đá 10 điều Gia huấn được khắc năm 2010, đặt trang trọng trong nhà thờ họ.',
    category: 'temple',
    categoryLabel: 'Nhà thờ họ',
    year: 2010,
    photographer: 'Nguyễn Đức Minh',
    location: 'Thăng Bình, Quảng Nam',
    relatedMembers: ['g2-001'],
    tags: ['gia huấn', 'bia đá', 'di sản'],
    url: null,
    thumbnail: null,
    isFeature: false,
  },

  // ==================== NHÓM: HỌP MẶT ====================
  {
    id: 'gal-004',
    title: 'Tết 2022 (Nhâm Dần) — Họp mặt đầu năm',
    description: 'Bức ảnh ghi lại khoảnh khắc đoàn tụ đầu năm Nhâm Dần 2022, khi con cháu từ nhiều nơi trở về nhà nội thực hiện nghi lễ đầu năm.',
    category: 'reunion',
    categoryLabel: 'Họp mặt',
    year: 2022,
    photographer: 'Lê Văn Hào',
    location: 'Khu Phố Phước Lộc, Phường Phước Long, Tỉnh Đồng Nai',
    relatedMembers: ['g3-001', 'g3-002', 'g3-005', 'g4-001'],
    tags: ['họp mặt', '2022', 'đoàn tụ', 'lịch sử'],
    url: 'https://scontent.fsgn1-1.fna.fbcdn.net/v/t39.30808-6/474996508_1162189702169709_7545325244813267124_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x960&ctp=s1280x960&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHulVoL2g6_xjNf37Inu4YZ-cjHlab4tsv5yMeVpvi2y0PstZiKC9vyUQ7vclxmKs-6ljpqFIiB2ZzPjdDfao9i&_nc_ohc=Oi0FJe3XdR4Q7kNvwHeg0-e&_nc_oc=AdoADDacPeARXZhBegA3z70xQC5ksoRrHRZy34YJQvTbPOWQE4wSMyZSWAkOyuxopgc&_nc_zt=23&_nc_ht=scontent.fsgn1-1.fna&_nc_gid=d9hSNjeH9NBnUDBuS46qyw&_nc_ss=7b2a8&oh=00_Af_eCc-jvE4CzWtqIkO4YYjVM2qMGd2-HoWBrONt451DLA&oe=6A4576A5',
    thumbnail: null,
    isFeature: true,
  },
  {
    id: 'gal-005',
    title: 'Đại hội họ 2010 — Sau trùng tu',
    description: 'Đại hội mừng hoàn thành đại trùng tu nhà thờ họ. Ảnh chụp cả gia tộc trước nhà thờ.',
    category: 'reunion',
    categoryLabel: 'Họp mặt',
    year: 2010,
    photographer: 'Nguyễn Thanh Phú',
    location: 'Thăng Bình, Quảng Nam',
    relatedMembers: ['g4-001', 'g4-002', 'g4-003', 'g4-007'],
    tags: ['họp mặt', '2010', 'trùng tu', 'đại hội'],
    url: null,
    thumbnail: null,
    isFeature: true,
  },
  {
    id: 'gal-006',
    title: 'Chiều cuối năm — Chuẩn bị chạp mả',
    description: 'Con cháu tụ họp chuẩn bị nghi lễ Chạp mả cuối năm. Khoảnh khắc đời thường ấm áp.',
    category: 'ritual',
    categoryLabel: 'Nghi lễ',
    year: 2020,
    photographer: 'Nguyễn Đức Minh',
    location: 'Nghĩa địa dòng họ, Thăng Bình',
    relatedMembers: [],
    tags: ['chạp mả', 'cuối năm', 'nghi lễ'],
    url: null,
    thumbnail: null,
    isFeature: false,
  },

  // ==================== NHÓM: CHÂN DUNG ====================
  {
    id: 'gal-007',
    title: 'Chân dung cụ bà Nguyễn Phúc Minh',
    description: 'Ảnh cụ bà chụp năm 1950, khi cụ khoảng 70 tuổi. Ảnh gốc đen trắng hiếm có của dòng họ.',
    category: 'portrait',
    categoryLabel: 'Chân dung',
    year: 1950,
    photographer: 'Không rõ',
    location: 'Thăng Bình, Quảng Nam',
    relatedMembers: ['g2-001', 'g2-004'],
    tags: ['chân dung', 'ảnh cổ', 'thế hệ 2'],
    url: null,
    thumbnail: null,
    isFeature: false,
  },
  {
    id: 'gal-008',
    title: 'Bác sĩ Nguyễn Phúc Thanh',
    description: 'Ảnh bác sĩ Thanh trong phòng mổ bệnh viện Quảng Nam, chụp năm 1965.',
    category: 'portrait',
    categoryLabel: 'Chân dung',
    year: 1965,
    photographer: 'Không rõ',
    location: 'Bệnh viện Quảng Nam',
    relatedMembers: ['g3-002'],
    tags: ['chân dung', 'bác sĩ', 'thế hệ 3'],
    url: null,
    thumbnail: null,
    isFeature: false,
  },
  {
    id: 'gal-009',
    title: 'Liệt sĩ Nguyễn Đức Tài',
    description: 'Ảnh quân nhân Nguyễn Đức Tài trong quân phục chiến đấu, chụp trước khi ra trận năm 1974.',
    category: 'portrait',
    categoryLabel: 'Chân dung',
    year: 1974,
    photographer: 'Không rõ',
    location: 'Đà Nẵng',
    relatedMembers: ['g3-004'],
    tags: ['chân dung', 'liệt sĩ', 'quân nhân'],
    url: null,
    thumbnail: null,
    isFeature: true,
  },

  // ==================== NHÓM: LÀNG QUÊ ====================
  {
    id: 'gal-010',
    title: 'Làng Thăng Bình — Quê hương dòng họ',
    description: 'Toàn cảnh làng Thăng Bình nhìn từ đồi nhìn xuống, với những mảnh ruộng bậc thang xanh mướt.',
    category: 'heritage',
    categoryLabel: 'Di sản',
    year: 2015,
    photographer: 'Nguyễn Thanh Phú',
    location: 'Thăng Bình, Quảng Nam',
    relatedMembers: [],
    tags: ['làng quê', 'Thăng Bình', 'di sản', 'thiên nhiên'],
    url: null,
    thumbnail: null,
    isFeature: true,
  },
  {
    id: 'gal-011',
    title: 'Cây đa 130 năm tuổi',
    description: 'Cây đa cổ thụ do thủy tổ trồng vẫn đứng vững sau 130 năm. Biểu tượng trường tồn của dòng họ.',
    category: 'heritage',
    categoryLabel: 'Di sản',
    year: 2020,
    photographer: 'Nguyễn Đức Linh',
    location: 'Sân Nhà thờ họ, Thăng Bình',
    relatedMembers: ['g1-001'],
    tags: ['cây đa', 'di sản', 'thiên nhiên', 'lịch sử'],
    url: null,
    thumbnail: null,
    isFeature: false,
  },

  // ==================== NHÓM: TÀI LIỆU CỔ ====================
  {
    id: 'gal-012',
    title: 'Bản Gia huấn viết tay gốc năm 1930',
    description: 'Bản gốc Gia huấn viết tay bằng chữ Nôm của ông Nguyễn Phúc Minh, còn lưu giữ tại nhà thờ họ.',
    category: 'archive',
    categoryLabel: 'Lưu trữ',
    year: 1930,
    photographer: 'Nguyễn Đức Minh',
    location: 'Nhà thờ họ',
    relatedMembers: ['g2-001'],
    tags: ['tài liệu', 'gia huấn', 'chữ Nôm', 'cổ vật'],
    url: null,
    thumbnail: null,
    isFeature: false,
  },
]

const galleryArchiveMeta = {
  'gal-001': {
    timeLabel: 'Thang 11/2010, sau le dai trung tu nha tho ho',
    sourceRefs: [
      { label: 'Bo anh dai trung tu 2010', holder: 'Nguyen Thanh Phu' },
      { label: 'Ky yeu Dai hoi ho 2010', holder: 'Ban lien lac dong ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Da doi chieu voi chuong trinh dai hoi ho 2010 va anh toan doan chup cung dot trung tu.',
    },
  },
  'gal-002': {
    relatedMembers: ['g1-001', 'g1-002', 'g2-001'],
    timeLabel: 'Dot ghi hinh noi that nha tho ho, thang 11/2010',
    sourceRefs: [
      { label: 'Anh noi that nha tho ho', holder: 'Nguyen Thanh Phu' },
      { label: 'Danh muc bai vi to tien', holder: 'Ban nghien te nha tho ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Thong tin duoc doi chieu voi so bai vi va anh chup cong trinh sau trung tu.',
    },
  },
  'gal-003': {
    timeLabel: 'Ngay khac bia va dat bia tai nha tho ho, nam 2010',
    sourceRefs: [
      { label: 'Anh truoc le khanh thanh bia gia huan', holder: 'Nguyen Duc Minh' },
      { label: 'Ban chep Gia huan 10 dieu', holder: 'Tu lieu nha tho ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Noi dung bia da doi chieu truc tiep voi ban sao Gia huan viet tay luu tai nha tho ho.',
    },
  },
  'gal-004': {
    timeLabel: 'Tết 2022 (Nhâm Dần) — Họp mặt đầu năm',
    sourceRefs: [
      { label: '', holder: 'Lê Văn Hào' },
    ],
    verification: {
      status: 'partial',
      note: '',
    },
  },
  'gal-005': {
    timeLabel: 'Le mung hoan thanh trung tu, thang 11/2010',
    sourceRefs: [
      { label: 'Bo anh chup toan gia toc truoc nha tho ho', holder: 'Nguyen Thanh Phu' },
      { label: 'Danh sach dong gop trung tu 2010', holder: 'Ban van dong dong ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Co the doi chieu ngay su kien voi bien ban dai hoi ho va bo anh cung buoi le.',
    },
  },
  'gal-006': {
    relatedMembers: ['g4-001', 'g4-002', 'g4-003'],
    timeLabel: 'Chieu 27 thang Chap nam Canh Ty, truoc le chap ma 2020',
    sourceRefs: [
      { label: 'Anh dien thoai nghi le chap ma', holder: 'Nguyen Duc Minh' },
      { label: 'Lich nghiep vu chap ma cuoi nam', holder: 'Ban nghi le dong ho' },
    ],
    verification: {
      status: 'partial',
      note: 'Nguoi trong anh da xac dinh duoc nhom chuan bi nghi le, nhung ten tung thanh vien van dang bo sung.',
    },
  },
  'gal-007': {
    timeLabel: 'Khoang nam 1950, anh den trang goc',
    sourceRefs: [
      { label: 'Anh chan dung giay kho nho', holder: 'Tu trang gia dinh chi truong' },
      { label: 'Loi ke cua hau due truc he', holder: 'Chi Nguyen Phuc Minh' },
    ],
    verification: {
      status: 'oral',
      note: 'Tuoi va nam chup duoc uoc tinh theo loi ke gia dinh va trang phuc trong anh, chua co but tich ghi sau mat anh.',
    },
  },
  'gal-008': {
    timeLabel: 'Khoang nam 1965, trong dot cong tac tai Benh vien Quang Nam',
    sourceRefs: [
      { label: 'Anh phong mo benh vien', holder: 'Nguyen Phuc Thanh luu giu' },
      { label: 'Ho so thanh tich nghe nghiep', holder: 'Gia dinh Nguyen Phuc Thanh' },
    ],
    verification: {
      status: 'partial',
      note: 'Boi canh nghe nghiep da doi chieu voi ho so gia dinh; thoi diem chup con duoc xac dinh o muc khoang nam.',
    },
  },
  'gal-009': {
    timeLabel: 'Truoc ngay len duong nam 1974',
    sourceRefs: [
      { label: 'Anh quan phuc truoc khi ra tran', holder: 'Gia dinh liet si Nguyen Duc Tai' },
      { label: 'Bang ghi ten liet si tai huyen Phu Ninh', holder: 'Nghia trang liet si dia phuong' },
    ],
    verification: {
      status: 'verified',
      note: 'Da doi chieu lai nhan vat, nam chup va boi canh qua gia dinh va bang ghi danh liet si dia phuong.',
    },
  },
  'gal-010': {
    relatedMembers: ['g1-001', 'g1-002'],
    timeLabel: 'Mua lua xanh nam 2015, ghi hinh khong gian que goc',
    sourceRefs: [
      { label: 'Bo anh canh quan lang Phu Ninh', holder: 'Nguyen Thanh Phu' },
      { label: 'Ban do dia chi nhanh ho tai que goc', holder: 'Ban tu lieu dong ho' },
    ],
    verification: {
      status: 'verified',
      note: 'Dia danh va boi canh da doi chieu voi ban do dia phuong va cac dot khao sat di san 2015.',
    },
  },
  'gal-011': {
    timeLabel: 'Dot khao sat di san thang 3/2020',
    sourceRefs: [
      { label: 'Anh hien trang cay da co thu', holder: 'Nguyen Duc Linh' },
      { label: 'So ghi chep cong duc nha tho ho', holder: 'Ban quan ly nha tho ho' },
    ],
    verification: {
      status: 'oral',
      note: 'Nien dai 130 nam dua tren ky uc dong toc va moc trung tu nha tho ho, can them doi chieu tu lieu dia phuong.',
    },
  },
  'gal-012': {
    timeLabel: 'Ban goc viet tay nam 1930, duoc so hoa lai nam 2025',
    sourceRefs: [
      { label: 'Ban scan tai lieu Gia huan viet tay', holder: 'Tu lieu nha tho ho' },
      { label: 'So dang ky tu lieu so hoa 2025', holder: 'Ban du an gia pha dien tu' },
    ],
    verification: {
      status: 'verified',
      note: 'Da doi chieu voi ban goc viet tay va ban chep lai trong dot so hoa tai lieu 2025.',
    },
  },
}

export const galleryImages = rawGalleryImages.map((image) => {
  const meta = galleryArchiveMeta[image.id] ?? {}
  const archive = buildArchiveRecord({
    relatedMembers: meta.relatedMembers ?? image.relatedMembers ?? [],
    location: meta.location ?? image.location,
    locationNote: meta.locationNote,
    timeLabel: meta.timeLabel ?? (image.year ? `Khoang nam ${image.year}` : 'Chua xac dinh thoi diem'),
    sourceRefs: meta.sourceRefs ?? [],
    verification: meta.verification,
    documents: meta.documents,
    images: meta.images,
  })

  return {
    ...image,
    ...meta,
    relatedMembers: archive.people,
    location: archive.location.label,
    sourceRefs: archive.sources,
    verification: archive.verification,
    timeLabel: archive.timeframe.label,
    archive,
  }
})

// Categories
export const galleryCategories = [
  { id: 'all', label: 'Tất cả', count: galleryImages.length },
  { id: 'temple', label: 'Nhà thờ họ', count: galleryImages.filter((g) => g.category === 'temple').length },
  { id: 'reunion', label: 'Họp mặt', count: galleryImages.filter((g) => g.category === 'reunion').length },
  { id: 'ritual', label: 'Nghi lễ', count: galleryImages.filter((g) => g.category === 'ritual').length },
  { id: 'portrait', label: 'Chân dung', count: galleryImages.filter((g) => g.category === 'portrait').length },
  { id: 'heritage', label: 'Di sản', count: galleryImages.filter((g) => g.category === 'heritage').length },
  { id: 'archive', label: 'Lưu trữ', count: galleryImages.filter((g) => g.category === 'archive').length },
]

// Feature images
export const getFeaturedImages = () => galleryImages.filter((g) => g.isFeature)

// Get by category
export const getImagesByCategory = (cat) =>
  cat === 'all' ? galleryImages : galleryImages.filter((g) => g.category === cat)