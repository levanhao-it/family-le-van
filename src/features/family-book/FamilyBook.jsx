import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import HTMLFlipBook from 'react-pageflip'
import { HiChevronLeft, HiChevronRight, HiDownload } from 'react-icons/hi'
import { useMembersStore } from '@/stores/membersStore'
import { APP_CONFIG, GENERATION_LABELS, ROLE_LABELS } from '@/constants'

// ── Color palette ─────────────────────────────────────────────────────────
const C = {
  paper: '#F5EDD8',   // warm cream — light pages
  paper2: '#EDE3C8',   // slightly darker cream
  paper3: '#E2D4B0',   // darkest cream (chapter emblem bg)
  ink: '#1A0900',   // near-black ink
  ink2: '#3D1E08',   // dark brown — body text
  ink3: '#6B4020',   // medium brown — secondary text
  amber: '#7A5010',   // dark amber — readable on cream (contrast ~4.5:1)
  gold: '#C9A84C',   // light gold — only for DARK (cover) pages
  cover: '#110700',
  cover2: '#1B0F04',
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

// ── Build flat page list ──────────────────────────────────────────────────
function buildPages(members) {
  const pages = []
  const tocChapters = []

  pages.push({ type: 'cover' })
  pages.push({ type: 'toc-left' })
  pages.push({ type: 'toc-right', chapters: tocChapters })

  const byGen = {}
  members.forEach((m) => { (byGen[m.generation] ??= []).push(m) })

  let num = 1
  Object.entries(byGen)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([gen, genMembers]) => {
      const generation = Number(gen)
      if (pages.length % 2 === 0) pages.push({ type: 'blank' })
      tocChapters.push({ generation, count: genMembers.length, pageIdx: pages.length, firstMemberPage: num })
      pages.push({ type: 'chapter-emblem', generation })
      pages.push({ type: 'chapter-title', generation, count: genMembers.length })
      genMembers.forEach((member) => {
        pages.push({ type: 'member', member, pageNum: num++, side: pages.length % 2 === 1 ? 'left' : 'right' })
      })
    })

  pages.push({ type: 'back-cover', totalMembers: members.length })
  return pages
}

// ── Shared micro-components ───────────────────────────────────────────────
const HRule = ({ opacity = 1, my = 10 }) => (
  <div style={{
    height: 1, flexShrink: 0, margin: `${my}px 0`,
    background: `linear-gradient(90deg,transparent,rgba(140,106,67,${opacity * 0.55}),transparent)`,
  }} />
)

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexShrink: 0 }}>
    <span style={{ minWidth: 34, fontWeight: 700, fontSize: 11, color: C.ink, fontFamily: 'Be Vietnam Pro,sans-serif', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 11, color: C.ink3, fontFamily: 'Be Vietnam Pro,sans-serif', lineHeight: 1.4 }}>{value}</span>
  </div>
)

// SVG frame drawn at viewBox size so it always fills 100%×100% of page
const PageFrame = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
    viewBox="0 0 440 608"
    preserveAspectRatio="none"
  >
    <rect x="10" y="10" width="420" height="588" rx="1" fill="none" stroke="rgba(140,106,67,0.3)" strokeWidth="1" />
    <path d="M10 10 L46 10 L46 14 L14 14 L14 46 L10 46 Z" fill="rgba(201,168,76,0.17)" />
    <path d="M430 10 L394 10 L394 14 L426 14 L426 46 L430 46 Z" fill="rgba(201,168,76,0.17)" />
    <path d="M10 598 L46 598 L46 594 L14 594 L14 562 L10 562 Z" fill="rgba(201,168,76,0.17)" />
    <path d="M430 598 L394 598 L394 594 L426 594 L426 562 L430 562 Z" fill="rgba(201,168,76,0.17)" />
  </svg>
)

// ── Page render functions — plain JSX, no forwardRef needed ───────────────

