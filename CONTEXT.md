# CONTEXT.md — 郑轶玟创意小屋作品集 · 项目交接

> 最后更新：2026-09-16  
> 用途：换会话 / 换 Agent 时先读本文，再读根目录 Word 文档与 `.cursor/rules/project.mdc`。

---

## 1. 网站目标与整体定位

- **产品形态**：可探索的 **3D 个人作品集**，不是传统栏目式官网或 Dashboard。
- **空间叙事**：推门进入「年轻创作者正在使用的小屋」，通过物件理解作品、能力与经历。
- **门牌 / 品牌**：`郑轶玟的创意小屋`（英文辅助：`Creative Studio`）。
- **第一阶段 MVP 核心路径**：  
  开门进入 → 镜头到工作台（ROOM）→ 点桌面进入约 45° 近景（DESK）→ 悬停/点击物件 → 打开 React Overlay → 关闭后回到原视角（不回门口）。
- **明确不做（MVP）**：完整 CMS、登录、复杂物理、实时光追、完整 OS/文件管理器、深度 SEO、多语言、移动端复杂 3D 手势。  
  **已破例并冻结**：留言墙全站共享（Supabase）；去掉 RESUME 入口；手机同一套 3D + 点击、无复杂手势；Playground 二期。

---

## 2. 技术栈与运行环境

| 层级 | 技术 |
|------|------|
| 应用 | React 19.2.4 + Vite 7 |
| 3D | Three.js + React Three Fiber + Drei |
| 动画 | GSAP（门 / 镜头 / 物件 / 主 UI）；CSS 仅基础样式与短过渡 |
| 状态 | React Context（`interactionState`），不引入 Redux/Zustand |
| Overlay | React + HTML + CSS（白半透明模糊层） |
| 后端 | Supabase（留言墙 `wall_notes`） |
| Node | 建议 Node 22+ |

**本地命令：**

```bash
npm install
npm run dev      # http://127.0.0.1:5173/
npm run build
```

**环境变量（根目录 `.env`，已 gitignore）：**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**文档优先级（开发必须遵守）：**

1. `个人创意工作空间网站开发计划.docx`（plan，最高）
2. 模糊时再参考：风格 / 技术 / 主体框架 Word 文档
3. 禁止私自新增功能、改配色/布局/交互；冲突先问用户

---

## 3. 已完成的页面 / 模块

### 阶段 1 — 工程基座 ✅
- Vite + React + R3F + Drei + GSAP + Three
- `InteractionContext` 状态机与守卫
- Loading / OverlayShell / Tooltip / Unsupported / ErrorBoundary
- 全局 CSS 变量与 Overlay 壳

### 阶段 2 — 灰盒场景 ✅（占位几何体，非正式美术）
- ENTRY 店面：遮阳篷、木门、橱窗、盆栽、弧形标题 UI
- ROOM / DESK 镜头 GSAP 过渡；DESK 点空白墙 / Esc 回 ROOM；ROOM 点后面白墙 / Esc 回第一幕（关门）
- 一级物件占位：电脑、作品合集、研究板、ID CARD、留言墙、便签/咖啡/抽屉/植物灯

### 留言墙（交互层一部分）✅
- Overlay：写留言、8 色便签、拖动摆放、Supabase 读写 + Realtime
- 全景（ROOM）与近景（DESK）均可点墙上留言板打开
- SQL：`supabase/wall_notes.sql`、`supabase/wall_notes_colors.sql`

### 阶段 4a — 程序化正式美术 ✅（跳过阶段 3 优先；非 GLB）
- 用户确认：跳过阶段 3，选 A（Three.js 几何精修，不引入 GLB）
- 共享色板 `scenePalette.js`；入口店面/门/桌/墙地/电脑/留言墙/合集/研究板/ID CARD/氛围物均已升级
- Canvas 开启 shadows；台灯点光 + 下午自然光补光
- **风格手法（2026-09-16）**：借参考图粘土感——`RoundedBox` 圆角 + 哑光高 roughness + `ContactShadows` 柔光；**色板仍暖木小屋**（非粉蓝储物柜）
- **未做**：真实 GLB 替换（若以后要，可再接 useGLTF）
- 抽屉已按用户要求移除；电脑放大；ID CARD 平放电脑右侧

### 未完成（阶段 3 / 4b+）
- Computer 完整 CONTENT LABORATORY（三公司文件夹 + 案例 + 内嵌视频）
- 作品合集（相册） / Research / ID CARD 内容骨架细化
- （可选）GLB 替换、性能与移动端打磨、部署

---

## 4. 当前待解决 / 待确认问题

| 项 | 状态 | 说明 |
|----|------|------|
| 入口手写字体微调 | 暂缓 | 已用 Zhi Mang Xing 弧形 SVG；用户说「之后再调字体」 |
| Computer Overlay 内容 | 待做 | 文件夹名：认养一头牛 / 腾讯音乐 / 喜马拉雅；视频内嵌 |
| RESUME | 已去掉 | 场景与入口不再做 |
| Creative Playground | 二期 | Computer 不放平面/视频作品集 |
| 正式 3D 资产（程序化） | ✅ | 2026-09-16 完成；GLB 仍可选后续 |
| 留言墙新颜色 | 需用户跑 SQL | 若未执行 `wall_notes_colors.sql`，新色写入可能失败 |
| 视频体积 | 待处理 | `内容实验室/` 与 `个人作品/` 内有大量大体积 mp4，接入时需压缩/挑选 |

