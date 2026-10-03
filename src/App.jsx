import { Canvas, useFrame } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { CameraController } from './components/Scene/CameraController'
import { Environment } from './components/Scene/Environment'
import { EntryScene } from './scenes/EntryScene'
import { LoadingScreen } from './ui/LoadingScreen'
import { Tooltip } from './ui/Tooltip'
import { EntryTitle } from './ui/EntryTitle'
import { EntryEnterHint } from './ui/EntryEnterHint'
import { RoomDeskHint, DeskNearHint } from './ui/RoomDeskHint'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { UnsupportedScreen } from './ui/UnsupportedScreen'
import { InteractionProvider, useInteraction } from './state/interactionState'
import { detectWebGL } from './utils/detectWebGL'
import { interactiveObjects } from './content/interactiveObjects'

const OverlayShell = lazy(() =>
  import('./ui/OverlayShell').then((mod) => ({ default: mod.OverlayShell })),
)
const RoomScene = lazy(() =>
  import('./scenes/RoomScene').then((mod) => ({ default: mod.RoomScene })),
)
const Door = lazy(() =>
  import('./components/Scene/Door').then((mod) => ({ default: mod.Door })),
)

/**
 * 加载页只等店面暖机；室内在门口出现后再后台挂载，加快第一次看见小屋。
 */
function BootWarmup({ onReady }) {
  const frames = useRef(0)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current < 4) return
    done.current = true
    onReady()
  })

  return null
}

/**
 * 店面先挂；房间稍后后台挂上并保持 visible 切换，避免进门白屏。
 */
function SceneRoot() {
  const { currentScene, isLoaded, setIsLoaded, setLoadProgress } = useInteraction()
  const [roomReady, setRoomReady] = useState(false)

  useEffect(() => {
    if (currentScene === 'room') {
      setRoomReady(true)
      return undefined
    }
    if (!isLoaded) return undefined
    const idle = window.setTimeout(() => setRoomReady(true), 280)
    return () => window.clearTimeout(idle)
  }, [currentScene, isLoaded])

  useEffect(() => {
    if (!isLoaded) return undefined
    import('./scenes/RoomScene')
    import('./components/Scene/Door')
    return undefined
  }, [isLoaded])

  return (
    <>
      <Environment />
      <CameraController />
      <group visible={currentScene === 'entry'}>
        <EntryScene />
      </group>
      {roomReady ? (
        <Suspense fallback={null}>
          <group visible={currentScene === 'room'}>
            <Door />
            <RoomScene />
          </group>
        </Suspense>
      ) : null}
      {!isLoaded ? (
        <BootWarmup
          onReady={() => {
            setLoadProgress(100)
            setIsLoaded(true)
          }}
        />
      ) : null}
    </>
  )
}

function AppShell() {
  const {
    isLoaded,
    loadProgress,
    overlayState,
    hoveredObject,
    cameraState,
    isTransitioning,
    setIsLoaded,
    setLoadProgress,
    returnToRoom,
    returnToEntry,
    closeOverlay,
  } = useInteraction()
  const hovered = interactiveObjects.find((item) => item.id === hoveredObject)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (overlayState) {
        closeOverlay()
        return
      }
      if (isTransitioning) return
      if (cameraState === 'desk') {
        returnToRoom()
        return
      }
      if (cameraState === 'room') {
        returnToEntry()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cameraState, closeOverlay, isTransitioning, overlayState, returnToEntry, returnToRoom])

  // Canvas 迟迟未就绪时的兜底
  useEffect(() => {
    if (isLoaded) return undefined
    const timer = window.setTimeout(() => {
      setLoadProgress(100)
      setIsLoaded(true)
    }, 10000)
    return () => window.clearTimeout(timer)
  }, [isLoaded, setIsLoaded, setLoadProgress])

  return (
    <div
      className="app-shell"
      data-camera={cameraState}
      data-overlay={overlayState || ''}
      data-transition={isTransitioning ? 'true' : 'false'}
    >
      <div className="canvas-root">
        <Canvas
          shadows
          frameloop={overlayState && !isTransitioning ? 'never' : 'always'}
          camera={{ position: [3.8, 3.2, 6.2], fov: 32 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          onCreated={() => {
            setLoadProgress(40)
          }}
          onPointerMissed={() => {
            if (overlayState || isTransitioning) return
            if (cameraState === 'desk') returnToRoom()
          }}
        >
          <SceneRoot />
        </Canvas>
      </div>
      <div className="ui-layer">
        {!isLoaded ? <LoadingScreen progress={loadProgress} /> : null}
        {isLoaded && cameraState === 'entry' && !isTransitioning ? (
          <>
            <EntryTitle />
            <EntryEnterHint />
          </>
        ) : null}
        {isLoaded && cameraState === 'room' && !isTransitioning && !overlayState ? (
          <RoomDeskHint />
        ) : null}
        {isLoaded && cameraState === 'desk' && !isTransitioning && !overlayState ? (
          <DeskNearHint />
        ) : null}
        {(cameraState === 'desk' || cameraState === 'room') &&
        !overlayState &&
        hovered &&
        !hovered.ambient ? (
          <Tooltip title={hovered.labelZh} subtitle={`${hovered.labelEn} · Click to Explore`} />
        ) : null}
        {overlayState ? (
          <Suspense fallback={null}>
            <OverlayShell />
          </Suspense>
        ) : null}
      </div>
    </div>
  )
}

export default function App() {
  const hasWebGL = detectWebGL()

  if (!hasWebGL) {
    return <UnsupportedScreen />
  }

  return (
    <ErrorBoundary>
      <InteractionProvider>
        <AppShell />
      </InteractionProvider>
    </ErrorBoundary>
  )
}
