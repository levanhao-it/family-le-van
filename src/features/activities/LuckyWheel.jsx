import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { familyMembers } from '@/data'
import { useAppStore } from '@/stores/appStore'

// ── Theme tokens ──────────────────────────────────────────────
const makeTheme = (isDark) => ({
  text: isDark ? 'rgba(250,244,232,0.8)' : 'rgba(44,36,31,0.85)',
  textSub: isDark ? 'rgba(250,244,232,0.5)' : 'rgba(44,36,31,0.55)',
  textMuted: isDark ? 'rgba(250,244,232,0.3)' : 'rgba(44,36,31,0.35)',
  textFaint: isDark ? 'rgba(250,244,232,0.15)' : 'rgba(44,36,31,0.2)',
  pillInactBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  pillInactBd: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)',
  pillInactTx: isDark ? 'rgba(214,185,140,0.4)' : 'rgba(100,65,20,0.55)',
  rowBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  rowBd: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
  trackBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
  divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
  gold: isDark ? '#C9A84C' : '#7A5B0A',
  goldFaint: isDark ? 'rgba(201,168,76,0.18)' : 'rgba(122,91,10,0.12)',
  goldBd: isDark ? 'rgba(201,168,76,0.5)' : 'rgba(122,91,10,0.4)',
  goldCtrl: isDark ? 'rgba(201,168,76,0.1)' : 'rgba(122,91,10,0.07)',
  goldCtrlBd: isDark ? 'rgba(201,168,76,0.25)' : 'rgba(122,91,10,0.25)',
  spinBg: isDark ? 'rgba(214,185,140,0.12)' : 'rgba(122,74,24,0.07)',
  spinBd: isDark ? 'rgba(214,185,140,0.4)' : 'rgba(122,74,24,0.35)',
  spinTx: isDark ? '#D6B98C' : '#7A4A18',
  badgeBg: isDark ? 'rgba(214,185,140,0.08)' : 'rgba(122,74,24,0.06)',
  badgeTx: isDark ? 'rgba(214,185,140,0.6)' : 'rgba(100,60,15,0.75)',
  badgeBd: isDark ? 'rgba(214,185,140,0.15)' : 'rgba(122,74,24,0.2)',
  histHdr: isDark ? 'rgba(214,185,140,0.5)' : 'rgba(100,60,15,0.6)',
  histCount: isDark ? 'rgba(214,185,140,0.35)' : 'rgba(100,60,15,0.45)',
  emptySlotBg: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)',
  emptySlotBd: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
  emptyNumBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  emptyNumBd: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  emptyNumTx: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
})

const PALETTE = [
  { color: '#C9A84C', bg: '#2A2210' },
  { color: '#4A7C6F', bg: '#102820' },
  { color: '#C0392B', bg: '#2A1510' },
  { color: '#6B8CAE', bg: '#10182A' },
  { color: '#8C6A43', bg: '#2C241F' },
  { color: '#5A9080', bg: '#102818' },
  { color: '#D6B98C', bg: '#282010' },
  { color: '#7B5EA7', bg: '#1A1028' },
]

const SPIN_DURATION = 4500
const MIN_SPINS = 6

const BRANCH_LABEL = { 'sy': 'Chi Sỹ', 'nhut': 'Chi Nhứt', 'ly': 'Chi Lý', 'thong': 'Chi Thông' }

// Canvas-based firework confetti (no external lib)
const useFireworks = () => {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  const fire = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = PALETTE.map((p) => p.color)
    // 3 burst origins
    const origins = [
      { ox: 0.5, oy: 0.42 },
      { ox: 0.3, oy: 0.52 },
      { ox: 0.7, oy: 0.52 },
    ]
    const particles = origins.flatMap(({ ox, oy }, bi) =>
      Array.from({ length: 60 }, () => {
        const speed = 5 + Math.random() * 10
        const angle = Math.random() * 2 * Math.PI
        return {
          x: canvas.width * ox,
          y: canvas.height * oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          w: 5 + Math.random() * 7,
          h: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          rot: Math.random() * 360,
          rotV: (Math.random() - 0.5) * 15,
          gravity: 0.25 + bi * 0.05,
          delay: bi * 90,
        }
      })
    )

    let startTs = null
    const draw = (ts) => {
      if (!startTs) startTs = ts
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        if (ts - startTs < p.delay) { alive = true; continue }
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.rot += p.rotV
        p.alpha -= 0.013
        if (p.alpha <= 0) continue
        alive = true
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive) rafRef.current = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  // cleanup on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  return { canvasRef, fire }
}

