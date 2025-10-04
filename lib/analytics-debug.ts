/**
 * Debug utility for testing PostHog analytics implementation
 * This helps verify that events are being tracked correctly
 */

import { analytics } from './analytics'

// Enable debug mode for PostHog in development
export const enableAnalyticsDebug = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Enable PostHog debug mode
    const posthog = (window as any).posthog
    if (posthog) {
      posthog.debug(true)
      console.log('🐍 PostHog debug mode enabled')
    }
    
    // Log analytics calls
    console.log('📊 Analytics utility loaded')
    console.log('📱 Mobile device:', analytics.isMobileDevice())
    console.log('📍 Current scroll:', analytics.getScrollPercentage())
  }
}

// Test function to manually trigger events for verification
export const testAnalyticsEvents = () => {
  if (typeof window === 'undefined') return
  
  console.log('🧪 Testing analytics events...')
  
  // Test social click
  analytics.trackSocialClick({
    platform: 'twitter',
    location: 'footer',
    url: 'https://twitter.com/test'
  })
  console.log('✅ Social click event sent')
  
  // Test theme toggle
  analytics.trackThemeToggle({
    from_theme: 'light',
    to_theme: 'dark'
  })
  console.log('✅ Theme toggle event sent')
  
  // Test content engagement
  analytics.trackContentEngagement({
    event_type: 'scroll_milestone',
    value: 50,
    page_title: 'Test Page',
    page_type: 'blog_post'
  })
  console.log('✅ Content engagement event sent')
  
  // Test link click
  analytics.trackLinkClick({
    link_type: 'external',
    destination_url: 'https://example.com',
    link_text: 'Test Link'
  })
  console.log('✅ Link click event sent')
  
  console.log('🎉 All test events sent successfully!')
}

// Add debug functions to window for easy testing
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testAnalytics = testAnalyticsEvents
  ;(window as any).enableAnalyticsDebug = () => enableAnalyticsDebug()
}