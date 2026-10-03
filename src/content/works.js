/** 个人作品相册：浅色画面用更深、更高饱和字色保证可读 */

export const worksGhostTitle = "WHAT'S IN MY PORTFOLIO?"

export const worksItems = [
  {
    id: 'video',
    titleZh: '视频作品',
    titleEn: 'VIDEO',
    cta: 'SEE MORE',
    accent: '#E8327A',
    cover: '/works/cover-01.jpg',
    hover: '/works/cover-01.jpg',
    detail:
      '占位文案。这里将放视频作品说明：成片链接、创作背景与你想让访客记住的一句感受。',
  },
  {
    id: 'graphic',
    titleZh: '平面作品',
    titleEn: 'GRAPHIC',
    cta: 'SEE MORE',
    accent: '#1FA87A',
    cover: '/works/cover-02.jpg',
    hover: '/works/cover-02.jpg',
    detail:
      '占位文案。后续可补充平面延展、主视觉与印刷物料说明。',
  },
  {
    id: 'photo',
    titleZh: '摄影作品',
    titleEn: 'PHOTO',
    cta: 'SEE MORE',
    accent: '#FF2D9B',
    cover: '/works/cover-03.jpg',
    hover: '/works/cover-03.jpg',
    detail:
      '占位文案。适合放一组摄影选题、器材与叙事说明。',
  },
  {
    id: 'ai',
    titleZh: 'AI作品',
    titleEn: 'AI',
    cta: 'SEE MORE',
    accent: '#D94F7A',
    cover: '/works/cover-04.jpg',
    hover: '/works/hover-04.jpg',
    detail:
      'AI 辅助短片与角色 PV：左文右视频，上下滑动浏览。',
  },
  {
    id: 'proposal',
    titleZh: '策划案',
    titleEn: 'PROPOSAL',
    cta: 'SEE MORE',
    accent: '#2F7FE8',
    cover: '/works/cover-05.jpg',
    hover: '/works/hover-05.jpg',
    detail:
      '占位文案。这里留给策划案摘要、目标与落地结果。',
  },
]

/**
 * 策划案详情：3D Book Gallery（点封面翻页）
 * 页面来自 `个人作品/策划案/` PDF（1440×810 ≈ 16:9）
 * pages：每页正反面成对；奇数末页背面用封面；accent：主题色
 */
function proposalLeaves(folder, pageCount, titleZh) {
  const cover = `/works/proposals/${folder}/page-01.jpg`
  const pages = []
  for (let i = 1; i <= pageCount; i += 2) {
    const front = `/works/proposals/${folder}/page-${String(i).padStart(2, '0')}.jpg`
    const hasBack = i + 1 <= pageCount
    const back = hasBack
      ? `/works/proposals/${folder}/page-${String(i + 1).padStart(2, '0')}.jpg`
      : cover
    pages.push({
      front,
      back,
      frontAlt: `${titleZh} · 第 ${i} 页`,
      backAlt: hasBack ? `${titleZh} · 第 ${i + 1} 页` : `${titleZh} · 封面`,
    })
  }
  return pages
}

export const proposalBooksIntro = {
  titleZh: '策划案',
  titleEn: 'PROPOSAL',
  flipHint: '点封面翻页 · click pages to flip',
}

export const proposalBooks = [
  {
    id: 'proposal-sanfu',
    titleZh: '三福策划案',
    titleEn: 'SANFU',
    subtitle: '九格之间，福世万千',
    titleWords: ['SANFU', 'PLAN'],
    accent: '#E8892A',
    cover: '/works/proposals/sanfu/page-01.jpg',
    pages: proposalLeaves('sanfu', 24, '三福策划案'),
  },
  {
    id: 'proposal-haoshi',
    titleZh: '豪士面包策划案',
    titleEn: 'HAOSHI',
    subtitle: '三口「豪」吃定律',
    titleWords: ['HAOSHI', 'PLAN'],
    accent: '#1A4A8C',
    cover: '/works/proposals/haoshi/page-01.jpg',
    pages: proposalLeaves('haoshi', 29, '豪士面包策划案'),
  },
]

export const WORKS_SHAPE_URL = '/works/shape.jpg'

/**
 * 视频作品详情：Expanding Bar Menus（Codrops Demo 1）
 * 分类与 `个人作品/视频作品/` 文件夹一致
 * src 对应 public/works/videos → 个人作品/视频作品
 */
export const videoExpandIntro = {
  infoLines: ['广告片', '明星/影视混剪', '社团宣传片', '营销号', '口播·信息流'],
  title: 'VIDEO',
  demosNote: '点左侧竖条展开作品海报 · click a bar to open',
}

