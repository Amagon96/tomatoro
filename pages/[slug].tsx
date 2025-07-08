import * as Sentry from '@sentry/nextjs'
import { GetStaticProps } from 'next'
import React from 'react'

import { CmsArticle } from '~/components/templates/cms-article'
import { getArticleBySlug } from '~/utils/cms.api'
import { PAGES } from '~/utils/config'

export const getStaticPaths = async () => {
  const pagesForDefaultLocale = PAGES['en']
  const paths = Object.keys(pagesForDefaultLocale).map((key) => ({
    params: { slug: pagesForDefaultLocale[key as keyof typeof pagesForDefaultLocale] },
  }))

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<
  { article: CmsPageEntry },
  { slug: string }
> = async ({ locale, params }) => {
  try {
    const slug = params?.slug || ''
    const [article] = await Promise.all([
      getArticleBySlug(slug, locale),
    ])

    if (!article) {
      return { notFound: true }
    }

    return { props: { article } }
  } catch (e) {
    Sentry.captureException(e)
    return { notFound: true }
  }
}

export default function PageBySlug ({ article }: { article: CmsPageEntry }) {
  if (!article) {
    return null
  }

  return (
    <CmsArticle article={article} />
  )
}
