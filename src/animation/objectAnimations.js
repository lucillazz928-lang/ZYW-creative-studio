import gsap from 'gsap'

export const HOVER_SCALE = { normal: 1, hover: 1.04 }

export function animateObjectHover(object, hovered) {
  if (!object) return null
  const scale = hovered ? HOVER_SCALE.hover : HOVER_SCALE.normal
  return gsap.to(object.scale, {
    x: scale,
    y: scale,
    z: scale,
    duration: 0.28,
    ease: 'power2.out',
  })
}
