import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSearch, HiX, HiUser } from 'react-icons/hi'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'
import MemberProfileModal from './MemberProfileModal'
import AdminToolbar from '@/features/admin/AdminToolbar'

// ── Layout constants ─────────────────────────────────────────
const CARD_W = 154
const CARD_H = 82
const LEAF_W = 184   // horizontal slot width (card + gap)
const V_STEP = 160   // vertical distance from row top to next row top
const MAX_DEPTH = 3  // 0=subject, 1=parents, 2=grandparents, 3=great-grandparents

// ── Level labels ─────────────────────────────────────────────
const LEVEL_LABELS = ['Chủ thể', 'Cha / Mẹ', 'Ông / Bà', 'Cụ / Kỵ']
const LEVEL_COLORS = ['#FCD34D', '#93C5FD', '#86EFAC', '#FB923C']

// ── Generation/gender color theme ────────────────────────────
const getAncTheme = (member) => {
  const { generation: g, gender, role } = member
  const f = gender === 'female'
  if (role === 'patriarch') return { bg: '#3A1000', border: '#F97316', text: '#FFF0D0', accent: '#FFC857' }
  if (role === 'matriarch') return { bg: '#3A0020', border: '#F472B6', text: '#FFE4F0', accent: '#FDA4C4' }
  if (g <= 1) return f
    ? { bg: '#2A0020', border: '#F472B6', text: '#FFE4F0', accent: '#FDA4C4' }
    : { bg: '#3A1000', border: '#F97316', text: '#FFF0D0', accent: '#FFC857' }
  if (g === 2) return f
    ? { bg: '#1C0535', border: '#A855F7', text: '#EDE9FE', accent: '#C084FC' }
    : { bg: '#071A35', border: '#3B82F6', text: '#DBEAFE', accent: '#93C5FD' }
  if (g === 3) return f
    ? { bg: '#2A050F', border: '#F472B6', text: '#FCE7F3', accent: '#FBCFE8' }
    : { bg: '#051A10', border: '#4ADE80', text: '#DCFCE7', accent: '#86EFAC' }
  if (g === 4) return f
    ? { bg: '#150820', border: '#E879F9', text: '#FAE8FF', accent: '#F0ABFC' }
    : { bg: '#071525', border: '#22D3EE', text: '#CFFAFE', accent: '#67E8F9' }
  return f
    ? { bg: '#1A1020', border: '#FCD34D', text: '#FEF9C3', accent: '#FDE68A' }
    : { bg: '#0A1020', border: '#FCD34D', text: '#FEF9C3', accent: '#FDE68A' }
}

// ── Build ancestor tree recursively ──────────────────────────
function buildAncTree(memberId, allMembers, depth = 0) {
  if (depth > MAX_DEPTH || !memberId) return null
  const m = allMembers.find((x) => x.id === memberId)
  if (!m) return null
  return {
    member: m,
    depth,
    father: buildAncTree(m.fatherId, allMembers, depth + 1),
    mother: buildAncTree(m.motherId, allMembers, depth + 1),
  }
}

// ── Compute absolute positions for every node ────────────────
// slotStart: the leftmost leaf-slot index for this subtree
function computeLayout(node, depth, slotStart) {
  if (!node) return []
  const slots = Math.pow(2, MAX_DEPTH - depth)
  const xCenter = (slotStart + slots / 2) * LEAF_W
  return [
    {
      member: node.member,
      x: xCenter - CARD_W / 2,
      y: (MAX_DEPTH - depth) * V_STEP,
      xCenter,
      depth,
    },
    ...computeLayout(node.father, depth + 1, slotStart),
    ...computeLayout(node.mother, depth + 1, slotStart + slots / 2),
  ]
}

// ── Build SVG connector paths ─────────────────────────────────
function buildConnectors(positions) {
  const posMap = new Map(positions.map((p) => [p.member.id, p]))
  const lines = []
  positions.forEach((pos) => {
    const { fatherId, motherId } = pos.member
    if (fatherId && posMap.has(fatherId)) {
      const parent = posMap.get(fatherId)
      lines.push({
        x1: pos.xCenter,
        y1: pos.y,              // top edge of child card
        x2: parent.xCenter,
        y2: parent.y + CARD_H, // bottom edge of parent card
        color: getAncTheme(parent.member).border,
      })
    }
    if (motherId && posMap.has(motherId)) {
      const parent = posMap.get(motherId)
      lines.push({
        x1: pos.xCenter,
        y1: pos.y,
        x2: parent.xCenter,
        y2: parent.y + CARD_H,
        color: getAncTheme(parent.member).border,
      })
    }
  })
  return lines
}

