import { siteProfile } from '../content/profile'

export function LoadingScreen({ progress = 0 }) {
  return (
    <section className="screen-panel" aria-busy="true" aria-live="polite">
      <p className="en-label">{siteProfile.doorPlateEn}</p>
      <h1>{siteProfile.doorPlateZh}</h1>
      <p>正在打开小屋…</p>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <div className="progress-value" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </section>
  )
}
