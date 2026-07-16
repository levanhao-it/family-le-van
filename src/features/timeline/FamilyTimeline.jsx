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
    <p className="text-[10px] font-body uppercase tracking-[0.24em]">{label}</p>
    <div className="mt-2 text-xs leading-relaxed text-secondary">{children}</div>
  </div>
)

const ArchiveSummaryCard = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-bronze/12 bg-black/20 px-4 py-3">
    <p className="text-[10px] font-body uppercase tracking-[0.24em]">{label}</p>
    <p className="mt-2 font-display text-2xl text-primary">{value}</p>
    <p className="mt-1 text-xs text-muted">{hint}</p>
  </div>
)

// ---- Timeline Event Card ----
const TimelineEventCard = ({ event, side, mobile = false }) => {
  const [ref, inView] = useInView({ ...scrollConfig.viewport, triggerOnce: true })
  const [expanded, setExpanded] = useState(false)
  const config = getEventConfig(event.type)
  const archive = getArchiveRecord(event)
  const verification = getVerificationMeta(archive.verification?.status)

  return (
    <motion.div
      ref={ref}
      variants={mobile ? motionVariants.fadeUp : (side === 'left' ? motionVariants.slideLeft : motionVariants.slideRight)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={mobile ? 'w-full' : clsx('relative flex', side === 'left' ? 'justify-end pr-8 lg:pr-12' : 'justify-start pl-8 lg:pl-12')}
    >
      <div
        className={clsx(
          'glass-card rounded-xl cursor-pointer hover:border-bronze/40 transition-all duration-300 w-full',
          mobile ? 'p-4' : 'max-w-sm p-5 lg:max-w-md'
        )}
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
              <HiCalendar size={10} className="" />
              <span>{event.date.split('-')[0]}</span>
            </div>
          )}
          {archive.location?.label && (
            <div className="flex items-center gap-1 font-body text-xs text-muted">
              <HiLocationMarker size={10} className="" />
              <span>{archive.location.label}</span>
            </div>
          )}
          {event.relatedMemberRefs?.length > 0 && (
            <div className="flex items-center gap-1 font-body text-xs text-muted">
              <HiUsers size={10} className="" />
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
                <ArchiveSection label="Mốc thời gian">
                  <p>{archive.timeframe.label}</p>
                </ArchiveSection>

                <ArchiveSection label="Địa điểm">
                  <p>{archive.location.label}</p>
                  {archive.location.note && (
                    <p className="mt-1 text-[11px] text-muted">{archive.location.note}</p>
                  )}
                </ArchiveSection>

                <ArchiveSection label="Người liên quan">
                  {event.relatedMemberRefs?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {event.relatedMemberRefs.map((member) => (
                        <span key={member.id} className="rounded-full border border-bronze/15 bg-bronze/8 px-2.5 py-1 text-[11px] text-secondary">
                          {member.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Chưa ghi nhận nhân vật liên quan.</span>
                  )}
                </ArchiveSection>

                <ArchiveSection label="Nguồn tài liệu" className="sm:col-span-2">
                  {archive.sources.length ? (
                    <ul className="space-y-2">
                      {archive.sources.map((source, index) => (
                        <li key={`${event.id}-source-${index}`} className="border-l border-bronze/20 pl-3 text-secondary">
                          {formatArchiveSource(source)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">Chưa bổ sung nguồn đối chiếu cho sự kiện này.</span>
                  )}
                </ArchiveSection>

                {archive.evidence.documents.length > 0 && (
                  <ArchiveSection label="Văn bản / hồ sơ liên quan" className="sm:col-span-2">
                    <ul className="space-y-1.5 text-secondary">
                      {archive.evidence.documents.map((document, index) => (
                        <li key={`${event.id}-document-${index}`}>• {document}</li>
                      ))}
                    </ul>
                  </ArchiveSection>
                )}

                <ArchiveSection label="Ghi chú kiểm chứng" className="sm:col-span-2">
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
        {/* ── Mobile layout: single column, line on the left ── */}
        <div className="relative block md:hidden pl-10">
          <div
            className="absolute left-4 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(214,185,140,0.3) 10%, rgba(214,185,140,0.3) 90%, transparent)' }}
          />
          <div className="space-y-5">
            {sorted.map((event) => {
              const config = getEventConfig(event.type)
              return (
                <div key={event.id} className="relative">
                  {/* Dot on the line */}
                  <div
                    className="absolute -left-[22px] top-4 z-10 h-4 w-4 rounded-full"
                    style={{ background: config.color, boxShadow: `0 0 8px ${config.color}55` }}
                  />
                  <TimelineEventCard event={event} side="right" mobile />
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Desktop layout: two-column alternating, center line ── */}
        <div className="relative hidden md:block">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(214,185,140,0.3) 10%, rgba(214,185,140,0.3) 90%, transparent)' }}
          />
          <div className="space-y-16">
            {sorted.map((event, i) => (
              <div key={event.id} className="relative grid grid-cols-2 gap-0 items-center">
                <div>
                  {i % 2 === 0 ? <TimelineEventCard event={event} side="left" /> : null}
                </div>
                <TimelineDot event={event} index={i} />
                <div>
                  {i % 2 !== 0 ? <TimelineEventCard event={event} side="right" /> : null}
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