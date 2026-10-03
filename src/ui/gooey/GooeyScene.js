import * as THREE from 'three'
import { silkDuration, silkShader } from './shaders'
import { GooeyTile } from './GooeyTile'

const PERSPECTIVE = 800

export class GooeyScene {
  constructor({
    canvas,
    tileElements,
    scrollElement,
    getScrollProgress,
    shapeUrl,
    reducedMotion = false,
    disableHover = false,
    onSelect,
    shouldIgnoreSelect,
  }) {
    this.canvas = canvas
    this.scrollElement = scrollElement
    this.getScrollProgress =
      getScrollProgress ||
      (() => {
        const el = this.scrollElement
        if (!el) return 0
        const max = el.scrollWidth - el.clientWidth
        if (max <= 0) return 0
        return el.scrollLeft / max
      })
    this.reducedMotion = reducedMotion
    this.disableHover = disableHover
    this.onSelect = onSelect
    this.shouldIgnoreSelect = shouldIgnoreSelect
    this.shapeUrl = shapeUrl
    this.disposed = false
    this.paused = false
    this.raf = 0
    this.activeTile = null

    this.syncSize()

    this.mainScene = new THREE.Scene()
    this.initCamera()
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25))
    this.renderer.setSize(this.W, this.H, false)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.NoToneMapping

    this.tiles = Array.from(tileElements).map((el) => {
      return new GooeyTile({
        el,
        scene: this.mainScene,
        canvas,
        getViewSize: () => ({ w: this.W, h: this.H }),
        duration: silkDuration,
        fragmentShader: silkShader,
        shapeUrl,
        getScrollProgress: () => this.getScrollProgress(),
        onSelect: (tile) => this.handleSelect(tile),
        shouldIgnoreSelect,
        reducedMotion,
        disableHover,
      })
    })

    this._onResize = this.onResize.bind(this)
    window.addEventListener('resize', this._onResize)
    this.ro = new ResizeObserver(() => this.onResize())
    if (canvas.parentElement) this.ro.observe(canvas.parentElement)
    this.update()
  }

  syncSize() {
    const parent = this.canvas?.parentElement
    const rect = parent?.getBoundingClientRect()
    this.W = Math.max(1, Math.round(rect?.width || this.canvas.clientWidth || window.innerWidth))
    this.H = Math.max(1, Math.round(rect?.height || this.canvas.clientHeight || window.innerHeight))
  }

  initCamera() {
    const fov = (180 * (2 * Math.atan(this.H / 2 / PERSPECTIVE))) / Math.PI
    this.camera = new THREE.PerspectiveCamera(fov, this.W / this.H, 1, 10000)
    this.camera.position.set(0, 0, PERSPECTIVE)
  }

  handleSelect(tile) {
    if (this.activeTile && this.activeTile !== tile) {
      this.activeTile.setDetailOpen(false)
      this.activeTile.setHidden(true)
    }
    this.tiles.forEach((t) => {
      if (t !== tile) t.setHidden(true)
    })
    this.activeTile = tile
    tile.setDetailOpen(true)
    tile.setHidden(false)
    this.onSelect?.(tile.$el?.dataset?.workId ?? null)
  }

  closeDetail() {
    // 不依赖 activeTile：即使状态丢失也必须把 tile 从 opacity:0 拉回来
    this.tiles.forEach((t) => {
      t.resetFromDetail()
    })
    this.activeTile = null
  }

  /** 详情全屏时停渲，省 GPU；退回列表再 resume */
  setPaused(paused) {
    this.paused = Boolean(paused)
  }

  onResize() {
    this.syncSize()
    this.camera.aspect = this.W / this.H
    const fov = (180 * (2 * Math.atan(this.H / 2 / PERSPECTIVE))) / Math.PI
    this.camera.fov = fov
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.W, this.H, false)
  }

  update = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.update)
    if (this.paused) return
    this.tiles.forEach((tile) => tile.update())
    this.renderer.render(this.mainScene, this.camera)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this._onResize)
    this.ro?.disconnect()
    // 卸载前恢复 DOM，避免 StrictMode / 热更新后 tile 卡在透明
    this.tiles.forEach((tile) => {
      tile.restoreDom?.()
      tile.dispose()
    })
    this.tiles = []
    this.renderer.dispose()
  }
}
