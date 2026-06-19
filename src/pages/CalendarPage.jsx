import React from 'react'
import RitualCalendar from '@/features/calendar/RitualCalendar'
import PageShell, { PageShellAction } from '@/components/common/PageShell'
import { ROUTES } from '@/constants'
import { getMajorRituals, ritualEvents } from '@/data'

const CalendarPage = () => {
  const majorRitualCount = getMajorRituals().length
  const activeMonths = new Set(ritualEvents.map((event) => event.lunarDate?.month).filter(Boolean)).size
  const yearlyCount = ritualEvents.filter((event) => event.recurrence === 'yearly').length

  return (
    <PageShell
      badge="Nghi lễ"
      title="Lịch nghi lễ"
      description="Giỗ chạp, lễ truyền thống và các dịp hội tụ được gom vào một lịch quan sát thống nhất để cả dòng họ nhìn cùng một nhịp thời gian và chuẩn bị không bị rời rạc."
      stats={[
        { label: 'Nghi lễ', value: ritualEvents.length, detail: 'đang được theo dõi trong năm' },
        { label: 'Đại lễ', value: majorRitualCount, detail: 'mốc nghi lễ có độ ưu tiên cao' },
        { label: 'Tháng có sự kiện', value: activeMonths, detail: 'phủ trên chu kỳ âm lịch' },
        { label: 'Lặp hàng năm', value: yearlyCount, detail: 'nghi lễ giữ nhịp cố định mỗi năm' },
      ]}
      action={<PageShellAction to={ROUTES.TEMPLE}>Mở không gian thờ tự</PageShellAction>}
      contentClassName="section-container py-10"
    >
      <RitualCalendar />
    </PageShell>
  )
}

export default CalendarPage