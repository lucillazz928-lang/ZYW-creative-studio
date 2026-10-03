import { useMemo, useRef } from 'react'

import { useFrame } from '@react-three/fiber'

import * as THREE from 'three'

import { useInteraction } from '../../state/interactionState'



/**

 * 对齐参考图：空心奶白杯 + 杯内咖啡液 + 米色碟 + 三缕蒸汽。

 * 杯身用双层圆柱，避免 Lathe 接缝竖线。

 */



const CUP = '#f3eee6'

const SAUCER = '#e0c9a8'

const COFFEE = '#2c1a12'

const STEAM = '#f8f6f2'

/** 桌面小物件：段数够圆即可，不必 48 */

const SEG = 20



function Ceramic({ color, roughness = 0.48, side = THREE.FrontSide }) {

  return (

    <meshStandardMaterial

      color={color}

      roughness={roughness}

      metalness={0}

      side={side}

      flatShading={false}

    />

  )

}



function makeHandleGeometry() {

  const curve = new THREE.EllipseCurve(0, 0, 0.026, 0.03, -Math.PI * 0.62, Math.PI * 0.62, false, 0)

  const points = curve.getPoints(20).map((p) => new THREE.Vector3(p.x, p.y, 0))

  const path = new THREE.CatmullRomCurve3(points)

  const g = new THREE.TubeGeometry(path, 20, 0.011, 8, false)

  g.computeVertexNormals()

  return g

}



function makeSteamPath(seed) {

  const sway = (seed - 1) * 0.01

  const pts = []

  for (let i = 0; i <= 8; i++) {

    const t = i / 8

    pts.push(

      new THREE.Vector3(

        sway + Math.sin(t * Math.PI * 1.2 + seed) * 0.008 * t,

        t * 0.1,

        Math.cos(t * Math.PI * 0.9 + seed * 0.7) * 0.005 * t,

      ),

    )

  }

  return new THREE.CatmullRomCurve3(pts)

}



function SteamTrail({ index, reducedMotion, paused }) {

  const ref = useRef()

  const geo = useMemo(() => {

    const path = makeSteamPath(index)

    const g = new THREE.TubeGeometry(path, 12, 0.0032 - index * 0.0004, 5, false)

    g.computeVertexNormals()

    return g

  }, [index])



  useFrame(({ clock }) => {

    if (!ref.current || reducedMotion || paused) return

    const t = clock.elapsedTime

    const mat = ref.current.material

    if (mat) mat.opacity = 0.28 + Math.sin(t * 2.2 + index * 1.4) * 0.08

    ref.current.rotation.y = Math.sin(t * 0.9 + index) * 0.12

  })



  return (

    <mesh

      ref={ref}

      geometry={geo}

      position={[(index - 1) * 0.01, 0.09, 0]}

      castShadow={false}

      receiveShadow={false}

    >

      <meshBasicMaterial

        color={STEAM}

        transparent

        opacity={reducedMotion ? 0.22 : 0.3}

        depthWrite={false}

        toneMapped={false}

      />

    </mesh>

  )

}



export function Coffee({ scale = 1, ...props }) {

  const { overlayState } = useInteraction()

  const handleGeo = useMemo(() => makeHandleGeometry(), [])

  const reducedMotion = useMemo(

    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    [],

  )



  return (

    <group scale={scale} {...props}>

      {/* 米色平碟 — 小物件不投阴影 */}

      <mesh position={[0, -0.02, 0]} castShadow={false} receiveShadow>

        <cylinderGeometry args={[0.072, 0.078, 0.008, SEG]} />

        <Ceramic color={SAUCER} roughness={0.58} />

      </mesh>

      <mesh position={[0, -0.014, 0]} castShadow={false} receiveShadow>

        <cylinderGeometry args={[0.08, 0.072, 0.006, SEG]} />

        <Ceramic color={SAUCER} roughness={0.55} />

      </mesh>



      {/* 杯外壁 */}

      <mesh position={[0, 0.044, 0]} castShadow={false} receiveShadow>

        <cylinderGeometry args={[0.045, 0.043, 0.088, SEG, 1, true]} />

        <Ceramic color={CUP} side={THREE.DoubleSide} />

      </mesh>

      {/* 杯底 */}

      <mesh position={[0, 0.004, 0]} castShadow={false} receiveShadow>

        <cylinderGeometry args={[0.043, 0.043, 0.008, SEG]} />

        <Ceramic color={CUP} />

      </mesh>



      {/* 杯内咖啡 */}

      <mesh position={[0, 0.044, 0]} castShadow={false} receiveShadow>

        <cylinderGeometry args={[0.038, 0.036, 0.07, SEG]} />

        <meshStandardMaterial color={COFFEE} roughness={0.42} metalness={0.04} />

      </mesh>



      {/* C 形把手 */}

      <mesh geometry={handleGeo} position={[0.045, 0.044, 0]} castShadow={false} receiveShadow>

        <Ceramic color={CUP} />

      </mesh>



      {[0, 1, 2].map((i) => (

        <SteamTrail key={i} index={i} reducedMotion={reducedMotion} paused={Boolean(overlayState)} />

      ))}

    </group>

  )

}



export default Coffee


