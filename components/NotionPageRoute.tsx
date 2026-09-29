import 'server-only'

import { notFound } from 'next/navigation'

import type { PageProps } from '@/lib/types'
import { createBlogPostingJsonLd, serializeJsonLd } from '@/lib/json-ld'
import { getPageMetadataInfo } from '@/lib/page-metadata'
import { siteIdentity } from '@/lib/site-identity'

import { NotionPage } from './NotionPage'

export function NotionPageRoute({ pageProps }: { pageProps: PageProps }) {
  const { error, pageId, recordMap, site } = pageProps

  if (error || !pageId || !recordMap || !site) {
    notFound()
  }

  const { canonicalPageUrl, description, isBlogPost, socialImageUrl, title } =
    getPageMetadataInfo(pageProps)
  const jsonLd =
    isBlogPost && canonicalPageUrl
      ? serializeJsonLd(
          createBlogPostingJsonLd(siteIdentity, {
            description,
            imageUrl: socialImageUrl,
            title,
            url: canonicalPageUrl
          })
        )
      : undefined

  return (
    <>
      {jsonLd && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}

      <NotionPage pageId={pageId} recordMap={recordMap} site={site} />
    </>
  )
}
