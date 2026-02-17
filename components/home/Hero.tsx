'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/home.module.css'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const socialsRef = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const initAnimations = async () => {
      try {
        const gsap = (await import('gsap')).default

        // Hide elements before animating
        if (headingRef.current) {
          gsap.set(headingRef.current, { opacity: 0, y: 30 })
        }
        if (subtitleRef.current) {
          gsap.set(subtitleRef.current, { opacity: 0, y: 20 })
        }
        if (socialsRef.current) {
          gsap.set(Array.from(socialsRef.current.children), { opacity: 0, y: 15 })
        }

        setAnimated(true)

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.to(headingRef.current, { duration: 0.8, opacity: 1, y: 0 })
        tl.to(subtitleRef.current, { duration: 0.6, opacity: 1, y: 0 }, '-=0.4')
        tl.to(
          Array.from(socialsRef.current?.children || []),
          { duration: 0.4, opacity: 1, y: 0, stagger: 0.08 },
          '-=0.3'
        )
      } catch {
        // GSAP failed to load - elements stay visible via CSS defaults
      }
    }

    initAnimations()
  }, [])

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 ref={headingRef} className={styles.heroHeading}>
          Hello World 👋, I&apos;m Abdullah
        </h1>
        <p ref={subtitleRef} className={styles.heroSubtitle}>
          Tech Leader &amp; Builder &ndash; CEO @ Autonomous, Founder @ Memox.
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
          <span>SCROLL</span>
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
