'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './PageTransition.module.css'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const initGSAP = async () => {
      const gsap = (await import('gsap')).default

      const handleRouteChangeStart = () => {
        gsap.to('.page-transition-overlay', {
          duration: 0.3,
          opacity: 1,
          ease: 'power2.inOut',
        })
      }

      const handleRouteChangeComplete = () => {
        gsap.to('.page-transition-overlay', {
          duration: 0.3,
          opacity: 0,
          ease: 'power2.inOut',
          delay: 0.1,
        })

        // Scroll to top on route change
        window.scrollTo(0, 0)
      }

      router.events.on('routeChangeStart', handleRouteChangeStart)
      router.events.on('routeChangeComplete', handleRouteChangeComplete)
      router.events.on('routeChangeError', handleRouteChangeComplete)

      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart)
        router.events.off('routeChangeComplete', handleRouteChangeComplete)
        router.events.off('routeChangeError', handleRouteChangeComplete)
      }
    }

    initGSAP()
  }, [router])

  return (
    <>
      <div className={`page-transition-overlay ${styles.overlay}`} />
      {children}
    </>
  )
}
