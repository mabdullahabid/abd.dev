# Enhanced PostHog Analytics for abd.dev

This document outlines the comprehensive analytics tracking implementation added to abd.dev to better understand user behavior and content engagement.

## Overview

The enhanced tracking system captures detailed user interactions while maintaining privacy and providing valuable insights for a personal website/blog.

## Events Being Tracked

### 1. Enhanced Page Views (`$pageview`)
- **Triggers**: Every page navigation
- **Data Captured**:
  - Page title and type (home, blog_post, other)
  - Reading time estimate for blog posts
  - Device type (mobile/desktop)
  - Screen resolution and viewport size
  - Referrer information

### 2. Social Media Interactions (`social_link_clicked`)
- **Triggers**: Clicks on social media links
- **Data Captured**:
  - Platform (twitter, github, linkedin, email, other)
  - Location (header, footer, content)
  - Destination URL

### 3. Theme Toggle (`theme_toggled`)
- **Triggers**: Light/dark mode switches
- **Data Captured**:
  - From theme (light/dark)
  - To theme (light/dark)

### 4. Content Engagement (`content_engagement`)
- **Triggers**: Scroll milestones and time on page
- **Data Captured**:
  - Event type (scroll_milestone, time_on_page)
  - Value (percentage scrolled or time spent)
  - Page context (title, type)

### 5. Link Clicks (`link_clicked`)
- **Triggers**: All link clicks in content
- **Data Captured**:
  - Link type (internal/external)
  - Destination URL
  - Link text
  - Location context

### 6. Blog Post Views (`blog_post_viewed`)
- **Triggers**: Blog post page visits
- **Data Captured**:
  - Post title and ID
  - Estimated reading time
  - Publication date
  - Word count estimate

### 7. Reading Completion (`blog_post_completed`)
- **Triggers**: 100% scroll on blog posts
- **Data Captured**:
  - Post title
  - Time to complete reading
  - Final scroll percentage

### 8. Page Leave (`page_left`)
- **Triggers**: User navigates away or closes tab
- **Data Captured**:
  - Time spent on page
  - Final scroll percentage
  - Page context

## Scroll Depth Tracking

The system tracks scroll milestones at:
- 25% of page content
- 50% of page content
- 75% of page content
- 100% of page content (completion)

## Time on Page Tracking

Time milestones are tracked at:
- 30 seconds
- 1 minute
- 2 minutes
- 5 minutes

## Implementation Details

### Core Files

1. **`/lib/analytics.ts`** - Central analytics utility with type-safe event tracking
2. **`/lib/analytics-debug.ts`** - Debug utilities for development testing
3. **`/pages/_app.tsx`** - App-level initialization and route change tracking
4. **`/components/NotionPage.tsx`** - Page-level tracking for content engagement
5. **`/components/Footer.tsx`** - Social link tracking
6. **`/components/PageSocial.tsx`** - Additional social link tracking

### Key Features

- **Type Safety**: All events are strongly typed with TypeScript interfaces
- **Privacy Focused**: No personally identifiable information is tracked
- **Performance Optimized**: Events are throttled and batched appropriately
- **Mobile Responsive**: Device detection and mobile-specific tracking
- **Debug Mode**: Development tools for testing and verification

## Testing the Implementation

### Development Mode

In development, debug mode is automatically enabled. Open browser console to see:
- PostHog debug output
- Analytics utility status
- Event confirmations

### Manual Testing

Use browser console commands:
```javascript
// Test all analytics events
testAnalytics()

// Enable debug mode
enableAnalyticsDebug()
```

### Verification Checklist

- [ ] Page views tracked on navigation
- [ ] Social clicks tracked in footer
- [ ] Theme toggle tracked
- [ ] Scroll depth milestones triggered
- [ ] External link clicks captured
- [ ] Blog post metadata tracked
- [ ] Reading completion events fired
- [ ] Time on page milestones recorded

## Configuration

### Environment Variables

Ensure `NEXT_PUBLIC_POSTHOG_ID` is set in your environment:

```bash
NEXT_PUBLIC_POSTHOG_ID=your_posthog_project_id
```

### PostHog Dashboard Setup

Recommended dashboard widgets:
1. **Page Views** - Track traffic patterns
2. **Social Engagement** - Monitor which platforms drive engagement
3. **Content Performance** - Reading time vs scroll depth correlation
4. **User Journey** - Page navigation flows
5. **Engagement Funnel** - From page view to completion

## Privacy Considerations

This implementation:
- ✅ Respects user privacy (no PII collected)
- ✅ Uses first-party cookies only
- ✅ Tracks behavior, not identity
- ✅ Provides value for content optimization
- ✅ Can be easily disabled if needed

## Benefits for abd.dev

1. **Content Optimization**: Understand which posts resonate most
2. **User Experience**: Identify navigation patterns and pain points
3. **Performance Insights**: Track reading completion rates
4. **Social Strategy**: Measure social platform effectiveness
5. **Technical Decisions**: Data-driven improvements to site functionality

## Future Enhancements

Potential additions:
- Search query tracking
- Download/resource access tracking
- Contact form interaction tracking
- A/B testing for content layouts
- Performance metrics correlation
- Comment/feedback sentiment tracking

---

This enhanced analytics implementation provides comprehensive insights while maintaining the personal, authentic nature of abd.dev.