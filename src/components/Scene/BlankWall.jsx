import { useInteraction } from '../../state/interactionState'
import { palette } from './scenePalette'
import { SoftBox } from './softPrimitives'

/** 空白墙：DESK 点墙回 ROOM；ROOM 点墙回第一幕（关门）。不抢留言板与桌面物件事件。 */
export function BlankWall() {
  const { cameraState, returnToRoom, returnToEntry, isTransitioning, overlayState } =
    useInteraction()
  const canReturnToRoom = cameraState === 'desk' && !isTransitioning && !overlayState
  const canReturnToEntry = cameraState === 'room' && !isTransitioning && !overlayState
  const canReturn = canReturnToRoom || canReturnToEntry

  return (
    <group>
      <mesh
        position={[0, 1.5, -1.35]}
        onPointerDown={(event) => {
          if (!canReturn) return
          event.stopPropagation()
          if (canReturnToEntry) returnToEntry()
          else returnToRoom()
        }}
        onPointerOver={() => {
          document.body.style.cursor = canReturn ? 'pointer' : 'default'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[6.5, 3.6]} />
        <meshStandardMaterial color={palette.wallRoom} roughness={0.98} metalness={0} />
      </mesh>
      <SoftBox
        args={[6.4, 0.12, 0.05]}
        radius={0.02}
        position={[0, 0.06, -1.32]}
        color={palette.trim}
        roughness={0.95}
        castShadow={false}
      />
      <mesh position={[-3.15, 1.5, -0.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.4, 3.6]} />
        <meshStandardMaterial color={palette.wallRoom} roughness={0.98} metalness={0} />
      </mesh>
      <mesh position={[3.15, 1.5, -0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.4, 3.6]} />
        <meshStandardMaterial color={palette.wallRoom} roughness={0.98} metalness={0} />
      </mesh>
    </group>
  )
}

export function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 8]} />
      <meshStandardMaterial color={palette.floorBoard} roughness={0.96} metalness={0} />
    </mesh>
  )
}
