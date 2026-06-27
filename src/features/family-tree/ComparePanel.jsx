import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiSwitchHorizontal, HiSearch, HiChevronDown } from 'react-icons/hi'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'
import { getRelationship } from '@/utils/relationship'

// ── Relationship type badge colors ─────────────────────────
const TYPE_COLORS = {
  spouse: { bg: 'rgba(244,114,182,0.15)', border: '#F472B6', text: '#F472B6' },
  direct: { bg: 'rgba(251,191,36,0.15)', border: '#FBBF24', text: '#FBBF24' },
  sibling: { bg: 'rgba(74,222,128,0.15)', border: '#4ADE80', text: '#4ADE80' },
  uncle_niece: { bg: 'rgba(56,189,248,0.15)', border: '#38BDF8', text: '#38BDF8' },
  cousin: { bg: 'rgba(168,85,247,0.15)', border: '#A855F7', text: '#A855F7' },
  grand_uncle: { bg: 'rgba(251,146,60,0.15)', border: '#FB923C', text: '#FB923C' },
  cousin_removed: { bg: 'rgba(148,163,184,0.12)', border: '#94A3B8', text: '#94A3B8' },
  second_cousin: { bg: 'rgba(148,163,184,0.12)', border: '#94A3B8', text: '#94A3B8' },
  distant: { bg: 'rgba(148,163,184,0.08)', border: '#475569', text: '#64748B' },
  none: { bg: 'rgba(239,68,68,0.1)', border: '#EF4444', text: '#EF4444' },
}

const QUESTION_PRESETS = [
  { id: 'addressing', label: 'Hai người này gọi nhau là gì?', eyebrow: 'Câu hỏi nhanh', tone: '#A855F7' },
  { id: 'shortestPath', label: 'Đường nối ngắn nhất', eyebrow: 'Chuỗi kết nối', tone: '#38BDF8' },
  { id: 'hierarchy', label: 'Ai thuộc vai trên / dưới?', eyebrow: 'Vai vế', tone: '#FBBF24' },
]

const PEER_RELATIONSHIP_TYPES = new Set(['sibling', 'cousin', 'second_cousin'])

const getShortName = (member) => member?.fullName?.split(' ').pop() ?? ''

const getConnectionChain = (relationship, m1, m2) => {
  if (relationship?.connectionChain?.length) return relationship.connectionChain
  if (relationship?.type === 'spouse' && m1 && m2) return [m1.id, m2.id]
  return []
}

const getPeerLead = (relationship, m1, m2) => {
  if (!relationship || !PEER_RELATIONSHIP_TYPES.has(relationship.type)) return null
  if (relationship.how1Calls2?.includes('em') && !relationship.how2Calls1?.includes('em')) return m1
  if (relationship.how2Calls1?.includes('em') && !relationship.how1Calls2?.includes('em')) return m2
  return null
}

const getHierarchyInsight = (relationship, m1, m2) => {
  if (!relationship || !m1 || !m2) return null

  if (relationship.type === 'none') {
    return {
      title: 'Chưa xác định được vai trên hay vai dưới',
      detail: 'Dữ liệu hiện tại chưa cho thấy một đường huyết thống đủ rõ để phân vai vế giữa hai người này.',
      metric: '—',
      metricLabel: 'Vai vế',
    }
  }

  if (relationship.type === 'spouse') {
    return {
      title: 'Hai người ngang vai trong quan hệ vợ chồng',
      detail: 'Đây là quan hệ hôn phối nên không chia bậc trên dưới theo huyết thống; panel chỉ cần nhấn mạnh đây là một cặp trực tiếp.',
      metric: 'Ngang vai',
      metricLabel: 'Quan hệ',
    }
  }

  if (relationship.d1 === relationship.d2) {
    const peerLead = getPeerLead(relationship, m1, m2)
    return {
      title: peerLead
        ? `${peerLead.fullName} là vai lớn hơn trong cùng tầng thế hệ`
        : 'Hai người cùng vai trong cây gia phả',
      detail: peerLead
        ? `${m1.fullName} và ${m2.fullName} đứng cùng tầng thế hệ, nhưng xưng hô vẫn tách vai theo tuổi hoặc theo nhánh.`
        : `${m1.fullName} và ${m2.fullName} cùng một tầng thế hệ nên không có vai trên dưới tuyệt đối; chủ yếu phân theo tuổi hoặc cách xưng hô trong nhánh.`,
      metric: 'Cùng vai',
      metricLabel: 'Thế hệ',
    }
  }

  const upperMember = relationship.d1 < relationship.d2 ? m1 : m2
  const lowerMember = upperMember.id === m1.id ? m2 : m1
  const gap = Math.abs(relationship.d1 - relationship.d2)

  return {
    title: `${upperMember.fullName} thuộc vai trên`,
    detail: `${upperMember.fullName} gần tổ chung hơn ${gap} bậc, nên đứng vai trên. ${lowerMember.fullName} nằm ở vai dưới trong quan hệ này.`,
    metric: `${gap} bậc`,
    metricLabel: 'Chênh vai',
  }
}

