import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { videoBarItems, videoExpandIntro } from '../content/works'
import { CategoryVideoPoster } from './video/CategoryVideoPoster'
import { MarketingDoors } from './video/MarketingDoors'
import { FeedTalkDoors } from './video/FeedTalkDoors'
import './ExpandingBarMenus.css'

const ANIM_DURATION = 0.7
const ANIM_EASE = 'power2.inOut'
const CONTENT_EASE = 'power3.out'
const BAR_DELAY = 0.1

function collectPanelParts(panel) {
  if (!panel) return []
  if (panel.querySelector('.feed-talk')) {
    return [
      panel.querySelector('.feed-talk__head'),
      panel.querySelector('.feed-talk__stage'),
    ].filter(Boolean)
  }
  if (panel.querySelector('.mkt-doors')) {
    return [
      panel.querySelector('.mkt-doors__head'),
      panel.querySelector('.mkt-doors__list'),
    ].filter(Boolean)
  }
  if (panel.querySelector('.cat-video')) {
    return [
      panel.querySelector('.cat-video__head'),
      panel.querySelector('.cat-video__stage'),
    ].filter(Boolean)
  }
  return [
    panel.querySelector('.expand-bars__poster-img, .cat-video-poster__video'),
    panel.querySelector('.expand-bars__poster-title'),
    panel.querySelector('.expand-bars__box'),
    panel.querySelector('.expand-bars__number'),
    panel.querySelector('.expand-bars__poster-deco'),
  ].filter(Boolean)
}

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

function useIsNarrow() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return narrow
}

function CaretIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="15.7,16.6 11.1,12 15.7,7.4 14.3,6 8.3,12 14.3,18" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="icon-menu" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.8,6H0.1V3h23.7V6z M23.8,10.5H0.1v3h23.7V10.5z M14.2,18h-14v3h14V18z" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg className="icon-cross" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.1,12l7.3,7.3l-2.1,2.1L12,14.1l-7.3,7.3l-2.1-2.1L9.9,12L2.6,4.7l2.1-2.1L12,9.9l7.3-7.3l2.1,2.1L14.1,12z" />
    </svg>
  )
}

/**
 * Codrops Expanding Bar Menus Demo 1 — React + GSAP port.
 * @param {{ onClose: () => void, items?: typeof videoBarItems, intro?: typeof videoExpandIntro }} props
 */
