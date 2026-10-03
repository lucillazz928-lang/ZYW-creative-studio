import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useInteraction } from '../state/interactionState'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 房间全景：提示点击桌子凑近 */
export function RoomDeskHint() {
  const { enterDesk, isTransitioning, cameraState } = useInteraction()
  const ref = useRef(null)
  const canEnter = cameraState === 'room' && !isTransitioning

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
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.25 },
    )
    tween.to(el, { y: -5, duration: 1.15, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    return () => tween.kill()
  }, [])

  return (
    <div className="room-desk-hint">
      <div className="room-desk-hint__motion" ref={ref}>
        <button
          type="button"
          className="entry-enter-frame"
          disabled={!canEnter}
          onClick={() => {
            if (canEnter) enterDesk()
          }}
        >
          点击桌子凑近看看吧~
        </button>
      </div>
    </div>
  )
}
