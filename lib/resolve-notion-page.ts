import { type ExtendedRecordMap } from 'notion-types'
import { parsePageId } from 'notion-utils'

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
import { getCanonicalPageId } from './get-canonical-page-id'
import { getCanonicalPageMap } from './get-site-map'
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

    const isResolvedFromSlug = !pageId

    if (!pageId) {
      // Check the cached slug → page ID map first; it's shared across
      // serverless instances, so this avoids crawling Notion per request.
      try {
        const canonicalPageMap = await getCanonicalPageMap()
        pageId = canonicalPageMap[rawPageId]
      } catch (err: any) {
        console.warn('canonical page map lookup failed:', err.message)
      }
    }

    if (!pageId) {
      // Pages published after the cached map was built: fall back to Notion search
      pageId = await findPageIdViaSearch(rawPageId)
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

    recordMap = await getPage(pageId)

    if (isResolvedFromSlug && useUriToPageIdCache) {
      try {
        await db.set(cacheKey, pageId, cacheTTL)
      } catch (err: any) {
        console.warn(`redis error set "${cacheKey}"`, err.message)
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

async function findPageIdViaSearch(
  rawPageId: string
): Promise<string | undefined> {
  // Convert slug back to search query (e.g. "my-page" → "my page")
  const query = rawPageId.replaceAll('-', ' ')
  const uuid = !!includeNotionIdInUrls

  try {
    const searchResults = await search({
      query,
      ancestorId: site.rootNotionPageId
    })
    const results = searchResults?.results ?? []

    // Match against the blocks returned alongside the search results, which is
    // enough to build canonical IDs without loading each page in full
    for (const result of results) {
      const canonicalId = getCanonicalPageId(
        result.id,
        searchResults.recordMap as ExtendedRecordMap,
        { uuid }
      )

      if (canonicalId === rawPageId) {
        return result.id
      }
    }
  } catch (err: any) {
    console.warn('Notion search fallback failed:', err.message)
  }
}
