/**
 * Centralized analytics utility for abd.dev
 * Handles all PostHog event tracking with consistent patterns
 */

import posthog from 'posthog-js'

import { posthogId } from './config'

// Type definitions for our custom events
export interface PageViewEvent {
  page_title?: string
  page_type?: 'home' | 'blog_post' | 'about' | 'contact' | 'other'
  reading_time_estimate?: number
  word_count?: number
  is_mobile?: boolean
  referrer?: string
}

export interface SocialClickEvent {
  platform: 'twitter' | 'github' | 'linkedin' | 'email' | 'other'
  location: 'header' | 'footer' | 'content'
  url: string
}

export interface ContentEngagementEvent {
  event_type: 'scroll_milestone' | 'reading_time' | 'time_on_page'
  value: number
  page_title?: string
  page_type?: string
}

export interface LinkClickEvent {
  link_type: 'internal' | 'external'
  destination_url: string
  link_text?: string
  location?: string
}

export interface ThemeToggleEvent {
  from_theme: 'light' | 'dark'
  to_theme: 'light' | 'dark'
}

export interface BlogPostEvent {
  post_title: string
  post_id?: string
  estimated_reading_time?: number
  word_count?: number
  publish_date?: string
  scroll_percentage?: number
}

class Analytics {
  private isInitialized = false
  private scrollMilestones = new Set<number>()
  private pageStartTime: number = 0
  private lastScrollPercentage = 0

  constructor() {
    if (typeof window !== 'undefined' && posthogId) {
      this.isInitialized = true
      this.pageStartTime = Date.now()
    }
  }

  // Enhanced page view tracking
  trackPageView(properties: PageViewEvent = {}) {
    if (!this.isInitialized) return

    const enhancedProperties = {
      ...properties,
      is_mobile: this.isMobileDevice(),
      referrer: document.referrer || undefined,
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString()
    }

    posthog.capture('$pageview', enhancedProperties)
    
    // Reset tracking variables for new page
    this.scrollMilestones.clear()
    this.pageStartTime = Date.now()
    this.lastScrollPercentage = 0
  }

  // Social media link clicks
  trackSocialClick(properties: SocialClickEvent) {
    if (!this.isInitialized) return

    posthog.capture('social_link_clicked', {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Theme toggle tracking
  trackThemeToggle(properties: ThemeToggleEvent) {
    if (!this.isInitialized) return

    posthog.capture('theme_toggled', {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Link click tracking
  trackLinkClick(properties: LinkClickEvent) {
    if (!this.isInitialized) return

    posthog.capture('link_clicked', {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Content engagement tracking
  trackContentEngagement(properties: ContentEngagementEvent) {
    if (!this.isInitialized) return

    posthog.capture('content_engagement', {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Blog post specific tracking
  trackBlogPost(properties: BlogPostEvent) {
    if (!this.isInitialized) return

    posthog.capture('blog_post_viewed', {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Scroll depth tracking
  trackScrollDepth(percentage: number, pageTitle?: string, pageType?: string) {
    if (!this.isInitialized) return

    const milestones = [25, 50, 75, 100]
    
    for (const milestone of milestones) {
      if (percentage >= milestone && !this.scrollMilestones.has(milestone)) {
        this.scrollMilestones.add(milestone)
        
        this.trackContentEngagement({
          event_type: 'scroll_milestone',
          value: milestone,
          page_title: pageTitle,
          page_type: pageType
        })
        
        // Track reading completion for blog posts
        if (milestone === 100 && pageType === 'blog_post') {
          posthog.capture('blog_post_completed', {
            page_title: pageTitle,
            time_to_complete: Date.now() - this.pageStartTime,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
    
    this.lastScrollPercentage = percentage
  }

  // Time on page tracking
  trackTimeOnPage(pageTitle?: string, pageType?: string) {
    if (!this.isInitialized) return

    const timeSpent = Date.now() - this.pageStartTime
    
    // Track time milestones (30s, 1min, 2min, 5min)
    const timeMilestones = [30_000, 60_000, 120_000, 300_000] // in milliseconds
    
    for (const milestone of timeMilestones) {
      if (timeSpent >= milestone) {
        this.trackContentEngagement({
          event_type: 'time_on_page',
          value: milestone / 1000, // convert to seconds
          page_title: pageTitle,
          page_type: pageType
        })
      }
    }
  }

  // Utility function to estimate reading time
  estimateReadingTime(text: string): number {
    const wordsPerMinute = 200 // Average reading speed
    const wordCount = text.trim().split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  // Utility function to detect mobile device
  isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Get scroll percentage
  getScrollPercentage(): number {
    if (typeof window === 'undefined') return 0
    
    const scrolled = window.scrollY
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    return maxScroll > 0 ? Math.round((scrolled / maxScroll) * 100) : 0
  }

  // Initialize scroll tracking
  initializeScrollTracking(pageTitle?: string, pageType?: string) {
    if (typeof window === 'undefined' || !this.isInitialized) return

    const handleScroll = () => {
      const scrollPercentage = this.getScrollPercentage()
      if (scrollPercentage > this.lastScrollPercentage) {
        this.trackScrollDepth(scrollPercentage, pageTitle, pageType)
      }
    }

    // Throttle scroll events
    let scrollTimeout: NodeJS.Timeout
    const throttledScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }

  // Track page leave
  trackPageLeave(pageTitle?: string, pageType?: string) {
    if (!this.isInitialized) return

    const timeSpent = Date.now() - this.pageStartTime
    const finalScrollPercentage = this.getScrollPercentage()

    posthog.capture('page_left', {
      page_title: pageTitle,
      page_type: pageType,
      time_spent: timeSpent,
      final_scroll_percentage: finalScrollPercentage,
      timestamp: new Date().toISOString()
    })
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return
    posthog.setPersonProperties(properties)
  }

  // Identify user (for contact/about interactions)
  identifyUser(distinctId: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return
    posthog.identify(distinctId, properties)
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Export utility functions
export const trackPageView = (properties?: PageViewEvent) => analytics.trackPageView(properties)
export const trackSocialClick = (properties: SocialClickEvent) => analytics.trackSocialClick(properties)
export const trackThemeToggle = (properties: ThemeToggleEvent) => analytics.trackThemeToggle(properties)
export const trackLinkClick = (properties: LinkClickEvent) => analytics.trackLinkClick(properties)
export const trackContentEngagement = (properties: ContentEngagementEvent) => analytics.trackContentEngagement(properties)
export const trackBlogPost = (properties: BlogPostEvent) => analytics.trackBlogPost(properties)