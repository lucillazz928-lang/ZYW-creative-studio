import { useMemo } from 'react'
import * as THREE from 'three'
import {
  createArchivePaperTexture,
  createBlueOverlayTexture,
  createFolderJacketTexture,
  createTabLabelTexture,
  createVellumStripTexture,
} from '../../lib/archiveFolderTextures'
import { SoftBox, SoftCylinder } from './softPrimitives'

const FOLDER_W = 0.38
const FOLDER_D = 0.48
const FOLDER_H = 0.018

function PaperPlane({
  map,
  width,
  height,
  position,
  rotation,
  opacity = 1,
  transparent = false,
  roughness = 0.9,
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={false} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={map}
        roughness={roughness}
        metalness={0}
        transparent={transparent || opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={!transparent && opacity >= 1}
      />
    </mesh>
  )
}

const METAL = { color: '#c8ced4', roughness: 0.28, metalness: 0.88 }
const CLIP_BODY = { color: '#1a1a1a', roughness: 0.4, metalness: 0.45 }

function tubeFromPoints(points, radius = 0.0016, tubular = 64) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  return new THREE.TubeGeometry(curve, tubular, radius, 6, false)
}

/** 经典燕尾夹：三角夹身夹在左侧 + 两根银色把手压在纸上 */
function BinderClip({ position }) {
  const handles = useMemo(() => {
    // 上下两根把手，各自是扁长 U
    return [
      tubeFromPoints(
        [
          [0.002, 0.015, 0.014],
          [0.028, 0.009, 0.016],
          [0.05, 0.007, 0.014],
          [0.056, 0.007, 0.006],
          [0.05, 0.007, 0.001],
          [0.028, 0.009, 0.002],
          [0.006, 0.014, 0.004],
        ],
        0.00145,
        36,
      ),
      tubeFromPoints(
        [
          [0.002, 0.015, -0.014],
          [0.028, 0.009, -0.016],
          [0.05, 0.007, -0.014],
          [0.056, 0.007, -0.006],
          [0.05, 0.007, -0.001],
          [0.028, 0.009, -0.002],
          [0.006, 0.014, -0.004],
        ],
        0.00145,
        36,
      ),
    ]
  }, [])

  return (
    <group position={position} rotation={[0, 0, 0.05]}>
      <SoftBox
        args={[0.016, 0.026, 0.046]}
        radius={0.003}
        position={[0, 0.006, 0]}
        color={CLIP_BODY.color}
        roughness={CLIP_BODY.roughness}
        metalness={CLIP_BODY.metalness}
      />
      <SoftBox
        args={[0.02, 0.007, 0.048]}
        radius={0.002}
        position={[0.006, 0.016, 0]}
        rotation={[0, 0, -0.4]}
        color="#222"
        roughness={0.38}
        metalness={0.5}
        castShadow={false}
      />
      <SoftBox
        args={[0.024, 0.005, 0.048]}
        radius={0.002}
        position={[0.012, 0.002, 0]}
        color="#2a2a2a"
        roughness={0.42}
        metalness={0.4}
        castShadow={false}
      />
      {handles.map((geo, i) => (
        <mesh key={i} geometry={geo} castShadow={false}>
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
    </group>
  )
}

/** 标准回形针：扁长外圈 + 内圈，平铺在纸面 */
function PaperClip({ position, rotation = [0, 0, 0] }) {
  const geometry = useMemo(() => {
    const W = 0.007
    const Wi = 0.0032
    const L = 0.016
    const pts = [
      // 外圈左臂自下而上
      [-W, 0, -L],
      [-W, 0, L * 0.55],
      // 外圈顶端圆弧
      [-W * 0.7, 0, L * 0.85],
      [0, 0, L],
      [W * 0.7, 0, L * 0.85],
      // 外圈右臂向下
      [W, 0, L * 0.55],
      [W, 0, -L * 0.75],
      // 外圈底端拐入内圈
      [W * 0.55, 0, -L],
      [Wi, 0, -L * 0.85],
      // 内圈右臂向上
      [Wi, 0, L * 0.35],
      // 内圈顶端
      [Wi * 0.5, 0, L * 0.55],
      [0, 0, L * 0.6],
      [-Wi * 0.5, 0, L * 0.55],
      // 内圈左臂向下收尾
      [-Wi, 0, L * 0.35],
      [-Wi, 0, -L * 0.35],
    ]
    return tubeFromPoints(pts, 0.00115, 72)
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} castShadow={false} rotation={[-0.05, 0, 0]}>
        <meshStandardMaterial {...METAL} />
      </mesh>
    </group>
  )
}

/**
 * 作品合集：纸质档案文件夹（参考 Paper Archives mockup）
 * 平放桌面，面向桌面前方略抬。
 */
export function ArchiveFolderMesh() {
  const jacketMap = useMemo(() => createFolderJacketTexture(), [])
  const paperMap = useMemo(() => createArchivePaperTexture(), [])
  const blueMap = useMemo(() => createBlueOverlayTexture(), [])
  const stripMap = useMemo(() => createVellumStripTexture(), [])
  const tabMaps = useMemo(
    () =>
      ['WORKS 01', 'WORKS 02', 'WORKS 03', 'WORKS 04', 'WORKS 05'].map((label) =>
        createTabLabelTexture(label),
      ),
    [],
  )

  const holeZs = useMemo(() => {
    const list = []
    for (let i = 0; i < 6; i++) {
      list.push(-FOLDER_D * 0.36 + (i * (FOLDER_D * 0.72)) / 5)
    }
    return list
  }, [])

  return (
    <group rotation={[-0.12, 0.28, 0.04]} scale={1.05}>
      {/* 灰斑文件夹底壳 */}
      <SoftBox
        args={[FOLDER_W, FOLDER_H, FOLDER_D]}
        radius={0.014}
        color="#cfcfc7"
        roughness={0.97}
      />
      <PaperPlane
        map={jacketMap}
        width={FOLDER_W * 0.985}
        height={FOLDER_D * 0.985}
        position={[0, FOLDER_H * 0.55, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        roughness={0.96}
      />

      {/* 打孔：顶面浅凹，避免像线圈本 */}
      {holeZs.map((z, i) => (
        <SoftCylinder
          key={`hole-${i}`}
          args={[0.0075, 0.0075, 0.006, 12]}
          position={[-FOLDER_W * 0.4, FOLDER_H * 0.72, z]}
          color="#8e8c84"
          roughness={0.98}
          castShadow={false}
        />
      ))}

      {/* 右侧索引标签 */}
      {tabMaps.map((map, i) => {
        const z = FOLDER_D * 0.32 - i * 0.07
        return (
          <group key={`tab-${i}`} position={[FOLDER_W * 0.5, FOLDER_H * 0.55, z]}>
            <SoftBox
              args={[0.036, 0.014, 0.056]}
              radius={0.007}
              color={i % 2 === 0 ? '#c4c4bc' : '#d4d4cc'}
              roughness={0.96}
              castShadow={false}
            />
            <mesh position={[0.019, 0.009, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
              <planeGeometry args={[0.048, 0.022]} />
              <meshStandardMaterial
                map={map}
                transparent
                roughness={0.95}
                metalness={0}
                depthWrite={false}
              />
            </mesh>
          </group>
        )
      })}

      {/* 白星点主纸 */}
      <SoftBox
        args={[FOLDER_W * 0.78, 0.005, FOLDER_D * 0.8]}
        radius={0.008}
        position={[0.012, FOLDER_H * 1.05, 0.012]}
        color="#f7f7f5"
        roughness={0.95}
        castShadow={false}
      />
      <PaperPlane
        map={paperMap}
        width={FOLDER_W * 0.76}
        height={FOLDER_D * 0.78}
        position={[0.012, FOLDER_H * 1.4, 0.012]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* 左侧半透明条 + 回形针 */}
      <PaperPlane
        map={stripMap}
        width={FOLDER_W * 0.13}
        height={FOLDER_D * 0.74}
        position={[-FOLDER_W * 0.26, FOLDER_H * 1.75, 0.02]}
        rotation={[-Math.PI / 2, 0, 0.015]}
        opacity={0.9}
        transparent
      />
      <PaperClip
        position={[-FOLDER_W * 0.26, FOLDER_H * 2.15, -FOLDER_D * 0.28]}
        rotation={[0, 0.15, 0.12]}
      />

      {/* 蓝色信息叠页 */}
      <group position={[0.055, FOLDER_H * 1.9, 0.025]} rotation={[0, 0.05, 0.04]}>
        <SoftBox
          args={[FOLDER_W * 0.55, 0.004, FOLDER_D * 0.66]}
          radius={0.006}
          color="#7eb4d4"
          roughness={0.88}
          castShadow={false}
        />
        <PaperPlane
          map={blueMap}
          width={FOLDER_W * 0.53}
          height={FOLDER_D * 0.64}
          position={[0, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          opacity={0.92}
          transparent
          roughness={0.85}
        />
      </group>

      <BinderClip position={[-FOLDER_W * 0.5, FOLDER_H * 1.35, 0.02]} />
    </group>
  )
}
