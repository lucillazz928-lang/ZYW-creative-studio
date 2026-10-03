import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { CameraController } from './components/Scene/CameraController'
import { Environment } from './components/Scene/Environment'
import { Door } from './components/Scene/Door'
import { EntryScene } from './scenes/EntryScene'
import { RoomScene } from './scenes/RoomScene'
import { OverlayShell } from './ui/OverlayShell'
import { LoadingScreen } from './ui/LoadingScreen'
import { Tooltip } from './ui/Tooltip'
import { EntryTitle } from './ui/EntryTitle'
import { EntryEnterHint } from './ui/EntryEnterHint'
import { RoomDeskHint } from './ui/RoomDeskHint'
import { ErrorBoundary } from './ui/ErrorBoundary'
import { UnsupportedScreen } from './ui/UnsupportedScreen'
import { InteractionProvider, useInteraction } from './state/interactionState'
import { detectWebGL } from './utils/detectWebGL'
import { interactiveObjects } from './content/interactiveObjects'

/**
 * 加载页期间同时挂好店面+房间；满若干帧再揭开，点门时不再现场建 mesh（白屏元凶）。
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
 * 点门 = 显隐切换 + 室内推镜，不再延迟切景、不再闪店面。
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
        {(cameraState === 'desk' || cameraState === 'room') &&
        !overlayState &&
        hovered &&
        !hovered.ambient ? (
          <Tooltip title={hovered.labelZh} subtitle={`${hovered.labelEn} · Click to Explore`} />
        ) : null}
        {overlayState ? <OverlayShell /> : null}
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
