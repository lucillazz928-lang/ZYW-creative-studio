import * as THREE from 'three'

const W = 540
const H = 860
const MAROON = '#7a2f3a'
const PHOTO_FOCUS_Y = 0.28

function drawCover(ctx, img, dx, dy, dw, dh, focusY) {
  const ir = img.width / img.height
  const tr = dw / dh
  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height

  if (ir > tr) {
    sh = img.height
    sw = sh * tr
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / tr
    sx = 0
    sy = Math.max(0, (img.height - sh) * focusY)
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

/** 桌上预览：证件照 + 横线占位 + 酒红侧条（不含 Overlay 文案） */
export function paintIdCardFace(ctx, portraitImg, wordmarkImg) {
  ctx.clearRect(0, 0, W, H)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  const spineW = Math.round(W * 0.18)
  const mainW = W - spineW
  const padX = 28
  const padTop = 30

  ctx.fillStyle = MAROON
  ctx.fillRect(mainW, 0, spineW, H)

  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ;[180, 360, 540].forEach((cy) => {
    ctx.fillRect(mainW + spineW / 2 - 2, cy, 4, 72)
  })

  const photoSize = Math.round(mainW * 0.72)
  const photoX = padX
  const photoY = padTop

  ctx.fillStyle = '#f3f1ee'
  ctx.fillRect(photoX, photoY, photoSize, photoSize)

  if (portraitImg?.width) {
    drawCover(ctx, portraitImg, photoX, photoY, photoSize, photoSize, PHOTO_FOCUS_Y)
  }

  ctx.strokeStyle = MAROON
  ctx.lineWidth = 3
  ctx.strokeRect(photoX + 1.5, photoY + 1.5, photoSize - 3, photoSize - 3)

  let y = photoY + photoSize + 36
  const drawField = (lineW) => {
    ctx.fillStyle = MAROON
    ctx.globalAlpha = 0.88
    ctx.fillRect(padX, y, lineW, 5)
    ctx.globalAlpha = 0.75
    ctx.fillRect(padX, y + 14, Math.round(mainW * 0.72), 2)
    ctx.globalAlpha = 0.55
    ctx.fillRect(padX, y + 28, Math.round(mainW * 0.22), 3)
    ctx.globalAlpha = 1
    y += 70
  }
  drawField(Math.round(mainW * 0.62))
  drawField(Math.round(mainW * 0.54))

  const sealCx = mainW - 52
  const sealCy = H - 58
  const sealR = 40
  ctx.strokeStyle = '#9a9690'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.arc(sealCx, sealCy, sealR, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(sealCx, sealCy, sealR - 8, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeRect(sealCx - 14, sealCy - 6, 28, 18)
  ctx.beginPath()
  ctx.moveTo(sealCx - 10, sealCy - 6)
  ctx.lineTo(sealCx - 10, sealCy - 12)
  ctx.lineTo(sealCx + 10, sealCy - 12)
  ctx.lineTo(sealCx + 10, sealCy - 6)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(sealCx, sealCy + 2, 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(sealCx - 8, sealCy + 12)
  ctx.lineTo(sealCx + 8, sealCy + 12)
  ctx.stroke()

  if (wordmarkImg?.width) {
    const markH = 210
    const markW = (wordmarkImg.width / wordmarkImg.height) * markH
    const markX = padX
    const markY = H - markH - 24
    drawWordmarkMultiply(ctx, wordmarkImg, markX, markY, markW, markH)
  }
}

function drawWordmarkMultiply(ctx, img, dx, dy, dw, dh) {
  const tmp = document.createElement('canvas')
  tmp.width = Math.max(1, Math.round(dw))
  tmp.height = Math.max(1, Math.round(dh))
  const tctx = tmp.getContext('2d')
  tctx.drawImage(img, 0, 0, tmp.width, tmp.height)
  const data = tctx.getImageData(0, 0, tmp.width, tmp.height)
  const px = data.data
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i]
    const g = px[i + 1]
    const b = px[i + 2]
    if (r < 18 && g < 18 && b < 18) {
      px[i + 3] = 0
    }
  }
  tctx.putImageData(data, 0, 0)
  ctx.drawImage(tmp, dx, dy, dw, dh)
}

export function createIdCardFaceTexture(portraitImg, wordmarkImg) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  paintIdCardFace(ctx, portraitImg, wordmarkImg)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}
