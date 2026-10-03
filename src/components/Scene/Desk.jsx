import { useInteraction } from '../../state/interactionState'
import { palette } from './scenePalette'
import { SoftBox } from './softPrimitives'

/** 参考图书桌：左白柜三抽屉 + 厚浅木台面 + 右 U 形金属腿 */
export function Desk() {
  const { cameraState, enterDesk, isTransitioning } = useInteraction()
  const canEnter = cameraState === 'room' && !isTransitioning

  return (
    <group
      position={[0, 0, -0.15]}
      onPointerDown={(event) => {
        if (!canEnter) return
        event.stopPropagation()
        enterDesk()
      }}
    >
      {/* 厚浅木台面 */}
      <SoftBox
        args={[2.55, 0.09, 1.28]}
        radius={0.035}
        position={[0, 0.74, 0]}
        color={palette.woodLight}
        roughness={0.88}
        castShadow
      />
      <SoftBox
        args={[2.48, 0.02, 1.22]}
        radius={0.02}
        position={[0, 0.688, 0]}
        color={palette.wood}
        roughness={0.9}
        castShadow={false}
      />

      {/* 左侧白色三抽屉柜 */}
      <group position={[-0.78, 0, 0]}>
        <SoftBox
          args={[0.72, 0.68, 1.12]}
          radius={0.04}
          position={[0, 0.34, 0]}
          color={palette.cabinet}
          roughness={0.92}
          castShadow
        />
        {[0.52, 0.34, 0.16].map((y, i) => (
          <group key={i} position={[0, y, 0.56]}>
            <SoftBox
              args={[0.64, 0.155, 0.04]}
              radius={0.02}
              position={[0, 0, 0]}
              color={palette.cabinetDeep}
              roughness={0.9}
            />
            <SoftBox
              args={[0.12, 0.018, 0.028]}
              radius={0.006}
              position={[0, 0, 0.028]}
              color={palette.chrome}
              roughness={0.45}
              metalness={0.55}
              castShadow={false}
            />
          </group>
        ))}
      </group>

      {/* 右侧 U 形金属腿 */}
      <group position={[0.95, 0, 0]}>
        {/* 竖立柱 */}
        <SoftBox
          args={[0.055, 0.68, 0.055]}
          radius={0.012}
          position={[0, 0.34, 0.42]}
          color={palette.chrome}
          roughness={0.35}
          metalness={0.65}
          castShadow
        />
        <SoftBox
          args={[0.055, 0.68, 0.055]}
          radius={0.012}
          position={[0, 0.34, -0.42]}
          color={palette.chrome}
          roughness={0.35}
          metalness={0.65}
          castShadow
        />
        {/* 底部 U 横梁 */}
        <SoftBox
          args={[0.055, 0.05, 0.9]}
          radius={0.014}
          position={[0, 0.028, 0]}
          color={palette.chromeDeep}
          roughness={0.38}
          metalness={0.6}
        />
        {/* 顶部托板 */}
        <SoftBox
          args={[0.12, 0.04, 0.95]}
          radius={0.012}
          position={[0, 0.68, 0]}
          color={palette.chrome}
          roughness={0.4}
          metalness={0.55}
        />
      </group>
    </group>
  )
}
