import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'

// ── Theme tokens ──────────────────────────────────────────────
const makeTheme = (isDark) => ({
  text: isDark ? 'rgba(250,244,232,0.85)' : 'rgba(44,36,31,0.9)',
  textSub: isDark ? 'rgba(250,244,232,0.50)' : 'rgba(44,36,31,0.55)',
  textMuted: isDark ? 'rgba(250,244,232,0.35)' : 'rgba(44,36,31,0.38)',
  textFaint: isDark ? 'rgba(250,244,232,0.22)' : 'rgba(44,36,31,0.25)',
  panel: isDark ? 'rgba(45,34,24,0.75)' : 'rgba(255,251,243,0.92)',
  panelBorder: isDark ? 'rgba(232,201,154,0.12)' : 'rgba(122,74,24,0.18)',
  barBg: isDark ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.07)',
  bronze: isDark ? 'rgba(232,201,154,0.9)' : 'rgba(122,74,24,0.9)',
  svgText: isDark ? '#FAF4E8' : '#2C241F',
  svgSub: isDark ? 'rgba(250,244,232,0.45)' : 'rgba(44,36,31,0.45)',
})

// ── SVG arc helpers ───────────────────────────────────────────
const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const buildArcPath = (cx, cy, rIn, rOut, startDeg, endDeg) => {
  const s1 = polarToCartesian(cx, cy, rOut, startDeg)
  const e1 = polarToCartesian(cx, cy, rOut, endDeg)
  const s2 = polarToCartesian(cx, cy, rIn, endDeg)
  const e2 = polarToCartesian(cx, cy, rIn, startDeg)
  const lg = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s1.x},${s1.y} A ${rOut},${rOut} 0 ${lg} 1 ${e1.x},${e1.y} L ${s2.x},${s2.y} A ${rIn},${rIn} 0 ${lg} 0 ${e2.x},${e2.y} Z`
}

// ── Color maps ────────────────────────────────────────────────
const GEN_COLORS = { 1: '#F97316', 2: '#38BDF8', 3: '#4ADE80', 4: '#A855F7', 5: '#FCD34D' }
const GEN_LABELS = {
  1: 'TH I — Thủy tổ',
  2: 'TH II — Con',
  3: 'TH III — Cháu',
  4: 'TH IV — Chắt',
  5: 'TH V — Chút',
}
const BRANCH_COLORS = { main: '#F97316', sy: '#38BDF8', nhut: '#4ADE80', ly: '#A855F7', thong: '#FCD34D' }
const BRANCH_LABELS = { main: 'Thủy tổ', sy: 'Chi Sỹ', nhut: 'Chi Nhứt', ly: 'Chi Lý', thong: 'Chi Thông' }

// ── Age pyramid helpers ───────────────────────────────────────
const GEN_BIRTH_RANGES = { 1: [1920, 1940], 2: [1950, 1975], 3: [1975, 1995], 4: [1995, 2015], 5: [2010, 2022] }
const AGE_BRACKETS = ['90+', '80–89', '70–79', '60–69', '50–59', '40–49', '30–39', '20–29', '10–19', '0–9']
const toPercent = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0)

const getEstimatedAge = (m) => {
  const YEAR = 2026
  if (m.birthDate) {
    const y = parseInt(m.birthDate.slice(0, 4), 10)
    if (!isNaN(y)) return YEAR - y
  }
  const range = GEN_BIRTH_RANGES[m.generation] ?? [1980, 2000]
  const spread = range[1] - range[0]
  const hash = m.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return YEAR - (range[0] + (hash % spread))
}

const getBracketIdx = (age) => {
  if (age >= 90) return 0
  return Math.min(9, Math.floor((89 - Math.min(age, 89)) / 10) + 1)
}

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon, delay, T }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    style={{
      background: `linear-gradient(135deg, ${color}14, ${color}06)`,
      border: `1px solid ${color}35`,
      borderRadius: 14,
      padding: '20px 20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* accent bar top */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}80, transparent)`, borderRadius: '14px 14px 0 0' }} />
    <div style={{ color: color, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.8 }}>
      {label}
    </div>
    <div style={{ color: T.text, fontSize: 36, fontWeight: 800, lineHeight: 1.1, fontFamily: "'Cinzel', serif" }}>
      {value}
    </div>
    {sub && <div style={{ color: T.textMuted, fontSize: 11 }}>{sub}</div>}
  </motion.div>
)