function PageCover() {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      background: `linear-gradient(150deg,${C.cover2},${C.cover})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 32px', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(201,168,76,0.2)', borderRadius: 2, pointerEvents: 'none' }} />
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 34, color: C.gold, fontWeight: 700 }}>
          {APP_CONFIG.clannName.charAt(0)}
        </span>
      </div>
      <div style={{ fontSize: 7, lineHeight: 1, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: 14, fontFamily: 'Be Vietnam Pro,sans-serif', textAlign: 'center' }}>
        Gia Phả Số · Dòng Họ
      </div>
      <div style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 700, color: C.gold, textAlign: 'center', marginBottom: 14, fontFamily: 'Playfair Display,serif' }}>
        {APP_CONFIG.clannName}
      </div>
      <div style={{ width: 44, height: 1, backgroundColor: C.gold, margin: '0 auto 14px' }} />
      <div style={{ fontSize: 10, lineHeight: 1.7, color: 'rgba(201,168,76,0.82)', fontStyle: 'italic', textAlign: 'center', fontFamily: 'Be Vietnam Pro,sans-serif', marginBottom: 20 }}>
        {APP_CONFIG.subtitle}
      </div>
      <div style={{ fontSize: 8, lineHeight: 1, letterSpacing: '0.18em', color: 'rgba(201,168,76,0.45)', fontFamily: 'Be Vietnam Pro,sans-serif', textAlign: 'center' }}>
        Lập từ năm {APP_CONFIG.founded}
      </div>
      <div style={{ position: 'absolute', bottom: 22, fontSize: 7.5, lineHeight: 1.4, color: 'rgba(201,168,76,0.3)', letterSpacing: '0.1em', fontFamily: 'Be Vietnam Pro,sans-serif', textAlign: 'center', maxWidth: '76%' }}>
        {APP_CONFIG.village}
      </div>
    </div>
  )
}

function PageTocLeft() {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      backgroundColor: C.paper2,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', position: 'relative',
    }}>
      <PageFrame />
      <div style={{ fontSize: 7, lineHeight: 1, letterSpacing: '0.4em', textTransform: 'uppercase', color: C.amber, marginBottom: 12, fontFamily: 'Be Vietnam Pro,sans-serif', textAlign: 'center', position: 'relative', zIndex: 2 }}>Gia phả dòng họ</div>
      <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 700, color: C.ink, marginBottom: 0, fontFamily: 'Playfair Display,serif', textAlign: 'center', position: 'relative', zIndex: 2 }}>Mục Lục</div>
      <div style={{ width: 34, height: 1, backgroundColor: C.amber, margin: '16px auto', position: 'relative', zIndex: 2 }} />
      <div style={{ fontSize: 10, lineHeight: 1.7, color: C.ink3, textAlign: 'center', fontFamily: 'Be Vietnam Pro,sans-serif', position: 'relative', zIndex: 2 }}>
        Các thế hệ được sắp xếp<br />theo thứ tự từ thủy tổ<br />đến hậu duệ.
      </div>
    </div>
  )
}

function PageTocRight({ chapters, onGoTo }) {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      backgroundColor: C.paper,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '28px 32px', position: 'relative',
    }}>
      <PageFrame />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {chapters.map((ch, i) => (
          <button
            key={ch.generation}
            onClick={() => onGoTo(ch.pageIdx)}
            style={{
              display: 'flex', alignItems: 'center', padding: '9px 0', width: '100%',
              background: 'none', cursor: 'pointer', textAlign: 'left',
              border: 'none', borderBottom: i < chapters.length - 1 ? '1px solid rgba(140,106,67,0.22)' : 'none',
            }}
          >
            <span style={{ fontSize: 8, color: C.amber, letterSpacing: '0.2em', marginRight: 10, minWidth: 20, fontFamily: 'Be Vietnam Pro,sans-serif' }}>
              {ROMAN[ch.generation - 1] ?? ch.generation}
            </span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: C.ink, fontFamily: 'Playfair Display,serif' }}>
              {GENERATION_LABELS[ch.generation] ?? `Đời ${ch.generation}`}
            </span>
            <span style={{ fontSize: 10, color: C.ink3, fontFamily: 'Be Vietnam Pro,sans-serif', marginLeft: 8 }}>{ch.count} người</span>
            <span style={{ fontSize: 9, color: C.amber, fontFamily: 'Be Vietnam Pro,sans-serif', marginLeft: 14, minWidth: 16, textAlign: 'right' }}>{ch.firstMemberPage}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function PageChapterEmblem({ generation }) {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      backgroundColor: C.paper2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <PageFrame />
      <div style={{
        width: 136, height: 136, borderRadius: '50%', position: 'relative', zIndex: 2,
        border: '1px solid rgba(140,106,67,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '1px solid rgba(140,106,67,0.1)' }} />
        <span style={{ fontSize: 48, fontWeight: 700, color: 'rgba(122,80,16,0.36)', fontFamily: 'Playfair Display,serif', lineHeight: 1 }}>
          {ROMAN[generation - 1] ?? generation}
        </span>
      </div>
    </div>
  )
}

function PageChapterTitle({ generation, count }) {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      backgroundColor: C.paper,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 36px 32px 40px', position: 'relative',
    }}>
      <PageFrame />
      <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div style={{ width: 28, height: 1, backgroundColor: C.amber, marginBottom: 18 }} />
        <div style={{ fontSize: 7.5, lineHeight: 1, letterSpacing: '0.35em', textTransform: 'uppercase', color: C.amber, marginBottom: 10, fontFamily: 'Be Vietnam Pro,sans-serif' }}>
          Chương {ROMAN[generation - 1] ?? generation}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.15, fontWeight: 700, color: C.ink, marginBottom: 16, fontFamily: 'Playfair Display,serif' }}>
          {GENERATION_LABELS[generation] ?? `Đời ${generation}`}
        </div>
        <div style={{ width: '50%', height: 1, background: 'linear-gradient(90deg,rgba(140,106,67,0.52),transparent)', marginBottom: 18 }} />
        <div style={{ fontSize: 11, lineHeight: 1.65, color: C.ink3, fontFamily: 'Be Vietnam Pro,sans-serif' }}>
          {count} thành viên được ghi nhận<br />trong thế hệ này.
        </div>
      </div>
    </div>
  )
}

function PageMember({ member, pageNum, side }) {
  const birthYear = member.birthDate?.split('-')[0] ?? '—'
  const deathYear = member.isAlive ? 'Nay' : (member.deathDate?.split('-')[0] ?? '—')
  const lifespan = member.birthDate ? `${birthYear}${(member.deathDate || !member.isAlive) ? ` – ${deathYear}` : ''}` : '—'
  const roleLabel = ROLE_LABELS[member.role]

  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      backgroundColor: C.paper,
      display: 'flex', flexDirection: 'column',
      padding: '28px 24px 28px', position: 'relative',
      boxShadow: side === 'left' ? 'inset -10px 0 20px rgba(0,0,0,0.04)' : 'inset 10px 0 20px rgba(0,0,0,0.04)',
    }}>
      {/* Aged texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at ${side === 'left' ? '70%' : '30%'} 55%, rgba(210,195,158,0.28) 0%, transparent 60%)`,
      }} />
      <PageFrame />

      {/* Content — zIndex 2 sits above frame SVG */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Generation badge */}
        <span style={{
          alignSelf: 'flex-start', flexShrink: 0,
          padding: '2px 8px', marginBottom: 12,
          border: '1px solid rgba(122,80,16,0.42)',
          backgroundColor: 'rgba(122,80,16,0.07)',
          color: C.amber, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase',
          fontFamily: 'Be Vietnam Pro,sans-serif', borderRadius: 2,
        }}>
          {GENERATION_LABELS[member.generation] ?? `Đời ${member.generation}`}
          {member.branch ? ` · Chi ${member.branch}` : ''}
        </span>

        {/* Avatar */}
        <div style={{
          width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
          border: '2px solid rgba(122,80,16,0.32)',
          backgroundColor: 'rgba(122,80,16,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10, overflow: 'hidden',
        }}>
          {member.avatar
            ? <img src={member.avatar} alt={member.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, color: C.amber, fontWeight: 700 }}>
              {member.fullName.charAt(0)}
            </span>
          }
        </div>

        {/* Name */}
        <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, color: C.ink, margin: '0 0 3px', fontFamily: 'Playfair Display,serif', flexShrink: 0 }}>
          {member.fullName}
        </h3>
        {member.nickname && (
          <p style={{ fontSize: 10, fontStyle: 'italic', color: C.ink3, margin: '0 0 2px', fontFamily: 'Be Vietnam Pro,sans-serif', flexShrink: 0 }}>
            "{member.nickname}"
          </p>
        )}
        {roleLabel && member.role !== 'member' && (
          <p style={{ fontSize: 7.5, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '2px 0 0', fontFamily: 'Be Vietnam Pro,sans-serif', flexShrink: 0 }}>
            {roleLabel}
          </p>
        )}

        <HRule my={8} />

        {member.deathDate && <InfoRow label="Ngày, tháng, năm sinh" value={lifespan} />}
        {member.deathDate && <InfoRow label="Ngày, tháng, năm mất" value={member.deathDate} />}
        <InfoRow label="Giới tính" value={member.gender === "male" ? "Nam" : member.gender === "female" ? "Nữ" : "Khác"} />
        {member.location && <InfoRow label="Quê quán" value={member.location} />}
        {member.occupation && <InfoRow label="Nghề nghiệp" value={member.occupation} />}

        <HRule my={8} opacity={0.5} />

        {/* Biography — flex:1 wrapper + overflow hidden + bottom fade */}
        {member.biography && (
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
            <p style={{ fontSize: 10, lineHeight: 1.7, color: C.ink3, margin: 0, fontFamily: 'Be Vietnam Pro,sans-serif', whiteSpace: 'pre-wrap' }}>
              {member.biography}
            </p>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
              background: `linear-gradient(rgba(245,237,216,0), ${C.paper})`,
              pointerEvents: 'none',
            }} />
          </div>
        )}
      </div>

      {/* Page number */}
      <span style={{
        position: 'absolute', bottom: 13, zIndex: 3,
        [side === 'left' ? 'left' : 'right']: 22,
        fontSize: 7.5, color: C.amber, letterSpacing: '0.16em',
        fontFamily: 'Be Vietnam Pro,sans-serif',
      }}>
        {pageNum}
      </span>
    </div>
  )
}

