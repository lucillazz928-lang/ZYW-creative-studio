/** 认养一头牛｜电商信息流拍剪案例：首页目录 + 独立子页 */

const BASE = '/content-lab/adopt-a-cow'

export const adoptACowCase = {
  id: 'adopt-a-cow',
  titleZh: '电商信息流短视频拍剪与内容提效',
  titleEn: 'ADOPT A COW',
  brandSide: '认养一头牛',
  companyZh: '杭州认养一头牛生物科技有限公司｜创新电商运营中心 拍剪实习生',
  companyEn: 'Adopt A Cow',
  period: '2025.07 – 2025.11',
  locationZh: '杭州',
  roleZh: '拍剪实习生',
  roleEn: 'Video Production Intern',
  background:
    '负责电商信息流短视频规模化生产，拆解平台爆款视频，打造高转化带货素材；同时优化拍摄流程，沉淀创意灵感库，提升团队产出效率。',
  heroLead:
    '从爆款拆解到规模化产出，再到流程提效——把信息流拍剪做成可持续转化的内容生产线。',

  workplace: {
    labelEn: 'WHERE I WORKED',
    titleZh: '在哪里工作',
    image: `${BASE}/ops/workplace.jpg`,
    imageAlt: '认养一头牛杭州办公楼外观',
    caption: '认养一头牛 · 杭州办公楼',
    meta: [
      { label: '单位', value: '杭州认养一头牛生物科技有限公司｜创新电商运营中心' },
      { label: '项目', value: '电商信息流短视频拍剪与内容提效' },
      { label: '时间', value: '2025.07 – 2025.11' },
      { label: '地点', value: '杭州' },
      { label: '角色', value: '拍剪实习生' },
    ],
  },

  navCards: [
    {
      id: 'nav-scale',
      pageId: 'content',
      step: 'Work #1',
      titleZh: '规模化产出',
      body: '独立完成信息流带货视频；拆解爆款结构，复用创意提效。',
      colorVar: '--tm-card-1',
      rotate: -6,
    },
    {
      id: 'nav-hits',
      pageId: 'hits',
      step: 'Work #2',
      titleZh: '爆款带货',
      body: '研究爆款逻辑，制作高转化电商短视频，服务商品转化。',
      colorVar: '--tm-card-2',
      rotate: 4,
    },
    {
      id: 'nav-ops',
      pageId: 'assets',
      step: 'Work #3',
      titleZh: '流程与资产',
      body: '优化拍摄动线，搭建维护爆款灵感库，供给团队创意参考。',
      colorVar: '--tm-card-3',
      rotate: -3,
    },
  ],

  contentSection: {
    pageId: 'content',
    labelEn: '01 · SCALE',
    titleZh: '电商信息流视频规模化产出',
    body: '独立完成信息流带货视频制作，跟随平台热点拆解爆款视频结构，复用优秀创意提升产出效率。',
  },

  videoStrips: {
    talk: {
      titleZh: '机制口播',
      titleEn: 'Talking Head',
      items: [
        {
          id: 'talk-camping',
          src: `${BASE}/videos/talk-camping.mp4`,
          title: '儿童奶露营箱机制口播',
          orientation: 'portrait',
        },
      ],
    },
    feed: {
      titleZh: '种割信息流',
      titleEn: 'Feed',
      items: [
        {
          id: 'feed-mini',
          src: `${BASE}/videos/feed-mini.mp4`,
          title: '125mini 种割桌面复刻',
          orientation: 'portrait',
        },
      ],
    },
    mashup: {
      titleZh: '混剪种割',
      titleEn: 'Mashup',
      items: [
        {
          id: 'mashup-wrong',
          src: `${BASE}/videos/mashup-wrong-drink.mp4`,
          title: '牛奶错误喝法 · 混剪种割',
          orientation: 'portrait',
        },
      ],
    },
  },

  contentTabs: [
    { id: 'talk', labelZh: '机制口播', labelEn: 'Talk' },
    { id: 'feed', labelZh: '种割信息流', labelEn: 'Feed' },
    { id: 'mashup', labelZh: '混剪种割', labelEn: 'Mashup' },
  ],

  extraPages: [
    {
      id: 'hits',
      type: 'imageGrid',
      bare: true,
      labelEn: '02 · HITS',
      titleZh: '爆款带货视频打造',
      body: '研究爆款内容逻辑，制作高转化电商短视频，服务商品带货转化。单条最高 GMV 28w+，ROI 2.45。',
      images: [
        {
          id: 'hit-summary',
          src: `${BASE}/hits/summary.png`,
          alt: '素材数据汇总：消耗 129832 元，ROI 2.19，总成交金额 284362 元',
          caption: '素材汇总 · 消耗 ¥129,832 · ROI 2.19 · 总成交 ¥284,362',
          wide: true,
        },
        {
          id: 'hit-245',
          src: `${BASE}/hits/hit-245.png`,
          alt: '爆款成片 54349424，成交 110776 元，ROI 2.45，A2有机 125ml',
          caption: '爆款 · ¥110,776 / 2.45 · A2有机-125ml',
        },
        {
          id: 'hit-214',
          src: `${BASE}/hits/hit-214.png`,
          alt: '爆款成片 56097481，成交 129832 元，ROI 2.14，A2 125ml 官方旗舰店',
          caption: '爆款 · ¥129,832 / 2.14 · A2-125ml',
        },
        {
          id: 'hit-232',
          src: `${BASE}/hits/hit-232.png`,
          alt: '爆款成片 53415727，成交 109558 元，ROI 2.32，A2有机 125ml',
          caption: '爆款 · ¥109,558 / 2.32 · A2有机-125ml',
        },
      ],
    },
    {
      id: 'assets',
      type: 'imageGrid',
      bare: true,
      copyDown: true,
      labelEn: '03 · ASSETS',
      titleZh: '拍摄流程优化 & 沉淀内容资产',
      body: '通过场景预搭建、优化拍摄动线协助团队提升拍摄效率；建立维护爆款视频灵感库，输出创意参考给到团队。',
      images: [
        {
          id: 'process-scripts',
          src: `${BASE}/ops/process-scripts.jpg`,
          alt: '信息流脚本与内容分工表格截图',
          caption: '流程表 · 脚本与内容分工',
        },
        {
          id: 'process-assets',
          src: `${BASE}/ops/process-assets.jpg`,
          alt: '素材命名与灵感库资产表格截图',
          caption: '灵感库 · 素材命名与资产沉淀',
        },
      ],
    },
  ],

  results: [
    {
      id: 'r1',
      metric: '300+',
      labelZh: '信息流素材',
      detail: '实习累计产出信息流视频素材 300+ 条；单条最高 GMV 28w+，ROI 2.45，拉动商品销售转化。',
    },
    {
      id: 'r2',
      metric: '20%+',
      labelZh: '制作周期缩短',
      detail: '优化拍摄流程，短视频平均制作周期缩短 20%+，支撑团队日更稳定输出。',
    },
    {
      id: 'r3',
      metric: '灵感库',
      labelZh: '可复用内容资产',
      detail: '搭建维护爆款灵感库，持续为团队供给内容趋势与创意参考。',
    },
  ],

  reflection: {
    labelEn: 'REFLECTION',
    titleZh: '项目复盘 / 个人收获',
    body: '熟悉电商带货信息流视频的创作逻辑，理解内容和商业转化之间的关系；不只做剪辑执行，学会拆解爆款、优化工作流程、沉淀团队可复用内容资产，建立电商内容转化思维。',
  },
}
