/**
 * Continuous horizontal track: target + lerp + momentum.
 * Position x is in [minX, 0], where minX = -(content - viewport).
 */
export function createSmoothTrack({
  viewport,
  track,
  onUpdate,
  reducedMotion = false,
}) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

  const state = {
    x: 0,
    target: 0,
    velocity: 0,
    minX: 0,
    dragging: false,
    running: true,
    raf: 0,
  }

  const ease = reducedMotion ? 1 : 0.12
  const friction = reducedMotion ? 0 : 0.955
  const wheelGain = 1.15
  const rubber = 0.18

  const apply = () => {
    track.style.transform = `translate3d(${state.x}px, 0, 0)`
    onUpdate?.(getProgress(), state.x, state.minX)
  }

  const getProgress = () => {
    if (state.minX >= -0.5) return 0
    return clamp(state.x / state.minX, 0, 1)
  }

  const softClampTarget = (value) => {
    if (value > 0) return value * rubber
    if (value < state.minX) return state.minX + (value - state.minX) * rubber
    return value
  }

  const measure = () => {
    const viewW = viewport.clientWidth
    const contentW = track.scrollWidth
    state.minX = -Math.max(0, contentW - viewW)
    // Keep relative progress when content size changes
    const progress = getProgress()
    state.x = clamp(state.x, state.minX, 0)
    state.target = state.minX >= 0 ? 0 : state.minX * progress
    if (state.minX >= 0) {
      state.x = 0
      state.target = 0
    }
    apply()
  }

  const setProgress = (ratio) => {
    const t = clamp(ratio, 0, 1)
    state.velocity = 0
    state.target = state.minX * t
    state.x = state.target
    apply()
  }

  const addWheel = (delta) => {
    state.velocity *= 0.35
    state.target = softClampTarget(state.target - delta * wheelGain)
  }

  const tick = () => {
    if (!state.running) return
    state.raf = requestAnimationFrame(tick)

    if (!state.dragging) {
      state.velocity *= friction
      if (Math.abs(state.velocity) < 0.015) state.velocity = 0
      else state.target += state.velocity

      // Soft edge spring back to [minX, 0]
      if (state.target > 0) {
        state.target += (0 - state.target) * 0.14
        state.velocity *= 0.72
        if (Math.abs(state.target) < 0.3) {
          state.target = 0
          state.velocity = 0
        }
      } else if (state.target < state.minX) {
        state.target += (state.minX - state.target) * 0.14
        state.velocity *= 0.72
        if (Math.abs(state.target - state.minX) < 0.3) {
          state.target = state.minX
          state.velocity = 0
        }
      }
    }

    const prev = state.x
    state.x += (state.target - state.x) * ease
    if (Math.abs(state.target - state.x) < 0.04 && Math.abs(state.velocity) < 0.015) {
      state.x = state.target
    }
    if (state.x !== prev) apply()
  }

  const startDrag = () => {
    state.dragging = true
    state.velocity = 0
  }

  const dragTo = (x) => {
    state.target = softClampTarget(x)
    state.x = state.target
    apply()
  }

  const endDrag = (releaseVelocity) => {
    state.dragging = false
    state.velocity = reducedMotion ? 0 : releaseVelocity
  }

  measure()
  state.raf = requestAnimationFrame(tick)

  const onResize = () => measure()
  window.addEventListener('resize', onResize)

  return {
    measure,
    addWheel,
    startDrag,
    dragTo,
    endDrag,
    setProgress,
    getProgress,
    getX: () => state.x,
    getMinX: () => state.minX,
    dispose: () => {
      state.running = false
      cancelAnimationFrame(state.raf)
      window.removeEventListener('resize', onResize)
      track.style.transform = ''
    },
  }
}
