import { useCallback, useEffect, useState } from 'react'
import { videoMediaUrl } from '../../content/works'
import { WorkVideoPlayer } from './WorkVideoPlayer'
import './CategoryVideoPoster.css'

function NextCircleIcon() {
  return (
    <svg className="cat-video__next-icon" viewBox="0 0 24 24" aria-hidden="true">
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
 * 非营销号分类：中间只展示一支视频；多支时右侧圆钮切下一页。
 */
export function CategoryVideoPoster({ item, active = true }) {
  const clips = item.clips?.length ? item.clips : []
  const [index, setIndex] = useState(0)
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    setIndex(0)
    setPlayingId(null)
  }, [item.id])

  useEffect(() => {
    if (!active) setPlayingId(null)
  }, [active])

  useEffect(() => {
    if (index >= clips.length) setIndex(0)
  }, [clips.length, index])

  const clip = clips[Math.min(index, Math.max(clips.length - 1, 0))]
  const hasMultiple = clips.length > 1

  const goNext = useCallback(() => {
    if (!hasMultiple) return
    setPlayingId(null)
    setIndex((prev) => (prev + 1) % clips.length)
  }, [clips.length, hasMultiple])

  const onPlayingChange = useCallback((id, nextPlaying) => {
    setPlayingId(nextPlaying ? id : null)
  }, [])

  const watermarkLines =
    item.title?.length > 0
      ? item.title
      : item.barTitle
        ? item.barTitle.split(/[·/]/).map((s) => s.trim()).filter(Boolean)
        : []

  if (!clips.length || !clip) {
    return (
      <div className="cat-video cat-video--empty" aria-label={`${item.barTitle} 视频`}>
        {watermarkLines.length ? (
          <p className="cat-video__watermark" aria-hidden="true">
            {watermarkLines.map((line) => (
              <span key={line} className="cat-video__watermark-line">
                {line}
              </span>
            ))}
          </p>
        ) : null}
        <p className="cat-video__empty-hint">{item.emptyHint || '暂无视频'}</p>
      </div>
    )
  }

  const src = active ? videoMediaUrl(clip.src) : ''

  return (
    <div className="cat-video" aria-label={`${item.barTitle} 视频`}>
      {watermarkLines.length ? (
        <p className="cat-video__watermark" aria-hidden="true">
          {watermarkLines.map((line) => (
            <span key={line} className="cat-video__watermark-line">
              {line}
            </span>
          ))}
        </p>
      ) : null}

      <div className="cat-video__stage">
        <div className="cat-video__media">
          {src ? (
            <WorkVideoPlayer
              key={clip.id}
              src={src}
              poster={clip.poster || item.poster}
              title={clip.titleZh}
              orientation="landscape"
              playing={playingId === clip.id}
              onPlayingChange={(next) => onPlayingChange(clip.id, next)}
              active={active}
            />
          ) : (
            <div className="cat-video__poster-fallback">
              <img src={clip.poster || item.poster} alt="" draggable={false} />
            </div>
          )}

          {hasMultiple ? (
            <button
              type="button"
              className="cat-video__next"
              onClick={goNext}
              aria-label={`下一支视频（${index + 1}/${clips.length}）`}
              title="下一支视频"
            >
              <NextCircleIcon />
            </button>
          ) : null}
        </div>

        <p className="cat-video__caption">
          <span className="cat-video__caption-zh">{clip.titleZh}</span>
          {clip.titleEn ? (
            <span className="cat-video__caption-en">{clip.titleEn}</span>
          ) : null}
          {hasMultiple ? (
            <span className="cat-video__page">
              {index + 1} / {clips.length}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  )
}
