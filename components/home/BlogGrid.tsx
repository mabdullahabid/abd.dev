'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import styles from '@/styles/home.module.css'

interface BlogPost {
  id: string
  title: string
  slug: string
  date?: string
  tags?: string[]
}

interface BlogGridProps {
  posts: BlogPost[]
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

      gsap.from(gridRef.current?.children || [], {
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        opacity: 0,
        y: 40,
        stagger: 0.15,
        ease: 'power3.out',
      })

      // Hover animations
      const cards = gridRef.current?.querySelectorAll(`.${styles.blogCard}`)
      cards?.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            duration: 0.3,
            y: -10,
            scale: 1.02,
            ease: 'power2.out',
          })
        })

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            duration: 0.3,
            y: 0,
            scale: 1,
            ease: 'power2.out',
          })
        })
      })
    }

    initAnimations()
  }, [])

  return (
    <section ref={sectionRef} className={styles.blog}>
      <div className={styles.blogContainer}>
        <h2 ref={titleRef} className={styles.sectionTitle}>
          Latest Posts
        </h2>
        <div ref={gridRef} className={styles.blogGrid}>
          {posts.slice(0, 6).map((post) => (
            <Link
              key={post.id}
              href={`/${post.slug}`}
              className={`${styles.blogCard} cursor-interactive`}
            >
              <article>
                <h3 className={styles.blogTitle}>{post.title}</h3>
                {post.date && (
                  <time className={styles.blogDate}>
                    {formatDate(post.date)}
                  </time>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className={styles.blogTags}>
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className={styles.blogTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>
        {posts.length > 6 && (
          <div className={styles.blogViewAll}>
            <Link href="/blog" className={`${styles.viewAllLink} cursor-interactive`}>
              View All Posts →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
