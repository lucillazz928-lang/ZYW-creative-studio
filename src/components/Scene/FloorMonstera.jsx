import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { palette } from './scenePalette'

const POT_H = 0.4

const LAYOUTS = [
  { az: 18, len: 1.58, tilt: 0.95, roll: -0.28, scale: 1.12, juv: false, colorKey: 'leaf' },
  { az: 78, len: 1.17, tilt: 1.15, roll: 0.32, scale: 1.18, juv: false, colorKey: 'leafMid' },
  { az: 145, len: 1.47, tilt: 1.0, roll: -0.18, scale: 1.05, juv: false, colorKey: 'leaf' },
  { az: 208, len: 1.02, tilt: 1.22, roll: 0.38, scale: 1.22, juv: false, colorKey: 'leafMid' },
  { az: 272, len: 1.43, tilt: 1.05, roll: -0.22, scale: 1.08, juv: false, colorKey: 'leaf' },
  { az: 332, len: 0.98, tilt: 1.28, roll: 0.22, scale: 1.12, juv: false, colorKey: 'leafMid' },
  { az: 48, len: 1.83, tilt: 0.42, roll: 0.08, scale: 0.58, juv: true, colorKey: 'leafLite' },
  { az: 225, len: 1.73, tilt: 0.5, roll: -0.1, scale: 0.52, juv: true, colorKey: 'leafLite' },
]

const LEAF_COLORS = {
  leaf: palette.plant,
  leafMid: palette.plantDeep,
  leafLite: palette.plantLite,
}

function ovalHole(cx, cy, rx, ry) {
  const hole = new THREE.Path()
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI * 2
    const x = cx + Math.cos(a) * rx
    const y = cy + Math.sin(a) * ry
    if (i === 0) hole.moveTo(x, y)
    else hole.lineTo(x, y)
  }
  return hole
}

function makeLeafGeometry(seed = 0, juvenile = false) {
  const s = juvenile ? 0.48 : 0.78
  const shape = new THREE.Shape()
  const lobes = juvenile ? 3 : 5
  const right = []
  const steps = 40

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const y = (0.52 - t * 0.78) * s
    let w = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.9) * 0.32 * s
    w *= 0.94 + 0.06 * Math.sin(seed)

    if (!juvenile && t > 0.1 && t < 0.88) {
      const u = (t - 0.1) / 0.78
      const wave = Math.sin(u * Math.PI * lobes + seed * 0.15)
      w *= 0.88 + 0.12 * Math.abs(wave)
      const cleft = Math.pow(1 - Math.abs(wave), 3.2)
      w -= cleft * 0.028 * s
      w = Math.max(w, 0.06 * s)
    } else if (juvenile && t > 0.2 && t < 0.8) {
      const u = (t - 0.2) / 0.6
      w *= 0.92 + 0.08 * Math.abs(Math.sin(u * Math.PI * lobes))
    }
    right.push([w, y])
  }

  shape.moveTo(0, right[0][1])
  for (let i = 1; i < right.length; i++) {
    const [x0, y0] = right[i - 1]
    const [x1, y1] = right[i]
    shape.quadraticCurveTo(x0, y0, (x0 + x1) * 0.5, (y0 + y1) * 0.5)
  }
  const last = right[right.length - 1]
  shape.quadraticCurveTo(last[0], last[1], 0.04 * s, -0.22 * s)
  shape.quadraticCurveTo(0, -0.16 * s, -0.04 * s, -0.22 * s)
  for (let i = right.length - 1; i >= 1; i--) {
    const [x0, y0] = right[i]
    const [x1, y1] = right[i - 1]
    shape.quadraticCurveTo(-x0, y0, (-x0 - x1) * 0.5, (y0 + y1) * 0.5)
  }
  shape.quadraticCurveTo(-right[0][0], right[0][1], 0, right[0][1])

  if (!juvenile) {
    shape.holes.push(ovalHole(0.07 * s, 0.16 * s, 0.038 * s, 0.06 * s))
    shape.holes.push(ovalHole(-0.08 * s, 0.02 * s, 0.034 * s, 0.055 * s))
    shape.holes.push(ovalHole(0.065 * s, -0.1 * s, 0.03 * s, 0.048 * s))
    shape.holes.push(ovalHole(-0.055 * s, 0.28 * s, 0.026 * s, 0.04 * s))
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.0018,
    bevelSegments: 2,
    curveSegments: 10,
  })
  geo.translate(0, 0.22 * s, -0.003)

  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const along = (y + 0.1) / (0.7 * s)
    const fold = Math.sin(along * Math.PI) * 0.055 * (1 - Math.min(1, Math.abs(x) * 2.2))
    const droop = -Math.max(0, along) * along * 0.04
    const cup = -x * x * 0.85
    const edgeCurl = Math.sign(x || 1) * Math.pow(Math.abs(x) / (0.32 * s + 0.001), 1.6) * 0.03
    pos.setZ(i, z + fold + droop + cup + edgeCurl)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function makePotGeometry() {
  const pts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.12, 0.0),
  ]
  for (let i = 0; i <= 10; i++) {
    const t = i / 10
    const ang = Math.PI * 0.5 * t
    pts.push(new THREE.Vector2(0.12 + 0.2 * Math.sin(ang), 0.12 * (1 - Math.cos(ang))))
  }
  pts.push(
    new THREE.Vector2(0.33, 0.2),
    new THREE.Vector2(0.35, 0.3),
    new THREE.Vector2(0.355, 0.38),
    new THREE.Vector2(0.37, 0.39),
    new THREE.Vector2(0.355, 0.4),
    new THREE.Vector2(0.31, 0.4),
    new THREE.Vector2(0.3, 0.385),
    new THREE.Vector2(0.29, 0.28),
    new THREE.Vector2(0.26, 0.16),
    new THREE.Vector2(0.16, 0.06),
    new THREE.Vector2(0.0, 0.05),
  )
  return new THREE.LatheGeometry(pts, 48)
}

