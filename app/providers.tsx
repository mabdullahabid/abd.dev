'use client'

import * as Fathom from 'fathom-client'
import { usePathname, useSearchParams } from 'next/navigation'
import { ThemeProvider, useTheme } from 'next-themes'
import posthog from 'posthog-js'
import * as React from 'react'

import { enableAnalyticsDebug } from '@/lib/analytics-debug'
import { bootstrap } from '@/lib/bootstrap-client'
import { fathomConfig, fathomId, posthogConfig, posthogId } from '@/lib/config'

const themeClassNames = { dark: 'dark-mode', light: 'light-mode' }

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      disableTransitionOnChange
      enableSystem
      value={themeClassNames}
    >
      <ThemeColor />

      <React.Suspense fallback={null}>
        <Analytics />
      </React.Suspense>

      {children}
    </ThemeProvider>
  )
}

function ThemeColor() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) {
      return
    }

    const themeColorMetas = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    )
    const originalContent = themeColorMetas.map((meta) => meta.content)
    const themeColor = resolvedTheme === 'dark' ? '#2d3439' : '#fefffe'

    for (const meta of themeColorMetas) {
      meta.content = themeColor
    }

    return () => {
      for (const [index, meta] of themeColorMetas.entries()) {
        meta.content = originalContent[index]!
      }
    }
  }, [resolvedTheme])

  return null
}

function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousUrlRef = React.useRef<string | undefined>(undefined)
  const url = [pathname, searchParams?.toString()].filter(Boolean).join('?')

  React.useEffect(() => {
    bootstrap()

    if (fathomId) {
      Fathom.load(fathomId, fathomConfig)
    }

    if (posthogId) {
      posthog.init(posthogId, posthogConfig)

      if (process.env.NODE_ENV === 'development') {
        enableAnalyticsDebug()
      }
    }
  }, [])

  React.useEffect(() => {
    if (previousUrlRef.current === undefined) {
      previousUrlRef.current = url
      return
    }

    if (previousUrlRef.current === url) {
      return
    }

    previousUrlRef.current = url

    if (fathomId) {
      Fathom.trackPageview()
    }
  }, [url])

  return null
}
