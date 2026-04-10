import type { Metadata } from 'next'

import { NotionPageRoute } from '@/components/NotionPageRoute'
import { getPageData } from '@/lib/get-page-data'
import { createPageMetadata } from '@/lib/page-metadata'

interface DynamicPageProps {
  params: Promise<{
    pageId: string
  }>
}

export const revalidate = 10
export const dynamicParams = true

export async function generateStaticParams() {
  // Don't prerender any pages at build time to avoid Notion API rate limits (429).
  // All pages are generated on-demand via ISR (see `revalidate` above).
  return []
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
