import { useRef } from 'react'
import { useInteraction } from '../../state/interactionState'
import { animateObjectHover } from '../../animation/objectAnimations'

function pointerStillInside(event, root) {
  if (!root || !event.intersections?.length) return false
  return event.intersections.some((hit) => {
    let node = hit.object
    while (node) {
      if (node === root) return true
      node = node.parent
    }
    return false
  })
}

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
  const hoveringRef = useRef(false)
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
        // 在同一物件的子网格之间移动时不要重播缩放，否则悬停会抖
        if (hoveringRef.current) return
        hoveringRef.current = true
        // 氛围物件不可点，不挂 Tooltip
        if (!ambient) hoverObject(objectId)
        if (scaleOnHover) animateObjectHover(rootRef.current, true)
      }}
      onPointerOut={(event) => {
        if (pointerStillInside(event, rootRef.current)) return
        if (!hoveringRef.current) return
        hoveringRef.current = false
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
