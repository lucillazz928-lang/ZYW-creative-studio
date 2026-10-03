import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { useInteraction } from '../../state/interactionState'
import { SoftBox } from './softPrimitives'
import { palette } from './scenePalette'

const FRAME = '#f4f1ec'
const PULL_Z = 0.048
const PULL_TILT = -0.08

/** 笔记本 / 文件夹 / 活页夹，书脊朝向观众 */
const ITEMS = [
  { kind: 'notebook', thickness: 0.018, height: 0.118, depth: 0.095, cover: '#c4a882', x: -0.1 },
  { kind: 'notebook', thickness: 0.016, height: 0.112, depth: 0.092, cover: '#9a9590', x: -0.078 },
  { kind: 'notebook', thickness: 0.015, height: 0.108, depth: 0.09, cover: '#6e6a66', x: -0.058, pullable: true },
  { kind: 'folder', thickness: 0.012, height: 0.128, depth: 0.1, cover: '#e8d5b5', x: -0.028 },
  { kind: 'folder', thickness: 0.011, height: 0.122, depth: 0.098, cover: '#dcc9a8', x: -0.01 },
  { kind: 'binder', thickness: 0.038, height: 0.142, depth: 0.11, cover: '#f7f4ef', x: 0.028 },
  { kind: 'binder', thickness: 0.036, height: 0.138, depth: 0.108, cover: '#f0ebe3', x: 0.062 },
  { kind: 'notebook', thickness: 0.014, height: 0.1, depth: 0.088, cover: '#d4c4b0', x: 0.095 },
]

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 侧板剖面：后高前低、无顶 */
function makeSlantPanel(depth, backH, frontH, thickness) {
  const shape = new THREE.Shape()
  const half = depth / 2
  shape.moveTo(-half, 0)
  shape.lineTo(half, 0)
  shape.lineTo(half, frontH)
  shape.lineTo(-half, backH)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  })
  geo.translate(0, 0, -thickness / 2)
  geo.rotateY(Math.PI / 2)
  return geo
}

function MeshPanel({ width, height, position, rotation }) {
  const cols = 5
  const rows = 4
  const lines = []
  for (let i = 0; i <= cols; i++) {
    const x = -width / 2 + (i / cols) * width
    lines.push(
      <SoftBox
        key={`v-${i}`}
        args={[0.003, height, 0.003]}
        radius={0.001}
        position={[x, 0, 0]}
        color={FRAME}
        roughness={0.55}
        metalness={0.12}
        castShadow={false}
      />,
    )
  }
  for (let j = 0; j <= rows; j++) {
    const y = -height / 2 + (j / rows) * height
    lines.push(
      <SoftBox
        key={`h-${j}`}
        args={[width, 0.003, 0.003]}
        radius={0.001}
        position={[0, y, 0]}
        color={FRAME}
        roughness={0.55}
        metalness={0.12}
        castShadow={false}
      />,
    )
  }
  return (
    <group position={position} rotation={rotation}>
      {lines}
    </group>
  )
}

function Book({ thickness, height, depth, cover, kind = 'notebook' }) {
  const coverT = kind === 'binder' ? 0.0045 : 0.0028
  const pageW = Math.max(thickness - coverT * 2.1, 0.006)
  const pageH = height * (kind === 'folder' ? 0.97 : 0.985)
  const pageD = depth * 0.93

  return (
    <group>
      {/* 书芯纸页 */}
      <SoftBox
        args={[pageW, pageH, pageD]}
        radius={0.003}
        position={[0, kind === 'folder' ? height * 0.01 : 0, -0.004]}
        color={palette.paperWarm}
        roughness={0.96}
      />
      {/* 左封面 */}
      <SoftBox
        args={[coverT, height, depth]}
        radius={0.004}
        position={[-thickness / 2 + coverT / 2, 0, 0]}
        color={cover}
        roughness={kind === 'binder' ? 0.72 : 0.88}
      />
      {/* 右封面 */}
      <SoftBox
        args={[coverT, height, depth]}
        radius={0.004}
        position={[thickness / 2 - coverT / 2, 0, 0]}
        color={cover}
        roughness={kind === 'binder' ? 0.72 : 0.88}
      />
      {/* 书脊朝前 */}
      <SoftBox
        args={[thickness, height, coverT * 1.4]}
        radius={0.005}
        position={[0, 0, depth / 2 - coverT * 0.6]}
        color={cover}
        roughness={kind === 'binder' ? 0.7 : 0.86}
      />
      {/* 书口（后缘纸色） */}
      <SoftBox
        args={[pageW * 0.92, pageH * 0.94, 0.002]}
        radius={0.001}
        position={[0, 0, -depth / 2 + 0.002]}
        color="#faf7f0"
        roughness={0.98}
        castShadow={false}
      />
      {/* 书脊标签 */}
      <SoftBox
        args={[thickness * 0.62, height * (kind === 'binder' ? 0.16 : 0.11), 0.002]}
        radius={0.002}
        position={[0, kind === 'binder' ? height * 0.08 : -height * 0.22, depth / 2 + 0.001]}
        color="#f8f5f0"
        roughness={0.95}
        castShadow={false}
      />
      {kind === 'binder' ? (
        <>
          <SoftBox
            args={[0.006, 0.006, 0.004]}
            radius={0.002}
            position={[0, height * 0.28, depth / 2 + 0.002]}
            color={palette.chrome}
            roughness={0.35}
            metalness={0.55}
            castShadow={false}
          />
          <SoftBox
            args={[0.006, 0.006, 0.004]}
            radius={0.002}
            position={[0, -height * 0.28, depth / 2 + 0.002]}
            color={palette.chrome}
            roughness={0.35}
            metalness={0.55}
            castShadow={false}
          />
        </>
      ) : null}
      {kind === 'folder' ? (
        <SoftBox
          args={[thickness * 0.9, 0.014, 0.018]}
          radius={0.004}
          position={[thickness * 0.15, height / 2 - 0.004, depth * 0.15]}
          color={cover}
          roughness={0.9}
          castShadow={false}
        />
      ) : null}
    </group>
  )
}

