import React from 'react'
import HeroSection from '@/features/hero/HeroSection'
import {
  OverviewStats,
  FeaturedMembersSection,
  LegacyQuoteSection,
  QuickNavSection,
} from '@/features/home/HomeSections'

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <OverviewStats />
      <FeaturedMembersSection />
      <LegacyQuoteSection />
      <QuickNavSection />
    </>
  )
}

export default HomePage