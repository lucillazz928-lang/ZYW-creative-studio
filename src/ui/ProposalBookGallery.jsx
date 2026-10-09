import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { proposalBooks, proposalBooksIntro } from '../content/works'
import './ProposalBookGallery.css'

/** 合书速度对齐 CodePen：单页 0.5s + 页间 0.1s 错峰 */
const SNAP_PAGE_MS = 500
const SNAP_STAGGER_MS = 100

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}

/**
 * 3D Book Gallery — port of CodePen RNRaXwZ (Daniel Muñoz).
 * 直接进入翻页场景；底部导航切换两本策划案。
 * @param {{ onClose: () => void }} props
 */
export function ProposalBookGallery({ onClose }) {
  const reducedMotion = useReducedMotion()
  const [activeBookId, setActiveBookId] = useState(
    () => proposalBooks[0]?.id ?? null,
  )
  const [openPages, setOpenPages] = useState(() => new Set())
  const [isSnappingShut, setIsSnappingShut] = useState(false)
  const [readyThrough, setReadyThrough] = useState(2)
  const snapTimerRef = useRef(0)

  const activeBook = useMemo(
    () => proposalBooks.find((book) => book.id === activeBookId) ?? proposalBooks[0],
    [activeBookId],
  )

  const pageCount = activeBook?.pages.length ?? 0
  const lastPageIndex = Math.max(0, pageCount - 1)
  const maxOpen = openPages.size ? Math.max(...openPages) : -1
  const imageLimit = Math.max(readyThrough, maxOpen)

  useEffect(() => {
    setReadyThrough(2)
  }, [activeBookId])

  useEffect(() => {
    if (readyThrough >= pageCount - 1) return undefined
    const id = window.setTimeout(() => {
      setReadyThrough((current) => Math.min(pageCount - 1, current + 2))
    }, 240)
    return () => window.clearTimeout(id)
  }, [readyThrough, pageCount, activeBookId])
  const anyPageOpen = openPages.size > 0
  const allPagesOpen = pageCount > 0 && openPages.size === pageCount

  const closeAllPages = useCallback(() => {
    setOpenPages(new Set())
  }, [])

  const snapShutToCover = useCallback(() => {
    if (isSnappingShut) return
    window.clearTimeout(snapTimerRef.current)

    if (reducedMotion) {
      setOpenPages(new Set())
      setIsSnappingShut(false)
      return
    }

    setIsSnappingShut(true)
    setOpenPages(new Set())
    const totalMs = SNAP_PAGE_MS + SNAP_STAGGER_MS * Math.max(0, pageCount - 1) + 80
    snapTimerRef.current = window.setTimeout(() => {
      setIsSnappingShut(false)
    }, totalMs)
  }, [isSnappingShut, pageCount, reducedMotion])

  const togglePage = useCallback(
    (index) => {
      if (isSnappingShut) return

      // 翻到最后一页后再点最后一页：整本快速翻回封面
      if (allPagesOpen && index === lastPageIndex) {
        snapShutToCover()
        return
      }

      setReadyThrough((current) => Math.max(current, index + 2))
      setOpenPages((prev) => {
        const next = new Set(prev)
        if (next.has(index)) next.delete(index)
        else next.add(index)
        return next
      })
    },
    [allPagesOpen, isSnappingShut, lastPageIndex, snapShutToCover],
  )

  useEffect(() => {
    return () => window.clearTimeout(snapTimerRef.current)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (anyPageOpen || isSnappingShut) {
        if (allPagesOpen) snapShutToCover()
        else closeAllPages()
        return
      }
      onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [allPagesOpen, anyPageOpen, closeAllPages, isSnappingShut, onClose, snapShutToCover])

  if (!activeBook) return null

  return (
    <div
      className={`proposal-book proposal-book--scene${anyPageOpen || isSnappingShut ? ' proposal-book--open' : ''}${reducedMotion ? ' proposal-book--reduced' : ''}`}
      aria-label={`${activeBook.titleZh} 翻页画册`}
      style={{ '--proposal-accent': activeBook.accent || '#2a2a2a' }}
      onClick={() => {
        if (isSnappingShut) return
        if (allPagesOpen) snapShutToCover()
        else closeAllPages()
      }}
    >
      <button
        type="button"
        className="proposal-book__gallery-back"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
      >
        ← BACK TO GALLERY
      </button>

      <p className="proposal-book__flip-hint" aria-hidden="true">
        {allPagesOpen
          ? '再点末页回到封面 · click last page to close'
          : proposalBooksIntro.flipHint}
      </p>

      <div className="proposal-book__bg-type" aria-hidden="true">
        <span>{activeBook.titleWords[0]}</span>
        <span>{activeBook.titleWords[1]}</span>
      </div>

      <div
        className={`proposal-book__stack${anyPageOpen || isSnappingShut ? ' is-book-open' : ''}${allPagesOpen && !isSnappingShut ? ' is-fully-open' : ''}${isSnappingShut ? ' is-snapping-shut' : ''}`}
        style={{
          '--proposal-last-i': lastPageIndex,
          '--snap-stagger': `${SNAP_STAGGER_MS}ms`,
          '--snap-duration': `${SNAP_PAGE_MS}ms`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {activeBook.pages.map((page, index) => {
          const isOpen = openPages.has(index)
          const isLast = index === lastPageIndex
          const showImage = index <= imageLimit
          return (
            <button
              key={`${activeBook.id}-${index}`}
              type="button"
              className={`proposal-book__page${isOpen ? ' is-open' : ''}`}
              style={{ '--i': index }}
              aria-pressed={isOpen}
              disabled={isSnappingShut}
              aria-label={
                allPagesOpen && isLast
                  ? '快速翻回封面'
                  : isOpen
                    ? `合上第 ${index + 1} 页`
                    : `翻开第 ${index + 1} 页：${page.frontAlt}`
              }
              onClick={() => togglePage(index)}
            >
              <img
                src={showImage ? page.front : undefined}
                alt={page.frontAlt}
                draggable={false}
                decoding="async"
              />
              <img
                src={showImage ? page.back : undefined}
                alt={page.backAlt}
                draggable={false}
                decoding="async"
              />
            </button>
          )
        })}
      </div>

      <nav className="proposal-book__switch" aria-label="切换策划案" onClick={(e) => e.stopPropagation()}>
        {proposalBooks.map((book) => (
          <button
            key={book.id}
            type="button"
            className={`proposal-book__switch-btn${book.id === activeBook.id ? ' is-active' : ''}`}
            onClick={() => {
              window.clearTimeout(snapTimerRef.current)
              setIsSnappingShut(false)
              setOpenPages(new Set())
              setActiveBookId(book.id)
            }}
          >
            {book.titleZh}
          </button>
        ))}
      </nav>
    </div>
  )
}
