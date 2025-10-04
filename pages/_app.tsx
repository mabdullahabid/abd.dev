// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css'
// global styles shared across the entire site
import 'styles/global.css'
// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'
// global style overrides for notion
import 'styles/notion.css'
// global style overrides for prism theme (optional)
import 'styles/prism-theme.css'

import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import * as Fathom from 'fathom-client'
import { useRouter } from 'next/router'
import Script from 'next/script'
import posthog from 'posthog-js'
import * as React from 'react'

import { analytics } from '@/lib/analytics'
import { enableAnalyticsDebug } from '@/lib/analytics-debug'
import { bootstrap } from '@/lib/bootstrap-client'
import {
  fathomConfig,
  fathomId,
  isServer,
  posthogConfig,
  posthogId
} from '@/lib/config'

if (!isServer) {
  bootstrap()
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  React.useEffect(() => {
    function onRouteChangeComplete() {
      if (fathomId) {
        Fathom.trackPageview()
      }

      if (posthogId) {
        // Use our enhanced page view tracking instead of basic capture
        analytics.trackPageView({
          referrer: document.referrer || undefined
        })
      }
    }

    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }

    if (posthogId) {
      posthog.init(posthogId, posthogConfig)
      // Enable debug mode in development
      if (process.env.NODE_ENV === 'development') {
        enableAnalyticsDebug()
      }
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events])

  return (
    <>
      <Component {...pageProps} />
      <Script type='module' strategy='lazyOnload'>
        {`
          import Chatbot from 'https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js';
          Chatbot.init({
            chatflowid: '3061397c-23e3-42b5-a24d-c1d85083695b',
            apiHost: 'https://flowise.cfy0.abd.dev',
            theme: {
              chatWindow: {
                footer: {
                  text: 'Powered by',
                  company: 'abd.dev',
                  companyLink: 'https://abd.dev',
                }
              }
            }
          });
        `}
      </Script>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
