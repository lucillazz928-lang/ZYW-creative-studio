import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { uiHints } from '../content/uiHints'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 桌面特写：提示可点击物件进入；不抢点击、不与 Tooltip 同屏 */
export function DeskExploreHint() {
  const ref = useRef(null)
  const { zh, en } = uiHints.deskExplore

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      return undefined
    }

    const tween = gsap.timeline()
    tween.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out', delay: 0.2 },
    )
    tween.to(el, { y: -4, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }, '+=0.15')
    return () => tween.kill()
  }, [])

  return (
    <div className="desk-explore-hint" aria-live="polite">
      <div className="desk-explore-hint__motion" ref={ref}>
        <p className="desk-explore-hint__pill">
          <span className="desk-explore-hint__zh">{zh}</span>
          <span className="desk-explore-hint__en en-label">{en}</span>
        </p>
      </div>
    </div>
  )
}
