import React from 'react'
import { motion } from 'framer-motion'
import HeritageMap from '@/features/map/HeritageMap'
import { motionVariants } from '@/lib/motion'

const MapPage = () => (
  <div className="min-h-screen bg-obsidian pt-20">
    <motion.div
      variants={motionVariants.fadeUp}
      initial="hidden"
      animate="visible"
      className="section-container py-8 border-b border-bronze/10"
    >
      <div className="badge-bronze inline-flex mb-3">Bản đồ</div>
      <h1 className="mb-2 font-display text-display text-primary">Bản đồ di sản</h1>
      <p className="max-w-lg font-body text-sm text-secondary">
        Hành trình phân bổ và di cư của dòng họ Lê Văn trên khắp Việt Nam.
      </p>
    </motion.div>
    <div className="section-container py-10">
      <HeritageMap />
    </div>
  </div>
)

export default MapPage