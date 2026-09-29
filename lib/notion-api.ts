import { NotionAPI } from 'notion-client'

// Leave retries to notion-client: after a 429 it waits out Notion's rate-limit
// cooldown (~60-75 s). Overriding `retryDelay` with a short fixed delay retried
// inside the cooldown, so pages failed and dropped out of the site map.
export const notion = new NotionAPI({
  apiBaseUrl: process.env.NOTION_API_BASE_URL
})
