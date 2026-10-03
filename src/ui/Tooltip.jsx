export function Tooltip({ title, subtitle = 'Click to Explore' }) {
  if (!title) return null

  return (
    <div className="tooltip" role="status">
      <strong>{title}</strong>
      <span className="en-label">{subtitle}</span>
    </div>
  )
}
