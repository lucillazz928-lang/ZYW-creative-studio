import gsap from 'gsap'

const OPEN_Y = -Math.PI / 2
/** 悬停微开：向内约 14°，提示可点 */
const HOVER_PEEK_Y = -0.24

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function doorDuration(seconds) {
  return prefersReducedMotion() ? 0.01 : seconds
}

export function setDoorOpen(door) {
  if (!door) return
  door.rotation.y = OPEN_Y
}

export function animateDoorOpen(door, { onComplete } = {}) {
  if (!door) {
    onComplete?.()
    return null
  }

  return gsap.to(door.rotation, {
    y: OPEN_Y,
    duration: doorDuration(1.2),
    ease: 'power2.inOut',
    onComplete,
  })
}

export function animateDoorClose(door, { onComplete } = {}) {
  if (!door) {
    onComplete?.()
    return null
  }

  return gsap.to(door.rotation, {
    y: 0,
    duration: doorDuration(1.15),
    delay: prefersReducedMotion() ? 0 : 0.18,
    ease: 'power2.inOut',
    onComplete,
  })
}

export function animateDoorHoverPeek(door) {
  if (!door) return null
  return gsap.to(door.rotation, {
    y: HOVER_PEEK_Y,
    duration: doorDuration(0.35),
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

export function animateDoorHoverRest(door) {
  if (!door) return null
  return gsap.to(door.rotation, {
    y: 0,
    duration: doorDuration(0.4),
    ease: 'power2.inOut',
    overwrite: 'auto',
  })
}
