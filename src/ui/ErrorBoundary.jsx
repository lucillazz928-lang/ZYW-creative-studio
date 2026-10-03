import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="screen-panel" aria-live="assertive">
          <p className="en-label">Something went wrong</p>
          <h1>小屋暂时打不开</h1>
          <p>页面遇到错误。请刷新后重试。</p>
          <button className="retry-button" type="button" onClick={() => window.location.reload()}>
            重新进入
          </button>
        </section>
      )
    }

    return this.props.children
  }
}
