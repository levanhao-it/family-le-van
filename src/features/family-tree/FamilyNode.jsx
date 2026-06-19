import React, { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'

// Check if member married into the family (no registered parents = in-law)
const checkIsInLaw = (member) =>
  !member.fatherId && !member.motherId && member.generation > 1

// Color theme per generation + gender + in-law status
// Each theme: bg=card background, border=border+accent color, text=main text, accent=bright accent
const getNodeTheme = (member) => {
  const { generation, gender, role } = member
  const inLaw = checkIsInLaw(member)

  if (role === 'patriarch')
    return { bg: '#6B1A00', border: '#F97316', text: '#FFF0D0', accent: '#FFC857' }
  if (role === 'matriarch')
    return { bg: '#6B0A3A', border: '#F472B6', text: '#FFE4F0', accent: '#FDA4C4' }

  if (generation === 2) {
    if (inLaw)
      return { bg: '#0C3347', border: '#38BDF8', text: '#BAE6FD', accent: '#7DD3FC' }
    return gender === 'female'
      ? { bg: '#35085A', border: '#A855F7', text: '#EDE9FE', accent: '#C084FC' }
      : { bg: '#0A2347', border: '#3B82F6', text: '#DBEAFE', accent: '#93C5FD' }
  }

  if (generation === 3) {
    if (inLaw)
      return gender === 'male'
        ? { bg: '#0A2640', border: '#60A5FA', text: '#BFDBFE', accent: '#93C5FD' }
        : { bg: '#28084A', border: '#C084FC', text: '#EDE9FE', accent: '#DDD6FE' }
    return gender === 'female'
      ? { bg: '#420A28', border: '#F472B6', text: '#FCE7F3', accent: '#FBCFE8' }
      : { bg: '#08361A', border: '#4ADE80', text: '#DCFCE7', accent: '#86EFAC' }
  }

  if (generation === 4) {
    if (inLaw)
      return { bg: '#1A2535', border: '#64748B', text: '#CBD5E1', accent: '#94A3B8' }
    return gender === 'female'
      ? { bg: '#2A1032', border: '#E879F9', text: '#FAE8FF', accent: '#F0ABFC' }
      : { bg: '#0C1E34', border: '#22D3EE', text: '#CFFAFE', accent: '#67E8F9' }
  }

  // Gen 5+
  if (inLaw)
    return { bg: '#1A1A2A', border: '#94A3B8', text: '#E2E8F0', accent: '#CBD5E1' }
  return gender === 'female'
    ? { bg: '#1A0A22', border: '#FCD34D', text: '#FEF9C3', accent: '#FDE68A' }
    : { bg: '#0A101A', border: '#FCD34D', text: '#FEF9C3', accent: '#FDE68A' }
}

const getTypeLabel = (member) => {
  const { gender, role } = member
  if (role === 'patriarch') return 'Thủy tổ'
  if (role === 'matriarch') return 'Tổ mẫu'
  if (role === 'elder') return gender === 'male' ? 'Con trai' : 'Con gái'
  if (checkIsInLaw(member)) return gender === 'male' ? 'Chồng / Rể' : 'Vợ / Dâu'
  return gender === 'male' ? 'Con trai' : 'Con gái'
}

// ── Tooltip: single info row ─────────────────────────────────
const InfoRow = ({ icon, label, suffix }) => {
  if (!label) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <span style={{
        color: '#CBD5E1', fontSize: 11, lineHeight: '15px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
      }}>
        {label}
      </span>
      {suffix}
    </div>
  )
}

