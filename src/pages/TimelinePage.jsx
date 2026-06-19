import React from 'react'
import { motion } from 'framer-motion'
import FamilyTimeline from '@/features/timeline/FamilyTimeline'
import { motionVariants } from '@/lib/motion'

const TimelinePage = () => {
  return (
    <div className="min-h-screen bg-obsidian pt-20">
      <motion.div
        variants={motionVariants.fadeUp}
        initial="hidden"
        animate="visible"
        className="section-container py-8 border-b border-bronze/10"
      >
        <div className="badge-bronze inline-flex mb-3">Lịch sử</div>
        <h1 className="mb-2 font-display text-display text-primary">Kho tư liệu lịch sử</h1>
        <p className="max-w-lg font-body text-sm text-secondary">
          Mỗi mốc sự kiện được biên mục như một hồ sơ lịch sử, có nhân vật liên quan, địa điểm, mốc thời gian, nguồn đối chiếu và ghi chú xác minh.
        </p>
      </motion.div>
      <FamilyTimeline />
    </div>
  )
}

export default TimelinePage