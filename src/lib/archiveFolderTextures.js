import * as THREE from 'three'

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return { canvas, ctx: canvas.getContext('2d') }
}

function toMap(canvas) {
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  map.needsUpdate = true
  return map
}

function fillSpeckled(ctx, w, h, base = '#d2d2ca') {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const a = 0.04 + Math.random() * 0.12
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(60,55,48,${a})` : `rgba(255,255,250,${a * 0.8})`
    ctx.fillRect(x, y, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5)
  }
}

function drawStar(ctx, x, y, size) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? size : size * 0.35
    const px = Math.cos(a) * r
    const py = Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawMiniPhoto(ctx, x, y, size, kind) {
  ctx.fillStyle = '#eceae6'
  ctx.fillRect(x, y, size, size)
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1)

  if (kind === 'vase') {
    ctx.fillStyle = '#f4f4f2'
    ctx.beginPath()
    ctx.ellipse(x + size * 0.5, y + size * 0.58, size * 0.22, size * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#e8e8e4'
    ctx.fillRect(x + size * 0.42, y + size * 0.22, size * 0.16, size * 0.28)
  } else if (kind === 'chili') {
    ctx.fillStyle = '#c62828'
    ctx.beginPath()
    ctx.ellipse(x + size * 0.5, y + size * 0.55, size * 0.12, size * 0.28, 0.35, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#2e7d32'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + size * 0.55, y + size * 0.28)
    ctx.quadraticCurveTo(x + size * 0.62, y + size * 0.18, x + size * 0.7, y + size * 0.22)
    ctx.stroke()
  } else {
    ctx.fillStyle = '#b0b4b8'
    ctx.beginPath()
    ctx.ellipse(x + size * 0.5, y + size * 0.62, size * 0.32, size * 0.1, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#6b4a32'
    ctx.beginPath()
    ctx.ellipse(x + size * 0.38, y + size * 0.5, size * 0.1, size * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#8b5a3c'
    ctx.beginPath()
    ctx.ellipse(x + size * 0.55, y + size * 0.48, size * 0.09, size * 0.07, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** 灰斑文件夹外壳 */
export function createFolderJacketTexture() {
  const w = 512
  const h = 640
  const { canvas, ctx } = makeCanvas(w, h)
  fillSpeckled(ctx, w, h, '#d0d0c8')
  return toMap(canvas)
}

/** 白底星点纸 + 缩略图 + WORKS */
export function createArchivePaperTexture() {
  const w = 512
  const h = 640
  const { canvas, ctx } = makeCanvas(w, h)

  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, w, h)

  const gap = 28
  for (let y = 18; y < h; y += gap) {
    for (let x = 18; x < w; x += gap) {
      drawStar(ctx, x, y, 3.2)
    }
  }

  ctx.fillStyle = '#111'
  ctx.font = 'bold 36px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('WORKS', 32, 56)

  const thumb = 88
  const ty = 110
  ;['vase', 'chili', 'fruit'].forEach((kind, i) => {
    drawMiniPhoto(ctx, 32 + i * (thumb + 16), ty, thumb, kind)
  })

  ctx.font = 'bold 28px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText('WORKS', 32, h - 36)

  return toMap(canvas)
}

/** 浅蓝半透明信息页 */
export function createBlueOverlayTexture() {
  const w = 420
  const h = 520
  const { canvas, ctx } = makeCanvas(w, h)

  ctx.fillStyle = '#7eb4d4'
  ctx.fillRect(0, 0, w, h)

  const band = 'WORKS  ·  PERSONAL PORTFOLIO  ·  CREATIVE STUDIO  ·  '
  ctx.fillStyle = 'rgba(30,30,30,0.55)'
  ctx.font = '9px "Helvetica Neue", Arial, sans-serif'
  ctx.fillText(band + band, 8, 14)
  ctx.fillText(band + band, 8, h - 10)

  ctx.strokeStyle = 'rgba(40,40,40,0.35)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(w - 48, 36)
  ctx.lineTo(w - 48, 58)
  ctx.lineTo(w - 28, 58)
  ctx.lineTo(w - 28, 36)
  ctx.moveTo(w - 42, 36)
  ctx.quadraticCurveTo(w - 38, 28, w - 34, 36)
  ctx.stroke()

  ctx.fillStyle = '#141414'
  ctx.font = 'italic 64px "Times New Roman", Georgia, serif'
  ctx.fillText('Works', 24, 145)

  ctx.font = '14px "Helvetica Neue", Arial, sans-serif'
  ctx.fillStyle = 'rgba(20,20,20,0.8)'
  ctx.fillText('PORTFOLIO', 24, 190)
  ctx.fillText('WORKS', 24, 250)
  ctx.fillText('PERSONAL WORKS COLLECTION', 24, 272)

  return toMap(canvas)
}

/** 右侧索引标签竖排字 */
export function createTabLabelTexture(label = 'WORKS 01') {
  const w = 64
  const h = 160
  const { canvas, ctx } = makeCanvas(w, h)
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 18px "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(label, 0, 6)
  ctx.restore()
  const map = toMap(canvas)
  map.premultiplyAlpha = true
  return map
}

/** 左侧窄条半透明签 */
export function createVellumStripTexture() {
  const w = 120
  const h = 560
  const { canvas, ctx } = makeCanvas(w, h)

  ctx.fillStyle = 'rgba(232, 236, 238, 0.92)'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(40,40,40,0.45)'
  ctx.setLineDash([2, 3])
  ctx.beginPath()
  ctx.arc(w / 2, 140, 22, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 13px "Helvetica Neue", Arial, sans-serif'
  ctx.save()
  ctx.translate(w / 2, 48)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('WORKS', 0, 4)
  ctx.restore()

  ctx.save()
  ctx.translate(w / 2, h - 48)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('WORKS', 0, 4)
  ctx.restore()

  return toMap(canvas)
}
