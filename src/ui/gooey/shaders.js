import * as THREE from 'three'
import noiseSrc from './shaders/noise.glsl?raw'
import vertexSrc from './shaders/vertexShader.glsl?raw'
import waveSrc from './shaders/waveShader.glsl?raw'

export const vertexShader = vertexSrc

/** AI 作品用的丝绸 wave 效果，全站统一 */
export const silkShader = noiseSrc + '\n' + waveSrc
export const silkDuration = 0.8

export function getCoverRatio(size, image, rotationDeg = 0) {
  const rad = THREE.MathUtils.degToRad(rotationDeg)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const w = Math.abs(size.x * cos + size.y * sin)
  const h = Math.abs(size.x * sin + size.y * cos)
  const originalRatio = {
    w: w / image.width,
    h: h / image.height,
  }
  const coverRatio = 1 / Math.max(originalRatio.w, originalRatio.h)
  return new THREE.Vector2(originalRatio.w * coverRatio, originalRatio.h * coverRatio)
}
