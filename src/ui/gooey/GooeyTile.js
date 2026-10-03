import * as THREE from 'three'
import gsap from 'gsap'
import { getCoverRatio, vertexShader } from './shaders'

export class GooeyTile {
  constructor({
    el,
    scene,
    canvas,
    getViewSize,
    duration = 0.5,
    fragmentShader,
    shapeUrl,
    getScrollProgress,
    onSelect,
    shouldIgnoreSelect,
    reducedMotion = false,
    disableHover = false,
  }) {
    this.scene = scene
    this.canvas = canvas
    this.getViewSize = getViewSize
    this.$el = el
    this.$link = el.querySelector('.works-tile__hit')
    this.$img = el.querySelector('.works-tile__img')
    this.duration = duration
    this.fragmentShader = fragmentShader
    this.shapeUrl = shapeUrl
    this.getScrollProgress = getScrollProgress
    this.onSelect = onSelect
    this.shouldIgnoreSelect = shouldIgnoreSelect
    this.reducedMotion = reducedMotion
    this.disableHover = disableHover

    this.sizes = new THREE.Vector2(0, 0)
    this.offset = new THREE.Vector2(0, 0)
    this.mouse = new THREE.Vector2(0, 0)
    this.clock = new THREE.Clock()
    this.images = []
    this.scroll = 0
    this.prevScroll = 0
    this.delta = 0
    this.isHovering = false
    this.pendingHover = false
    this.detailOpen = false
    this.disposed = false

    this.loader = new THREE.TextureLoader()
    this._onMouseMove = this.onMouseMove.bind(this)
    this._onEnter = this.onPointerEnter.bind(this)
    this._onLeave = this.onPointerLeave.bind(this)
    this._onClick = this.onClick.bind(this)

    this.bindEvents()
    this.preload()
  }

  bindEvents() {
    window.addEventListener('mousemove', this._onMouseMove)
    this.$link?.addEventListener('mouseenter', this._onEnter)
    this.$link?.addEventListener('mouseleave', this._onLeave)
    this.$link?.addEventListener('click', this._onClick)
  }

  preload() {
    const cover = this.$img?.src
    const hover = this.$img?.dataset?.hover
    if (!cover || !hover) return

    const urls = [cover, hover, this.shapeUrl]
    let loaded = 0
    urls.forEach((url, index) => {
      this.loader.load(
        url,
        (texture) => {
          if (this.disposed) {
            texture.dispose()
            return
          }
          texture.colorSpace = THREE.SRGBColorSpace
          texture.center.set(0.5, 0.5)
          this.images[index] = texture
          loaded += 1
          if (loaded === urls.length) this.initMesh()
        },
        undefined,
        () => {
          loaded += 1
          if (loaded === urls.length && this.images[0] && this.images[1]) this.initMesh()
        },
      )
    })
  }