---

## 5. 关键文件及其作用

```
个人作品集网站版/
├── CONTEXT.md                 # 本交接文档
├── .cursor/rules/project.mdc  # Agent 长期规则
├── .env / .env.example        # Supabase 配置
├── package.json / vite.config.js / index.html
├── supabase/
│   ├── wall_notes.sql         # 建表 + RLS + Realtime
│   └── wall_notes_colors.sql  # 扩展便签颜色约束
├── src/
│   ├── App.jsx                # Canvas + UI 层 + 状态壳
│   ├── main.jsx
│   ├── styles/global.css      # 全局变量与 Overlay/入口/留言墙样式
│   ├── state/interactionState.jsx
│   ├── lib/supabase.js / wallNotes.js
│   ├── content/               # profile / projects / messages / interactiveObjects
│   ├── animation/             # camera / door / object + presets
│   ├── scenes/EntryScene.jsx / RoomScene.jsx
│   ├── components/Scene/      # Storefront Door Desk Computer Props BlankWall scenePalette ...
│   └── ui/                    # Overlay MessageWall EntryTitle Loading ...
├── 内容实验室/                # 三案例素材（视频/图）
├── 个人作品/ / hero/ ...      # 素材与参考（未全部接入）
└── *.docx                     # 原始需求文档（plan/style/tech/structure）
```

**镜头状态：** `entry` → `room` → `desk` ↔ `focus`（Overlay）；DESK 可回 `room`；ROOM 可回 `entry`（关门）。

**物件映射（冻结）：**

| 物件 | Overlay | 交付 |
|------|---------|------|
| Computer | content-lab | 完整（阶段 3） |
| 作品合集（原 Sketchbook） | creative-process | 骨架；后续相册形式 |
| Research Board | data-evidence | 骨架 |
| ID CARD | identity | 翻转+联系（邮箱/手机公开） |
| MESSAGE WALL | message-wall | 可拖可写全站共享 |
| RESUME | — | 不做 |
| Sticky/Coffee/Drawer | — | 氛围，不阻塞 |

---

## 6. 设计风格约定

### 视觉关键词
温暖、年轻、有生命力、半写实轻卡通；下午自然光；**70% 创作 / 30% 生活**。  
避免：工业金属、黑电竞桌、赛博蓝光、企业官网感、过度游戏化任务条。

### CSS 变量（`global.css`）
- 米白 / 暖白：`--color-warm-white` `#f6f1e8`；入口墙奶白 `#fffdfa`
- 浅木：`--color-wood` / 门色约 `#c49a6c`
- 植物绿：`--color-plant-green`
- 柔和蓝：`--color-soft-blue`；入口天空/背景偏米色 `#f3ebe0`
- 便签点缀：黄 / 橙 / 粉 + 绿 / 清 / 紫 / 桃
- Overlay：白半透明 + `backdrop-filter` 模糊
- 正文：`Noto Sans SC`；入口弧形标题：`Zhi Mang Xing`（可再换）
- 中文叙事 + 英文小标签（如 `CONTENT LABORATORY`）

### 交互
- Hover：缩放约 1.03–1.05，轻上浮（桌面近景）
- 主要动效用 GSAP；`prefers-reduced-motion` 需缩短/跳过非必要镜头动画
- 无「返回全景」按钮；DESK 点空白墙或 Esc 回 ROOM；ROOM 点后面白墙或 Esc 回第一幕（店门关上）
- 留言墙 ROOM 可直接点开，勿用大透明层挡墙

### 入口店面
- 参考：左门右窗 + 条纹遮阳篷 + 门边盆栽 + 上方弧形标题约占画面上 1/3
- 门木质、墙奶白、门与背景不同色；店面占比不宜过大

---

## 7. 下一步计划

按 plan 分阶段；**完成一阶段停下来等用户确认**。

1. **阶段 3 — 交互与内容层（建议下一步）**
   - Computer 完整 Overlay：三公司文件夹 → 案例 → 内嵌视频
   - 其余入口可点可关骨架
   - Hover/点击/关闭恢复统一
2. **阶段 4b —（可选）GLB / 内容导入**
   - 若程序化美术不够：再接 GLB；导入项目/研究/身份内容素材
3. **阶段 5 — 性能与适配**
   - 压缩、DPR、加载策略；手机同套 3D + 点击
4. **阶段 6 — 测试与上线**
   - 验收 A01–A07；部署与监控

**字体微调**：用户指定「之后再调」，阶段 3 不要主动大改入口字体，除非用户要求。

---

## 8. 用户冻结决策速查

- 门牌文案：`郑轶玟的创意小屋`
- 去掉 RESUME
- 留言墙：全站共享（Supabase），可拖可写
- 手机：3D + 点击，无复杂手势
- Playground：二期
- Computer：仅三公司案例文件夹，不含个人作品 Playground
- 视频：内嵌播放
- 邮箱 / 手机号：公开上线
