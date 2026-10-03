import { useMemo } from 'react'
import * as THREE from 'three'
import { SoftBox, SoftCylinder } from './softPrimitives'

/**
 * AirPods Max–type silver/white over-ears (img2threejs reconstruction).
 * Unit scale ~ cup height ≈ 0.12; wrap with scale for desk placement.
 */

const ALUMINUM = '#aeb4bb'
const ALUMINUM_DEEP = '#8f969e'
const CUSHION = '#c2bfba'
const CUSHION_INNER = '#9e9b96'
const BAND = '#f2f1ef'
const CANOPY = '#e8e6e2'
const CHROME = '#e4e8ec'

function MatteMetal({ color, roughness = 0.42, metalness = 0.92 }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
}

function SoftPolymer({ color, roughness = 0.78 }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
}

function KnitMesh({ color, roughness = 0.88 }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
}

function Chrome({ color = CHROME }) {
  return <meshStandardMaterial color={color} roughness={0.16} metalness={1} />
}

/** Rounded-rect (squircle) profile extruded along depth */
function makeSquircleExtrude(rx, ry, depth, corner = 0.032, bevel = 0.006) {
  const shape = new THREE.Shape()
  const x = -rx
  const y = -ry
  const w = rx * 2
  const h = ry * 2
  const r = Math.min(corner, rx * 0.92, ry * 0.92)
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelSegments: 3,
    curveSegments: 12,
  })
  g.rotateY(Math.PI / 2)
  g.translate(-depth * 0.5, 0, 0)
  g.computeVertexNormals()
  return g
}

function makeCushionRing(rx, ry, irx, iry, depth) {
  const shape = new THREE.Shape()
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0)
  const hole = new THREE.Path()
  hole.absellipse(0, 0, irx, iry, 0, Math.PI * 2, true, 0)
  shape.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
    curveSegments: 28,
  })
  g.rotateY(Math.PI / 2)
  g.translate(-depth * 0.5, 0, 0)
  g.computeVertexNormals()
  return g
}

function EarCupShell({ side }) {
  const inward = -side
  const shell = useMemo(() => makeSquircleExtrude(0.05, 0.06, 0.044, 0.036, 0.006), [])
  const lip = useMemo(() => makeSquircleExtrude(0.046, 0.056, 0.012, 0.034, 0.003), [])

  return (
    <group>
      <mesh geometry={shell} position={[inward * 0.01, 0, 0]} castShadow receiveShadow>
        <MatteMetal color={ALUMINUM} roughness={0.38} metalness={0.95} />
      </mesh>
      <mesh geometry={lip} position={[inward * 0.032, 0, 0]} castShadow={false}>
        <MatteMetal color={ALUMINUM_DEEP} roughness={0.45} metalness={0.88} />
      </mesh>
      {/* Mic / vent slits */}
      {[0.032, -0.032].map((z, i) => (
        <SoftBox
          key={i}
          args={[0.0035, 0.005, 0.012]}
          radius={0.0015}
          position={[inward * 0.03, -0.038, z]}
          color={ALUMINUM_DEEP}
          roughness={0.55}
          metalness={0.7}
          castShadow={false}
        />
      ))}
    </group>
  )
}