  initMesh() {
    if (this.disposed || !this.images[0] || !this.images[1]) return

    this.getBounds()
    const texture = this.images[0]
    const hoverTexture = this.images[1]
    const shapeTexture = this.images[2] ?? texture
    const view = this.getViewSize()

    this.uniforms = {
      u_alpha: { value: 0 },
      u_map: { value: texture },
      u_ratio: { value: getCoverRatio(this.sizes, texture.image) },
      u_hovermap: { value: hoverTexture },
      u_hoverratio: { value: getCoverRatio(this.sizes, hoverTexture.image) },
      u_shape: { value: shapeTexture },
      u_mouse: { value: this.mouse },
      u_progressHover: { value: 0 },
      u_progressClick: { value: 0 },
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(view.w, view.h) },
    }

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader: this.fragmentShader,
      transparent: true,
      defines: {
        PI: Math.PI,
        PR: window.devicePixelRatio.toFixed(1),
      },
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(this.offset.x, this.offset.y, 0)
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)
    this.scene.add(this.mesh)
    this.$img?.classList.add('is-ready')

    if (this.pendingHover) {
      this.pendingHover = false
      this.onPointerEnter()
    }
  }

  onClick(event) {
    event.preventDefault()
    if (!this.mesh || this.detailOpen) return
    if (this.shouldIgnoreSelect?.()) return
    this.onSelect?.(this)
  }

  showGooey(show) {
    if (!this.mesh || !this.$img) return
    gsap.killTweensOf(this.$img)
    gsap.to(this.uniforms.u_alpha, {
      value: show ? 1 : 0,
      duration: this.duration,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
    gsap.to(this.$img, {
      opacity: show ? 0 : 1,
      duration: this.duration * 0.85,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
  }

  onPointerEnter() {
    this.isHovering = true
    if (this.disableHover || this.reducedMotion || this.detailOpen) return
    if (!this.mesh) {
      this.pendingHover = true
      return
    }
    this.showGooey(true)
    gsap.to(this.uniforms.u_progressHover, {
      value: 1,
      duration: this.duration,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
  }

  onPointerLeave() {
    this.pendingHover = false
    if (this.disableHover || this.reducedMotion || this.detailOpen || !this.mesh) {
      this.isHovering = false
      return
    }
    gsap.to(this.uniforms.u_progressHover, {
      value: 0,
      duration: this.duration,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onComplete: () => {
        this.isHovering = false
      },
    })
    this.showGooey(false)
  }

  onMouseMove(event) {
    if (this.disableHover || this.reducedMotion || this.detailOpen) return
    const rect = this.canvas?.getBoundingClientRect()
    const x = rect ? event.clientX - rect.left : event.clientX
    const y = rect ? event.clientY - rect.top : event.clientY
    gsap.to(this.mouse, {
      x,
      y,
      duration: 0.5,
      overwrite: 'auto',
    })
  }

  setDetailOpen(open) {
    this.detailOpen = open
    if (!open) {
      // 详情盖住视口时 mouseleave 常丢，关闭后必须清 hover，否则丝绸/封面卡在透明
      this.isHovering = false
      this.pendingHover = false
    }
    if (!this.mesh) {
      if (!open) this.restoreDom()
      return
    }
    gsap.to(this.uniforms.u_progressClick, {
      value: open ? 1 : 0,
      duration: 0.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
    if (open) {
      this.showGooey(true)
      gsap.to(this.uniforms.u_progressHover, {
        value: 1,
        duration: this.duration,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    } else {
      gsap.to(this.uniforms.u_progressHover, {
        value: 0,
        duration: this.duration,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
      this.showGooey(false)
    }
  }

  /** 强制恢复 DOM / 封面可见性（不依赖 mesh 是否已建好） */
  restoreDom() {
    if (this.$el) {
      this.$el.style.opacity = ''
      this.$el.style.pointerEvents = ''
    }
    if (this.$img) {
      gsap.killTweensOf(this.$img)
      gsap.set(this.$img, { opacity: 1 })
    }
  }

  setHidden(hidden) {
    // DOM 显隐必须始终执行：mesh 未就绪时若跳过，关闭详情后 tile 会永久 opacity:0
    if (this.$el) {
      this.$el.style.opacity = hidden ? '0' : ''
      this.$el.style.pointerEvents = hidden ? 'none' : ''
    }

    if (!this.mesh) {
      if (!hidden) this.restoreDom()
      return
    }

    const visibleGooey = !hidden && (this.detailOpen || this.isHovering)
    gsap.to(this.uniforms.u_alpha, {
      value: visibleGooey ? 1 : 0,
      duration: 0.35,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
    if (!hidden && !visibleGooey) this.restoreDom()
  }

  /** 从详情退回列表：清状态 + 恢复可见 */
  resetFromDetail() {
    this.detailOpen = false
    this.isHovering = false
    this.pendingHover = false
    this.restoreDom()
    if (!this.mesh) return
    gsap.killTweensOf(this.uniforms.u_progressHover)
    gsap.killTweensOf(this.uniforms.u_progressClick)
    gsap.killTweensOf(this.uniforms.u_alpha)
    this.uniforms.u_progressHover.value = 0
    this.uniforms.u_progressClick.value = 0
    this.uniforms.u_alpha.value = 0
  }

  getBounds() {
    if (!this.$img || !this.canvas) return
    const img = this.$img.getBoundingClientRect()
    const view = this.canvas.getBoundingClientRect()
    const { w, h } = this.getViewSize()
    const width = img.width
    const height = img.height
    this.sizes.set(width, height)
    // 相对画布坐标系（画布 absolute 铺满 gallery，不再用 window）
    this.offset.set(
      img.left - view.left - w / 2 + width / 2,
      -(img.top - view.top) + h / 2 - height / 2,
    )
  }

  update() {
    if (!this.mesh || this.disposed) return

    this.getBounds()
    this.mesh.position.x = this.offset.x
    this.mesh.position.y = this.offset.y
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)

    const { w, h } = this.getViewSize()
    this.uniforms.u_res.value.set(w, h)
    if (this.images[0]?.image) {
      this.uniforms.u_ratio.value.copy(getCoverRatio(this.sizes, this.images[0].image))
    }
    if (this.images[1]?.image) {
      this.uniforms.u_hoverratio.value.copy(getCoverRatio(this.sizes, this.images[1].image))
    }

    if (this.isHovering || this.detailOpen) {
      this.uniforms.u_time.value += this.clock.getDelta()
    }
  }

  dispose() {
    this.disposed = true
    window.removeEventListener('mousemove', this._onMouseMove)
    this.$link?.removeEventListener('mouseenter', this._onEnter)
    this.$link?.removeEventListener('mouseleave', this._onLeave)
    this.$link?.removeEventListener('click', this._onClick)

    if (this.uniforms) {
      gsap.killTweensOf(this.uniforms.u_progressHover)
      gsap.killTweensOf(this.uniforms.u_progressClick)
      gsap.killTweensOf(this.uniforms.u_alpha)
    }
    if (this.$img) gsap.killTweensOf(this.$img)
    gsap.killTweensOf(this.mouse)

    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.geometry?.dispose()
      this.material?.dispose()
    }
    this.images.forEach((tex) => tex?.dispose())
    this.images = []
  }
}
