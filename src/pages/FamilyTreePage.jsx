import React, { useState } from 'react'
import { clsx } from 'clsx'
import { useSearchParams } from 'react-router-dom'
import { HiOutlineCollection, HiOutlineUsers } from 'react-icons/hi'
import IconChip from '@/components/common/IconChip'
import FamilyTreeVisualization from '@/features/family-tree/FamilyTreeVisualization'
import AncestorChart from '@/features/family-tree/AncestorChart'
import PageShell, { PageShellAction } from '@/components/common/PageShell'
import { ROUTES } from '@/constants'
import { useMembersStore } from '@/stores/membersStore'
import { getMemberSummary } from '@/utils'

const VIEW_TABS = [
  { id: 'tree', icon: HiOutlineCollection, label: 'Cây gia phả', desc: 'Toàn bộ dòng họ' },
  { id: 'ancestor', icon: HiOutlineUsers, label: 'Bảng tổ tiên', desc: 'Tổ tiên một người' },
]

const DISPLAY_MODES = [
  { id: 'default', label: 'Mặc định', desc: 'Đầy đủ filter, compare và motion' },
  { id: 'elder', label: 'Tối giản', desc: 'Chữ lớn hơn, ít thao tác, phù hợp trình chiếu họp mặt, dành cho người lớn tuổi' },
]

const DISPLAY_MODE_QUERY_KEY = 'mode'
const ELDER_MODE_QUERY_VALUE = 'elder'

const getDisplayModeFromSearchParams = (searchParams) => (
  searchParams.get(DISPLAY_MODE_QUERY_KEY) === ELDER_MODE_QUERY_VALUE ? 'elder' : 'default'
)

const FamilyTreePage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('tree')
  const members = useMembersStore((s) => s.members)
  const { total, generationCount } = getMemberSummary(members)
  const branchCount = new Set(members.map((member) => member.branch).filter(Boolean)).size
  const displayMode = getDisplayModeFromSearchParams(searchParams)
  const activeView = VIEW_TABS.find((tab) => tab.id === viewMode) ?? VIEW_TABS[0]
  const activeDisplayMode = DISPLAY_MODES.find((mode) => mode.id === displayMode) ?? DISPLAY_MODES[0]
  const isPresentationMode = displayMode === 'elder'

  const updateDisplayMode = (nextMode) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)

      if (nextMode === 'elder') nextParams.set(DISPLAY_MODE_QUERY_KEY, ELDER_MODE_QUERY_VALUE)
      else nextParams.delete(DISPLAY_MODE_QUERY_KEY)

      return nextParams
    }, { replace: true })
  }

  const handlePresentationToggle = () => {
    if (!isPresentationMode) setViewMode('tree')
    updateDisplayMode(isPresentationMode ? 'default' : 'elder')
  }

  return (
    <PageShell
      badge="Gia phả"
      title="Cây gia phả"
      description="Đi từ sơ đồ tổng thể tới bảng tổ tiên để lần theo từng nhánh, đối chiếu quan hệ và giữ nhịp quan sát xuyên suốt trên toàn gia tộc."
      stats={[
        { label: 'Thành viên', value: total, detail: 'đang có trên hồ sơ số' },
        { label: 'Thế hệ', value: generationCount, detail: 'từ thủy tổ tới hậu duệ' },
        { label: 'Chi / nhánh', value: branchCount, detail: 'được kết nối trong cây' },
        {
          label: 'Chế độ',
          value: viewMode === 'tree' ? activeDisplayMode.label : activeView.label,
          detail: viewMode === 'tree' ? activeDisplayMode.desc : activeView.desc,
        },
      ]}
      action={<PageShellAction to={ROUTES.STATISTICS}>Xem thống kê gia tộc</PageShellAction>}
      toolbar={(
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {VIEW_TABS.map((tab) => {
              const active = viewMode === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={clsx(
                    'group inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 font-body text-xs tracking-[0.14em] uppercase transition-all duration-200',
                    active
                      ? 'border-bronze/50 bg-bronze/10 text-bronze shadow-[0_16px_40px_rgba(0,0,0,0.14)]'
                      : 'border-ivory/10 text-muted hover:border-bronze/20 hover-text-secondary'
                  )}
                >
                  <IconChip
                    icon={tab.icon}
                    size="sm"
                    tone={active ? 'active' : 'muted'}
                    hoverable={!active}
                  />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="text-[10px] normal-case tracking-normal text-bronze/70">
                      {tab.desc}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {viewMode === 'tree' && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-body text-[11px] uppercase tracking-[0.22em] text-bronze/70">
                Hiển thị cây
              </span>
              {DISPLAY_MODES.map((mode) => {
                const active = displayMode === mode.id

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => updateDisplayMode(mode.id)}
                    className={clsx(
                      'rounded-full border px-4 py-2.5 font-body text-sm transition-all duration-200',
                      active
                        ? 'border-bronze/50 bg-bronze/12 text-primary shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
                        : 'border-ivory/10 text-secondary hover:border-bronze/20 hover:text-primary'
                    )}
                  >
                    {mode.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    >
      {viewMode === 'tree' ? <FamilyTreeVisualization displayMode={displayMode} /> : <AncestorChart />}
    </PageShell>
  )
}

export default FamilyTreePage