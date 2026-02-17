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

export async function getHomepageData() {
  try {
    // Fetch the root page which contains the blog posts collection
    const recordMap = await notion.getPage('16ccc94eb4cf4b3d85fb31ac7be58e87')
    
    const posts: BlogPost[] = []
    
    // Extract collection data from recordMap
    if (recordMap.collection && recordMap.block) {
      const blocks = Object.values(recordMap.block)
      
      blocks.forEach((block: any) => {
        if (block.value && block.value.type === 'page' && block.value.parent_table === 'collection') {
          const properties = block.value.properties
          
          // Skip pages without Public checkbox or where Public is false
          const isPublic = block.value.properties?.['[ZmN'']?.[0]?.[0] === 'Yes'

          if (properties) {
            const title = properties.title?.[0]?.[0] || 'Untitled'
            // Use the canonical page ID which generates the proper URL slug
            const slug = getCanonicalPageId(block.value.id, recordMap, { uuid: false }) || block.value.id.replace(/-/g, '')
            const date = properties.published?.[0]?.[1]?.[0]?.[1]?.start_date
            const tags = properties.tags?.[0]?.[0]?.split(',').map((t: string) => t.trim()) || []
            
            posts.push({
              id: block.value.id,
              title,
              slug,
              date,
              tags,
            })
          }
        }
      })
    }
    
    // Sort posts by date (newest first)
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
