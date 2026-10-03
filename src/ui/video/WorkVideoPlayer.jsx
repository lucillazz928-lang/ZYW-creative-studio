import { useEffect, useId, useRef, useState } from 'react'
import './WorkVideoPlayer.css'

function PlayIcon() {
  return (
    <svg className="work-vp__icon" viewBox="0 0 64 64" aria-hidden="true">
      <polygon points="24,16 52,32 24,48" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg className="work-vp__icon work-vp__icon--pause" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="18" y="14" width="10" height="36" rx="2" />
      <rect x="36" y="14" width="10" height="36" rx="2" />
    </svg>
  )
}

function VolumeIcon({ muted, level }) {
  if (muted || level <= 0.01) {
    return (
      <svg className="work-vp__vol-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9v6h3.5L12 19V5L7.5 9H4z" fill="currentColor" />
        <path
          d="M16.5 9.5l4 4m0-4l-4 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg className="work-vp__vol-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9v6h3.5L12 19V5L7.5 9H4z" fill="currentColor" />
      <path
        d="M15.5 9.5a3.2 3.2 0 010 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {level > 0.45 ? (
        <path
          d="M17.8 7a5.6 5.6 0 010 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  )
}

/**
 * 作品视频播放器：点播；悬停底部蒙版显示进度；喇叭悬停弹出竖向音量。
 */
export function WorkVideoPlayer({
  src,
  poster,
  title = '视频',
  orientation = 'landscape',
  playing = false,
  onPlayingChange,
  active = true,
  /** 有外链时：点击播放不内嵌，改为新标签打开 */
  externalUrl,
  /** 有封面时单独铺一层；letterboxPoster=true 时在 9:16 画框内按原图比例居中，上下留黑 */
  letterboxPoster = false,
  /** 锁定画框宽高比（宽/高）。传入后不再跟成片元数据改高度，便于并排卡片对齐。 */
  fixedAspect,
}) {
  const videoRef = useRef(null)
  const progressId = useId()
  const volumeId = useId()
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [muted, setMuted] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [volOpen, setVolOpen] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const fallbackAspect = orientation === 'portrait' ? 9 / 16 : 16 / 9
  const lockedAspect = Number.isFinite(fixedAspect) && fixedAspect > 0 ? fixedAspect : null
  const [aspect, setAspect] = useState(lockedAspect ?? fallbackAspect)

  useEffect(() => {
    setAspect(lockedAspect ?? (orientation === 'portrait' ? 9 / 16 : 16 / 9))
    setHasStarted(false)
  }, [orientation, src, lockedAspect])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    if (!active) {
      video.pause()
      return undefined
    }

    if (playing) {
      setHasStarted(true)
      const playPromise = video.play()
      if (playPromise?.catch) playPromise.catch(() => onPlayingChange?.(false))
    } else {
      video.pause()
    }

    return undefined
  }, [playing, active, onPlayingChange, src])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = volume
    video.muted = muted
  }, [volume, muted])

  useEffect(() => {
    if (!active && playing) onPlayingChange?.(false)
  }, [active, playing, onPlayingChange])

  useEffect(() => {
    if (!active) setHasStarted(false)
  }, [active])

  const togglePlay = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
      return
    }
    onPlayingChange?.(!playing)
  }

  const onTimeUpdate = () => {
    const video = videoRef.current
    if (!video || scrubbing || !video.duration) return
    setCurrentTime(video.currentTime)
    setProgress(video.currentTime / video.duration)
  }

  const onLoadedMeta = () => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration || 0)
    if (lockedAspect) return
    // 优先用真实宽高，保持原片比例
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setAspect(video.videoWidth / video.videoHeight)
    } else {
      setAspect(orientation === 'portrait' ? 9 / 16 : 16 / 9)
    }
  }

  const onEnded = () => {
    onPlayingChange?.(false)
    setProgress(0)
    setCurrentTime(0)
    setHasStarted(false)
  }

  const seekToRatio = (ratio) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const next = Math.min(1, Math.max(0, ratio))
    const time = next * video.duration
    video.currentTime = time
    setCurrentTime(time)
    setProgress(next)
    if (time > 0) setHasStarted(true)
  }

  const onProgressInput = (event) => {
    seekToRatio(Number(event.target.value) / 100)
  }

  const onVolumeInput = (event) => {
    const next = Number(event.target.value) / 100
    setVolume(next)
    setMuted(next <= 0.01)
  }

  const toggleMute = () => {
    if (muted || volume <= 0.01) {
      setMuted(false)
      if (volume <= 0.01) setVolume(0.7)
    } else {
      setMuted(true)
    }
  }

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const showChrome = !externalUrl && (hovered || scrubbing || volOpen)
  const showPosterLayer = Boolean(letterboxPoster && poster && !playing && !hasStarted)

  return (
    <div
      className={`work-vp work-vp--${orientation}${playing ? ' is-playing' : ''}${showChrome ? ' is-chrome' : ''}${letterboxPoster ? ' work-vp--letterbox-poster' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setVolOpen(false)
      }}
    >
      <div
        className="work-vp__stage"
        style={{
          aspectRatio: String(aspect),
          ['--wp-ar']: String(aspect),
        }}
      >
        <video
          ref={videoRef}
          className="work-vp__video"
          src={src || undefined}
          poster={letterboxPoster ? undefined : poster}
          playsInline
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMeta}
          onEnded={onEnded}
          onClick={togglePlay}
          aria-label={title}
        />

        {showPosterLayer ? (
          <img
            className="work-vp__poster-layer"
            src={poster}
            alt=""
            draggable={false}
            onClick={togglePlay}
          />
        ) : null}

        <button
          type="button"
          className={`work-vp__play${playing && !externalUrl ? ' is-hidden' : ''}${playing && hovered && !externalUrl ? ' is-hint' : ''}`}
          onClick={togglePlay}
          aria-label={externalUrl ? `在新标签打开 ${title}` : playing ? `暂停 ${title}` : `播放 ${title}`}
        >
          {playing && !externalUrl ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div
          className={`work-vp__overlay${showChrome ? ' is-visible' : ''}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="work-vp__overlay-row">
            <span className="work-vp__time" aria-hidden="true">
              {formatTime(currentTime)}
            </span>
            <label
              className="work-vp__progress"
              htmlFor={progressId}
              style={{ '--wp-progress': `${progress * 100}%` }}
            >
              <span className="visually-hidden">播放进度</span>
              <input
                id={progressId}
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress * 100}
                onChange={onProgressInput}
                onPointerDown={() => setScrubbing(true)}
                onPointerUp={() => setScrubbing(false)}
                onPointerCancel={() => setScrubbing(false)}
                aria-valuetext={`${Math.round(progress * 100)}%`}
              />
            </label>
            <span className="work-vp__time" aria-hidden="true">
              {formatTime(duration)}
            </span>

            <div
              className={`work-vp__volume${volOpen ? ' is-open' : ''}`}
              onMouseEnter={() => setVolOpen(true)}
              onMouseLeave={() => setVolOpen(false)}
            >
              <div className="work-vp__vol-popup" aria-hidden={!volOpen}>
                <label className="work-vp__vol-slider" htmlFor={volumeId}>
                  <span className="visually-hidden">音量</span>
                  <input
                    id={volumeId}
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={muted ? 0 : volume * 100}
                    onChange={onVolumeInput}
                    style={{ '--wp-vol': `${muted ? 0 : volume * 100}%` }}
                  />
                </label>
              </div>
              <button
                type="button"
                className="work-vp__mute"
                onClick={toggleMute}
                aria-label={muted || volume <= 0.01 ? '取消静音' : '静音'}
              >
                <VolumeIcon muted={muted} level={volume} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
