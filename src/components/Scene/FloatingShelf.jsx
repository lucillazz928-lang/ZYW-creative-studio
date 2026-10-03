import { SoftBox, SoftCylinder, SoftSphere } from './softPrimitives'
import { palette } from './scenePalette'

/** 显示器上方长层架：蜡烛、相框、时钟、小盆栽（书本由 sketchbook 交互物承担） */
export function FloatingShelf({ position = [0.05, 1.88, -1.18] }) {
  return (
    <group position={position}>
      <SoftBox
        args={[2.05, 0.045, 0.22]}
        radius={0.018}
        color={palette.woodLight}
        roughness={0.88}
      />
      <SoftBox
        args={[2.0, 0.02, 0.2]}
        radius={0.01}
        position={[0, -0.028, 0]}
        color={palette.wood}
        roughness={0.9}
        castShadow={false}
      />

      {/* 装饰书本 */}
      {['#efb7b7', '#f0d36a', '#8eb6d4', '#e8a05c', '#c8e0c4'].map((color, i) => (
        <SoftBox
          key={i}
          args={[0.032, 0.12 + (i % 3) * 0.015, 0.11]}
          radius={0.008}
          position={[-0.85 + i * 0.05, 0.08, 0]}
          color={color}
          roughness={0.92}
        />
      ))}

      {/* 白蜡烛 */}
      <SoftCylinder
        args={[0.028, 0.03, 0.1, 16]}
        position={[-0.42, 0.072, 0.02]}
        color="#f5f0ea"
        roughness={0.9}
      />
      <SoftCylinder
        args={[0.026, 0.028, 0.08, 16]}
        position={[-0.32, 0.062, 0.02]}
        color="#f8f4ee"
        roughness={0.9}
      />

      {/* 小相框 */}
      <SoftBox
        args={[0.12, 0.14, 0.02]}
        radius={0.01}
        position={[-0.08, 0.09, 0.02]}
        color={palette.woodDeep}
        roughness={0.9}
      />
      <SoftBox
        args={[0.095, 0.11, 0.01]}
        radius={0.006}
        position={[-0.08, 0.09, 0.028]}
        color="#e8f0e4"
        roughness={0.95}
        castShadow={false}
      />

      {/* 彩虹标语小框 */}
      <SoftBox
        args={[0.2, 0.12, 0.018]}
        radius={0.012}
        position={[0.22, 0.08, 0.02]}
        color="#faf6f0"
        roughness={0.92}
      />
      {[
        ['#efb7b7', -0.06],
        ['#f0d36a', -0.02],
        ['#8cbc84', 0.02],
        ['#8eb6d4', 0.06],
      ].map(([color, x], i) => (
        <SoftBox
          key={i}
          args={[0.028, 0.014, 0.006]}
          radius={0.004}
          position={[0.22 + x, 0.08, 0.032]}
          color={color}
          roughness={0.9}
          castShadow={false}
        />
      ))}

      {/* 粉猪脸小盆栽 */}
      <SoftSphere
        args={[0.035, 12, 12]}
        position={[0.48, 0.05, 0.02]}
        color={palette.blush}
        roughness={0.9}
      />
      <SoftSphere
        args={[0.028, 10, 10]}
        position={[0.48, 0.1, 0.02]}
        color={palette.plantLite}
        roughness={0.95}
        castShadow={false}
      />

      {/* 粉数字时钟 */}
      <SoftBox
        args={[0.16, 0.09, 0.05]}
        radius={0.014}
        position={[0.78, 0.065, 0.02]}
        color="#e8a0b0"
        roughness={0.85}
      />
      <SoftBox
        args={[0.11, 0.045, 0.01]}
        radius={0.006}
        position={[0.78, 0.07, 0.04]}
        color="#2a2420"
        roughness={0.7}
        castShadow={false}
        emissive="#ffcc88"
        emissiveIntensity={0.35}
      />
    </group>
  )
}
