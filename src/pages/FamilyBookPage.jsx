import React from 'react'
import { HiBookOpen } from 'react-icons/hi'
import PageShell, { PageShellAction } from '@/components/common/PageShell'
import FamilyBook from '@/features/family-book/FamilyBook'
import { ROUTES } from '@/constants'
import { useMembersStore } from '@/stores/membersStore'
import { getMemberSummary } from '@/utils'

const FamilyBookPage = () => {
  const members = useMembersStore((s) => s.members)
  const { total, generationCount } = getMemberSummary(members)

  return (
    <PageShell
      badge="Gia phả số"
      title="Sách gia phả"
      // description="Lần giở từng trang cuốn gia phả số — từ bìa sách qua từng thế hệ, đọc hồ sơ từng thành viên như đọc sách thật. Dùng nút mũi tên hoặc phím ← → để lật trang."
      stats={[
        // { label: 'Thành viên', value: total, detail: 'được ghi nhận trong sách' },
        // { label: 'Thế hệ', value: generationCount, detail: 'từ thủy tổ tới hậu duệ' },
      ]}
      action={<PageShellAction to={ROUTES.TREE}>Xem cây gia phả</PageShellAction>}
    >
      <FamilyBook />
    </PageShell>
  )
}

export default FamilyBookPage