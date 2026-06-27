import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSearch, HiX, HiFilter } from 'react-icons/hi'
import { HiSwitchHorizontal } from 'react-icons/hi'
import FamilyNode from './FamilyNode'
import MemberProfileModal from './MemberProfileModal'
import AdminToolbar from '@/features/admin/AdminToolbar'
import ComparePanel from './ComparePanel'
import { buildFamilyNodes, buildFamilyEdges } from '@/data'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'

// Register custom node types
const nodeTypes = { familyNode: FamilyNode }
const DESKTOP_MEDIA_QUERY = '(min-width: 1280px)'
const ELDERLY_TABS = ['search', 'focus']

// Follow fatherId/motherId chain up to root, collecting all IDs + their spouses
const getPathToRoot = (memberId, members) => {
  const path = new Set()
  const visited = new Set()
  let current = members.find((m) => m.id === memberId)
  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    path.add(current.id)
    // include spouse so couple edges are highlighted too
    current.spouseIds?.forEach((sid) => path.add(sid))
    const parentId = current.fatherId || current.motherId
    current = parentId ? members.find((m) => m.id === parentId) : null
  }
  return path
}

// Walk descendant subtree (BFS), including spouses on each node
const getDescendants = (memberId, members) => {
  const result = new Set()
  const queue = [memberId]
  while (queue.length) {
    const id = queue.shift()
    if (result.has(id)) continue
    result.add(id)
    const m = members.find((x) => x.id === id)
    m?.spouseIds?.forEach((sid) => result.add(sid))
    m?.childrenIds?.forEach((cid) => queue.push(cid))
  }
  return result
}

const normalizeSearchText = (text) =>
  text
    .toString()
    .normalize('NFD') // Tách dấu khỏi ký tự
    .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu vừa tách
    .replace(/đ/g, 'd') // Xử lý riêng chữ đ
    .replace(/Đ/g, 'D') // Xử lý riêng chữ Đ
    .toLowerCase()

const getLineageTrail = (memberId, members) => {
  const trail = []
  const visited = new Set()
  let current = members.find((m) => m.id === memberId)

  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    trail.unshift(current)
    const parentId = current.fatherId || current.motherId
    current = parentId ? members.find((m) => m.id === parentId) : null
  }

  return trail
}

// BFS over ReactFlow edges to compute per-edge animation delay (seconds)
// Returns Map<edgeId, delaySeconds> for all edges reachable via parent→child links
const getPulseEdges = (memberId, allEdges) => {
  const map = new Map()           // edgeId  → delay (s)
  const nodeLevel = new Map([[memberId, 0]])
  const queue = [{ nodeId: memberId, level: 0 }]
  const visited = new Set()
  const STEP = 0.14               // seconds of extra delay per BFS level

  while (queue.length) {
    const { nodeId, level } = queue.shift()
    if (visited.has(nodeId)) continue
    visited.add(nodeId)

    allEdges.forEach((e) => {
      if (e.source === nodeId && e.data?.relationshipType !== 'marriage') {
        if (!map.has(e.id)) {
          map.set(e.id, level * STEP)
          if (!nodeLevel.has(e.target)) {
            nodeLevel.set(e.target, level + 1)
            queue.push({ nodeId: e.target, level: level + 1 })
          }
        }
      }
    })
  }
  return map
}

// Filter chip group component
const FilterGroup = ({ label, options, value, onChange, color, compact = false }) => (
  <div>
    <p style={{ color: '#64748B', fontSize: compact ? 11 : 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
      {label}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              fontSize: compact ? 12 : 11,
              fontWeight: active ? 700 : 400,
              padding: compact ? '5px 13px' : '3px 11px',
              borderRadius: 20,
              border: active ? `1.5px solid ${color}` : '1.5px solid rgba(148,163,184,0.25)',
              background: active ? `${color}22` : 'rgba(15,23,42,0.5)',
              color: active ? color : '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  </div>
)

const INSPECTOR_TABS = [
  { id: 'search', label: 'Tìm kiếm', icon: HiSearch, tone: '#38BDF8' },
  { id: 'focus', label: 'Focus nhánh', icon: HiFilter, tone: '#FCD34D' },
  { id: 'compare', label: 'So sánh', icon: HiSwitchHorizontal, tone: '#C084FC' },
]

const InspectorSearchField = ({
  value,
  onChange,
  onClear,
  placeholder = 'Tìm kiếm theo tên hoặc biệt danh...',
  large = false,
}) => (
  <div style={{ position: 'relative' }}>
    <HiSearch
      size={large ? 18 : 16}
      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}
    />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        paddingLeft: large ? 42 : 36,
        paddingRight: value ? 36 : 12,
        paddingTop: large ? 14 : 11,
        paddingBottom: large ? 14 : 11,
        fontSize: large ? 16 : 13,
        color: '#E2E8F0',
        borderRadius: 12,
        border: '1px solid rgba(148,163,184,0.22)',
        background: 'rgba(15,23,42,0.88)',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
    {value && (
      <button
        type="button"
        onClick={onClear}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748B',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
        }}
      >
        <HiX size={large ? 16 : 14} />
      </button>
    )}
  </div>
)

const InspectorTabButton = ({ tab, active, badge, onClick, large = false }) => {
  const Icon = tab.icon

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: large ? '11px 14px' : '9px 12px',
        borderRadius: 999,
        border: active ? `1px solid ${tab.tone}55` : '1px solid rgba(148,163,184,0.18)',
        background: active ? `${tab.tone}16` : 'rgba(15,23,42,0.62)',
        color: active ? tab.tone : '#CBD5E1',
        fontSize: large ? 13 : 11,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      <Icon size={large ? 16 : 14} />
      <span>{tab.label}</span>
      {badge ? (
        <span
          style={{
            padding: large ? '3px 7px' : '2px 6px',
            borderRadius: 999,
            background: active ? `${tab.tone}26` : 'rgba(255,255,255,0.06)',
            color: active ? tab.tone : '#94A3B8',
            fontSize: large ? 11 : 10,
            lineHeight: 1.2,
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  )
}

const MobileQuickAction = ({ icon: Icon, label, detail, tone, onClick, large = false }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 6,
      padding: large ? '12px 14px' : '10px 12px',
      borderRadius: 16,
      border: `1px solid ${tone}2A`,
      background: `${tone}12`,
      cursor: 'pointer',
      textAlign: 'left',
      minWidth: 0,
    }}
  >
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: tone, fontSize: large ? 13 : 11, fontWeight: 700 }}>
      <Icon size={large ? 16 : 14} />
      <span>{label}</span>
    </div>
    <span style={{ color: '#94A3B8', fontSize: large ? 12 : 10, lineHeight: 1.4 }}>
      {detail}
    </span>
  </button>
)

const BRANCH_OPTS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'main', label: 'Thủy tổ' },
  { value: 'sy', label: 'Chi Sỹ' },
  { value: 'nhut', label: 'Chi Nhứt' },
  { value: 'ly', label: 'Chi Lý' },
  { value: 'thong', label: 'Chi Thông' },
]

