'use client'

import { useEffect, useRef } from 'react'
import styles from '@/styles/home.module.css'

const roles = [
  { title: 'CEO', company: 'Autonomous Technologies' },
  { title: 'Founder', company: 'Memox' },
  { title: 'Tech Leader', company: 'Building AI Products' },
]

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initAnimations = async () => {
      const gsap = (await import('gsap')).default
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).default
      gsap.registerPlugin(ScrollTrigger)

      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        duration: 1,
        opacity: 0,
        y: 50,
        ease: 'power3.out',
      })

      gsap.from(contentRef.current?.children || [], {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        duration: 0.8,
        opacity: 0,
        y: 30,
        stagger: 0.2,
        ease: 'power3.out',
      })
    }

    initAnimations()
  }, [])

  return (
    <section ref={sectionRef} className={styles.about}>
      <div className={styles.aboutContainer}>
        <h2 ref={titleRef} className={styles.sectionTitle}>
          About
        </h2>
        <div ref={contentRef} className={styles.aboutContent}>
          <p className={styles.aboutText}>
            I'm a tech leader passionate about building products that make a difference. 
            Currently leading multiple ventures in AI, automation, and productivity tools.
          </p>
          <div className={styles.rolesGrid}>
            {roles.map((role, index) => (
              <div key={index} className={styles.roleCard}>
                <h3 className={styles.roleTitle}>{role.title}</h3>
                <p className={styles.roleCompany}>{role.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
