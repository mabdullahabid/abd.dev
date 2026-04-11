import { type ExtendedRecordMap } from 'notion-types'
import { getCanonicalPageId, parsePageId } from 'notion-utils'

import type { PageProps } from './types'
import * as acl from './acl'
import {
  environment,
  includeNotionIdInUrls,
  pageUrlAdditions,
  pageUrlOverrides,
  site
} from './config'
import { db } from './db'
import { getSiteMap } from './get-site-map'
import { getPage, search } from './notion'

export async function resolveNotionPage(
  domain: string,
  rawPageId?: string
): Promise<PageProps> {
  let pageId: string | undefined
  let recordMap: ExtendedRecordMap

  if (rawPageId && rawPageId !== 'index') {
    pageId = parsePageId(rawPageId)!

    if (!pageId) {
      // check if the site configuration provides an override or a fallback for
      // the page's URI
      const override =
        pageUrlOverrides[rawPageId] || pageUrlAdditions[rawPageId]

      if (override) {
        pageId = parsePageId(override)!
      }
    }

    const useUriToPageIdCache = true
    const cacheKey = `uri-to-page-id:${domain}:${environment}:${rawPageId}`
    // TODO: should we use a TTL for these mappings or make them permanent?
    // const cacheTTL = 8.64e7 // one day in milliseconds
    const cacheTTL = undefined // disable cache TTL

    if (!pageId && useUriToPageIdCache) {
      try {
        // check if the database has a cached mapping of this URI to page ID
        pageId = await db.get(cacheKey)

        // console.log(`redis get "${cacheKey}"`, pageId)
      } catch (err: any) {
        // ignore redis errors
        console.warn(`redis error get "${cacheKey}"`, err.message)
      }
    }

    if (pageId) {
      recordMap = await getPage(pageId)
    } else {
      // Fast path: use Notion search API to resolve slug without crawling
      // all pages. Convert slug back to search query (e.g. "my-page" → "my page")
      const searchQuery = rawPageId.replace(/-/g, ' ')
      try {
        const searchResults = await search({
          query: searchQuery,
          ancestorId: site.rootNotionPageId
        })

        if (searchResults?.results?.length) {
          for (const result of searchResults.results) {
            const resultPageId = result.id
            const resultRecordMap = await getPage(resultPageId)
            const canonicalId = getCanonicalPageId(resultPageId, resultRecordMap, {
              uuid: !!includeNotionIdInUrls
            })

            if (canonicalId === rawPageId) {
              pageId = resultPageId
              recordMap = resultRecordMap

              if (useUriToPageIdCache) {
                try {
                  await db.set(cacheKey, pageId, cacheTTL)
                } catch (err: any) {
                  console.warn(`redis error set "${cacheKey}"`, err.message)
                }
              }
              break
            }
          }
        }
      } catch (err: any) {
        console.warn('Notion search fallback failed:', err.message)
      }

      // Slow path: fall back to full sitemap crawl if search didn't resolve
      if (!pageId) {
        const siteMap = await getSiteMap()
        pageId = siteMap?.canonicalPageMap[rawPageId]
      }

      if (!pageId) {
        // note: we're purposefully not caching URI to pageId mappings for 404s
        return {
          error: {
            message: `Not found "${rawPageId}"`,
            statusCode: 404
          }
        }
      }

      // Fetch the page if not already loaded by the search fast path
      if (!recordMap!) {
        recordMap = await getPage(pageId)
      }

      if (useUriToPageIdCache) {
        try {
          await db.set(cacheKey, pageId, cacheTTL)
        } catch (err: any) {
          console.warn(`redis error set "${cacheKey}"`, err.message)
        }
      }
    }
  } else {
    pageId = site.rootNotionPageId

    console.log(site)
    recordMap = await getPage(pageId)
  }

  const props: PageProps = { site, recordMap, pageId }
  return { ...props, ...(await acl.pageAcl(props)) }
}
