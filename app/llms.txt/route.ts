import { type ExtendedRecordMap } from 'notion-types'
import {
  getBlockParentPage,
  getBlockTitle,
  getBlockValue,
  idToUuid,
  parsePageId
} from 'notion-utils'

import * as config from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import { getMarkdownUrl } from '@/lib/page-metadata'

// Rebuilt at most hourly (one crawl of the Notion workspace), so new posts
// show up within about an hour
export const revalidate = 3600

interface PublicPageSummary {
  isArticle: boolean
  title: string
  url: string
}

export async function GET() {
  const siteMap = await getSiteMap()
  const pages = Object.entries(siteMap.canonicalPageMap)
    .flatMap(([pagePath, pageId]): PublicPageSummary[] => {
      if (
        !pagePath ||
        parsePageId(pageId) === parsePageId(config.rootNotionPageId)
      ) {
        return []
      }

      const recordMap = siteMap.pageMap[pageId] as ExtendedRecordMap | undefined
      if (!recordMap) return []

      const firstBlockKey = Object.keys(recordMap.block)[0]
      const block = firstBlockKey
        ? getBlockValue(recordMap.block[firstBlockKey])
        : undefined
      if (!block) return []

      const parentPage = getBlockParentPage(block, recordMap)
      const isArticle =
        block.type === 'page' &&
        block.parent_table === 'collection' &&
        parentPage?.id === idToUuid(config.rootNotionPageId)

      return [
        {
          isArticle,
          title: getBlockTitle(block, recordMap) || pagePath,
          url: new URL(pagePath, `${config.host}/`).toString()
        }
      ]
    })
    .toSorted((a, b) => a.title.localeCompare(b.title))

  const articles = pages.filter((page) => page.isArticle)
  const supportingPages = pages.filter((page) => !page.isArticle)

  return new Response(createLlmsTxt({ articles, supportingPages }), {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600',
      'Content-Type': 'text/markdown; charset=utf-8'
    }
  })
}

function createLlmsTxt({
  articles,
  supportingPages
}: {
  articles: PublicPageSummary[]
  supportingPages: PublicPageSummary[]
}): string {
  const sections = [
    `# ${escapeMarkdown(config.name)}`,
    `> ${escapeMarkdown(config.description)}`,
    `## URL structure\n\n- [Home](${config.host}/): Landing page and writing index.\n- \`/{slug}\`: Public articles and supporting Notion pages.\n- \`/-/markdown/{slug}\`: Markdown version of any page (also served at \`/{slug}\` for \`Accept: text/markdown\`).\n- [RSS feed](${config.host}/feed): Published articles in RSS format.\n- [XML sitemap](${config.host}/sitemap.xml): Crawlable public URLs.\n- [LLM index](${config.host}/llms.txt): This Markdown document.`,
    renderPageSection('Articles', articles),
    renderPageSection('Other pages', supportingPages)
  ].filter(Boolean)

  return `${sections.join('\n\n')}\n`
}

function renderPageSection(
  heading: string,
  pages: PublicPageSummary[]
): string {
  if (pages.length === 0) return ''

  const links = pages
    .map(
      (page) =>
        `- [${escapeMarkdown(page.title)}](${page.url}) ([Markdown](${new URL(getMarkdownUrl(page.url), page.url)}))`
    )
    .join('\n')

  return `## ${heading}\n\n${links}`
}

function escapeMarkdown(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
}