function PageBlank() {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      backgroundColor: C.paper2, position: 'relative',
    }}>
      <PageFrame />
    </div>
  )
}

function PageBackCover({ totalMembers }) {
  return (
    <div style={{
      width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden',
      background: `linear-gradient(150deg,${C.cover2},${C.cover})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 36, position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(201,168,76,0.18)', borderRadius: 2, pointerEvents: 'none' }} />

      <div style={{ fontSize: 28, lineHeight: 1, color: 'rgba(201,168,76,0.24)', fontFamily: 'Playfair Display,serif', marginBottom: 22, textAlign: 'center' }}>✦</div>

      <div style={{ fontSize: 8, lineHeight: 1, color: 'rgba(201,168,76,0.65)', letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'Be Vietnam Pro,sans-serif', marginBottom: 14, textAlign: 'center' }}>
        Ghi nhận
      </div>

      <div style={{ fontSize: 44, lineHeight: 1, fontWeight: 700, color: C.gold, fontFamily: 'Playfair Display,serif', marginBottom: 12, textAlign: 'center' }}>
        {totalMembers}
      </div>

      <div style={{ fontSize: 10, lineHeight: 1, color: 'rgba(201,168,76,0.65)', fontFamily: 'Be Vietnam Pro,sans-serif', textAlign: 'center' }}>
        thành viên · {APP_CONFIG.totalGenerations} thế hệ
      </div>
    </div>
  )
}

// ── Nav button ────────────────────────────────────────────────────────────
const NavBtn = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
    border: `1px solid rgba(122,80,16,${disabled ? '0.15' : '0.4'})`,
    backgroundColor: `rgba(122,80,16,${disabled ? '0.04' : '0.1'})`,
    color: disabled ? 'rgba(122,80,16,0.25)' : C.amber,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s',
  }}>
    {children}
  </button>
)

// ── Main ──────────────────────────────────────────────────────────────────
const FamilyBook = () => {
  const members = useMembersStore((s) => s.members)
  const bookRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const pages = useMemo(() => buildPages(members), [members])

  const handleFlip = useCallback((e) => setCurrentPage(e.data), [])
  const handleInit = useCallback((e) => setTotalPages(e.object.getPageCount()), [])
  const flipNext = useCallback(() => bookRef.current?.pageFlip().flipNext(), [])
  const flipPrev = useCallback(() => bookRef.current?.pageFlip().flipPrev(), [])
  const goToPage = useCallback((idx) => bookRef.current?.pageFlip().flip(idx), [])

  // ── PDF download ────────────────────────────────────────────────────────
  const downloadPDF = useCallback(async () => {
    if (isDownloading) return
    setIsDownloading(true)

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const PAGE_W = 440
      const PAGE_H = 608

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [PAGE_W * 2, PAGE_H],
      })

      // Off-screen container to render each spread before capturing
      const container = document.createElement('div')
      Object.assign(container.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        width: `${PAGE_W * 2}px`,
        height: `${PAGE_H}px`,
        overflow: 'hidden',
        backgroundColor: C.paper2,
      })
      document.body.appendChild(container)
      const root = createRoot(container)

      const pageJSX = (page) => {
        if (!page) return <PageBlank />
        if (page.type === 'cover') return <PageCover />
        if (page.type === 'toc-left') return <PageTocLeft />
        if (page.type === 'toc-right') return <PageTocRight chapters={page.chapters} onGoTo={() => { }} />
        if (page.type === 'chapter-emblem') return <PageChapterEmblem generation={page.generation} />
        if (page.type === 'chapter-title') return <PageChapterTitle generation={page.generation} count={page.count} />
        if (page.type === 'member') return <PageMember member={page.member} pageNum={page.pageNum} side={page.side} />
        if (page.type === 'back-cover') return <PageBackCover totalMembers={page.totalMembers} />
        return <PageBlank />
      }

      // Build spreads matching react-pageflip showCover=true layout:
      //   - Spread 0      : [blank, cover]       — cover is solo on the RIGHT
      //   - Spreads 1…n-1 : interior pairs from pages[1] to pages[N-2]
      //   - Spread last   : [back-cover, blank]  — back-cover is solo on the LEFT
      //
      // IMPORTANT: slice(1, -1) explicitly excludes cover & back-cover so they
      // cannot accidentally end up in an interior pair when pages.length is odd.
      const interiorPages = pages.slice(1, -1)
      const pdfSpreads = [
        [null, pages[0]],                           // cover spread
        ...Array.from({ length: Math.ceil(interiorPages.length / 2) }, (_, i) => [
          interiorPages[i * 2],
          interiorPages[i * 2 + 1] ?? null,
        ]),
        [pages[pages.length - 1], null],            // back-cover spread
      ]

      for (let si = 0; si < pdfSpreads.length; si++) {
        const [left, right] = pdfSpreads[si]

        await new Promise((resolve) => {
          root.render(
            <div style={{ display: 'flex', width: PAGE_W * 2, height: PAGE_H, backgroundColor: C.paper2 }}>
              <div style={{ width: PAGE_W, height: PAGE_H, flexShrink: 0 }}>
                {pageJSX(left)}
              </div>
              <div style={{ width: PAGE_W, height: PAGE_H, flexShrink: 0, borderLeft: '1px solid rgba(140,106,67,0.3)' }}>
                {pageJSX(right)}
              </div>
            </div>
          )
          // 2 animation frames (~32ms) is enough for DOM to paint — faster than setTimeout(120)
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        })

        const canvas = await html2canvas(container, {
          width: PAGE_W * 2,
          height: PAGE_H,
          backgroundColor: C.paper2,
          scale: 1,          // scale=1 is sufficient for PDF; scale=1.5 was 2.25× slower
          useCORS: true,
          logging: false,
        })

        if (si > 0) pdf.addPage()
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.82), 'JPEG', 0, 0, PAGE_W * 2, PAGE_H)
      }

      root.unmount()
      document.body.removeChild(container)
      pdf.save(`Gia-Pha-${APP_CONFIG.clannName.replace(/\s+/g, '-')}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }, [pages, isDownloading])

  useEffect(() => {
    const h = (e) => { if (e.key === 'ArrowRight') flipNext(); else if (e.key === 'ArrowLeft') flipPrev() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [flipNext, flipPrev])

  const active = pages[currentPage]
  const label =
    !active ? '—'
      : active.type === 'cover' ? 'Bìa sách'
        : active.type === 'back-cover' ? 'Cuối sách'
          : active.type === 'toc-left'
            || active.type === 'toc-right' ? 'Mục lục'
            : active.type === 'chapter-emblem'
              || active.type === 'chapter-title' ? `${GENERATION_LABELS[active.generation] ?? `Đời ${active.generation}`}`
              : active.type === 'member' ? `Trang ${active.pageNum}`
                : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 12px 48px' }}>
      {/* Cream wrapper — prevents app dark-mode background from bleeding through pages */}
      <div style={{
        width: '100%', maxWidth: 960,
        backgroundColor: C.paper2,
        borderRadius: 4,
        boxShadow: '0 0 0 1px rgba(140,106,67,0.2), 0 32px 72px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.28)',
      }}>
        <HTMLFlipBook
          ref={bookRef}
          width={440}
          height={608}
          size="stretch"
          minWidth={240}
          maxWidth={480}
          minHeight={340}
          maxHeight={680}
          showCover
          drawShadow
          flippingTime={720}
          maxShadowOpacity={0.35}
          showPageCorners
          usePortrait
          mobileScrollSupport
          autoSize
          startZIndex={10}
          style={{ display: 'block' }}
          onFlip={handleFlip}
          onInit={handleInit}
        >
          {pages.map((p, i) => {
            if (p.type === 'cover') return <div key={i}><PageCover /></div>
            if (p.type === 'toc-left') return <div key={i}><PageTocLeft /></div>
            if (p.type === 'toc-right') return <div key={i}><PageTocRight chapters={p.chapters} onGoTo={goToPage} /></div>
            if (p.type === 'chapter-emblem') return <div key={i}><PageChapterEmblem generation={p.generation} /></div>
            if (p.type === 'chapter-title') return <div key={i}><PageChapterTitle generation={p.generation} count={p.count} /></div>
            if (p.type === 'member') return <div key={i}><PageMember member={p.member} pageNum={p.pageNum} side={p.side} /></div>
            if (p.type === 'back-cover') return <div key={i}><PageBackCover totalMembers={p.totalMembers} /></div>
            return <div key={i}><PageBlank /></div>
          })}
        </HTMLFlipBook>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24 }}>
        <NavBtn onClick={flipPrev} disabled={currentPage === 0}><HiChevronLeft size={18} /></NavBtn>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <p style={{ margin: 0, fontSize: 10, color: C.amber, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Be Vietnam Pro,sans-serif' }}>{label}</p>
          <p style={{ margin: 0, fontSize: 9, color: 'rgba(122,80,16,0.5)', letterSpacing: '0.14em', fontFamily: 'Be Vietnam Pro,sans-serif' }}>
            {currentPage + 1} / {totalPages || pages.length}
          </p>
        </div>
        <NavBtn onClick={flipNext} disabled={currentPage >= pages.length - 1}><HiChevronRight size={18} /></NavBtn>
      </div>

      {/* Download button */}
      <button
        onClick={downloadPDF}
        disabled={isDownloading}
        style={{
          marginTop: 16,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px',
          border: `1px solid rgba(122,80,16,${isDownloading ? '0.18' : '0.42'})`,
          borderRadius: 999,
          backgroundColor: `rgba(122,80,16,${isDownloading ? '0.04' : '0.10'})`,
          color: isDownloading ? 'rgba(122,80,16,0.35)' : C.amber,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
          fontFamily: 'Be Vietnam Pro,sans-serif',
          cursor: isDownloading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <HiDownload size={14} />
        {isDownloading ? 'Đang tạo PDF...' : 'Tải xuống PDF'}
      </button>

      <p style={{ marginTop: 10, fontSize: 8, color: 'rgba(122,80,16,0.32)', letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'Be Vietnam Pro,sans-serif' }}>
        ← → phím mũi tên để lật trang
      </p>
    </div>
  )
}

export default FamilyBook