import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiCalendar, HiLocationMarker, HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { ritualEvents, getMajorRituals } from '@/data'
import { RITUAL_TYPES } from '@/constants'
import { motionVariants, scrollConfig } from '@/lib/motion'
import { useInView } from 'react-intersection-observer'

const getRitualConfig = (type) => RITUAL_TYPES[type] || { label: type, color: '#D6B98C' }

// ---- Ritual Card ----
const RitualCard = ({ ritual }) => {
  const [open, setOpen] = useState(false)
  const config = getRitualConfig(ritual.type)
  const [ref, inView] = useInView({ ...scrollConfig.viewport, triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      variants={motionVariants.staggerItem}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Top colored accent */}
      <div className="h-0.5 w-full" style={{ background: config.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            {/* Date badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] tracking-widest uppercase mb-2 font-body"
              style={{
                background: `${config.color}15`,
                border: `1px solid ${config.color}30`,
                color: config.color,
              }}
            >
              <HiCalendar size={9} />
              <span>
                {ritual.lunarDate
                  ? `Âm: ${ritual.lunarDate.day}/${ritual.lunarDate.month}`
                  : ritual.solarDate?.split('-').slice(1).reverse().join('/')}
              </span>
              {ritual.recurrence && (
                <span className="ml-1">· {ritual.recurrence === 'yearly' ? 'Hàng năm' : 'Đặc biệt'}</span>
              )}
            </div>

            <h3 className="mb-1 font-heading text-sm font-semibold leading-snug text-primary">
              {ritual.title}
            </h3>

            <div
              className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-body mb-2"
              style={{ color: config.color }}
            >
              {config.label}
            </div>
          </div>

          {/* Importance stars */}
          <div className="flex gap-0.5 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="text-[8px]"
                style={{ color: i < ritual.importance ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        {ritual.location && (
          <div className="mb-3 flex items-center gap-1.5 font-body text-xs text-muted">
            <HiLocationMarker size={10} className="text-bronze/40" />
            <span>{ritual.location}</span>
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-bronze/50 text-[10px] tracking-wider uppercase font-body hover:text-bronze/80 transition-colors"
        >
          {open ? <HiChevronUp size={12} /> : <HiChevronDown size={12} />}
          <span>{open ? 'Thu gọn' : 'Chi tiết'}</span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-bronze/10 mt-4 space-y-4">
                {/* Ritual notes */}
                {ritual.ritualNotes && (
                  <div>
                    <p className="text-bronze/60 text-[10px] tracking-wider uppercase mb-2 font-body">
                      Nghi thức
                    </p>
                    <p className="font-body text-xs leading-relaxed text-secondary">
                      {ritual.ritualNotes}
                    </p>
                  </div>
                )}

                {/* Preparation list */}
                {ritual.preparation?.length > 0 && (
                  <div>
                    <p className="text-bronze/60 text-[10px] tracking-wider uppercase mb-2 font-body">
                      Chuẩn bị
                    </p>
                    <ul className="grid grid-cols-2 gap-1">
                      {ritual.preparation.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 font-body text-xs text-muted">
                          <span className="text-bronze/40 text-[8px] mt-1">✦</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ---- Calendar Grid ----
const LunarCalendarGrid = () => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {months.map((month) => {
        const monthEvents = ritualEvents.filter((r) => r.lunarDate?.month === month)
        return (
          <div
            key={month}
            className="glass-card rounded-lg p-3 min-h-[90px]"
            style={{ borderColor: monthEvents.length > 0 ? 'rgba(214,185,140,0.25)' : undefined }}
          >
            <p className="font-display text-bronze/70 text-xs tracking-wider mb-2 text-center">
              Tháng {month}
            </p>
            {monthEvents.length > 0 ? (
              <div className="space-y-1.5">
                {monthEvents.map((e) => {
                  const cfg = getRitualConfig(e.type)
                  return (
                    <div
                      key={e.id}
                      className="text-[9px] leading-tight font-body px-1 py-0.5 rounded-sm"
                      style={{ background: `${cfg.color}15`, color: cfg.color }}
                    >
                      Ngày {e.lunarDate.day}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="font-body text-[9px] text-center text-subtle">—</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---- Main Ritual Calendar ----
const RitualCalendar = () => {
  const [filter, setFilter] = useState('all')
  const typeFilters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'ancestor_anniversary', label: 'Giỗ tổ' },
    { id: 'personal_anniversary', label: 'Giỗ cá nhân' },
    { id: 'grave_visit', label: 'Chạp mả' },
    { id: 'tet', label: 'Tết' },
    { id: 'reunion', label: 'Họp mặt' },
    { id: 'traditional', label: 'Lễ khác' },
  ]

  const filtered = filter === 'all' ? ritualEvents : ritualEvents.filter((r) => r.type === filter)

  return (
    <div className="space-y-10">
      {/* Annual overview calendar */}
      <div>
        <h2 className="mb-6 font-display text-sm tracking-[0.3em] uppercase text-secondary">
          Tổng quan âm lịch — 12 tháng
        </h2>
        <LunarCalendarGrid />
      </div>

      <div className="divider-bronze" />

      {/* Ritual list */}
      <div>
        <h2 className="mb-6 font-display text-sm tracking-[0.3em] uppercase text-secondary">
          Danh sách nghi lễ
        </h2>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {typeFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-body tracking-wider uppercase rounded-sm transition-all duration-200 ${filter === f.id
                  ? 'bg-bronze/20 text-bronze border border-bronze/40'
                  : 'border border-ivory/10 text-muted hover:border-bronze/20 hover-text-secondary'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <motion.div
          variants={motionVariants.staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((ritual) => (
            <RitualCard key={ritual.id} ritual={ritual} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default RitualCalendar