/** 把相对路径编成可请求的 /works/videos/... URL */
export function videoMediaUrl(relPath) {
  return `/works/videos/${relPath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')}`
}

export const videoBarItems = [
  {
    id: 'ad',
    layout: 'poster',
    barTitle: '广告片',
    barTitleEn: 'Commercial',
    title: ['广告片'],
    deco: 'brand spot',
    number: '01',
    poster: '/works/videos/posters/haoxi.jpg',
    posterAlt: '广告片 封面',
    clips: [
      {
        id: 'haoxi',
        titleZh: '《好戏开滑》大广赛全国优秀奖作品',
        titleEn: 'National Excellent Award',
        src: '广告片/好戏开“滑”.mp4',
        poster: '/works/videos/posters/haoxi.jpg',
      },
    ],
  },
  {
    id: 'mashup',
    layout: 'poster',
    barTitle: '明星/影视混剪',
    barTitleEn: 'Star Mashup',
    title: ['明星', '混剪'],
    deco: 'mashup cut',
    number: '02',
    poster: '/works/videos/posters/yuluan.jpg',
    posterAlt: '明星/影视混剪 封面',
    clips: [
      {
        id: 'yuluan',
        titleZh: '《狱乱情迷》混剪',
        titleEn: 'Mashup',
        src: '影视混剪/狱乱.mp4',
        poster: '/works/videos/posters/yuluan.jpg',
      },
      {
        id: 'apr3',
        titleZh: '《逐玉》混剪if线',
        titleEn: 'What-If Cut',
        src: '影视混剪/4月3日.mp4',
        poster: '/works/videos/posters/apr3.jpg',
      },
      {
        id: 'qingge',
        titleZh: '《新世纪情歌战士》伪MV',
        titleEn: 'Love Song Warrior',
        src: '影视混剪/混剪-新世纪情歌战士伪MV.mp4',
        poster: '/works/videos/posters/mashup-qingge.jpg',
      },
      {
        id: 'taylor',
        titleZh: '泰勒混剪',
        titleEn: 'Taylor Mashup',
        src: '影视混剪/混剪-泰勒混剪.mp4',
        poster: '/works/videos/posters/mashup-taylor.jpg',
      },
      {
        id: 'shaonv',
        titleZh: '《少女》伪MV',
        titleEn: 'Girl Pseudo-MV',
        src: '影视混剪/混剪-少女伪MV.mp4',
        poster: '/works/videos/posters/mashup-shaonv.jpg',
      },
      {
        id: 'aicz',
        titleZh: '《爱存在》伪MV',
        titleEn: 'Love Exists',
        src: '影视混剪/混剪-爱存在伪MV.mp4',
        poster: '/works/videos/posters/mashup-aicz.jpg',
      },
    ],
  },
  {
    id: 'club',
    layout: 'poster',
    barTitle: '社团宣传片',
    barTitleEn: 'Club Promo',
    title: ['社团', '宣传'],
    deco: 'club reel',
    number: '03',
    poster: '/works/videos/posters/dinggao.jpg',
    posterAlt: '社团宣传片 封面',
    clips: [
      {
        id: 'dinggao',
        titleZh: '《寻梦者征召》——长春理工大学广告协会招新宣传',
        titleEn: 'Dream Seeker · Recruitment',
        src: '社团宣传片/定稿.mp4',
        poster: '/works/videos/posters/dinggao.jpg',
      },
    ],
  },
  {
    id: 'marketing',
    layout: 'marketing-doors',
    barTitle: '营销号',
    barTitleEn: 'Marketing',
    title: ['营销号'],
    deco: 'short form',
    number: '04',
    poster: '/works/videos/posters/hotel.jpg',
    posterAlt: '营销号 封面',
    // 两支比例不同。画框跟右边「桃黑黑仁义」(1080×2134)，左边按这个高度裁齐。
    frameAspect: 1080 / 2134,
    clips: [
      {
        id: 'hotel',
        titleZh: '酒店搞笑评论',
        titleEn: 'Hotel Comments',
        src: '营销号/酒店评论.mp4',
        poster: '/works/videos/posters/hotel.jpg',
      },
      {
        id: 'jul12',
        titleZh: '桃黑黑仁义',
        titleEn: 'Tao Heihei',
        src: '营销号/7月12日 (1).mp4',
        poster: '/works/videos/posters/jul12.jpg',
      },
    ],
  },
  {
    id: 'feed',
    layout: 'feed-talk',
    barTitle: '口播·信息流',
    barTitleEn: 'Feed & Talk',
    title: ['口播', '信息流'],
    deco: 'work reels',
    number: '05',
    poster: '/works/videos/posters/feed-bajie.jpg',
    posterAlt: '口播·信息流 封面',
    pages: [
      {
        id: 'talk',
        labelZh: '口播',
        labelEn: 'Talking Head',
        showCover: false,
        clips: [
          {
            id: 'bajie',
            titleZh: '猪八戒的职场生存法则，太真实了！',
            titleEn: 'Workplace Survival',
            src: '口播信息流/口播-猪八戒职场生存法则.mp4',
            poster: '/works/videos/posters/feed-bajie.jpg',
          },
          {
            id: 'voice',
            titleZh: '练声千万不要只练嘴',
            titleEn: 'Voice Training',
            src: '口播信息流/口播-练声千万不要只练嘴.mp4',
            poster: '/works/videos/posters/feed-voice.jpg',
          },
          {
            id: 'milk-talk',
            titleZh: '认养一头牛 · 儿童奶露营箱机制口播',
            titleEn: 'Camping Box Mechanism',
            src: '口播信息流/口播-儿童奶折叠露营箱机制口播.mp4',
            poster: '/works/videos/posters/feed-milk-talk.jpg',
          },
        ],
      },
      {
        id: 'feed',
        labelZh: '信息流',
        labelEn: 'Feed Ads',
        showCover: false,
        clips: [
          {
            id: 'milk01',
            titleZh: '认养一头牛 · 儿童奶 125mini 种割',
            titleEn: 'Kids Milk Mini Pack',
            src: '口播信息流/信息流-儿童奶125mini种割.mp4',
            poster: '/works/videos/posters/feed-milk-01.jpg',
          },
          {
            id: 'milk02',
            titleZh: '认养一头牛 · 儿童奶错误喝法',
            titleEn: 'Wrong Ways to Drink Milk',
            src: '口播信息流/信息流-儿童奶牛奶错误喝法.mp4',
            poster: '/works/videos/posters/feed-milk-02.jpg',
          },
        ],
      },
    ],
  },
]

