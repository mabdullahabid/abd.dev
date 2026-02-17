'use client'

import { useEffect, useRef } from 'react'
import { Footer } from '../Footer'
import styles from './EnhancedFooter.module.css'

export default function EnhancedFooter() {
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initAnimations = async () => {
      const gsap = (await import('gsap')).default
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).default
      gsap.registerPlugin(ScrollTrigger)

      gsap.from(footerRef.current, {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
        },
        duration: 0.8,
        opacity: 0,
        y: 30,
        ease: 'power3.out',
      })
    }

    initAnimations()
  }, [])

  return (
    <div ref={footerRef} className={styles.enhancedFooter}>
      <Footer />
    </div>
  )
}
