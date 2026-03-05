import { NotionPage as OriginalNotionPage } from './NotionPage'
import dynamic from 'next/dynamic'
import type { PageProps } from '@/lib/types'
import { useRouter } from 'next/router'

const ReadingProgress = dynamic(() => import('./effects/ReadingProgress'), {
  ssr: false,
})

export function NotionPageWrapper(props: PageProps) {
  const router = useRouter()
  const isBlogPost = router.pathname === '/[pageId]' && props.pageId !== '16ccc94eb4cf4b3d85fb31ac7be58e87'

  return (
    <>
      {isBlogPost && <ReadingProgress />}
      <OriginalNotionPage {...props} />
    </>
  )
}
