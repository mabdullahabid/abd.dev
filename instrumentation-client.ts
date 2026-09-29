import posthog from 'posthog-js'

import { enableAnalyticsDebug } from '@/lib/analytics-debug'
import { posthogConfig, posthogId } from '@/lib/config'

// Runs before the app hydrates, so PostHog is ready before any component's
// effects call `posthog.capture()` (which silently drops events before init)
if (posthogId) {
  posthog.init(posthogId, posthogConfig)

  if (process.env.NODE_ENV === 'development') {
    enableAnalyticsDebug()
  }
}
