import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { familyRules, legacyQuotes } from '@/data'
import { motionVariants, scrollConfig } from '@/lib/motion'

// ---- Ancestral Hall visual ----
const AncestralHallHero = () => (
  <div className="relative py-16 text-center overflow-hidden">
    {/* Background glow */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 70%)',
      }}
    />

    <div className="relative z-10">
      {/* Temple icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border border-bronze/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-bronze/30 flex items-center justify-center">
              <span className="text-3xl">⛩</span>
            </div>
          </div>
          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-bronze/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>

      <div className="badge-bronze inline-flex mb-4">Di sản thiêng liêng</div>
      <h2 className="mb-4 font-display text-display text-primary">Nhà thờ họ Lê Văn</h2>
      <p className="mx-auto max-w-md font-body text-sm leading-relaxed text-secondary">
        Tọa lạc tại làng Thăng Bình, Quảng Nam — xây dựng từ 1890, đại trùng tu 2010.
        Nơi hội tụ hồn thiêng tổ tiên dòng họ Lê Văn.
      </p>
    </div>
  </div>
)

// ---- Family Rules ----
const FamilyRulesSection = () => {
  const [ref, inView] = useInView(scrollConfig.viewport)

  return (
    <div ref={ref} className="py-12">
      <div className="text-center mb-10">
        <div className="badge-bronze inline-flex mb-3">Gia huấn — 1930</div>
        <h3 className="mb-2 font-display text-xl text-primary">10 Điều Gia huấn dòng họ</h3>
        <p className="font-body text-xs text-muted">
          Do ông ... soạn thảo — còn lưu giữ bản gốc
        </p>
      </div>

      <motion.div
        variants={motionVariants.staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {familyRules.map((rule) => (
          <motion.div
            key={rule.order}
            variants={motionVariants.staggerItem}
            className="glass-card rounded-xl p-5 group hover:border-bronze/30 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center font-display text-sm"
                style={{
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  color: '#C9A84C',
                }}
              >
                {rule.order}
              </div>
              <div>
                <h4 className="mb-1 font-heading text-sm font-semibold text-primary">
                  {rule.title}
                </h4>
                <p className="font-body text-xs leading-relaxed text-secondary">{rule.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ---- Legacy Quotes Wall ----
const LegacyWall = () => {
  const [ref, inView] = useInView(scrollConfig.viewport)
  return (
    <div ref={ref} className="py-12 border-t border-bronze/10">
      <div className="text-center mb-10">
        <div className="badge-bronze inline-flex mb-3">Gia ngôn</div>
        <h3 className="font-display text-xl text-primary">Lời dạy qua các thế hệ</h3>
      </div>

      <motion.div
        variants={motionVariants.staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {legacyQuotes.map((q) => (
          <motion.div
            key={q.id}
            variants={motionVariants.staggerItem}
            className="glass-card rounded-xl p-6 flex flex-col"
          >
            <span className="text-bronze/30 text-4xl font-heading mb-3 leading-none">"</span>
            <p className="flex-1 font-heading text-sm italic leading-relaxed text-secondary">
              {q.quote}
            </p>
            <div className="mt-4 pt-4 border-t border-bronze/10">
              <p className="font-body text-bronze/70 text-xs font-medium">{q.author}</p>
              <p className="mt-0.5 font-body text-[10px] text-faint">{q.role} · {q.year}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ---- Main Temple Component ----
const FamilyTemple = () => (
  <div>
    <AncestralHallHero />
    <div className="divider-bronze" />
    <FamilyRulesSection />
    <LegacyWall />
  </div>
)

export default FamilyTemple