const InspectorSection = ({ eyebrow, title, description, action, children, large = false }) => (
  <section
    style={{
      borderRadius: 18,
      background: 'rgba(8,14,28,0.9)',
      border: '1px solid rgba(148,163,184,0.16)',
      boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        padding: large ? '18px 20px 16px' : '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div>
        <p style={{ color: '#64748B', fontSize: large ? 11 : 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          {eyebrow}
        </p>
        <h3 style={{ color: '#E2E8F0', fontSize: large ? 20 : 16, fontWeight: 700, lineHeight: 1.25, margin: 0 }}>
          {/* {title} */}
        </h3>
        {description && (
          <p style={{ color: '#94A3B8', fontSize: large ? 14 : 12, lineHeight: 1.6, marginTop: 6, marginBottom: 0 }}>
            {/* {description} */}
          </p>
        )}
      </div>
      {action}
    </div>
    <div style={{ padding: large ? 20 : 18 }}>
      {children}
    </div>
  </section>
)

const LineageBreadcrumb = ({ trail, highlightMode }) => {
  if (!trail.length) return null

  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>
        Breadcrumb huyết thống
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        {trail.map((member, index) => {
          const tone = member.generation === 1 ? '#F97316' : member.generation === 2 ? '#60A5FA' : member.generation === 3 ? '#4ADE80' : member.generation === 4 ? '#C084FC' : '#FCD34D'
          return (
            <React.Fragment key={member.id}>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: 999,
                  border: `1px solid ${tone}50`,
                  background: `${tone}18`,
                  color: tone,
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {member.fullName}
              </span>
              {index < trail.length - 1 && (
                <span style={{ color: '#475569', fontSize: 12 }}>→</span>
              )}
            </React.Fragment>
          )
        })}
        {highlightMode === 'descendant' && (
          <>
            <span style={{ color: '#475569', fontSize: 12 }}>→</span>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                border: '1px solid rgba(74,222,128,0.35)',
                background: 'rgba(74,222,128,0.14)',
                color: '#4ADE80',
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              Nhánh hậu duệ
            </span>
          </>
        )}
      </div>
    </div>
  )
}

// ── Generation legend data ────────────────────────────────────
const GEN_LEGEND = [
  { gen: 1, label: 'Đời I', sublabel: 'Thủy tổ', maleColor: '#F97316', femaleColor: '#F472B6' },
  { gen: 2, label: 'Đời II', sublabel: '', maleColor: '#3B82F6', femaleColor: '#A855F7' },
  { gen: 3, label: 'Đời III', sublabel: '', maleColor: '#4ADE80', femaleColor: '#F472B6' },
  { gen: 4, label: 'Đời IV', sublabel: '', maleColor: '#22D3EE', femaleColor: '#E879F9' },
  { gen: 5, label: 'Đời V', sublabel: '', maleColor: '#FCD34D', femaleColor: '#FCD34D' },
]

// ── Generation Legend Panel ───────────────────────────────────
const GenerationLegend = ({ genStats, genFilter, onToggle, reducedMotion = false }) => {
  const [collapsed, setCollapsed] = useState(false)
  const totalMembers = Object.values(genStats).reduce((s, g) => s + g.total, 0)

  return (
    <div
      style={{
        borderRadius: 18,
        background: 'rgba(8,14,28,0.9)',
        border: '1px solid rgba(148,163,184,0.18)',
        boxShadow: '0 18px 36px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '14px 16px 12px',
          background: 'none',
          border: 'none',
          borderBottom: collapsed ? 'none' : '1px solid rgba(148,163,184,0.12)',
          cursor: 'pointer',
          gap: 12,
          textAlign: 'left',
        }}
      >
        <div>
          <p style={{ color: '#64748B', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
            Chú giải thế hệ
          </p>
          <p style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 700, margin: 0 }}>
            Lọc nhanh theo đời và đọc sắc độ nam - nữ
          </p>
        </div>
        <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600 }}>
          {collapsed ? 'Mở' : 'Thu gọn'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="rows"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '8px 10px' }}>
              {GEN_LEGEND.map(({ gen, label, sublabel, maleColor, femaleColor }) => {
                const stats = genStats[gen] || { total: 0, male: 0, female: 0, alive: 0 }
                const active = genFilter === gen
                return (
                  <button
                    key={gen}
                    onClick={() => onToggle(gen)}
                    title={active ? 'Bỏ lọc thế hệ này' : `Lọc chỉ ${label}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: active ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: maleColor,
                        boxShadow: active ? `0 0 5px ${maleColor}` : `0 0 3px ${maleColor}60`,
                      }} />
                      <div style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: femaleColor,
                        boxShadow: active ? `0 0 5px ${femaleColor}` : `0 0 3px ${femaleColor}60`,
                      }} />
                    </div>

                    <span style={{
                      color: active ? '#F1F5F9' : '#CBD5E1',
                      fontSize: 11, fontWeight: active ? 700 : 500,
                      flex: 1, lineHeight: 1.3,
                    }}>
                      {label}
                      {sublabel && (
                        <span style={{ color: '#475569', fontWeight: 400, fontSize: 9, marginLeft: 4 }}>
                          {sublabel}
                        </span>
                      )}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <span style={{ color: '#60A5FA', fontSize: 9 }}>♂{stats.male}</span>
                      <span style={{ color: '#334155', fontSize: 9 }}>·</span>
                      <span style={{ color: '#F472B6', fontSize: 9 }}>♀{stats.female}</span>
                      <span style={{
                        marginLeft: 2,
                        background: active ? 'rgba(56,189,248,0.22)' : 'rgba(148,163,184,0.1)',
                        color: active ? '#38BDF8' : '#94A3B8',
                        fontSize: 9, fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 4,
                        minWidth: 18,
                        textAlign: 'center',
                      }}>
                        {stats.total}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{
              padding: '8px 16px 10px',
              borderTop: '1px solid rgba(148,163,184,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: '#334155', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Tổng cộng
              </span>
              <span style={{ color: '#E2E8F0', fontSize: 10, fontWeight: 700 }}>
                {totalMembers} người
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
const GENDER_OPTS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
]
const ALIVE_OPTS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'alive', label: 'Còn sống' },
  { value: 'deceased', label: 'Đã mất' },
]

const FamilyTreeVisualization = ({ displayMode = 'default' }) => {
  const liveMembers = useMembersStore((s) => s.members)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [inspectorTab, setInspectorTab] = useState('search')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ branch: 'all', gender: 'all', alive: 'all' })
  const [genFilter, setGenFilter] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isWideLayout, setIsWideLayout] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  )
  const [isInspectorOpen, setIsInspectorOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  )
  const [focusBranch, setFocusBranch] = useState(false)
  const [highlightedId, setHighlightedId] = useState(null)
  const [pulseEdgeMap, setPulseEdgeMap] = useState(new Map())
  const pulseTimeoutRef = useRef(null)
  const reactFlowRef = useRef(null)
  const isElderMode = displayMode === 'elder'
  const shouldReduceMotion = isElderMode
  const {
    setSelectedMember,
    zoomToMemberId, clearZoomToMember,
    compareMode, toggleCompareMode, comparePathIds,
    compareM1, compareM2, cycleCompareMember, clearCompareMembers, clearComparePathIds,
    highlightedMemberId, highlightMode, setHighlightMode,
  } = useAppStore()

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const syncLayout = (event) => {
      const matches = event.matches
      setIsWideLayout(matches)
      if (matches) setIsInspectorOpen(true)
    }

    syncLayout(mediaQuery)
    mediaQuery.addEventListener('change', syncLayout)
    return () => mediaQuery.removeEventListener('change', syncLayout)
  }, [])

  useEffect(() => {
    if (!highlightedId) setFocusBranch(false)
  }, [highlightedId])

  useEffect(() => {
    if (compareMode) return
    clearCompareMembers()
    clearComparePathIds()
  }, [compareMode, clearCompareMembers, clearComparePathIds])

  useEffect(() => {
    if (!compareMode) return
    setInspectorTab('compare')
    if (!isWideLayout) setIsInspectorOpen(true)
  }, [compareMode, isWideLayout])

  useEffect(() => {
    if (!isElderMode) return
    setShowFilters(false)
    setFilters({ branch: 'all', gender: 'all', alive: 'all' })
    setGenFilter(null)
    if (inspectorTab === 'compare') setInspectorTab('search')
    if (compareMode) toggleCompareMode()
  }, [compareMode, inspectorTab, isElderMode, toggleCompareMode])

  // Fly camera to a member node when zoomToMemberId is set
  useEffect(() => {
    if (!zoomToMemberId || !reactFlowRef.current) return
    const node = reactFlowRef.current.getNode(zoomToMemberId)
    if (node) {
      // Node dimensions: width=176, height≈90
      reactFlowRef.current.setCenter(
        node.position.x + 88,
        node.position.y + 45,
        { zoom: isElderMode ? 1.85 : 1.6, duration: shouldReduceMotion ? 0 : 750 }
      )
      setHighlightedId(zoomToMemberId)
    }
    clearZoomToMember()
  }, [zoomToMemberId, clearZoomToMember, isElderMode, shouldReduceMotion])

  // Sync context-menu highlight trigger (from FamilyNode right-click) into local state
  useEffect(() => {
    if (!highlightedMemberId) return
    setHighlightedId(highlightedMemberId)
    setInspectorTab('focus')
    if (!isWideLayout) setIsInspectorOpen(true)
  }, [highlightedMemberId, isWideLayout])

  useEffect(() => {
    const nextNodes = buildFamilyNodes(liveMembers)
    setNodes((currentNodes) => {
      const currentById = new Map(currentNodes.map((node) => [node.id, node]))
      return nextNodes.map((node) => {
        const currentNode = currentById.get(node.id)
        return currentNode
          ? { ...currentNode, ...node, position: currentNode.position, data: node.data }
          : node
      })
    })
    setEdges(buildFamilyEdges(liveMembers))
  }, [liveMembers, setNodes, setEdges])

  // Per-generation stats for the legend panel
  const genStats = useMemo(() => {
    const stats = {}
    liveMembers.forEach((m) => {
      const g = m.generation
      if (!stats[g]) stats[g] = { total: 0, male: 0, female: 0, alive: 0 }
      stats[g].total++
      if (m.gender === 'male') stats[g].male++
      else stats[g].female++
      if (m.isAlive) stats[g].alive++
    })
    return stats
  }, [liveMembers])

  const handleGenToggle = useCallback((gen) => {
    setGenFilter((prev) => (prev === gen ? null : gen))
    setHighlightedId(null)
  }, [])

  // Pulse wave: animate edges flowing from clicked node down to all descendants
  const triggerPulse = useCallback((memberId) => {
    const map = getPulseEdges(memberId, edges)
    if (map.size === 0) return
    setPulseEdgeMap(map)
    const maxDelay = Math.max(...map.values(), 0)
    clearTimeout(pulseTimeoutRef.current)
    // Clear after all animations finish: longest delay + 1.15s animation + 0.1s buffer
    pulseTimeoutRef.current = setTimeout(
      () => setPulseEdgeMap(new Map()),
      (maxDelay + 1.25) * 1000
    )
  }, [edges])

  // Compute which member IDs pass the active filters
  const activeIds = useMemo(() => {
    const noSearch = !search.trim()
    const noFilter = filters.branch === 'all' && filters.gender === 'all' && filters.alive === 'all'
    if (noSearch && noFilter && genFilter === null) return null // null = no filtering active
    return new Set(
      liveMembers
        .filter((m) => {
          const q = search.toLowerCase()
          const matchSearch =
            noSearch ||
            normalizeSearchText(m.fullName).includes(normalizeSearchText(q)) ||
            (m.nickname && normalizeSearchText(m.nickname).includes(normalizeSearchText(q)))
          const matchBranch = filters.branch === 'all' || m.branch === filters.branch
          const matchGender = filters.gender === 'all' || m.gender === filters.gender
          const matchAlive =
            filters.alive === 'all' ||
            (filters.alive === 'alive' ? m.isAlive : !m.isAlive)
          const matchGen = genFilter === null || m.generation === genFilter
          return matchSearch && matchBranch && matchGender && matchAlive && matchGen
        })
        .map((m) => m.id)
    )
  }, [search, filters, genFilter, liveMembers])

  // Path from highlighted member — ancestor chain or descendant subtree
  const pathIds = useMemo(() => {
    if (!highlightedId) return new Set()
    if (highlightMode === 'descendant') return getDescendants(highlightedId, liveMembers)
    return getPathToRoot(highlightedId, liveMembers)
  }, [highlightedId, highlightMode, liveMembers])

  const isFiltering = activeIds !== null
  const matchCount = activeIds?.size ?? liveMembers.length
  const branchFocusActive = focusBranch && pathIds.size > 0
  const highlightedMember = useMemo(
    () => liveMembers.find((member) => member.id === highlightedId) ?? null,
    [highlightedId, liveMembers],
  )
  const lineageTrail = useMemo(
    () => (highlightedId ? getLineageTrail(highlightedId, liveMembers) : []),
    [highlightedId, liveMembers],
  )
  const focusTone = highlightMode === 'descendant' ? '#4ADE80' : '#FCD34D'
  const focusLabel = highlightMode === 'descendant' ? 'nhánh hậu duệ' : 'nhánh tổ tiên'
  const compareSelectionCount = Number(Boolean(compareM1)) + Number(Boolean(compareM2))
  const activeInspectorTab = isElderMode && inspectorTab === 'compare' ? 'search' : inspectorTab

  const openInspectorTab = useCallback((tabId, expand = true) => {
    setInspectorTab(tabId)
    if (!isWideLayout && expand) setIsInspectorOpen(true)
  }, [isWideLayout])

  const handleCompareToggle = useCallback(() => {
    if (isElderMode) return
    setInspectorTab('compare')
    if (!compareMode && !isWideLayout) setIsInspectorOpen(true)
    toggleCompareMode()
  }, [compareMode, isWideLayout, isElderMode, toggleCompareMode])

  const handleSearch = useCallback((query) => {
    setInspectorTab('search')
    setSearch(query)
    if (!query.trim()) {
      setHighlightedId(null)
      setFocusBranch(false)
      return
    }

    const found = liveMembers.find(
      (m) =>
        normalizeSearchText(m.fullName).includes(normalizeSearchText(query)) ||
        normalizeSearchText(m.nickname).includes(normalizeSearchText(query))
    )
    setHighlightedId(found?.id || null)
    if (found && !isWideLayout) setIsInspectorOpen(true)
  }, [isWideLayout, liveMembers])

  const handleFilterChange = (key, value) => {
    setInspectorTab('search')
    setFilters((f) => ({ ...f, [key]: value }))
    setHighlightedId(null)
    setFocusBranch(false)
  }

  const resetAll = () => {
    setInspectorTab('search')
    setSearch('')
    setFilters({ branch: 'all', gender: 'all', alive: 'all' })
    setGenFilter(null)
    setHighlightedId(null)
    setFocusBranch(false)
  }

  const handleFocusMode = useCallback((mode) => {
    if (!highlightedId) return
    setInspectorTab('focus')
    setHighlightMode(mode)
    setFocusBranch(true)
    if (!isWideLayout) setIsInspectorOpen(true)
  }, [highlightedId, isWideLayout, setHighlightMode])

  const openProfileFromHighlight = useCallback(() => {
    if (!highlightedMember) return
    setSelectedMember(highlightedMember)
  }, [highlightedMember, setSelectedMember])

  // Merge filter/path/compare state into node data
  const displayNodes = useMemo(
    () =>
      nodes.map((n) => {
        const id = n.id
        const onPath = pathIds.has(id)
        const onComparePath = comparePathIds.has(id)
        const compareSlot = id === compareM1?.id ? 1 : id === compareM2?.id ? 2 : 0
        const highlighted = id === highlightedId
        const dimmed = (
          isFiltering && !activeIds.has(id) && !onPath && !onComparePath && compareSlot === 0
        ) || (
            branchFocusActive && !onPath && !onComparePath && compareSlot === 0
          )
        return {
          ...n,
          data: {
            ...n.data,
            isDimmed: dimmed,
            isOnPath: onPath,
            isHighlighted: highlighted,
            isOnComparePath: onComparePath,
            compareSlot,
            isElderMode,
          },
        }
      }),
    [nodes, activeIds, pathIds, comparePathIds, highlightedId, isFiltering, compareM1, compareM2, branchFocusActive, isElderMode]
  )

  // Merge filter/path/compare state into edge styles
  const displayEdges = useMemo(
    () =>
      edges.map((e) => {
        const onPath = pathIds.has(e.source) && pathIds.has(e.target)
        const onComparePath = comparePathIds.has(e.source) && comparePathIds.has(e.target)
        const dimEdge =
          (
            isFiltering &&
            !activeIds?.has(e.source) &&
            !activeIds?.has(e.target) &&
            !onPath &&
            !onComparePath
          ) || (
            branchFocusActive && !onPath && !onComparePath
          )
        const isMarriage = e.data?.relationshipType === 'marriage'
        const lineageStroke = highlightMode === 'descendant' ? '#4ADE80' : '#FCD34D'

        // Pulse wave overlay — highest priority visual
        if (!shouldReduceMotion && pulseEdgeMap.has(e.id)) {
          const delay = pulseEdgeMap.get(e.id)
          return {
            ...e,
            className: 'edge-blood-pulse',
            animated: false,
            style: {
              ...e.style,
              // CSS custom property read by the .edge-blood-pulse CSS rule
              '--pulse-delay': `${delay}s`,
            },
          }
        }

        return {
          ...e,
          animated: shouldReduceMotion ? false : (onPath && !isMarriage) || (onComparePath && !isMarriage),
          style: {
            ...e.style,
            stroke: onComparePath
              ? (isMarriage ? '#F472B6' : '#A855F7')
              : onPath
                ? (isMarriage ? '#F472B6' : lineageStroke)
                : e.style?.stroke,
            strokeWidth: onComparePath ? 4 : onPath ? (branchFocusActive ? 4.5 : 3.5) : e.style?.strokeWidth,
            opacity: dimEdge ? (branchFocusActive ? 0.03 : 0.04) : (onPath || onComparePath) ? 1 : isFiltering ? 0.2 : 1,
            filter: onComparePath
              ? 'drop-shadow(0 0 10px rgba(168,85,247,0.52))'
              : onPath
                ? `drop-shadow(0 0 10px ${highlightMode === 'descendant' ? 'rgba(74,222,128,0.45)' : 'rgba(252,211,77,0.48)'})`
                : e.style?.filter,
          },
        }
      }),
    [edges, pathIds, comparePathIds, activeIds, isFiltering, pulseEdgeMap, branchFocusActive, highlightMode, shouldReduceMotion]
  )

  const onNodeClick = useCallback(
    (_, node) => {
      if (compareMode) {
        setInspectorTab('compare')
        cycleCompareMember(node.data.member)
      } else {
        setSelectedMember(node.data.member)
      }
      setHighlightedId(node.id)
      if (compareMode && !isWideLayout) setIsInspectorOpen(true)
      // Fire pulse wave flowing down through all descendants
      if (!shouldReduceMotion) triggerPulse(node.id)
    },
    [setSelectedMember, compareMode, cycleCompareMember, triggerPulse, isWideLayout, shouldReduceMotion]
  )

  const availableInspectorTabs = isElderMode
    ? INSPECTOR_TABS.filter((tab) => ELDERLY_TABS.includes(tab.id))
    : INSPECTOR_TABS

  const elderlyResultActions = highlightedMember ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: 16, borderRadius: 16, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(148,163,184,0.18)' }}>
        <p style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 700, margin: 0 }}>{highlightedMember.fullName}</p>
        <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 6, marginBottom: 0, lineHeight: 1.6 }}>
          Đời {highlightedMember.generation} · {highlightedMember.branch ? `Chi ${highlightedMember.branch}` : 'Chưa gán chi'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isWideLayout ? 'repeat(3, minmax(0, 1fr))' : '1fr', gap: 10 }}>
        <button
          type="button"
          onClick={openProfileFromHighlight}
          style={{
            padding: '12px 14px',
            borderRadius: 16,
            background: 'rgba(56,189,248,0.14)',
            border: '1px solid rgba(56,189,248,0.26)',
            color: '#E0F2FE',
            fontSize: 14,
            fontWeight: 700,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          Xem ảnh và hồ sơ
        </button>

        <button
          type="button"
          onClick={() => handleFocusMode('ancestor')}
          style={{
            padding: '12px 14px',
            borderRadius: 16,
            background: 'rgba(252,211,77,0.14)',
            border: '1px solid rgba(252,211,77,0.26)',
            color: '#FDE68A',
            fontSize: 14,
            fontWeight: 700,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          Xem nhánh tổ tiên
        </button>

        <button
          type="button"
          onClick={() => handleFocusMode('descendant')}
          style={{
            padding: '12px 14px',
            borderRadius: 16,
            background: 'rgba(74,222,128,0.14)',
            border: '1px solid rgba(74,222,128,0.26)',
            color: '#86EFAC',
            fontSize: 14,
            fontWeight: 700,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          Xem nhánh hậu duệ
        </button>
      </div>
    </div>
  ) : null

  const searchTabContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <InspectorSection
        eyebrow="Tìm kiếm"
        title={isElderMode ? 'Tìm đúng người rồi xem ảnh hoặc mở nhánh' : 'Tìm người rồi mở rộng dần theo đúng nhu cầu'}
        description={isElderMode
          ? 'Chế độ này chỉ giữ lại những bước dễ hiểu nhất: tìm người, mở ảnh hồ sơ và xem nhánh tổ tiên hoặc hậu duệ.'
          : 'Bắt đầu bằng search, sau đó mới bật filter và legend. Trạng thái tìm thấy luôn giữ ở cùng một bước.'}
        action={!isElderMode ? (
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              background: showFilters ? 'rgba(56,189,248,0.18)' : 'rgba(15,23,42,0.78)',
              border: showFilters ? '1px solid rgba(56,189,248,0.45)' : '1px solid rgba(148,163,184,0.2)',
              color: showFilters ? '#38BDF8' : '#CBD5E1',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {showFilters ? 'Ẩn lọc' : 'Mở lọc'}
          </button>
        ) : null}
        large={isElderMode}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isWideLayout && (
            <InspectorSearchField
              value={search}
              onChange={handleSearch}
              onClear={() => handleSearch('')}
              large={isElderMode}
            />
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {isFiltering && (
              <span style={{ padding: isElderMode ? '7px 12px' : '5px 10px', borderRadius: 999, background: 'rgba(56,189,248,0.14)', border: '1px solid rgba(56,189,248,0.28)', color: '#38BDF8', fontSize: isElderMode ? 13 : 11, fontWeight: 700 }}>
                {matchCount} thành viên khớp
              </span>
            )}
            {pathIds.size > 0 && (
              <button
                type="button"
                onClick={() => openInspectorTab('focus')}
                style={{ padding: isElderMode ? '7px 12px' : '5px 10px', borderRadius: 999, background: `${focusTone}18`, border: `1px solid ${focusTone}35`, color: focusTone, fontSize: isElderMode ? 13 : 11, fontWeight: 700, cursor: 'pointer' }}
              >
                {highlightMode === 'descendant' ? 'Hậu duệ' : 'Tổ tiên'} · {pathIds.size} người
              </button>
            )}
            {!isElderMode && comparePathIds.size > 0 && (
              <button
                type="button"
                onClick={() => openInspectorTab('compare')}
                style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(168,85,247,0.16)', border: '1px solid rgba(168,85,247,0.3)', color: '#C084FC', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                Kết nối quan hệ · {comparePathIds.size} người
              </button>
            )}
            {(pathIds.size > 0 || isFiltering) && (
              <button
                type="button"
                onClick={resetAll}
                style={{
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.22)',
                  color: '#F87171',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Reset context
              </button>
            )}
          </div>

          {isElderMode && elderlyResultActions}

          <AnimatePresence initial={false}>
            {!isElderMode && showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 2 }}>
                  <FilterGroup label="Nhánh họ" options={BRANCH_OPTS} value={filters.branch} onChange={(value) => handleFilterChange('branch', value)} color="#38BDF8" compact={isElderMode} />
                  <FilterGroup label="Giới tính" options={GENDER_OPTS} value={filters.gender} onChange={(value) => handleFilterChange('gender', value)} color="#C084FC" compact={isElderMode} />
                  <FilterGroup label="Trạng thái" options={ALIVE_OPTS} value={filters.alive} onChange={(value) => handleFilterChange('alive', value)} color="#4ADE80" compact={isElderMode} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </InspectorSection>

      {!isElderMode && (
        <GenerationLegend
          genStats={genStats}
          genFilter={genFilter}
          onToggle={handleGenToggle}
          reducedMotion={shouldReduceMotion}
        />
      )}
    </div>
  )

  const focusTabContent = (
    <InspectorSection
      eyebrow="Focus nhánh"
      title={isElderMode ? 'Xem riêng nhánh đang cần đọc' : 'Theo dõi huyết thống rồi cô lập đúng phần cần đọc'}
      description={highlightedMember
        ? isElderMode
          ? 'Chọn tổ tiên hoặc hậu duệ, rồi bật focus để phần còn lại của cây lùi xuống và dễ theo dõi hơn.'
          : 'Chuyển giữa tổ tiên và hậu duệ, sau đó bật focus để phần còn lại của cây lùi xuống.'
        : isElderMode
          ? 'Tìm tên hoặc bấm trực tiếp vào một người trên cây để chỉ giữ lại đúng nhánh cần trình chiếu.'
          : 'Chọn một node hoặc tìm tên ở bước đầu tiên để mở breadcrumb và điều khiển focus.'}
      large={isElderMode}
    >
      {highlightedMember ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: isElderMode ? 16 : 14, borderRadius: 14, background: 'rgba(15,23,42,0.78)', border: `1px solid ${focusTone}30` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <p style={{ color: '#F8FAFC', fontSize: isElderMode ? 18 : 15, fontWeight: 700, margin: 0 }}>{highlightedMember.fullName}</p>
                <p style={{ color: '#94A3B8', fontSize: isElderMode ? 14 : 12, marginTop: 4, marginBottom: 0 }}>
                  Đời {highlightedMember.generation} · {highlightedMember.branch ? `Chi ${highlightedMember.branch}` : 'Chưa gán chi'}
                </p>
              </div>
              <span style={{ padding: isElderMode ? '6px 12px' : '4px 10px', borderRadius: 999, background: `${focusTone}18`, border: `1px solid ${focusTone}35`, color: focusTone, fontSize: isElderMode ? 13 : 11, fontWeight: 700 }}>
                {branchFocusActive ? `Đang focus ${focusLabel}` : 'Đang theo dõi nhánh'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { id: 'ancestor', label: 'Xem tổ tiên', tone: '#FCD34D' },
              { id: 'descendant', label: 'Xem hậu duệ', tone: '#4ADE80' },
            ].map((option) => {
              const active = highlightMode === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleFocusMode(option.id)}
                  style={{
                    padding: isElderMode ? '10px 14px' : '8px 12px',
                    borderRadius: 999,
                    background: active ? `${option.tone}18` : 'rgba(15,23,42,0.78)',
                    border: active ? `1px solid ${option.tone}45` : '1px solid rgba(148,163,184,0.2)',
                    color: active ? option.tone : '#CBD5E1',
                    fontSize: isElderMode ? 13 : 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setFocusBranch((value) => !value)}
              style={{
                padding: isElderMode ? '10px 14px' : '8px 12px',
                borderRadius: 999,
                background: branchFocusActive ? `${focusTone}18` : 'rgba(15,23,42,0.78)',
                border: branchFocusActive ? `1px solid ${focusTone}45` : '1px solid rgba(148,163,184,0.2)',
                color: branchFocusActive ? focusTone : '#CBD5E1',
                fontSize: isElderMode ? 13 : 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {branchFocusActive ? 'Thoát focus nhánh' : 'Chỉ xem nhánh này'}
            </button>

            <button
              type="button"
              onClick={() => {
                setHighlightedId(null)
                setFocusBranch(false)
              }}
              style={{
                padding: isElderMode ? '10px 14px' : '8px 12px',
                borderRadius: 999,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#F87171',
                fontSize: isElderMode ? 13 : 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Bỏ highlight
            </button>
          </div>

          <LineageBreadcrumb trail={lineageTrail} highlightMode={highlightMode} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={() => openInspectorTab('search')}
            style={{
              alignSelf: 'flex-start',
              padding: isElderMode ? '10px 14px' : '8px 12px',
              borderRadius: 999,
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.28)',
              color: '#38BDF8',
              fontSize: isElderMode ? 13 : 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Quay lại bước tìm kiếm
          </button>
        </div>
      )}
    </InspectorSection>
  )

  const compareTabContent = compareMode ? (
    <ComparePanel layout="embedded" />
  ) : (
    <InspectorSection
      eyebrow="So sánh quan hệ"
      title="Chọn 2 người để thấy đường nối và cách xưng hô"
      description="Compare mode được tách thành một bước riêng để canvas bớt nhiễu và người dùng chỉ mở khi thật sự cần."
      action={(
        <button
          type="button"
          onClick={handleCompareToggle}
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            background: 'rgba(168,85,247,0.18)',
            border: '1px solid rgba(168,85,247,0.45)',
            color: '#C084FC',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Bật compare
        </button>
      )}
    >
      <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.7 }}>
        Click hai node bất kỳ hoặc chọn từ dropdown để so sánh. Đường huyết thống giữa hai người sẽ sáng rõ trên canvas thay vì phải đọc nhiều legend nổi.
      </div>
    </InspectorSection>
  )

  const inspectorTabBadges = {
    search: isFiltering ? `${matchCount}` : genFilter !== null ? `Đời ${genFilter}` : null,
    focus: branchFocusActive ? 'Focus' : highlightedMember ? '1' : null,
    compare: isElderMode ? null : compareMode ? `${compareSelectionCount}/2` : null,
  }

  const activeInspectorContent = activeInspectorTab === 'focus'
    ? focusTabContent
    : activeInspectorTab === 'compare'
      ? compareTabContent
      : searchTabContent

  const inspectorContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {availableInspectorTabs.map((tab) => (
            <InspectorTabButton
              key={tab.id}
              tab={tab}
              active={activeInspectorTab === tab.id}
              badge={inspectorTabBadges[tab.id]}
              onClick={() => openInspectorTab(tab.id, false)}
              large={isElderMode}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
        {activeInspectorContent}
      </div>
    </div>
  )

  const canvasHeight = 'calc(100vh - 80px)'

  return (
    <div className="relative w-full xl:grid xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-5">
      {isWideLayout && (
        <aside style={{ height: canvasHeight }}>
          <div
            style={{
              height: '100%',
              borderRadius: 28,
              background: 'linear-gradient(180deg, rgba(8,14,28,0.98), rgba(8,14,28,0.92))',
              border: '1px solid rgba(148,163,184,0.16)',
              boxShadow: '0 22px 50px rgba(0,0,0,0.24)',
              padding: isElderMode ? 22 : 18,
              overflow: 'auto',
            }}
          >
            {inspectorContent}
          </div>
        </aside>
      )}

      <div
        className="relative overflow-hidden rounded-[28px] border border-ivory/10 bg-night xl:order-2"
        style={{ height: canvasHeight, background: '#0B1120' }}
      >
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onInit={(instance) => { reactFlowRef.current = instance }}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: isElderMode ? 0.16 : 0.12, maxZoom: isElderMode ? 1.12 : 1.0 }}
          minZoom={0.15}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#0B1120' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={32} size={1.5} color="rgba(148,163,184,0.1)" />
          {!isElderMode && (
            <Controls
              position={isWideLayout ? 'bottom-right' : 'top-right'}
              showInteractive={false}
              style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.2)' }}
            />
          )}
          {isWideLayout && !isElderMode && (
            <MiniMap
              nodeColor={(n) => {
                if (n.data?.isDimmed) return '#1A2335'
                if (n.data?.isOnPath) return highlightMode === 'descendant' ? '#4ADE80' : '#FCD34D'
                const gen = n.data?.member?.generation
                return ({ 1: '#F97316', 2: '#3B82F6', 3: '#4ADE80', 4: '#A855F7', 5: '#FCD34D' })[gen] || '#64748B'
              }}
              maskColor="rgba(11,17,32,0.75)"
              position="bottom-left"
              style={{ width: 180, height: 110, background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.2)' }}
            />
          )}
        </ReactFlow>

        {!isWideLayout && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-4">
            <div className="pointer-events-auto mx-auto w-full max-w-2xl">
              <div
                style={{
                  borderRadius: 24,
                  border: '1px solid rgba(148,163,184,0.18)',
                  background: 'rgba(8,14,28,0.92)',
                  boxShadow: '0 22px 48px rgba(0,0,0,0.34)',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <p style={{ color: '#64748B', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>
                        {isElderMode ? 'Chế độ trình chiếu' : 'Điều hướng nhanh'}
                      </p>
                      <p style={{ color: '#F8FAFC', fontSize: isElderMode ? 18 : 15, fontWeight: 700, margin: 0 }}>
                        {isElderMode ? 'Chỉ giữ lại tìm người, xem nhánh và mở ảnh hồ sơ' : 'Search trước, mở bước sâu hơn khi cần'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInspectorOpen((value) => !value)}
                      style={{
                        padding: isElderMode ? '9px 12px' : '7px 10px',
                        borderRadius: 999,
                        background: 'rgba(15,23,42,0.74)',
                        border: '1px solid rgba(148,163,184,0.2)',
                        color: '#CBD5E1',
                        fontSize: isElderMode ? 13 : 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {isInspectorOpen ? 'Thu gọn' : 'Mở thêm'}
                    </button>
                  </div>

                  <InspectorSearchField
                    value={search}
                    onChange={handleSearch}
                    onClear={() => handleSearch('')}
                    large={isElderMode}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: isElderMode ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                    <MobileQuickAction
                      icon={HiSearch}
                      label={isElderMode ? 'Gia phả' : 'Bộ lọc'}
                      detail={isElderMode ? 'Quay về bước tìm người' : isFiltering ? `${matchCount} khớp` : 'Mở lọc & chú giải'}
                      tone="#38BDF8"
                      onClick={() => openInspectorTab('search')}
                      large={isElderMode}
                    />
                    <MobileQuickAction
                      icon={HiFilter}
                      label={isElderMode ? 'Nhánh họ' : 'Focus'}
                      detail={branchFocusActive ? focusLabel : highlightedMember ? highlightedMember.fullName : 'Theo dõi nhánh'}
                      tone={focusTone}
                      onClick={() => openInspectorTab('focus')}
                      large={isElderMode}
                    />
                    {!isElderMode && (
                      <MobileQuickAction
                        icon={HiSwitchHorizontal}
                        label="So sánh"
                        detail={compareMode ? `Đã chọn ${compareSelectionCount}/2` : 'Quan hệ & xưng hô'}
                        tone="#C084FC"
                        onClick={() => openInspectorTab('compare')}
                      />
                    )}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isInspectorOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: 18 }}
                      animate={{ opacity: 1, height: 'min(72vh, 680px)', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 18 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 16px 16px', overflowY: 'auto', height: '100%' }}>
                        <div style={{ paddingTop: 2, display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                          {availableInspectorTabs.map((tab) => (
                            <InspectorTabButton
                              key={tab.id}
                              tab={tab}
                              active={activeInspectorTab === tab.id}
                              badge={inspectorTabBadges[tab.id]}
                              onClick={() => openInspectorTab(tab.id)}
                              large={isElderMode}
                            />
                          ))}
                        </div>
                        {activeInspectorContent}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        <MemberProfileModal />
        <AdminToolbar />
      </div>
    </div>
  )
}

export default FamilyTreeVisualization