/**
 * 参考白网文件架：无顶、后高前低；内放笔记本/文件夹/活页夹。
 * 悬停抽出一本（个人技能）。
 */
export function BookshelfMesh() {
  const pullRef = useRef(null)
  const tweenRef = useRef(null)
  const { hoveredObject } = useInteraction()
  const reduced = useMemo(() => prefersReducedMotion(), [])

  const sideGeo = useMemo(() => makeSlantPanel(0.13, 0.155, 0.038, 0.008), [])
  const dividerGeo = useMemo(() => makeSlantPanel(0.12, 0.14, 0.032, 0.005), [])

  useEffect(() => {
    const book = pullRef.current
    if (!book) return undefined

    tweenRef.current?.kill()
    const hovered = hoveredObject === 'research-board'
    const targetZ = hovered ? PULL_Z : 0
    const targetTilt = hovered ? PULL_TILT : 0

    if (reduced) {
      book.position.z = targetZ
      book.rotation.x = targetTilt
      return undefined
    }

    tweenRef.current = gsap.to(book.position, {
      z: targetZ,
      duration: hovered ? 0.34 : 0.28,
      ease: hovered ? 'power2.out' : 'power2.inOut',
    })
    gsap.to(book.rotation, {
      x: targetTilt,
      duration: hovered ? 0.34 : 0.28,
      ease: hovered ? 'power2.out' : 'power2.inOut',
    })

    return () => {
      tweenRef.current?.kill()
    }
  }, [hoveredObject, reduced])

  useEffect(
    () => () => {
      sideGeo.dispose()
      dividerGeo.dispose()
    },
    [sideGeo, dividerGeo],
  )

  return (
    <group rotation={[0, -0.32, 0]} scale={1.9}>
      {/* 底板 */}
      <SoftBox
        args={[0.28, 0.012, 0.14]}
        radius={0.008}
        position={[0, 0.006, 0]}
        color={FRAME}
        roughness={0.58}
        metalness={0.1}
      />
      {/* 前缘矮挡 */}
      <SoftBox
        args={[0.276, 0.028, 0.006]}
        radius={0.004}
        position={[0, 0.02, 0.066]}
        color={FRAME}
        roughness={0.55}
        metalness={0.12}
        castShadow={false}
      />
      {/* 背框（空心网，无实心板） */}
      <SoftBox
        args={[0.276, 0.006, 0.006]}
        radius={0.002}
        position={[0, 0.158, -0.062]}
        color={FRAME}
        roughness={0.55}
        metalness={0.12}
        castShadow={false}
      />
      <SoftBox
        args={[0.006, 0.15, 0.006]}
        radius={0.002}
        position={[-0.135, 0.085, -0.062]}
        color={FRAME}
        roughness={0.55}
        metalness={0.12}
        castShadow={false}
      />
      <SoftBox
        args={[0.006, 0.15, 0.006]}
        radius={0.002}
        position={[0.135, 0.085, -0.062]}
        color={FRAME}
        roughness={0.55}
        metalness={0.12}
        castShadow={false}
      />
      <MeshPanel width={0.26} height={0.14} position={[0, 0.085, -0.062]} />

      {/* 左右斜侧板（后高前低） */}
      <mesh geometry={sideGeo} position={[-0.136, 0.012, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={FRAME} roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh geometry={sideGeo} position={[0.136, 0.012, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={FRAME} roughness={0.55} metalness={0.12} />
      </mesh>

      {/* 中间分隔 */}
      <mesh geometry={dividerGeo} position={[-0.04, 0.012, 0]} castShadow={false} receiveShadow>
        <meshStandardMaterial color={FRAME} roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh geometry={dividerGeo} position={[0.045, 0.012, 0]} castShadow={false} receiveShadow>
        <meshStandardMaterial color={FRAME} roughness={0.55} metalness={0.1} />
      </mesh>

      {ITEMS.map((item) => {
        const y = item.height / 2 + 0.012
        return (
          <group
            key={`${item.x}-${item.kind}`}
            ref={item.pullable ? pullRef : undefined}
            position={[item.x, y, 0.008]}
          >
            <Book
              thickness={item.thickness}
              height={item.height}
              depth={item.depth}
              cover={item.cover}
              kind={item.kind}
            />
          </group>
        )
      })}
    </group>
  )
}
