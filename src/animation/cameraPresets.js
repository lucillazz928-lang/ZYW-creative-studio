export const CAMERA_PRESETS = {
  /** 封面起始：参考图三四分斜俯视，整屋入画 */
  entryOverview: {
    position: [3.8, 3.2, 6.2],
    lookAt: [0.1, 0.55, 2.05],
    fov: 32,
    duration: 2.55,
  },
  /** 封面定格：房子正面远景 */
  entry: {
    position: [0, 1.7, 8.4],
    lookAt: [0, 0.7, 2.05],
    fov: 34,
    duration: 2.35,
  },
  /**
   * 点门后室内推进起点（已在房间内景）：门槛内侧平视工作台，再推到 room。
   * 不再做门外 approach，避免对到屋顶 / 接不上内景。
   */
  enterDoor: {
    position: [0, 1.52, 3.85],
    lookAt: [0, 1.05, -0.35],
    fov: 40,
    duration: 1.2,
  },
  /** 出门关门时的起始取景（回封面用） */
  exitDoor: {
    position: [0, 1.55, 5.8],
    lookAt: [0, 0.75, 2.05],
    fov: 36,
    duration: 1.35,
  },
  room: {
    position: [0, 1.55, 3.1],
    lookAt: [0, 1.05, -0.35],
    fov: 40,
    duration: 1.35,
  },
  desk: {
    position: [0, 2.1, 1.55],
    lookAt: [0, 0.95, -0.25],
    fov: 36,
    duration: 1.4,
  },
  focus: {
    position: [0, 1.8, 1.15],
    lookAt: [0, 1.05, -0.15],
    fov: 34,
    duration: 0.8,
  },
}

/** 竖屏把 desk/focus 拉远一点，避免电脑屏幕占满整机、点不到旁边空白 */
const NARROW_OVERRIDES = {
  desk: {
    position: [0, 1.78, 2.42],
    lookAt: [0, 1.02, -0.22],
    fov: 46,
  },
  focus: {
    position: [0, 1.72, 1.95],
    lookAt: [0, 1.05, -0.15],
    fov: 42,
  },
}

export function isNarrowViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
}

export function getCameraPreset(stateName) {
  const preset = CAMERA_PRESETS[stateName]
  if (!preset) return preset
  const overlay = isNarrowViewport() ? NARROW_OVERRIDES[stateName] : null
  return overlay ? { ...preset, ...overlay } : preset
}