const FilterPill = ({ active, onClick, children, disabled, T }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-3 py-1 text-xs font-body tracking-[0.15em] rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
    style={{
      background: active ? T.goldFaint : T.pillInactBg,
      border: active ? `1px solid ${T.goldBd}` : `1px solid ${T.pillInactBd}`,
      color: active ? T.gold : T.pillInactTx,
    }}
  >
    {children}
  </button>
)

const LuckyWheel = () => {
  const isDark = useAppStore((s) => s.isDark)
  const T = makeTheme(isDark)
  const livingMembers = useMemo(() => familyMembers.filter((m) => m.isAlive), [])

  const filterOptions = useMemo(
    () => ({
      generations: [...new Set(livingMembers.map((m) => m.generation))].sort((a, b) => a - b),
      branches: [...new Set(livingMembers.map((m) => m.branch).filter(Boolean))].sort(),
    }),
    [livingMembers]
  )

  const [filter, setFilter] = useState({ generation: 'all', branch: 'all', gender: 'all' })
  const [multiPickTarget, setMultiPickTarget] = useState(1)

  const filteredMembers = useMemo(
    () =>
      livingMembers.filter((m) => {
        if (filter.generation !== 'all' && m.generation !== filter.generation) return false
        if (filter.branch !== 'all' && m.branch !== filter.branch) return false
        if (filter.gender !== 'all' && m.gender !== filter.gender) return false
        return true
      }),
    [livingMembers, filter]
  )

  const segments = useMemo(
    () => filteredMembers.map((member, i) => ({ member, ...PALETTE[i % PALETTE.length] })),
    [filteredMembers]
  )

  const [spinning, setSpinning] = useState(false)
  const rotationMV = useMotionValue(0)
  const [result, setResult] = useState(null)
  const [excludedIds, setExcludedIds] = useState(new Set())
  const [history, setHistory] = useState([])
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [revealName, setRevealName] = useState('')
  const [showMeta, setShowMeta] = useState(false)
  const { canvasRef, fire: fireConfetti } = useFireworks()

  const segmentAngle = 360 / Math.max(segments.length, 1)

  const availableSegments = useMemo(
    () => segments.filter((s) => !excludedIds.has(s.member.id)),
    [segments, excludedIds]
  )

  const isMultiPick = multiPickTarget > 1
  const groupComplete = isMultiPick && history.length >= multiPickTarget

  // Poll rotationMV to highlight segment under pointer
  useEffect(() => {
    if (!spinning) { setHighlightIdx(-1); return }
    const id = setInterval(() => {
      const latest = rotationMV.get()
      const normalized = ((360 - (latest % 360)) % 360 + 360) % 360
      const idx = Math.floor(normalized / segmentAngle) % segments.length
      setHighlightIdx((prev) => (prev === idx ? prev : idx))
    }, 50)
    return () => clearInterval(id)
  }, [spinning, rotationMV, segmentAngle, segments.length])

  // Typewriter + firework on result
  useEffect(() => {
    if (!result) { setRevealName(''); setShowMeta(false); return }
    setRevealName('')
    setShowMeta(false)
    fireConfetti()
    const fullName = result.member.fullName
    let i = 0
    const timer = setInterval(() => {
      i++
      setRevealName(fullName.slice(0, i))
      if (i >= fullName.length) { clearInterval(timer); setTimeout(() => setShowMeta(true), 400) }
    }, 55)
    return () => clearInterval(timer)
  }, [result, fireConfetti])

  const spin = useCallback(() => {
    if (spinning || availableSegments.length === 0 || groupComplete) return
    setSpinning(true)
    setResult(null)

    const targetSeg = availableSegments[Math.floor(Math.random() * availableSegments.length)]
    const targetIdx = segments.indexOf(targetSeg)
    const desiredNormalized = targetIdx * segmentAngle + segmentAngle / 2
    const desiredMod = (360 - (desiredNormalized % 360)) % 360
    const extraSpins = MIN_SPINS + Math.floor(Math.random() * 4)
    const currentRot = rotationMV.get()
    const base = currentRot + extraSpins * 360
    let adj = desiredMod - (base % 360)
    if (adj < 0) adj += 360

    animate(rotationMV, base + adj, { duration: SPIN_DURATION / 1000, ease: [0.2, 0.05, 0.2, 1] })

    setTimeout(() => {
      setResult(targetSeg)
      setExcludedIds((prev) => new Set([...prev, targetSeg.member.id]))
      setHistory((prev) => [targetSeg, ...prev])
      setSpinning(false)
    }, SPIN_DURATION + 200)
  }, [spinning, availableSegments, segments, segmentAngle, rotationMV, groupComplete])

  const reset = useCallback(() => {
    setExcludedIds(new Set())
    setHistory([])
    setResult(null)
  }, [])

  const handleFilterChange = useCallback(
    (key, value) => {
      if (spinning) return
      setFilter((prev) => ({ ...prev, [key]: value }))
      setExcludedIds(new Set())
      setHistory([])
      setResult(null)
      rotationMV.set(0)
    },
    [spinning, rotationMV]
  )

  const adjustTarget = useCallback(
    (delta) => {
      if (spinning) return
      setMultiPickTarget((t) => Math.max(1, Math.min(20, t + delta)))
      reset()
    },
    [spinning, reset]
  )

  // Spin button label
  const spinLabel = spinning
    ? 'Đang quay...'
    : isMultiPick
      ? history.length === 0
        ? `Quay chọn nhóm ${multiPickTarget} người`
        : `Quay tiếp (${history.length}/${multiPickTarget})`
      : 'Quay vòng'

  return (
    <>
      {/* Full-screen firework canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }} />

      <div className="flex flex-col items-center gap-6 w-full">

        {/* ── Filter + MultiPick panel ── */}
        <div
          className="glass-card rounded-xl px-5 py-4 w-full max-w-xl flex flex-col gap-3"
          style={{ opacity: spinning ? 0.5 : 1, pointerEvents: spinning ? 'none' : 'auto', transition: 'opacity 0.3s' }}
        >
          {/* Generation filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-14 flex-shrink-0 font-body text-xs uppercase tracking-widest text-subtle">Thế hệ</span>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={filter.generation === 'all'} onClick={() => handleFilterChange('generation', 'all')} T={T}>Tất cả</FilterPill>
              {filterOptions.generations.map((g) => (
                <FilterPill key={g} active={filter.generation === g} onClick={() => handleFilterChange('generation', g)} T={T}>Thế Hệ {g}</FilterPill>
              ))}
            </div>
          </div>
          {/* Branch filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-14 flex-shrink-0 font-body text-xs uppercase tracking-widest text-subtle">Chi</span>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={filter.branch === 'all'} onClick={() => handleFilterChange('branch', 'all')} T={T}>Tất cả</FilterPill>
              {filterOptions.branches.map((b) => (
                <FilterPill key={b} active={filter.branch === b} onClick={() => handleFilterChange('branch', b)} T={T}>{BRANCH_LABEL[b] ?? b}</FilterPill>
              ))}
            </div>
          </div>
          {/* Gender filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-14 flex-shrink-0 font-body text-xs uppercase tracking-widest text-subtle">Giới</span>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={filter.gender === 'all'} onClick={() => handleFilterChange('gender', 'all')} T={T}>Tất cả</FilterPill>
              <FilterPill active={filter.gender === 'male'} onClick={() => handleFilterChange('gender', 'male')} T={T}>Nam</FilterPill>
              <FilterPill active={filter.gender === 'female'} onClick={() => handleFilterChange('gender', 'female')} T={T}>Nữ</FilterPill>
            </div>
          </div>
          {/* MultiPick control */}
          <div className="flex items-center gap-3 flex-wrap pt-2 mt-1" style={{ borderTop: `1px solid ${T.divider}` }}>
            <span className="w-14 flex-shrink-0 font-body text-xs uppercase tracking-widest text-subtle">Nhóm</span>
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-muted">Chọn</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustTarget(-1)}
                  disabled={multiPickTarget <= 1 || spinning}
                  className="w-6 h-6 rounded flex items-center justify-center text-sm transition-all disabled:opacity-30"
                  style={{ background: T.goldCtrl, border: `1px solid ${T.goldCtrlBd}`, color: T.gold }}
                >−</button>
                <span
                  className="w-8 text-center text-sm font-display"
                  style={{ color: isMultiPick ? T.gold : T.pillInactTx }}
                >{multiPickTarget}</span>
                <button
                  onClick={() => adjustTarget(1)}
                  disabled={multiPickTarget >= 20 || spinning}
                  className="w-6 h-6 rounded flex items-center justify-center text-sm transition-all disabled:opacity-30"
                  style={{ background: T.goldCtrl, border: `1px solid ${T.goldCtrlBd}`, color: T.gold }}
                >+</button>
              </div>
              <span className="font-body text-xs text-muted">người</span>
              {isMultiPick && (
                <AnimatePresence>
                  <motion.span
                    key={`${history.length}-${multiPickTarget}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-2.5 py-0.5 rounded-full text-xs font-body"
                    style={{
                      background: groupComplete ? 'rgba(74,124,111,0.2)' : 'rgba(201,168,76,0.12)',
                      border: groupComplete ? '1px solid rgba(74,124,111,0.5)' : '1px solid rgba(201,168,76,0.3)',
                      color: groupComplete ? '#4A7C6F' : '#C9A84C',
                    }}
                  >
                    {history.length}/{multiPickTarget} {groupComplete ? '✓ Đủ nhóm' : 'đã chọn'}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* ── Info bar ── */}
        <div className="flex items-center gap-4">
          <p className="font-body text-xs uppercase tracking-[0.25em] text-muted">
            <span style={{ color: T.gold }}>{availableSegments.length}</span>
            <span className="text-subtle"> / {segments.length} còn lại</span>
          </p>
          {excludedIds.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={reset}
              className="text-xs font-body tracking-[0.2em] uppercase px-3 py-1 rounded transition-all"
              style={{ border: '1px solid rgba(192,57,43,0.4)', color: 'rgba(192,57,43,0.7)', background: 'rgba(192,57,43,0.06)' }}
            >
              Reset tất cả
            </motion.button>
          )}
        </div>

        {/* ── Main area: wheel + optional side panel ── */}
        <div className={`flex flex-col ${isMultiPick && history.length > 0 ? 'xl:flex-row xl:items-start xl:gap-10' : ''} items-center gap-6 w-full`}>

          {/* Left: wheel + button + result */}
          <div className="flex flex-col items-center gap-6">
            {/* Wheel container */}
            <div className="relative" style={{ width: 400, height: 400 }}>
              {/* Pointer */}
              <div className="absolute left-1/2 -translate-x-1/2 z-20" style={{ top: -18 }}>
                <div
                  className="w-6 h-8"
                  style={{
                    clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                    background: '#C9A84C',
                    filter: spinning ? 'drop-shadow(0 0 14px rgba(201,168,76,1))' : 'drop-shadow(0 0 10px rgba(201,168,76,0.9))',
                    transition: 'filter 0.3s',
                  }}
                />
              </div>
              {/* Outer ring glow */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: '2px solid rgba(214,185,140,0.25)',
                  boxShadow: spinning
                    ? '0 0 48px rgba(214,185,140,0.35), inset 0 0 24px rgba(214,185,140,0.05)'
                    : '0 0 20px rgba(214,185,140,0.1)',
                  transition: 'box-shadow 0.5s',
                }}
              />
              {/* SVG Wheel */}
              <motion.svg width={400} height={400} viewBox="0 0 520 520" style={{ rotate: rotationMV }}>
                <defs>
                  <filter id="seg-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {segments.map((seg, i) => {
                  const startAngle = i * segmentAngle - 90
                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = ((startAngle + segmentAngle) * Math.PI) / 180
                  const cx = 260, cy = 260, r = 245
                  const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad)
                  const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad)
                  const largeArc = segmentAngle > 180 ? 1 : 0
                  const midAngle = startAngle + segmentAngle / 2
                  const isExcluded = excludedIds.has(seg.member.id)
                  const isHighlighted = highlightIdx === i && !isExcluded

                  return (
                    <g key={seg.member.id} opacity={isExcluded ? 0.28 : 1} filter={isHighlighted ? 'url(#seg-glow)' : undefined}>
                      <path
                        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={isExcluded ? '#1A1A1A' : isHighlighted ? '#3A2E18' : seg.bg}
                        stroke={isHighlighted ? 'rgba(201,168,76,0.9)' : isExcluded ? 'rgba(255,255,255,0.05)' : 'rgba(214,185,140,0.18)'}
                        strokeWidth={isHighlighted ? 2 : 0.8}
                      />
                      <text
                        transform={`translate(${cx}, ${cy}) rotate(${midAngle}) translate(144, 3.5)`}
                        textAnchor="middle"
                        fill={isExcluded ? '#555' : isHighlighted ? '#F5E09A' : seg.color}
                        fontSize={isHighlighted ? 8.5 : 7.5}
                        fontFamily="'Be Vietnam Pro', sans-serif"
                        fontWeight={700}
                        letterSpacing="0.3"
                        textDecoration={isExcluded ? 'line-through' : 'none'}
                      >
                        {seg.member.fullName}
                      </text>
                      {isExcluded && (
                        <text
                          transform={`translate(${cx}, ${cy}) rotate(${midAngle}) translate(220, 3.5)`}
                          textAnchor="middle" fill="rgba(192,57,43,0.55)" fontSize={8} fontFamily="system-ui"
                        >✓</text>
                      )}
                    </g>
                  )
                })}
                <circle cx={260} cy={260} r={44} fill="#1F1A17" stroke="rgba(214,185,140,0.35)" strokeWidth={2} cursor={"pointer"} onClick={spin} />
                <text x={260} y={265} textAnchor="middle" fill="#D6B98C" fontSize={13} fontFamily="Cinzel, serif" fontWeight={600} cursor={"pointer"} onClick={spin} >SPIN</text>
              </motion.svg>
            </div>

            {/* Spin / Reset button */}
            {availableSegments.length === 0 || groupComplete ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                <p className="font-body text-sm text-secondary">
                  {groupComplete ? `Đã chọn đủ ${multiPickTarget} người` : 'Tất cả thành viên đã được chọn'}
                </p>
                <div className="flex gap-3">
                  {groupComplete && isMultiPick && (
                    <button
                      onClick={() => { setMultiPickTarget((t) => t + 1) }}
                      className="px-6 py-2.5 font-display text-xs tracking-[0.2em] uppercase transition-all"
                      style={{ background: 'rgba(74,124,111,0.1)', border: '1px solid rgba(74,124,111,0.4)', color: 'rgba(74,124,111,0.9)' }}
                    >+ Thêm người</button>
                  )}
                  <button
                    onClick={reset}
                    className="px-6 py-2.5 font-display text-xs tracking-[0.2em] uppercase transition-all"
                    style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.4)', color: 'rgba(192,57,43,0.85)' }}
                  >Vòng mới</button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                onClick={spin}
                disabled={spinning}
                whileHover={!spinning ? { scale: 1.04 } : {}}
                whileTap={!spinning ? { scale: 0.96 } : {}}
                className="px-12 py-3.5 font-display text-sm tracking-[0.25em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: spinning ? 'rgba(214,185,140,0.05)' : 'rgba(214,185,140,0.12)',
                  border: '1px solid rgba(214,185,140,0.4)',
                  boxShadow: spinning ? 'none' : '0 0 24px rgba(214,185,140,0.15)',
                }}
              >{spinLabel}</motion.button>
            )}

            {/* Result card */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 32 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                  className="glass-card rounded-2xl p-7 text-center max-w-sm w-full relative overflow-hidden"
                  style={{ borderColor: `${result.color}50`, boxShadow: `0 0 32px ${result.color}18` }}
                >
                  {/* Badge */}
                  <div
                    className="inline-block px-4 py-1 rounded-full text-xs tracking-[0.3em] uppercase font-body mb-5"
                    style={{ background: `${result.color}18`, border: `1px solid ${result.color}40`, color: result.color }}
                  >
                    {isMultiPick ? `Người thứ ${history.length} / ${multiPickTarget}` : 'Người được chọn'}
                  </div>
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-display text-3xl"
                    style={{
                      background: `radial-gradient(circle at 40% 35%, ${result.color}30, ${result.color}08)`,
                      border: `2px solid ${result.color}60`,
                      color: result.color,
                      boxShadow: `0 0 28px ${result.color}40`,
                    }}
                  >{result.member.fullName.charAt(0)}</motion.div>
                  {/* Typewriter name */}
                  <p className="min-h-[1.75rem] font-heading text-xl font-semibold tracking-wide text-primary">
                    {revealName}
                    {revealName.length < result.member.fullName.length && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.45 }}
                        className="inline-block w-0.5 h-5 ml-0.5 align-middle rounded-sm"
                        style={{ background: result.color }}
                      />
                    )}
                  </p>
                  {/* Meta */}
                  <AnimatePresence>
                    {showMeta && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        {result.member.nickname && (
                          <p className="mt-1 font-body text-sm italic text-muted">"{result.member.nickname}"</p>
                        )}
                        <div className="flex items-center justify-center flex-wrap gap-3 mt-4">
                          <span className="px-2.5 py-0.5 rounded text-xs font-body" style={{ background: T.badgeBg, color: T.badgeTx, border: `1px solid ${T.badgeBd}` }}>
                            Thế hệ {result.member.generation}
                          </span>
                          {result.member.birthDate && (
                            <span className="px-2.5 py-0.5 rounded text-xs font-body" style={{ background: T.badgeBg, color: T.badgeTx, border: `1px solid ${T.badgeBd}` }}>
                              {new Date().getFullYear() - new Date(result.member.birthDate).getFullYear()} tuổi
                            </span>
                          )}
                          {result.member.occupation && (
                            <span className="px-2.5 py-0.5 rounded text-xs font-body" style={{ background: T.badgeBg, color: T.badgeTx, border: `1px solid ${T.badgeBd}` }}>
                              {result.member.occupation.split(',')[0]}
                            </span>
                          )}
                        </div>
                        <p className="mt-4 font-body text-xs tracking-wider text-subtle">
                          {!groupComplete && availableSegments.length > 0
                            ? isMultiPick
                              ? `Còn ${multiPickTarget - history.length} người cần chọn thêm`
                              : `Còn ${availableSegments.length} người chưa được chọn`
                            : groupComplete
                              ? 'Nhóm đã đầy đủ!'
                              : 'Tất cả đã được chọn'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: MultiPick group panel ── */}
          {isMultiPick && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full xl:w-72 flex-shrink-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.25em] uppercase font-body" style={{ color: T.histHdr }}>
                  Nhóm được chọn
                </p>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-display"
                  style={{
                    background: groupComplete ? 'rgba(74,124,111,0.15)' : T.goldCtrl,
                    color: groupComplete ? '#4A7C6F' : T.gold,
                    border: groupComplete ? '1px solid rgba(74,124,111,0.3)' : `1px solid ${T.goldCtrlBd}`,
                  }}
                >
                  {history.length} / {multiPickTarget}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: T.trackBg }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${(history.length / multiPickTarget) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  style={{ background: groupComplete ? 'linear-gradient(90deg,#4A7C6F,#5A9080)' : 'linear-gradient(90deg,#8C6A43,#C9A84C)' }}
                />
              </div>

              {/* Member cards */}
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {[...history].reverse().map((h, idx) => (
                    <motion.div
                      key={h.member.id}
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: idx === history.length - 1 ? `${h.color}0D` : T.rowBg,
                        border: idx === history.length - 1 ? `1px solid ${h.color}30` : `1px solid ${T.rowBd}`,
                        boxShadow: idx === history.length - 1 ? `0 0 16px ${h.color}12` : 'none',
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display flex-shrink-0"
                        style={{ background: `${h.color}18`, color: h.color, border: `1px solid ${h.color}35` }}
                      >
                        {history.length - idx}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-body text-sm text-primary">{h.member.fullName}</p>
                        {h.member.nickname && (
                          <p className="truncate font-body text-xs italic text-faint">{h.member.nickname}</p>
                        )}
                      </div>
                      <span className="flex-shrink-0 font-body text-xs text-subtle">TH{h.member.generation}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty slots */}
              {!groupComplete && (
                <div className="flex flex-col gap-2 mt-2">
                  {Array.from({ length: multiPickTarget - history.length }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: T.emptySlotBg, border: `1px dashed ${T.emptySlotBd}` }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                        style={{ background: T.emptyNumBg, border: `1px dashed ${T.emptyNumBd}`, color: T.emptyNumTx }}
                      >
                        {history.length + i + 1}
                      </span>
                      <span className="font-body text-xs italic text-subtle">Chưa chọn...</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ── History panel (single-pick mode only) ── */}
        {!isMultiPick && (
          <AnimatePresence>
            {history.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="w-full max-w-sm"
              >
                <p className="text-xs tracking-[0.25em] uppercase font-body mb-3" style={{ color: T.histCount }}>
                  Đã chọn ({history.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {history.map((h, idx) => (
                    <div key={h.member.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: T.rowBg, border: `1px solid ${T.rowBd}` }}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-display flex-shrink-0"
                        style={{ background: `${h.color}18`, color: h.color, border: `1px solid ${h.color}30` }}
                      >{history.length - idx}</span>
                      <span className="flex-1 font-body text-xs text-secondary">{h.member.fullName}</span>
                      <span className="font-body text-xs text-subtle">TH{h.member.generation}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </>
  )
}

export default LuckyWheel