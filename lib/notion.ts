import {
  type ExtendedRecordMap,
  type SearchParams,
  type SearchResults
} from 'notion-types'
import { getBlockValue, mergeRecordMaps } from 'notion-utils'
import pMap from 'p-map'
import pMemoize from 'p-memoize'

import {
  isPreviewImageSupportEnabled,
  navigationLinks,
  navigationStyle
} from './config'
import { getTweetsMap } from './get-tweets'
import { notion } from './notion-api'
import { getPreviewImageMap } from './preview-images'

const getNavigationLinkPages = pMemoize(
  async (): Promise<ExtendedRecordMap[]> => {
    const navigationLinkPageIds = (navigationLinks || [])
      .map((link) => link?.pageId)
      .filter(Boolean)

    if (navigationStyle !== 'default' && navigationLinkPageIds.length) {
      return pMap(
        navigationLinkPageIds,
        async (navigationLinkPageId) =>
          notion.getPage(navigationLinkPageId, {
            chunkLimit: 1,
            fetchMissingBlocks: false,
            fetchCollections: false,
            signFileUrls: false
          }),
        {
          concurrency: 4
        }
      )
    }

    return []
  }
)

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  let recordMap = await notion.getPage(pageId)

  if (navigationStyle !== 'default') {
    // ensure that any pages linked to in the custom navigation header have
    // their block info fully resolved in the page record map so we know
    // the page title, slug, etc.
    const navigationLinkRecordMaps = await getNavigationLinkPages()

    if (navigationLinkRecordMaps?.length) {
      recordMap = navigationLinkRecordMaps.reduce(
        (map, navigationLinkRecordMap) =>
          mergeRecordMaps(map, navigationLinkRecordMap),
        recordMap
      )
    }
  }

  // Sort collection query results by the collection view's sort configuration.
  // The Notion API may return blockIds in an unexpected order (due to the
  // x-notion-space-id header added in notion-client v7.7.0).
  for (const collectionId of Object.keys(recordMap.collection_query || {})) {
    for (const viewId of Object.keys(recordMap.collection_query[collectionId] || {})) {
      const collectionViewWrapper = recordMap.collection_view?.[viewId] as any
      // Handle triple-nested structure: { spaceId, value: { value: { ...view } } }
      const collectionView =
        collectionViewWrapper?.value?.value ??
        collectionViewWrapper?.value ??
        collectionViewWrapper
      const queryResult = recordMap.collection_query[collectionId]![viewId]
      const blockIds = (queryResult as any)?.collection_group_results?.blockIds

      if (!blockIds?.length) continue

      // Re-sort blockIds by the collection view's query2 sort configuration.
      // The Notion API's queryCollection may return blockIds in wrong order
      // due to the x-notion-space-id header (notion-client v7.7.0+).
      const sorts = collectionView?.query2?.sort
      if (sorts?.length) {
        blockIds.sort((a: string, b: string) => {
          const blockA = getBlockValue(recordMap.block[a])
          const blockB = getBlockValue(recordMap.block[b])
          if (!blockA || !blockB) return 0

          for (const sortRule of sorts) {
            const { property, direction } = sortRule
            let valA: any
            let valB: any

            if (property === 'created_time') {
              valA = blockA.created_time ?? 0
              valB = blockB.created_time ?? 0
            } else if (property === 'last_edited_time') {
              valA = blockA.last_edited_time ?? 0
              valB = blockB.last_edited_time ?? 0
            } else {
              const rawA = (blockA as any).properties?.[property]
              const rawB = (blockB as any).properties?.[property]
              // Dates: [["‣",[["d",{"start_date":"2025-08-12"}]]]]
              // Text/Select/Checkbox: [["value"]]
              const dateA = rawA?.[0]?.[1]?.[0]?.[1]?.start_date
              const dateB = rawB?.[0]?.[1]?.[0]?.[1]?.start_date
              if (dateA || dateB) {
                // Date property — use date string or empty
                valA = dateA ?? ''
                valB = dateB ?? ''
              } else {
                // Non-date property (checkbox, text, select)
                valA = rawA?.[0]?.[0] ?? null
                valB = rawB?.[0]?.[0] ?? null
                // Both missing → skip this sort rule entirely
                if (valA == null && valB == null) continue
                // One missing → treat as equal to avoid incorrect ordering
                // from undefined vs explicit values on sparse properties
                if (valA == null) valA = valB
                if (valB == null) valB = valA
              }
            }

            if (valA < valB) return direction === 'ascending' ? -1 : 1
            if (valA > valB) return direction === 'ascending' ? 1 : -1
          }
          return 0
        })
      }
    }
  }

  if (isPreviewImageSupportEnabled) {
    const previewImageMap = await getPreviewImageMap(recordMap)
    ;(recordMap as any).preview_images = previewImageMap
  }

  await getTweetsMap(recordMap)

  return recordMap
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}
