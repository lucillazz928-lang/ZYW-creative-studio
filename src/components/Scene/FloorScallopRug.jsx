/**
 * Scalloped-edge floor rug — landscape, pale matte blush.
 * Larger footprint; irregular but always-rounded lobes on every edge.
 */
import { useMemo } from 'react'
import * as THREE from 'three'

const RUG = '#e6d5c2'

/** Deterministic 0..1 hash so shape stays stable across renders */
function hash01(i, salt = 0) {
  const n = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** Split an edge into irregular positive weights that sum to 1 */
function irregularWeights(count, salt) {
  const raw = Array.from({ length: count }, (_, i) => 0.55 + hash01(i, salt) * 0.9)
  const sum = raw.reduce((a, b) => a + b, 0)
  return raw.map((v) => v / sum)
}

/**
 * Landscape scalloped rectangle.
 * Every lobe is a round cubic bulge; widths & depths vary per lobe.
 */
export function buildScallopRugShape(width = 2.05, depth = 1.35, baseAmp = 0.095) {
  const shape = new THREE.Shape()
  const hw = width * 0.5
  const hd = depth * 0.5

  // Bottom / top: more lobes along the long side; left / right: fewer
  const longN = 5
  const shortN = 4

  const roundLobe = (ax, ay, bx, by, nx, ny, amp) => {
    const dx = bx - ax
    const dy = by - ay
    // Soft round bulge: cubic handles pull along the edge then out
    const c1x = ax + dx * 0.22 + nx * amp * 0.92
    const c1y = ay + dy * 0.22 + ny * amp * 0.92
    const c2x = ax + dx * 0.78 + nx * amp * 0.92
    const c2y = ay + dy * 0.78 + ny * amp * 0.92
    shape.bezierCurveTo(c1x, c1y, c2x, c2y, bx, by)
  }

  const runEdge = (x0, y0, x1, y1, nx, ny, count, salt) => {
    const weights = irregularWeights(count, salt)
    let px = x0
    let py = y0
    let t = 0
    for (let i = 0; i < count; i++) {
      t += weights[i]
      const qx = x0 + (x1 - x0) * t
      const qy = y0 + (y1 - y0) * t
      const amp = baseAmp * (0.72 + hash01(i, salt + 17) * 0.7)
      roundLobe(px, py, qx, qy, nx, ny, amp)
      px = qx
      py = qy
    }
  }

  // Bottom-left start → bottom → right → top → left
  shape.moveTo(-hw, -hd)
  runEdge(-hw, -hd, hw, -hd, 0, -1, longN, 1)
  runEdge(hw, -hd, hw, hd, 1, 0, shortN, 2)
  runEdge(hw, hd, -hw, hd, 0, 1, longN, 3)
  runEdge(-hw, hd, -hw, -hd, -1, 0, shortN, 4)
  shape.closePath()
  return shape
}

function makePileTexture(hex, size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, size, size)
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = ((i * 13) % 9) - 4
    d[i] = Math.min(255, Math.max(0, d[i] + n))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n))
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2.6, 1.8)
  tex.needsUpdate = true
  return tex
}

function buildRugGeometry() {
  const shape = buildScallopRugShape(2.05, 1.35, 0.1)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.008,
    bevelSegments: 4,
    curveSegments: 36,
  })
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

export function FloorScallopRug({ position = [0, 0.01, 0.18], scale = 1.08 }) {
  const { geometry, material } = useMemo(() => {
    const map = makePileTexture(RUG)
    return {
      geometry: buildRugGeometry(),
      material: new THREE.MeshStandardMaterial({
        map,
        color: '#ffffff',
        roughness: 0.98,
        metalness: 0,
      }),
    }
  }, [])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}
