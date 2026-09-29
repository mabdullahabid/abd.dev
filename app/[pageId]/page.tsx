import type { Metadata } from 'next'

import { NotionPageRoute } from '@/components/NotionPageRoute'
import { isDev } from '@/lib/config'
import { getPageData } from '@/lib/get-page-data'
import { getPrerenderPageIds } from '@/lib/get-prerender-page-ids'
import { createPageMetadata } from '@/lib/page-metadata'

interface DynamicPageProps {
  params: Promise<{
    pageId: string
  }>
}

// Serve cached pages and refresh them from Notion in the background at most
// every 5 minutes. Use /api/revalidate to publish changes immediately.
export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  if (isDev) {
    return []
  }

  // Prerender only the header's pages and the newest posts; all other pages
  // render on first visit. Prerendering every page hit Notion's rate limits.
  try {
    const pageIds = await getPrerenderPageIds()
    return pageIds.map((pageId) => ({ pageId }))
  } catch (err: any) {
    console.warn('skipping prerendering:', err.message)
    return []
  }
}

export async function generateMetadata({
  params
}: DynamicPageProps): Promise<Metadata> {
  const { pageId } = await params

  return createPageMetadata(await getPageData(pageId))
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { pageId } = await params
  const pageProps = await getPageData(pageId)

  return <NotionPageRoute pageProps={pageProps} />
}
