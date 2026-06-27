import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowDown } from 'react-icons/hi'
import AtmosphericBackground from '@/components/common/AtmosphericBackground'
import { APP_CONFIG, ROUTES } from '@/constants'
import { motionVariants } from '@/lib/motion'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'
import { getMemberSummary } from '@/utils'

const HeroSection = () => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 120])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const isDark = useAppStore((s) => s.isDark)
  const members = useMembersStore((s) => s.members)
  const { total, generationCount } = getMemberSummary(members)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero — Giới thiệu dòng họ"
    >
      {/* Atmospheric background */}
      <AtmosphericBackground />

      {/* Parallax content wrapper */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Pre-title badge */}
          <motion.div
            variants={motionVariants.cinematicFade}
            className="badge-bronze mb-8"
          >
            <span className="w-4 h-px bg-bronze/50 inline-block" />
            <span>Thành lập {APP_CONFIG.founded}</span>
            <span className="w-4 h-px bg-bronze/50 inline-block" />
          </motion.div>

          {/* Main clan name */}
          <motion.h1
            variants={motionVariants.heroReveal}
            className="mb-2 font-display text-hero leading-none text-primary text-shadow-bronze"
          >
            Dòng họ
          </motion.h1>
          <motion.h1
            variants={motionVariants.heroReveal}
            className="font-display text-hero text-bronze text-shadow-glow mb-8 leading-none"
          >
            {APP_CONFIG.clannName}
          </motion.h1>

          {/* Decorative divider */}
          <motion.div
            variants={motionVariants.lineGrow}
            className="flex items-center gap-4 justify-center mb-8"
          >
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-bronze/50" />
            <div className="w-1.5 h-1.5 bg-bronze/50 rotate-45" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-bronze/50" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={motionVariants.fadeUp}
            className="mb-4 font-heading text-cinematic italic text-secondary"
          >
            {APP_CONFIG.subtitle}
          </motion.p>

          {/* Village origin */}
          <motion.p
            variants={motionVariants.fadeUp}
            className="mb-14 font-body text-sm uppercase tracking-[0.2em] text-muted"
          >
            {APP_CONFIG.village} · {generationCount} Thế hệ · 100+ Năm
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={motionVariants.staggerContainer}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div variants={motionVariants.staggerItem}>
              <Link
                to={ROUTES.TREE}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-bronze/10 border border-bronze/40 text-bronze font-body text-sm tracking-[0.15em] uppercase hover:bg-bronze/20 hover:border-bronze/70 transition-all duration-300"
              >
                <span>Khám phá gia phả</span>
                <span className="w-4 h-px bg-bronze/60 group-hover:w-6 transition-all duration-300" />
              </Link>
            </motion.div>
            <motion.div variants={motionVariants.staggerItem}>
              <Link
                to={ROUTES.TIMELINE}
                className="group inline-flex items-center gap-3 border border-ivory/15 px-8 py-4 font-body text-sm uppercase tracking-[0.15em] text-secondary transition-all duration-300 hover:border-ivory/30 hover-text-primary"
              >
                <span>Lịch sử gia tộc</span>
              </Link>
            </motion.div>
            <motion.div variants={motionVariants.staggerItem}>
              <Link
                to={ROUTES.CALENDAR}
                className="group inline-flex items-center gap-3 border border-ivory/15 px-8 py-4 font-body text-sm uppercase tracking-[0.15em] text-secondary transition-all duration-300 hover:border-ivory/30 hover-text-primary"
              >
                <span>Nghi lễ dòng họ</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-subtle">
          Cuộn xuống
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HiArrowDown className="text-bronze/40" size={16} />
        </motion.div>
      </motion.div>

      {/* Generation stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-bronze/10"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(31,26,23,0.9), rgba(44,36,31,0.95), rgba(31,26,23,0.9))'
            : 'linear-gradient(90deg, rgba(237,228,211,0.92), rgba(250,244,232,0.95), rgba(237,228,211,0.92))',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-bronze/10">
            {[
              { label: 'Thế hệ', value: generationCount },
              { label: 'Thành viên', value: total },
              { label: 'Năm lịch sử', value: '100+' },
              { label: 'Nghi lễ / năm', value: '12' },
            ].map((stat) => (
              <div key={stat.label} className="py-4 px-6 text-center">
                <p className="font-display text-bronze text-xl mb-1">{stat.value}</p>
                <p className="font-body text-xs tracking-wider uppercase text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection