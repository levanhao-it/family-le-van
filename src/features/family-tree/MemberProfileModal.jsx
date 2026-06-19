import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiCalendar, HiLocationMarker, HiBriefcase, HiPencil } from 'react-icons/hi'
import { useAppStore } from '@/stores/appStore'
import { ROLE_LABELS, ROLE_COLORS, GENERATION_LABELS } from '@/constants'
import { useMembersStore } from '@/stores/membersStore'
import MemberFormModal from '@/features/admin/MemberFormModal'

// Individual profile tab content
const OverviewTab = ({ member }) => (
  <div className="space-y-6">
    <p className="font-body text-sm leading-relaxed" style={{ color: '#334155' }}>{member.biography}</p>

    {member.achievements?.length > 0 && (
      <div>
        <h4 className="font-display text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#64748B' }}>
          Thành tựu & Đóng góp
        </h4>
        <ul className="space-y-2">
          {member.achievements.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-xs mt-1 flex-shrink-0" style={{ color: '#94A3B8' }}>✦</span>
              <span className="font-body text-sm" style={{ color: '#475569' }}>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

const FamilyTab = ({ member, liveMembers }) => {
  const { setSelectedMember, setZoomToMemberId } = useAppStore()
  const membersById = React.useMemo(
    () => Object.fromEntries(liveMembers.map((liveMember) => [liveMember.id, liveMember])),
    [liveMembers],
  )
  const getLiveMemberById = (id) => membersById[id] ?? null
  const father = member.fatherId ? getLiveMemberById(member.fatherId) : null
  const mother = member.motherId ? getLiveMemberById(member.motherId) : null
  const spouses = member.spouseIds?.map((id) => getLiveMemberById(id)).filter(Boolean) || []
  const children = member.childrenIds?.map((id) => getLiveMemberById(id)).filter(Boolean) || []

  const handleFlyTo = (m) => {
    setSelectedMember(m)
    setZoomToMemberId(m.id)
  }

  const FamilyRow = ({ label, members }) =>
    members.length > 0 ? (
      <div className="mb-4">
        <p className="text-xs tracking-[0.2em] uppercase font-body mb-2" style={{ color: '#94A3B8' }}>{label}</p>
        <div className="flex flex-wrap gap-2">
          {members.filter(Boolean).map((m) => (
            <button
              key={m.id}
              onClick={() => handleFlyTo(m)}
              title="Nhảy đến node trên cây"
              className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
              style={{
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E0F2FE'
                e.currentTarget.style.borderColor = '#38BDF8'
                e.currentTarget.style.color = '#0369A1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F1F5F9'
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.color = '#334155'
              }}
            >
              {m.fullName}
              <span style={{ fontSize: 9, opacity: 0.6 }}>↗</span>
            </button>
          ))}
        </div>
      </div>
    ) : null

  return (
    <div className="space-y-2">
      <FamilyRow label="Cha" members={father ? [father] : []} />
      <FamilyRow label="Mẹ" members={mother ? [mother] : []} />
      <FamilyRow label="Vợ / Chồng" members={spouses} />
      <FamilyRow label="Con cái" members={children} />
      <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 12 }}>↗ Click tên để bay đến vị trí trên cây</p>
    </div>
  )
}

const MemberProfileModal = () => {
  const { selectedMember, clearSelectedMember } = useAppStore()
  const { isAdminUnlocked, isModified, members: liveMembers } = useMembersStore()
  const [activeTab, setActiveTab] = React.useState('overview')
  const [showEdit, setShowEdit] = React.useState(false)
  React.useEffect(() => {
    if (!selectedMember) return undefined

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (showEdit) {
        setShowEdit(false)
        return
      }
      clearSelectedMember()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedMember, clearSelectedMember, showEdit])

  if (!selectedMember) return null

  // Use live data from membersStore so edits (incl. avatar) are immediately reflected
  const member = liveMembers.find((m) => m.id === selectedMember.id) ?? selectedMember
  // Map roles to the new color scheme
  const roleColorMap = {
    patriarch: '#F97316',
    matriarch: '#F472B6',
    elder: '#3B82F6',
    merit: '#EF4444',
    member: '#64748B',
    child: '#4ADE80',
  }
  const roleColor = roleColorMap[member.role] || '#64748B'


  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'family', label: 'Gia đình' },
  ]


  return (
    <AnimatePresence>
      {selectedMember && (
        <>
          {!showEdit && (
            <motion.div
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="pointer-events-none fixed inset-y-3 left-3 right-3 z-50 flex justify-end"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(270deg, rgba(15,23,42,0.28) 0%, rgba(15,23,42,0.1) 26%, rgba(15,23,42,0) 58%)',
                }}
              />
              <div
                className="pointer-events-auto relative flex h-full w-full max-w-[28rem] flex-col overflow-hidden rounded-[28px] border border-white/10"
                style={{
                  background: '#FFFFFF',
                  border: `2px solid ${roleColor}`,
                  boxShadow: `0 28px 70px rgba(0,0,0,0.32), 0 0 0 4px ${roleColor}18`,
                }}
              >
                {/* Glow top accent */}
                <div
                  className="absolute top-0 left-8 right-8 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${roleColor}60, transparent)` }}
                />

                <div
                  className="absolute inset-y-0 left-0 w-px"
                  style={{ background: `linear-gradient(180deg, transparent, ${roleColor}60, transparent)` }}
                />

                {/* Header */}
                <div className="flex-shrink-0 px-6 pb-4 pt-5" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: '#94A3B8' }}>
                        Side sheet hồ sơ
                      </p>
                      <p className="mt-1 font-body text-xs leading-relaxed" style={{ color: '#64748B' }}>
                        Canvas vẫn mở để bạn tiếp tục rê và chọn node khác.
                      </p>
                    </div>
                    <button
                      onClick={clearSelectedMember}
                      aria-label="Đóng"
                      className="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ borderColor: '#E2E8F0', color: '#475569', background: '#F8FAFC' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = roleColor; e.currentTarget.style.color = roleColor }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                    >
                      Thu sheet
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-14 h-14 rounded-full flex-shrink-0"
                      style={{
                        background: member.avatar ? 'transparent' : `radial-gradient(circle, ${roleColor}25, ${roleColor}05)`,
                        border: `1px solid ${roleColor}40`,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.fullName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <span className="font-display text-xl" style={{ color: roleColor }}>
                          {member.fullName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading text-lg font-bold leading-tight mb-0.5" style={{ color: '#0F172A' }}>
                        {member.fullName}
                      </h2>
                      {member.nickname && (
                        <p className="text-xs font-body mb-2" style={{ color: '#64748B' }}>{member.nickname}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded"
                          style={{ background: '#F1F5F9', color: '#475569' }}
                        >
                          {GENERATION_LABELS[member.generation] || `Thế hệ ${member.generation}`}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded"
                          style={{ background: `${roleColor}18`, color: roleColor, border: `1px solid ${roleColor}50` }}
                        >
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded"
                          style={{
                            background: member.isAlive ? '#DCFCE7' : '#F1F5F9',
                            color: member.isAlive ? '#16A34A' : '#94A3B8',
                          }}
                        >
                          {member.isAlive ? 'Đang sống' : 'Đã mất'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {isAdminUnlocked && (
                        <button
                          onClick={() => setShowEdit(true)}
                          title="Chỉnh sửa thành viên"
                          style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
                        >
                          <HiPencil size={13} />
                          Sửa
                          {isModified(member.id) && <span style={{ width: 6, height: 6, background: '#FCD34D', borderRadius: '50%', display: 'inline-block' }} />}
                        </button>
                      )}
                      <button
                        onClick={clearSelectedMember}
                        aria-label="Đóng"
                        className="p-1.5 rounded-full transition-colors"
                        style={{ color: '#94A3B8', background: '#F1F5F9' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#94A3B8' }}
                      >
                        <HiX size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Quick info row */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {member.birthDate && (
                      <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: '#475569' }}>
                        <HiCalendar size={12} style={{ color: roleColor }} />
                        <span>
                          {member.birthDate.split('-')[0]}
                          {member.deathDate ? ` — ${member.deathDate.split('-')[0]}` : ''}
                        </span>
                      </div>
                    )}
                    {member.occupation && (
                      <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: '#475569' }}>
                        <HiBriefcase size={12} style={{ color: roleColor }} />
                        <span>{member.occupation.split(',')[0].trim()}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: '#475569' }}>
                        <HiLocationMarker size={12} style={{ color: roleColor }} />
                        <span>{member.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex-shrink-0 flex px-6" style={{ borderBottom: '1px solid #E2E8F0', background: 'linear-gradient(180deg, rgba(248,250,252,0.95), rgba(255,255,255,0.9))' }}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="py-3 px-4 text-xs tracking-wider uppercase font-body transition-colors duration-200 border-b-2 -mb-px"
                      style={{
                        color: activeTab === tab.id ? roleColor : '#94A3B8',
                        borderColor: activeTab === tab.id ? roleColor : 'transparent',
                        fontWeight: activeTab === tab.id ? 700 : 400,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === 'overview' && <OverviewTab member={member} />}
                      {activeTab === 'family' && <FamilyTab member={member} liveMembers={liveMembers} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit form (drawer) */}
          <MemberFormModal
            isOpen={showEdit}
            onClose={() => setShowEdit(false)}
            editMember={member}
            layout="sheet"
          />
        </>
      )}
    </AnimatePresence>
  )
}

export default MemberProfileModal