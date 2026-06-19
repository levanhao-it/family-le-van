import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { HiCalendar, HiLocationMarker, HiUsers } from 'react-icons/hi'
import { familyTimeline } from '@/data'
import { EVENT_TYPES } from '@/constants'
import { motionVariants, scrollConfig } from '@/lib/motion'
import { clsx } from 'clsx'
import { useMembersStore } from '@/stores/membersStore'
import {
  formatArchiveSource,
  getArchiveRecord,
  getVerificationMeta,
  resolveRelatedMembers,
  summarizeArchiveCollection,
} from '@/utils/archive'

// Event type icon & color helper
const getEventConfig = (type) =>
  EVENT_TYPES[type] || { label: type, color: '#D6B98C', icon: '●' }

const ArchiveSection = ({ label, children, className = '' }) => (
  <div className={clsx('rounded-xl border border-bronze/10 bg-black/20 p-3', className)}>
    <p className="text-[10px] font-body uppercase tracking-[0.24em] text-bronze/45">{label}</p>
    <div className="mt-2 text-xs leading-relaxed text-secondary">{children}</div>
  </div>
)

const ArchiveSummaryCard = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-bronze/12 bg-black/20 px-4 py-3">
    <p className="text-[10px] font-body uppercase tracking-[0.24em] text-bronze/45">{label}</p>
    <p className="mt-2 font-display text-2xl text-primary">{value}</p>
    <p className="mt-1 text-xs text-muted">{hint}</p>
  </div>
)

