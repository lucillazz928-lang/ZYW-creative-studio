import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { deskNavItems } from '../content/uiHints'
import { useInteraction } from '../state/interactionState'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 房间 / 桌面顶部：桌上入口文字导航（细字 + 下划线，对齐项目案例子页） */
export function DeskTopNav() {
  const { openDeskEntry, isTransitioning } = useInteraction()
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      return undefined
    }

    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: -8 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.15 },
    )
    return () => tween.kill()
  }, [])

  return (
    <div className="desk-top-nav" ref={ref}>
      <nav className="desk-top-nav__row" aria-label="桌上入口导航">
        {deskNavItems.map((item) => (
          <button
            key={item.objectId}
            type="button"
            className="desk-top-nav__link"
            disabled={isTransitioning}
            onClick={() => openDeskEntry(item.objectId, item.overlay)}
          >
            {item.labelZh}
          </button>
        ))}
      </nav>
    </div>
  )
}
