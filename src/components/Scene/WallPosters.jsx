import { SoftBox } from './softPrimitives'
import { palette } from './scenePalette'

/** 左墙小海报（氛围，不可点） */
export function WallPosters({ position = [-0.95, 1.45, -1.28] }) {
  return (
    <group position={position}>
      <group position={[0, 0.12, 0]} rotation={[0, 0, -0.04]}>
        <SoftBox args={[0.28, 0.34, 0.012]} radius={0.01} color="#faf6f0" roughness={0.94} />
        <SoftBox
          args={[0.22, 0.06, 0.006]}
          radius={0.004}
          position={[0, 0.1, 0.008]}
          color="#5c534a"
          roughness={0.9}
          castShadow={false}
        />
        <SoftBox
          args={[0.16, 0.14, 0.006]}
          radius={0.008}
          position={[0, -0.02, 0.008]}
          color="#d4e0d8"
          roughness={0.94}
          castShadow={false}
        />
      </group>
      <group position={[0.32, -0.05, 0]} rotation={[0, 0, 0.06]}>
        <SoftBox args={[0.2, 0.2, 0.01]} radius={0.01} color="#f5efe4" roughness={0.94} />
        <SoftBox
          args={[0.14, 0.14, 0.006]}
          radius={0.02}
          position={[0, 0, 0.008]}
          color="#efb7b7"
          roughness={0.94}
          castShadow={false}
        />
        <SoftBox
          args={[0.08, 0.08, 0.005]}
          radius={0.015}
          position={[0.02, 0.02, 0.012]}
          color="#c8e0c4"
          roughness={0.94}
          castShadow={false}
        />
      </group>
      {/* 钉点 */}
      {[
        [-0.1, 0.28, 0.01],
        [0.1, 0.28, 0.01],
        [0.32, 0.05, 0.01],
      ].map((p, i) => (
        <SoftBox
          key={i}
          args={[0.02, 0.02, 0.01]}
          radius={0.006}
          position={p}
          color={palette.chrome}
          roughness={0.5}
          metalness={0.4}
          castShadow={false}
        />
      ))}
    </group>
  )
}