// ── Hover tooltip card ───────────────────────────────────────
const NodeTooltip = ({ member, avatar, theme, typeLabel, reducedMotion = false }) => {
  const bioSnippet = member.biography && member.biography.length > 90
    ? member.biography.slice(0, 90) + '…'
    : member.biography

  const yearLabel = member.birthDate?.split('-')[0]
    ? member.deathDate
      ? `${member.birthDate.split('-')[0]} — ${member.deathDate.split('-')[0]}`
      : `Sinh năm ${member.birthDate.split('-')[0]}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8, scale: reducedMotion ? 1 : 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : 8, scale: reducedMotion ? 1 : 0.94 }}
      transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 12px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 234,
        borderRadius: 12,
        background: 'rgba(22, 32, 56, 0.98)',
        border: `1px solid ${theme.border}90`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px ${theme.border}30, inset 0 1px 0 rgba(255,255,255,0.06)`,
        backdropFilter: 'blur(24px)',
        padding: '12px 14px',
        pointerEvents: 'none',
      }}
    >
      {/* Arrow pointing down */}
      <div style={{
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -6,
        width: 12,
        height: 12,
        background: 'rgba(22, 32, 56, 0.98)',
        border: `1px solid ${theme.border}90`,
        borderTop: 'none',
        borderLeft: 'none',
        transform: 'rotate(45deg)',
        borderRadius: '0 0 3px 0',
      }} />

      {/* Header: avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: `${theme.border}25`,
          border: `2px solid ${theme.border}70`,
          flexShrink: 0, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.accent, fontSize: 18, fontWeight: 800,
        }}>
          {avatar
            ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : member.fullName.charAt(0)
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: '#FFFFFF', fontSize: 13, fontWeight: 700,
            margin: 0, lineHeight: '17px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {member.fullName}
          </p>
          {member.nickname && (
            <p style={{ color: '#94A3B8', fontSize: 11, margin: '2px 0 0', lineHeight: '14px' }}>
              {member.nickname}
            </p>
          )}
          <p style={{
            color: theme.accent, fontSize: 10, fontWeight: 600,
            margin: '4px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Đời {member.generation} · {typeLabel}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `${theme.border}30`, marginBottom: 8 }} />

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <InfoRow
          icon="🎂"
          label={yearLabel}
          suffix={
            member.isAlive
              ? <span style={{ color: '#4ADE80', fontSize: 9, fontWeight: 700, marginLeft: 4, whiteSpace: 'nowrap' }}>● Còn sống</span>
              : yearLabel && <span style={{ color: '#64748B', fontSize: 11, marginLeft: 4 }}>†</span>
          }
        />
        {member.occupation && <InfoRow icon="💼" label={member.occupation} />}
        {member.location && <InfoRow icon="📍" label={member.location} />}
      </div>

      {/* Bio snippet */}
      {bioSnippet && (
        <p style={{ color: '#94A3B8', fontSize: 10, lineHeight: '15px', marginTop: 9, marginBottom: 0 }}>
          {bioSnippet}
        </p>
      )}

      {/* Footer hint */}
      <div style={{ marginTop: 9, paddingTop: 7, borderTop: `1px solid ${theme.border}35`, textAlign: 'center' }}>
        <span style={{ color: '#64748B', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Click để xem hồ sơ đầy đủ
        </span>
      </div>
    </motion.div>
  )
}

// ── Right-click context menu ──────────────────────────────────────
const MENU_ITEMS = [
  { id: 'profile', icon: '👤', label: 'Xem hồ sơ', accent: '#38BDF8' },
  null,
  { id: 'ancestor', icon: '↑', label: 'Highlight tổ tiên', accent: '#FCD34D' },
  { id: 'descendant', icon: '↓', label: 'Highlight hậu duệ', accent: '#4ADE80' },
  null,
  { id: 'compare', icon: '⇄', label: 'So sánh quan hệ', accent: '#A855F7' },
  null,
  { id: 'copy', icon: '📋', label: 'Sao chép tên', accent: '#94A3B8' },
]

