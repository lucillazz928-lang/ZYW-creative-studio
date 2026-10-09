import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WorkVideoPlayer } from './video/WorkVideoPlayer'
import './TencentMusicCase.css'

gsap.registerPlugin(ScrollTrigger)

const MOBILE_MQ = '(max-width: 900px)'
const PAGE_HOME = 'home'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isMobileLayout() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
}

/** 去掉「01 · 」类编号前缀，只保留英文标签 */
function stripSectionIndex(labelEn) {
  return String(labelEn || '').replace(/^\d+\s*·\s*/, '')
}

function NextCircleIcon() {
  return (
    <svg className="tm-vcarousel__next-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 5l8 7-8 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StageChevron({ direction }) {
  const isUp = direction === 'up'
  return (
    <svg className="tm-stage__chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={isUp ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VideoCarousel({ items, playingId, onPlay }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    onPlay(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useEffect(() => {
    if (index >= items.length) setIndex(0)
  }, [items.length, index])

  if (!items?.length) return null

  const clip = items[Math.min(index, items.length - 1)]
  const hasMultiple = items.length > 1
  const orientation = clip.orientation || 'portrait'

  const goNext = () => {
    if (!hasMultiple) return
    onPlay(null)
    setIndex((prev) => (prev + 1) % items.length)
  }

  return (
    <div className={`tm-vcarousel tm-vcarousel--${orientation}`}>
      <div className="tm-vcarousel__stage">
        <div className="tm-vcarousel__media">
          <WorkVideoPlayer
            key={clip.id}
            src={clip.src}
            poster={clip.poster}
            title={clip.title}
            orientation={orientation}
            playing={playingId === clip.id}
            onPlayingChange={(next) => onPlay(next ? clip.id : null)}
            externalUrl={clip.externalUrl}
            letterboxPoster={Boolean(clip.letterboxPoster)}
            active
          />
        </div>
        {hasMultiple ? (
          <button
            type="button"
            className="tm-vcarousel__next"
            onClick={goNext}
            aria-label={`下一支视频（${index + 1}/${items.length}）`}
            title="下一支视频"
          >
            <NextCircleIcon />
          </button>
        ) : null}
      </div>
      {hasMultiple ? (
        <p className="tm-vcarousel__caption" aria-live="polite">
          <span className="tm-vcarousel__page">
            {index + 1} / {items.length}
          </span>
        </p>
      ) : null}
    </div>
  )
}

function WorkNavCards({ cards, onOpenPage }) {
  return (
    <section className="tm-nav" aria-label="工作内容导航">
      <p className="tm-nav__label">HOW I WORKED</p>
      <h2 className="tm-nav__title">工作内容</h2>
      <p className="tm-nav__sub">点卡片进入独立页面查看详情</p>
      <div
        className="tm-nav__row"
        style={{ '--nav-cols': String(Math.max(cards.length, 1)) }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className="tm-nav__card"
            style={{
              '--card-bg': `var(${card.colorVar})`,
              '--card-rot': `${card.rotate}deg`,
            }}
            onClick={() => onOpenPage(card.pageId)}
          >
            <span className="tm-nav__step">{card.step}</span>
            <h3 className="tm-nav__card-title">{card.titleZh}</h3>
            <p className="tm-nav__card-body">{card.body}</p>
            <span className="tm-nav__card-cta">进入页面 →</span>
          </button>
        ))}
      </div>
    </section>
  )
}

