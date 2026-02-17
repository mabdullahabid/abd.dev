'use client'

import { useEffect, useRef } from 'react'
import styles from '@/styles/home.module.css'

const roles = [
  { emoji: '🏢', title: 'CEO', company: 'Autonomous Technologies' },
  { emoji: '🧠', title: 'Founder', company: 'Memox' },
  { emoji: '🤖', title: 'AI Builder', company: 'Agentic Systems' },
  { emoji: '👨‍👧‍👦', title: 'Father of Two', company: 'Life' },
]

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initAnimations = async () => {
      try {
        const gsap = (await import('gsap')).default
        const ScrollTrigger = (await import('gsap/ScrollTrigger')).default
        gsap.registerPlugin(ScrollTrigger)

        // Use 'to' with autoAlpha for safe animation
        // Elements start visible, GSAP handles the reveal
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
            duration: 0.8,
            opacity: 1,
            y: 0,
            ease: 'power3.out',
          }
        )

        const children = contentRef.current?.children
        if (children) {
          gsap.fromTo(
            Array.from(children),
            { opacity: 0, y: 25 },
            {
              scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
              duration: 0.6,
              opacity: 1,
              y: 0,
              stagger: 0.15,
              ease: 'power3.out',
            }
          )
        }
      } catch {
        // GSAP failed - elements visible via CSS
      }
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
            I build technology that works for people. I specialize in designing AI-driven
            platforms, orchestrating multi-agent workflows, and leading teams that turn
            bold ideas into working, scalable systems.
          </p>
          <div className={styles.rolesGrid}>
            {roles.map((role, index) => (
              <div key={index} className={styles.roleCard}>
                <h3 className={styles.roleTitle}>{role.emoji} {role.title}</h3>
                <p className={styles.roleCompany}>{role.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
