import React from 'react'
import FamilyTimeline from '@/features/timeline/FamilyTimeline'
import PageShell from '@/components/common/PageShell'

const TimelinePage = () => (
  <PageShell
    badge="Lịch sử"
    title="Kho tư liệu lịch sử"
    description="Những mốc sự kiện quan trọng được ghi lại theo dòng thời gian — từ buổi khai hoang lập nghiệp đến những đổi thay qua các thế hệ của dòng họ Lê Văn."
  >
    <FamilyTimeline />
  </PageShell>
)

export default TimelinePage