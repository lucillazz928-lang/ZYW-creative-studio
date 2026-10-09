import { useCallback, useEffect, useRef, useState } from 'react'
import { aiWorksIntro, aiWorksItems } from '../content/works'
import './AiWorksReel.css'

function PlayIcon() {
  return (
    <svg className="ai-reel__play-icon" viewBox="0 0 64 64" aria-hidden="true">
      <polygon points="24,16 52,32 24,48" />
    </svg>
  )
}

function getClips(item) {
  if (Array.isArray(item.videos) && item.videos.length > 0) {
    return item.videos.map((clip, index) => ({
      key: `${item.id}-${index}`,
      src: clip.src,
      poster: clip.poster,
      alt: clip.alt || `${item.titleZh} ${index + 1}`,
    }))
  }
  if (item.video) {
    return [
      {
        key: item.id,
        src: item.video,
        poster: item.poster,
        alt: item.posterAlt || item.titleZh,
      },
    ]
  }
  return []
}

function AiClipPlayer({ clip, isPlaying, onToggle, portrait = false }) {
  const videoRef = useRef(null)
  const [aspect, setAspect] = useState(portrait ? 9 / 16 : 16 / 9)
  const [buffering, setBuffering] = useState(false)
  useEffect(() => {
    setAspect(portrait ? 9 / 16 : 16 / 9)
    setBuffering(false)
  }, [clip.src, portrait])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    if (!isPlaying) {
      video.pause()
      setBuffering(false)
      return undefined
    }

    setBuffering(true)
    const playPromise = video.play()
    if (playPromise?.then) {
      playPromise
        .then(() => setBuffering(false))
        .catch(() => {
          setBuffering(false)
          onToggle(clip.key, false)
        })
    }

    return undefined
  }, [isPlaying, clip.src, clip.key, onToggle])

  const onLoadedMeta = () => {
    const video = videoRef.current
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) return
    setAspect(video.videoWidth / video.videoHeight)
  }

  return (
    <button
      type="button"
      className={`ai-reel__player${isPlaying ? ' is-playing' : ''}${buffering ? ' is-buffering' : ''}${portrait ? ' ai-reel__player--portrait' : ''}`}
      style={{ aspectRatio: String(aspect), ['--ai-ar']: String(aspect) }}
      onClick={() => {
        const next = !isPlaying
        onToggle(clip.key, next)
        const video = videoRef.current
        if (!video) return
        if (!next) {
          video.pause()
          setBuffering(false)
          return
        }
        setBuffering(true)
        const playPromise = video.play()
        if (!playPromise?.then) return
        playPromise
          .then(() => setBuffering(false))
          .catch(() => {
            setBuffering(false)
            onToggle(clip.key, false)
          })
      }}
      aria-label={buffering ? `正在加载 ${clip.alt}` : isPlaying ? `暂停 ${clip.alt}` : `播放 ${clip.alt}`}
      aria-busy={buffering}
    >
      <video
        ref={videoRef}
        className="ai-reel__video"
        src={clip.src}
        poster={clip.poster}
        playsInline
        preload="metadata"
        onLoadedMetadata={onLoadedMeta}
        onEnded={() => onToggle(clip.key, false)}
        aria-hidden="true"
      />
      <span className="ai-reel__play" aria-hidden="true">
        {buffering ? <span className="ai-reel__status">加载中</span> : <PlayIcon />}
      </span>
    </button>
  )
}

function AiWorkRow({ item, playingId, onToggle }) {
  const clips = getClips(item)
  const isRow = item.layout === 'row' && clips.length > 1

  return (
    <article className={`ai-reel__row${isRow ? ' ai-reel__row--clips' : ''}`}>
      <div className="ai-reel__copy">
        <p className="ai-reel__index" aria-hidden="true">
          {item.index}
          <span className="ai-reel__index-dot"> ·</span>
        </p>
        <h2 className="ai-reel__title">
          {item.titleSrc ? (
            <img
              className="ai-reel__title-img"
              src={item.titleSrc}
              alt={`${item.titleZh}${item.subtitle ? ` · ${item.subtitle}` : ''}`}
              draggable={false}
            />
          ) : (
            <>
              <span className="ai-reel__title-main">{item.titleZh}</span>
              {item.subtitle ? <span className="ai-reel__title-sub">{item.subtitle}</span> : null}
            </>
          )}
        </h2>
      </div>

      <div className={`ai-reel__media${isRow ? ' ai-reel__media--row' : ''}`}>
        {clips.map((clip) => (
          <AiClipPlayer
            key={clip.key}
            clip={clip}
            isPlaying={playingId === clip.key}
            onToggle={onToggle}
            portrait={isRow}
          />
        ))}
      </div>
    </article>
  )
}

/**
 * AI 作品：左文右视频、纵向滚动列表
 * @param {{ onClose: () => void }} props
 */
export function AiWorksReel({ onClose }) {
  const [playingId, setPlayingId] = useState(null)

  const onToggle = useCallback((id, shouldPlay) => {
    setPlayingId(shouldPlay ? id : null)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (playingId) {
        setPlayingId(null)
        return
      }
      onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [onClose, playingId])

  return (
    <div className="ai-reel" aria-label={aiWorksIntro.ariaLabel}>
      <button type="button" className="ai-reel__back" onClick={onClose}>
        {aiWorksIntro.backLabel}
      </button>

      <div className="ai-reel__scroll">
        {aiWorksItems.map((item) => (
          <AiWorkRow key={item.id} item={item} playingId={playingId} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}
