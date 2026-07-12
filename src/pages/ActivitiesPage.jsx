import React, { useState } from 'react'
import { motion } from 'framer-motion'
import LuckyWheel from '@/features/activities/LuckyWheel'
import QuestionCards from '@/features/activities/QuestionCards'
import { motionVariants } from '@/lib/motion'

const ActivitiesPage = () => {
  const [activeTab, setActiveTab] = useState('wheel')

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      <motion.div
        variants={motionVariants.fadeUp}
        initial="hidden"
        animate="visible"
        className="section-container py-8 border-b border-bronze/10"
      >
        <div className="badge-bronze inline-flex mb-3">Hoạt động</div>
        <h1 className="mb-2 font-display text-display text-primary">Kết nối gia tộc</h1>
        <p className="max-w-lg font-body text-sm text-secondary">
          Các hoạt động tương tác giúp con cháu biết về lịch sử, truyền thống dòng họ.
        </p>
      </motion.div>

      <div className="section-container py-10">
        {/* Tab selector */}
        <div className="flex gap-1 mb-10 border-b border-bronze/10">
          {[
            { id: 'wheel', label: '🎡 Vòng quay may mắn' },
            { id: 'cards', label: '🃏 Thẻ câu hỏi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-body tracking-wide border-b-2 -mb-px transition-all duration-200 ${activeTab === tab.id
                ? 'text-bronze border-bronze'
                : 'border-transparent text-muted hover-text-secondary'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'wheel' && (
          <motion.div
            key="wheel"
            variants={motionVariants.cinematicFade}
            initial="hidden"
            animate="visible"
          >
            <LuckyWheel />
          </motion.div>
        )}
        {activeTab === 'cards' && (
          <motion.div
            key="cards"
            variants={motionVariants.cinematicFade}
            initial="hidden"
            animate="visible"
          >
            <QuestionCards />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ActivitiesPage