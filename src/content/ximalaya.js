/** 喜马拉雅｜喜播小红书冷启动 & 直播引流案例：首页目录 + 独立子页（版样对齐腾讯音乐） */

const BASE = '/content-lab/ximalaya'

export const ximalayaCase = {
  id: 'ximalaya',
  titleZh: '喜播小红书账号冷启动 & 直播短视频引流运营',
  titleEn: 'XIMALAYA · XIBO',
  brandSide: '喜马拉雅',
  companyZh: '上海喜马拉雅有限公司｜喜播事业部 短视频运营',
  companyEn: 'Ximalaya',
  period: '2025.01 – 2025.06',
  locationZh: '上海',
  roleZh: '短视频运营实习生',
  roleEn: 'Short Video Ops Intern',
  background:
    '负责小红书新账号从 0‑1 搭建，追踪平台热点产出图文短视频；同时对直播业务做数据复盘优化，产出短视频为直播间引流。',
  heroLead:
    '从账号冷启动到直播引流闭环——用热点内容起量，用数据复盘迭代，用短视频把流量送进直播间。',

  workplace: {
    labelEn: 'WHERE I WORKED',
    titleZh: '在哪里工作',
    image: `${BASE}/ops/workplace.jpg`,
    imageAlt: '上海喜马拉雅大楼外景',
    caption: '上海喜马拉雅 · 喜播事业部',
    meta: [
      { label: '单位', value: '上海喜马拉雅有限公司｜喜播事业部' },
      { label: '项目', value: '喜播小红书冷启动 & 直播短视频引流' },
      { label: '时间', value: '2025.01 – 2025.06' },
      { label: '地点', value: '上海' },
      { label: '角色', value: '短视频运营实习生' },
    ],
  },

  navCards: [
    {
      id: 'nav-xhs',
      pageId: 'covers',
      step: 'Work #1',
      titleZh: '账号冷启动',
      body: '0‑1 搭建小红书账号：热点追踪、图文短视频策划发布。',
      colorVar: '--tm-card-1',
      rotate: -6,
    },
    {
      id: 'nav-live',
      pageId: 'live',
      step: 'Work #2',
      titleZh: '直播复盘',
      body: '直播数据复盘，从内容与物料维度迭代，提升转化。',
      colorVar: '--tm-card-2',
      rotate: 4,
    },
    {
      id: 'nav-clips',
      pageId: 'content',
      step: 'Work #3',
      titleZh: '视频引流',
      body: '批量产出短视频素材，为直播间导流。',
      colorVar: '--tm-card-3',
      rotate: -3,
    },
  ],

  /** Work #3：内容产出（同腾讯音乐 ContentStudio） */
  contentSection: {
    pageId: 'content',
    labelEn: '03 · TRAFFIC',
    titleZh: '短视频素材量产 & 直播间引流',
    body: '批量产出短视频素材，协同直播团队为直播间导流。累计短视频素材 150+，其中引流短视频 30+。',
    materials: [],
    hits: [],
  },

  videoStrips: {
    dubbing: {
      titleZh: '配音集锦',
      titleEn: 'Dubbing',
      items: [
        {
          id: 'nick-judy',
          src: `${BASE}/videos/nick-judy.mp4`,
          title: '尼克到底给朱迪取了多少爱称！',
          orientation: 'portrait',
          poster: `${BASE}/ops/nick-judy-poster.jpg`,
          letterboxPoster: true,
        },
        {
          id: 'bajie',
          src: `${BASE}/videos/bajie-workplace.mp4`,
          title: '猪八戒的职场生存法则，太真实了！',
          orientation: 'portrait',
          poster: `${BASE}/ops/bajie-poster.jpg`,
          letterboxPoster: true,
        },
      ],
    },
    talk: {
      titleZh: '引流口播 & 教学',
      titleEn: 'Talk & Teach',
      items: [
        {
          id: 'voice',
          src: `${BASE}/videos/voice-training.mp4`,
          title: '练声千万不要只练嘴',
          orientation: 'portrait',
          poster: `${BASE}/ops/voice-training-poster.jpg`,
          letterboxPoster: true,
        },
        {
          id: 'nick-voice',
          src: `${BASE}/videos/nick-voice.mp4`,
          title: '狐尼克为什么这么有辨识度？',
          orientation: 'portrait',
          poster: `${BASE}/ops/nick-voice-poster.jpg`,
          letterboxPoster: true,
        },
      ],
    },
  },

  contentTabs: [
    { id: 'dubbing', labelZh: '配音集锦', labelEn: 'Dubbing' },
    { id: 'talk', labelZh: '引流口播&教学', labelEn: 'Talk & Teach' },
  ],

  /**
   * Work #1 / #2：独立子页
   * type studio → 与腾讯音乐「内容产出」同款：头文案 + 单区展示 + 底部胶囊
   */
  extraPages: [
    {
      id: 'covers',
      type: 'studio',
      labelEn: '01 · COLD START',
      titleZh: '0‑1 小红书账号搭建与内容运营',
      body: '负责小红书账号剪辑与日常运营：热点追踪、图文短视频策划发布，全链路推进账号冷启动。账号总增粉 5000+，单条最高浏览 119w+、点赞 5w。',
      galleries: {
        main: [
          {
            id: 'xhs-learn',
            src: `${BASE}/ops/xhs-zhangzhen-learn.jpg`,
            alt: '小红书账号「张震带你学配音」主页截图',
            kicker: '主运营 · Main',
            titleZh: '张震带你学配音',
            body: '配音教学向主账号：主页搭建、内容方向与日常起量，承接入门技巧与代表作声量。',
          },
          {
            id: 'xhs-class',
            src: `${BASE}/ops/xhs-zhangzhen-class.jpg`,
            alt: '小红书账号「张震配音小课堂」主页截图',
            kicker: '主运营 · Main',
            titleZh: '张震配音小课堂',
            body: '冷启动成长账号：持续输出配音干货与二创内容，粉丝与互动随内容节奏抬升。',
          },
        ],
        sub: [
          {
            id: 'xhs-dub-class',
            src: `${BASE}/ops/xhs-dub-class.png`,
            alt: '小红书账号「喜马拉雅配音课堂」内容截图',
            kicker: '次运营 · Sub',
            titleZh: '喜马拉雅配音课堂',
            body: '剪辑与内容运营留痕：直播引流向短视频封面与选题节奏，服务业务转化目标。',
          },
          {
            id: 'xhs-voice-talk',
            src: `${BASE}/ops/xhs-voice-talk.png`,
            alt: '小红书账号「喜马拉雅有声说」内容截图',
            kicker: '次运营 · Sub',
            titleZh: '喜马拉雅有声说',
            body: '协同账号内容产出：朗诵、绘本与哄睡等教学向短视频，为直播间持续导流。',
          },
        ],
      },
      tabs: [
        { id: 'main', labelZh: '主运营', labelEn: 'Main', layout: 'story' },
        { id: 'sub', labelZh: '次运营', labelEn: 'Sub', layout: 'story' },
      ],
    },
    {
      id: 'live',
      type: 'studio',
      labelEn: '02 · LIVE OPS',
      titleZh: '直播业务复盘迭代优化',
      body: '基于数据分析完成直播内容复盘，从直播内容、宣传物料维度做迭代优化，提升直播间用户体验与商业转化。优化后粉丝停留时长 +20%，单场直播 ROI +30%。',
      galleries: {
        scenes: [
          {
            id: 'live-material',
            src: `${BASE}/ops/live-material.png`,
            alt: '直播间文案物料截图',
            kicker: '物料 · Material',
            titleZh: '直播文案物料',
            body: '直播间文案画面物料，配合口播与互动节奏，提升停留与转化体验。',
          },
          {
            id: 'live-screen',
            src: `${BASE}/ops/live-screen.png`,
            alt: '直播间实时画面截图',
            kicker: '画面 · Screen',
            titleZh: '直播间实时画面',
            body: '声音课堂直播实况：标题、节目单与连麦互动同框，便于复盘内容结构。',
          },
        ],
        data: [
          {
            id: 'live-trend',
            src: `${BASE}/ops/live-trend.png`,
            alt: '直播后台整体趋势数据截图',
            kicker: '数据 · Trend',
            titleZh: '整体趋势复盘',
            body: '后台整体趋势：在线、进房、离房与评论走势，定位场次高低谷节点。',
          },
          {
            id: 'live-summary',
            src: `${BASE}/ops/live-summary.png`,
            alt: '直播结束后台数据概览截图',
            kicker: '数据 · Summary',
            titleZh: '结束后台概览',
            body: '单场结束后台：观众、停留、涨粉与热度等核心指标，对照优化前后差异。',
          },
        ],
      },
      tabs: [
        { id: 'scenes', labelZh: '物料与画面', labelEn: 'Scenes', layout: 'story' },
        { id: 'data', labelZh: '后台数据', labelEn: 'Data', layout: 'story' },
      ],
    },
  ],

  results: [
    {
      id: 'r1',
      metric: '5000+',
      labelZh: '账号总增粉',
      detail: '0‑1 运营小红书账号，单条内容最高浏览 119w+，点赞 5w；实习期间账号总增粉 5000+。',
    },
    {
      id: 'r2',
      metric: '+30%',
      labelZh: '单场直播 ROI',
      detail: '优化直播内容与物料后，粉丝停留时长提升 20%，单场直播 ROI 提升 30%。',
    },
    {
      id: 'r3',
      metric: '150+ / 30+',
      labelZh: '短视频 / 引流视频',
      detail: '累计产出短视频素材 150+ 条，其中引流短视频 30+ 条，完成直播间流量导入。',
    },
  ],

  reflection: {
    labelEn: 'REFLECTION',
    titleZh: '项目复盘 / 个人收获',
    body: '完整实践账号冷启动、批量内容生产、短视频引流直播间闭环；学会用数据定位直播业务问题，理解短视频为直播导流的逻辑，掌握热点结合业务目标的内容制作思路。',
  },
}
