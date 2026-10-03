import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useInteraction } from '../state/interactionState'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 封面进门提示：下方正中胶囊条 */
export function EntryEnterHint() {
  const { openDoor, isTransitioning, cameraState } = useInteraction()
  const ref = useRef(null)
  const canOpen = cameraState === 'entry' && !isTransitioning

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      return undefined
    }

    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.35 },
    )
    return () => tween.kill()
  }, [])

  return (
    <div className="entry-enter-hint" ref={ref}>
      <button
        type="button"
        className="entry-enter-frame"
        disabled={!canOpen}
        onClick={() => {
          if (canOpen) openDoor()
        }}
      >
        点击木门进门看看吧~
      </button>
    </div>
  )
}
