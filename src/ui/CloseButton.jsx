import { forwardRef } from 'react'

export const CloseButton = forwardRef(function CloseButton({ onClick }, ref) {
  return (
    <button
      ref={ref}
      className="close-button"
      type="button"
      onClick={onClick}
      aria-label="关闭内容层"
    >
      ×
    </button>
  )
})
