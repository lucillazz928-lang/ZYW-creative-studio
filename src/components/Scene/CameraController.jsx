import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { animateCameraTo } from '../../animation/cameraAnimations'
import { CAMERA_PRESETS } from '../../animation/cameraPresets'
import { useInteraction } from '../../state/interactionState'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function CameraController() {
  const { camera, invalidate } = useThree()
  const { cameraState, overlayState, endTransition, shouldCloseDoor, isLoaded } = useInteraction()
  const timelineRef = useRef(null)
  const initializedRef = useRef(false)
  const prevCameraStateRef = useRef(cameraState)

  useLayoutEffect(() => {
    // 等店面+房间预挂载结束再播封面镜头，避免和建 mesh 抢帧
    if (!isLoaded) return undefined

    const preset = CAMERA_PRESETS[cameraState]
    if (!preset) return undefined

    const prev = prevCameraStateRef.current
    prevCameraStateRef.current = cameraState

    // 首次揭开：斜视角 → 封面正面
    if (!initializedRef.current) {
      initializedRef.current = true
      const overview = CAMERA_PRESETS.entryOverview
      camera.position.set(...overview.position)
      camera.fov = overview.fov
      camera.lookAt(...overview.lookAt)
      camera.updateProjectionMatrix()
      invalidate()

      if (cameraState === 'entry' && !prefersReducedMotion()) {
        timelineRef.current?.kill()
        timelineRef.current = animateCameraTo(camera, 'entry', {
          fromLookAt: overview.lookAt,
          onFrame: invalidate,
          onComplete: endTransition,
        })
        const duration = (CAMERA_PRESETS.entry.duration ?? 2) * 1000 + 160
        const safety = window.setTimeout(endTransition, duration)
        return () => {
          window.clearTimeout(safety)
          timelineRef.current?.kill()
        }
      }

      endTransition()
      return undefined
    }

    // Overlay + focus 同步：蒙版已显示时仍推近（推完再停主 Canvas）
    if (overlayState && cameraState === 'focus') {
      timelineRef.current?.kill()
      timelineRef.current = animateCameraTo(camera, 'focus', {
        onFrame: invalidate,
        onComplete: endTransition,
      })
      const duration = (CAMERA_PRESETS.focus.duration ?? 0.8) * 1000 + 100
      const safety = window.setTimeout(endTransition, prefersReducedMotion() ? 80 : duration)
      return () => {
        window.clearTimeout(safety)
        timelineRef.current?.kill()
      }
    }

    if (overlayState) {
      return undefined
    }

    // 点门：房间已预挂，直接室内门槛 → room
    if (cameraState === 'room' && prev === 'entry') {
      const start = CAMERA_PRESETS.enterDoor
      camera.position.set(...start.position)
      camera.fov = start.fov
      camera.lookAt(...start.lookAt)
      camera.updateProjectionMatrix()
      invalidate()

      timelineRef.current?.kill()
      timelineRef.current = animateCameraTo(camera, 'room', {
        fromLookAt: start.lookAt,
        onFrame: invalidate,
        onComplete: endTransition,
      })
      const duration = (CAMERA_PRESETS.room.duration ?? 1.35) * 1000 + 120
      const safety = window.setTimeout(endTransition, prefersReducedMotion() ? 80 : duration)
      return () => {
        window.clearTimeout(safety)
        timelineRef.current?.kill()
      }
    }

    // 回封面
    if (cameraState === 'entry' && shouldCloseDoor()) {
      const start = CAMERA_PRESETS.exitDoor
      camera.position.set(...start.position)
      camera.fov = start.fov
      camera.lookAt(...start.lookAt)
      camera.updateProjectionMatrix()
      invalidate()
    }

    timelineRef.current?.kill()
    timelineRef.current = animateCameraTo(camera, cameraState, {
      onFrame: invalidate,
      onComplete: endTransition,
    })

    const duration = (CAMERA_PRESETS[cameraState]?.duration ?? 1) * 1000 + 120
    const safety = window.setTimeout(endTransition, duration)

    return () => {
      window.clearTimeout(safety)
      timelineRef.current?.kill()
    }
  }, [camera, cameraState, overlayState, endTransition, shouldCloseDoor, invalidate, isLoaded])

  return null
}
