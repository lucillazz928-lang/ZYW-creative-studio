import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useInteraction } from '../../state/interactionState'
import {
  animateDoorClose,
  animateDoorHoverPeek,
  animateDoorHoverRest,
  animateDoorOpen,
  setDoorOpen,
} from '../../animation/doorAnimations'
import { SoftBox, SoftCylinder, SoftSphere, Matte } from './softPrimitives'

const C = {
  wall: '#f0e6d4',
  wallDeep: '#e8dbc8',
  roof: '#d2be98',
  roofLite: '#ddc8a4',
  roofDeep: '#c4ae86',
  trim: '#cbb892',
  door: '#b89968',
  doorPanel: '#a88858',
  base: '#e2d4bc',
  baseEdge: '#d4c4a8',
  glass: '#ffe9a8',
  glassGlow: '#ffd56a',
  snow: '#f8f4ec',
  tree: '#c6b690',
  treeDeep: '#b3a07a',
  lamp: '#c8b898',
  lampGlow: '#ffe8a8',
  giftA: '#d8c4a0',
  giftB: '#c9b090',
  particle: '#ffe9a8',
  hat: '#3d3530',
}

function SoftCone({
  args = [0.2, 0.5, 16],
  color,
  roughness = 0.94,
  castShadow = false,
  receiveShadow = true,
  ...props
}) {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow} {...props}>
      <coneGeometry args={args} />
      <Matte color={color} roughness={roughness} />
    </mesh>
  )
}

function GlowPane({ args, position, radius = 0.03, lightIntensity = 0.45 }) {
  return (
    <group position={position}>
      <SoftBox
        args={args}
        radius={radius}
        color={C.glass}
        roughness={0.4}
        metalness={0.02}
        emissive={C.glassGlow}
        emissiveIntensity={1.1}
        castShadow={false}
      />
      <pointLight
        position={[0, 0, 0.12]}
        intensity={lightIntensity}
        distance={2.6}
        decay={2}
        color="#ffd078"
      />
    </group>
  )
}

/** 屋面瓦片贴图：色块平铺在同一平面，无立体凸起 */
function createRoofTileTexture({ cols = 9, rows = 11 } = {}) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = C.roof
  ctx.fillRect(0, 0, size, size)

  const tw = size / cols
  const th = size / rows
  const gap = 3
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      ctx.fillStyle = (r + c) % 2 === 0 ? C.roofDeep : C.roofLite
      const x = c * tw + gap
      const y = r * th + gap
      const w = tw - gap * 2
      const h = th - gap * 2
      const rad = Math.min(5, w * 0.14, h * 0.14)
      ctx.beginPath()
      ctx.moveTo(x + rad, y)
      ctx.arcTo(x + w, y, x + w, y + h, rad)
      ctx.arcTo(x + w, y + h, x, y + h, rad)
      ctx.arcTo(x, y + h, x, y, rad)
      ctx.arcTo(x, y, x + w, y, rad)
      ctx.closePath()
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}

/** 实体人字屋顶：瓦片画在贴图上，与屋面同平面 */
function GabledRoof({ halfW = 1.15, rise = 0.55, depth = 1.75, position = [0, 0, 0] }) {
  const tileMap = useMemo(() => createRoofTileTexture(), [])

  const geom = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-halfW, 0)
    shape.lineTo(0, rise)
    shape.lineTo(halfW, 0)
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 2,
      curveSegments: 1,
    })
    g.translate(0, 0, -depth / 2)

    // UV：沿进深 / 檐口到屋脊，让色块整齐铺满坡面
    const pos = g.attributes.position
    const uv = g.attributes.uv
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const u = z / depth + 0.5
      const v = rise > 0 ? Math.min(1, Math.max(0, y / rise)) : 0
      uv.setXY(i, u, v)
    }
    uv.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [halfW, rise, depth])

  useEffect(() => () => tileMap.dispose(), [tileMap])

  return (
    <group position={position}>
      <mesh geometry={geom} castShadow receiveShadow>
        <meshStandardMaterial map={tileMap} roughness={0.96} metalness={0} />
      </mesh>
      <SoftBox
        args={[0.1, 0.05, depth * 0.96]}
        radius={0.02}
        position={[0, rise + 0.018, 0]}
        color={C.roofDeep}
        roughness={0.95}
      />
    </group>
  )
}

function PineTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <SoftCylinder args={[0.05, 0.06, 0.28, 10]} position={[0, 0.14, 0]} color={C.trim} />
      <SoftCone args={[0.34, 0.44, 14]} position={[0, 0.44, 0]} color={C.treeDeep} />
      <SoftCone args={[0.27, 0.38, 14]} position={[0, 0.66, 0]} color={C.tree} />
      <SoftCone args={[0.18, 0.32, 12]} position={[0, 0.88, 0]} color={C.treeDeep} />
      <SoftSphere args={[0.055, 8, 8]} position={[0.09, 0.58, 0.1]} color={C.snow} castShadow={false} />
      <SoftSphere args={[0.045, 8, 8]} position={[-0.07, 0.78, 0.08]} color={C.snow} castShadow={false} />
    </group>
  )
}

function Snowman({ position }) {
  return (
    <group position={position}>
      <SoftSphere args={[0.17, 14, 14]} position={[0, 0.17, 0]} color={C.snow} />
      <SoftSphere args={[0.13, 12, 12]} position={[0, 0.4, 0]} color={C.snow} />
      <SoftSphere args={[0.095, 12, 12]} position={[0, 0.57, 0]} color={C.snow} />
      <SoftCylinder args={[0.11, 0.11, 0.04, 12]} position={[0, 0.66, 0]} color={C.hat} />
      <SoftCylinder args={[0.075, 0.075, 0.13, 12]} position={[0, 0.75, 0]} color={C.hat} />
      <SoftSphere args={[0.014, 6, 6]} position={[0.03, 0.58, 0.085]} color={C.hat} castShadow={false} />
      <SoftSphere args={[0.014, 6, 6]} position={[-0.03, 0.58, 0.085]} color={C.hat} castShadow={false} />
      <SoftBox args={[0.04, 0.014, 0.03]} radius={0.005} position={[0, 0.545, 0.095]} color="#c47a48" castShadow={false} />
    </group>
  )
}

function StreetLamp({ position, scale = 1.35 }) {
  return (
    <group position={position} scale={scale}>
      <SoftCylinder args={[0.028, 0.032, 1.25, 12]} position={[0, 0.62, 0]} color={C.lamp} />
      <SoftCylinder args={[0.05, 0.05, 0.05, 10]} position={[0, 0.08, 0]} color={C.trim} />
      <SoftBox args={[0.3, 0.04, 0.04]} radius={0.015} position={[0.11, 1.28, 0]} color={C.trim} />
      <SoftSphere
        args={[0.12, 14, 14]}
        position={[0.26, 1.18, 0]}
        color={C.lampGlow}
        emissive={C.lampGlow}
        emissiveIntensity={1.15}
        castShadow={false}
      />
      <SoftCylinder args={[0.13, 0.1, 0.06, 12]} position={[0.26, 1.32, 0]} color={C.trim} />
      <pointLight
        position={[0.26, 1.15, 0.05]}
        intensity={1.15}
        distance={4.2}
        decay={2}
        color="#ffd090"
        castShadow={false}
      />
    </group>
  )
}

function Bench({ position, rotation = [0, -0.42, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <SoftBox args={[0.58, 0.04, 0.24]} radius={0.02} position={[0, 0.24, 0]} color={C.trim} />
      <SoftBox args={[0.58, 0.2, 0.04]} radius={0.015} position={[0, 0.36, -0.1]} color={C.door} />
      <SoftBox args={[0.04, 0.24, 0.04]} radius={0.012} position={[-0.24, 0.12, 0.08]} color={C.doorPanel} />
      <SoftBox args={[0.04, 0.24, 0.04]} radius={0.012} position={[0.24, 0.12, 0.08]} color={C.doorPanel} />
      <SoftBox args={[0.04, 0.24, 0.04]} radius={0.012} position={[-0.24, 0.12, -0.08]} color={C.doorPanel} />
      <SoftBox args={[0.04, 0.24, 0.04]} radius={0.012} position={[0.24, 0.12, -0.08]} color={C.doorPanel} />
      <SoftBox args={[0.13, 0.11, 0.11]} radius={0.02} position={[-0.14, 0.32, 0.02]} color={C.giftA} />
      <SoftBox args={[0.1, 0.09, 0.1]} radius={0.018} position={[0.16, 0.3, 0.04]} color={C.giftB} />
      <SoftBox args={[0.13, 0.015, 0.11]} radius={0.005} position={[-0.14, 0.385, 0.02]} color="#c47a68" castShadow={false} />
    </group>
  )
}

function SnowPatch({ position, scale = 1 }) {
  return (
    <SoftSphere
      args={[0.14, 10, 10]}
      position={position}
      scale={[scale, 0.2 * scale, scale * 0.9]}
      color={C.snow}
      roughness={0.98}
      castShadow={false}
    />
  )
}

function DustMotes() {
  const ref = useRef(null)
  const { overlayState, currentScene } = useInteraction()
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const seeds = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        x: ((i * 47) % 100) / 100 * 3.6 - 1.8,
        y: 0.45 + ((i * 31) % 100) / 100 * 2.1,
        z: 0.15 + ((i * 19) % 100) / 100 * 1.55,
        s: 0.018 + (i % 5) * 0.006,
        phase: i * 0.65,
        glow: 0.45 + (i % 3) * 0.2,
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (reduced || overlayState || currentScene !== 'entry' || !ref.current) return
    const t = clock.getElapsedTime()
    ref.current.children.forEach((child, i) => {
      const s = seeds[i]
      child.position.y = s.y + Math.sin(t * 0.55 + s.phase) * 0.08
      child.position.x = s.x + Math.cos(t * 0.35 + s.phase) * 0.05
      const pulse = 0.55 + Math.sin(t * 1.2 + s.phase) * 0.25
      const mat = child.material
      if (mat) mat.opacity = Math.min(0.95, s.glow * pulse)
    })
  })

  if (reduced) return null

  return (
    <group ref={ref}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} renderOrder={3}>
          <sphereGeometry args={[s.s, 8, 8]} />
          <meshBasicMaterial
            color={C.particle}
            transparent
            opacity={s.glow}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export function Storefront() {
  const {
    openDoor,
    isTransitioning,
    cameraState,
    currentScene,
    shouldCloseDoor,
    clearPendingDoorClose,
  } = useInteraction()
  const doorRef = useRef(null)
  const timelineRef = useRef(null)
  const hoverTweenRef = useRef(null)
  const canOpen = cameraState === 'entry' && !isTransitioning
  /** 店面仍显示时保持本地灯；切到室内同一帧熄灭，避免叠光爆闪 */
  const entryLightsOn = currentScene === 'entry'

  const stopHoverTween = () => {
    hoverTweenRef.current?.kill()
    hoverTweenRef.current = null
  }

  useLayoutEffect(() => {
    if (!doorRef.current || !shouldCloseDoor()) return undefined
    stopHoverTween()
    setDoorOpen(doorRef.current)
    timelineRef.current?.kill()
    timelineRef.current = animateDoorClose(doorRef.current, {
      onComplete: clearPendingDoorClose,
    })
    return () => timelineRef.current?.kill()
  }, [clearPendingDoorClose, shouldCloseDoor])

  useEffect(() => {
    if (!doorRef.current) return undefined
    if (cameraState !== 'entry' && !shouldCloseDoor()) {
      stopHoverTween()
      timelineRef.current?.kill()
      timelineRef.current = animateDoorOpen(doorRef.current)
    }
    return () => {
      if (cameraState !== 'entry') timelineRef.current?.kill()
    }
  }, [cameraState, shouldCloseDoor])

  const mainRoof = { halfW: 1.2, rise: 0.58, depth: 1.85, y: 1.48, z: -0.05 }
  const wingRoof = { halfW: 0.62, rise: 0.36, depth: 1.2, y: 1.22, z: 0.25 }

  return (
    <group position={[0, -0.32, 2.05]} scale={0.9}>
      {/* 入口略压暗，仍以柔和暖光为主；离场后熄灭，防止叠光闪白 */}
      {entryLightsOn ? (
        <>
          <ambientLight intensity={0.18} color="#fff1dd" />
          <directionalLight position={[2.8, 4.8, 3.2]} intensity={0.38} color="#fff6ea" />
          <hemisphereLight args={['#fff4e8', '#c9b498', 0.35]} />
          <pointLight position={[0.2, 1.4, 1.0]} intensity={0.22} distance={5} color="#ffe8b0" />
        </>
      ) : null}

      <SoftBox
        args={[4.0, 0.14, 3.2]}
        radius={0.08}
        position={[0, 0.02, 0.15]}
        color={C.base}
        roughness={0.97}
        castShadow
      />
      <SoftBox
        args={[3.85, 0.04, 3.05]}
        radius={0.04}
        position={[0, 0.1, 0.15]}
        color={C.baseEdge}
        roughness={0.98}
        castShadow={false}
      />

      <SoftBox
        args={[2.1, 1.35, 1.7]}
        radius={0.07}
        position={[0, 0.8, -0.05]}
        color={C.wall}
        roughness={0.96}
        castShadow
      />
      <SoftBox
        args={[1.05, 1.1, 1.1]}
        radius={0.06}
        position={[1.25, 0.68, 0.25]}
        color={C.wallDeep}
        roughness={0.96}
        castShadow
      />

      <GabledRoof
        halfW={mainRoof.halfW}
        rise={mainRoof.rise}
        depth={mainRoof.depth}
        position={[0, mainRoof.y, mainRoof.z]}
      />
      <GabledRoof
        halfW={wingRoof.halfW}
        rise={wingRoof.rise}
        depth={wingRoof.depth}
        position={[1.25, wingRoof.y, wingRoof.z]}
      />

      <SoftBox args={[0.9, 0.06, 0.32]} radius={0.025} position={[-0.35, 1.45, 0.85]} color={C.trim} />
      <SoftBox args={[0.82, 0.05, 0.26]} radius={0.02} position={[-0.35, 1.39, 0.9]} color={C.roof} />
      {[0, 1, 2, 3].map((i) => (
        <SoftSphere
          key={`sc-${i}`}
          args={[0.05, 10, 10]}
          position={[-0.62 + i * 0.18, 1.3, 1.0]}
          color={i % 2 === 0 ? C.wall : C.snow}
          castShadow={false}
        />
      ))}

      <group position={[-0.35, 0.1, 0.9]}>
        <SoftBox args={[0.78, 0.09, 0.32]} radius={0.03} position={[0, 0.04, 0.1]} color={C.base} />
        <SoftBox args={[0.68, 0.09, 0.24]} radius={0.025} position={[0, 0.11, -0.02]} color={C.baseEdge} />
        <SoftBox args={[0.03, 0.32, 0.03]} radius={0.01} position={[-0.32, 0.26, 0.14]} color={C.trim} />
        <SoftBox args={[0.03, 0.32, 0.03]} radius={0.01} position={[0.32, 0.26, 0.14]} color={C.trim} />
        <SoftBox args={[0.03, 0.03, 0.36]} radius={0.01} position={[-0.32, 0.42, -0.02]} color={C.trim} />
        <SoftBox args={[0.03, 0.03, 0.36]} radius={0.01} position={[0.32, 0.42, -0.02]} color={C.trim} />
      </group>

      <SoftBox
        args={[0.82, 1.22, 0.08]}
        radius={0.035}
        position={[-0.35, 0.8, 0.8]}
        color={C.trim}
        castShadow
      />

      <group ref={doorRef} position={[-0.72, 0.2, 0.84]}>
        <SoftBox
          args={[0.66, 1.08, 0.05]}
          radius={0.035}
          position={[0.37, 0.56, 0]}
          color={C.door}
          roughness={0.9}
          castShadow
        />
        <GlowPane args={[0.4, 0.4, 0.02]} position={[0.37, 0.8, 0.03]} radius={0.04} lightIntensity={0.28} />
        <SoftBox args={[0.38, 0.3, 0.02]} radius={0.025} position={[0.37, 0.32, 0.03]} color={C.doorPanel} />
        <SoftBox args={[0.025, 0.025, 0.1]} radius={0.01} position={[0.6, 0.52, 0.06]} color="#d8d0c4" />
        {/* 整扇门命中区：悬停微开、点击进入 */}
        <mesh
          position={[0.37, 0.56, 0.06]}
          onPointerDown={(event) => {
            event.stopPropagation()
            if (!canOpen) return
            stopHoverTween()
            openDoor()
          }}
          onPointerOver={(event) => {
            event.stopPropagation()
            document.body.style.cursor = canOpen ? 'pointer' : 'default'
            if (!canOpen || !doorRef.current) return
            stopHoverTween()
            hoverTweenRef.current = animateDoorHoverPeek(doorRef.current)
          }}
          onPointerOut={(event) => {
            event.stopPropagation()
            document.body.style.cursor = 'default'
            if (!canOpen || !doorRef.current) return
            stopHoverTween()
            hoverTweenRef.current = animateDoorHoverRest(doorRef.current)
          }}
        >
          <boxGeometry args={[0.72, 1.14, 0.16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      <SoftBox
        args={[0.5, 0.55, 0.07]}
        radius={0.03}
        position={[0.42, 0.95, 0.8]}
        color={C.trim}
        castShadow
      />
      <GlowPane args={[0.38, 0.42, 0.025]} position={[0.42, 0.95, 0.85]} lightIntensity={0.4} />

      <SoftBox
        args={[0.95, 0.9, 0.08]}
        radius={0.04}
        position={[1.3, 0.72, 0.78]}
        color={C.trim}
        castShadow
      />
      <GlowPane args={[0.78, 0.74, 0.03]} position={[1.3, 0.72, 0.84]} radius={0.035} lightIntensity={0.55} />
      <SoftBox args={[1.05, 0.07, 0.34]} radius={0.03} position={[1.3, 1.25, 0.88]} color={C.trim} />
      <SoftBox args={[0.96, 0.05, 0.28]} radius={0.02} position={[1.3, 1.19, 0.94]} color={C.roof} />
      {[0, 1, 2, 3, 4].map((i) => (
        <SoftSphere
          key={`awn-${i}`}
          args={[0.055, 10, 10]}
          position={[0.93 + i * 0.18, 1.1, 1.04]}
          color={i % 2 === 0 ? C.wall : C.snow}
          castShadow={false}
        />
      ))}

      <SoftBox args={[0.04, 0.04, 0.3]} radius={0.012} position={[1.75, 1.38, 0.4]} color={C.trim} />
      <SoftBox args={[0.04, 0.2, 0.04]} radius={0.012} position={[1.75, 1.46, 0.22]} color={C.trim} />
      <SoftCylinder
        args={[0.17, 0.17, 0.045, 22]}
        position={[1.75, 1.2, 0.22]}
        rotation={[Math.PI / 2, 0, 0]}
        color={C.wall}
      />

      {/* 路灯略左；小树更左，互不重合 */}
      <StreetLamp position={[-1.18, 0.1, 1.1]} scale={1.38} />
      <PineTree position={[-1.58, 0.1, 0.55]} scale={0.72} />
      <PineTree position={[1.35, 0.1, -0.45]} scale={0.95} />
      <Snowman position={[1.28, 0.1, 1.08]} />
      <Bench position={[0.78, 0.1, 1.28]} rotation={[0, -0.72, 0.03]} />

      <SnowPatch position={[-1.25, 0.15, 0.35]} scale={1.15} />
      <SnowPatch position={[-0.55, 0.14, 1.05]} scale={0.75} />
      <SnowPatch position={[0.15, 0.14, 1.15]} scale={0.55} />
      <SnowPatch position={[0.55, 0.14, 0.85]} scale={0.7} />
      <SnowPatch position={[1.15, 0.14, -0.2]} scale={1.15} />
      <SnowPatch position={[-0.2, 0.14, -0.7]} scale={0.8} />
      <SnowPatch position={[0.95, 0.14, 0.45]} scale={0.6} />
      <SnowPatch position={[1.45, 0.14, 0.65]} scale={0.5} />
      <SnowPatch position={[-1.0, 0.14, -0.35]} scale={0.65} />
      <SnowPatch position={[0.35, 0.13, -0.4]} scale={0.45} />

      <DustMotes />
    </group>
  )
}