const getQuestionResponse = (questionId, relationship, m1, m2) => {
  if (!relationship || !m1 || !m2) return null

  const chain = getConnectionChain(relationship, m1, m2)

  if (questionId === 'shortestPath') {
    if (!chain.length) {
      return {
        title: 'Chưa có đường nối ngắn nhất để hiển thị',
        detail: 'Cần có một quan hệ xác định hoặc chuỗi tổ chung thì panel mới tô sáng được lộ trình nối giữa hai người.',
        metric: '0',
        metricLabel: 'Chặng',
      }
    }

    const stepCount = Math.max(chain.length - 1, 0)

    return {
      title: `Đi từ ${getShortName(m1)} sang ${getShortName(m2)} qua ${stepCount} chặng`,
      detail: stepCount === 1
        ? 'Hai người nối trực tiếp với nhau trên cây. Chỉ cần theo đúng một cạnh đang được highlight.'
        : `Đây là lộ trình ngắn nhất đang được highlight trên cây, đi qua ${chain.length} người trong cùng một chuỗi kết nối.`,
      metric: `${stepCount}`,
      metricLabel: 'Chặng',
    }
  }

  if (questionId === 'hierarchy') {
    return getHierarchyInsight(relationship, m1, m2)
  }

  if (relationship.type === 'none') {
    return {
      title: 'Chưa gọi nhau theo một vai vế xác định',
      detail: 'Dữ liệu hiện tại chưa đủ để suy ra cách xưng hô qua phả hệ giữa hai người này.',
      metric: '—',
      metricLabel: 'Xưng hô',
    }
  }

  return {
    title: `${getShortName(m1)} gọi ${getShortName(m2)} là "${relationship.how1Calls2}"`,
    detail: `${getShortName(m2)} gọi lại ${getShortName(m1)} là "${relationship.how2Calls1}".`,
    metric: '2 chiều',
    metricLabel: 'Xưng hô',
  }
}

