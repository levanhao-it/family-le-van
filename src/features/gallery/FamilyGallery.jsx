import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiLocationMarker, HiCalendar, HiPhotograph, HiUsers } from 'react-icons/hi'
import { galleryCategories, getImagesByCategory } from '@/data'
import { motionVariants, scrollConfig } from '@/lib/motion'
import { useInView } from 'react-intersection-observer'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'
import {
  formatArchiveSource,
  getArchiveRecord,
  getVerificationMeta,
  resolveRelatedMembers,
  summarizeArchiveCollection,
} from '@/utils/archive'

const makeTheme = (isDark) => ({
  placeholderBg: isDark ? 'rgba(44,36,31,0.8)' : 'rgba(245,237,220,0.9)',
  placeholderBd: isDark ? 'rgba(214,185,140,0.2)' : 'rgba(122,74,24,0.2)',
  cardImgBg: isDark ? 'radial-gradient(ellipse at center, rgba(140,106,67,0.12), rgba(31,26,23,0.8))'
    : 'radial-gradient(ellipse at center, rgba(180,130,60,0.1), rgba(230,215,190,0.7))',
})

const ArchiveSection = ({ label, children, className = '' }) => (
  <div className={`rounded-xl border border-bronze/10 bg-black/20 p-3 ${className}`}>
    <p className="text-[10px] font-body uppercase tracking-[0.25em] text-bronze/45">{label}</p>
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

// ---- Lightbox ----
const Lightbox = ({ image, onClose, T }) => {
  const archive = image ? getArchiveRecord(image) : null
  const verification = getVerificationMeta(archive?.verification?.status)

  return (
    <AnimatePresence>
      {image && (
        <>
          <motion.div
            variants={motionVariants.overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div className="pointer-events-auto max-h-[90vh] max-w-3xl w-full overflow-y-auto pr-1">
              {/* Image placeholder */}
              <div
                className="w-full rounded-xl mb-4 flex items-center justify-center"
                style={{
                  minHeight: 300,
                  background: T.placeholderBg,
                  border: `1px solid ${T.placeholderBd}`,
                }}
              >
                <div className="text-center p-8">
                  <HiPhotograph className="text-bronze/30 mx-auto mb-4" size={48} />
                  <p className="font-display text-bronze/60 text-sm tracking-wider">{image.title}</p>
                  <p className="mt-1 font-body text-xs text-faint">{image.year}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div
                    className="inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.28em]"
                    style={{
                      color: verification.color,
                      borderColor: `${verification.color}55`,
                      background: `${verification.color}14`,
                    }}
                  >
                    {verification.label}
                  </div>
                  <h3 className="mb-1 font-heading text-base font-semibold text-primary">{image.title}</h3>
                  <p className="max-w-md font-body text-xs leading-relaxed text-secondary">{image.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {image.photographer && (
                      <span className="font-body text-xs text-muted">📸 {image.photographer}</span>
                    )}
                    {image.location && (
                      <span className="flex items-center gap-1 font-body text-xs text-muted">
                        <HiLocationMarker size={10} />{archive?.location?.label ?? image.location}
                      </span>
                    )}
                    {image.year && (
                      <span className="flex items-center gap-1 font-body text-xs text-muted">
                        <HiCalendar size={10} />{archive?.timeframe?.label ?? image.year}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 mt-5 sm:grid-cols-2">
                    <ArchiveSection label="Người liên quan">
                      {image.relatedMemberRefs?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {image.relatedMemberRefs.map((member) => (
                            <span key={member.id} className="rounded-full border border-bronze/15 bg-bronze/8 px-2.5 py-1 text-[11px] text-secondary">
                              {member.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">Chưa xác định rõ nhân vật trong tư liệu này.</span>
                      )}
                    </ArchiveSection>

                    <ArchiveSection label="Mốc thời gian">
                      <p>{archive?.timeframe?.label ?? 'Chưa xác định thời điểm chụp hoặc sở hữu.'}</p>
                    </ArchiveSection>

                    <ArchiveSection label="Địa điểm">
                      <p>{archive?.location?.label ?? 'Chưa xác định địa điểm.'}</p>
                      {archive?.location?.note && (
                        <p className="mt-1 text-[11px] text-muted">{archive.location.note}</p>
                      )}
                    </ArchiveSection>

                    <ArchiveSection label="Nguồn tư liệu" className="sm:col-span-2">
                      {archive?.sources?.length ? (
                        <ul className="space-y-2">
                          {archive.sources.map((source, index) => (
                            <li key={`${image.id}-source-${index}`} className="border-l border-bronze/20 pl-3 text-secondary">
                              {formatArchiveSource(source)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">Chưa bổ sung nguồn đối chiếu.</span>
                      )}
                    </ArchiveSection>

                    <ArchiveSection label="Ghi chú kiểm chứng" className="sm:col-span-2">
                      <p className="text-secondary">{archive?.verification?.note ?? 'Chưa có ghi chú kiểm chứng.'}</p>
                    </ArchiveSection>
                  </div>
                </div>
                <button onClick={onClose} className="ml-4 flex-shrink-0 p-2 text-muted hover-text-primary">
                  <HiX size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ---- Gallery Card ----
const GalleryCard = ({ image, onClick, T }) => {
  const [ref, inView] = useInView({ ...scrollConfig.viewport, triggerOnce: true })
  const archive = getArchiveRecord(image)
  const verification = getVerificationMeta(archive.verification?.status)

  return (
    <motion.div
      ref={ref}
      variants={motionVariants.scaleReveal}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(image)}
      className="glass-card rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Image placeholder */}
      <div
        className="w-full flex items-center justify-center relative overflow-hidden"
        style={{
          height: image.isFeature ? 200 : 150,
          background: T.cardImgBg,
        }}
      >
        <div className="text-center">
          <HiPhotograph className="text-bronze/25 mx-auto mb-2" size={32} />
          <p className="px-4 text-center font-body text-[10px] leading-tight text-subtle line-clamp-2">
            {image.title}
          </p>
          <p className="text-bronze/30 text-[9px] font-body mt-1">{image.year}</p>
        </div>

        {/* Feature badge */}
        {image.isFeature && (
          <div className="absolute top-2 left-2 badge-bronze text-[9px]">
            Nổi bật
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="p-3">
        <p className="mb-1 font-body text-xs font-medium leading-snug text-primary line-clamp-1">
          {image.title}
        </p>
        <p className="font-body text-[10px] leading-relaxed text-faint line-clamp-2">
          {image.description}
        </p>
        <div className="mt-2 space-y-1.5 text-[10px] text-muted">
          <div className="flex items-center gap-1.5">
            <HiCalendar size={10} className="text-bronze/40" />
            <span className="line-clamp-1">{archive.timeframe.label}</span>
          </div>
          {archive.location?.label && (
            <div className="flex items-center gap-1.5">
              <HiLocationMarker size={10} className="text-bronze/40" />
              <span className="line-clamp-1">{archive.location.label}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <HiUsers size={10} className="text-bronze/40" />
            <span>{image.relatedMemberRefs?.length ?? 0} nhân vật liên quan</span>
          </div>
          <div className="text-faint">
            {archive.sources.length} nguồn đối chiếu
          </div>
        </div>
        {image.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {image.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge-bronze text-[8px] px-1.5 py-0.5">{tag}</span>
            ))}
          </div>
        )}
        <div
          className="mt-3 inline-flex rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em]"
          style={{
            color: verification.color,
            borderColor: `${verification.color}45`,
            background: `${verification.color}10`,
          }}
        >
          {verification.label}
        </div>
      </div>
    </motion.div>
  )
}

// ---- Main Gallery ----
const FamilyGallery = () => {
  const isDark = useAppStore((s) => s.isDark)
  const members = useMembersStore((s) => s.members)
  const T = makeTheme(isDark)
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxImage, setLightboxImage] = useState(null)

  const filtered = useMemo(
    () => getImagesByCategory(activeCategory).map((image) => ({
      ...image,
      archive: getArchiveRecord(image),
      relatedMemberRefs: resolveRelatedMembers(getArchiveRecord(image).people, members),
    })),
    [activeCategory, members]
  )
  const archiveSummary = useMemo(() => summarizeArchiveCollection(filtered), [filtered])

  return (
    <div className="space-y-8">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {galleryCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 text-xs font-body tracking-wider uppercase rounded-sm transition-all duration-200 ${activeCategory === cat.id
              ? 'bg-bronze/20 text-bronze border border-bronze/40'
              : 'border border-ivory/10 text-muted hover:border-bronze/20 hover-text-secondary'
              }`}
          >
            {cat.label}
            <span className="ml-1.5 opacity-50">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Masonry-like grid */}
      <motion.div
        key={activeCategory}
        variants={motionVariants.staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filtered.map((image) => (
          <GalleryCard key={image.id} image={image} onClick={setLightboxImage} T={T} />
        ))}
      </motion.div>

      {/* Lightbox */}
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} T={T} />
    </div>
  )
}

export default FamilyGallery