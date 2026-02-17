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
      try {
        const gsap = (await import('gsap')).default
        const ScrollTrigger = (await import('gsap/ScrollTrigger')).default
        gsap.registerPlugin(ScrollTrigger)

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

        const cards = gridRef.current?.children
        if (cards && cards.length > 0) {
          gsap.fromTo(
            Array.from(cards),
            { opacity: 0, y: 30 },
            {
              scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
              duration: 0.6,
              opacity: 1,
              y: 0,
              stagger: 0.1,
              ease: 'power3.out',
            }
          )
        }
      } catch {
        // GSAP failed - elements visible via CSS
      }
    }

    if (posts && posts.length > 0) {
      initAnimations()
    }
  }, [posts])

  if (!posts || posts.length === 0) {
    return (
      <section ref={sectionRef} className={styles.blog}>
        <div className={styles.blogContainer}>
          <h2 className={styles.sectionTitle}>Latest Posts</h2>
          <p className={styles.aboutText}>Posts coming soon...</p>
        </div>
      </section>
    )
  }

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
      </div>
    </section>
  )
}
