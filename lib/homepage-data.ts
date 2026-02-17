import { NotionAPI } from 'notion-client'
import { getCanonicalPageId } from './get-canonical-page-id'

const notion = new NotionAPI()

export interface BlogPost {
  id: string
  title: string
  slug: string
  date?: string
  tags?: string[]
}

// Notion schema property IDs (from collection schema)
const PROP_PUBLISHED = 'a<ql'
const PROP_TAGS = 'BN]P'
const PROP_PUBLIC = '==~K'

export async function getHomepageData() {
  try {
    // Fetch the root page
    const recordMap = await notion.getPage('16ccc94eb4cf4b3d85fb31ac7be58e87')

    const posts: BlogPost[] = []

    // Get block IDs from collection query results
    const collectionId = '051bf651-64e3-4c2d-897a-88c3c51f8837'
    const cq = recordMap.collection_query?.[collectionId]
    if (!cq) return { posts }

    const viewKey = Object.keys(cq)[0]
    const groupResults = cq[viewKey]?.collection_group_results
    const blockIds: string[] = groupResults?.blockIds || []

    if (blockIds.length === 0) return { posts }

    // Fetch each post page to get its properties
    // (the root page recordMap doesn't include collection item blocks)
    const fetchPromises = blockIds.map(async (id) => {
      try {
        const pageRm = await notion.getPage(id)
        const block = pageRm.block?.[id]?.value
        if (!block || !block.properties) return null

        const props = block.properties
        const title = props.title?.[0]?.[0] || 'Untitled'

        // Check if public
        const isPublic = props[PROP_PUBLIC]?.[0]?.[0] === 'Yes'
        if (!isPublic) return null

        // Get slug from canonical page ID
        const slug =
          getCanonicalPageId(block.id, pageRm, { uuid: false }) ||
          block.id.replace(/-/g, '')

        // Extract date - format: [["‣",[["d",{"type":"date","start_date":"2025-08-12"}]]]]
        let date: string | undefined
        const dateVal = props[PROP_PUBLISHED]
        if (dateVal) {
          const dateInfo = dateVal?.[0]?.[1]?.[0]?.[1]
          date = dateInfo?.start_date
        }

        // Extract tags - format: [["Tag1,Tag2"]] for multi_select
        let tags: string[] = []
        const tagsVal = props[PROP_TAGS]?.[0]?.[0]
        if (tagsVal) {
          tags = tagsVal.split(',').map((t: string) => t.trim())
        }

        return { id: block.id, title, slug, date, tags }
      } catch {
        return null
      }
    })

    const results = await Promise.all(fetchPromises)
    results.forEach((r) => {
      if (r) posts.push(r)
    })

    // Sort by date (newest first)
    posts.sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return { posts }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return { posts: [] }
  }
}
