/** 腾讯音乐｜波点音乐案例：首页目录 + 独立子页 */

const BASE = '/content-lab/tencent-music'

export const tencentMusicCase = {
  id: 'tencent-music',
  titleZh: '波点音乐｜多平台社交媒体账号运营',
  titleEn: 'BODIAN MUSIC',
  brandSide: '腾讯音乐',
  companyZh: '腾讯音乐娱乐集团｜QQ 音乐业务线 新媒体运营',
  companyEn: 'Tencent Music Entertainment',
  period: '2025.11 – 2026.02',
  locationZh: '北京',
  roleZh: '新媒体运营实习生',
  roleEn: 'Social Media Intern',
  background:
    '负责波点音乐抖音 / 小红书 / B 站 / 微博社媒矩阵，围绕音乐热点产出图文、短视频内容，提升账号互动与粉丝活跃度；同时参与酷我音乐年度榜单专题视频制作。',
  heroLead: '从热点策划到成片发布，再到数据复盘——把社媒矩阵当成一条能持续增长的内容生产线。',

  /** 首页：在哪里工作 */
  workplace: {
    labelEn: 'WHERE I WORKED',
    titleZh: '在哪里工作',
    image: `${BASE}/ops/tme-office.jpg`,
    imageAlt: '腾讯音乐工牌实拍',
    caption: '腾讯音乐娱乐集团 · 工牌',
    meta: [
      { label: '单位', value: '腾讯音乐娱乐集团｜QQ 音乐业务线' },
      { label: '项目', value: '波点音乐新媒体运营' },
      { label: '时间', value: '2025.11 – 2026.02' },
      { label: '地点', value: '北京' },
      { label: '角色', value: '新媒体运营实习生' },
    ],
  },

  /** 首页卡片 → 进入独立子页 pageId */
  navCards: [
    {
      id: 'nav-platforms',
      pageId: 'platforms',
      step: 'Work #1',
      titleZh: '社媒矩阵',
      body: '抖音 / 小红书 / B 站 / 微博四端账号运营与内容节奏。',
      colorVar: '--tm-card-1',
      rotate: -6,
    },
    {
      id: 'nav-content',
      pageId: 'content',
      step: 'Work #2',
      titleZh: '内容产出',
      body: '图文短视频策划落地：混剪、专辑封面AI动效、物料与爆款复盘。',
      colorVar: '--tm-card-2',
      rotate: 4,
    },
    {
      id: 'nav-kuwo',
      pageId: 'kuwo',
      step: 'Work #3',
      titleZh: '年度榜单',
      body: '酷我音乐年度榜单专题：剪辑、文案与成片发布。',
      colorVar: '--tm-card-3',
      rotate: -3,
    },
    {
      id: 'nav-ops',
      pageId: 'ops',
      step: 'Work #4',
      titleZh: '数据复盘',
      body: '发布统筹、数据复盘与可复用选题库沉淀。',
      colorVar: '--tm-card-4',
      rotate: 5,
    },
    {
      id: 'nav-care',
      pageId: 'care',
      step: 'Work #5',
      titleZh: '黑稿维护',
      body: '负面反馈沟通、用户安抚与问题反馈技术侧。',
      colorVar: '--tm-card-5',
      rotate: -4,
    },
  ],

  platformStage: {
    pageId: 'platforms',
    labelEn: '01 · MATRIX',
    titleZh: '波点音乐社媒矩阵',
    body: '独立负责四端账号内容方向与日常输出，结合各平台调性做差异化传播。',
    steps: [
      {
        id: 'xhs',
        image: `${BASE}/platforms/xhs.png`,
        alt: '波点音乐小红书账号截图',
        kicker: '小红书 · Xiaohongshu',
        titleZh: '种草与情绪共鸣的主场',
        body: '6.7 万粉丝，126.8 万获赞与收藏。围绕音乐热点做图文与短视频，拉动账号互动与粉丝活跃。',
      },
      {
        id: 'bilibili',
        image: `${BASE}/platforms/bilibili.jpg`,
        alt: '波点音乐哔哩哔哩账号截图',
        kicker: '哔哩哔哩 · Bilibili',
        titleZh: '长视频与二创的表达场',
        body: '8.4k 粉丝，259.1 万播放。用更完整的叙事承接混剪、专题与官方动态。',
      },
      {
        id: 'weibo',
        image: `${BASE}/platforms/weibo.png`,
        alt: '波点音乐微博账号截图',
        kicker: '微博 · Weibo',
        titleZh: '热点跟进与官方声量',
        body: '6.2 万粉丝，视频累计播放 134.1 万。快速响应新歌与活动节点，维持品牌存在感。',
      },
      {
        id: 'douyin',
        image: `${BASE}/platforms/douyin.png`,
        alt: '波点音乐抖音账号截图',
        kicker: '抖音 · Douyin',
        titleZh: '短平快的音乐传播口',
        body: '6.4k 粉丝，30 万获赞。用短视频节奏抓住注意力，把热点做成可传播的碎片内容。',
      },
    ],
  },

  contentSection: {
    pageId: 'content',
    labelEn: '02 · CONTENT',
    titleZh: '多平台账号策略与内容产出',
    body: '独立负责波点音乐多平台内容方向与日常输出；结合音乐热点、用户情绪与各平台调性，策划图文及短视频并落地发布。',
    materials: [
      {
        id: 'wayv',
        src: `${BASE}/materials/wayv.jpg`,
        alt: '威神V新专物料图',
        caption: '活动物料 · 威神V新专',
      },
      {
        id: 'music-card',
        src: `${BASE}/materials/music-card.jpg`,
        alt: '音乐卡片分享方法说明图',
        caption: '玩法引导 · 音乐卡片分享',
      },
      {
        id: 'mofen',
        src: `${BASE}/materials/mofen.jpg`,
        alt: '摩粉福利物料图',
        caption: '社群福利 · 摩粉兑换',
      },
    ],
    hits: [
      {
        id: 'hit-zootopia',
        src: `${BASE}/hits/hit-zootopia.jpg`,
        alt: '《疯狂动物城2》主题曲 MV 爆款截图',
        caption: '爆款 · 点赞 4.6 万+',
      },
      {
        id: 'hit-backend',
        src: `${BASE}/hits/hit-backend.jpg`,
        alt: '《双轨》MV 后台数据截图',
        caption: '后台数据 · 播放 12 万+',
      },
    ],
  },

  videoStrips: {
    mashup: {
      titleZh: '混剪类短视频',
      titleEn: 'Mashup',
      items: [
        {
          id: 'mashup-1',
          src: `${BASE}/videos/mashup/13433690811008921.mp4`,
          title: '混剪作品 01',
          orientation: 'landscape',
        },
        {
          id: 'mashup-2',
          src: `${BASE}/videos/mashup/13433690849615299.mp4`,
          title: '混剪作品 02',
          orientation: 'landscape',
        },
        {
          id: 'mashup-3',
          src: `${BASE}/videos/mashup/13433690892841143.mp4`,
          title: '混剪作品 03',
          orientation: 'landscape',
        },
        {
          id: 'mashup-4',
          src: `${BASE}/videos/mashup/13433691259759421.mp4`,
          title: '混剪作品 04',
          orientation: 'landscape',
        },
      ],
    },
    staticAi: {
      titleZh: '专辑封面AI动效',
      titleEn: 'Album Cover AI Motion',
      items: [
        {
          id: 'ai-1',
          src: `${BASE}/videos/static-ai/13433690930703284.mp4`,
          title: '专辑封面AI动效 01',
          orientation: 'portrait',
        },
        {
          id: 'ai-2',
          src: `${BASE}/videos/static-ai/13433691093716473.mp4`,
          title: '专辑封面AI动效 02',
          orientation: 'portrait',
        },
        {
          id: 'ai-3',
          src: `${BASE}/videos/static-ai/13433691130161736.mp4`,
          title: '专辑封面AI动效 03',
          orientation: 'portrait',
        },
        {
          id: 'ai-4',
          src: `${BASE}/videos/static-ai/13433691224499582.mp4`,
          title: '专辑封面AI动效 04',
          orientation: 'portrait',
        },
        {
          id: 'ai-5',
          src: `${BASE}/videos/static-ai/13433691302210028.mp4`,
          title: '专辑封面AI动效 05',
          orientation: 'portrait',
        },
      ],
    },
  },

  /** 内容产出页底部胶囊导航分区 */
  contentTabs: [
    { id: 'mashup', labelZh: '混剪视频', labelEn: 'Mashup' },
    { id: 'staticAi', labelZh: '专辑封面AI动效', labelEn: 'Cover Motion' },
    { id: 'materials', labelZh: '发布物料', labelEn: 'Materials' },
    { id: 'hits', labelZh: '爆款数据', labelEn: 'Hits' },
  ],

  kuwoSection: {
    pageId: 'kuwo',
    labelEn: '03 · SPECIAL',
    titleZh: '酷我音乐年度榜单专题',
    body: '参与酷我音乐「年度榜单」专题视频全流程，负责视频剪辑与配套发布文案，累计产出专题视频 8 条。',
    video: {
      id: 'kuwo-annual',
      src: `${BASE}/videos/kuwo-annual-preview.mp4`,
      title: '酷我音乐年度榜单盘点——【Pitchfork】篇',
      orientation: 'landscape',
      externalUrl:
        'https://www.bilibili.com/video/BV1fUBDBKEo6/?spm_id_from=333.1387.upload.video_card.click',
    },
  },

  ops: {
    pageId: 'ops',
    labelEn: '04 · OPS',
    titleZh: '数据复盘与内容资产',
    body: '定期复盘播放、点赞与互动，挖掘高潜力方向；沉淀可复用选题库，支撑账号稳定更新。',
    image: {
      id: 'schedule',
      src: `${BASE}/ops/schedule.png`,
      alt: '小红书与 B 站内容排期及数据复盘表',
      caption: '四端数据复盘表 · 点击下载完整 Excel',
      externalUrl: `${BASE}/ops/platform-schedule.xlsx`,
      downloadName: '各平台账号内容排期.xlsx',
    },
  },

  feedback: {
    pageId: 'care',
    labelEn: '05 · CARE',
    titleZh: '黑稿维护与问题反馈',
    body: '协助处理社媒负面反馈，与用户沟通维护口碑，并将产品问题整理反馈至技术侧，推动闭环。',
    images: [
      {
        id: 'feedback-01',
        src: `${BASE}/ops/feedback-01.jpg`,
        alt: '运营群内黑稿跟进沟通截图',
        caption: '用户沟通 · 问题日志跟进',
      },
      {
        id: 'feedback-02',
        src: `${BASE}/ops/feedback-02.jpg`,
        alt: '运营群内负面反馈处理截图',
        caption: '黑稿维护 · 协同技术排查',
      },
    ],
  },

  results: [
    {
      id: 'r1',
      metric: '2000+',
      labelZh: '小红书涨粉',
      detail: '单条视频最高播放 40w+，点赞 4w+，账号互动与粉丝活跃度提升。',
    },
    {
      id: 'r2',
      metric: '8 条',
      labelZh: '年度榜单专题',
      detail: '完成酷我音乐年度榜单专题视频共 8 条，部分播放破 1w+。',
    },
    {
      id: 'r3',
      metric: '选题库',
      labelZh: '可复用内容资产',
      detail: '通过复盘沉淀选题库，为账号持续输出提供支撑。',
    },
  ],

  reflection: {
    labelEn: 'REFLECTION',
    titleZh: '项目复盘 / 个人收获',
    body: '完整经历策略制定、内容策划、剪辑发布到数据复盘的闭环。学会按平台调性做差异化内容，用数据反向指导选题，建立内容驱动增长的运营思维。',
  },
}
