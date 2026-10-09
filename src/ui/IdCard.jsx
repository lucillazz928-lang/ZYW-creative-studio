import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import portraitUrl from '../assets/props/about-portrait.jpg'
import headlineSvg from '../assets/about/hero-headline.svg'
import { siteProfile } from '../content/profile'
import CurvedLoop from './CurvedLoop'
import FolderFloat from './FolderFloat'
import './IdCard.css'

gsap.registerPlugin(ScrollTrigger)

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.left = '-9999px'
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

function CopyValue({ value, label }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(0)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const onCopy = async () => {
    try {
      await copyText(value)
      setCopied(true)
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className={`about-page__copy${copied ? ' is-copied' : ''}`}
      onClick={onCopy}
      aria-label={copied ? `${label}已复制` : `点击复制${label}`}
      title={copied ? '已复制' : '点击复制'}
    >
      <span className="about-page__copy-label">{label}</span>
      <span className="about-page__copy-value">{value}</span>
      <span className="about-page__copy-hint" aria-hidden="true">
        {copied ? '已复制' : '点击复制'}
      </span>
    </button>
  )
}

function Panel({ id, tone = 'default', children }) {
  return (
    <section className={`about-page__panel about-page__panel--${tone}`} id={id}>
      <div className="about-page__panel-body">{children}</div>
    </section>
  )
}

function SectionHead({ titleEn, titleZh }) {
  return (
    <header className="about-page__section-head">
      <p className="en-label">{titleEn}</p>
      <h3 className="about-page__section-title">{titleZh}</h3>
    </header>
  )
}

export function IdCard() {
  const scrollerRef = useRef(null)
  const timelineRef = useRef(null)
  const highlightsRef = useRef(null)
  const workFlowRef = useRef(null)
  const strengthsRef = useRef(null)
  const folderPlayed = useRef(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const { name, contact, about } = siteProfile
  const {
    photoBadge,
    selectedExperience,
    nextStop,
  } = about
  const folderItems = about.strengths.slips.map((slip) => ({
    label: slip.titleZh,
    value: slip.id,
  }))

  useEffect(() => {
    const target = strengthsRef.current
    const root = scrollerRef.current
    if (!target) return undefined

    let openTimer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || folderPlayed.current) return
        folderPlayed.current = true
        // Let the scroll settle, show the closed folder briefly, then pop.
        openTimer = window.setTimeout(() => {
          requestAnimationFrame(() => setFolderOpen(true))
        }, 520)
      },
      { root, threshold: 0.35, rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(target)
    return () => {
      io.disconnect()
      window.clearTimeout(openTimer)
    }
  }, [])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const timeline = timelineRef.current
    const highlights = highlightsRef.current
    const workFlow = workFlowRef.current
    if (!scroller) return undefined

    if (prefersReducedMotion()) return undefined

    const ctx = gsap.context(() => {
      if (highlights) {
        const cards = highlights.querySelectorAll('.about-page__highlight')
        gsap.fromTo(
          cards,
          { opacity: 0, scale: 0.35, y: 18 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.58,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              scroller,
              trigger: highlights,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
            onComplete: () => {
              gsap.set(cards, { clearProps: 'transform' })
            },
          },
        )
      }

      if (workFlow) {
        const steps = workFlow.querySelectorAll('.about-page__work-step')
        const arrows = workFlow.querySelectorAll('.about-page__work-step-arrow')

        gsap.fromTo(
          steps,
          { opacity: 0, x: -42, scale: 0.94 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.14,
            ease: 'power2.out',
            scrollTrigger: {
              scroller,
              trigger: workFlow,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            onComplete: () => {
              gsap.set(steps, { clearProps: 'transform' })
            },
          },
        )

        if (arrows.length) {
          gsap.fromTo(
            arrows,
            { opacity: 0, scaleX: 0.2, transformOrigin: 'left center' },
            {
              opacity: 1,
              scaleX: 1,
              duration: 0.4,
              stagger: 0.14,
              delay: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                scroller,
                trigger: workFlow,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            },
          )
        }
      }

      if (timeline) {
        const items = timeline.querySelectorAll('.about-page__timeline-item')
        items.forEach((item) => {
          const isLeft = item.classList.contains('about-page__timeline-item--left')
          const card = item.querySelector('.about-page__timeline-card')
          const period = item.querySelector('.about-page__timeline-period')
          // 从中线往外弹：左侧卡从右（中线侧）弹出，右侧卡从左弹出
          const cardFromX = isLeft ? 56 : -56
          const periodFromX = isLeft ? -40 : 40

          if (card) {
            gsap.fromTo(
              card,
              { opacity: 0, x: cardFromX, scale: 0.92 },
              {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.62,
                ease: 'back.out(1.4)',
                scrollTrigger: {
                  scroller,
                  trigger: item,
                  start: 'top 82%',
                  toggleActions: 'play none none none',
                },
              },
            )
          }

          if (period) {
            gsap.fromTo(
              period,
              { opacity: 0, x: periodFromX },
              {
                opacity: 1,
                x: 0,
                duration: 0.55,
                delay: 0.06,
                ease: 'power2.out',
                scrollTrigger: {
                  scroller,
                  trigger: item,
                  start: 'top 82%',
                  toggleActions: 'play none none none',
                },
              },
            )
          }

          gsap.fromTo(
            item,
            { '--dot-scale': 0 },
            {
              '--dot-scale': 1,
              duration: 0.4,
              ease: 'back.out(2)',
              scrollTrigger: {
                scroller,
                trigger: item,
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      ScrollTrigger.refresh()
    }, scroller)

    return () => ctx.revert()
  }, [])

  const scrollTo = (id) => {
    const root = scrollerRef.current
    const target = root?.querySelector(`#${id}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="about-page" ref={scrollerRef} aria-label={about.titleZh}>
      <div className="about-page__atmosphere" aria-hidden="true">
        <span className="about-page__blob about-page__blob--peach" />
        <span className="about-page__blob about-page__blob--sage" />
        <span className="about-page__blob about-page__blob--sky" />
        <span className="about-page__blob about-page__blob--sun" />
        <span className="about-page__blob about-page__blob--rose" />
        <span className="about-page__blob about-page__blob--mint" />
      </div>

      <Panel id="about-hero" tone="hero">
        <div className="about-page__hero">
          <div className="about-page__hero-text">
            <p className="about-page__eyebrow">
              <span className="about-page__eyebrow-dot" aria-hidden="true" />
              {about.heroEyebrow}
            </p>

            <h2 id="overlay-title" className="about-page__headline">
              <span className="visually-hidden">{about.heroHeadline.greeting}</span>
              <img
                className="about-page__headline-img"
                src={headlineSvg}
                alt="HI! 我是郑轶玟，擅长把内容从构思策划做到制作发布再迭代调优"
                width={1180}
                height={420}
                decoding="async"
              />
            </h2>

            <p className="about-page__summary">{about.heroSummary}</p>

            <blockquote className="about-page__quote">
              <p>「{about.heroQuote}」</p>
            </blockquote>

            <div className="about-page__hero-actions">
              <button
                type="button"
                className="about-page__cta about-page__cta--solid"
                onClick={() => scrollTo('about-highlights')}
              >
                {about.primaryCta}
                <span aria-hidden="true"> ↓</span>
              </button>
              <button
                type="button"
                className="about-page__cta about-page__cta--link"
                onClick={() => scrollTo('about-work-style')}
              >
                {about.secondaryCta}
                <span aria-hidden="true"> ↗</span>
              </button>
            </div>

            <ul className="about-page__tags">
              {about.heroTags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>

          <div className="about-page__stage">
            <div className="about-page__rings" aria-hidden="true" />
            <figure className="about-page__frame">
              <img src={portraitUrl} alt={`${name}的照片`} width={640} height={800} />
            </figure>

            <div className="about-page__photo-badge">
              <span className="about-page__photo-badge-en">{photoBadge.labelEn}</span>
              <strong>{photoBadge.labelZh}</strong>
              <span>{photoBadge.meta}</span>
            </div>

            <aside className="about-page__exp-card">
              <p className="about-page__exp-title">{selectedExperience.titleEn}</p>
              <p className="about-page__exp-companies">{selectedExperience.companies}</p>
              <p className="about-page__exp-focuses">{selectedExperience.focuses}</p>
            </aside>

            <aside className="about-page__next-card">
              <p className="about-page__next-label">{nextStop.labelZh}</p>
              <p className="about-page__next-body">{nextStop.body}</p>
            </aside>
          </div>
        </div>

        <button
          type="button"
          className="about-page__scroll-hint"
          onClick={() => scrollTo('about-strengths')}
        >
          <span>{about.scrollHint}</span>
          <span className="about-page__scroll-arrow" aria-hidden="true">
            ↓
          </span>
        </button>
      </Panel>

      <Panel id="about-strengths" tone="strengths">
        <div className="about-page__strengths-block" ref={strengthsRef}>
          <div className="about-page__marquee about-page__marquee--wave" aria-hidden="true">
            <CurvedLoop
              marqueeText={about.marquee.text}
              speed={about.marquee.speed}
              curveAmount={about.marquee.curveAmount}
              direction={about.marquee.direction}
              interactive={about.marquee.interactive}
              className="about-page__marquee-text"
              viewBox="0 0 1440 200"
              pathD="M-200,100 C-20,18 100,182 280,100 S560,18 740,100 S1020,182 1200,100 S1480,18 1660,100"
            />
          </div>
          <div className="about-page__strengths-stage">
            <FolderFloat
              className="about-page__strengths-folder"
              items={folderItems}
              label={about.strengths.folderLabel}
              sublabel={about.strengths.folderSublabel}
              trigger="click"
              open={folderOpen}
              onOpenChange={setFolderOpen}
              closeOnSelect={false}
              physics={false}
              drift={0.35}
              offsetX={0}
              folderColor="#f0b48a"
              frontColor="#ff9a57"
              paperColor="#fff8ef"
              itemColor="#fffaf4"
              itemTextColor="#2a231c"
              labelColor="#fffaf4"
              width={150}
              height={112}
              radius={12}
              spread={520}
              lift={96}
              tilt={7}
              flapAngle={42}
              restAngle={16}
              openDuration={760}
              stagger={100}
              bounce={0.18}
            />
          </div>
        </div>
      </Panel>

      <Panel id="about-highlights">
        <SectionHead titleEn={about.highlights.titleEn} titleZh={about.highlights.titleZh} />
        <ul className="about-page__highlights" ref={highlightsRef}>
          {about.highlights.items.map((item) => (
            <li key={item.id} className="about-page__highlight">
              <p className="about-page__metric">{item.metric}</p>
              <p className="about-page__highlight-label">{item.labelZh}</p>
              {item.note ? <p className="about-page__highlight-note">{item.note}</p> : null}
            </li>
          ))}
        </ul>
        <p className="about-page__footnote about-page__hint--corner">{about.highlights.footnote}</p>
      </Panel>

      <Panel id="about-timeline">
        <SectionHead titleEn={about.timeline.titleEn} titleZh={about.timeline.titleZh} />
        <ol className="about-page__timeline" ref={timelineRef}>
          {about.timeline.items.map((item, index) => {
            const side = index % 2 === 0 ? 'left' : 'right'
            return (
              <li
                key={item.id}
                className={`about-page__timeline-item about-page__timeline-item--${side}`}
              >
                <p className="about-page__timeline-period">{item.period}</p>
                <div className="about-page__timeline-card">
                  <p className="about-page__timeline-company">{item.company}</p>
                  <p className="about-page__timeline-role">{item.role}</p>
                  <p className="about-page__timeline-result">{item.result}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="about-page__hint about-page__hint--corner">{about.timeline.hint}</p>
      </Panel>

      <Panel id="about-work-style">
        <SectionHead titleEn={about.workStyle.titleEn} titleZh={about.workStyle.titleZh} />
        {about.workStyle.lead ? (
          <p className="about-page__work-lead">{about.workStyle.lead}</p>
        ) : null}
        <ol className="about-page__work-flow" ref={workFlowRef} aria-label={about.workStyle.titleZh}>
          {about.workStyle.steps.map((step, index) => (
            <li key={step.id} className="about-page__work-step">
              <div className="about-page__work-step-head" aria-hidden="true">
                <span className="about-page__work-step-num">{index + 1}</span>
                {index < about.workStyle.steps.length - 1 ? (
                  <span className="about-page__work-step-arrow">
                    <span className="about-page__work-step-arrow-line" />
                    <span className="about-page__work-step-arrow-tip" />
                  </span>
                ) : null}
              </div>
              <div className="about-page__work-step-card">
                <p className="about-page__work-step-label">{step.labelZh}</p>
                <p className="about-page__work-step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel id="about-contact" tone="last">
        <SectionHead titleEn="CONTACT" titleZh="联系方式" />
        <div className="about-page__contact">
          <CopyValue value={contact.email} label="邮箱" />
          <CopyValue value={contact.phone} label="电话" />
        </div>
      </Panel>
    </div>
  )
}
