import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlus, HiClipboardCopy, HiCheck, HiPencil, HiTrash, HiRefresh } from 'react-icons/hi'
import { usePlacesStore } from '@/stores/placesStore'
import { useMembersStore } from '@/stores/membersStore'
import AdminPasswordGate from '@/features/admin/AdminPasswordGate'
import PlaceFormModal, { PLACE_TYPES } from './PlaceFormModal'

// ── SVG Vietnam map constants ───────────────────────────────
const SVG_W = 180
const SVG_H = 480

// Simplified Vietnam outline path (viewBox 0 0 180 480)
const VIETNAM_PATH = `
  M 118,10 L 148,32
  C 150,52 148,72 142,90
  L 138,112
  C 134,126 128,138 126,152
  C 130,164 136,176 134,190
  C 136,202 140,213 138,225
  C 134,237 127,247 124,260
  C 124,272 126,284 124,296
  C 122,309 116,321 110,333
  C 104,345 96,355 84,365
  C 72,375 56,387 42,401
  C 34,413 28,425 26,443
  L 40,435
  C 50,421 56,407 58,393
  C 60,379 60,365 62,351
  C 64,337 66,323 68,307
  C 70,291 72,275 74,259
  C 76,243 78,227 76,211
  C 74,195 72,179 74,163
  C 76,147 78,131 78,115
  C 78,99  76,83  70,67
  C 66,51  64,35  74,21
  L 92,12 Z
`

// Approximate positions of major cities for reference labels
const CITY_MARKERS = [
  { name: 'Hà Nội', x: 100, y: 88 },
  { name: 'Huế', x: 132, y: 195 },
  { name: 'Đà Nẵng', x: 136, y: 206 },
  { name: 'TP.HCM', x: 92, y: 352 },
  { name: 'Cần Thơ', x: 75, y: 398 },
]

// ── Type filter options ─────────────────────────────────────
const TYPE_FILTER_OPTS = [
  { value: 'all', label: 'Tất cả' },
  ...PLACE_TYPES.map((t) => ({ value: t.value, label: t.label, icon: t.icon })),
]

const typeIcon = (type) => PLACE_TYPES.find((t) => t.value === type)?.icon ?? '📍'
const typeColor = (type) => PLACE_TYPES.find((t) => t.value === type)?.color ?? '#94A3B8'
const typeLabel = (type) => PLACE_TYPES.find((t) => t.value === type)?.label ?? type

