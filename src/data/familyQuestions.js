// ============================================================
// FAMILY QUESTIONS DATA — Cards for family events & quiz
// ============================================================

export const familyQuestions = [
  // ==================== FAMILY HISTORY ====================
  {
    id: 'fq-001',
    category: 'history',
    categoryLabel: 'Lịch sử dòng họ',
    question: 'Thủy tổ của dòng họ Lê Văn là ai và ông bà từ đâu đến Thăng Bình?',
    hint: 'Nhớ lại xuất xứ ban đầu của dòng họ',
    answer: 'Cụ Lê Tiệm và cụ bà Trần Thị Tư, chuyển từ Huế vào khai khẩn Thăng Bình năm 1850.',
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'fq-002',
    category: 'history',
    categoryLabel: 'Lịch sử dòng họ',
    question: 'Nhà thờ họ Lê Văn được xây dựng lần đầu vào năm nào?',
    hint: 'Sau 40 năm thủy tổ khai hoang',
    answer: 'Năm 1890, do cụ Lê Tiệm xây dựng bằng gỗ quý.',
    difficulty: 'easy',
    points: 10,
  },

  // ==================== MEMORY SHARING ====================
  {
    id: 'fq-006',
    category: 'memory',
    categoryLabel: 'Ký ức chia sẻ',
    question: 'Kỷ niệm đáng nhớ nhất của bạn về ngày họp mặt dòng họ là gì?',
    hint: 'Không có đáp án sai — hãy chia sẻ thật lòng',
    answer: null, // Open question
    difficulty: 'open',
    points: 0,
  },
  {
    id: 'fq-007',
    category: 'memory',
    categoryLabel: 'Ký ức chia sẻ',
    question: 'Bạn nhớ nhất điều gì về ông bà nội/ngoại của mình?',
    hint: 'Một câu chuyện, một kỷ vật, hay một lời dạy...',
    answer: null,
    difficulty: 'open',
    points: 0,
  },

  // ==================== TRADITION ====================
  {
    id: 'fq-009',
    category: 'tradition',
    categoryLabel: 'Phong tục truyền thống',
    question: 'Dòng họ Lê Văn tổ chức Giỗ Tổ vào ngày nào trong năm âm lịch?',
    hint: 'Tháng 7 âm lịch',
    answer: 'Ngày 20 tháng 7 âm lịch hàng năm.',
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'fq-010',
    category: 'tradition',
    categoryLabel: 'Phong tục truyền thống',
    question: 'Lễ Chạp mả được tổ chức vào thời điểm nào và mục đích là gì?',
    hint: 'Cuối năm âm lịch',
    answer: 'Ngày 25 tháng 11 âm lịch, mục đích: dọn dẹp, tu sửa mộ phần tổ tiên trước Tết Nguyên Đán.',
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'fq-011',
    category: 'tradition',
    categoryLabel: 'Phong tục truyền thống',
    question: 'Điều đặc biệt nào trong lễ Rằm tháng Giêng của dòng họ?',
    hint: 'Không chỉ là cúng bái...',
    answer: 'Họp mặt đầu năm và phát học bổng cho con cháu hiếu học.',
    difficulty: 'medium',
    points: 20,
  },

  // ==================== WISDOM ====================
  {
    id: 'fq-013',
    category: 'wisdom',
    categoryLabel: 'Trí tuệ gia tộc',
    question: 'Bạn sẽ truyền lại điều gì cho thế hệ sau trong dòng họ?',
    hint: 'Giá trị, bài học, hay nghề nghiệp...',
    answer: null,
  },
  {
    id: 'fq-014',
    category: 'wisdom',
    categoryLabel: 'Trí tuệ gia tộc',
    question: 'Bạn sẽ truyền lại điều gì cho thế hệ sau trong dòng họ?',
    hint: 'Giá trị, bài học, hay nghề nghiệp...',
    answer: null,
    difficulty: 'open',
    points: 0,
  },

  // ==================== FUN QUESTIONS ====================
  {
    id: 'fq-015',
    category: 'fun',
    categoryLabel: 'Vui vẻ',
    question: 'Nếu bạn có thể mời một nhân vật lịch sử của dòng họ Lê Văn tham dự buổi họp mặt, bạn sẽ chọn ai và tại sao?',
    hint: 'Hãy tưởng tượng sáng tạo!',
    answer: null,
    difficulty: 'open',
    points: 0,
  },


  // ==================== QUIZ ====================
  {
    id: 'fq-018',
    category: 'quiz',
    categoryLabel: 'Đố vui',
    question: 'Dòng họ Lê Văn tại Thăng Bình hiện có bao nhiêu thế hệ được ghi nhận?',
    options: ['2 thế hệ', '3 thế hệ', '4 thế hệ', '5 thế hệ'],
    answer: '4 thế hệ',
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'fq-019',
    category: 'quiz',
    categoryLabel: 'Đố vui',
    question: 'Nhà thờ họ Lê Văn được xây tại tỉnh nào?',
    options: ['Quảng Ngãi', 'Quảng Nam', 'Bình Định', 'Thừa Thiên Huế'],
    answer: 'Quảng Nam',
    difficulty: 'easy',
    points: 10,
  },
]

// Get questions by category
export const getQuestionsByCategory = (category) =>
  familyQuestions.filter((q) => q.category === category)

// Get random questions
export const getRandomQuestions = (n = 5) => {
  const shuffled = [...familyQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// Categories summary
export const questionCategories = [
  { id: 'history', label: 'Lịch sử dòng họ', icon: '📜', color: '#C9A84C' },
  { id: 'memory', label: 'Ký ức chia sẻ', icon: '💭', color: '#8C6A43' },
  { id: 'tradition', label: 'Phong tục', icon: '🏮', color: '#C0392B' },
  { id: 'wisdom', label: 'Trí tuệ gia tộc', icon: '⚡', color: '#D6B98C' },
  { id: 'fun', label: 'Vui vẻ', icon: '🎉', color: '#4A7C6F' },
  { id: 'quiz', label: 'Đố vui', icon: '❓', color: '#6B8CAE' },
]