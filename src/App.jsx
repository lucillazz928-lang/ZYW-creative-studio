import { Canvas, useFrame } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { CameraController } from './components/Scene/CameraController'
import { Environment } from './components/Scene/Environment'
import { Door } from './components/Scene/Door'
import { EntryScene } from './scenes/EntryScene'
import { RoomScene } from './scenes/RoomScene'
import { LoadingScreen } from './ui/LoadingScreen'
import { Tooltip } from './ui/Tooltip'
import { EntryTitle } from './ui/EntryTitle'
import { EntryEnterHint } from './ui/EntryEnterHint'
import { RoomDeskHint } from './ui/RoomDeskHint'
import { DeskExploreHint } from './ui/DeskExploreHint'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { UnsupportedScreen } from './ui/UnsupportedScreen'
import { InteractionProvider, useInteraction } from './state/interactionState'
import { detectWebGL } from './utils/detectWebGL'
import { interactiveObjects } from './content/interactiveObjects'

const OverlayShell = lazy(() =>
  import('./ui/OverlayShell').then((mod) => ({ default: mod.OverlayShell })),
)

/**
 * 加载页期间同时挂好店面+房间；满若干帧再揭开，点门时不再现场建 mesh。
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
 * 店面与房间始终挂载，只切 visible。
 */
function SceneRoot() {
  const { currentScene, isLoaded, setIsLoaded, setLoadProgress } = useInteraction()

  return (
    <>
      <Environment />
      <CameraController />
      <group visible={currentScene === 'entry'}>
        <EntryScene />
      </group>
      <group visible={currentScene === 'room'}>
        <Door />
        <RoomScene />
      </group>
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
  const [splashDone, setSplashDone] = useState(false)

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
        {!splashDone || !isLoaded ? (
          <LoadingScreen assetsReady={isLoaded} onFinished={() => setSplashDone(true)} />
        ) : null}
        {isLoaded && cameraState === 'entry' && !isTransitioning ? (
          <>
            <EntryTitle />
            <EntryEnterHint />
          </>
        ) : null}
        {isLoaded && cameraState === 'room' && !isTransitioning && !overlayState ? (
          <RoomDeskHint />
        ) : null}
        {/* desk 引导与 Tooltip 互斥，避免叠在底部打架 */}
        {isLoaded &&
        cameraState === 'desk' &&
        !isTransitioning &&
        !overlayState &&
        !(hovered && !hovered.ambient) ? (
          <DeskExploreHint />
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