// ---- Timeline Event Card ----
const TimelineEventCard = ({ event, side }) => {
  const [ref, inView] = useInView({ ...scrollConfig.viewport, triggerOnce: true })
  const [expanded, setExpanded] = useState(false)
  const config = getEventConfig(event.type)
  const archive = getArchiveRecord(event)
  const verification = getVerificationMeta(archive.verification?.status)

  return (
    <motion.div
      ref={ref}
      variants={side === 'left' ? motionVariants.slideLeft : motionVariants.slideRight}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={clsx('relative flex', side === 'left' ? 'justify-end pr-8 lg:pr-12' : 'justify-start pl-8 lg:pl-12')}
    >
      <div
        className="glass-card rounded-xl p-5 w-full max-w-sm lg:max-w-md cursor-pointer hover:border-bronze/40 transition-all duration-300"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Type badge row */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] tracking-wider uppercase font-body"
            style={{
              background: `${config.color}15`,
              border: `1px solid ${config.color}30`,
              color: config.color,
            }}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </div>
          <div className="text-right">
            <span className="block font-body text-[10px] text-subtle">{event.era}</span>
            <span
              className="mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]"
              style={{
                color: verification.color,
                borderColor: `${verification.color}40`,
                background: `${verification.color}12`,
              }}
            >
              {verification.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1 font-heading text-base font-semibold leading-snug text-primary">
          {event.title}
        </h3>
        {event.subtitle && (
          <p className="font-body text-bronze/60 text-xs mb-3">{event.subtitle}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          {event.date && (
            <div className="flex items-center gap-1 font-body text-xs text-muted">
              <HiCalendar size={10} className="text-bronze/40" />
              <span>{event.date.split('-')[0]}</span>
            </div>
          )}
          {archive.location?.label && (
            <div className="flex items-center gap-1 font-body text-xs text-muted">
              <HiLocationMarker size={10} className="text-bronze/40" />
              <span>{archive.location.label}</span>
            </div>
          )}
          {event.relatedMemberRefs?.length > 0 && (
            <div className="flex items-center gap-1 font-body text-xs text-muted">
              <HiUsers size={10} className="text-bronze/40" />
              <span>{event.relatedMemberRefs.length} người liên quan</span>
            </div>
          )}
        </div>

        {/* Description (truncated) */}
        <p className={clsx('font-body text-xs leading-relaxed text-secondary', !expanded && 'line-clamp-3')}>
          {event.description}
        </p>

        {/* Quote */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3 overflow-hidden"
            >
              {event.quotes?.length > 0 && (
                <div className="border-l-2 border-bronze/30 pl-3">
                  {event.quotes.map((quote, index) => (
                    <p key={`${event.id}-quote-${index}`} className="font-heading text-xs italic leading-relaxed text-muted">
                      "{quote}"
                    </p>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <ArchiveSection label="Moc thoi gian">
                  <p>{archive.timeframe.label}</p>
                </ArchiveSection>

                <ArchiveSection label="Dia diem">
                  <p>{archive.location.label}</p>
                  {archive.location.note && (
                    <p className="mt-1 text-[11px] text-muted">{archive.location.note}</p>
                  )}
                </ArchiveSection>

                <ArchiveSection label="Nguoi lien quan">
                  {event.relatedMemberRefs?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {event.relatedMemberRefs.map((member) => (
                        <span key={member.id} className="rounded-full border border-bronze/15 bg-bronze/8 px-2.5 py-1 text-[11px] text-secondary">
                          {member.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Chua ghi nhan nhan vat lien quan.</span>
                  )}
                </ArchiveSection>

                <ArchiveSection label="Nguon tu lieu" className="sm:col-span-2">
                  {archive.sources.length ? (
                    <ul className="space-y-2">
                      {archive.sources.map((source, index) => (
                        <li key={`${event.id}-source-${index}`} className="border-l border-bronze/20 pl-3 text-secondary">
                          {formatArchiveSource(source)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">Chua bo sung nguon doi chieu cho su kien nay.</span>
                  )}
                </ArchiveSection>

                {archive.evidence.documents.length > 0 && (
                  <ArchiveSection label="Van ban / ho so lien doi" className="sm:col-span-2">
                    <ul className="space-y-1.5 text-secondary">
                      {archive.evidence.documents.map((document, index) => (
                        <li key={`${event.id}-document-${index}`}>• {document}</li>
                      ))}
                    </ul>
                  </ArchiveSection>
                )}

                <ArchiveSection label="Ghi chu kiem chung" className="sm:col-span-2">
                  <p>{archive.verification.note}</p>
                </ArchiveSection>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        {expanded && event.tags?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-1.5 mt-3"
          >
            {event.tags.map((tag) => (
              <span key={tag} className="badge-bronze text-[9px] px-2 py-0.5">
                {tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Expand hint */}
        <p className="text-bronze/30 text-[9px] tracking-wider uppercase mt-3 text-right font-body">
          {expanded ? 'Thu gọn ↑' : 'Xem thêm ↓'}
        </p>
      </div>
    </motion.div>
  )
}

// ---- Center dot for the timeline ----
const TimelineDot = ({ event, index }) => {
  const config = getEventConfig(event.type)
  const isImportant = event.importance >= 4

  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
      {/* Year label */}
      <div
        className="mb-2 px-2 py-0.5 text-[10px] font-display tracking-wider rounded-sm"
        style={{
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
          color: config.color,
        }}
      >
        {event.date.split('-')[0]}
      </div>

      {/* Dot */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
        className={clsx(
          'rounded-full flex items-center justify-center',
          isImportant ? 'w-5 h-5' : 'w-3 h-3'
        )}
        style={{
          background: config.color,
          boxShadow: isImportant ? `0 0 15px ${config.color}60` : 'none',
        }}
      >
        {isImportant && (
          <span className="text-obsidian text-[8px]">{config.icon}</span>
        )}
      </motion.div>
    </div>
  )
}

// ---- Main Timeline Component ----
const FamilyTimeline = () => {
  const members = useMembersStore((s) => s.members)
  const sorted = useMemo(
    () => [...familyTimeline]
      .map((event) => ({
        ...event,
        archive: getArchiveRecord(event),
        relatedMemberRefs: resolveRelatedMembers(getArchiveRecord(event).people, members),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [members]
  )
  const archiveSummary = useMemo(() => summarizeArchiveCollection(sorted), [sorted])

  return (
    <section className="py-12">
      <div className="section-container">
        <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ArchiveSummaryCard label="Mốc tư liệu" value={archiveSummary.total} hint="Sự kiện đang được lưu trong niên biểu" />
          <ArchiveSummaryCard label="Đủ 5 lớp metadata" value={archiveSummary.catalogedCount} hint="Có nhân vật, nơi chốn, thời gian, nguồn và ghi chú" />
          <ArchiveSummaryCard label="Đã kiểm chứng" value={archiveSummary.verifiedCount} hint="Mốc có chứng cứ đối chiếu mạnh" />
          <ArchiveSummaryCard label="Hồ sơ văn bản" value={archiveSummary.documentCount} hint="Biên bản, danh sách, văn bản kèm theo" />
        </div>

        {/* Vertical line */}
        <div className="relative">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(214,185,140,0.3) 10%, rgba(214,185,140,0.3) 90%, transparent)' }}
          />

          {/* Events */}
          <div className="space-y-16">
            {sorted.map((event, i) => (
              <div key={event.id} className="relative grid grid-cols-2 gap-0 items-center">
                {/* Left column */}
                <div>
                  {i % 2 === 0 ? (
                    <TimelineEventCard event={event} side="left" />
                  ) : null}
                </div>

                {/* Center dot */}
                <TimelineDot event={event} index={i} />

                {/* Right column */}
                <div>
                  {i % 2 !== 0 ? (
                    <TimelineEventCard event={event} side="right" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FamilyTimeline