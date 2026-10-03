import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { graphicPosterIntro, graphicPosterItems } from '../content/works'
import './PosterStackEntrance.css'

/** 滚轮灵敏度（弧度 / 像素） */
const WHEEL_GAIN = 0.0024

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

/**
 * 完整圆轨位姿：圆心在屏底中心，屏内只见上半圆。
 * angle=0 在右侧；-π/2 在正上方。scrollAngle 整体旋转。
 */
function railPose(index, count, radius, scrollAngle) {
  const slice = (Math.PI * 2) / Math.max(count, 1)
  const angle = -Math.PI / 2 + index * slice + scrollAngle
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  // 顶端直立，沿弧切线略倾
  const rotation = ((angle + Math.PI / 2) * 180) / Math.PI
  const distFromTop = Math.abs(((angle + Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI)
  const zIndex = Math.round(40 - (distFromTop / Math.PI) * 30)
  return { x, y, rotation, zIndex, opacity: 1, angle }
}

/** 大半径疏开卡片；圆心下沉到屏外，弧顶高度锁定，整体不跟着往上飘 */
function measureRail(isNarrow) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const radius = Math.max(vh * (isNarrow ? 0.7 : 0.78), vw * (isNarrow ? 0.5 : 0.48))
  // 弧顶距屏底约一半屏高（与加半径前相近），多出来的半径往下沉
  const crestFromBottom = vh * (isNarrow ? 0.48 : 0.5)
  const centerOffset = Math.max(0, radius - crestFromBottom)
  return { radius, centerOffset, crestFromBottom, vw, vh }
}

/**
 * 飞入聚集 → 散成半圆滑轨（无上下拉开）。
 */
export function PosterStackEntrance({
  onClose,
  items = graphicPosterItems,
  intro = graphicPosterIntro,
}) {
  const rootRef = useRef(null)
  const groupRef = useRef(null)
  const cardRefs = useRef([])
  const chromeRef = useRef(null)
  const tlRef = useRef(null)
  const scrollAngleRef = useRef(0)
  const targetAngleRef = useRef(0)
  const rafRef = useRef(0)
  const readyRef = useRef(false)
  const radiusRef = useRef(320)
  const centerOffsetRef = useRef(0)
  const reducedMotion = useReducedMotion()
  const isNarrow = useIsNarrow()
  const [ready, setReady] = useState(false)

  const applyGroupAnchor = useCallback((centerOffset) => {
    const group = groupRef.current
    if (!group) return
    gsap.set(group, {
      left: '50%',
      top: '100%',
      x: 0,
      y: centerOffset,
      xPercent: 0,
      yPercent: 0,
      transformStyle: 'preserve-3d',
    })
  }, [])

  const layoutRail = useCallback((scrollAngle, { immediate = false, duration = 0.75 } = {}) => {
    const cards = cardRefs.current.filter(Boolean)
    const radius = radiusRef.current
    cards.forEach((card, index) => {
      const pose = railPose(index, cards.length, radius, scrollAngle)
      const props = {
        x: pose.x,
        y: pose.y,
        rotation: pose.rotation,
        scale: 1,
        opacity: 1,
        zIndex: pose.zIndex,
        transformOrigin: '50% 50%',
        force3D: true,
        overwrite: 'auto',
      }
      if (immediate) gsap.set(card, props)
      else gsap.to(card, { ...props, duration, ease: 'power2.out' })
    })
  }, [])

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    const group = groupRef.current
    const chrome = chromeRef.current
    const root = rootRef.current
    if (!cards.length || !group || !root) return undefined

    let cancelled = false
    const { radius, centerOffset, vh } = measureRail(isNarrow)
    radiusRef.current = radius
    centerOffsetRef.current = centerOffset
    const count = cards.length
    const imageW = cards[0].querySelector('.poster-stack__img')?.clientWidth || 200
    // 聚拢用视口正中；展开用半圆轨——两套坐标互不绑死
    const gatherY = -vh / 2 - centerOffset

    applyGroupAnchor(centerOffset)
    root.classList.add('poster-stack--entering')
    gsap.set(cards, {
      x: 0,
      y: gatherY,
      rotation: 0,
      scale: 1,
      opacity: 1,
      transformOrigin: '50% 50%',
      xPercent: -50,
      yPercent: -50,
      force3D: true,
    })
    if (chrome) gsap.set(chrome, { opacity: 0 })

    scrollAngleRef.current = 0
    targetAngleRef.current = 0
    readyRef.current = false
    setReady(false)

    const finishReady = () => {
      root.classList.remove('poster-stack--entering')
      readyRef.current = true
      setReady(true)
    }

    if (reducedMotion) {
      layoutRail(0, { immediate: true })
      if (chrome) gsap.set(chrome, { opacity: 1 })
      finishReady()
      return () => {
        cancelled = true
      }
    }

    const preload = Promise.all(
      items.map(
        (item) =>
          new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = item.image
          }),
      ),
    )

    const run = () => {
      if (cancelled) return

      const tl = gsap.timeline({
        onComplete: finishReady,
      })
      tlRef.current = tl

      // 1) 飞入并直接落到中心叠放（合并两段，少一次重排）
      tl.fromTo(
        cards,
        {
          x: (index) =>
            index % 2
              ? -window.innerWidth * 0.55 - imageW
              : window.innerWidth * 0.55 + imageW,
          y: gatherY,
          rotation: (index) => (index % 2 ? -55 : 55),
          scale: 1.45,
          opacity: 0.7,
          force3D: true,
        },
        {
          x: (index) => (index - (count - 1) / 2) * 8,
          y: (index) => gatherY + (index - (count - 1) / 2) * 5,
          rotation: (index) => (index - (count - 1) / 2) * 3,
          scale: 1,
          opacity: 1,
          duration: 0.85,
          stagger: { each: 0.035, from: 'edges' },
          ease: 'power3.out',
          force3D: true,
        },
      )

      // 2) 散开成半圆轨（zIndex 结束时再设，避免逐帧改层叠）
      const poses = cards.map((_, index) => railPose(index, count, radius, 0))
      tl.to(cards, {
        x: (index) => poses[index].x,
        y: (index) => poses[index].y,
        rotation: (index) => poses[index].rotation,
        duration: 0.9,
        ease: 'power2.out',
        force3D: true,
        onComplete: () => {
          cards.forEach((card, index) => {
            card.style.zIndex = String(poses[index].zIndex)
          })
        },
      })

      if (chrome) {
        tl.to(
          chrome,
          {
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
          },
          '<-=0.55',
        )
      }
    }

    preload.then(run)

    return () => {
      cancelled = true
      tlRef.current?.kill()
      tlRef.current = null
      gsap.killTweensOf(cards)
      if (chrome) gsap.killTweensOf(chrome)
      root.classList.remove('poster-stack--entering')
      readyRef.current = false
    }
  }, [applyGroupAnchor, items, isNarrow, layoutRail, reducedMotion])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const tick = () => {
      rafRef.current = 0
      if (!readyRef.current) return
      const cur = scrollAngleRef.current
      const target = targetAngleRef.current
      const next = cur + (target - cur) * (reducedMotion ? 1 : 0.14)
      scrollAngleRef.current = next
      layoutRail(next, { immediate: true })
      if (Math.abs(target - next) > 0.0004) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    const requestTick = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
    }

    const onWheel = (event) => {
      if (!readyRef.current) return
      event.preventDefault()
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      targetAngleRef.current += delta * WHEEL_GAIN
      if (Math.abs(targetAngleRef.current) > Math.PI * 8) {
        targetAngleRef.current %= Math.PI * 2
        scrollAngleRef.current %= Math.PI * 2
      }
      requestTick()
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      root.removeEventListener('wheel', onWheel)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [layoutRail, reducedMotion])

  useEffect(() => {
    if (!ready) return undefined
    const onResize = () => {
      const { radius, centerOffset } = measureRail(isNarrow)
      radiusRef.current = radius
      centerOffsetRef.current = centerOffset
      applyGroupAnchor(centerOffset)
      layoutRail(scrollAngleRef.current, { immediate: true })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [applyGroupAnchor, isNarrow, layoutRail, ready])

  const onCardEnter = (event) => {
    if (reducedMotion || !ready) return
    gsap.to(event.currentTarget, {
      scale: 1.04,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const onCardLeave = (event) => {
    if (reducedMotion || !ready) return
    gsap.to(event.currentTarget, {
      scale: 1,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  return (
    <div
      ref={rootRef}
      className={`poster-stack${ready ? ' poster-stack--ready' : ''}`}
      aria-label={intro.titleZh}
    >
      <div ref={chromeRef} className="poster-stack__chrome">
        <button type="button" className="poster-stack__back" onClick={onClose}>
          {intro.backLabel}
        </button>
        <header className="poster-stack__header">
          <h1 className="poster-stack__title">{intro.title}</h1>
        </header>
        {intro.scrollHint ? (
          <p className="poster-stack__hint" aria-hidden="true">
            {intro.scrollHint}
          </p>
        ) : null}
      </div>

      <div className="poster-stack__scene">
        <div ref={groupRef} className="poster-stack__group">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="poster-stack__card"
              data-poster-id={item.id}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
              onMouseEnter={onCardEnter}
              onMouseLeave={onCardLeave}
              onFocus={onCardEnter}
              onBlur={onCardLeave}
              aria-label={item.title}
            >
              <span
                className="poster-stack__img"
                style={{ backgroundImage: `url(${item.image})` }}
                role="img"
                aria-label={item.alt}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