export function ExpandingBarMenus({
  onClose,
  items = videoBarItems,
  intro = videoExpandIntro,
}) {
  const rootRef = useRef(null)
  const contentRef = useRef(null)
  const navRef = useRef(null)
  const tabRefs = useRef([])
  const barRefs = useRef([])
  const panelRefs = useRef([])
  const backRef = useRef(null)
  const stateRef = useRef({
    isOpen: false,
    isAnimating: false,
    current: -1,
    contentShown: false,
    dim: null,
    mobileNavVisible: false,
  })
  const reducedMotion = useReducedMotion()
  const isNarrow = useIsNarrow()
  const [isExpanded, setIsExpanded] = useState(false)
  const [mobileNavVisible, setMobileNavVisible] = useState(false)
  const [openIndex, setOpenIndex] = useState(-1)

  const closeTab = useCallback(() => {
    const state = stateRef.current
    if (!state.isOpen || state.isAnimating) return

    const idx = state.current
    const panel = panelRefs.current[idx]
    if (!panel) {
      state.isOpen = false
      setIsExpanded(false)
      return
    }

    const parts = collectPanelParts(panel)

    const finishCloseBars = () => {
      if (state._closingBars) return
      state._closingBars = true
      const tabs = tabRefs.current.filter(Boolean)
      const bars = barRefs.current.filter(Boolean)
      const duration = reducedMotion ? 0.01 : ANIM_DURATION

      const tl = gsap.timeline({
        onComplete: () => {
          state.isAnimating = false
          state.isOpen = false
          state.current = -1
          state.dim = null
          state._closingBars = false
          setIsExpanded(false)
          setOpenIndex(-1)
          tabs.forEach((tab) => {
            tab.style.zIndex = ''
          })
        },
      })

      tabs.forEach((tab, i) => {
        const delay = reducedMotion ? 0 : Math.abs(idx - i) * BAR_DELAY
        tl.to(tab, { x: 0, duration, ease: ANIM_EASE, overwrite: 'auto' }, delay)
      })
      bars.forEach((bar, i) => {
        const delay = reducedMotion ? 0 : Math.abs(idx - i) * BAR_DELAY
        tl.to(bar, { scaleX: 1, duration, ease: ANIM_EASE, overwrite: 'auto' }, delay)
      })
      if (contentRef.current) {
        tl.to(
          contentRef.current,
          {
            x: 0,
            duration,
            ease: ANIM_EASE,
            overwrite: 'auto',
          },
          Math.abs(idx - tabs.length) * (reducedMotion ? 0 : BAR_DELAY),
        )
      }
    }

    state.isAnimating = true
    gsap.killTweensOf(parts)
    gsap.killTweensOf(backRef.current)

    if (reducedMotion) {
      gsap.set(parts, { opacity: 0, x: 0, rotate: 0, scaleX: 1 })
      panel.style.opacity = 0
      panel.classList.remove('expand-bars__panel--current')
      state.contentShown = false
      gsap.set(backRef.current, { opacity: 0, scale: 0 })
      backRef.current?.classList.remove('is-visible')
      finishCloseBars()
      return
    }

    gsap.to(parts, {
      opacity: 0,
      x: (i) => -200 - i * 150,
      rotate: (i) => (i === 2 ? -40 : 0),
      duration: (i) => 0.6 + i * 0.1,
      delay: (i, _, arr) => (arr.length - i - 1) * 0.035,
      ease: ANIM_EASE,
      stagger: 0,
      onUpdate() {
        const progress = this.progress()
        if (progress > 0.2 && state.contentShown) {
          state.contentShown = false
          finishCloseBars()
        }
      },
      onComplete() {
        panel.style.opacity = 0
        panel.classList.remove('expand-bars__panel--current')
        if (state.contentShown) {
          state.contentShown = false
          finishCloseBars()
        }
      },
    })

    gsap.to(backRef.current, {
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'power3.out',
      onStart: () => backRef.current?.classList.remove('is-visible'),
    })
  }, [reducedMotion])

  const openTab = useCallback(
    (idx) => {
      const state = stateRef.current
      if (state.isOpen || state.isAnimating) return

      const tab = tabRefs.current[idx]
      if (!tab) return

      state.isAnimating = true
      state.current = idx
      state.contentShown = false
      setOpenIndex(idx)

      const bounds = tab.getBoundingClientRect()
      const winW = window.innerWidth
      const dim = {
        measure: bounds.width,
        position: bounds.left,
        win: winW,
      }
      state.dim = dim

      barRefs.current.forEach((bar) => {
        if (bar) bar.style.transformOrigin = '0% 50%'
      })
      tabRefs.current.forEach((el, i) => {
        if (el) el.style.zIndex = i === idx ? 100 : 1
      })

      const duration = reducedMotion ? 0.01 : ANIM_DURATION
      const tabs = tabRefs.current.filter(Boolean)
      const bars = barRefs.current.filter(Boolean)

      const delayFor = (i, cnt) => {
        if (reducedMotion || cnt <= 1 || BAR_DELAY === 0) return 0
        const total = cnt + 1
        const middle = Math.floor(total / 2)
        if (idx >= middle) {
          return i <= idx ? i * BAR_DELAY : (total - i - 1) * BAR_DELAY
        }
        return i < idx ? i * BAR_DELAY : (total - i - 1) * BAR_DELAY
      }

      const xFor = (i, cnt) => {
        if (i === idx || cnt === 1) return -dim.position
        return i > idx ? dim.win - (dim.position + dim.measure) - 1 : -dim.position + 1
      }

      const scaleFor = (i, cnt) => (i === idx || cnt === 1 ? dim.win / dim.measure : 1)

      let opened = false
      const revealContent = () => {
        if (opened) return
        opened = true
        state.contentShown = true
        const panel = panelRefs.current[idx]
        if (!panel) return

        const parts = collectPanelParts(panel)

        gsap.set(parts, { opacity: 0 })
        panel.style.opacity = 1
        panel.classList.add('expand-bars__panel--current')

        if (reducedMotion) {
          gsap.set(parts, { opacity: 1, x: 0, rotate: 0, scaleX: 1 })
        } else {
          gsap.killTweensOf(parts)
          parts.forEach((el, i) => {
            const isPosterChrome = Boolean(
              panel.querySelector('.expand-bars__poster') &&
                !panel.querySelector('.mkt-doors') &&
                !panel.querySelector('.cat-video'),
            )
            gsap.fromTo(
              el,
              {
                opacity: 0,
                x: -80 - i * 150,
                scaleX: i === 0 && isPosterChrome ? 0 : 1,
                rotate: i === 2 && isPosterChrome ? -40 : 0,
              },
              {
                opacity: 1,
                x: 0,
                scaleX: 1,
                rotate: 0,
                duration: 0.6 + i * 0.1,
                ease: CONTENT_EASE,
                overwrite: 'auto',
              },
            )
          })
        }

        if (backRef.current) {
          backRef.current.classList.add('is-visible')
          gsap.fromTo(
            backRef.current,
            { opacity: 0, scale: 0 },
            {
              opacity: 1,
              scale: 1,
              duration: reducedMotion ? 0.01 : 0.8,
              ease: 'power3.out',
              overwrite: 'auto',
            },
          )
        }
      }

      const tl = gsap.timeline({
        onComplete: () => {
          state.isAnimating = false
          state.isOpen = true
          setIsExpanded(true)
          if (!state.contentShown) revealContent()
        },
      })

      tabs.forEach((el, i) => {
        tl.to(
          el,
          { x: xFor(i, tabs.length), duration, ease: ANIM_EASE, overwrite: 'auto' },
          delayFor(i, tabs.length),
        )
      })
      bars.forEach((el, i) => {
        tl.to(
          el,
          {
            scaleX: scaleFor(i, bars.length),
            duration,
            ease: ANIM_EASE,
            overwrite: 'auto',
            onUpdate() {
              if (i === idx && this.progress() > 0.6) revealContent()
            },
          },
          delayFor(i, bars.length),
        )
      })

      if (contentRef.current) {
        const extraBounds = contentRef.current.getBoundingClientRect()
        const extraX =
          dim.win - (dim.position + dim.measure) + Math.abs(extraBounds.left - dim.position) + dim.measure
        tl.to(
          contentRef.current,
          { x: extraX, duration, ease: ANIM_EASE, overwrite: 'auto' },
          0,
        )
      }
    },
    [reducedMotion],
  )

  const onTabClick = (idx) => {
    if (stateRef.current.isOpen) return
    openTab(idx)
  }

  /** 已展开时直接切到下一分类预览，无需先返回竖条菜单 */
  const switchCategory = useCallback(
    (nextIdx) => {
      const state = stateRef.current
      if (!state.isOpen || state.isAnimating) return
      if (nextIdx < 0 || nextIdx >= items.length || nextIdx === state.current) return

      state.isAnimating = true
      const prevIdx = state.current
      const prevPanel = panelRefs.current[prevIdx]
      const nextPanel = panelRefs.current[nextIdx]
      if (!prevPanel || !nextPanel) {
        state.isAnimating = false
        return
      }

      const prevParts = collectPanelParts(prevPanel)
      const duration = reducedMotion ? 0.01 : 0.35

      gsap.killTweensOf([...prevParts, nextPanel, ...collectPanelParts(nextPanel)])

      const finish = () => {
        prevPanel.classList.remove('expand-bars__panel--current')
        prevPanel.style.opacity = 0
        prevPanel.setAttribute('aria-hidden', 'true')

        state.current = nextIdx
        setOpenIndex(nextIdx)
        tabRefs.current.forEach((el, i) => {
          if (el) el.style.zIndex = i === nextIdx ? 100 : 1
        })

        const nextParts = collectPanelParts(nextPanel)
        nextPanel.style.opacity = 1
        nextPanel.classList.add('expand-bars__panel--current')
        nextPanel.setAttribute('aria-hidden', 'false')

        if (reducedMotion) {
          gsap.set(nextParts, { opacity: 1, x: 0 })
          state.isAnimating = false
          return
        }

        gsap.set(nextParts, { opacity: 0, x: 40 })
        gsap.to(nextParts, {
          opacity: 1,
          x: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: CONTENT_EASE,
          overwrite: 'auto',
          onComplete: () => {
            state.isAnimating = false
          },
        })
      }

      if (reducedMotion || !prevParts.length) {
        finish()
        return
      }

      gsap.to(prevParts, {
        opacity: 0,
        x: -30,
        duration,
        stagger: 0.04,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: finish,
      })
    },
    [items.length, reducedMotion],
  )

  const toggleMobileNav = () => {
    if (stateRef.current.isOpen || stateRef.current.isAnimating) return
    setMobileNavVisible((v) => {
      const next = !v
      stateRef.current.mobileNavVisible = next
      return next
    })
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (stateRef.current.isOpen) {
        event.preventDefault()
        event.stopImmediatePropagation()
        closeTab()
        return
      }
      event.preventDefault()
      event.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [closeTab, onClose])

  useEffect(() => {
    const onResize = () => {
      const state = stateRef.current
      if (!state.isOpen || !state.dim) return
      const winW = window.innerWidth
      state.dim.win = winW
      const idx = state.current
      const { measure, position } = state.dim

      tabRefs.current.forEach((tab, i) => {
        if (!tab) return
        let x
        if (i === idx) x = -position
        else if (i > idx) x = winW - (position + measure) - 1
        else x = -position + 1
        gsap.set(tab, { x })
      })
      barRefs.current.forEach((bar, i) => {
        if (!bar) return
        gsap.set(bar, { scaleX: i === idx ? winW / measure : 1 })
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return () => {
      gsap.killTweensOf(tabRefs.current)
      gsap.killTweensOf(barRefs.current)
      gsap.killTweensOf(contentRef.current)
      gsap.killTweensOf(backRef.current)
    }
  }, [])

  const navHiddenClass =
    isNarrow && !mobileNavVisible && !isExpanded ? ' is-hidden' : ''

  /** 底部环形跳转：广告片 → 影视混剪 → 社团宣传片 → 营销号 → 广告片 … */
  const adjacentIndex =
    openIndex >= 0 && items.length > 1 ? (openIndex + 1) % items.length : -1
  const adjacentItem = adjacentIndex >= 0 ? items[adjacentIndex] : null

  return (
    <div
      ref={rootRef}
      className={`expand-bars${isExpanded ? ' expand-bars--open' : ''}`}
      aria-label="视频作品"
    >
      <button type="button" className="expand-bars__gallery-back" onClick={onClose}>
        ← BACK TO GALLERY
      </button>

      <button
        type="button"
        className={`expand-bars__menu${mobileNavVisible ? ' is-active' : ''}`}
        aria-label={mobileNavVisible ? '隐藏作品条' : '显示作品条'}
        aria-expanded={mobileNavVisible}
        onClick={toggleMobileNav}
      >
        <MenuIcon />
        <CrossIcon />
      </button>

      <div className="expand-bars__view">
        <div ref={contentRef} className="expand-bars__content">
          <header className="expand-bars__header">
            <div className="expand-bars__hero">
              <h1 className="expand-bars__title" aria-hidden="true">
                {intro.title}
              </h1>
              <p className="expand-bars__info">
                <span className="visually-hidden">{intro.title}</span>
                {intro.infoLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>
            {intro.demosNote ? <p className="expand-bars__note">{intro.demosNote}</p> : null}
          </header>
        </div>
      </div>

      <nav
        ref={navRef}
        className={`expand-bars__nav${navHiddenClass}${mobileNavVisible ? ' is-forced-visible' : ''}`}
        aria-label="视频作品分类"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="expand-bars__tab"
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            onClick={() => onTabClick(index)}
            aria-label={`打开 ${item.barTitle}${item.barTitleEn ? ` ${item.barTitleEn}` : ''}`}
          >
            <span
              className="expand-bars__bar"
              ref={(el) => {
                barRefs.current[index] = el
              }}
            />
            <h3 className="expand-bars__tab-title">
              <span className="expand-bars__tab-zh">{item.barTitle}</span>
              {item.barTitleEn ? (
                <span className="expand-bars__tab-en">{item.barTitleEn}</span>
              ) : null}
            </h3>
          </button>
        ))}
      </nav>

      <div className="expand-bars__panels">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`expand-bars__panel${
              item.layout === 'marketing-doors' || item.layout === 'feed-talk'
                ? ' expand-bars__panel--marketing'
                : ''
            }`}
            ref={(el) => {
              panelRefs.current[index] = el
            }}
            aria-hidden="true"
          >
            {item.layout === 'marketing-doors' ? (
              <MarketingDoors
                categoryZh={item.barTitle}
                titleLines={item.title || []}
                clips={item.clips || []}
                frameAspect={item.frameAspect}
                active={openIndex === index}
              />
            ) : item.layout === 'feed-talk' ? (
              <FeedTalkDoors
                categoryZh={item.barTitle}
                titleLines={item.title || []}
                pages={item.pages || []}
                active={openIndex === index}
              />
            ) : (
              <CategoryVideoPoster item={item} active={openIndex === index} />
            )}
          </div>
        ))}
        {isExpanded && adjacentItem ? (
          <button
            type="button"
            className="expand-bars__next-cat"
            onClick={() => switchCategory(adjacentIndex)}
            aria-label={`前往${adjacentItem.barTitle}`}
          >
            <span className="expand-bars__next-cat-zh">{adjacentItem.barTitle}</span>
            {adjacentItem.barTitleEn ? (
              <span className="expand-bars__next-cat-en">{adjacentItem.barTitleEn}</span>
            ) : null}
            <span className="expand-bars__next-cat-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ) : null}
        <button
          ref={backRef}
          type="button"
          className="expand-bars__back"
          aria-label="关闭作品海报"
          onClick={closeTab}
        >
          <CaretIcon />
        </button>
      </div>
    </div>
  )
}
