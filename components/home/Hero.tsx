'use client'

import { useEffect, useRef } from 'react'
import styles from '@/styles/home.module.css'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const socialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initAnimations = async () => {
      const gsap = (await import('gsap')).default

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Split heading text into characters
      if (headingRef.current) {
        const text = headingRef.current.textContent || ''
        headingRef.current.innerHTML = Array.from(text)
          .map((char) =>
            char === ' '
              ? '<span class="char">&nbsp;</span>'
              : `<span class="char">${char}</span>`
          )
          .join('')

        // Set initial state and animate
        gsap.set('.char', { opacity: 0, y: 40, rotateX: -40 })
        tl.to('.char', {
          duration: 0.6,
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.02,
        })
      }

      tl.from(
        subtitleRef.current,
        { duration: 0.6, opacity: 0, y: 20 },
        '-=0.3'
      )

      tl.from(
        Array.from(socialsRef.current?.children || []),
        { duration: 0.4, opacity: 0, y: 15, stagger: 0.08 },
        '-=0.3'
      )
    }

    initAnimations()
  }, [])

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 ref={headingRef} className={styles.heroHeading}>
          Hello World 👋, I'm Abdullah
        </h1>
        <p ref={subtitleRef} className={styles.heroSubtitle}>
          Tech Leader &amp; Builder - CEO @ Autonomous, Founder @ Memox.
          <br />
          Building AI-driven platforms and leading teams that ship.
        </p>
        <div ref={socialsRef} className={styles.heroSocials}>
          <a
            href="https://twitter.com/mabdullahabid_"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialLink} cursor-interactive`}
          >
            Twitter
          </a>
          <a
            href="https://github.com/mabdullahabid"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialLink} cursor-interactive`}
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/mabdullahabid"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialLink} cursor-interactive`}
          >
            LinkedIn
          </a>
        </div>
        <div className={styles.scrollIndicator}>
          <span>Scroll</span>
          <svg width="16" height="32" viewBox="0 0 16 32">
            <path
              d="M8 4 L8 24 M8 24 L3 19 M8 24 L13 19"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
      </div>
      <div className={styles.heroBackground}></div>
    </section>
  )
}