function makePetioleGeometry(length, bend = 0.08) {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(bend * 0.25, length * 0.25, 0.01),
    new THREE.Vector3(bend * 0.85, length * 0.7, -0.01),
    new THREE.Vector3(bend, length, 0.02),
  )
  return new THREE.TubeGeometry(curve, 14, 0.011, 8, false)
}

/**
 * 桌侧落地龟背竹：淡黄油光盆 + 绿色叶茎（程序化）
 * unit≈预览比例，房间里用 scale≈0.32–0.38
 */
export function FloorMonstera({ position, scale = 0.36, mirror = false }) {
  const { potGeo, soilGeo, stems } = useMemo(() => {
    const potGeo = makePotGeometry()
    const soilGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.035, 32)
    const stems = LAYOUTS.map((L, i) => {
      const seed = i * 1.7 + (mirror ? 2.4 : 0)
      const az = THREE.MathUtils.degToRad(L.az) * (mirror ? -1 : 1)
      return {
        ...L,
        az,
        petioleGeo: makePetioleGeometry(L.len, 0.04 + (i % 3) * 0.015),
        leafGeo: makeLeafGeometry(seed, L.juv),
        color: LEAF_COLORS[L.colorKey],
      }
    })
    return { potGeo, soilGeo, stems }
  }, [mirror])

  useEffect(() => {
    return () => {
      potGeo.dispose()
      soilGeo.dispose()
      stems.forEach((s) => {
        s.petioleGeo.dispose()
        s.leafGeo.dispose()
      })
    }
  }, [potGeo, soilGeo, stems])

  return (
    <group position={position} scale={scale}>
      <mesh geometry={potGeo} castShadow receiveShadow>
        <meshStandardMaterial color={palette.potPale} roughness={0.88} metalness={0} />
      </mesh>
      <mesh geometry={soilGeo} position={[0, POT_H, 0]} receiveShadow>
        <meshStandardMaterial color="#3d2a1c" roughness={0.95} metalness={0} />
      </mesh>

      <group position={[0, POT_H, 0]}>
        {stems.map((S, i) => (
          <group
            key={i}
            position={[Math.sin(S.az) * 0.035, 0.02, Math.cos(S.az) * 0.035]}
            rotation={[0, S.az, 0]}
          >
            <mesh geometry={S.petioleGeo} castShadow>
              <meshStandardMaterial color={palette.plant} roughness={0.82} metalness={0} />
            </mesh>
            <mesh
              geometry={S.leafGeo}
              castShadow
              receiveShadow
              position={[0.045, S.len * 0.98, 0]}
              rotation={[S.tilt, 0, S.roll * (mirror ? -1 : 1)]}
              scale={S.scale}
            >
              <meshStandardMaterial
                color={S.color}
                roughness={S.juv ? 0.8 : 0.88}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
