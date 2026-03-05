'use client'

import { useEffect, useState } from 'react'
import styles from './ReadingProgress.module.css'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setProgress(Math.min(scrollPercent, 100))
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress() // Initial call

    return () => {
      window.removeEventListener('scroll', updateProgress)
    }
  }, [])

  return (
    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