// ── Searchable member dropdown ─────────────────────────────
const MemberPicker = ({ value, onChange, placeholder, accentColor, members }) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return members.slice(0, 30)
    const q = query.toLowerCase()
    return members
      .filter(
        (m) =>
          normalizeSearchText(m.fullName).includes(normalizeSearchText(q)) ||
          (m.nickname && normalizeSearchText(m.nickname).includes(normalizeSearchText(q))),
      )
      .slice(0, 20)
  }, [query, members])

  const normalizeSearchText = (text) =>
    text
      .toString()
      .normalize('NFD') // Tách dấu khỏi ký tự
      .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu vừa tách
      .replace(/đ/g, 'd') // Xử lý riêng chữ đ
      .replace(/Đ/g, 'D') // Xử lý riêng chữ Đ
      .toLowerCase()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (m) => {
    onChange(m)
    setQuery('')
    setOpen(false)
  }

  const genColor = [, '#FFC857', '#93C5FD', '#86EFAC', '#C084FC', '#FDE68A']

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 12px',
          borderRadius: 9,
          border: `1.5px solid ${value ? accentColor + '60' : 'rgba(148,163,184,0.2)'}`,
          background: value ? `${accentColor}08` : 'rgba(15,23,42,0.7)',
          color: value ? '#E2E8F0' : '#64748B',
          fontSize: 13,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s',
        }}
      >
        {value ? (
          <>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: genColor[value.generation] || '#64748B', flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {value.fullName}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}
            >
              <HiX size={13} />
            </button>
          </>
        ) : (
          <>
            <HiSearch size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{placeholder}</span>
            <HiChevronDown size={14} style={{ flexShrink: 0 }} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 100,
              borderRadius: 10,
              background: 'rgba(11,17,32,0.99)',
              border: '1px solid rgba(148,163,184,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Search input inside dropdown */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
              <div style={{ position: 'relative' }}>
                <HiSearch size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập tên..."
                  style={{
                    width: '100%',
                    paddingLeft: 28,
                    paddingRight: 8,
                    paddingTop: 6,
                    paddingBottom: 6,
                    fontSize: 12,
                    color: '#E2E8F0',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(148,163,184,0.15)',
                    borderRadius: 6,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            {/* Options */}
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <p style={{ padding: '12px 14px', fontSize: 12, color: '#64748B', textAlign: 'center' }}>Không tìm thấy</p>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => select(m)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#CBD5E1',
                      fontSize: 13,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: genColor[m.generation] || '#64748B', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{m.fullName}</span>
                    <span style={{ fontSize: 10, color: '#475569' }}>Đời {m.generation}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Path chain display ─────────────────────────────────────
const PathChain = ({ chain, members }) => {
  if (!chain || chain.length === 0) return null
  const membersMap = Object.fromEntries(members.map((m) => [m.id, m]))
  const genColor = [, '#FFC857', '#93C5FD', '#86EFAC', '#C084FC', '#FDE68A']

  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>
        Chuỗi kết nối ({chain.length} người)
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0 }}>
        {chain.map((id, i) => {
          const m = membersMap[id]
          if (!m) return null
          return (
            <React.Fragment key={id}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: genColor[m.generation] || '#94A3B8',
                  background: `${genColor[m.generation] || '#94A3B8'}15`,
                  border: `1px solid ${genColor[m.generation] || '#94A3B8'}40`,
                  borderRadius: 5,
                  padding: '2px 7px',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.fullName}
              </span>
              {i < chain.length - 1 && (
                <span style={{ fontSize: 12, color: '#334155', margin: '0 2px' }}>→</span>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ComparePanel ─────────────────────────────────────
const ComparePanel = ({ layout = 'overlay' }) => {
  const {
    compareMode, toggleCompareMode,
    compareM1: m1, compareM2: m2,
    setCompareM1, setCompareM2,
    swapCompareMembers,
    clearCompareMembers,
    setComparePathIds, clearComparePathIds,
  } = useAppStore()
  const { members } = useMembersStore()
  const [activeQuestion, setActiveQuestion] = useState('addressing')

  const relationship = useMemo(() => {
    if (!m1 || !m2) return null
    return getRelationship(m1.id, m2.id, members)
  }, [m1, m2, members])

  const activeQuestionMeta = useMemo(
    () => QUESTION_PRESETS.find((preset) => preset.id === activeQuestion) ?? QUESTION_PRESETS[0],
    [activeQuestion],
  )

  const questionResponse = useMemo(
    () => getQuestionResponse(activeQuestion, relationship, m1, m2),
    [activeQuestion, relationship, m1, m2],
  )

  const connectionChain = useMemo(
    () => getConnectionChain(relationship, m1, m2),
    [relationship, m1, m2],
  )

  // Push path IDs to store so the tree can highlight them
  useEffect(() => {
    if (relationship?.pathIds?.size > 0) {
      setComparePathIds(relationship.pathIds)
    } else {
      clearComparePathIds()
    }
  }, [relationship, setComparePathIds, clearComparePathIds])

  // Clear when panel closes
  useEffect(() => {
    if (!compareMode) clearCompareMembers()
  }, [compareMode, clearCompareMembers])

  const colors = TYPE_COLORS[relationship?.type] ?? TYPE_COLORS.none

  // Dynamic hint text based on selection progress
  const hintText = !m1
    ? 'Click node trên cây hoặc chọn từ dropdown'
    : !m2
      ? `Đã chọn ${m1.fullName} · Click node thứ 2`
      : null

  if (!compareMode) return null

  const isEmbedded = layout === 'embedded'

  return (
    <motion.div
      initial={isEmbedded ? { opacity: 0, y: 18 } : { opacity: 0, x: 40 }}
      animate={isEmbedded ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
      exit={isEmbedded ? { opacity: 0, y: 18 } : { opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      style={{
        position: isEmbedded ? 'relative' : 'absolute',
        top: isEmbedded ? 'auto' : 16,
        right: isEmbedded ? 'auto' : 16,
        width: isEmbedded ? '100%' : 320,
        maxHeight: isEmbedded ? 'min(70vh, 720px)' : 'calc(100vh - 100px)',
        zIndex: isEmbedded ? 'auto' : 25,
        borderRadius: 14,
        background: 'rgba(11,17,32,0.97)',
        border: '1px solid rgba(168,85,247,0.4)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.15)',
        backdropFilter: 'blur(20px)',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, borderRadius: '14px 14px 0 0', background: 'rgba(11,17,32,0.97)' }}>
        <span style={{ fontSize: 16 }}>🔗</span>
        <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.03em' }}>So sánh quan hệ</p>
        {(m1 || m2) && (
          <button
            onClick={clearCompareMembers}
            title="Xóa lựa chọn"
            style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '3px 8px', borderRadius: 5 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'none' }}
          >
            Xóa
          </button>
        )}
        <button
          onClick={toggleCompareMode}
          style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 5 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#E2E8F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'none' }}
        >
          <HiX size={16} />
        </button>
      </div>

      <div
        style={{
          padding: 16,
          overflowY: 'auto',
          flex: 1,
          maxHeight: isEmbedded ? 'min(56vh, 620px)' : 'calc(100vh - 150px)',
          borderRadius: '0 0 14px 14px',
        }}
      >
        {/* Click hint */}
        {hintText && (
          <motion.div
            key={hintText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginBottom: 12,
              padding: '7px 12px',
              borderRadius: 8,
              background: 'rgba(168,85,247,0.07)',
              border: '1px dashed rgba(168,85,247,0.3)',
              fontSize: 11,
              color: '#A855F7',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {hintText}
          </motion.div>
        )}

        {/* Member selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A855F7', marginBottom: 5 }}>① Người 1</p>
            <MemberPicker value={m1} onChange={setCompareM1} placeholder="Chọn người thứ nhất..." accentColor="#A855F7" members={members} />
          </div>

          {/* Swap button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={swapCompareMembers}
              disabled={!m1 && !m2}
              title="Đổi chỗ hai người"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid rgba(148,163,184,0.2)',
                background: 'rgba(255,255,255,0.04)',
                color: '#64748B',
                fontSize: 11,
                cursor: 'pointer',
                opacity: (!m1 && !m2) ? 0.4 : 1,
              }}
            >
              <HiSwitchHorizontal size={12} />
              Đổi chỗ
            </button>
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#38BDF8', marginBottom: 5 }}>② Người 2</p>
            <MemberPicker value={m2} onChange={setCompareM2} placeholder="Chọn người thứ hai..." accentColor="#38BDF8" members={members} />
          </div>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {relationship ? (
            <motion.div
              key={`${m1?.id}-${m2?.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ marginTop: 16 }}
            >
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>
                  Preset câu hỏi
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {QUESTION_PRESETS.map((preset) => {
                    const active = preset.id === activeQuestion

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setActiveQuestion(preset.id)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 999,
                          border: active ? `1px solid ${preset.tone}55` : '1px solid rgba(148,163,184,0.18)',
                          background: active ? `${preset.tone}18` : 'rgba(15,23,42,0.65)',
                          color: active ? preset.tone : '#CBD5E1',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {questionResponse && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: `${activeQuestionMeta.tone}12`,
                    border: `1px solid ${activeQuestionMeta.tone}35`,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: activeQuestionMeta.tone, marginBottom: 5 }}>
                        {activeQuestionMeta.eyebrow}
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', lineHeight: 1.4 }}>
                        {questionResponse.title}
                      </p>
                      <p style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.6, marginTop: 6 }}>
                        {questionResponse.detail}
                      </p>
                    </div>
                    <div
                      style={{
                        minWidth: 68,
                        padding: '6px 8px',
                        borderRadius: 10,
                        background: 'rgba(11,17,32,0.46)',
                        border: `1px solid ${activeQuestionMeta.tone}25`,
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <p style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>{questionResponse.metricLabel}</p>
                      <p style={{ fontSize: 12, fontWeight: 800, color: '#F8FAFC', lineHeight: 1.3 }}>
                        {questionResponse.metric}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Relationship type badge */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: colors.bg,
                  border: `1px solid ${colors.border}50`,
                  marginBottom: 12,
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: colors.text, marginBottom: 4 }}>
                  Mối quan hệ
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{relationship.label}</p>
                {relationship.type !== 'none' && relationship.d1 >= 0 && (
                  <p style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                    Khoảng cách: {relationship.d1 + relationship.d2} bậc
                    {relationship.d1 > 0 && relationship.d2 > 0 && ` (${relationship.d1} + ${relationship.d2})`}
                  </p>
                )}
              </div>

              {/* Addressing table */}
              {relationship.type !== 'none' && (
                <div
                  style={{
                    borderRadius: 10,
                    border: '1px solid rgba(148,163,184,0.12)',
                    overflow: 'hidden',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748B' }}>Cách xưng hô</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr' }}>
                    {/* m1 → m2 */}
                    <div style={{ padding: '10px 12px', borderRight: '1px solid rgba(148,163,184,0.08)' }}>
                      <p style={{ fontSize: 10, color: '#A855F7', fontWeight: 700, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m1.fullName.split(' ').pop()}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>gọi</p>
                      <p style={{ fontSize: 10, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m2.fullName.split(' ').pop()}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>là</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#E2E8F0' }}>"{relationship.how1Calls2}"</p>
                    </div>
                    {/* Arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                      <span style={{ fontSize: 16, color: '#334155' }}>⇄</span>
                    </div>
                    {/* m2 → m1 */}
                    <div style={{ padding: '10px 12px', borderLeft: '1px solid rgba(148,163,184,0.08)' }}>
                      <p style={{ fontSize: 10, color: '#38BDF8', fontWeight: 700, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m2.fullName.split(' ').pop()}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>gọi</p>
                      <p style={{ fontSize: 10, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m1.fullName.split(' ').pop()}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>là</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: '#E2E8F0' }}>"{relationship.how2Calls1}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, marginBottom: 12 }}>
                {relationship.description}
              </p>

              {/* Path chain */}
              {connectionChain.length > 0 && (
                <PathChain chain={connectionChain} members={members} />
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ComparePanel