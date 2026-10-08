import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const InteractionContext = createContext(null)

const CAMERA_FLOW = {
  entry: ['room'],
  room: ['desk', 'entry'],
  desk: ['focus', 'room'],
  focus: ['desk'],
}

export function InteractionProvider({ children }) {
  const [currentScene, setCurrentScene] = useState('entry')
  const [cameraState, setCameraState] = useState('entry')
  const [hoveredObject, setHoveredObject] = useState(null)
  const [activeObject, setActiveObject] = useState(null)
  const [overlayState, setOverlayState] = useState(null)
  /** 首屏从斜视角推进正面时先锁交互，动画结束后再解锁 */
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const lastFocusRef = useRef(null)
  const pendingDoorCloseRef = useRef(false)

  const canTransitionTo = useCallback(
    (nextCameraState) => {
      if (isTransitioning) return false
      if (overlayState) return false
      return CAMERA_FLOW[cameraState]?.includes(nextCameraState) ?? false
    },
    [cameraState, isTransitioning, overlayState],
  )

  const beginTransition = useCallback(
    (nextCameraState) => {
      if (isTransitioning) return false
      setIsTransitioning(true)
      setCameraState(nextCameraState)
      if (nextCameraState === 'room') setCurrentScene('room')
      if (nextCameraState === 'entry') setCurrentScene('entry')
      return true
    },
    [isTransitioning],
  )

  const endTransition = useCallback(() => {
    setIsTransitioning(false)
  }, [])

  const openDoor = useCallback(() => {
    if (!canTransitionTo('room')) return false
    return beginTransition('room')
  }, [beginTransition, canTransitionTo])

  const enterDesk = useCallback(() => {
    if (!canTransitionTo('desk')) return false
    return beginTransition('desk')
  }, [beginTransition, canTransitionTo])

  const returnToRoom = useCallback(() => {
    if (!canTransitionTo('room')) return false
    setHoveredObject(null)
    setActiveObject(null)
    return beginTransition('room')
  }, [beginTransition, canTransitionTo])

  const returnToEntry = useCallback(() => {
    if (!canTransitionTo('entry')) return false
    setHoveredObject(null)
    setActiveObject(null)
    pendingDoorCloseRef.current = true
    return beginTransition('entry')
  }, [beginTransition, canTransitionTo])

  const shouldCloseDoor = useCallback(() => pendingDoorCloseRef.current, [])

  const clearPendingDoorClose = useCallback(() => {
    pendingDoorCloseRef.current = false
  }, [])

  const returnCameraRef = useRef('desk')

  const hoverObject = useCallback(
    (objectId) => {
      if (!objectId) {
        setHoveredObject((prev) => (prev == null ? prev : null))
        return
      }
      if (isTransitioning || overlayState) return
      if (cameraState !== 'desk' && !(cameraState === 'room' && objectId === 'message-wall')) return
      setHoveredObject((prev) => (prev === objectId ? prev : objectId))
    },
    [cameraState, isTransitioning, overlayState],
  )

  const selectObject = useCallback(
    (objectId, overlayId) => {
      if (isTransitioning || overlayState) return false
      const fromDesk = cameraState === 'desk' || cameraState === 'focus'
      const fromRoomWall = cameraState === 'room' && objectId === 'message-wall'
      if (!fromDesk && !fromRoomWall) return false

      returnCameraRef.current = cameraState === 'room' ? 'room' : 'desk'
      setActiveObject(objectId)
      lastFocusRef.current = objectId
      if (overlayId) {
        // 与原来一致：先/同步显示 Overlay，桌面物件同时推近 focus
        setOverlayState(overlayId)
        if (fromDesk && cameraState !== 'focus') {
          setIsTransitioning(true)
          setCameraState('focus')
        }
      }
      return true
    },
    [cameraState, isTransitioning, overlayState],
  )

  /** 顶栏快捷入口：房间 / 桌面均可直接打开对应 Overlay */
  const openDeskEntry = useCallback(
    (objectId, overlayId) => {
      if (isTransitioning || overlayState || !overlayId) return false
      if (cameraState !== 'room' && cameraState !== 'desk' && cameraState !== 'focus') return false

      returnCameraRef.current = cameraState === 'room' ? 'room' : 'desk'
      setActiveObject(objectId)
      lastFocusRef.current = objectId
      setOverlayState(overlayId)
      if (cameraState === 'desk') {
        setIsTransitioning(true)
        setCameraState('focus')
      }
      return true
    },
    [cameraState, isTransitioning, overlayState],
  )

  const closeOverlay = useCallback(() => {
    setOverlayState(null)
    setActiveObject(null)
    setHoveredObject(null)
    setCameraState(returnCameraRef.current === 'room' ? 'room' : 'desk')
  }, [])

  // DEV：?preview=works / ?preview=wall 直接打开对应 Overlay，便于验收
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined
    const params = new URLSearchParams(window.location.search)
    const preview = params.get('preview')
    if (preview !== 'works' && preview !== 'wall') return undefined
    setIsTransitioning(false)
    setCameraState('desk')
    setCurrentScene('room')
    setOverlayState(preview === 'wall' ? 'message-wall' : 'creative-process')
    setIsLoaded(true)
    setLoadProgress(100)
    return undefined
  }, [])

  const value = useMemo(
    () => ({
      currentScene,
      cameraState,
      hoveredObject,
      activeObject,
      overlayState,
      isTransitioning,
      loadProgress,
      isLoaded,
      setLoadProgress,
      setIsLoaded,
      canTransitionTo,
      beginTransition,
      endTransition,
      openDoor,
      enterDesk,
      returnToRoom,
      returnToEntry,
      shouldCloseDoor,
      clearPendingDoorClose,
      hoverObject,
      selectObject,
      openDeskEntry,
      closeOverlay,
    }),
    [
      currentScene,
      cameraState,
      hoveredObject,
      activeObject,
      overlayState,
      isTransitioning,
      loadProgress,
      isLoaded,
      canTransitionTo,
      beginTransition,
      endTransition,
      openDoor,
      enterDesk,
      returnToRoom,
      returnToEntry,
      shouldCloseDoor,
      clearPendingDoorClose,
      hoverObject,
      selectObject,
      openDeskEntry,
      closeOverlay,
    ],
  )

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>
}

export function useInteraction() {
  const context = useContext(InteractionContext)
  if (!context) {
    throw new Error('useInteraction must be used within InteractionProvider')
  }
  return context
}