const NodeContextMenu = ({ x, y, member, onClose, reducedMotion = false }) => {
  const {
    setSelectedMember,
    compareMode, toggleCompareMode, cycleCompareMember,
    setHighlightedMemberId, setHighlightMode,
  } = useAppStore()
  const menuRef = useRef(null)

  // Close on Escape or outside click
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  const handleAction = (id) => {
    switch (id) {
      case 'profile':
        setSelectedMember(member)
        break
      case 'ancestor':
        setHighlightMode('ancestor')
        setHighlightedMemberId(member.id)
        break
      case 'descendant':
        setHighlightMode('descendant')
        setHighlightedMemberId(member.id)
        break
      case 'compare':
        if (!compareMode) toggleCompareMode()
        cycleCompareMember(member)
        break
      case 'copy':
        navigator.clipboard.writeText(member.fullName).catch(() => { })
        break
      default: break
    }
    onClose()
  }

  // Keep menu inside viewport
  const menuW = 208
  const menuH = 230
  const adjX = x + menuW > window.innerWidth ? x - menuW : x
  const adjY = y + menuH > window.innerHeight ? y - menuH : y

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92, y: reducedMotion ? 0 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.9, y: reducedMotion ? 0 : -4 }}
      transition={{ duration: reducedMotion ? 0 : 0.13, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: adjY,
        left: adjX,
        zIndex: 9999,
        width: menuW,
        borderRadius: 10,
        background: 'rgba(18, 26, 48, 0.98)',
        border: '1px solid rgba(148,163,184,0.25)',
        boxShadow: '0 20px 56px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        padding: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '7px 10px 6px',
        borderBottom: '1px solid rgba(148,163,184,0.12)',
        marginBottom: 3,
      }}>
        <p style={{ color: '#475569', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
          Thao tác nhanh
        </p>
        <p style={{
          color: '#E2E8F0', fontSize: 12, fontWeight: 700,
          margin: '3px 0 0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {member.fullName}
        </p>
      </div>

      {/* Menu items */}
      {MENU_ITEMS.map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: 'rgba(148,163,184,0.1)', margin: '3px 6px' }} />
        ) : (
          <button
            key={item.id}
            onClick={() => handleAction(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              width: '100%',
              padding: '7px 10px',
              borderRadius: 7,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${item.accent}18` }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 14, lineHeight: 1, width: 18, textAlign: 'center', flexShrink: 0 }}>
              {item.icon}
            </span>
            <span style={{ color: '#CBD5E1', fontSize: 12, fontWeight: 500, flex: 1 }}>
              {item.label}
            </span>
            {item.id === 'compare' && compareMode && (
              <span style={{
                color: '#A855F7', fontSize: 9, fontWeight: 800,
                background: 'rgba(168,85,247,0.15)',
                padding: '1px 5px', borderRadius: 4,
              }}>ON</span>
            )}
          </button>
        )
      )}
    </motion.div>
  )
}

const FamilyNode = memo(({ data, selected }) => {
  const {
    member,
    isDimmed = false,
    isOnPath = false,
    isHighlighted = false,
    isOnComparePath = false,
    compareSlot = 0,
    isElderMode = false,
  } = data
  const { setSelectedMember } = useAppStore()
  // Get live avatar from membersStore (may have been uploaded after initial load)
  const avatar = useMembersStore((s) => {
    const live = s.members.find((m) => m.id === member.id)
    return live?.avatar ?? member.avatar ?? null
  })

  const theme = getNodeTheme(member)
  const typeLabel = getTypeLabel(member)

  const [hovered, setHovered] = useState(false)
  const hoverTimer = useRef(null)
  const [ctxMenu, setCtxMenu] = useState({ visible: false, x: 0, y: 0 })
  const closeCtxMenu = useRef(() => setCtxMenu({ visible: false, x: 0, y: 0 }))

  const handleMouseEnter = () => {
    if (isDimmed || isElderMode) return
    hoverTimer.current = setTimeout(() => setHovered(true), 320)
  }
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current)
    setHovered(false)
  }

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => {
        if (isDimmed || isElderMode) return
        e.preventDefault()
        e.stopPropagation()
        clearTimeout(hoverTimer.current)
        setHovered(false)
        setCtxMenu({ visible: true, x: e.clientX, y: e.clientY })
      }}
    >
      <AnimatePresence>
        {ctxMenu.visible && (
          <NodeContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            member={member}
            onClose={closeCtxMenu.current}
            reducedMotion={isElderMode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && !isDimmed && (
          <NodeTooltip member={member} avatar={avatar} theme={theme} typeLabel={typeLabel} reducedMotion={isElderMode} />
        )}
      </AnimatePresence>

      <motion.div
        whileHover={isDimmed || isElderMode ? {} : { scale: 1.05, zIndex: 50 }}
        whileTap={isDimmed || isElderMode ? {} : { scale: 0.97 }}
        onClick={() => !isDimmed && setSelectedMember(member)}
        className="node-drag-handle select-none cursor-pointer"
        style={{
          width: 176,
          borderRadius: 9,
          background: theme.bg,
          border: compareSlot === 1
            ? '2.5px solid #A855F7'
            : compareSlot === 2
              ? '2.5px solid #38BDF8'
              : isOnComparePath
                ? '2.5px solid #A855F7'
                : isOnPath
                  ? '2.5px solid #FCD34D'
                  : isHighlighted
                    ? `2.5px solid ${theme.accent}`
                    : `2px solid ${theme.border}`,
          boxShadow: compareSlot === 1
            ? '0 0 0 3px rgba(168,85,247,0.55), 0 8px 32px rgba(168,85,247,0.25)'
            : compareSlot === 2
              ? '0 0 0 3px rgba(56,189,248,0.55), 0 8px 32px rgba(56,189,248,0.25)'
              : isOnComparePath
                ? '0 0 0 3px rgba(168,85,247,0.5), 0 8px 32px rgba(168,85,247,0.2)'
                : isHighlighted
                  ? `0 0 0 3px ${theme.accent}80, 0 8px 32px rgba(0,0,0,0.65)`
                  : isOnPath
                    ? '0 0 0 2px rgba(252,211,77,0.45), 0 6px 24px rgba(252,211,77,0.2)'
                    : selected
                      ? `0 0 0 2px ${theme.border}90, 0 4px 20px rgba(0,0,0,0.45)`
                      : '0 3px 14px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          position: 'relative',
          opacity: isDimmed ? 0.1 : 1,
          filter: compareSlot > 0 ? 'brightness(1.35)' : isOnComparePath ? 'brightness(1.3)' : isOnPath ? 'brightness(1.25)' : undefined,
          transition: 'opacity 0.3s ease, filter 0.2s ease, border-color 0.2s ease',
          pointerEvents: isDimmed ? 'none' : 'auto',
        }}
      >
        {/* Compare slot badge ①② */}
        {compareSlot > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -1,
              right: -1,
              zIndex: 10,
              width: 20,
              height: 20,
              borderRadius: '0 8px 0 8px',
              background: compareSlot === 1 ? '#A855F7' : '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: 0,
              boxShadow: compareSlot === 1 ? '0 2px 8px rgba(168,85,247,0.6)' : '0 2px 8px rgba(56,189,248,0.6)',
            }}
          >
            {compareSlot === 1 ? '①' : '②'}
          </div>
        )}
        {/* Colored header bar */}
        <div
          style={{
            background: `linear-gradient(90deg, ${theme.border}55, ${theme.border}18)`,
            padding: isElderMode ? '5px 9px' : '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.border}35`,
          }}
        >
          <span
            style={{
              color: theme.accent,
              fontSize: isElderMode ? 10 : 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Đời {member.generation} · {typeLabel}
          </span>
          {member.isAlive ? (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#4ADE80',
                display: 'inline-block',
                boxShadow: '0 0 5px #4ADE8099',
              }}
            />
          ) : (
            <span style={{ color: theme.text, fontSize: isElderMode ? 12 : 11, opacity: 0.55 }}>†</span>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: isElderMode ? '9px 10px 10px' : '7px 9px 8px' }}>
          {/* Avatar + Name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isElderMode ? 8 : 7, marginBottom: 5 }}>
            <div
              style={{
                width: isElderMode ? 32 : 28,
                height: isElderMode ? 32 : 28,
                borderRadius: '50%',
                background: `${theme.border}25`,
                border: `1.5px solid ${theme.border}70`,
                color: theme.accent,
                fontSize: isElderMode ? 13 : 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={member.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                member.fullName.charAt(0)
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  color: theme.text,
                  fontSize: isElderMode ? 12 : 11,
                  fontWeight: 700,
                  lineHeight: isElderMode ? '15px' : '14px',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {member.fullName}
              </p>
              {member.nickname && (
                <p
                  style={{
                    color: theme.text,
                    opacity: 0.6,
                    fontSize: isElderMode ? 11 : 10,
                    margin: 0,
                    lineHeight: isElderMode ? '14px' : '13px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {member.nickname}
                </p>
              )}
            </div>
          </div>

          {/* Birth / Death years */}
          {(member.birthDate || member.deathDate) && (
            <div
              style={{
                color: theme.text,
                opacity: 0.8,
                fontSize: isElderMode ? 11 : 10,
                background: `${theme.border}18`,
                border: `1px solid ${theme.border}28`,
                borderRadius: 4,
                padding: isElderMode ? '3px 7px' : '2px 6px',
                textAlign: 'center',
                marginTop: 2,
              }}
            >
              {member.birthDate?.split('-')[0] || '?'}
              {member.deathDate ? ` — ${member.deathDate.split('-')[0]}` : ''}
            </div>
          )}
        </div>

        {/* React Flow Handles */}
        <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />
        <Handle type="source" id="right" position={Position.Right} style={{ opacity: 0, width: 1, height: 1 }} />
        <Handle type="target" id="left" position={Position.Left} style={{ opacity: 0, width: 1, height: 1 }} />
      </motion.div>
    </div>
  )
})

FamilyNode.displayName = 'FamilyNode'
export default FamilyNode