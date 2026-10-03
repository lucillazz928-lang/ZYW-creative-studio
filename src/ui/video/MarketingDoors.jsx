import { useCallback, useEffect, useState } from 'react'
import { videoMediaUrl } from '../../content/works'
import { WorkVideoPlayer } from './WorkVideoPlayer'
import './MarketingDoors.css'

/**
 * 营销号展开态：双竖屏视频并排；点播互斥，带进度与音量。
 */
export function MarketingDoors({
  categoryZh = '营销号',
  titleLines = [],
  clips = [],
  active = true,
  frameAspect,
}) {
  const watermarkLines =
    titleLines.length > 0
      ? titleLines
      : categoryZh
        ? categoryZh.split(/[·/]/).map((s) => s.trim()).filter(Boolean)
        : []
  const [playingId, setPlayingId] = useState(null)

  useEffect(() => {
    if (!active) setPlayingId(null)
  }, [active])

  const onPlayingChange = useCallback((id, nextPlaying) => {
    setPlayingId(nextPlaying ? id : null)
  }, [])

  if (!clips.length) {
    return (
      <div className="mkt-doors mkt-doors--empty">
        <p>暂无视频</p>
      </div>
    )
  }

  return (
    <div className="mkt-doors" aria-label={`${categoryZh} 视频`}>
      {watermarkLines.length ? (
        <p className="mkt-doors__watermark" aria-hidden="true">
          {watermarkLines.map((line) => (
            <span key={line} className="mkt-doors__watermark-line">
              {line}
            </span>
          ))}
        </p>
      ) : null}

      <ul className="mkt-doors__list">
        {clips.map((clip) => {
          const src = active ? videoMediaUrl(clip.src) : ''
          return (
            <li key={clip.id} className="mkt-doors__item">
              {src ? (
                <WorkVideoPlayer
                  src={src}
                  poster={clip.poster}
                  title={clip.titleZh}
                  orientation="portrait"
                  fixedAspect={frameAspect}
                  letterboxPoster
                  playing={playingId === clip.id}
                  onPlayingChange={(next) => onPlayingChange(clip.id, next)}
                  active={active}
                />
              ) : (
                <div
                  className="mkt-doors__poster-fallback"
                  style={frameAspect ? { aspectRatio: String(frameAspect) } : undefined}
                >
                  <img src={clip.poster} alt="" draggable={false} />
                </div>
              )}
              <p className="mkt-doors__caption">
                <span className="mkt-doors__caption-zh">{clip.titleZh}</span>
                {clip.titleEn ? (
                  <span className="mkt-doors__caption-en">{clip.titleEn}</span>
                ) : null}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
