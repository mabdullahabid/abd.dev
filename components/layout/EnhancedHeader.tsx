'use client'

import { useEffect, useRef, useState } from 'react'
import { NotionPageHeader } from '../NotionPageHeader'
import styles from './EnhancedHeader.module.css'

export default function EnhancedHeader(props: any) {
  const headerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          if (currentScrollY < 100) {
            setIsVisible(true)
          } else if (currentScrollY > lastScrollY) {
            // Scrolling down
            setIsVisible(false)
          } else {
            // Scrolling up
            setIsVisible(true)
          }

          setLastScrollY(currentScrollY)
          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  return (
    <div
      ref={headerRef}
      className={`${styles.enhancedHeader} ${isVisible ? styles.visible : styles.hidden}`}
    >
      <NotionPageHeader {...props} />
    </div>
  )
}
