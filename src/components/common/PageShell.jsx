import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { HiArrowRight } from 'react-icons/hi'
import { motionVariants } from '@/lib/motion'
import { useAppStore } from '@/stores/appStore'

export const PageShellAction = ({ to, children }) => {
  const isDark = useAppStore((s) => s.isDark)

  return (
    <Link
      to={to}
      className={clsx(
        'group inline-flex items-center gap-3 rounded-full border px-5 py-3 font-body text-[11px] tracking-[0.22em] uppercase text-secondary transition-all duration-300',
        isDark
          ? 'border-ivory/12 bg-ivory/5 hover:border-bronze/35 hover:bg-bronze/10 hover:text-bronze'
          : 'border-bronze/18 bg-white/40 hover:border-bronze/35 hover:bg-bronze/10 hover:text-bronze'
      )}
    >
      <span>{children}</span>
      <HiArrowRight
        size={14}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  )
}

const PageShell = ({
  badge,
  title,
  description,
  stats = [],
  action = null,
  toolbar = null,
  children,
  contentClassName = '',
}) => {
  const isDark = useAppStore((s) => s.isDark)

  const headerBackground = isDark
    ? {
      background: 'radial-gradient(circle at 14% 18%, rgba(232,201,154,0.14), transparent 32%), radial-gradient(circle at 86% 12%, rgba(74,124,111,0.12), transparent 24%), linear-gradient(180deg, rgba(45,34,24,0.92) 0%, rgba(45,34,24,0.68) 100%)',
    }
    : {
      background: 'radial-gradient(circle at 14% 18%, rgba(201,168,76,0.16), transparent 32%), radial-gradient(circle at 86% 12%, rgba(140,106,67,0.12), transparent 24%), linear-gradient(180deg, rgba(250,244,232,0.96) 0%, rgba(248,240,226,0.82) 100%)',
    }

  return (
    <div className={clsx('min-h-screen pt-20', isDark ? 'bg-obsidian' : 'bg-ivory')}>
      <section
        className={clsx(
          'relative overflow-hidden border-b',
          isDark ? 'border-bronze/10' : 'border-bronze/15'
        )}
      >
        <div className="absolute inset-0 pointer-events-none" style={headerBackground} />
        <div className="absolute inset-x-0 bottom-0 divider-bronze opacity-80" />

        <motion.div
          variants={motionVariants.staggerContainer}
          initial="hidden"
          animate="visible"
          className="section-container relative py-10 lg:py-14"
        >
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <motion.div variants={motionVariants.staggerItem}>
              <div className="badge-bronze inline-flex mb-4">{badge}</div>
              <h1 className="font-display text-display leading-tight text-primary xl:max-w-4xl">
                {title}
              </h1>
              <p
                className="mt-4 max-w-3xl font-body text-sm leading-relaxed text-secondary md:text-base"
              >
                {description}
              </p>
              {toolbar && <div className="mt-6">{toolbar}</div>}
            </motion.div>

            {action && (
              <motion.div variants={motionVariants.staggerItem} className="xl:justify-self-end xl:pt-2">
                {action}
              </motion.div>
            )}
          </div>

          {stats.length > 0 && (
            <motion.div
              variants={motionVariants.staggerItem}
              className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={clsx(
                    'rounded-[1.4rem] border px-4 py-4 backdrop-blur-sm sm:px-5',
                    isDark
                      ? 'border-bronze/10 bg-obsidian/45 shadow-deep'
                      : 'border-bronze/15 bg-ivory/72 shadow-glass'
                  )}
                >
                  <p className="font-display text-[10px] tracking-[0.28em] uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-3 font-display text-2xl leading-none text-primary md:text-[2rem]">
                    {stat.value}
                  </p>
                  {stat.detail && (
                    <p className="mt-3 font-body text-xs leading-relaxed text-faint">
                      {stat.detail}
                    </p>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {contentClassName ? <div className={contentClassName}>{children}</div> : children}
    </div>
  )
}

export default PageShell