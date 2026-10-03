import { RoundedBox } from '@react-three/drei'

/** 粘土感哑光：高 roughness、零金属 */
export function Matte({ color, roughness = 0.94, metalness = 0, emissive, emissiveIntensity = 0 }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  )
}

/**
 * 圆角软盒。radius 自动按最短边钳制，避免薄片穿模。
 * @param {number[]} args [w, h, d]
 */
export function SoftBox({
  args = [1, 1, 1],
  radius,
  color,
  roughness = 0.94,
  metalness = 0,
  emissive,
  emissiveIntensity = 0,
  /** 默认关：小物件不投阴影；桌/墙/门等大件再显式打开 */
  castShadow = false,
  receiveShadow = true,
  ...props
}) {
  const [w, h, d] = args
  const min = Math.min(w, h, d)
  const r = Math.min(radius ?? min * 0.14, min * 0.48)

  return (
    <RoundedBox
      args={args}
      radius={r}
      smoothness={2}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      {...props}
    >
      <Matte
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </RoundedBox>
  )
}

/** 软球：盆栽叶片、灯罩等 */
export function SoftSphere({
  args = [0.1, 16, 16],
  color,
  roughness = 0.94,
  metalness = 0,
  emissive,
  emissiveIntensity = 0,
  castShadow = false,
  receiveShadow = true,
  ...props
}) {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow} {...props}>
      <sphereGeometry args={args} />
      <Matte
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}

/** 软柱：杯、花盆等 */
export function SoftCylinder({
  args = [0.05, 0.05, 0.1, 20],
  color,
  roughness = 0.94,
  metalness = 0,
  castShadow = false,
  receiveShadow = true,
  ...props
}) {
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow} {...props}>
      <cylinderGeometry args={args} />
      <Matte color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}
