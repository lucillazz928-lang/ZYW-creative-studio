/**
 * 一级交互入口。桌面布局对齐用户标注：
 * 作品集左 | 咖啡靠键盘左 | idcard 左前 | 书架右 | 留言墙洞洞板
 */
export const interactiveObjects = [
  {
    id: 'computer',
    labelZh: '项目案例',
    labelEn: 'PROJECTS',
    position: [0.05, 1.05, -0.22],
    hover: true,
    click: true,
    overlay: 'content-lab',
    cameraFocus: true,
  },
  {
    id: 'sketchbook',
    labelZh: '个人作品',
    labelEn: 'WORKS',
    // 键盘左侧，整体偏左
    position: [-0.72, 0.82, 0.22],
    hover: true,
    click: true,
    overlay: 'creative-process',
    cameraFocus: false,
  },
  {
    id: 'research-board',
    labelZh: '个人技能',
    labelEn: 'SKILLS',
    // 显示器右侧桌面：文件架（约电脑一半大小）
    position: [0.88, 0.785, -0.02],
    hover: true,
    click: true,
    overlay: 'data-evidence',
    cameraFocus: false,
    scaleOnHover: false,
  },
  {
    id: 'id-card',
    labelZh: '基本信息',
    labelEn: 'ABOUT',
    // 右前偏上，避开鼠标垫
    position: [0.72, 0.8, 0.36],
    hover: true,
    click: true,
    overlay: 'identity',
    cameraFocus: false,
  },
  {
    id: 'message-wall',
    labelZh: '留言墙',
    labelEn: 'MESSAGE WALL',
    position: [1.05, 1.35, -1.12],
    hover: true,
    click: true,
    overlay: 'message-wall',
    cameraFocus: false,
    persist: true,
    draggable: true,
  },
  {
    id: 'coffee',
    labelZh: '咖啡杯',
    labelEn: 'COFFEE',
    // 红框：台灯与显示器底座之间
    position: [-0.62, 0.87, -0.28],
    hover: true,
    click: false,
    overlay: null,
    cameraFocus: false,
    ambient: true,
  },
]
