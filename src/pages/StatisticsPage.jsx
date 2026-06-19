import React from 'react'
import FamilyStatistics from '@/features/statistics/FamilyStatistics'
import PageShell, { PageShellAction } from '@/components/common/PageShell'
import { ROUTES } from '@/constants'
import { useMembersStore } from '@/stores/membersStore'
import { getMemberSummary } from '@/utils'

const StatisticsPage = () => {
  const members = useMembersStore((s) => s.members)
  const { alive, total, generationCount } = getMemberSummary(members)
  const branchCount = new Set(members.map((member) => member.branch).filter(Boolean)).size

  return (
    <PageShell
      badge="Thống kê"
      title="Thống kê gia tộc"
      description="Đọc dòng họ như một bức chân dung dữ liệu: quy mô, thế hệ, nhánh phân tách và nhịp sống hiện tại được gom lại để đối chiếu nhanh trước khi đi sâu vào từng biểu đồ."
      stats={[
        { label: 'Thành viên', value: total, detail: 'đang có trên toàn bộ hồ sơ' },
        { label: 'Đang sống', value: alive, detail: 'thành viên còn hiện diện' },
        { label: 'Thế hệ', value: generationCount, detail: 'được thống kê xuyên suốt' },
        { label: 'Chi / nhánh', value: branchCount, detail: 'được tách thành cụm phân tích' },
      ]}
      action={<PageShellAction to={ROUTES.TREE}>Đối chiếu trên cây gia phả</PageShellAction>}
    >
      <FamilyStatistics />
    </PageShell>
  )
}

export default StatisticsPage