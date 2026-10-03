import { useRef } from 'react'
import { useInteraction } from '../../state/interactionState'
import { animateObjectHover } from '../../animation/objectAnimations'

export function InteractiveObject({
  objectId,
  overlay,
  position,
  children,
  ambient = false,
  /** 书架等物件用局部抽书动画，关闭整体缩放 */
  scaleOnHover = true,
}) {
  const rootRef = useRef(null)
  const { cameraState, hoverObject, selectObject, enterDesk, isTransitioning, overlayState } =
    useInteraction()

  const canUse =
    !isTransitioning &&
    !overlayState &&
    (cameraState === 'desk' || (cameraState === 'room' && objectId === 'message-wall'))

  return (
    <group
      ref={rootRef}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (!canUse) return
        // 氛围物件不可点，不挂 Tooltip
        if (!ambient) hoverObject(objectId)
        if (scaleOnHover) animateObjectHover(rootRef.current, true)
      }}
      onPointerOut={(event) => {
        if (!ambient) hoverObject(null)
        if (scaleOnHover) animateObjectHover(rootRef.current, false)
      }}
      onPointerDown={(event) => {
        // 拦住射线，避免点穿空白墙（ROOM 误回门口）
        event.stopPropagation()
        if (isTransitioning || overlayState) return
        if (cameraState === 'room') {
          if (objectId === 'message-wall' && overlay) {
            selectObject(objectId, overlay)
            return
          }
          // 桌面物件：先进入 DESK 近景
          enterDesk()
          return
        }
        if (!canUse || ambient || !overlay) return
        selectObject(objectId, overlay)
      }}
    >
      {children}
    </group>
  )
}
