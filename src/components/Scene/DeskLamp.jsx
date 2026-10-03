import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { SoftBox, SoftCylinder } from './softPrimitives'

/**
 * 哑光灰蓝：比奶白墙更易辨认，贴合 softBlue / 玻璃冷色点缀，不抢木桌暖色。
 */
const BODY = '#a9b8c6'
const SHADE = '#b7c4d0'

const BASE_R = 0.082
const BASE_H = 0.015
const POST_H = 0.044
const ROD_W = 0.014
const ROD_T = 0.009
const ROD_GAP = 0.04
const LOWER_LEN = 0.28
const UPPER_LEN = 0.26

/**
 * 下臂近竖；第二节更竖直（肘弯减小）；灯罩朝向相对上一版反向（偏后/内侧）。
 */
const LOWER_ANGLE = 1.42
const ELBOW_ANGLE = -0.52
const HEAD_TILT = -1.33
/** 相对上一版 HEAD_YAW=+0.38 取反 */
const HEAD_YAW = -0.38

function makeShadeGeometry() {
  const pts = []
  pts.push(new THREE.Vector2(0.0, 0.0))
  pts.push(new THREE.Vector2(0.032, 0.0))
  pts.push(new THREE.Vector2(0.036, 0.014))
  pts.push(new THREE.Vector2(0.038, 0.032))
  for (let i = 0; i <= 16; i++) {
    const t = i / 16
    const y = 0.032 + t * 0.115
    const flare = 0.038 + 0.072 * Math.pow(t, 1.1)
    const lip = t > 0.85 ? Math.sin(((t - 0.85) / 0.15) * Math.PI) * 0.008 : 0
    pts.push(new THREE.Vector2(flare + lip, y))
  }
  pts.push(new THREE.Vector2(0.115, 0.152))
  pts.push(new THREE.Vector2(0.106, 0.156))
  pts.push(new THREE.Vector2(0.096, 0.152))
  pts.push(new THREE.Vector2(0.092, 0.144))
  for (let i = 15; i >= 0; i--) {
    const t = i / 16
    const y = 0.032 + t * 0.115
    const flare = 0.038 + 0.072 * Math.pow(t, 1.1)
    pts.push(new THREE.Vector2(Math.max(0.022, flare - 0.01), y))
  }
  pts.push(new THREE.Vector2(0.028, 0.02))
  pts.push(new THREE.Vector2(0.0, 0.02))

  const geo = new THREE.LatheGeometry(pts, 40)
  geo.rotateZ(-Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

function makeSpringGeometry(length = 0.11, coilR = 0.0075, coils = 11, wire = 0.002) {
  const pts = []
  const steps = coils * 16
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * coils * Math.PI * 2
    pts.push(new THREE.Vector3(t * length, Math.cos(a) * coilR, Math.sin(a) * coilR))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), steps, wire, 5, false)
}

function ArmRods({ length }) {
  const half = ROD_GAP * 0.5
  return (
    <>
      <SoftBox
        args={[length, ROD_W, ROD_T]}
        radius={0.0034}
        position={[length * 0.5, 0, half]}
        color={BODY}
        roughness={0.96}
      />
      <SoftBox
        args={[length, ROD_W, ROD_T]}
        radius={0.0034}
        position={[length * 0.5, 0, -half]}
        color={BODY}
        roughness={0.96}
      />
    </>
  )
}

function PivotDisk({ radius = 0.015 }) {
  return (
    <SoftCylinder
      args={[radius, radius, ROD_GAP + 0.012, 18]}
      rotation={[Math.PI / 2, 0, 0]}
      color={BODY}
      roughness={0.95}
    />
  )
}

/**
 * 建筑师摇臂台灯：姿态对照参考（灯罩斜对桌面），镜像朝 +X，灰蓝哑光。
 */
export function DeskLamp({ position = [-1.05, 0.785, -0.28], scale = 1.35 }) {
  const { shadeGeo, springGeo } = useMemo(
    () => ({
      shadeGeo: makeShadeGeometry(),
      springGeo: makeSpringGeometry(0.13, 0.0075, 12, 0.002),
    }),
    [],
  )

  useEffect(() => {
    return () => {
      shadeGeo.dispose()
      springGeo.dispose()
    }
  }, [shadeGeo, springGeo])

  const springY = -0.022
  const springZ = ROD_GAP * 0.34

  return (
    <group position={position} scale={scale} rotation={[0, -0.05, 0]}>
      <SoftCylinder
        args={[BASE_R, BASE_R * 1.02, BASE_H, 28]}
        position={[0, BASE_H * 0.5, 0]}
        color={BODY}
        roughness={0.97}
      />
      <SoftCylinder
        args={[BASE_R * 0.88, BASE_R * 0.88, BASE_H * 0.4, 24]}
        position={[0, BASE_H * 0.9, 0]}
        color={BODY}
        roughness={0.96}
      />

      <SoftCylinder
        args={[0.015, 0.017, POST_H, 14]}
        position={[0, BASE_H + POST_H * 0.5, 0]}
        color={BODY}
        roughness={0.96}
      />
      <SoftBox
        args={[0.034, 0.026, ROD_GAP + 0.02]}
        radius={0.004}
        position={[0.01, BASE_H + POST_H + 0.005, 0]}
        color={BODY}
        roughness={0.96}
      />

      <group position={[0.014, BASE_H + POST_H + 0.012, 0]} rotation={[0, 0, LOWER_ANGLE]}>
        <PivotDisk radius={0.015} />
        <ArmRods length={LOWER_LEN} />

        <mesh geometry={springGeo} position={[0.024, springY, springZ]} castShadow>
          <meshStandardMaterial color={BODY} roughness={0.92} metalness={0} />
        </mesh>
        <mesh geometry={springGeo} position={[0.024, springY, -springZ]} castShadow>
          <meshStandardMaterial color={BODY} roughness={0.92} metalness={0} />
        </mesh>

        <group position={[LOWER_LEN, 0, 0]} rotation={[0, 0, ELBOW_ANGLE]}>
          <PivotDisk radius={0.017} />
          <ArmRods length={UPPER_LEN} />

          <group position={[UPPER_LEN, 0, 0]} rotation={[0, HEAD_YAW, HEAD_TILT]}>
            <PivotDisk radius={0.014} />
            <SoftBox
              args={[0.042, 0.02, 0.024]}
              radius={0.004}
              position={[0.024, 0, 0]}
              color={BODY}
              roughness={0.96}
            />
            <mesh
              geometry={shadeGeo}
              position={[0.038, 0, 0]}
              scale={0.78}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={SHADE} roughness={0.94} metalness={0} side={THREE.DoubleSide} />
            </mesh>
            <SoftCylinder
              args={[0.01, 0.012, 0.012, 12]}
              position={[0.07, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
              color="#f0e4d0"
              roughness={0.72}
            />
            <pointLight position={[0.1, -0.04, 0]} intensity={0.42} distance={2.6} color="#fff1d6" />
          </group>
        </group>
      </group>
    </group>
  )
}
