import { host } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import type { SiteMap } from '@/lib/types'

// Served at /sitemap.xml via a rewrite in next.config.js. It lives at this path
// because Next.js treats /sitemap.xml as a metadata route and emits it as a
// static file on Vercel, dropping `revalidate`, so it would only update on
// redeploy: https://github.com/vercel/next.js/issues/99055
//
// Rebuilt at most hourly (one crawl of the Notion workspace), so new posts
// show up within about an hour
export const revalidate = 3600

export async function GET() {
  const siteMap = await getSiteMap()

  return new Response(createSitemap(siteMap), {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
      'Content-Type': 'text/xml'
    }
  })
}

const createSitemap = (siteMap: SiteMap) =>
  `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${host}</loc>
    </url>

    <url>
      <loc>${host}/</loc>
    </url>

    ${Object.keys(siteMap.canonicalPageMap)
      .map((canonicalPagePath) =>
        `
          <url>
            <loc>${host}/${canonicalPagePath}</loc>
          </url>
        `.trim()
      )
      .join('')}
  </urlset>
`
