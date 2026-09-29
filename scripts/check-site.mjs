/**
 * Nightly production check for the site, run by
 * .github/workflows/site-check.yml. Posts to a Google Chat space when
 * something is wrong (or when TEST_ALERT=true).
 *
 * Catches the failure modes we've actually hit: pages rendering a "Notion Page
 * Not Found" body with a 200, unknown URLs not returning 404, and posts
 * silently missing from sitemap.xml.
 */

const siteUrl = (process.env.SITE_URL ?? 'https://abd.dev').replace(/\/$/, '')
const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL
const runUrl = process.env.RUN_URL
const isTestAlert = process.env.TEST_ALERT === 'true'

const navigationPaths = ['/about', '/pages', '/contact']
const recentPostCount = 3
const notFoundTitle = 'Notion Page Not Found'

async function fetchPage(path, { attempts = 2 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(`${siteUrl}${path}`, {
        headers: { 'user-agent': 'abd.dev-site-check' },
        signal: AbortSignal.timeout(60_000)
      })
      const text = await res.text()
      // retry server errors once; a first visit can hit a cold Notion fetch
      if (res.status >= 500 && attempt < attempts) throw new Error(res.status)
      return { status: res.status, text, type: res.headers.get('content-type') }
    } catch (err) {
      if (attempt >= attempts) {
        return { status: 0, text: '', type: '', error: String(err.message) }
      }
      await new Promise((resolve) => setTimeout(resolve, 20_000))
    }
  }
}

const getTitle = (html) =>
  html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]?.trim() ?? ''

const failures = []
const fail = (message) => failures.push(message)

async function checkPage(path) {
  const { status, text, error } = await fetchPage(path)
  const title = getTitle(text)

  if (status !== 200) {
    fail(`${path} returned ${error ?? status}`)
  } else if (!title || title === notFoundTitle) {
    fail(`${path} rendered "${title || 'no title'}"`)
  }

  return text
}

// Home page and the header's pages
const homeHtml = await checkPage('/')
for (const path of navigationPaths) {
  await checkPage(path)
}

// Newest posts linked from the home page
const linkedPaths = [
  ...new Set(
    [...homeHtml.matchAll(/href="(\/[a-z0-9-]+)"/g)].map((match) => match[1])
  )
]
const postPaths = linkedPaths.filter((path) => !navigationPaths.includes(path))

if (postPaths.length === 0) {
  fail('home page links to no posts')
}

for (const path of postPaths.slice(0, recentPostCount)) {
  await checkPage(path)
}

// Every page linked from the home page should be in the sitemap
const sitemap = await fetchPage('/sitemap.xml')
if (sitemap.status !== 200) {
  fail(`/sitemap.xml returned ${sitemap.error ?? sitemap.status}`)
} else {
  const missing = linkedPaths.filter(
    (path) => !sitemap.text.includes(`<loc>${siteUrl}${path}</loc>`)
  )

  if (missing.length) {
    fail(
      `${missing.length} linked pages missing from /sitemap.xml: ${missing.join(', ')}`
    )
  }
}

// Unknown URLs must be real 404s
const unknown = await fetchPage(`/site-check-missing-page-${Date.now()}`, {
  attempts: 1
})
if (unknown.status !== 404) {
  fail(`unknown URL returned ${unknown.error ?? unknown.status}, expected 404`)
}

// AI-readable endpoints
const llms = await fetchPage('/llms.txt')
if (llms.status !== 200 || !llms.text.includes('## Articles')) {
  fail(`/llms.txt returned ${llms.error ?? llms.status} or has no articles`)
}

const markdown = await fetchPage('/-/markdown/about')
if (markdown.status !== 200 || !markdown.type?.startsWith('text/markdown')) {
  fail(`/-/markdown/about returned ${markdown.error ?? markdown.status}`)
}

// Report
if (failures.length) {
  console.error(`Site check failed:\n- ${failures.join('\n- ')}`)
} else {
  console.log(`Site check passed (${postPaths.length} posts linked from home)`)
}

if (webhookUrl && (failures.length || isTestAlert)) {
  const lines = failures.length
    ? [`🚨 *${siteUrl} site check failed*`, ...failures.map((f) => `• ${f}`)]
    : [`✅ *${siteUrl} site check* test message: all checks passed.`]
  if (runUrl) lines.push(`Details: ${runUrl}`)

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ text: lines.join('\n') })
  })
  console.log(`Google Chat notification: ${res.status}`)
}

process.exitCode = failures.length ? 1 : 0
