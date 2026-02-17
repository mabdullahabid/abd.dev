import type { PageProps } from '@/lib/types'
import { NotionPageWrapper } from '@/components/NotionPageWrapper'
import { domain } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'
import { getHomepageData, BlogPost } from '@/lib/homepage-data'
import Hero from '@/components/home/Hero'
import About from '@/components/home/About'
import BlogGrid from '@/components/home/BlogGrid'
import EnhancedFooter from '@/components/layout/EnhancedFooter'
import { PageHead } from '@/components/PageHead'

interface HomePageProps extends PageProps {
  isHomePage: boolean
  posts: BlogPost[]
}

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)
    const { posts } = await getHomepageData()

    return {
      props: {
        ...props,
        isHomePage: true,
        posts,
      },
      revalidate: 10,
    }
  } catch (err) {
    console.error('page error', domain, err)
    throw err
  }
}

export default function NotionDomainPage(props: HomePageProps) {
  const { isHomePage, posts, ...notionProps } = props

  // Render custom homepage for the root page
  if (isHomePage && notionProps.pageId === '16ccc94eb4cf4b3d85fb31ac7be58e87') {
    return (
      <>
        <PageHead site={notionProps} />
        <Hero />
        <About />
        <BlogGrid posts={posts} />
        <EnhancedFooter />
      </>
    )
  }

  // Render normal Notion page for other routes
  return <NotionPageWrapper {...notionProps} />
}
