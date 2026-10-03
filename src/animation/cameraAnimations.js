import gsap from 'gsap'
import * as THREE from 'three'
import { CAMERA_PRESETS, getCameraPreset } from './cameraPresets'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function animateCameraTo(camera, stateName, { onStart, onComplete, fromLookAt, onFrame } = {}) {
  const preset = getCameraPreset(stateName)
  if (!camera || !preset) return null

  const duration = prefersReducedMotion() ? 0.01 : preset.duration
  const lookAt = {
    x: fromLookAt?.[0] ?? preset.lookAt[0],
    y: fromLookAt?.[1] ?? preset.lookAt[1],
    z: fromLookAt?.[2] ?? preset.lookAt[2],
  }
  const targetLookAt = {
    x: preset.lookAt[0],
    y: preset.lookAt[1],
    z: preset.lookAt[2],
  }

  // 若未显式给起点，用当前视线与目标平面的交点近似，避免推进时视线瞬跳
  if (!fromLookAt) {
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    const origin = camera.position.clone()
    const planeY = targetLookAt.y
    const t = Math.abs(dir.y) > 0.001 ? (planeY - origin.y) / dir.y : 1
    const hit = origin.clone().addScaledVector(dir, Math.max(0.5, Math.min(t, 12)))
    lookAt.x = hit.x
    lookAt.y = hit.y
    lookAt.z = hit.z
  }

  onStart?.()

  const timeline = gsap.timeline({
    onUpdate: () => {
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
      onFrame?.()
    },
    onComplete: () => {
      camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z)
      onFrame?.()
      onComplete?.()
    },
  })

  timeline.to(
    camera.position,
    {
      x: preset.position[0],
      y: preset.position[1],
      z: preset.position[2],
      duration,
      ease: 'power2.inOut',
    },
    0,
  )

  timeline.to(
    lookAt,
    {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration,
      ease: 'power2.inOut',
    },
    0,
  )

  timeline.to(
    camera,
    {
      fov: preset.fov,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => camera.updateProjectionMatrix(),
    },
    0,
  )

  return timeline
}

/**
 * 多段镜头：从当前位置依次经过 presets（不硬切）。
 * onAfterStep(index, name)：每一段结束时回调（用于「门外贴近后再切室内」）。
 */
export function animateCameraThrough(
  camera,
  stateNames,
  { onStart, onComplete, onFrame, onAfterStep } = {},
) {
  if (!camera || !stateNames?.length) {
    onComplete?.()
    return null
  }

  const lookAt = { x: 0, y: 0, z: 0 }
  const dir = new THREE.Vector3()
  camera.getWorldDirection(dir)
  const origin = camera.position.clone()
  const first = getCameraPreset(stateNames[0]) || CAMERA_PRESETS[stateNames[0]]
  const planeY = first?.lookAt?.[1] ?? 1
  const t = Math.abs(dir.y) > 0.001 ? (planeY - origin.y) / dir.y : 1
  const hit = origin.clone().addScaledVector(dir, Math.max(0.5, Math.min(t, 12)))
  lookAt.x = hit.x
  lookAt.y = hit.y
  lookAt.z = hit.z

  onStart?.()

  const timeline = gsap.timeline({
    onUpdate: () => {
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
      onFrame?.()
    },
    onComplete: () => {
      const last = getCameraPreset(stateNames[stateNames.length - 1])
      if (last) camera.lookAt(...last.lookAt)
      onFrame?.()
      onComplete?.()
    },
  })

  const reduced = prefersReducedMotion()
  stateNames.forEach((name, index) => {
    const preset = getCameraPreset(name)
    if (!preset) return
    // 进门：门外贴近稍长，入室再舒缓推
    const scale =
      stateNames.length === 2 ? (index === 0 ? 0.72 : 0.7) : 1 / stateNames.length
    const duration = reduced ? 0.01 : Math.max(0.2, (preset.duration ?? 1.2) * scale)
    const ease = index === 0 ? 'power2.inOut' : 'power2.out'

    timeline.to(
      camera.position,
      {
        x: preset.position[0],
        y: preset.position[1],
        z: preset.position[2],
        duration,
        ease,
      },
      index === 0 ? 0 : '>',
    )
    timeline.to(
      lookAt,
      {
        x: preset.lookAt[0],
        y: preset.lookAt[1],
        z: preset.lookAt[2],
        duration,
        ease,
      },
      '<',
    )
    timeline.to(
      camera,
      {
        fov: preset.fov,
        duration,
        ease,
        onUpdate: () => camera.updateProjectionMatrix(),
        onComplete: () => onAfterStep?.(index, name),
      },
      '<',
    )
  })

  return timeline
}
