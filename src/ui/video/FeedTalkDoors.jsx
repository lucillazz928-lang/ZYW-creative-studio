import { useCallback, useEffect, useState } from 'react'
import { videoMediaUrl } from '../../content/works'
import { WorkVideoPlayer } from './WorkVideoPlayer'
import './FeedTalkDoors.css'

function NextCircleIcon() {
  return (
    <svg className="feed-talk__next-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * 口播·信息流：营销号式双竖屏并排；
 * 右圆钮在「口播页 / 信息流页」之间切换；口播可在视频旁展示封面。
 */
export function FeedTalkDoors({
  categoryZh = '口播·信息流',
  titleLines = [],
  pages = [],
  active = true,
}) {
  const watermarkLines =
    titleLines.length > 0
      ? titleLines
      : categoryZh
        ? categoryZh.split(/[·/]/).map((s) => s.trim()).filter(Boolean)
        : []
  const [pageIndex, setPageIndex] = useState(0)
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    if (!active) setPlayingId(null)
  }, [active])

  useEffect(() => {
    setPageIndex(0)
    setPlayingId(null)
  }, [pages])

  const safeIndex = pages.length ? Math.min(pageIndex, pages.length - 1) : 0
  const page = pages[safeIndex]
  const clips = page?.clips?.length ? page.clips : []
  const hasMultiplePages = pages.length > 1

  const goNextPage = useCallback(() => {
    if (!hasMultiplePages) return
    setPlayingId(null)
    setPageIndex((prev) => (prev + 1) % pages.length)
  }, [hasMultiplePages, pages.length])

  const onPlayingChange = useCallback((id, nextPlaying) => {
    setPlayingId(nextPlaying ? id : null)
  }, [])

  if (!pages.length) {
    return (
      <div className="feed-talk feed-talk--empty">
        <p>暂无视频</p>
      </div>
    )
  }

  return (
    <div className="feed-talk" aria-label={`${categoryZh} 视频`}>
      {watermarkLines.length ? (
        <p className="feed-talk__watermark" aria-hidden="true">
          {watermarkLines.map((line) => (
            <span key={line} className="feed-talk__watermark-line">
              {line}
            </span>
          ))}
        </p>
      ) : null}

      <header className="feed-talk__head">
        <p className="feed-talk__page-label">
          <span className="feed-talk__page-zh">{page?.labelZh}</span>
          {page?.labelEn ? <span className="feed-talk__page-en">{page.labelEn}</span> : null}
          {hasMultiplePages ? (
            <span className="feed-talk__page-num">
              {safeIndex + 1} / {pages.length}
            </span>
          ) : null}
        </p>
      </header>

      <div className="feed-talk__stage">
        {clips.length ? (
          <ul className={`feed-talk__list${clips.length >= 3 ? ' feed-talk__list--count-3' : ''}`}>
            {clips.map((clip) => {
              const src = active ? videoMediaUrl(clip.src) : ''
              return (
                <li key={clip.id} className="feed-talk__item">
                  <div className="feed-talk__player">
                    {src ? (
                        <WorkVideoPlayer
                          src={src}
                          poster={clip.poster}
                          title={clip.titleZh}
                          orientation="portrait"
                          playing={playingId === clip.id}
                          onPlayingChange={(next) => onPlayingChange(clip.id, next)}
                          active={active}
                        />
                    ) : (
                      <div className="feed-talk__poster-fallback">
                        <img src={clip.poster} alt="" draggable={false} />
                      </div>
                    )}
                  </div>
                  <p className="feed-talk__caption">
                    <span className="feed-talk__caption-zh">{clip.titleZh}</span>
                    {clip.titleEn ? (
                      <span className="feed-talk__caption-en">{clip.titleEn}</span>
                    ) : null}
                  </p>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="feed-talk__empty-hint">{page?.emptyHint || '暂无视频'}</p>
        )}

        {hasMultiplePages ? (
          <button
            type="button"
            className="feed-talk__next"
            onClick={goNextPage}
            aria-label={`切换到${pages[(safeIndex + 1) % pages.length]?.labelZh || '下一页'}`}
            title="下一页"
          >
            <NextCircleIcon />
          </button>
        ) : null}
      </div>
    </div>
  )
}
