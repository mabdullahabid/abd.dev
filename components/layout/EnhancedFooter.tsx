'use client'

import { useEffect, useRef } from 'react'
import { Footer } from '../Footer'

export default function EnhancedFooter() {
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initAnimations = async () => {
      try {
        const gsap = (await import('gsap')).default
        const ScrollTrigger = (await import('gsap/ScrollTrigger')).default
        gsap.registerPlugin(ScrollTrigger)

        gsap.fromTo(
          footerRef.current,
          { opacity: 0, y: 20 },
          {
            scrollTrigger: { trigger: footerRef.current, start: 'top 95%' },
            duration: 0.6,
            opacity: 1,
            y: 0,
            ease: 'power3.out',
          }
        )
      } catch {
        // visible by default
      }
    }

    initAnimations()
  }, [])

  return (
    <div ref={footerRef}>
      <Footer />
    </div>
  )
}
