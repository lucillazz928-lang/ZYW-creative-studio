import { useEffect, useRef, useState } from 'react'
import { siteProfile } from '../content/profile'

const CRAWL_MS = 1600

export function LoadingScreen({ assetsReady = false, onFinished }) {
  const [percent, setPercent] = useState(1)
  const readyRef = useRef(assetsReady)
  const finishedRef = useRef(false)
  const onFinishedRef = useRef(onFinished)
  readyRef.current = assetsReady
  onFinishedRef.current = onFinished

  useEffect(() => {
    const started = performance.now()
    let shown = 1
    let raf = 0

    const loop = (now) => {
      const elapsed = now - started
      const crawled = Math.min(90, 1 + Math.floor((elapsed / CRAWL_MS) * 89))
      const target = readyRef.current ? 100 : crawled
      if (shown < target) {
        shown += 1
        setPercent(shown)
      }
      if (shown < 100) {
        raf = window.requestAnimationFrame(loop)
      }
    }

    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (percent < 100 || finishedRef.current) return undefined
    finishedRef.current = true
    const done = window.setTimeout(() => onFinishedRef.current?.(), 60)
    return () => window.clearTimeout(done)
  }, [percent])

  return (
    <section className="screen-panel" aria-busy="true" aria-live="polite">
      <p className="en-label">{siteProfile.doorPlateEn}</p>
      <h1>{siteProfile.doorPlateZh}</h1>
      <p>正在打开小屋…</p>
      <div className="progress-row">
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="progress-value" style={{ width: `${percent}%` }} />
        </div>
        <span className="progress-percent">{percent}%</span>
      </div>
    </section>
  )
}
