import card01 from '../assets/skills/card-01.jpg'
import card02 from '../assets/skills/card-02.jpg'
import card03 from '../assets/skills/card-03.jpg'
import card04 from '../assets/skills/card-04.jpg'
import card05 from '../assets/skills/card-05.jpg'

/** 顺序：平台运营 → 内容策略 → 视频制作 → AI 工具 → 数据复盘 */
export const skillCards = [
  { title: '平台运营', subtitle: 'Platform Ops', image: card01, caption: false },
  { title: '内容策略', subtitle: 'Content Strategy', image: card02, caption: false },
  { title: '视频制作', subtitle: 'Video Production', image: card03, caption: false },
  { title: 'AI 工具', subtitle: 'AI Tools', image: card04, caption: false },
  { title: '数据复盘', subtitle: 'Data Review', image: card05, caption: false },
]

export const skillBounceImages = skillCards.map((card) => card.image)

export const skillBounceCaptions = skillCards.map((card) =>
  card.caption === false ? '' : `${card.title} · ${card.subtitle}`,
)

export const skillBounceTransforms = [
  'rotate(5deg) translate(-300px)',
  'rotate(0deg) translate(-140px)',
  'rotate(-5deg)',
  'rotate(5deg) translate(140px)',
  'rotate(-5deg) translate(300px)',
]
