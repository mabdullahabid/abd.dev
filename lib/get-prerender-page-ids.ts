import { getBlockValue, parsePageId } from 'notion-utils'

import {
  includeNotionIdInUrls,
  navigationLinks,
  rootNotionPageId
} from './config'
import { getCanonicalPageId } from './get-canonical-page-id'
import { getPage } from './notion'

const maxRecentPosts = 6

/**
 * Slugs worth prerendering at build time: the custom navigation header's pages
 * plus the newest posts listed on the home page.
 */
export async function getPrerenderPageIds(): Promise<string[]> {
  const recordMap = await getPage(rootNotionPageId)
  const uuid = !!includeNotionIdInUrls

  const navigationPageIds = (navigationLinks ?? [])
    // record map keys are dashed UUIDs, while site.config.ts IDs usually aren't
    .map((link) => parsePageId(link?.pageId))
    .filter((pageId): pageId is string => !!pageId)

  // Collection query results are already sorted to match the Notion view, so
  // the first entries are the newest posts
  const recentPostIds = [
    ...new Set(
      Object.values(recordMap.collection_query ?? {}).flatMap((views) =>
        Object.values(views ?? {}).flatMap(
          (query: any) => query?.collection_group_results?.blockIds ?? []
        )
      )
    )
  ]
    .filter(
      (blockId) => getBlockValue(recordMap.block[blockId])?.type === 'page'
    )
    .slice(0, maxRecentPosts)

  const slugs = [...navigationPageIds, ...recentPostIds].map((pageId) =>
    getCanonicalPageId(pageId, recordMap, { uuid })
  )

  return [...new Set(slugs.filter((slug): slug is string => !!slug))]
}
