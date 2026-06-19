import React from 'react'
import { clsx } from 'clsx'
import Navigation from './Navigation'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'

const MainLayout = () => {
  const isDark = useAppStore((s) => s.isDark)
  return (
    <div className={clsx('min-h-screen', isDark ? 'bg-obsidian atmospheric-bg' : 'bg-ivory light-bg')}>
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout