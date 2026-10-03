import { useLayoutEffect, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useInteraction } from '../../state/interactionState'
import { SoftBox, SoftCylinder } from './softPrimitives'
import { palette } from './scenePalette'
import wallpaperUrl from '../../assets/textures/computer-wallpaper.jpg'

const SCREEN_W = 0.58
const SCREEN_H = 0.38
const CHASSIS = '#d8d4ce'
const CHASSIS_SOFT = '#e8e4de'
const CHASSIS_DEEP = '#c8c4be'

export function Computer() {
  const { cameraState, selectObject, hoverObject, enterDesk, isTransitioning, overlayState } =
    useInteraction()
  const rootRef = useRef(null)
  const wallpaper = useTexture(wallpaperUrl)
  const canEnterDesk = cameraState === 'room' && !isTransitioning && !overlayState
  const canOpenOverlay = cameraState === 'desk' && !isTransitioning && !overlayState
  const interactive = canEnterDesk || canOpenOverlay

  useLayoutEffect(() => {
    wallpaper.colorSpace = THREE.SRGBColorSpace
    wallpaper.anisotropy = 8
    wallpaper.wrapS = THREE.ClampToEdgeWrapping
    wallpaper.wrapT = THREE.ClampToEdgeWrapping

    const img = wallpaper.image
    if (img?.width && img?.height) {
      const screenAspect = SCREEN_W / SCREEN_H
      const imageAspect = img.width / img.height
      if (imageAspect > screenAspect) {
        const repeatX = screenAspect / imageAspect
        wallpaper.repeat.set(repeatX, 1)
        wallpaper.offset.set((1 - repeatX) / 2, 0)
      } else {
        const repeatY = imageAspect / screenAspect
        wallpaper.repeat.set(1, repeatY)
        wallpaper.offset.set(0, (1 - repeatY) / 2)
      }
    }

    wallpaper.needsUpdate = true
  }, [wallpaper])

  return (
    <group
      ref={rootRef}
      position={[0.05, 0.785, -0.22]}
      onPointerDown={(event) => {
        event.stopPropagation()
        if (!interactive) return
        if (canEnterDesk) {
          enterDesk()
          return
        }
        selectObject('computer', 'content-lab')
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (!interactive) return
        document.body.style.cursor = 'pointer'
        if (canOpenOverlay) {
          hoverObject('computer')
          rootRef.current?.scale.setScalar(1.04)
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
        hoverObject(null)
        rootRef.current?.scale.setScalar(1)
      }}
    >
      <group scale={1.55}>
        {/* 米色 desk mat（缩小；键盘鼠标尺寸不变） */}
        <SoftBox
          args={[0.55, 0.012, 0.32]}
          radius={0.018}
          position={[0.04, 0.006, 0.24]}
          color={palette.deskMat}
          roughness={0.96}
        />

        {/* 一体机底座 */}
        <SoftCylinder
          args={[0.1, 0.115, 0.016, 28]}
          position={[0, 0.01, -0.08]}
          color={CHASSIS_SOFT}
          roughness={0.55}
          metalness={0.25}
        />
        <SoftBox
          args={[0.045, 0.155, 0.026]}
          radius={0.008}
          position={[0, 0.1, -0.09]}
          color={CHASSIS}
          roughness={0.5}
          metalness={0.3}
        />
        <SoftBox
          args={[0.07, 0.038, 0.034]}
          radius={0.008}
          position={[0, 0.185, -0.07]}
          color={CHASSIS_DEEP}
          roughness={0.48}
          metalness={0.28}
        />

        {/* 银框屏幕（放大） */}
        <SoftBox
          args={[0.64, 0.44, 0.034]}
          radius={0.03}
          position={[0, 0.36, -0.035]}
          rotation={[-0.05, 0, 0]}
          color={CHASSIS}
          roughness={0.48}
          metalness={0.28}
        />
        <SoftBox
          args={[0.6, 0.4, 0.016]}
          radius={0.01}
          position={[0, 0.36, -0.018]}
          rotation={[-0.05, 0, 0]}
          color="#3a3632"
          roughness={0.85}
        />
        <SoftBox
          args={[SCREEN_W, SCREEN_H, 0.008]}
          radius={0.005}
          position={[0, 0.362, 0]}
          rotation={[-0.05, 0, 0]}
          color="#1a1814"
          roughness={0.9}
          castShadow={false}
        />
        <mesh
          position={[0, 0.362, 0.008]}
          rotation={[-0.05, 0, 0]}
          castShadow={false}
          receiveShadow={false}
        >
          <planeGeometry args={[SCREEN_W * 0.997, SCREEN_H * 0.997]} />
          <meshBasicMaterial map={wallpaper} color="#b4b4b4" toneMapped={false} />
        </mesh>

        {/* 下巴条 */}
        <SoftBox
          args={[0.22, 0.012, 0.02]}
          radius={0.004}
          position={[0, 0.155, -0.02]}
          rotation={[-0.05, 0, 0]}
          color={CHASSIS_SOFT}
          roughness={0.55}
          metalness={0.2}
          castShadow={false}
        />

        {/* 键盘 */}
        <SoftBox
          args={[0.42, 0.018, 0.145]}
          radius={0.012}
          position={[0, 0.018, 0.24]}
          color={CHASSIS_SOFT}
          roughness={0.9}
        />
        <SoftBox
          args={[0.38, 0.006, 0.115]}
          radius={0.005}
          position={[0, 0.028, 0.24]}
          color="#d0cac2"
          roughness={0.94}
          castShadow={false}
        />
        {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
          <SoftBox
            key={`kr1-${i}`}
            args={[0.055, 0.005, 0.016]}
            radius={0.002}
            position={[x, 0.033, 0.21]}
            color="#ece6dc"
            roughness={0.9}
            castShadow={false}
          />
        ))}
        {[-0.1, 0, 0.1].map((x, i) => (
          <SoftBox
            key={`kr2-${i}`}
            args={[0.065, 0.005, 0.016]}
            radius={0.002}
            position={[x, 0.033, 0.24]}
            color="#ece6dc"
            roughness={0.9}
            castShadow={false}
          />
        ))}
        <SoftBox
          args={[0.12, 0.005, 0.024]}
          radius={0.003}
          position={[0, 0.033, 0.27]}
          color="#ece6dc"
          roughness={0.9}
          castShadow={false}
        />

        {/* 鼠标（略离键盘，避免重合） */}
        <SoftBox
          args={[0.055, 0.022, 0.085]}
          radius={0.016}
          position={[0.255, 0.02, 0.22]}
          color={CHASSIS_SOFT}
          roughness={0.88}
        />
      </group>
    </group>
  )
}
