import { useEffect, useRef } from 'react'
import { useInteraction } from '../../state/interactionState'
import { animateDoorOpen } from '../../animation/doorAnimations'
import { palette } from './scenePalette'
import { SoftBox } from './softPrimitives'

/** 进入房间后保留在侧边的简化门，避免挡住工作台 */
export function Door() {
  const { cameraState } = useInteraction()
  const doorRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    if (!doorRef.current || cameraState === 'entry') return undefined
    timelineRef.current?.kill()
    timelineRef.current = animateDoorOpen(doorRef.current)
    return () => timelineRef.current?.kill()
  }, [cameraState])

  // 跟室内场景走，避免 entry 镜头阶段挂着侧门
  if (cameraState === 'entry') return null

  return (
    <group position={[-2.35, 0, 1.15]} rotation={[0, 0.4, 0]}>
      <SoftBox
        args={[1.15, 2.25, 0.08]}
        radius={0.04}
        position={[0, 1.15, -0.04]}
        color={palette.trim}
        roughness={0.95}
        castShadow
      />
      <group ref={doorRef} position={[-0.5, 0, 0]}>
        <SoftBox
          args={[0.95, 2.05, 0.06]}
          radius={0.04}
          position={[0.5, 1.15, 0]}
          color={palette.woodDoor}
          roughness={0.9}
          castShadow
        />
        <SoftBox
          args={[0.68, 0.68, 0.025]}
          radius={0.035}
          position={[0.5, 1.45, 0.035]}
          color={palette.woodPanel}
          roughness={0.92}
        />
        <SoftBox
          args={[0.68, 0.68, 0.025]}
          radius={0.035}
          position={[0.5, 0.7, 0.035]}
          color={palette.woodPanel}
          roughness={0.92}
        />
        <SoftBox
          args={[0.03, 0.03, 0.14]}
          radius={0.012}
          position={[0.82, 1.15, 0.08]}
          color="#d4cfc6"
          roughness={0.7}
        />
      </group>
    </group>
  )
}
