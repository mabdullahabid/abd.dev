'use client'

import { useEffect } from 'react'

export default function SmoothScroll() {
  useEffect(() => {
    let lenis: any = null

    const initLenis = async () => {
      const Lenis = (await import('lenis')).default
      
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      })

      function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }

      requestAnimationFrame(raf)

      // Integrate with GSAP ScrollTrigger if available
      if (typeof window !== 'undefined') {
        const gsapModule = await import('gsap')
        const ScrollTriggerModule = await import('gsap/ScrollTrigger')
        const gsap = gsapModule.default
        const ScrollTrigger = ScrollTriggerModule.default
        
        gsap.registerPlugin(ScrollTrigger)
        
        lenis.on('scroll', ScrollTrigger.update)
        
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000)
        })
        
        gsap.ticker.lagSmoothing(0)
      }
    }

    initLenis()

    return () => {
      if (lenis) {
        lenis.destroy()
      }
    }
  }, [])

  return null
}
