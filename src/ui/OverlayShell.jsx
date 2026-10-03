import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { CloseButton } from './CloseButton'
import { CASE_TITLE, ContentLab } from './ContentLab'
import { IdCard } from './IdCard'
import { MessageWall } from './MessageWall'
import { SkillsShowcase } from './SkillsShowcase'
import { useInteraction } from '../state/interactionState'

const WorksGallery = lazy(() =>
  import('./WorksGallery').then((mod) => ({ default: mod.WorksGallery })),
)

const OVERLAY_COPY = {
  'content-lab': {
    titleZh: '项目案例',
    titleEn: 'PROJECTS',
    body: null,
  },
  'creative-process': {
    titleZh: '个人作品',
    titleEn: 'WORKS',
    body: null,
  },
  'data-evidence': {
    titleZh: '个人技能',
    titleEn: 'SKILLS',
    body: null,
  },
  identity: {
    titleZh: '基本信息',
    titleEn: 'ABOUT',
    body: null,
  },
  'message-wall': {
    titleZh: '留言墙',
    titleEn: 'MESSAGE WALL',
    body: null,
  },
}

function WorksFallback() {
  return <p className="works-gallery-fallback">作品加载中…</p>
}

export function OverlayShell() {
  const { overlayState, closeOverlay } = useInteraction()
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  const [contentCase, setContentCase] = useState(null)
  const [casePage, setCasePage] = useState('home')

  useEffect(() => {
    if (overlayState !== 'content-lab') {
      setContentCase(null)
      setCasePage('home')
    }
  }, [overlayState])

  useEffect(() => {
    if (!contentCase) setCasePage('home')
  }, [contentCase])

  useEffect(() => {
    if (!overlayState) return undefined

    const previous = document.activeElement
    if (!(contentCase && casePage !== 'home')) {
      closeRef.current?.focus()
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (overlayState === 'content-lab' && contentCase && casePage !== 'home') {
          setCasePage('home')
          return
        }
        if (overlayState === 'content-lab' && contentCase) {
          setContentCase(null)
          return
        }
        closeOverlay()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [overlayState, closeOverlay, contentCase, casePage])

  if (!overlayState) return null

  const copy = OVERLAY_COPY[overlayState] ?? {
    titleZh: '内容层',
    titleEn: 'OVERLAY',
    body: '内容即将补充。',
  }

  const wide = overlayState === 'message-wall'
  const centered =
    overlayState === 'message-wall' ||
    overlayState === 'content-lab' ||
    overlayState === 'data-evidence' ||
    overlayState === 'creative-process'
  const identity = overlayState === 'identity'
  const contentLab = overlayState === 'content-lab'
  const skills = overlayState === 'data-evidence'
  const works = overlayState === 'creative-process'
  const flat = contentLab || skills || works || identity
  const contentCaseOpen = contentLab && Boolean(contentCase)
  const caseSubPage = contentCaseOpen && casePage !== 'home'
  const hideChromeTitle = contentCaseOpen || identity

  return (
    <div
      className={`overlay-shell${flat ? ' overlay-shell--flat' : ''}${contentCaseOpen ? ' overlay-shell--case' : ''}${identity ? ' overlay-shell--about' : ''}`}
      role="presentation"
    >
      <section
        ref={panelRef}
        className={`overlay-panel${wide ? ' overlay-panel--wide' : ''}${centered ? ' overlay-panel--centered' : ''}${identity ? ' overlay-panel--about' : ''}${contentLab ? ' overlay-panel--content-lab' : ''}${contentCaseOpen ? ' overlay-panel--content-case' : ''}${caseSubPage ? ' overlay-panel--case-sub' : ''}${skills ? ' overlay-panel--flat' : ''}${works ? ' overlay-panel--works' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
      >
        {!caseSubPage ? <CloseButton ref={closeRef} onClick={closeOverlay} /> : null}
        {!hideChromeTitle ? (
          <>
            <p className="en-label">{copy.titleEn}</p>
            <h2 id="overlay-title">{copy.titleZh}</h2>
          </>
        ) : contentCaseOpen ? (
          <h2 id="overlay-title" className="visually-hidden">
            {CASE_TITLE[contentCase] || '项目案例'}
          </h2>
        ) : null}
        {overlayState === 'message-wall' ? <MessageWall /> : null}
        {identity ? <IdCard /> : null}
        {contentLab ? (
          <ContentLab
            activeCase={contentCase}
            onOpenCase={(id) => {
              setCasePage('home')
              setContentCase(id)
            }}
            onBackCase={() => setContentCase(null)}
            casePage={casePage}
            onCasePageChange={setCasePage}
          />
        ) : null}
        {skills ? <SkillsShowcase /> : null}
        {works ? (
          <Suspense fallback={<WorksFallback />}>
            <WorksGallery />
          </Suspense>
        ) : null}
        {copy.body ? <p>{copy.body}</p> : null}
      </section>
    </div>
  )
}
