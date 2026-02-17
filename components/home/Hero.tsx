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

      // Split text into characters for animation
      if (headingRef.current) {
        const text = headingRef.current.textContent || ''
        headingRef.current.innerHTML = text
          .split('')
          .map((char) => 
            char === ' ' 
              ? '<span class="char"> </span>' 
              : `<span class="char">${char}</span>`
          )
          .join('')

        tl.from('.char', {
          duration: 0.8,
          opacity: 0,
          y: 80,
          rotateX: -90,
          stagger: 0.02,
        })
      }

      tl.from(
        subtitleRef.current,
        {
          duration: 0.8,
          opacity: 0,
          y: 30,
        },
        '-=0.4'
      )

      tl.from(
        socialsRef.current?.children || [],
        {
          duration: 0.6,
          opacity: 0,
          y: 20,
          stagger: 0.1,
        },
        '-=0.4'
      )
    }

    initAnimations()
  }, [])

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 ref={headingRef} className={styles.heroHeading}>
          Hello World 👋🏻, I'm Abdullah
        </h1>
        <p ref={subtitleRef} className={styles.heroSubtitle}>
          Tech Leader & Builder — CEO @ Autonomous, Founder @ Memox
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
          <svg width="20" height="40" viewBox="0 0 20 40">
            <path
              d="M10 5 L10 30 M10 30 L5 25 M10 30 L15 25"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
      <div className={styles.heroBackground}></div>
    </section>
  )
}