/** 子页顶栏：参照极简文字导航，跳转各工作卡片 */
function SubPageNav({ cards, currentPageId, onOpenPage }) {
  if (!cards?.length) return null
  return (
    <nav className="tm-subnav" aria-label="工作内容导航">
      {cards.map((card) => {
        const active = card.pageId === currentPageId
        return (
          <button
            key={card.id}
            type="button"
            className={`tm-subnav__link${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onOpenPage(card.pageId)}
          >
            {card.titleZh}
          </button>
        )
      })}
    </nav>
  )
}

/** 子页侧边：跳到下一张工作卡片（右中 · 竖线+文字） */
function NextCardJump({ cards, currentPageId, onOpenPage }) {
  const idx = cards.findIndex((c) => c.pageId === currentPageId)
  if (idx < 0) return null
  const next = cards[idx + 1]
  if (!next) {
    return (
      <button
        type="button"
        className="tm-page-next"
        onClick={() => onOpenPage(PAGE_HOME)}
      >
        <span className="tm-page-next__text">
          看完啦
          <em>
            返回目录
            <span className="tm-page-next__arrow" aria-hidden="true">
              →
            </span>
          </em>
        </span>
      </button>
    )
  }
  return (
    <button
      type="button"
      className="tm-page-next"
      onClick={() => onOpenPage(next.pageId)}
      aria-label={`下一张：${next.titleZh}`}
    >
      <span className="tm-page-next__text">
        下一张
        <em>
          {next.titleZh}
          <span className="tm-page-next__arrow" aria-hidden="true">
            →
          </span>
        </em>
      </span>
    </button>
  )
}

function WorkplaceBlock({ workplace }) {
  return (
    <section className="tm-work" aria-label={workplace.titleZh}>
      <p className="tm-work__label">{workplace.labelEn}</p>
      <div className="tm-work__panel">
        <figure className="tm-work__photo">
          <img
            src={workplace.image}
            alt={workplace.imageAlt}
            loading="eager"
            draggable={false}
          />
          <figcaption>{workplace.caption}</figcaption>
        </figure>
        <ul className="tm-work__meta">
          {workplace.meta.map((row) => (
            <li key={row.label}>
              <span className="tm-work__meta-k">{row.label}</span>
              <span className="tm-work__meta-v">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function PlatformStage({ stage, stackMode }) {
  const [index, setIndex] = useState(0)
  const steps = stage.steps
  const total = steps.length
  const motion = !prefersReducedMotion()

  const go = useCallback(
    (next) => {
      setIndex(((next % total) + total) % total)
    },
    [total],
  )

  useEffect(() => {
    if (stackMode) return undefined
    const onKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, stackMode])

  if (stackMode) {
    return (
      <div className="tm-stage tm-stage--stack">
        <p className="tm-stage__label">{stripSectionIndex(stage.labelEn)}</p>
        <h2 className="tm-stage__heading">{stage.titleZh}</h2>
        <p className="tm-stage__lead">{stage.body}</p>
        {steps.map((step) => (
          <article key={step.id} className="tm-stage__stack-item">
            <div className="tm-stage__visual">
              <img src={step.image} alt={step.alt || ''} loading="lazy" decoding="async" draggable={false} />
            </div>
            <p className="tm-stage__kicker">{step.kicker}</p>
            <h3 className="tm-stage__step-title">{step.titleZh}</h3>
            <p className="tm-stage__step-body">{step.body}</p>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className={`tm-stage${motion ? ' tm-stage--motion' : ''}`}>
      <div className="tm-stage__layout">
        <div className="tm-stage__panel">
          <div className="tm-stage__visual">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`tm-stage__frame${i === index ? ' is-active' : ''}`}
                aria-hidden={i !== index}
              >
                <img src={step.image} alt={step.alt || ''} loading="lazy" decoding="async" draggable={false} />
              </div>
            ))}
          </div>

          <div className="tm-stage__copy">
            <p className="tm-stage__label">{stripSectionIndex(stage.labelEn)}</p>
            <h2 className="tm-stage__heading">{stage.titleZh}</h2>
            <p className="tm-stage__lead">{stage.body}</p>

            <div className="tm-stage__steps">
              {steps.map((step, i) => (
                <div
                  key={step.id}
                  className={`tm-stage__step${i === index ? ' is-active' : ''}`}
                  aria-hidden={i !== index}
                >
                  <p className="tm-stage__kicker">{step.kicker}</p>
                  <h3 className="tm-stage__step-title">{step.titleZh}</h3>
                  <p className="tm-stage__step-body">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tm-stage__controls" aria-label="切换平台">
          <button
            type="button"
            className="tm-stage__btn"
            aria-label="上一项"
            onClick={() => go(index - 1)}
            disabled={index === 0}
          >
            <StageChevron direction="up" />
          </button>
          <div
            className="tm-stage__rail"
            role="tablist"
            aria-label="平台"
            style={{ '--stage-progress': total > 1 ? index / (total - 1) : 0 }}
          >
            <span className="tm-stage__rail-track" aria-hidden="true" />
            <span className="tm-stage__rail-fill" aria-hidden="true" />
            <span className="tm-stage__rail-thumb" aria-hidden="true" />
            {steps.map((step, i) => (
              <button
                key={step.id}
                type="button"
                className={`tm-stage__rail-hit${i === index ? ' is-active' : ''}`}
                aria-label={step.titleZh}
                aria-selected={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="tm-stage__btn"
            aria-label="下一项"
            onClick={() => go(index + 1)}
            disabled={index === total - 1}
          >
            <StageChevron direction="down" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PageShell({ children, scrollRef, className = '', footer = null }) {
  return (
    <div ref={scrollRef} className={`tm-case__scroll tm-case__scroll--page${className}`}>
      <div className="tm-page">
        {children}
        {footer}
      </div>
    </div>
  )
}

function ImageGrid({ title, images, cols = 2, bare = false }) {
  if (!images?.length) return null
  if (bare) {
    return (
      <>
        {title ? <h3 className="tm-sec__sub">{title}</h3> : null}
        <div className={`tm-shots${images.some((img) => img.wide) ? ' tm-shots--band' : ''}`}>
          {images.map((img) => (
            <figure
              key={img.id}
              className={`tm-shots__item${img.wide ? ' tm-shots__item--wide' : ''}`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" decoding="async" draggable={false} />
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
        </div>
      </>
    )
  }
  return (
    <>
      {title ? <h3 className="tm-sec__sub">{title}</h3> : null}
      <div className={`tm-grid tm-grid--${cols}`}>
        {images.map((img) => (
          <figure key={img.id} className={`tm-fig${img.wide ? ' tm-fig--wide' : ''}`}>
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" draggable={false} />
            <figcaption>{img.caption}</figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}

/** 图文对照卡：对齐腾讯音乐社媒矩阵「图 + kicker / 标题 / 说明」 */
function StoryCards({ items }) {
  if (!items?.length) return null
  return (
    <div className="tm-story">
      {items.map((item) => (
        <article key={item.id} className="tm-story__card">
          <div className="tm-story__visual">
            <img src={item.src} alt={item.alt || ''} loading="lazy" decoding="async" draggable={false} />
          </div>
          <div className="tm-story__copy">
            {item.kicker ? <p className="tm-story__kicker">{item.kicker}</p> : null}
            {item.titleZh ? <h3 className="tm-story__title">{item.titleZh}</h3> : null}
            {item.body ? <p className="tm-story__body">{item.body}</p> : null}
            {!item.titleZh && item.caption ? (
              <p className="tm-story__caption">{item.caption}</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}

/** 内容产出：上方单区展示 + 底部胶囊切换 */
function ContentStudio({ content, videoStrips, tabs, playingId, onPlay }) {
  const pageKey = content.id || content.pageId || ''
  const [tabId, setTabId] = useState(tabs[0]?.id || '')

  useEffect(() => {
    setTabId(tabs[0]?.id || '')
    onPlay(null)
  }, [pageKey, tabs, onPlay])

  useEffect(() => {
    onPlay(null)
  }, [tabId, onPlay])

  const active = tabs.find((t) => t.id === tabId) || tabs[0]
  const strip = videoStrips?.[tabId]
  const imageBucket =
    tabId === 'materials'
      ? content.materials
      : tabId === 'hits'
        ? content.hits
        : content.galleries?.[tabId]
  const useStory = Boolean(active?.layout === 'story' || imageBucket?.some((img) => img.titleZh))

  return (
    <div className="tm-studio">
      <header className="tm-studio__head">
        <p className="tm-sec__label">{stripSectionIndex(content.labelEn)}</p>
        <h2 className="tm-sec__title">{content.titleZh}</h2>
        <p className="tm-sec__body">{content.body}</p>
      </header>

      <div className={`tm-studio__panel${useStory ? ' tm-studio__panel--story' : ''}`} key={tabId}>
        {strip ? (
          <VideoCarousel items={strip.items} playingId={playingId} onPlay={onPlay} />
        ) : null}

        {!strip && imageBucket && useStory ? <StoryCards items={imageBucket} /> : null}

        {!strip && imageBucket && !useStory ? (
          <ImageGrid
            title={null}
            images={imageBucket}
            cols={imageBucket.length >= 3 ? 3 : 2}
            bare={tabId === 'hits' || Boolean(active?.bare)}
          />
        ) : null}
      </div>

      <div className="tm-studio__foot">
        <nav className="tm-capsules" aria-label="内容分区导航">
          <div className="tm-capsules__track" role="tablist">
            {tabs.map((tab) => {
              const selected = tab.id === active?.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`tm-capsules__pill${selected ? ' is-active' : ''}`}
                  onClick={() => setTabId(tab.id)}
                >
                  <span className="tm-capsules__zh">{tab.labelZh}</span>
                  <span className="tm-capsules__en">{tab.labelEn}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

function ExtraPage({ page, playingId, onPlay }) {
  if (!page) return null

  if (page.type === 'studio') {
    return (
      <ContentStudio
        key={page.id}
        content={page}
        videoStrips={page.videoStrips || {}}
        tabs={page.tabs || []}
        playingId={playingId}
        onPlay={onPlay}
      />
    )
  }

  if (page.type === 'singleVideo') {
    return (
      <div className="tm-kuwo">
        <p className="tm-sec__label">{stripSectionIndex(page.labelEn)}</p>
        <h2 className="tm-sec__title">{page.titleZh}</h2>
        <p className="tm-sec__body">{page.body}</p>
        {page.previewNote ? <span className="tm-sec__note">{page.previewNote}</span> : null}
        <VideoCarousel items={[page.video]} playingId={playingId} onPlay={onPlay} />
      </div>
    )
  }

  if (page.type === 'splitImage') {
    const img = page.image
    const media = (
      <img src={img.src} alt={img.alt} loading="lazy" decoding="async" draggable={false} />
    )
    return (
      <div className="tm-ops">
        <p className="tm-sec__label">{stripSectionIndex(page.labelEn)}</p>
        <h2 className="tm-sec__title">{page.titleZh}</h2>
        <p className="tm-sec__body">{page.body}</p>
        <figure className={`tm-shots__item tm-ops__shot${img.externalUrl ? ' is-link' : ''}`}>
          {img.externalUrl ? (
            <a
              className="tm-ops__shot-link"
              href={img.externalUrl}
              download={img.downloadName || true}
              aria-label={`${img.alt}（下载完整表格）`}
            >
              {media}
            </a>
          ) : (
            media
          )}
          <figcaption>{img.caption}</figcaption>
        </figure>
      </div>
    )
  }

  if (page.type === 'imageGrid') {
    return (
      <div
        className={`tm-gallery${page.copyDown ? ' tm-gallery--copy-down' : ''}${
          page.pageId === 'care' ? ' tm-gallery--care' : ''
        }`}
      >
        <p className="tm-sec__label">{stripSectionIndex(page.labelEn)}</p>
        <h2 className="tm-sec__title">{page.titleZh}</h2>
        <p className="tm-sec__body">{page.body}</p>
        <ImageGrid
          images={page.images}
          cols={page.cols || 2}
          bare={Boolean(page.bare)}
        />
      </div>
    )
  }

  return null
}

/**
 * 三公司共用案例壳：首页目录 + 独立子页（数据驱动）
 * themeClass: tm-case--tencent | tm-case--adopt | tm-case--ximalaya
 */
export function BrandCase({ data, themeClass = '', onBack, page = PAGE_HOME, onPageChange }) {
  const scrollRef = useRef(null)
  const [playingId, setPlayingId] = useState(null)
  const [stackStage, setStackStage] = useState(() => prefersReducedMotion() || isMobileLayout())

  const setPage = onPageChange
  const isHome = page === PAGE_HOME
  const extraPage = data.extraPages?.find((p) => p.id === page)

  useEffect(() => {
    const sync = () => setStackStage(prefersReducedMotion() || isMobileLayout())
    const mqM = window.matchMedia(MOBILE_MQ)
    const mqR = window.matchMedia('(prefers-reduced-motion: reduce)')
    sync()
    mqM.addEventListener('change', sync)
    mqR.addEventListener('change', sync)
    return () => {
      mqM.removeEventListener('change', sync)
      mqR.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    setPlayingId(null)
  }, [page])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined
    const scroller = scrollRef.current
    if (!scroller) return undefined
    const ctx = gsap.context(() => {
      scroller.querySelectorAll('.tm-case__reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              scroller,
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          },
        )
      })
      ScrollTrigger.refresh()
    }, scroller)
    return () => ctx.revert()
  }, [page, stackStage])

  const handleTopBack = () => {
    if (!isHome) {
      setPage?.(PAGE_HOME)
      return
    }
    onBack?.()
  }

  const content = data.contentSection
  const kuwo = data.kuwoSection
  const nextJump =
    !isHome && data.navCards?.length ? (
      <NextCardJump cards={data.navCards} currentPageId={page} onOpenPage={setPage} />
    ) : null

  return (
    <div className={`tm-case${themeClass ? ` ${themeClass}` : ''}`} aria-label={data.titleZh}>
      <div className={`tm-case__top${isHome ? '' : ' tm-case__top--sub'}`}>
        {isHome ? (
          <>
            <button type="button" className="tm-case__back" onClick={handleTopBack}>
              ← 返回文件夹
            </button>
            <p className="tm-case__top-meta">{data.titleEn}</p>
          </>
        ) : (
          <>
            <span className="tm-case__top-spacer" aria-hidden="true" />
            <SubPageNav cards={data.navCards} currentPageId={page} onOpenPage={setPage} />
            <button type="button" className="tm-case__back tm-case__back--end" onClick={handleTopBack}>
              返回目录 →
            </button>
          </>
        )}
      </div>

      {isHome ? (
        <div ref={scrollRef} className="tm-case__scroll">
          <header className="tm-hero">
            <p className="tm-hero__eyebrow tm-case__reveal">{data.companyEn}</p>
            <h1 className="tm-hero__title tm-case__reveal">{data.titleZh}</h1>
            <p className="tm-hero__lead tm-case__reveal">{data.heroLead}</p>
          </header>

          <div className="tm-case__reveal">
            <WorkplaceBlock workplace={data.workplace} />
          </div>

          <div className="tm-case__reveal">
            <WorkNavCards cards={data.navCards} onOpenPage={setPage} />
          </div>

          <section className="tm-sec tm-sec--home">
            <p className="tm-sec__label tm-case__reveal">RESULTS</p>
            <h2 className="tm-sec__title tm-case__reveal">项目成果速览</h2>
            <div
              className="tm-results"
              style={{ '--result-cols': String(Math.max(data.results?.length || 1, 1)) }}
            >
              {(data.results || []).map((r) => (
                <article key={r.id} className="tm-results__card tm-case__reveal">
                  <p className="tm-results__metric">{r.metric}</p>
                  <p className="tm-results__label">{r.labelZh}</p>
                  <p className="tm-results__detail">{r.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="tm-sec tm-sec--home">
            <p className="tm-sec__label tm-case__reveal">{data.reflection.labelEn}</p>
            <h2 className="tm-sec__title tm-case__reveal">{data.reflection.titleZh}</h2>
            <p className="tm-sec__body tm-case__reveal">{data.reflection.body}</p>
          </section>
          <div className="tm-case__end" aria-hidden="true" />
        </div>
      ) : null}

      {page === 'platforms' && data.platformStage ? (
        <PageShell scrollRef={scrollRef} className=" tm-case__scroll--stage">
          <PlatformStage
            stage={data.platformStage}
            stackMode={stackStage}
          />
        </PageShell>
      ) : null}

      {page === 'content' && content ? (
        <PageShell scrollRef={scrollRef} className=" tm-case__scroll--studio">
          <ContentStudio
            key={content.pageId || 'content'}
            content={content}
            videoStrips={data.videoStrips}
            tabs={data.contentTabs}
            playingId={playingId}
            onPlay={setPlayingId}
          />
        </PageShell>
      ) : null}

      {page === 'kuwo' && kuwo ? (
        <PageShell scrollRef={scrollRef} className=" tm-case__scroll--stage">
          <ExtraPage
            page={{ type: 'singleVideo', ...kuwo }}
            playingId={playingId}
            onPlay={setPlayingId}
          />
        </PageShell>
      ) : null}

      {page === 'ops' && data.ops ? (
        <PageShell scrollRef={scrollRef} className=" tm-case__scroll--stage">
          <ExtraPage page={{ type: 'splitImage', ...data.ops }} />
        </PageShell>
      ) : null}

      {page === 'care' && data.feedback ? (
        <PageShell scrollRef={scrollRef}>
          <ExtraPage page={{ type: 'imageGrid', ...data.feedback, bare: true, cols: 2 }} />
        </PageShell>
      ) : null}

      {extraPage ? (
        <PageShell
          scrollRef={scrollRef}
          className={extraPage.type === 'studio' ? ' tm-case__scroll--studio' : ''}
        >
          <ExtraPage page={extraPage} playingId={playingId} onPlay={setPlayingId} />
        </PageShell>
      ) : null}

      {nextJump ? <div className="tm-page-next-slot">{nextJump}</div> : null}
    </div>
  )
}
