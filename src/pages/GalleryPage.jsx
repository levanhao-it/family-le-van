import React from 'react'
import FamilyGallery from '@/features/gallery/FamilyGallery'
import PageShell, { PageShellAction } from '@/components/common/PageShell'
import { galleryImages } from '@/data'
import { ROUTES } from '@/constants'
import { summarizeArchiveCollection } from '@/utils/archive'

const GalleryPage = () => {
  const archiveSummary = summarizeArchiveCollection(galleryImages)

  return (
    <PageShell
      badge="Hình ảnh"
      title="Kho tư liệu hình ảnh"
      description="Kho ảnh được tổ chức như một lớp lưu trữ sống: mỗi khung hình giữ lại nhân vật, địa điểm, mốc thời gian và trạng thái kiểm chứng để tra cứu theo đúng ngữ cảnh gia tộc."
      stats={[
        { label: 'Tư liệu', value: archiveSummary.total, detail: 'ảnh và hồ sơ đang lưu' },
        { label: 'Hồ sơ hoàn chỉnh', value: archiveSummary.catalogedCount, detail: 'đã đủ người, nơi, thời điểm và nguồn' },
        { label: 'Đã kiểm chứng', value: archiveSummary.verifiedCount, detail: 'được đối chiếu qua tư liệu nguồn' },
        { label: 'Liên kết nhân vật', value: archiveSummary.peopleLinkedCount, detail: 'ảnh đã gắn ít nhất một thành viên' },
      ]}
      action={<PageShellAction to={ROUTES.TEMPLE}>Mở nhà thờ họ</PageShellAction>}
      contentClassName="section-container py-10"
    >
      <FamilyGallery />
    </PageShell>
  )
}

export default GalleryPage