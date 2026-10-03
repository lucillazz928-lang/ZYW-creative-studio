import Folder from './Folder'
import { computerFolders } from '../content/projects'
import { TencentMusicCase } from './TencentMusicCase'
import { AdoptACowCase } from './AdoptACowCase'
import { XimalayaCase } from './XimalayaCase'
import adoptLabel from '../assets/content-lab/adopt-a-cow-label.png'
import tencentLabel from '../assets/content-lab/tencent-music-label.png'
import ximalayaLabel from '../assets/content-lab/ximalaya-label.png'
import sparkGreen from '../assets/content-lab/spark-green.png'
import sparkCream from '../assets/content-lab/spark-cream.png'

const FOLDER_BASE_W = 100
const FOLDER_BASE_H = 80

const LABEL_SRC = {
  'adopt-a-cow': adoptLabel,
  'tencent-music': tencentLabel,
  ximalaya: ximalayaLabel,
}

const CASE_TITLE = {
  'adopt-a-cow': '认养一头牛项目案例',
  'tencent-music': '腾讯音乐项目案例',
  ximalaya: '喜马拉雅项目案例',
}

/** 已接入详情页的文件夹 */
const CASE_READY = new Set(['tencent-music', 'adopt-a-cow', 'ximalaya'])

export function ContentLab({ activeCase, onOpenCase, onBackCase, casePage, onCasePageChange }) {
  if (activeCase === 'tencent-music') {
    return (
      <TencentMusicCase
        onBack={onBackCase}
        page={casePage}
        onPageChange={onCasePageChange}
      />
    )
  }

  if (activeCase === 'adopt-a-cow') {
    return (
      <AdoptACowCase
        onBack={onBackCase}
        page={casePage}
        onPageChange={onCasePageChange}
      />
    )
  }

  if (activeCase === 'ximalaya') {
    return (
      <XimalayaCase
        onBack={onBackCase}
        page={casePage}
        onPageChange={onCasePageChange}
      />
    )
  }

  return (
    <div className="content-lab" aria-label="作品文件夹">
      <img
        className="content-lab__spark content-lab__spark--a"
        src={sparkGreen}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <img
        className="content-lab__spark content-lab__spark--b"
        src={sparkCream}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      {computerFolders.map((folder) => {
        const opensCase = CASE_READY.has(folder.id)
        return (
          <div
            key={folder.id}
            className={`content-lab__card content-lab__card--${folder.id}${opensCase ? ' content-lab__card--case' : ''}`}
            style={{
              '--rot': `${folder.rotate}deg`,
              zIndex: folder.zIndex,
            }}
          >
            <div
              className="content-lab__folder-box"
              style={{
                width: FOLDER_BASE_W * folder.size,
                height: FOLDER_BASE_H * folder.size,
              }}
            >
              <Folder
                size={folder.size}
                color={folder.color}
                className="content-lab__folder"
                onActivate={opensCase ? () => onOpenCase?.(folder.id) : undefined}
              />
            </div>
            <div className="content-lab__caption">
              <img
                className="content-lab__label"
                src={LABEL_SRC[folder.id]}
                alt={`${folder.nameZh} ${folder.period}`}
                draggable={false}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { CASE_TITLE }
