import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { photoDriftItems, worksGhostTitle, worksItems, WORKS_SHAPE_URL } from '../content/works'
import DriftWall from './DriftWall'
import { AiWorksReel } from './AiWorksReel'
import { ExpandingBarMenus } from './ExpandingBarMenus'
import { PosterStackEntrance } from './PosterStackEntrance'
import { ProposalBookGallery } from './ProposalBookGallery'
import { GooeyScene } from './gooey/GooeyScene'
import { createSmoothTrack } from './gooey/smoothTrack'
import './WorksGallery.css'

const DRAG_THRESHOLD = 6
/** Codrops Stage.js: title drifts left with scroll progress */
const GHOST_PARALLAX = 120

function useWorksMediaFlags() {
  const [flags, setFlags] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, reducedMotion: false }
    }
    return {
      // 只用窄屏判断手机降级；勿用 pointer:coarse（触控笔记本主指针常为 coarse，会误关丝绸悬停）
      isMobile: window.matchMedia('(max-width: 768px)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })

  useEffect(() => {
    const mobileMq = window.matchMedia('(max-width: 768px)')
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setFlags({
        isMobile: mobileMq.matches,
        reducedMotion: motionMq.matches,
      })
    }
    sync()
    mobileMq.addEventListener('change', sync)
    motionMq.addEventListener('change', sync)
    return () => {
      mobileMq.removeEventListener('change', sync)
      motionMq.removeEventListener('change', sync)
    }
  }, [])

  return flags
}

