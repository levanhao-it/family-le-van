import React from 'react'
import { motion } from 'framer-motion'
import FamilyTemple from '@/features/temple/FamilyTemple'
import { motionVariants } from '@/lib/motion'

const TemplePage = () => (
  <div className="min-h-screen bg-obsidian pt-20">
    <div className="section-container py-10">
      <FamilyTemple />
    </div>
  </div>
)

export default TemplePage