import type { Metadata } from 'next'

import { NotionPageRoute } from '@/components/NotionPageRoute'
import { getPageData } from '@/lib/get-page-data'
import { createPageMetadata } from '@/lib/page-metadata'

// Serve cached pages and refresh them from Notion in the background at most
// every 5 minutes. Use /api/revalidate to publish changes immediately.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata(await getPageData())
}

export default async function HomePage() {
  const pageProps = await getPageData()

  return <NotionPageRoute pageProps={pageProps} />
}
