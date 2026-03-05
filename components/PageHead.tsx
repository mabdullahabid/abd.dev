import Head from 'next/head'

import type * as types from '@/lib/types'
import * as config from '@/lib/config'
import { getSocialImageUrl } from '@/lib/get-social-image-url'

export function PageHead({
  site,
  title,
  description,
  pageId,
  image,
  url,
  isBlogPost
}: types.PageProps & {
  title?: string
  description?: string
  image?: string
  url?: string
  isBlogPost?: boolean
}) {
  const rssFeedUrl = `${config.host}/feed`

  const isHomePage = url === config.host || url === `${config.host}/`

  title = title ?? site?.name
  // Use a keyword-rich title for the homepage
  if (isHomePage && title === site?.name) {
    title = `${site?.name} — Engineering, AI Systems & Agentic Development`
  }
  description = description ?? site?.description

  const socialImageUrl = getSocialImageUrl(pageId) || image

  return (
    <Head>
      <meta charSet='utf-8' />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
      />

      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black' />

      <meta
        name='theme-color'
        media='(prefers-color-scheme: light)'
        content='#fefffe'
        key='theme-color-light'
      />
      <meta
        name='theme-color'
        media='(prefers-color-scheme: dark)'
        content='#2d3439'
        key='theme-color-dark'
      />

      <meta name='robots' content='index,follow' />
      <meta property='og:type' content='website' />

      {site && (
        <>
          <meta property='og:site_name' content={site.name} />
          <meta property='twitter:domain' content={site.domain} />
        </>
      )}

      {config.twitter && (
        <meta name='twitter:creator' content={`@${config.twitter}`} />
      )}

      {description && (
        <>
          <meta name='description' content={description} />
          <meta property='og:description' content={description} />
          <meta name='twitter:description' content={description} />
        </>
      )}

      {socialImageUrl ? (
        <>
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:image' content={socialImageUrl} />
          <meta property='og:image' content={socialImageUrl} />
        </>
      ) : (
        <meta name='twitter:card' content='summary' />
      )}

      {url && (
        <>
          <link rel='canonical' href={url} />
          <meta property='og:url' content={url} />
          <meta property='twitter:url' content={url} />
        </>
      )}

      <link
        rel='alternate'
        type='application/rss+xml'
        href={rssFeedUrl}
        title={site?.name}
      />

      <meta property='og:title' content={title} />
      <meta name='twitter:title' content={title} />
      <title>{title}</title>

      {/* Person + WebSite schema for homepage */}
      {isHomePage && (
        <script type='application/ld+json'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Person',
                '@id': `${config.host}/#person`,
                name: config.author,
                url: config.host,
                jobTitle: 'Founder & CTO',
                worksFor: {
                  '@type': 'Organization',
                  name: 'Autonomous',
                  url: 'https://autonomoustech.ca'
                },
                sameAs: [
                  config.twitter
                    ? `https://twitter.com/${config.twitter}`
                    : null,
                  config.github
                    ? `https://github.com/${config.github}`
                    : null,
                  config.linkedin
                    ? `https://linkedin.com/in/${config.linkedin}`
                    : null
                ].filter(Boolean)
              },
              {
                '@type': 'WebSite',
                '@id': `${config.host}/#website`,
                url: config.host,
                name: site?.name,
                description: site?.description,
                author: { '@id': `${config.host}/#person` }
              }
            ]
          })}
        </script>
      )}

      {/* Article schema for blog posts */}
      {isBlogPost && (
        <script type='application/ld+json'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `${url}#BlogPosting`,
            mainEntityOfPage: url,
            url,
            headline: title,
            name: title,
            description,
            author: {
              '@type': 'Person',
              '@id': `${config.host}/#person`,
              name: config.author,
              url: config.host
            },
            publisher: {
              '@type': 'Person',
              '@id': `${config.host}/#person`,
              name: config.author,
              url: config.host
            },
            image: socialImageUrl
          })}
        </script>
      )}
    </Head>
  )
}
