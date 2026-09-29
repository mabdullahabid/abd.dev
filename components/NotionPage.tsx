'use client'

import cs from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import {
  formatDate,
  getBlockTitle,
  getBlockValue,
  getPageProperty
} from 'notion-utils'
import * as React from 'react'
import BodyClassName from 'react-body-classname'
import {
  type NotionComponents,
  NotionRenderer,
  useNotionContext
} from 'react-notion-x'
import { Collection } from 'react-notion-x/third-party/collection'
import { EmbeddedTweet, TweetNotFound, TweetSkeleton } from 'react-tweet'
import { useSearchParam } from 'react-use'

import type * as types from '@/lib/types'
import { analytics } from '@/lib/analytics'
import * as config from '@/lib/config'
import { mapImageUrl } from '@/lib/map-image-url'
import { mapPageUrl } from '@/lib/map-page-url'
import { searchNotion } from '@/lib/search-notion'
import { useDarkMode } from '@/lib/use-dark-mode'

import { Footer } from './Footer'
// import { GitHubShareButton } from './GitHubShareButton'
import { NotionPageHeader } from './NotionPageHeader'
import { PageAside } from './PageAside'

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const Code = dynamic(() =>
  import('react-notion-x/third-party/code').then(async (m) => {
    // add / remove any prism syntaxes here
    await Promise.allSettled([
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-markup-templating.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-markup.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-bash.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-c.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-cpp.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-csharp.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-docker.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-java.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-js-templates.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-coffeescript.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-diff.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-git.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-go.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-graphql.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-handlebars.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-less.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-makefile.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-markdown.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-objectivec.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-ocaml.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-python.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-reason.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-rust.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-sass.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-scss.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-solidity.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-sql.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-stylus.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-swift.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-wasm.js'),
      // @ts-expect-error Ignore prisma types
      import('prismjs/components/prism-yaml.js')
    ])
    return m.Code
  })
)

const Equation = dynamic(() =>
  import('react-notion-x/third-party/equation').then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import('react-notion-x/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: false
  }
)
const Modal = dynamic(
  () =>
    import('react-notion-x/third-party/modal').then((m) => {
      m.Modal.setAppElement('.notion-viewport')
      return m.Modal
    }),
  {
    ssr: false
  }
)

function Tweet({ id }: { id: string }) {
  const { recordMap } = useNotionContext()
  const tweet = (recordMap as types.ExtendedTweetRecordMap)?.tweets?.[id]

  return (
    <React.Suspense fallback={<TweetSkeleton />}>
      {tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />}
    </React.Suspense>
  )
}

const propertyLastEditedTimeValue = (
  { block, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && block?.last_edited_time) {
    return `Last updated ${formatDate(block?.last_edited_time, {
      month: 'long'
    })}`
  }

  return defaultFn()
}

const propertyDateValue = (
  { data, schema, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'published') {
    const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date

    if (publishDate) {
      return `${formatDate(publishDate, {
        month: 'long'
      })}`
    }
  }

  return defaultFn()
}

const propertyTextValue = (
  { schema, pageHeader }: any,
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return <b>{defaultFn()}</b>
  }

  return defaultFn()
}

const notionRendererComponents: Partial<NotionComponents> = {
  nextImage: Image,
  nextLink: Link,
  Code,
  Collection,
  Equation,
  Pdf,
  Modal,
  Tweet,
  Header: NotionPageHeader,
  propertyLastEditedTimeValue,
  propertyTextValue,
  propertyDateValue
}