function EarCushion({ side }) {
  const inward = -side
  const geo = useMemo(() => makeCushionRing(0.046, 0.054, 0.024, 0.03, 0.028), [])

  return (
    <group position={[inward * 0.04, 0, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <KnitMesh color={CUSHION} />
      </mesh>
      <mesh position={[inward * 0.004, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow={false}>
        <cylinderGeometry args={[0.024, 0.026, 0.008, 22]} />
        <KnitMesh color={CUSHION_INNER} roughness={0.92} />
      </mesh>
    </group>
  )
}

function CrownControls() {
  return (
    <group position={[0.012, 0.058, 0.018]} rotation={[0.2, 0, 0.1]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.0085, 0.0085, 0.011, 16]} />
        <MatteMetal color={ALUMINUM} roughness={0.32} metalness={0.95} />
      </mesh>
      {[0.0028, -0.0028].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={false}>
          <torusGeometry args={[0.0088, 0.001, 6, 16]} />
          <MatteMetal color={ALUMINUM_DEEP} roughness={0.5} metalness={0.85} />
        </mesh>
      ))}
      <SoftBox
        args={[0.007, 0.013, 0.005]}
        radius={0.0018}
        position={[0.016, 0, 0]}
        color={ALUMINUM}
        roughness={0.38}
        metalness={0.9}
        castShadow={false}
      />
    </group>
  )
}

function EarAssembly({ side, withControls = false }) {
  return (
    <group position={[side * 0.098, -0.012, 0]} rotation={[0, 0, side * 0.05]}>
      <EarCupShell side={side} />
      <EarCushion side={side} />
      <mesh position={[0, 0.058, 0]} castShadow>
        <sphereGeometry args={[0.013, 12, 12]} />
        <Chrome />
      </mesh>
      {withControls ? <CrownControls /> : null}
    </group>
  )
}

function Stem({ side }) {
  const tube = useMemo(() => {
    const pts = [
      new THREE.Vector3(side * 0.055, 0.115, 0),
      new THREE.Vector3(side * 0.072, 0.08, 0),
      new THREE.Vector3(side * 0.09, 0.045, 0),
      new THREE.Vector3(side * 0.098, 0.04, 0),
    ]
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.007, 8, false)
  }, [side])

  return (
    <mesh geometry={tube} castShadow>
      <Chrome />
    </mesh>
  )
}

function Headband() {
  const frameTube = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 28; i++) {
      const t = i / 28
      const a = Math.PI * (1 - t)
      pts.push(new THREE.Vector3(Math.cos(a) * 0.075, Math.sin(a) * 0.068 + 0.052, 0))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, 0.0085, 10, false)
  }, [])

  const canopy = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.052, 0)
    shape.quadraticCurveTo(0, 0.03, 0.052, 0)
    shape.quadraticCurveTo(0, -0.01, -0.052, 0)
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.0035,
      bevelEnabled: false,
      curveSegments: 22,
    })
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0.112, -0.0018)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const sag = (1 - (x / 0.052) ** 2) * 0.014
      pos.setY(i, pos.getY(i) - sag)
    }
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [])

  const archL = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 18; i++) {
      const t = i / 18
      const a = Math.PI * (1 - t)
      pts.push(new THREE.Vector3(Math.cos(a) * 0.058, Math.sin(a) * 0.054 + 0.066, 0.011))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 22, 0.002, 6, false)
  }, [])

  const archR = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 18; i++) {
      const t = i / 18
      const a = Math.PI * (1 - t)
      pts.push(new THREE.Vector3(Math.cos(a) * 0.058, Math.sin(a) * 0.054 + 0.066, -0.011))
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 22, 0.002, 6, false)
  }, [])

  return (
    <group>
      <mesh geometry={frameTube} castShadow receiveShadow>
        <SoftPolymer color={BAND} />
      </mesh>
      <mesh geometry={archL} castShadow={false}>
        <Chrome />
      </mesh>
      <mesh geometry={archR} castShadow={false}>
        <Chrome />
      </mesh>
      <mesh geometry={canopy} castShadow receiveShadow>
        <KnitMesh color={CANOPY} roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <SoftCylinder
          key={side}
          args={[0.011, 0.01, 0.02, 12]}
          position={[side * 0.052, 0.112, 0]}
          rotation={[0, 0, side * 0.35]}
          color={BAND}
          roughness={0.8}
          metalness={0}
          castShadow={false}
        />
      ))}
    </group>
  )
}

/**
 * @param {object} props
 * @param {number} [props.scale=1]
 */
export function Headphones({ scale = 1, ...props }) {
  return (
    <group scale={scale} {...props}>
      <Headband />
      <Stem side={-1} />
      <Stem side={1} />
      <EarAssembly side={-1} />
      <EarAssembly side={1} withControls />
    </group>
  )
}
