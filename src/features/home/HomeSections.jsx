import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import {
  HiArrowRight,
  HiOutlineCalendar,
  HiOutlineCollection,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlinePhotograph,
  HiOutlinePuzzle,
} from 'react-icons/hi'
import IconChip from '@/components/common/IconChip'
import { motionVariants, scrollConfig } from '@/lib/motion'
import { familyTimeline } from '@/data'
import { ROUTES, GENERATION_LABELS } from '@/constants'
import { useMembersStore } from '@/stores/membersStore'
import { getMemberSummary } from '@/utils'

// ---- Section wrapper with cinematic reveal ----
const SectionReveal = ({ children, className = '' }) => {
  const [ref, inView] = useInView(scrollConfig.viewport)
  return (
    <motion.div
      ref={ref}
      variants={motionVariants.fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ---- Section Header ----
const SectionHeader = ({ badge, title, subtitle }) => (
  <div className="text-center mb-16">
    {badge && <div className="badge-bronze inline-flex mb-4">{badge}</div>}
    <h2 className="font-display text-display text-primary mb-4">{title}</h2>
    {subtitle && (
      <p className="font-body text-secondary text-base max-w-xl mx-auto leading-relaxed">{subtitle}</p>
    )}
    <div className="flex items-center gap-3 justify-center mt-6">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-bronze/40" />
      <div className="w-1 h-1 bg-bronze/40 rotate-45" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-bronze/40" />
    </div>
  </div>
)

// ---- Overview Stats ----
const OverviewStats = () => {
  const members = useMembersStore((s) => s.members)
  const { total, alive, generationCount } = getMemberSummary(members)

  return (
    <section className="cinematic-section">
      <div className="section-container">
        <SectionReveal>
          <SectionHeader
            badge="Dòng tộc Lê Văn"
            title="Di sản 99+ năm"
            subtitle="Từ vùng đất hoang Thăng Bình đến bốn phương, dòng họ Lê Văn trải dài qua nhiều thế hệ với những giá trị bất biến."
          />
        </SectionReveal>

        <motion.div
          variants={motionVariants.staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollConfig.viewport}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Thế hệ được ghi nhận', value: generationCount, suffix: '' },
            { label: 'Thành viên trong gia phả', value: total, suffix: '' },
            { label: 'Thành viên còn sống', value: alive, suffix: '' },
            { label: 'Sự kiện lịch sử', value: familyTimeline.length, suffix: '' },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={motionVariants.staggerItem}
              className="glass-card p-6 text-center rounded-lg"
            >
              <p className="font-display text-4xl text-bronze mb-2">
                {s.value}{s.suffix}
              </p>
              <p className="font-body text-muted text-xs tracking-wider leading-relaxed">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ---- Featured Members ----
const FeaturedMembersSection = () => {
  const members = useMembersStore((s) => s.members)
  const featured = members.filter(
    (m) => m.role === 'patriarch' || m.role === 'merit'
  ).slice(0, 4)

  return (
    <section className="cinematic-section border-t border-bronze/10">
      <div className="section-container">
        <SectionReveal>
          <SectionHeader
            badge="Con người"
            title="Những người nổi bật"
            subtitle="Những cá nhân đã đóng góp và tạo nên di sản dòng họ qua nhiều thế kỷ."
          />
        </SectionReveal>

        <motion.div
          variants={motionVariants.staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollConfig.viewport}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featured.map((member) => (
            <motion.div
              key={member.id}
              variants={motionVariants.staggerItem}
              whileHover={{ y: -4 }}
              className="glass-card rounded-lg p-6 cursor-pointer group"
            >
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center border border-bronze/30 bg-bronze/10 mx-auto">
                <span className="font-display text-bronze text-xl">
                  {member.fullName.charAt(0)}
                </span>
              </div>

              <div className="text-center">
                <p className="font-heading text-primary text-sm font-semibold mb-1 leading-tight">
                  {member.fullName}
                </p>
                <p className="text-bronze/60 text-xs font-body mb-2">
                  {member.nickname}
                </p>
                <div className="badge-bronze text-[10px] mb-3">
                  {GENERATION_LABELS[member.generation]}
                </div>
                <p className="font-body text-faint text-xs leading-relaxed line-clamp-2">
                  {member.occupation}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <Link
            to={ROUTES.TREE}
            className="inline-flex items-center gap-2 font-body text-bronze/70 text-sm tracking-wider uppercase hover:text-bronze transition-colors duration-200"
          >
            Xem toàn bộ gia phả
            <HiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---- Legacy Quote ----
const LegacyQuoteSection = () => (
  <section className="cinematic-section">
    <div className="section-container">
      <SectionReveal>
        <div className="max-w-3xl mx-auto text-center">
          <div className="badge-bronze inline-flex mb-8">Gia ngôn</div>
          <blockquote>
            <p className="font-display text-cinematic text-secondary leading-relaxed mb-8 text-shadow-glow">
              "Cội nguồn không thể phai mờ — dù con cháu có đi đâu, dòng họ vẫn là ngôi nhà tinh thần."
            </p>
            <div className="divider-bronze mb-6" />
            <footer className="font-body text-bronze/60 text-xs tracking-[0.3em] uppercase">
              Bia đá Nhà thờ tộc Lê Văn · Thăng Bình, Quảng Nam · 2010
            </footer>
          </blockquote>
        </div>
      </SectionReveal>
    </div>
  </section>
)

// ---- Quick Navigation ----
const QuickNavSection = () => {
  const members = useMembersStore((s) => s.members)
  const { generationCount } = getMemberSummary(members)

  const navCards = [
    {
      title: 'Gia phả',
      subtitle: `Sơ đồ cây gia phả ${generationCount} thế hệ`,
      path: ROUTES.TREE,
      icon: HiOutlineCollection,
    },
    {
      title: 'Lịch sử',
      subtitle: `${familyTimeline.length} sự kiện lịch sử quan trọng`,
      path: ROUTES.TIMELINE,
      icon: HiOutlineDocumentText,
    },
    {
      title: 'Nghi lễ',
      subtitle: 'Lịch giỗ chạp và lễ truyền thống',
      path: ROUTES.CALENDAR,
      icon: HiOutlineCalendar,
    },
    {
      title: 'Nhà thờ họ',
      subtitle: 'Di sản và gia huấn dòng tộc',
      path: ROUTES.TEMPLE,
      icon: HiOutlineHome,
    },
    {
      title: 'Hình ảnh',
      subtitle: 'Album ký ức nhiều thế hệ',
      path: ROUTES.GALLERY,
      icon: HiOutlinePhotograph,
    },
    {
      title: 'Hoạt động',
      subtitle: 'Trò chơi và câu hỏi gia tộc',
      path: ROUTES.ACTIVITIES,
      icon: HiOutlinePuzzle,
    },
  ]

  return (
    <section className="cinematic-section border-t border-bronze/10">
      <div className="section-container">
        <SectionReveal>
          <SectionHeader
            badge="Khám phá"
            title="Nền tảng gia phả"
            subtitle="Hệ thống đầy đủ để lưu giữ và truyền tải di sản dòng họ qua nhiều thế hệ."
          />
        </SectionReveal>

        <motion.div
          variants={motionVariants.staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollConfig.viewport}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {navCards.map((card) => (
            <motion.div key={card.path} variants={motionVariants.staggerItem}>
              <Link
                to={card.path}
                className="block glass-card rounded-lg p-6 group hover:border-bronze/40 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <IconChip icon={card.icon} size="lg" hoverable className="mt-0.5" />
                  <div>
                    <h3 className="font-display text-primary text-sm tracking-wider mb-1 group-hover:text-bronze transition-colors">
                      {card.title}
                    </h3>
                    <p className="font-body text-faint text-xs leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                  <HiArrowRight
                    className="ml-auto mt-0.5 flex-shrink-0 text-subtle transition-all duration-200 group-hover:translate-x-1 group-hover:text-bronze/60"
                    size={14}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export {
  SectionReveal,
  SectionHeader,
  OverviewStats,
  FeaturedMembersSection,
  LegacyQuoteSection,
  QuickNavSection,
}