// ── Individual location card ────────────────────────────────
const PlaceCard = ({ place, isSelected, onClick, isAdmin, onEdit, onDelete, onReset, isModified }) => {
  const color = place.color || typeColor(place.type)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        background: isSelected ? `${color}12` : 'rgba(15,23,42,0.6)',
        border: `1.5px solid ${isSelected ? color + '60' : 'rgba(148,163,184,0.14)'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      {isModified && (
        <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#FCD34D', boxShadow: '0 0 4px #FCD34D' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {typeIcon(place.type)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', margin: '0 0 2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {place.name}
          </p>
          <p style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>
            {typeLabel(place.type)} · {place.province}
          </p>
          {place.year && (
            <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>Từ năm {place.year}</p>
          )}
          {place.members?.length > 0 && (
            <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{place.members.length} thành viên liên quan</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {place.description && (
              <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                {place.description}
              </p>
            )}
            {place.note && (
              <p style={{ fontSize: 11, color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
                📌 {place.note}
              </p>
            )}
            {isAdmin && (
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <button onClick={(e) => { e.stopPropagation(); onEdit(place) }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38BDF8', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  <HiPencil size={12} /> Sửa
                </button>
                {isModified && (
                  <button onClick={(e) => { e.stopPropagation(); onReset(place.id) }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)', color: '#FCD34D', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                    <HiRefresh size={12} /> Khôi phục
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onDelete(place.id) }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                  <HiTrash size={12} /> Xóa
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main HeritageMap ────────────────────────────────────────
const HeritageMap = () => {
  const { places, movePlacePin, deletePlace, resetPlace, isModified, exportJSON, overrides } = usePlacesStore()
  const { isAdminUnlocked } = useMembersStore()

  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [dragPos, setDragPos] = useState(null)
  const [showPwGate, setShowPwGate] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const svgRef = useRef(null)

  const visiblePlaces = places.filter((p) => {
    if (p.hidden) return false
    return typeFilter === 'all' || p.type === typeFilter
  })

  // ── Drag ───────────────────────────────────────────────
  const getSvgCoords = useCallback((clientX, clientY) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: Math.max(6, Math.min(SVG_W - 6, ((clientX - rect.left) / rect.width) * SVG_W)),
      y: Math.max(6, Math.min(SVG_H - 6, ((clientY - rect.top) / rect.height) * SVG_H)),
    }
  }, [])

  const handlePinMouseDown = useCallback((e, placeId) => {
    if (!isAdminUnlocked) return
    e.stopPropagation()
    e.preventDefault()
    setDraggingId(placeId)
    setDragPos(getSvgCoords(e.clientX, e.clientY))
  }, [isAdminUnlocked, getSvgCoords])

  useEffect(() => {
    if (!draggingId) return
    const onMove = (e) => { const p = getSvgCoords(e.clientX, e.clientY); if (p) setDragPos(p) }
    const onUp = (e) => {
      const p = getSvgCoords(e.clientX, e.clientY)
      if (p && draggingId) movePlacePin(draggingId, Math.round(p.x), Math.round(p.y))
      setDraggingId(null)
      setDragPos(null)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [draggingId, getSvgCoords, movePlacePin])

  // ── Admin actions ──────────────────────────────────────
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(exportJSON()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  const handleEdit = (place) => { setEditingPlace(place); setShowForm(true) }

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      deletePlace(id)
      setConfirmDelete(null)
      if (selectedId === id) setSelectedId(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const getPinPos = (place) =>
    draggingId === place.id && dragPos ? dragPos : { x: place.svgX, y: place.svgY }

  const modifiedCount = Object.keys(overrides).length

  return (
    <div>
      {/* ── Admin toolbar ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {!isAdminUnlocked ? (
          <button onClick={() => setShowPwGate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.2)', color: '#64748B', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            🔒 Đăng nhập quản trị
          </button>
        ) : (
          <>
            <span style={{ fontSize: 11, color: '#4ADE80', fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
              🔓 Quản trị — kéo ghim để di chuyển
            </span>
            <button onClick={() => { setEditingPlace(null); setShowForm(true) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.4)', color: '#FB923C', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
              <HiPlus size={14} /> Thêm địa điểm
            </button>
            <button onClick={handleCopyJSON} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(148,163,184,0.08)', border: copied ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(148,163,184,0.2)', color: copied ? '#4ADE80' : '#94A3B8', fontSize: 12, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
              {copied ? <HiCheck size={14} /> : <HiClipboardCopy size={14} />}
              {copied ? 'Đã copy!' : 'Copy JSON'}
              {modifiedCount > 0 && !copied && (
                <span style={{ background: '#FCD34D', color: '#0F172A', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>{modifiedCount}</span>
              )}
            </button>
          </>
        )}
      </div>

      {/* ── Type filter chips ─────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
        {TYPE_FILTER_OPTS.map((opt) => {
          const active = typeFilter === opt.value
          const c = PLACE_TYPES.find((t) => t.value === opt.value)?.color ?? '#64748B'
          const count = opt.value === 'all'
            ? places.filter((p) => !p.hidden).length
            : places.filter((p) => p.type === opt.value && !p.hidden).length
          return (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 13px', borderRadius: 20, border: active ? `1.5px solid ${c}60` : '1.5px solid rgba(148,163,184,0.2)', background: active ? `${c}14` : 'rgba(15,23,42,0.5)', color: active ? c : '#64748B', fontSize: 12, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {opt.icon && <span style={{ fontSize: 13 }}>{opt.icon}</span>}
              {opt.label}
              <span style={{ fontSize: 10, fontWeight: 700, color: active ? c : '#475569', background: active ? `${c}20` : 'rgba(148,163,184,0.1)', borderRadius: 8, padding: '0 5px' }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Main grid: SVG map + list ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.45fr', gap: 28, alignItems: 'start' }}>

        {/* SVG Map */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>
            Bản đồ phân bổ
            {isAdminUnlocked && <span style={{ marginLeft: 6, color: '#FB923C', fontSize: 9 }}>— kéo ghim để di chuyển</span>}
          </p>

          <div style={{ background: 'rgba(8,18,38,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 14, padding: 10 }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              style={{ width: '100%', height: 'auto', display: 'block', cursor: draggingId ? 'grabbing' : 'default', userSelect: 'none' }}
            >
              {/* Ocean bg */}
              <rect width={SVG_W} height={SVG_H} fill="rgba(6,18,42,0.8)" rx={8} />

              {/* Vietnam land fill */}
              <path d={VIETNAM_PATH} fill="rgba(22,50,35,0.75)" stroke="rgba(74,222,128,0.22)" strokeWidth={1} />

              {/* City reference dots */}
              {CITY_MARKERS.map((c) => (
                <g key={c.name}>
                  <circle cx={c.x} cy={c.y} r={1.5} fill="rgba(148,163,184,0.25)" />
                  <text x={c.x + 4} y={c.y + 3.5} fontSize={6} fill="rgba(148,163,184,0.28)" style={{ pointerEvents: 'none' }}>
                    {c.name}
                  </text>
                </g>
              ))}

              {/* Place pins */}
              {visiblePlaces.map((place) => {
                const pos = getPinPos(place)
                const color = place.color || typeColor(place.type)
                const isSel = selectedId === place.id
                const isDrag = draggingId === place.id

                return (
                  <g
                    key={place.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: isAdminUnlocked ? (isDrag ? 'grabbing' : 'grab') : 'pointer' }}
                    onMouseDown={(e) => handlePinMouseDown(e, place.id)}
                    onClick={() => !isDrag && setSelectedId(selectedId === place.id ? null : place.id)}
                  >
                    {isSel && (
                      <circle r={10} fill="none" stroke={color} strokeWidth={1} opacity={0}>
                        <animate attributeName="r" values="7;15;7" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.55;0;0.55" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <ellipse cx={0.5} cy={2} rx={5} ry={2.5} fill="rgba(0,0,0,0.45)" />
                    <circle r={isSel ? 8.5 : 6.5} fill={color} stroke={isSel ? '#fff' : `${color}70`} strokeWidth={isSel ? 1.5 : 1} opacity={isDrag ? 0.8 : 1} style={{ transition: 'r 0.15s' }} />
                    {isAdminUnlocked && (
                      <circle r={2} fill="rgba(255,255,255,0.55)" style={{ pointerEvents: 'none' }} />
                    )}
                  </g>
                )
              })}

              {/* Compass */}
              <g transform="translate(15,15)">
                <circle r={8} fill="rgba(11,17,32,0.7)" stroke="rgba(148,163,184,0.12)" />
                <text x={0} y={-4} textAnchor="middle" fontSize={6} fill="rgba(148,163,184,0.45)" fontWeight="700">N</text>
                <line x1={0} y1={-7} x2={0} y2={7} stroke="rgba(148,163,184,0.25)" strokeWidth={0.5} />
                <line x1={-7} y1={0} x2={7} y2={0} stroke="rgba(148,163,184,0.25)" strokeWidth={0.5} />
              </g>

              <text x={SVG_W / 2} y={SVG_H - 5} textAnchor="middle" fontSize={6.5} fill="rgba(148,163,184,0.18)">
                Dòng họ Lê Văn
              </text>
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
              {PLACE_TYPES.filter((t) => visiblePlaces.some((p) => p.type === t.value)).map((t) => (
                <span key={t.value} style={{ fontSize: 10, fontWeight: 600, color: t.color, background: `${t.color}12`, border: `1px solid ${t.color}28`, padding: '2px 8px', borderRadius: 10 }}>
                  {t.icon} {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Location list */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#475569', marginBottom: 10 }}>
            Danh sách địa điểm ({visiblePlaces.length})
          </p>

          {visiblePlaces.length === 0 ? (
            <p style={{ color: '#475569', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
              Không có địa điểm nào.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visiblePlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isSelected={selectedId === place.id}
                  onClick={() => setSelectedId(selectedId === place.id ? null : place.id)}
                  isAdmin={isAdminUnlocked}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReset={resetPlace}
                  isModified={isModified(place.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      <AdminPasswordGate
        isOpen={showPwGate}
        onClose={() => setShowPwGate(false)}
        onSuccess={() => setShowPwGate(false)}
      />
      <PlaceFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        editPlace={editingPlace}
      />
    </div>
  )
}

export default HeritageMap