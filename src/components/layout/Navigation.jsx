import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX, HiVolumeUp, HiVolumeOff, HiSun, HiMoon, HiSearch, HiChevronDown, HiArrowRight } from 'react-icons/hi'
import { clsx } from 'clsx'
import { APP_CONFIG, ROUTES, GENERATION_LABELS, PRIMARY_NAV_ITEMS, EXPLORE_NAV_ITEMS } from '@/constants'
import { useAppStore } from '@/stores/appStore'
import { useMembersStore } from '@/stores/membersStore'
import { motionVariants } from '@/lib/motion'

const Navigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')
  const [memberResultsOpen, setMemberResultsOpen] = useState(false)
  const exploreRef = useRef(null)
  const desktopSearchRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const members = useMembersStore((s) => s.members)
  const {
    sidebarOpen,
    setSidebarOpen,
    audioEnabled,
    setAudioEnabled,
    isDark,
    toggleTheme,
    setZoomToMemberId,
  } = useAppStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
    setExploreOpen(false)
    setMemberResultsOpen(false)
    setMemberQuery('')
  }, [location.pathname, setSidebarOpen])

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target

      if (exploreRef.current && !exploreRef.current.contains(target)) {
        setExploreOpen(false)
      }

      const insideSearch = [desktopSearchRef.current, mobileSearchRef.current].some(
        (element) => element && element.contains(target)
      )

      if (!insideSearch) {
        setMemberResultsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setExploreOpen(false)
        setMemberResultsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const isActive = (path) => location.pathname === path
  const isExploreActive = EXPLORE_NAV_ITEMS.some((item) => isActive(item.path))

  const memberMatches = useMemo(() => {
    const query = memberQuery.trim().toLowerCase()
    if (!query) return []

    return members
      .filter((member) => {
        const fields = [member.fullName, member.nickname, member.location]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return fields.includes(query)
      })
      .sort((a, b) => {
        const aStarts = a.fullName.toLowerCase().startsWith(query) ? 1 : 0
        const bStarts = b.fullName.toLowerCase().startsWith(query) ? 1 : 0
        if (aStarts !== bStarts) return bStarts - aStarts
        return a.generation - b.generation || a.fullName.localeCompare(b.fullName, 'vi')
      })
      .slice(0, 6)
  }, [memberQuery, members])

  const handleMemberJump = (member) => {
    setZoomToMemberId(member.id)
    setSidebarOpen(false)
    setExploreOpen(false)
    setMemberResultsOpen(false)
    setMemberQuery('')
    navigate(ROUTES.TREE)
  }

  const handleMemberSearchKeyDown = (event) => {
    if (event.key === 'Enter' && memberMatches[0]) {
      event.preventDefault()
      handleMemberJump(memberMatches[0])
    }
  }

  const renderMemberSearchResults = (mobile = false) => {
    if (!memberResultsOpen || !memberQuery.trim()) return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.18 }}
          className={clsx(
            'absolute z-50 mt-3 overflow-hidden rounded-2xl border backdrop-blur-xl',
            mobile ? 'left-0 right-0' : 'right-0 w-[22rem]',
            isDark
              ? 'bg-charcoal/95 border-bronze/15 shadow-deep'
              : 'bg-ivory/95 border-bronze/20 shadow-glass'
          )}
        >
          <div className={clsx('px-4 py-3 border-b', isDark ? 'border-bronze/10' : 'border-bronze/15')}>
            <p className="font-display text-[11px] tracking-[0.28em] uppercase text-bronze/70">
              Tìm thành viên
            </p>
            <p className="mt-1 text-xs text-faint">
              Enter để mở kết quả đầu tiên hoặc chọn trực tiếp trong danh sách.
            </p>
          </div>

          {memberMatches.length > 0 ? (
            <div className="p-2">
              {memberMatches.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberJump(member)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
                    isDark
                      ? 'hover:bg-white/5'
                      : 'hover:bg-bronze/5'
                  )}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-bronze/25 bg-bronze/10">
                    <span className="font-display text-sm text-bronze">{member.fullName.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm text-primary">
                      {member.fullName}
                    </p>
                    <p className="truncate text-xs text-faint">
                      {GENERATION_LABELS[member.generation] || `Thế hệ ${member.generation}`}
                      {member.nickname ? ` · ${member.nickname}` : ''}
                      {!member.nickname && member.location ? ` · ${member.location}` : ''}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-bronze/60">
                    Mở
                    <HiArrowRight size={12} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm text-muted">
              Không tìm thấy thành viên khớp với “{memberQuery.trim()}”.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? isDark
              ? 'bg-obsidian/95 backdrop-blur-md border-b border-bronze/10 shadow-deep py-3'
              : 'bg-ivory/95 backdrop-blur-md border-b border-bronze/20 shadow-glass py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="section-container flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border border-bronze/30 rotate-45 group-hover:border-bronze/60 transition-colors duration-300" />
              <div className="absolute inset-1 border border-bronze/20 rotate-45" />
            </div>
            <div>
              <p className="font-display text-bronze text-sm tracking-[0.2em] uppercase leading-none">
                {APP_CONFIG.clannName}
              </p>
              <p className="font-body text-[10px] tracking-widest uppercase text-faint">
                Gia phả dòng họ
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'relative px-4 py-2 font-body text-xs tracking-widest uppercase transition-colors duration-200',
                  isActive(item.path)
                    ? 'text-bronze'
                    : 'text-muted hover-text-primary'
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-bronze rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <div ref={desktopSearchRef} className="relative hidden xl:block">
              <div
                className={clsx(
                  'flex min-w-[19rem] items-center gap-2 rounded-full border px-3 py-2 transition-all duration-200',
                  isDark
                    ? 'border-bronze/15 bg-obsidian/70 text-muted focus-within:border-bronze/40'
                    : 'border-bronze/20 bg-ivory/80 text-muted focus-within:border-bronze/40'
                )}
              >
                <HiSearch className="text-bronze/55" size={15} />
                <input
                  value={memberQuery}
                  onChange={(event) => {
                    setMemberQuery(event.target.value)
                    setMemberResultsOpen(true)
                  }}
                  onFocus={() => setMemberResultsOpen(Boolean(memberQuery.trim()))}
                  onKeyDown={handleMemberSearchKeyDown}
                  type="search"
                  placeholder="Tìm nhanh thành viên để mở trên cây..."
                  className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-current placeholder:opacity-40"
                />
                {memberQuery && (
                  <button
                    onClick={() => {
                      setMemberQuery('')
                      setMemberResultsOpen(false)
                    }}
                    className="text-subtle transition-colors duration-200 hover-text-secondary"
                    aria-label="Xóa tìm kiếm"
                  >
                    <HiX size={14} />
                  </button>
                )}
              </div>
              {renderMemberSearchResults()}
            </div>

            <div ref={exploreRef} className="relative hidden lg:block">
              <button
                onClick={() => setExploreOpen((open) => !open)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-body text-xs tracking-[0.16em] uppercase transition-all duration-200',
                  exploreOpen || isExploreActive
                    ? 'border-bronze/40 bg-bronze/10 text-bronze'
                    : isDark
                      ? 'border-bronze/10 text-muted hover:border-bronze/25 hover-text-secondary'
                      : 'border-bronze/15 text-muted hover:border-bronze/25 hover-text-secondary'
                )}
              >
                <span>Khám phá</span>
                <HiChevronDown className={clsx('transition-transform duration-200', exploreOpen && 'rotate-180')} size={14} />
              </button>

              <AnimatePresence>
                {exploreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                      'absolute right-0 mt-3 w-[28rem] overflow-hidden rounded-3xl border backdrop-blur-xl',
                      isDark
                        ? 'border-bronze/15 bg-charcoal/95 shadow-deep'
                        : 'border-bronze/20 bg-ivory/95 shadow-glass'
                    )}
                  >
                    <div className={clsx('px-5 py-4 border-b', isDark ? 'border-bronze/10' : 'border-bronze/15')}>
                      <p className="font-display text-[11px] tracking-[0.32em] uppercase text-bronze/70">
                        Khám phá chuyên mục
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Gom các trang phụ vào một cụm điều hướng gọn hơn, vẫn đi nhanh tới đúng nội dung.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3">
                      {EXPLORE_NAV_ITEMS.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={clsx(
                            'group rounded-2xl border p-4 transition-all duration-200',
                            isActive(item.path)
                              ? 'border-bronze/35 bg-bronze/10'
                              : isDark
                                ? 'border-bronze/10 hover:border-bronze/25 hover:bg-white/5'
                                : 'border-bronze/10 hover:border-bronze/25 hover:bg-bronze/5'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={clsx('font-heading text-sm', isActive(item.path) ? 'text-bronze' : 'text-primary')}>
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-faint">
                                {item.summary}
                              </p>
                            </div>
                            <HiArrowRight className="mt-0.5 flex-shrink-0 text-bronze/55 transition-transform duration-200 group-hover:translate-x-1" size={14} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              className="p-2 text-faint transition-colors duration-200 hover:text-bronze"
            >
              {isDark ? <HiSun size={16} /> : <HiMoon size={16} />}
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              aria-label={audioEnabled ? 'Tắt âm nhạc nền' : 'Bật âm nhạc nền'}
              className="p-2 text-faint transition-colors duration-200 hover:text-bronze"
            >
              {audioEnabled ? <HiVolumeUp size={16} /> : <HiVolumeOff size={16} />}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Menu"
              className="lg:hidden p-2 text-muted transition-colors duration-200 hover:text-bronze"
            >
              {sidebarOpen ? <HiX size={20} /> : <HiMenu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              variants={motionVariants.overlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSidebarOpen(false)}
              className={clsx('fixed inset-0 z-40 backdrop-blur-sm', isDark ? 'bg-obsidian/80' : 'bg-charcoal/20')}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={clsx('fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col border-l', isDark ? 'bg-charcoal border-bronze/10' : 'bg-parchment border-bronze/20')}
            >
              <div className={clsx('flex items-center justify-between px-6 py-5 border-b', isDark ? 'border-bronze/10' : 'border-bronze/20')}>
                <span className="font-display text-bronze text-sm tracking-widest uppercase">
                  Menu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-muted hover:text-bronze"
                >
                  <HiX size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <div ref={mobileSearchRef} className="relative mb-8">
                  <p className="mb-3 font-display text-[11px] tracking-[0.28em] uppercase text-bronze/65">
                    Tìm nhanh thành viên
                  </p>
                  <div
                    className={clsx(
                      'flex items-center gap-2 rounded-2xl border px-3 py-3 transition-all duration-200',
                      isDark
                        ? 'border-bronze/15 bg-obsidian/55'
                        : 'border-bronze/20 bg-ivory/80'
                    )}
                  >
                    <HiSearch className="text-bronze/55" size={15} />
                    <input
                      value={memberQuery}
                      onChange={(event) => {
                        setMemberQuery(event.target.value)
                        setMemberResultsOpen(true)
                      }}
                      onFocus={() => setMemberResultsOpen(Boolean(memberQuery.trim()))}
                      onKeyDown={handleMemberSearchKeyDown}
                      type="search"
                      placeholder="Nhập tên để nhảy tới cây gia phả"
                      className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-current placeholder:opacity-40"
                    />
                    {memberQuery && (
                      <button
                        onClick={() => {
                          setMemberQuery('')
                          setMemberResultsOpen(false)
                        }}
                        className="text-subtle transition-colors duration-200 hover-text-secondary"
                        aria-label="Xóa tìm kiếm"
                      >
                        <HiX size={14} />
                      </button>
                    )}
                  </div>
                  {renderMemberSearchResults(true)}
                </div>

                <div className="mb-8">
                  <p className="mb-3 font-display text-[11px] tracking-[0.28em] uppercase text-bronze/65">
                    Mục chính
                  </p>
                  {PRIMARY_NAV_ITEMS.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.35 }}
                    >
                      <Link
                        to={item.path}
                        className={clsx(
                          'mb-1 flex items-center gap-3 rounded-xl px-4 py-3.5 font-body text-sm tracking-wider transition-all duration-200',
                          isActive(item.path)
                            ? 'border border-bronze/20 bg-bronze/10 text-bronze'
                            : isDark
                              ? 'text-muted hover:bg-white/5 hover-text-primary'
                              : 'text-muted hover:bg-bronze/5 hover-text-primary'
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-display text-[11px] tracking-[0.28em] uppercase text-bronze/65">
                      Khám phá
                    </p>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-subtle">
                      {EXPLORE_NAV_ITEMS.length} trang
                    </span>
                  </div>
                  <div className="space-y-2">
                    {EXPLORE_NAV_ITEMS.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + index * 0.05, duration: 0.35 }}
                      >
                        <Link
                          to={item.path}
                          className={clsx(
                            'block rounded-2xl border p-4 transition-all duration-200',
                            isActive(item.path)
                              ? 'border-bronze/20 bg-bronze/10'
                              : isDark
                                ? 'border-bronze/10 hover:border-bronze/25 hover:bg-white/5'
                                : 'border-bronze/10 hover:border-bronze/25 hover:bg-bronze/5'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={clsx('font-heading text-sm', isActive(item.path) ? 'text-bronze' : 'text-primary')}>
                                {item.label}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-faint">
                                {item.summary}
                              </p>
                            </div>
                            <HiArrowRight className="mt-0.5 flex-shrink-0 text-bronze/55" size={14} />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </nav>
              <div className={clsx('px-6 py-4 border-t', isDark ? 'border-bronze/10' : 'border-bronze/20')}>
                <p className="text-xs text-center font-body text-subtle">
                  © {APP_CONFIG.name}
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navigation