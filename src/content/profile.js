export const siteProfile = {
  doorPlateZh: '郑轶玟的创意小屋',
  doorPlateEn: 'Creative Studio',
  name: '郑轶玟',
  /** 简历未写出生年；按 2023 入学常见年龄暂填，确认后改 */
  age: 21,
  school: '长春理工大学',
  major: '广告学',
  classOf: '2027届',
  contact: {
    email: 'lucilla928@126.com',
    phone: '13116737668',
  },

  /** ID Card 独立页文案（点击桌上卡片直达） */
  about: {
    titleZh: '基本信息',
    titleEn: 'ABOUT',
    heroEyebrow: 'CONTENT · 内容全链路 · 2027',
    heroHeadline: {
      greeting: 'HI! 我是郑轶玟',
      lines: [
        [
          { text: '擅长把内容从' },
          { text: '构思策划', mark: true },
        ],
        [
          { text: '做到' },
          { text: '制作发布', mark: true },
          { text: '再' },
          { text: '迭代调优', mark: true },
        ],
      ],
    },
    heroSummary:
      '一个从热点拆解、批量产出到数据复盘，把内容做成能持续增长资产的内容实践者。',
    heroQuote: '比起证明自己什么都会，我更在意有没有把流程跑顺。',
    primaryCta: '先看代表结果',
    secondaryCta: '看看我怎么做事',
    heroTags: ['先问要解决什么', '把爆款拆成结构', '用数据迭代', '流程比全能重要'],
    photoBadge: {
      labelEn: 'ABOUT',
      labelZh: '正式介绍',
      meta: '2027届 · 广告学',
    },
    selectedExperience: {
      titleEn: 'SELECTED EXPERIENCE',
      companies: '喜播 · 认养一头牛 · 腾\u2060讯\u2060音\u2060乐',
      focuses: '冷启动 · 信息流拍剪 · 社媒矩阵',
    },
    nextStop: {
      labelZh: '下一站',
      body: '继续把内容做成可增长的生产线',
    },
    scrollHint: '继续下滑，探索更多',

    /** Hero 与内容区之间的弧形跑马灯分隔（可随时改文案） */
    marquee: {
      text: '我擅长什么 ✦ 我擅长什么 ✦ ',
      speed: 1.35,
      curveAmount: 240,
      direction: 'left',
      interactive: true,
    },

    strengths: {
      titleZh: '我擅长什么',
      titleEn: 'STRENGTHS',
      lead: '会把「想内容」推进成「能规模化生产、能用数据迭代」的流程。',
      folderLabel: '我的技能宝箱',
      folderSublabel: '我擅长什么',
      slips: [
        {
          id: 'cold-start',
          titleZh: '账号冷启动与热点起盘',
          body: '从 0 搭定位和内容节奏，用热点把账号先做起来，并稳住更新节奏（喜播）。',
        },
        {
          id: 'scale',
          titleZh: '信息流素材规模化拍剪',
          body: '把爆款拆成可复用结构，稳定批量产出能投放、能测效的视频素材（认养一头牛）。',
        },
        {
          id: 'matrix',
          titleZh: '多平台矩阵与选题沉淀',
          body: '统筹多端发布节奏，把有效选题和复盘沉淀成可持续调用的内容资产（腾讯音乐）。',
        },
        {
          id: 'iterate',
          titleZh: '数据复盘与内容迭代',
          body: '发布后回头看播放与转化，留下有效结构、停掉低效做法，让下一次更快更好。',
        },
        {
          id: 'pipeline',
          titleZh: '内容全链路推进',
          body: '从构思策划到制作发布再到调优，把内容当成能持续增长的生产线来跑。',
        },
      ],
    },

    highlights: {
      titleZh: '可被转述的结果',
      titleEn: 'HIGHLIGHTS',
      footnote: '数据来自喜播、认养一头牛实习周期；完整过程见项目案例',
      items: [
        {
          id: 'fans',
          metric: '5000+',
          labelZh: '账号总增粉',
          note: '喜播 · 小红书 0–1',
        },
        {
          id: 'views',
          metric: '119w+',
          labelZh: '单篇最高浏览',
          note: '喜播 · 爆款内容',
        },
        {
          id: 'roi',
          metric: 'ROI +30%',
          labelZh: '单场直播提升',
          note: '喜播 · 复盘优化后',
        },
        {
          id: 'assets',
          metric: '300+',
          labelZh: '信息流素材',
          note: '认养一头牛 · 规模化产出',
        },
        {
          id: 'gmv',
          metric: 'GMV 28w+',
          labelZh: '单条最高带货',
          note: '认养一头牛 · ROI 2.45',
        },
        {
          id: 'cycle',
          metric: '20%+',
          labelZh: '制作周期缩短',
          note: '认养一头牛 · 流程提效',
        },
      ],
    },

    timeline: {
      titleZh: '三段实习，同一条主线',
      titleEn: 'TIMELINE',
      hint: '详细拆解 → 桌上「项目案例」',
      items: [
        {
          id: 'ximalaya',
          period: '2025.01 – 06',
          company: '喜马拉雅 · 喜播',
          role: '短视频运营',
          result: '冷启动起量；直播 ROI 提升',
        },
        {
          id: 'adopt-a-cow',
          period: '2025.07 – 11',
          company: '认养一头牛',
          role: '信息流拍剪',
          result: '规模化素材 + 流程 / 灵感库提效',
        },
        {
          id: 'tencent-music',
          period: '2025.11 – 2026.02',
          company: '腾讯音乐 · 波点',
          role: '新媒体运营',
          result: '四端矩阵 + 复盘与选题沉淀',
        },
      ],
    },

    workStyle: {
      titleZh: '我怎么做事',
      titleEn: 'HOW I WORK',
      lead: '接到一件事后，我会按这条线往下想：',
      steps: [
        {
          id: 'ask',
          labelZh: '问清楚',
          body: '先问「这条内容要解决什么问题」：给谁看、要带动什么行为。目标清楚了，再决定做不做、怎么做。',
        },
        {
          id: 'structure',
          labelZh: '拆结构',
          body: '动手前先拆：把爆款和有效案例拆成可复用结构，而不是灵感来一次做一次。有骨架，后面才好批量、好迭代。',
        },
        {
          id: 'review',
          labelZh: '看数据',
          body: '发布不是结束。我会回头看数据，判断什么该留进选题库、什么该停，用结果反推下一轮选题和制作。',
        },
        {
          id: 'system',
          labelZh: '跑顺流程',
          body: '比起证明自己什么都会，我更在意有没有把流程跑顺：沉淀可复用的方法，让下一次更快、更好、更稳。',
        },
      ],
    },
  },
}