/**
 * 平面作品详情：Codrops Variation 2 前半段入场
 * → 底部圆心大半圆滑轨（滚轮驱动）
 * 图源：个人作品/平面作品/（已压缩到 public/works/graphics/）
 */
export const graphicPosterIntro = {
  title: 'POSTERS',
  titleZh: '平面作品',
  backLabel: '← BACK TO GALLERY',
  scrollHint: '滚动看看',
}

export const graphicPosterItems = [
  {
    id: 'poster-01',
    image: '/works/graphics/graphic-01.jpg',
    title: '好想来 01',
    alt: '好想来 01',
  },
  {
    id: 'poster-02',
    image: '/works/graphics/graphic-02.jpg',
    title: '好想来 02',
    alt: '好想来 02',
  },
  {
    id: 'poster-03',
    image: '/works/graphics/graphic-03.jpg',
    title: '好想来 03',
    alt: '好想来 03',
  },
  {
    id: 'poster-04',
    image: '/works/graphics/graphic-04.jpg',
    title: 'CURIOSITY MAGAZINE',
    alt: 'CURIOSITY MAGAZINE',
  },
  {
    id: 'poster-05',
    image: '/works/graphics/graphic-05.jpg',
    title: '力涌潮前：冲浪篇',
    alt: '力涌潮前：冲浪篇',
  },
  {
    id: 'poster-06',
    image: '/works/graphics/graphic-06.jpg',
    title: '力涌潮前：划船篇',
    alt: '力涌潮前：划船篇',
  },
  {
    id: 'poster-07',
    image: '/works/graphics/graphic-07.jpg',
    title: '力涌潮前：划船篇 Ⅱ',
    alt: '力涌潮前：划船篇 Ⅱ',
  },
  {
    id: 'poster-08',
    image: '/works/graphics/graphic-08.jpg',
    title: '好戏开滑 1',
    alt: '好戏开滑 1',
  },
  {
    id: 'poster-09',
    image: '/works/graphics/graphic-09.jpg',
    title: '好戏开滑 2',
    alt: '好戏开滑 2',
  },
  {
    id: 'poster-10',
    image: '/works/graphics/graphic-10.jpg',
    title: '还掉？收你们来了！1',
    alt: '还掉？收你们来了！1',
  },
  {
    id: 'poster-11',
    image: '/works/graphics/graphic-11.jpg',
    title: '还掉？收你们来了！2',
    alt: '还掉？收你们来了！2',
  },
  {
    id: 'poster-12',
    image: '/works/graphics/graphic-12.jpg',
    title: '杰士邦 1',
    alt: '杰士邦 1',
  },
  {
    id: 'poster-13',
    image: '/works/graphics/graphic-13.jpg',
    title: '杰士邦 2',
    alt: '杰士邦 2',
  },
  {
    id: 'poster-14',
    image: '/works/graphics/graphic-14.jpg',
    title: '杰士邦 3',
    alt: '杰士邦 3',
  },
  {
    id: 'poster-15',
    image: '/works/graphics/graphic-15.jpg',
    title: '消食片',
    alt: '消食片',
  },
  {
    id: 'poster-16',
    image: '/works/graphics/graphic-16.jpg',
    title: '追回童趣',
    alt: '追回童趣',
  },
]

/** 摄影作品详情：DriftWall 瓦片
 *  objectPosition：人物照对齐头部，避免横裁时卡在胸口/腰线
 */
export const photoDriftItems = [
  { image: '/works/photos/photo-yinghuo.jpg' },
  { image: '/works/photos/photo-angguang.jpg' },
  { image: '/works/photos/photo-wall-01.jpg' },
  { image: '/works/photos/photo-wall-02.jpg' },
  { image: '/works/photos/photo-wall-03.jpg', objectPosition: '58% 42%' },
  { image: '/works/photos/photo-wall-04.jpg', objectPosition: '55% 28%' },
  { image: '/works/photos/photo-wall-05.jpg', objectPosition: '48% 32%' },
  { image: '/works/photos/photo-wall-06.jpg' },
  { image: '/works/photos/photo-wall-07.jpg' },
  { image: '/works/photos/photo-wall-08.jpg' },
  { image: '/works/photos/photo-wall-09.jpg', objectPosition: '50% 35%' },
  { image: '/works/photos/photo-wall-10.jpg' },
  { image: '/works/photos/photo-wall-11.jpg', objectPosition: '45% 40%' },
  { image: '/works/photos/photo-wall-12.jpg', objectPosition: '50% 40%' },
  { image: '/works/photos/photo-wall-13.jpg', objectPosition: '50% 16%' },
  { image: '/works/photos/photo-wall-14.jpg', objectPosition: '50% 22%' },
  { image: '/works/photos/photo-wall-15.jpg' },
  { image: '/works/photos/photo-wall-16.jpg', objectPosition: '28% 35%' },
  { image: '/works/photos/photo-wall-17.jpg' },
  { image: '/works/photos/photo-01.jpg' },
  { image: '/works/photos/photo-02.jpg' },
  { image: '/works/photos/photo-03.jpg', objectPosition: '50% 0%' },
  { image: '/works/photos/photo-07.jpg' },
]

/**
 * AI 作品详情：左文右视频、纵向滚动
 * titleSrc：左侧原版路径化 SVG；videos：多支时横排
 * 换片只改 video(s) / poster / titleSrc
 */
export const aiWorksIntro = {
  backLabel: '← BACK TO GALLERY',
  ariaLabel: 'AI 作品',
}

export const aiWorksItems = [
  {
    id: 'cover-motion',
    index: '01',
    titleZh: '封面动效',
    subtitle: '静图转动态 · 歌词动效',
    titleSrc: '/works/ai/title-cover-motion.svg',
    layout: 'row',
    videos: [
      {
        src: '/works/ai/cover-motion-01.mp4',
        alt: '封面动效 01',
      },
      {
        src: '/works/ai/cover-motion-02.mp4',
        alt: '封面动效 02',
      },
      {
        src: '/works/ai/cover-motion-03.mp4',
        alt: '封面动效 03',
      },
    ],
  },
  {
    id: 'march-19',
    index: '02',
    titleZh: '《喜鹊谋杀案》 × 《狱乱情迷》',
    subtitle: '风格化视频',
    titleSrc: '/works/ai/title-01.svg',
    video: '/works/ai/march-19.mp4',
    poster: '/works/ai/march-19-poster.jpg',
    posterAlt: '《喜鹊谋杀案》 × 《狱乱情迷》 视频封面',
  },
  {
    id: 'puxu',
    index: '03',
    titleZh: '赤尾×持久系列 广告视频',
    subtitle: '大广赛吉林省二等奖作品',
    titleSrc: '/works/ai/title-02.svg',
    video: '/works/ai/puxu.mp4',
    poster: '/works/ai/puxu-poster.jpg',
    posterAlt: '赤尾×持久系列 广告视频封面',
  },
]
