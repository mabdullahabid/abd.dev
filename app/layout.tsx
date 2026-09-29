// used for rendering equations (optional)
import 'katex/dist/katex.min.css'
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css'
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/styles.css'
// global styles shared across the entire site
import '@/styles/global.css'
// global style overrides for notion
import '@/styles/notion.css'
// global style overrides for prism theme (optional)
import '@/styles/prism-theme.css'

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'

import * as config from '@/lib/config'
import { createSiteJsonLd, serializeJsonLd } from '@/lib/json-ld'
import { siteIdentity } from '@/lib/site-identity'

import { Providers } from './providers'

export const metadata: Metadata = {
  metadataBase: new URL(config.host),
  title: config.name,
  description: config.description,
  manifest: '/manifest.json',
  icons: {
    shortcut: '/favicon.ico',
    icon: [
      {
        url: '/favicon.png',
        type: 'image/png',
        sizes: '32x32'
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black'
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          url: '/feed',
          title: config.name
        }
      ]
    }
  },
  openGraph: {
    type: 'website',
    siteName: config.name,
    title: config.name,
    description: config.description
  },
  twitter: {
    card: 'summary',
    creator: config.twitter ? `@${config.twitter}` : undefined,
    title: config.name,
    description: config.description
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#fefffe'
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#2d3439'
    }
  ]
}

// Describes the site's author and the site itself to search engines
const siteJsonLd = serializeJsonLd(createSiteJsonLd(siteIdentity))

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={config.language} suppressHydrationWarning>
      <body>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: siteJsonLd }}
        />
        <Providers>{children}</Providers>

        <Script id='flowise-chatbot' type='module' strategy='lazyOnload'>
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
      </body>
    </html>
  )
}