export function WorksGallery() {
  const rootRef = useRef(null)
  const viewportRef = useRef(null)
  const listRef = useRef(null)
  const ghostRef = useRef(null)
  const canvasRef = useRef(null)
  const trackRef = useRef(null)
  const thumbRef = useRef(null)
  const sceneRef = useRef(null)
  const smoothRef = useRef(null)
  const ignoreSelectRef = useRef(false)
  const dragRef = useRef({
    active: false,
    moved: false,
    capturing: false,
    startX: 0,
    originX: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    pointerId: null,
  })
  const scrubRef = useRef({
    active: false,
    pointerId: null,
  })
  const { isMobile, reducedMotion } = useWorksMediaFlags()
  const [activeId, setActiveId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const enableGooey = !isMobile && !reducedMotion

  const activeWork = worksItems.find((item) => item.id === activeId) ?? null
  const isPhotoDetail = activeWork?.id === 'photo'
  const isVideoDetail = activeWork?.id === 'video'
  const isGraphicDetail = activeWork?.id === 'graphic'
  const isProposalDetail = activeWork?.id === 'proposal'
  const isAiDetail = activeWork?.id === 'ai'
  const scrollLocked = Boolean(activeWork)

  const restoreGalleryDom = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    root.querySelectorAll('.works-tile').forEach((el) => {
      el.style.opacity = ''
      el.style.pointerEvents = ''
    })
    root.querySelectorAll('.works-tile__img').forEach((img) => {
      gsap.killTweensOf(img)
      gsap.set(img, { opacity: 1 })
    })
  }, [])

  const closeDetail = useCallback(() => {
    sceneRef.current?.closeDetail()
    sceneRef.current?.setPaused(false)
    restoreGalleryDom()
    setActiveId(null)
    // 详情期间 viewport 曾 visibility:hidden，退回后重测滑动与丝绸位置
    requestAnimationFrame(() => {
      smoothRef.current?.measure()
      sceneRef.current?.onResize?.()
    })
  }, [restoreGalleryDom])

  const shouldIgnoreSelect = useCallback(() => ignoreSelectRef.current, [])

  const syncProgress = useCallback(
    (ratio = 0) => {
      const thumb = thumbRef.current
      const track = trackRef.current
      if (thumb && track) {
        const travel = Math.max(0, track.clientWidth - thumb.offsetWidth)
        thumb.style.transform = `translateX(${ratio * travel}px)`
      }

      const ghost = ghostRef.current
      if (!ghost) return
      const x = -ratio * GHOST_PARALLAX
      if (reducedMotion) {
        gsap.set(ghost, { x, force3D: true })
      } else {
        gsap.to(ghost, { x, duration: 0.3, ease: 'power2.out', overwrite: 'auto', force3D: true })
      }
    },
    [reducedMotion],
  )

  // Smooth track engine
  useEffect(() => {
    const viewport = viewportRef.current
    const list = listRef.current
    if (!viewport || !list) return undefined

    const smooth = createSmoothTrack({
      viewport,
      track: list,
      reducedMotion,
      onUpdate: (progress) => syncProgress(progress),
    })
    smoothRef.current = smooth

    // Remeasure after images / fonts settle
    const ro = new ResizeObserver(() => smooth.measure())
    ro.observe(viewport)
    ro.observe(list)
    const t1 = window.setTimeout(() => smooth.measure(), 100)
    const t2 = window.setTimeout(() => smooth.measure(), 400)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      ro.disconnect()
      smooth.dispose()
      smoothRef.current = null
      if (ghostRef.current) gsap.killTweensOf(ghostRef.current)
    }
  }, [reducedMotion, syncProgress])

  // Wheel → continuous horizontal
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const onWheel = (event) => {
      if (scrollLocked) return
      if (!root.contains(event.target)) return
      const smooth = smoothRef.current
      if (!smooth) return

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (delta === 0) return

      event.preventDefault()
      smooth.addWheel(delta)
    }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', onWheel, true)
  }, [scrollLocked])

  // Drag with momentum
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined

    const resetDrag = () => {
      dragRef.current = {
        active: false,
        moved: false,
        capturing: false,
        startX: 0,
        originX: 0,
        lastX: 0,
        lastT: 0,
        velocity: 0,
        pointerId: null,
      }
      setIsDragging(false)
    }

    const onPointerDown = (event) => {
      if (scrollLocked) return
      if (event.pointerType === 'mouse' && event.button !== 0) return
      if (event.target.closest?.('.works-gallery__scrub')) return
      const smooth = smoothRef.current
      if (!smooth) return

      ignoreSelectRef.current = false
      const now = performance.now()
      dragRef.current = {
        active: true,
        moved: false,
        capturing: false,
        startX: event.clientX,
        originX: smooth.getX(),
        lastX: event.clientX,
        lastT: now,
        velocity: 0,
        pointerId: event.pointerId,
      }
      smooth.startDrag()
    }

    const onPointerMove = (event) => {
      const drag = dragRef.current
      const smooth = smoothRef.current
      if (!drag.active || !smooth || drag.pointerId !== event.pointerId) return

      const dx = event.clientX - drag.startX
      if (!drag.moved && Math.abs(dx) >= DRAG_THRESHOLD) {
        drag.moved = true
        ignoreSelectRef.current = true
        setIsDragging(true)
        if (!drag.capturing) {
          drag.capturing = true
          try {
            viewport.setPointerCapture(event.pointerId)
          } catch {
            /* ignore */
          }
        }
      }
      if (!drag.moved) return

      event.preventDefault()
      const now = performance.now()
      const dt = Math.max(8, now - drag.lastT)
      const instant = ((event.clientX - drag.lastX) / dt) * 16.67
      drag.velocity = drag.velocity * 0.7 + instant * 0.3
      drag.lastX = event.clientX
      drag.lastT = now
      smooth.dragTo(drag.originX + dx)
    }

    const onPointerUp = (event) => {
      const drag = dragRef.current
      const smooth = smoothRef.current
      if (!drag.active || drag.pointerId !== event.pointerId) return

      if (drag.capturing) {
        try {
          viewport.releasePointerCapture(event.pointerId)
        } catch {
          /* ignore */
        }
      }

      if (drag.moved) {
        ignoreSelectRef.current = true
        window.setTimeout(() => {
          ignoreSelectRef.current = false
        }, 100)
        smooth?.endDrag(drag.velocity)
      } else {
        smooth?.endDrag(0)
      }

      resetDrag()
    }

    viewport.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [scrollLocked])

  // Scrubber
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const ratioFromClientX = (clientX) => {
      const rect = track.getBoundingClientRect()
      const thumb = thumbRef.current
      const thumbWidth = thumb?.offsetWidth ?? 28
      const usable = Math.max(1, rect.width - thumbWidth)
      const x = clientX - rect.left - thumbWidth / 2
      return Math.max(0, Math.min(1, x / usable))
    }

    const onPointerDown = (event) => {
      if (scrollLocked) return
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()

      ignoreSelectRef.current = true
      scrubRef.current = { active: true, pointerId: event.pointerId }
      setIsScrubbing(true)
      smoothRef.current?.setProgress(ratioFromClientX(event.clientX))
      try {
        track.setPointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }

    const onPointerMove = (event) => {
      const scrub = scrubRef.current
      if (!scrub.active || scrub.pointerId !== event.pointerId) return
      event.preventDefault()
      smoothRef.current?.setProgress(ratioFromClientX(event.clientX))
    }

    const endScrub = (event) => {
      const scrub = scrubRef.current
      if (!scrub.active || (event && scrub.pointerId !== event.pointerId)) return
      scrubRef.current = { active: false, pointerId: null }
      setIsScrubbing(false)
      window.setTimeout(() => {
        ignoreSelectRef.current = false
      }, 100)
      try {
        if (event) track.releasePointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }

    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup', endScrub)
    track.addEventListener('pointercancel', endScrub)
    return () => {
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', endScrub)
      track.removeEventListener('pointercancel', endScrub)
    }
  }, [scrollLocked])

  useEffect(() => {
    if (!enableGooey) {
      sceneRef.current?.dispose()
      sceneRef.current = null
      return undefined
    }

    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return undefined

    let cancelled = false
    let measureTimer = 0
    // 先让 Overlay / 列表上屏，再开第二套 WebGL，减轻「点作品瞬间卡死」
    const startTimer = window.setTimeout(() => {
      if (cancelled) return
      const tiles = root.querySelectorAll('.works-tile')
      const scene = new GooeyScene({
        canvas,
        tileElements: tiles,
        scrollElement: null,
        getScrollProgress: () => smoothRef.current?.getProgress() ?? 0,
        shapeUrl: WORKS_SHAPE_URL,
        reducedMotion: false,
        disableHover: false,
        onSelect: (id) => setActiveId(id),
        shouldIgnoreSelect,
      })
      if (cancelled) {
        scene.dispose()
        return
      }
      sceneRef.current = scene
      measureTimer = window.setTimeout(() => smoothRef.current?.measure(), 300)
    }, 120)

    return () => {
      cancelled = true
      window.clearTimeout(startTimer)
      window.clearTimeout(measureTimer)
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [enableGooey, shouldIgnoreSelect])

  // 进入全屏详情时暂停丝绸 WebGL；退出由 closeDetail 恢复
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return undefined
    const pause =
      isPhotoDetail || isVideoDetail || isGraphicDetail || isProposalDetail || isAiDetail
    scene.setPaused(pause)
    return undefined
  }, [isPhotoDetail, isVideoDetail, isGraphicDetail, isProposalDetail, isAiDetail])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape' || !activeId) return
      // 视频详情内正在展开竖条时，交给 ExpandingBarMenus 先收起
      if (document.querySelector('.expand-bars--open')) return
      event.preventDefault()
      event.stopImmediatePropagation()
      closeDetail()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [activeId, closeDetail])

  const onTileClick = (event, id) => {
    event.preventDefault()
    if (enableGooey) return
    if (ignoreSelectRef.current) return
    setActiveId(id)
  }

  return (
    <div
      ref={rootRef}
      className={`works-gallery${activeWork ? ' works-gallery--detail' : ''}${isPhotoDetail ? ' works-gallery--photo' : ''}${isVideoDetail ? ' works-gallery--video' : ''}${isGraphicDetail ? ' works-gallery--graphic' : ''}${isProposalDetail ? ' works-gallery--proposal' : ''}${isAiDetail ? ' works-gallery--ai' : ''}${enableGooey ? ' works-gallery--gooey' : ''}${isDragging ? ' works-gallery--dragging' : ''}${isScrubbing ? ' works-gallery--scrubbing' : ''}`}
      aria-label="个人作品相册"
    >
      <p ref={ghostRef} className="works-gallery__ghost" aria-hidden="true">
        {worksGhostTitle}
      </p>

      {enableGooey ? (
        <canvas ref={canvasRef} className="works-gallery__canvas" aria-hidden="true" />
      ) : null}

      <div
        ref={viewportRef}
        className="works-gallery__viewport"
        tabIndex={0}
        role="region"
        aria-label="横向滑动浏览作品"
      >
        <ul ref={listRef} className="works-gallery__list">
          {worksItems.map((item, index) => (
            <li
              key={item.id}
              className={`works-tile works-tile--${(index % 2) + 1}`}
              data-work-id={item.id}
              style={{ '--works-accent': item.accent }}
            >
              <a
                className="works-tile__hit"
                href={`#${item.id}`}
                onClick={(event) => onTileClick(event, item.id)}
                draggable={false}
              >
                <div className="works-tile__media">
                  <img
                    className="works-tile__img"
                    src={item.cover}
                    data-hover={item.hover}
                    alt=""
                    draggable={false}
                    onLoad={() => smoothRef.current?.measure()}
                  />
                </div>
                <div className="works-tile__meta">
                  <p className="works-tile__en">{item.titleEn}</p>
                  <h3 className="works-tile__title">{item.titleZh}</h3>
                  <span className="works-tile__cta">{item.cta}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div
        ref={trackRef}
        className="works-gallery__scrub"
        role="slider"
        aria-label="作品预览滑轨"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-orientation="horizontal"
        aria-disabled={scrollLocked ? 'true' : 'false'}
      >
        <span className="works-gallery__scrub-track" aria-hidden="true" />
        <span ref={thumbRef} className="works-gallery__scrub-thumb" aria-hidden="true" />
      </div>

      {activeWork && isPhotoDetail ? (
        <div className="works-photo-detail" aria-live="polite">
          <button type="button" className="works-photo-detail__back" onClick={closeDetail}>
            ← BACK TO GALLERY
          </button>
          <div className="works-photo-detail__wall">
            <DriftWall
              className="drift-wall--light"
              items={photoDriftItems}
              columns={5}
              visibleColumns={4.12}
              tileWidth={300}
              tileHeight={200}
              gap={20}
              radius={18}
              tilt={14}
              turn={-12}
              perspective={1400}
              depth={90}
              speed={38}
              direction="up"
              variance={0.4}
              parallax={0.45}
              lift={56}
              fade={0.72}
              dim={0.72}
              overlayColor="transparent"
            />
          </div>
        </div>
      ) : null}

      {activeWork && isVideoDetail ? <ExpandingBarMenus onClose={closeDetail} /> : null}

      {activeWork && isGraphicDetail ? <PosterStackEntrance onClose={closeDetail} /> : null}

      {activeWork && isProposalDetail ? <ProposalBookGallery onClose={closeDetail} /> : null}

      {activeWork && isAiDetail ? <AiWorksReel onClose={closeDetail} /> : null}

      {activeWork &&
      !isPhotoDetail &&
      !isVideoDetail &&
      !isGraphicDetail &&
      !isProposalDetail &&
      !isAiDetail ? (
        <aside className="works-detail" aria-live="polite">
          <p className="works-detail__en">{activeWork.titleEn}</p>
          <h3 className="works-detail__title">{activeWork.titleZh}</h3>
          <p className="works-detail__body">{activeWork.detail}</p>
          <button type="button" className="works-detail__back" onClick={closeDetail}>
            返回列表
          </button>
        </aside>
      ) : null}
    </div>
  )
}