// ── Chart panel wrapper ───────────────────────────────────────
const ChartPanel = ({ title, subtitle, children, delay = 0, T }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    style={{
      background: T.panel,
      border: `1px solid ${T.panelBorder}`,
      borderRadius: 16,
      padding: '24px 26px 26px',
    }}
  >
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: T.bronze, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ color: T.textMuted, fontSize: 11, marginTop: 3, margin: 0 }}>{subtitle}</p>
      )}
    </div>
    {children}
  </motion.div>
)

// ── Horizontal bar chart ──────────────────────────────────────
const HBarChart = ({ data, defaultColor = '#E8C99A', T }) => {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {data.map((row, i) => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 150, fontSize: 11, color: T.textSub, textAlign: 'right', flexShrink: 0, lineHeight: '14px' }}>
            {row.label}
          </div>
          <div style={{ flex: 1, height: 22, background: T.barBg, borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(row.value / max) * 100}%` }}
              transition={{ delay: 0.25 + i * 0.06, duration: 0.65, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: row.color ?? defaultColor,
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 6,
                minWidth: row.value > 0 ? 24 : 0,
              }}
            >
              {row.value > 0 && (
                <span style={{ color: '#000', fontSize: 10, fontWeight: 800, opacity: 0.8 }}>{row.value}</span>
              )}
            </motion.div>
          </div>
          <div style={{ width: 28, fontSize: 12, color: T.textMuted, flexShrink: 0, textAlign: 'right' }}>
            {row.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Donut chart ───────────────────────────────────────────────
const DonutChart = ({ segments, T }) => {
  const CX = 80, CY = 80, R_IN = 44, R_OUT = 72
  const total = segments.reduce((s, d) => s + d.value, 0)
  let startDeg = -90
  const arcs = segments.map((seg) => {
    const sweep = total > 0 ? (seg.value / total) * 358 : 0  // 358 to keep tiny gap
    const path = sweep > 0 ? buildArcPath(CX, CY, R_IN, R_OUT, startDeg, startDeg + sweep) : null
    startDeg += sweep + (360 / total > 1 ? 1 : 0.5) // tiny gap between segments
    return { ...seg, path }
  })
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {arcs.map((arc, i) =>
        arc.path ? (
          <motion.path
            key={arc.label}
            d={arc.path}
            fill={arc.color}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
        ) : null
      )}
      {/* center */}
      <text x={CX} y={CY - 7} textAnchor="middle" fill={T.svgText} fontSize={22} fontWeight={800} fontFamily="'Cinzel', serif">
        {total}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill={T.svgSub} fontSize={9} fontFamily="'Be Vietnam Pro', sans-serif">
        THÀNH VIÊN
      </text>
    </svg>
  )
}

// ── Branch stacked bars ───────────────────────────────────────
const BranchChart = ({ data, total, T }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
    {data.map((b, i) => (
      <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 90, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: b.color, fontWeight: 700 }}>{b.label}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>{b.total} người</div>
        </div>
        <div style={{ flex: 1, display: 'flex', height: 24, borderRadius: 5, overflow: 'hidden', gap: 2 }}>
          {b.male > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(b.male / total) * 100}%` }}
              transition={{ delay: 0.4 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
              style={{ background: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ color: '#0B1120', fontSize: 10, fontWeight: 800 }}>{b.male}</span>
            </motion.div>
          )}
          {b.female > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(b.female / total) * 100}%` }}
              transition={{ delay: 0.45 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
              style={{ background: '#F472B6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span style={{ color: '#0B1120', fontSize: 10, fontWeight: 800 }}>{b.female}</span>
            </motion.div>
          )}
        </div>
        {/* percent */}
        <div style={{ width: 38, fontSize: 11, color: T.textMuted, textAlign: 'right', flexShrink: 0 }}>
          {Math.round((b.total / total) * 100)}%
        </div>
      </div>
    ))}
    <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
      {[['#38BDF8', 'Nam'], ['#F472B6', 'Nữ']].map(([color, lbl]) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 10, background: color, borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: T.textSub }}>{lbl}</span>
        </div>
      ))}
    </div>
  </div>
)

// ── Mini alive/deceased progress bar ─────────────────────────
const AliveBar = ({ alive, total, members, T }) => {
  const pct = toPercent(alive, total)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#4ADE80', fontWeight: 600 }}>Còn sống — {alive} người ({pct}%)</span>
        <span style={{ fontSize: 12, color: T.textMuted }}>Đã mất — {total - alive} người</span>
      </div>
      <div style={{ height: 12, background: T.barBg, borderRadius: 6, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #4ADE80, #86EFAC)', borderRadius: 6 }}
        />
      </div>
      <div style={{ display: 'flex', marginTop: 8, gap: 4 }}>
        {members.map((m) => (
          <motion.div
            key={m.id}
            title={m.fullName}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + Math.random() * 0.4, duration: 0.3 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: m.isAlive ? '#4ADE80' : 'rgba(250,244,232,0.15)',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Age Pyramid ───────────────────────────────────────────────
const AgePyramid = ({ data, T }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.male, d.female]), 1)
  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 16, height: 8, background: 'linear-gradient(90deg, #0EA5E9, #38BDF8)', borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: T.textSub }}>← Nam</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 11, color: T.textSub }}>Nữ →</span>
          <div style={{ width: 16, height: 8, background: 'linear-gradient(90deg, #F472B6, #EC4899)', borderRadius: 2 }} />
        </div>
      </div>

      {/* Pyramid rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((row, i) => (
          <div key={AGE_BRACKETS[i]} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Male bar — grows from center outward left */}
            <div style={{ flex: 1, height: 22, position: 'relative' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(row.male / maxVal) * 100}%` }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.65, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  height: '100%',
                  background: 'linear-gradient(270deg, #38BDF8, #0EA5E9)',
                  borderRadius: '4px 0 0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 5,
                  minWidth: row.male > 0 ? 4 : 0,
                }}
              >
                {row.male > 0 && (
                  <span style={{ fontSize: 10, color: '#001a2e', fontWeight: 800 }}>{row.male}</span>
                )}
              </motion.div>
            </div>

            {/* Age label — center spine */}
            <div style={{
              width: 54,
              textAlign: 'center',
              fontSize: 10,
              color: T.bronze,
              fontWeight: 700,
              letterSpacing: '0.04em',
              flexShrink: 0,
              padding: '0 4px',
              zIndex: 1,
            }}>
              {AGE_BRACKETS[i]}
            </div>

            {/* Female bar — grows from center outward right */}
            <div style={{ flex: 1, height: 22, position: 'relative' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(row.female / maxVal) * 100}%` }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.65, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  background: 'linear-gradient(90deg, #F472B6, #EC4899)',
                  borderRadius: '0 4px 4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 5,
                  minWidth: row.female > 0 ? 4 : 0,
                }}
              >
                {row.female > 0 && (
                  <span style={{ fontSize: 10, color: '#2a0015', fontWeight: 800 }}>{row.female}</span>
                )}
              </motion.div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 14, fontSize: 10, color: T.textFaint, textAlign: 'center', fontStyle: 'italic', marginBottom: 0 }}>
        * Thành viên không có ngày sinh được ước tính phân tán theo thế hệ
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
const FamilyStatistics = () => {
  const isDark = useAppStore((s) => s.isDark)
  const members = useMembersStore((s) => s.members)
  const T = makeTheme(isDark)
  const stats = useMemo(() => {
    const total = members.length
    const isBlood = (m) => m.generation === 1 || m.fatherId || m.motherId
    const blood = members.filter(isBlood).length
    const inLaw = total - blood
    const male = members.filter((m) => m.gender === 'male').length
    const female = members.filter((m) => m.gender === 'female').length
    const alive = members.filter((m) => m.isAlive).length
    const deceased = total - alive

    // Generation distribution
    const byGen = [1, 2, 3, 4, 5]
      .map((g) => ({
        label: GEN_LABELS[g],
        value: members.filter((m) => m.generation === g).length,
        color: GEN_COLORS[g],
      }))
      .filter((g) => g.value > 0)
    const generationCount = byGen.length

    // Branch distribution
    const byBranch = Object.keys(BRANCH_LABELS)
      .map((b) => ({
        key: b,
        label: BRANCH_LABELS[b],
        total: members.filter((m) => m.branch === b).length,
        male: members.filter((m) => m.branch === b && m.gender === 'male').length,
        female: members.filter((m) => m.branch === b && m.gender === 'female').length,
        color: BRANCH_COLORS[b],
      }))
      .filter((b) => b.total > 0)
      .sort((a, b) => b.total - a.total)

    // Location distribution — exclude "Chưa cập nhật" & null
    const locMap = {}
    members.forEach((m) => {
      if (m.location && !m.location.toLowerCase().includes('cập nhật')) {
        locMap[m.location] = (locMap[m.location] ?? 0) + 1
      }
    })
    const byLocation = Object.entries(locMap)
      .map(([label, value]) => ({ label, value, color: '#4ADE80' }))
      .sort((a, b) => b.value - a.value)

    // Blood vs in-law breakdown for donut
    const genderSegments = [
      { label: 'Nam', value: male, color: '#38BDF8' },
      { label: 'Nữ', value: female, color: '#F472B6' },
    ]

    // Age pyramid — 10 brackets from 90+ down to 0-9
    const agePyramid = AGE_BRACKETS.map(() => ({ male: 0, female: 0 }))
    members.forEach((m) => {
      const age = getEstimatedAge(m)
      const idx = getBracketIdx(age)
      if (m.gender === 'male') agePyramid[idx].male++
      else agePyramid[idx].female++
    })

    return { total, blood, inLaw, male, female, alive, deceased, generationCount, byGen, byBranch, byLocation, genderSegments, agePyramid }
  }, [members])

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="section-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Summary cards ─────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 14 }}>
          <StatCard label="Tổng thành viên" value={stats.total} sub={`${stats.generationCount} thế hệ ghi nhận`} color="#E8C99A" delay={0} T={T} />
          <StatCard label="Máu mủ dòng họ" value={stats.blood} sub={`+ ${stats.inLaw} dâu/rể`} color="#F97316" delay={0.06} T={T} />
          <StatCard label="Nam" value={stats.male} sub={`${toPercent(stats.male, stats.total)}% tổng số`} color="#38BDF8" delay={0.12} T={T} />
          <StatCard label="Nữ" value={stats.female} sub={`${toPercent(stats.female, stats.total)}% tổng số`} color="#F472B6" delay={0.18} T={T} />
          <StatCard label="Đang sống" value={stats.alive} sub={`${toPercent(stats.alive, stats.total)}% dòng họ`} color="#4ADE80" delay={0.24} T={T} />
          <StatCard label="Đã mất" value={stats.deceased} sub="Lưu trong ký ức" color="#94A3B8" delay={0.30} T={T} />
        </div>

        {/* ── Alive/deceased dot map ─────────────────────── */}
        <ChartPanel title="Tỷ lệ còn sống — trực quan từng người" delay={0.35} T={T}>
          <AliveBar alive={stats.alive} total={stats.total} members={members} T={T} />
        </ChartPanel>

        {/* ── Age pyramid ───────────────────────────────── */}
        <ChartPanel
          title="Kim tự tháp dân số"
          subtitle="Phân bố độ tuổi · Nam (←) vs Nữ (→) — mỗi dải 10 năm"
          delay={0.42}
          T={T}
        >
          <AgePyramid data={stats.agePyramid} T={T} />
        </ChartPanel>

        {/* ── Generation + Gender ────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <ChartPanel title="Phân bố theo thế hệ" subtitle="Số lượng thành viên mỗi đời" delay={0.4} T={T}>
            <HBarChart data={stats.byGen} T={T} />
          </ChartPanel>

          <ChartPanel title="Tỉ lệ giới tính" subtitle="Toàn bộ dòng họ" delay={0.45} T={T}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <DonutChart segments={stats.genderSegments} T={T} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Nam', value: stats.male, pct: toPercent(stats.male, stats.total), color: '#38BDF8' },
                  { label: 'Nữ', value: stats.female, pct: toPercent(stats.female, stats.total), color: '#F472B6' },
                  { label: 'Máu mủ', value: stats.blood, pct: toPercent(stats.blood, stats.total), color: '#F97316' },
                  { label: 'Dâu / Rể', value: stats.inLaw, pct: toPercent(stats.inLaw, stats.total), color: '#64748B' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: T.textSub, width: 64 }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: item.color, width: 30 }}>{item.value}</span>
                    <span style={{ fontSize: 10, color: T.textMuted }}>{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartPanel>
        </div>

        {/* ── Branch distribution ────────────────────────── */}
        <ChartPanel title="Phân bố theo nhánh họ" subtitle="Mỗi thanh thể hiện tỉ lệ Nam / Nữ trong nhánh" delay={0.5} T={T}>
          <BranchChart data={stats.byBranch} total={stats.total} T={T} />
        </ChartPanel>

        {/* ── Location ──────────────────────────────────── */}
        <ChartPanel title="Địa điểm cư trú" subtitle="Dựa trên dữ liệu địa chỉ hiện tại của từng thành viên" delay={0.55} T={T}>
          {stats.byLocation.length > 0 ? (
            <HBarChart data={stats.byLocation} defaultColor="#4ADE80" T={T} />
          ) : (
            <p style={{ color: T.textMuted, fontSize: 13, fontStyle: 'italic' }}>
              Chưa có đủ dữ liệu địa điểm.
            </p>
          )}
        </ChartPanel>

      </div>
    </div>
  )
}

export default FamilyStatistics