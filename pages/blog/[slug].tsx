import * as Sentry from '@sentry/nextjs'
import { GetServerSideProps } from 'next'
import React from 'react'

import { CmsArticle } from '~/components/templates/cms-article'
import { getArticleBySlug } from '~/utils/cms.api'

export const getServerSideProps: GetServerSideProps<
  { article: CmsPageEntry },
  { slug: string }
> = async ({ locale, params }) => {
  try {
    const article = await getArticleBySlug(params?.slug || '', locale)

    if (!article) {
      return { notFound: true }
    }

    return { props: { article } }
  } catch (e) {
    Sentry.captureException(e)
    return { notFound: true }
  }
}

export default function PostBySlug ({ article }: { article: CmsPageEntry }) {
  if (!article) {
    return null
  }

  return (
    <CmsArticle article={article} />
  )
}
