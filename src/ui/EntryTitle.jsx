import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { siteProfile } from '../content/profile'
import entryTitleUrl from '../assets/textures/entry-title.png'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 入口弧形标题：浅木棕，入场柔和浮现 */
export function EntryTitle() {
  const title = siteProfile.doorPlateZh
  const layerRef = useRef(null)

  useLayoutEffect(() => {
    const el = layerRef.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      return undefined
    }

    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 1.15, ease: 'power2.out', delay: 0.08 },
    )
    return () => tween.kill()
  }, [])

  return (
    <div className="entry-title-layer" ref={layerRef}>
      <img className="entry-title-img" src={entryTitleUrl} alt={title} draggable={false} />
    </div>
  )
}
