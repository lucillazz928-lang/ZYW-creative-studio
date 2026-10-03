import { useEffect, useState } from 'react'
import { siteProfile } from '../content/profile'

function clampPercent(value) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function LoadingScreen({ progress = 0 }) {
  const [shown, setShown] = useState(() => clampPercent(Math.max(progress, 6)))

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const tick = () => {
      setShown((current) => {
        if (progress >= 100) return 100
        if (reduced) return clampPercent(Math.max(current, progress, 8))
        const ceiling = progress >= 40 ? 94 : 38
        const step = current < 28 ? 1.8 : current < 62 ? 0.9 : 0.35
        return clampPercent(Math.min(ceiling, Math.max(current, progress) + step))
      })
    }

    tick()
    const id = window.setInterval(tick, reduced ? 320 : 110)
    return () => window.clearInterval(id)
  }, [progress])

  const percent = progress >= 100 ? 100 : shown

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
