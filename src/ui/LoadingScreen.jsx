import { useEffect, useRef, useState } from 'react'
import { siteProfile } from '../content/profile'

export function LoadingScreen({ onFinished }) {
  const [percent, setPercent] = useState(1)
  const finishedRef = useRef(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      setPercent((current) => {
        if (current >= 100) return 100
        return current + 1
      })
    }, 8)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (percent < 100 || finishedRef.current) return undefined
    finishedRef.current = true
    const done = window.setTimeout(() => onFinished?.(), 80)
    return () => window.clearTimeout(done)
  }, [percent, onFinished])

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