// ── Individual ancestor card ──────────────────────────────────
const AncestorNode = ({ pos, isSubject, onClick }) => {
  const { member, x, y, depth } = pos
  const theme = getAncTheme(member)
  const birthYear = member.birthDate?.split('-')[0]
  const deathYear = member.deathDate?.split('-')[0]
  // Live avatar from store (supports uploaded photos)
  const avatar = useMembersStore((s) => {
    const live = s.members.find((m) => m.id === member.id)
    return live?.avatar ?? member.avatar ?? null
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: (MAX_DEPTH - depth) * 0.05, duration: 0.22, ease: 'easeOut' }}
      onClick={() => onClick(member)}
      whileHover={{ scale: 1.06, zIndex: 99 }}
      whileTap={{ scale: 0.96 }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        borderRadius: 10,
        background: theme.bg,
        border: isSubject
          ? `2.5px solid ${theme.accent}`
          : `1.5px solid ${theme.border}`,
        boxShadow: isSubject
          ? `0 0 0 3px ${theme.accent}30, 0 10px 36px rgba(0,0,0,0.75)`
          : '0 4px 18px rgba(0,0,0,0.6)',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Accent header */}
      <div
        style={{
          background: `linear-gradient(90deg, ${theme.border}50, transparent)`,
          padding: '3px 9px',
          borderBottom: `1px solid ${theme.border}25`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: theme.accent,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Đời {member.generation} · {LEVEL_LABELS[depth] ?? ''}
        </span>
        {member.isAlive ? (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ADE80',
              display: 'inline-block',
              boxShadow: '0 0 5px #4ADE8099',
            }}
          />
        ) : (
          <span style={{ color: theme.text, opacity: 0.5, fontSize: 10 }}>†</span>
        )}
      </div>

      {/* Card body */}
      <div
        style={{
          padding: '5px 9px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: avatar ? 7 : 0 }}>
          {avatar && (
            <img
              src={avatar}
              alt={member.fullName}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `1.5px solid ${theme.border}60`,
                flexShrink: 0,
              }}
            />
          )}
          <p
            style={{
              color: theme.text,
              fontSize: 11.5,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.3,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {member.fullName}
          </p>
        </div>

        {member.nickname && (
          <p
            style={{
              color: theme.text,
              opacity: 0.55,
              fontSize: 9.5,
              margin: 0,
              lineHeight: 1.3,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {member.nickname}
          </p>
        )}

        {(birthYear || deathYear) && (
          <p style={{ color: theme.accent, fontSize: 10, margin: '2px 0 0', opacity: 0.85 }}>
            {birthYear || '?'}
            {deathYear ? ` — ${deathYear}` : ''}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Main AncestorChart component ──────────────────────────────
const AncestorChart = () => {
  const allMembers = useMembersStore((s) => s.members)
  const { setSelectedMember } = useAppStore()

  const [subjectId, setSubjectId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const normalizeSearchText = (text) =>
    text
      .toString()
      .normalize('NFD') // Tách dấu khỏi ký tự
      .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu vừa tách
      .replace(/đ/g, 'd') // Xử lý riêng chữ đ
      .replace(/Đ/g, 'D') // Xử lý riêng chữ Đ
      .toLowerCase()

  // Filtered member list for search dropdown
  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return allMembers
    return allMembers
      .filter(
        (m) =>
          normalizeSearchText(m.fullName).includes(normalizeSearchText(q)) ||
          (m.nickname && normalizeSearchText(m.nickname).includes(normalizeSearchText(q))),
      )
      .slice(0, 14)
  }, [allMembers, searchTerm])

  // Build layout for selected subject
  const positions = useMemo(() => {
    if (!subjectId) return []
    const tree = buildAncTree(subjectId, allMembers, 0)
    if (!tree) return []
    return computeLayout(tree, 0, 0)
  }, [subjectId, allMembers])

  const connectors = useMemo(() => buildConnectors(positions), [positions])

  const hasAncestors = positions.length > 1
  const canvasW = Math.pow(2, MAX_DEPTH) * LEAF_W   // 8 × 184 = 1472
  const canvasH = MAX_DEPTH * V_STEP + CARD_H + 24  // ≈ 586

  const selectMember = (member) => {
    setSubjectId(member.id)
    setSearchTerm(member.fullName)
    setShowDropdown(false)
  }

  const clearSubject = () => {
    setSubjectId(null)
    setSearchTerm('')
    setShowDropdown(false)
  }

  // Active level set (for legend badges)
  const activeLevels = useMemo(
    () => new Set(positions.map((p) => p.depth)),
    [positions],
  )

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 180px)',
        background: '#0B1120',
        padding: '28px 0 60px',
        position: 'relative',
      }}
    >
      {/* ── Subject search selector ────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          marginBottom: 28,
          padding: '0 24px',
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: '#475569',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            margin: 0,
          }}
        >
          Chọn thành viên
        </p>

        <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
          {/* Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15,23,42,0.95)',
              border: `1.5px solid ${subjectId ? 'rgba(252,211,77,0.45)' : 'rgba(148,163,184,0.22)'}`,
              borderRadius: 10,
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.2s',
            }}
          >
            <HiSearch
              size={16}
              style={{ flexShrink: 0, margin: '0 12px', color: '#64748B' }}
            />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Tìm tên để xem bảng tổ tiên..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: '#E2E8F0',
                padding: '11px 0',
              }}
            />
            {subjectId && (
              <button
                onClick={clearSubject}
                style={{
                  flexShrink: 0,
                  margin: '0 10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <HiX size={15} />
              </button>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showDropdown && filteredMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scaleY: 0.94 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -6, scaleY: 0.94 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  background: 'rgba(11,17,32,0.98)',
                  border: '1px solid rgba(148,163,184,0.18)',
                  borderRadius: 10,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 60,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {filteredMembers.map((m) => {
                  const theme = getAncTheme(m)
                  return (
                    <button
                      key={m.id}
                      onClick={() => selectMember(m)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(148,163,184,0.07)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'rgba(56,189,248,0.07)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: `${theme.border}20`,
                          border: `1.5px solid ${theme.border}50`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          color: theme.accent,
                          flexShrink: 0,
                        }}
                      >
                        {m.fullName.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: '#E2E8F0',
                            fontSize: 13,
                            fontWeight: 600,
                            margin: 0,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {m.fullName}
                        </p>
                        <p style={{ color: '#64748B', fontSize: 11, margin: 0 }}>
                          Đời {m.generation}
                          {m.birthDate ? ` · ${m.birthDate.split('-')[0]}` : ''}
                          {m.branch && m.branch !== 'main' ? ` · Chi ${m.branch}` : ''}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────── */}
      {!subjectId && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            paddingTop: 72,
            color: '#475569',
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'rgba(148,163,184,0.06)',
              border: '1.5px dashed rgba(148,163,184,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HiUser size={34} style={{ opacity: 0.25, color: '#94A3B8' }} />
          </div>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0, fontWeight: 500 }}>
            Chọn một thành viên để xem bảng tổ tiên
          </p>
          <p style={{ fontSize: 13, color: '#475569', margin: 0, opacity: 0.7 }}>
            Hiển thị cha mẹ · ông bà · cụ kỵ theo đường huyết thống
          </p>
        </motion.div>
      )}

      {/* ── No-ancestors message ──────────────────────────────── */}
      {subjectId && !hasAncestors && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            paddingTop: 60,
            color: '#64748B',
            fontSize: 14,
          }}
        >
          Chưa có dữ liệu tổ tiên cho thành viên này.
        </motion.div>
      )}

      {/* ── Chart ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {subjectId && hasAncestors && (
          <motion.div
            key={subjectId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Level legend badges */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 24,
                padding: '0 24px',
              }}
            >
              {LEVEL_LABELS.map((label, depth) => {
                if (!activeLevels.has(depth)) return null
                const c = LEVEL_COLORS[depth]
                return (
                  <span
                    key={depth}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: c,
                      background: `${c}12`,
                      border: `1px solid ${c}30`,
                      padding: '3px 13px',
                      borderRadius: 20,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {depth === 0 ? '▶' : '↑'} {label}
                  </span>
                )
              })}
            </div>

            {/* Scrollable canvas */}
            <div style={{ overflowX: 'auto', overflowY: 'visible', padding: '0 24px 24px' }}>
              <div
                style={{
                  position: 'relative',
                  width: canvasW,
                  height: canvasH,
                  margin: '0 auto',
                }}
              >
                {/* SVG connector lines */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: canvasW,
                    height: canvasH,
                    pointerEvents: 'none',
                    overflow: 'visible',
                  }}
                >
                  {connectors.map((c, i) => {
                    const midY = (c.y1 + c.y2) / 2
                    // Cubic bezier: S-curve from child top up to parent bottom
                    const d = `M ${c.x1} ${c.y1} C ${c.x1} ${midY}, ${c.x2} ${midY}, ${c.x2} ${c.y2}`
                    return (
                      <path
                        key={i}
                        d={d}
                        stroke={`${c.color}55`}
                        strokeWidth={1.5}
                        fill="none"
                        strokeLinecap="round"
                      />
                    )
                  })}
                  {/* Dot markers at connection endpoints */}
                  {connectors.map((c, i) => (
                    <React.Fragment key={`dot-${i}`}>
                      <circle cx={c.x1} cy={c.y1} r={2.5} fill={`${c.color}70`} />
                      <circle cx={c.x2} cy={c.y2} r={2.5} fill={`${c.color}70`} />
                    </React.Fragment>
                  ))}
                </svg>

                {/* Member cards */}
                {positions.map((pos) => (
                  <AncestorNode
                    key={pos.member.id}
                    pos={pos}
                    isSubject={pos.depth === 0}
                    onClick={setSelectedMember}
                  />
                ))}
              </div>
            </div>

            {/* Chart stats footer */}
            <div
              style={{
                textAlign: 'center',
                marginTop: 16,
                fontSize: 12,
                color: '#334155',
              }}
            >
              <span style={{ color: '#FCD34D', fontWeight: 700 }}>{positions.length}</span> tổ tiên
              hiển thị · <span style={{ color: '#64748B' }}>{MAX_DEPTH} thế hệ</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared modal + admin toolbar */}
      <MemberProfileModal />
      <AdminToolbar />
    </div>
  )
}

export default AncestorChart