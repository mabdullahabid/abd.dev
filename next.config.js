export default {
  staticPageGenerationTimeout: 300,
  async rewrites() {
    // Serve a page's Markdown version at its normal URL when requested with
    // `Accept: text/markdown` (browsers never send this)
    const acceptsMarkdown = [
      { type: 'header', key: 'accept', value: '(.*)text/markdown(.*)' }
    ]

    return {
      beforeFiles: [
        { source: '/', has: acceptsMarkdown, destination: '/-/markdown' },
        {
          source: '/:pageId',
          has: acceptsMarkdown,
          destination: '/-/markdown/:pageId'
        }
      ],
      // Proxy PostHog through our own domain so ad blockers don't drop analytics
      afterFiles: [
        {
          source: '/ingest/static/:path*',
          destination: 'https://us-assets.i.posthog.com/static/:path*'
        },
        {
          source: '/ingest/array/:path*',
          destination: 'https://us-assets.i.posthog.com/array/:path*'
        },
        {
          source: '/ingest/:path*',
          destination: 'https://us.i.posthog.com/:path*'
        }
      ],
      fallback: []
    }
  },
  // Required for PostHog's trailing-slash API requests through the proxy
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.notion.so' },
      { protocol: 'https', hostname: 'notion.so' },
      { protocol: 'https', hostname: 'app.notion.com' },
      { protocol: 'https', hostname: 'file.notion.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'abs.twimg.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com' },
      { protocol: 'https', hostname: 'img.notionusercontent.com' }
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
}
