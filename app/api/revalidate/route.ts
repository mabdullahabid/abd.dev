import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Refreshes cached pages from Notion immediately, e.g. after publishing a post.
 * Requires the REVALIDATE_SECRET environment variable.
 *
 *   curl -X POST https://abd.dev/api/revalidate \
 *     -H "Authorization: Bearer $REVALIDATE_SECRET"            # whole site
 *   curl -X POST "https://abd.dev/api/revalidate?path=/my-post" \
 *     -H "Authorization: Bearer $REVALIDATE_SECRET"            # one page
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ revalidated: false }, { status: 401 })
  }

  const path = new URL(request.url).searchParams.get('path')

  if (path) {
    revalidatePath(path)
  } else {
    revalidatePath('/', 'layout')
  }

  // New posts need the cached slug -> page ID map refreshed to resolve
  revalidateTag('canonical-page-map', 'max')

  return Response.json({ revalidated: true, path: path ?? 'all' })
}