export function NotionPage({
  site,
  recordMap,
  pageId
}: Required<Pick<types.PageProps, 'site' | 'recordMap' | 'pageId'>>) {
  const lite = useSearchParam('lite')

  // lite mode is for oembed
  const isLiteMode = lite === 'true'

  const { isDarkMode } = useDarkMode()

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {}
    if (lite) params.lite = lite

    const searchParams = new URLSearchParams(params)
    return mapPageUrl(site, recordMap, searchParams)
  }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {})
  const block = getBlockValue(recordMap?.block?.[keys[0]!])!

  // const isRootPage =
  //   parsePageId(block?.id) === parsePageId(site?.rootNotionPageId)
  const isBlogPost =
    block?.type === 'page' && block?.parent_table === 'collection'

  const showTableOfContents = !!isBlogPost
  const minTableOfContentsItems = 3

  // Get page title and metadata for tracking
  const pageTitle = React.useMemo(
    () => (block ? getBlockTitle(block, recordMap) || site?.name : ''),
    [block, recordMap, site?.name]
  )

  // Determine page type for analytics
  const pageType = React.useMemo(() => {
    if (!block) return 'other'
    if (pageId === site?.rootNotionPageId) return 'home'
    if (isBlogPost) return 'blog_post'
    return 'other'
  }, [block, pageId, site?.rootNotionPageId, isBlogPost])

  // Calculate reading time estimate for blog posts
  const readingTimeEstimate = React.useMemo(() => {
    if (!isBlogPost || !recordMap) return undefined

    // Extract text content from blocks to estimate reading time
    let textContent = ''
    for (const blockWrapper of Object.values(recordMap.block || {})) {
      const blockData = getBlockValue(blockWrapper)
      if (blockData?.properties?.title) {
        textContent += blockData.properties.title[0]?.[0] || ''
      }
    }

    return analytics.estimateReadingTime(textContent)
  }, [isBlogPost, recordMap])

  // Enhanced page view tracking with metadata
  React.useEffect(() => {
    if (!block) return

    const publishDate = getPageProperty<string>('Published', block, recordMap)

    analytics.trackPageView({
      page_title: pageTitle,
      page_type: pageType,
      reading_time_estimate: readingTimeEstimate
    })

    // Track blog post specific data
    if (isBlogPost && pageTitle) {
      analytics.trackBlogPost({
        post_title: pageTitle,
        post_id: pageId,
        estimated_reading_time: readingTimeEstimate,
        publish_date: publishDate
      })
    }
  }, [
    block,
    pageTitle,
    pageType,
    readingTimeEstimate,
    isBlogPost,
    pageId,
    recordMap
  ])

  // Initialize scroll tracking for content engagement
  React.useEffect(() => {
    if (!pageTitle) return

    const cleanup = analytics.initializeScrollTracking(pageTitle, pageType)

    // Track time on page at intervals
    const timeIntervals = [30_000, 60_000, 120_000, 300_000] // 30s, 1m, 2m, 5m
    const timeouts: NodeJS.Timeout[] = []

    for (const interval of timeIntervals) {
      const timeout = setTimeout(() => {
        analytics.trackContentEngagement({
          event_type: 'time_on_page',
          value: interval / 1000,
          page_title: pageTitle,
          page_type: pageType
        })
      }, interval)
      timeouts.push(timeout)
    }

    return () => {
      cleanup?.()
      for (const timeout of timeouts) {
        clearTimeout(timeout)
      }
    }
  }, [pageTitle, pageType])

  // Track external link clicks
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a')

      if (link && link.href) {
        const url = new URL(link.href)
        const currentDomain = window.location.hostname
        const isExternal = url.hostname !== currentDomain

        analytics.trackLinkClick({
          link_type: isExternal ? 'external' : 'internal',
          destination_url: link.href,
          link_text: link.textContent || undefined,
          location: 'content'
        })
      }
    }

    document.addEventListener('click', handleLinkClick)
    return () => document.removeEventListener('click', handleLinkClick)
  }, [])

  const pageAside = React.useMemo(
    () => (
      <PageAside block={block!} recordMap={recordMap} isBlogPost={isBlogPost} />
    ),
    [block, recordMap, isBlogPost]
  )

  const title = pageTitle || site.name

  React.useEffect(() => {
    console.log('notion page', {
      isDev: config.isDev,
      title,
      pageId,
      rootNotionPageId: site.rootNotionPageId,
      recordMap
    })

    // add important objects to the window global for easy debugging
    const g = window as any
    g.pageId = pageId
    g.recordMap = recordMap
    g.block = block
  }, [block, pageId, recordMap, site.rootNotionPageId, title])

  return (
    <>
      {isLiteMode && <BodyClassName className='notion-lite' />}

      <NotionRenderer
        bodyClassName={cs(pageId === site.rootNotionPageId && 'index-page')}
        darkMode={isDarkMode}
        components={notionRendererComponents}
        recordMap={recordMap}
        rootPageId={site.rootNotionPageId}
        rootDomain={site.domain}
        fullPage={!isLiteMode}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        showTableOfContents={showTableOfContents}
        minTableOfContentsItems={minTableOfContentsItems}
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        mapPageUrl={siteMapPageUrl}
        mapImageUrl={mapImageUrl}
        searchNotion={config.isSearchEnabled ? searchNotion : undefined}
        pageAside={pageAside}
        footer={<Footer />}
      />

      {/* <GitHubShareButton /> */}
    </>
  )
}
