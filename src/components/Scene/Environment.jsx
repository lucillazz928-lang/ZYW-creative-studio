import { useLayoutEffect, useMemo, useRef } from 'react'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useInteraction } from '../../state/interactionState'

/** 极淡的径向光晕贴图（地面 / 桌面共用） */
function useSoftGlowMap() {
  return useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255, 236, 200, 0.95)')
    g.addColorStop(0.4, 'rgba(255, 224, 170, 0.35)')
    g.addColorStop(1, 'rgba(255, 214, 150, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/**
 * 桌左「阳光洒进来」：只做很淡的地面/桌面光晕 + 柔和补光。
 * 不做硬光柱、不做墙上发光窗。
 */
function WarmWindowLight({ intensity = 5.4 }) {
  const lightRef = useRef(null)
  const targetRef = useRef(null)
  const glowMap = useSoftGlowMap()

  useLayoutEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  if (intensity <= 0) return null

  return (
    <group>
      {/* 光打向桌左偏前，填一点空 */}
      <object3D ref={targetRef} position={[-0.85, 0.55, 0.2]} />
      <spotLight
        ref={lightRef}
        position={[-2.7, 2.55, 0.35]}
        angle={0.42}
        penumbra={0.72}
        intensity={intensity}
        color="#ffe0b4"
        distance={9}
        castShadow={false}
      />
      <pointLight
        position={[-1.6, 1.6, 0.15]}
        intensity={0.55}
        distance={4.5}
        decay={2}
        color="#ffe8c8"
      />

      {/* 地面：桌左一块极淡的椭圆光晕 */}
      <mesh
        position={[-1.05, 0.022, 0.18]}
        rotation={[-Math.PI / 2, 0, 0.22]}
        scale={[1.35, 1, 0.95]}
        renderOrder={1}
      >
        <planeGeometry args={[2.1, 2.1]} />
        <meshBasicMaterial
          map={glowMap}
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* 桌面左侧：更小更淡的一抹，像光落在台面上 */}
      <mesh
        position={[-0.88, 0.795, 0.05]}
        rotation={[-Math.PI / 2, 0, 0.12]}
        scale={[0.72, 1, 0.55]}
        renderOrder={2}
      >
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial
          map={glowMap}
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export function Environment() {
  const { currentScene } = useInteraction()
  const isEntry = currentScene === 'entry'

  return (
    <>
      <color attach="background" args={[isEntry ? '#eadfcf' : '#efe4d4']} />
      <fog attach="fog" args={[isEntry ? '#eadfcf' : '#efe4d4', isEntry ? 13 : 14, isEntry ? 27 : 28]} />
      {/* 不用切换 args（会 remount 闪一下），只改 intensity */}
      <hemisphereLight color="#fff6ea" groundColor="#d4c4a8" intensity={isEntry ? 0.55 : 0.72} />
      <ambientLight intensity={isEntry ? 0.24 : 0.32} />
      <directionalLight
        position={isEntry ? [-5.5, 6.5, 2.2] : [-6.2, 7.2, 1.8]}
        intensity={isEntry ? 1.05 : 1.85}
        color="#ffe4b8"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
        shadow-camera-far={22}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[2.8, 3.5, 3]} intensity={isEntry ? 0.14 : 0.18} color="#f0e0d0" />
      <WarmWindowLight intensity={isEntry ? 0 : 5.4} />
      {/* frames 固定为 1，禁止随 isTransitioning 切换（会清空阴影贴图导致房子闪没） */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={isEntry ? 0.45 : 0.42}
        scale={10}
        blur={2.2}
        far={5}
        resolution={256}
        frames={1}
        color="#7a6048"
      />
    </>
  )
}
