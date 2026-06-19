import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronRight, HiChevronLeft, HiRefresh, HiCheck } from 'react-icons/hi'
import { familyQuestions, questionCategories, getRandomQuestions } from '@/data'
import { useAppStore } from '@/stores/appStore'

// ── Theme tokens ──────────────────────────────────────────────
const makeTheme = (isDark) => ({
  cardFrontBg: isDark ? 'rgba(28,22,18,0.97)' : 'rgba(255,252,246,0.98)',
  cardBackBg: isDark ? 'rgba(42,32,16,0.97)' : 'rgba(255,248,234,0.98)',
  cardFrontBd: isDark ? 'rgba(214,185,140,0.2)' : 'rgba(122,74,24,0.2)',
  cardBackBd: isDark ? 'rgba(201,168,76,0.3)' : 'rgba(122,91,10,0.35)',
  optionBg: isDark ? 'rgba(214,185,140,0.05)' : 'rgba(122,74,24,0.05)',
  optionBd: isDark ? 'rgba(214,185,140,0.1)' : 'rgba(122,74,24,0.12)',
  ctrlBd: isDark ? 'rgba(214,185,140,0.15)' : 'rgba(122,74,24,0.18)',
})

const QuestionCards = () => {
  const isDark = useAppStore((s) => s.isDark)
  const T = makeTheme(isDark)
  const [activeCategory, setActiveCategory] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [answered, setAnswered] = useState([])
  const [score, setScore] = useState(0)

  const cards =
    activeCategory === 'all'
      ? getRandomQuestions(10)
      : familyQuestions.filter((q) => q.category === activeCategory)

  const current = cards[currentIndex]

  const handleNext = useCallback(() => {
    setFlipped(false)
    setTimeout(() => setCurrentIndex((i) => Math.min(i + 1, cards.length - 1)), 150)
  }, [cards.length])

  const handlePrev = useCallback(() => {
    setFlipped(false)
    setTimeout(() => setCurrentIndex((i) => Math.max(i - 1, 0)), 150)
  }, [])

  const handleMarkAnswered = () => {
    if (!answered.includes(current?.id)) {
      setAnswered((prev) => [...prev, current.id])
      if (current.points) setScore((s) => s + current.points)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setFlipped(false)
    setAnswered([])
    setScore(0)
  }

  if (!current) return null

  const difficultyColor = {
    easy: '#4A7C6F',
    medium: '#C9A84C',
    hard: '#C0392B',
    open: '#6B8CAE',
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Category selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => {
            setActiveCategory('all')
            setCurrentIndex(0)
            setFlipped(false)
          }}
          className={`px-4 py-2 text-xs font-body tracking-wider uppercase rounded-sm transition-all duration-200 ${activeCategory === 'all'
              ? 'bg-bronze/20 text-bronze border border-bronze/40'
              : 'border border-ivory/10 text-muted hover:border-bronze/20 hover-text-secondary'
            }`}
        >
          Ngẫu nhiên
        </button>
        {questionCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id)
              setCurrentIndex(0)
              setFlipped(false)
            }}
            className={`px-4 py-2 text-xs font-body tracking-wider uppercase rounded-sm transition-all duration-200 ${activeCategory === cat.id
                ? 'border text-primary'
                : 'border border-ivory/10 text-muted hover:border-bronze/20 hover-text-secondary'
              }`}
            style={
              activeCategory === cat.id
                ? { borderColor: cat.color, background: `${cat.color}15`, color: cat.color }
                : {}
            }
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="w-full max-w-md">
        <div className="mb-2 flex items-center justify-between font-body text-xs text-muted">
          <span>{currentIndex + 1} / {cards.length}</span>
          <span className="text-bronze/70">Điểm: {score}</span>
        </div>
        <div className="h-0.5 bg-ivory/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-bronze/60 rounded-full"
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md" style={{ perspective: 1000, minHeight: 220 }}>
        <motion.div
          className="relative w-full cursor-pointer"
          style={{ transformStyle: 'preserve-3d', minHeight: 220 }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => current.answer && setFlipped(!flipped)}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-xl p-6 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              background: T.cardFrontBg,
              border: `1px solid ${T.cardFrontBd}`,
              boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
              minHeight: 220,
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div
                className="badge-bronze text-[9px]"
                style={{
                  color: difficultyColor[current.difficulty] || '#D6B98C',
                  borderColor: `${difficultyColor[current.difficulty]}40`,
                }}
              >
                {questionCategories.find((c) => c.id === current.category)?.icon}{' '}
                {current.categoryLabel}
              </div>
              {current.difficulty !== 'open' && (
                <span
                  className="text-[9px] tracking-wider uppercase font-body"
                  style={{ color: difficultyColor[current.difficulty] }}
                >
                  +{current.points} pts
                </span>
              )}
            </div>

            <p className="flex-1 font-heading text-base font-medium leading-snug text-primary">
              {current.question}
            </p>

            {current.hint && (
              <p className="mt-3 font-body text-xs italic text-faint">💡 {current.hint}</p>
            )}

            {current.options && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {current.options.map((opt) => (
                  <div
                    key={opt}
                    className="rounded-sm px-3 py-2 text-center font-body text-xs text-secondary"
                    style={{ background: T.optionBg, border: `1px solid ${T.optionBd}` }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}

            {current.answer && (
              <p className="mt-4 font-body text-xs tracking-wider uppercase text-bronze/70">
                Lật thẻ để xem đáp án →
              </p>
            )}
          </div>

          {/* Back (answer) */}
          <div
            className="absolute inset-0 rounded-xl p-6 flex flex-col justify-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: T.cardBackBg,
              border: `1px solid ${T.cardBackBd}`,
              boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
              minHeight: 220,
            }}
          >
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase font-body mb-3">
              Đáp án
            </p>
            <p className="font-body text-sm leading-relaxed text-primary">{current.answer}</p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-lg p-2.5 text-muted transition-colors disabled:opacity-20 hover-text-primary"
          style={{ border: `1px solid ${T.ctrlBd}` }}
        >
          <HiChevronLeft size={18} />
        </button>

        <button
          onClick={handleMarkAnswered}
          disabled={answered.includes(current.id) || current.difficulty === 'open'}
          className="flex items-center gap-2 px-4 py-2 text-xs font-body tracking-wider uppercase transition-all duration-200 disabled:opacity-30"
          style={{
            background: answered.includes(current.id) ? 'rgba(74,124,111,0.2)' : 'rgba(74,124,111,0.1)',
            border: '1px solid rgba(74,124,111,0.3)',
            color: '#4A7C6F',
            borderRadius: '4px',
          }}
        >
          <HiCheck size={12} />
          {answered.includes(current.id) ? 'Đã trả lời' : 'Chấm điểm'}
        </button>

        <button
          onClick={handleReset}
          className="rounded-lg p-2.5 text-muted transition-colors hover:text-bronze"
          style={{ border: `1px solid ${T.ctrlBd}` }}
          aria-label="Làm lại"
        >
          <HiRefresh size={18} />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="rounded-lg p-2.5 text-muted transition-colors disabled:opacity-20 hover-text-primary"
          style={{ border: `1px solid ${T.ctrlBd}` }}
        >
          <HiChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default QuestionCards