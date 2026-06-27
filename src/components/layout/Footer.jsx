import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { APP_CONFIG, PRIMARY_NAV_ITEMS, EXPLORE_NAV_ITEMS } from '@/constants'
import { motionVariants, scrollConfig } from '@/lib/motion'
import { useAppStore } from '@/stores/appStore'

const FooterNavSection = ({ title, description, items, showSummary = false }) => (
  <motion.div
    variants={motionVariants.staggerItem}
    initial="hidden"
    whileInView="visible"
    viewport={scrollConfig.viewport}
  >
    <h4 className="font-display text-bronze/80 text-xs tracking-[0.3em] uppercase mb-3">
      {title}
    </h4>
    <p className="mb-6 text-xs leading-relaxed text-faint">
      {/* {description} */}
    </p>
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className="group block"
          >
            <p className="font-body text-sm text-secondary transition-colors duration-200 group-hover:text-bronze/80">
              {item.label}
            </p>
            {showSummary && item.summary && (
              <p className="mt-1 text-xs leading-relaxed text-subtle transition-colors duration-200 group-hover:text-bronze/60">
                {item.summary}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  </motion.div>
)

const Footer = () => {
  const isDark = useAppStore((s) => s.isDark)
  return (
    <footer className={clsx('relative border-t', isDark ? 'bg-lacquer border-bronze/10' : 'bg-parchment border-bronze/20')}>
      {/* Top bronze line */}
      <div className="divider-bronze" />

      <div className="section-container py-16 md:py-18 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 xl:grid-cols-4 xl:gap-10">
          <motion.div
            variants={motionVariants.staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={scrollConfig.viewport}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border border-bronze/40 rotate-45" />
                <div className="absolute inset-1.5 border border-bronze/20 rotate-45" />
              </div>
              <div>
                <p className="font-display text-bronze text-base tracking-[0.2em] uppercase">
                  {APP_CONFIG.clannName}
                </p>
                <p className="font-body text-xs tracking-widest text-faint">
                  Gia phả dòng họ
                </p>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed max-w-xs text-secondary">
              {APP_CONFIG.subtitle}
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-xs font-body text-muted">
                Khai lập: {APP_CONFIG.founded}
              </p>
              <p className="text-xs font-body text-muted">
                {APP_CONFIG.village}
              </p>
              <p className="text-bronze/60 text-xs font-body tracking-widest uppercase">
                {APP_CONFIG.totalGenerations} thế hệ
              </p>
            </div>
          </motion.div>

          <FooterNavSection
            title="Mục chính"
            description="Bốn lối vào cốt lõi để xem tổng quan, mở cây gia phả, theo dõi lịch sử và tra cứu nghi lễ."
            items={PRIMARY_NAV_ITEMS}
          />

          <FooterNavSection
            title="Khám phá"
            description="Các chủ đề mở rộng được gom vào một cụm riêng để đi nhanh tới đúng nội dung khi cần đào sâu."
            items={EXPLORE_NAV_ITEMS}
            showSummary
          />

          <motion.div
            variants={motionVariants.staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={scrollConfig.viewport}
          >
            <h4 className="font-display text-bronze/80 text-xs tracking-[0.3em] uppercase mb-3">
              Di sản
            </h4>
            <p className="mb-6 text-xs leading-relaxed text-faint">
              {/* Giữ một điểm neo cảm xúc ở cuối trang, sau lớp điều hướng và tra cứu nhanh phía trên. */}
            </p>
            <blockquote className="border-l-2 border-bronze/30 pl-4">
              <p className="font-heading text-secondary italic text-sm leading-relaxed">
                "Cội nguồn không thể phai mờ — dù con cháu có đi đâu, dòng họ vẫn là ngôi nhà tinh thần."
              </p>
              <footer className="mt-3 text-bronze/50 text-xs font-body tracking-wider">
                — Khắc tại Nhà thờ họ Lê Văn, 2010
              </footer>
            </blockquote>
          </motion.div>
        </div>

        <motion.div
          variants={motionVariants.staggerItem}
          initial="hidden"
          whileInView="visible"
          viewport={scrollConfig.viewport}
          className={clsx(
            'mt-14 rounded-[1.75rem] border px-5 py-5 sm:px-6 sm:py-6 lg:mt-16 lg:px-8',
            isDark
              ? 'border-bronze/12 bg-obsidian/45 shadow-deep'
              : 'border-bronze/18 bg-ivory/80 shadow-glass'
          )}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="text-center md:text-left">
              <p className="font-display text-[10px] tracking-[0.32em] uppercase text-bronze/70">
                Gia phả số
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted">
                © Gia phả dòng họ {APP_CONFIG.clannName} · {APP_CONFIG.village}
              </p>
            </div>

            <div className="divider-bronze md:hidden" />
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer