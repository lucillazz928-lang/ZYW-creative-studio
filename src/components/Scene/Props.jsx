import { useLayoutEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { createIdCardFaceTexture, paintIdCardFace } from '../../lib/idCardTexture'
import portraitUrl from '../../assets/props/id-card-portrait.jpg'
import wordmarkUrl from '../../assets/props/id-card-wordmark.png'
import { Coffee } from './Coffee'
import { BookshelfMesh } from './Bookshelf'
import { palette } from './scenePalette'
import { SoftBox, SoftCylinder, SoftSphere } from './softPrimitives'
import { ArchiveFolderMesh } from './ArchiveFolder'

/** 留言墙：洞洞板比例（显示器右侧），网格孔 + 文具杯 + 便签 */
export function MessageWallMesh() {
  const holes = []
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      holes.push([-0.18 + col * 0.09, 0.24 - row * 0.085, 0.028])
    }
  }

  return (
    <group>
      <SoftBox args={[0.58, 0.72, 0.05]} radius={0.035} color={palette.woodDeep} roughness={0.9} />
      <SoftBox
        args={[0.52, 0.66, 0.032]}
        radius={0.028}
        position={[0, 0, 0.018]}
        color={palette.pegboard}
        roughness={0.94}
      />
      {holes.map(([x, y, z], i) => (
        <SoftCylinder
          key={i}
          args={[0.012, 0.012, 0.02, 10]}
          position={[x, y, z]}
          rotation={[Math.PI / 2, 0, 0]}
          color={palette.woodDeep}
          roughness={0.95}
          castShadow={false}
        />
      ))}
      {/* 透明文具杯 + 笔 */}
      <SoftCylinder
        args={[0.045, 0.04, 0.08, 14]}
        position={[-0.14, -0.02, 0.06]}
        color="#e8f0f4"
        roughness={0.55}
        metalness={0.05}
      />
      {[
        [-0.15, 0.04, 0.06, '#efb7b7'],
        [-0.13, 0.05, 0.07, '#8eb6d4'],
        [-0.155, 0.035, 0.05, '#f0d36a'],
      ].map(([x, y, z, color], i) => (
        <SoftCylinder
          key={`pen-${i}`}
          args={[0.006, 0.006, 0.1, 8]}
          position={[x, y, z]}
          rotation={[0.15, 0, 0.1 * i]}
          color={color}
          roughness={0.85}
          castShadow={false}
        />
      ))}
      {/* 剪刀暗示 */}
      <SoftBox
        args={[0.08, 0.02, 0.012]}
        radius={0.005}
        position={[0.14, 0.2, 0.05]}
        rotation={[0, 0, 0.4]}
        color={palette.chrome}
        roughness={0.4}
        metalness={0.5}
        castShadow={false}
      />
      {[
        [-0.12, 0.18, 0.045, palette.stickyYellow, 0.1],
        [0.1, 0.05, 0.045, palette.stickyPink, 0.09],
        [-0.05, -0.15, 0.045, '#c8e0c4', 0.085],
        [0.12, -0.22, 0.045, '#d7e8f2', 0.08],
      ].map(([x, y, z, color, size], i) => (
        <group key={`note-${i}`} position={[x, y, z]} rotation={[0, 0, (i % 3) * 0.05 - 0.05]}>
          <SoftBox
            args={[size, size, 0.012]}
            radius={0.018}
            color={color}
            roughness={0.95}
            castShadow={false}
          />
          <SoftSphere
            args={[0.012, 8, 8]}
            position={[0, size * 0.35, 0.01]}
            color="#d8d2c8"
            roughness={0.7}
            castShadow={false}
          />
        </group>
      ))}
    </group>
  )
}

/** 作品合集：纸质档案文件夹（替换原素描本） */
export function SketchbookMesh() {
  return <ArchiveFolderMesh />
}

/** 个人技能：桌上小书架（悬停抽书见 Bookshelf.jsx） */
export function ResearchBoardMesh() {
  return <BookshelfMesh />
}

const ID_CARD_W = 0.16
const ID_CARD_D = 0.24
/** 无纹理翻转时，照片在 -Z 端；圆孔放在照片上方 */
const ID_CARD_TOP_Z = -ID_CARD_D * 0.48

export function IdCardMesh() {
  const [portrait, wordmark] = useTexture([portraitUrl, wordmarkUrl])
  const faceMap = useMemo(() => createIdCardFaceTexture(null, null), [])

  useLayoutEffect(() => {
    const portraitImg = portrait.image
    const wordmarkImg = wordmark.image
    if (!portraitImg?.width || !faceMap.image) return
    const ctx = faceMap.image.getContext('2d')
    paintIdCardFace(ctx, portraitImg, wordmarkImg)
    faceMap.needsUpdate = true
  }, [portrait, wordmark, faceMap])

  return (
    <group rotation={[0, 0.18, 0.04]}>
      <SoftBox
        args={[ID_CARD_W, 0.012, ID_CARD_D]}
        radius={0.014}
        position={[0, 0.008, 0]}
        color="#f8f6f3"
        roughness={0.9}
      />
      <mesh
        position={[0, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow={false}
        receiveShadow={false}
      >
        <planeGeometry args={[ID_CARD_W * 0.96, ID_CARD_D * 0.96]} />
        <meshStandardMaterial
          map={faceMap}
          roughness={0.82}
          metalness={0}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 上方中间卡舌 */}
      <SoftBox
        args={[0.042, 0.007, 0.03]}
        radius={0.008}
        position={[0, 0.013, ID_CARD_TOP_Z]}
        color="#f3f0eb"
        roughness={0.88}
        castShadow={false}
      />
    </group>
  )
}

export function StickyNotesMesh() {
  return (
    <group>
      <SoftBox args={[0.13, 0.014, 0.13]} radius={0.022} color={palette.stickyYellow} roughness={0.95} />
      <SoftBox
        args={[0.11, 0.012, 0.11]}
        radius={0.02}
        position={[0.05, 0.012, 0.03]}
        rotation={[0, 0.15, 0.05]}
        color={palette.stickyPink}
        roughness={0.95}
      />
      <SoftBox
        args={[0.1, 0.012, 0.1]}
        radius={0.018}
        position={[-0.03, 0.02, 0.05]}
        rotation={[0, -0.1, -0.04]}
        color={palette.stickyOrange}
        roughness={0.95}
      />
    </group>
  )
}

export function CoffeeMesh() {
  return <Coffee scale={1.4} />
}

export function PropMesh({ id }) {
  if (id === 'message-wall') return <MessageWallMesh />
  if (id === 'sketchbook') return <SketchbookMesh />
  if (id === 'research-board') return <ResearchBoardMesh />
  if (id === 'id-card') return <IdCardMesh />
  if (id === 'sticky-notes') return <StickyNotesMesh />
  if (id === 'coffee') return <CoffeeMesh />
  return <SoftBox args={[0.28, 0.08, 0.36]} radius={0.03} color={palette.paper} />
}

export function FloorPlant({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <SoftCylinder args={[0.15, 0.17, 0.26, 20]} position={[0, 0.13, 0]} color={palette.pot} roughness={0.9} />
      <SoftCylinder args={[0.155, 0.148, 0.045, 20]} position={[0, 0.26, 0]} color="#c9926e" roughness={0.88} />
      <SoftSphere args={[0.23, 16, 16]} position={[0, 0.5, 0]} color={palette.plant} roughness={0.95} />
      <SoftSphere args={[0.15, 14, 14]} position={[0.13, 0.6, 0.06]} color={palette.plantLite} roughness={0.95} />
      <SoftSphere args={[0.13, 14, 14]} position={[-0.11, 0.64, -0.05]} color={palette.plantDeep} roughness={0.95} />
      <SoftSphere args={[0.11, 12, 12]} position={[0.02, 0.74, 0.02]} color="#9bc894" roughness={0.95} />
    </group>
  )
}
