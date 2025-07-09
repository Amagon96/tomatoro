import * as Sentry from '@sentry/nextjs'
import { GetServerSideProps } from 'next'
import React from 'react'
import { Grid, Heading } from 'theme-ui'

import { ArticlesList } from '~/components/molecules/blogs-list'
import { Page } from '~/components/templates/page'
import { getAllArticles } from '~/utils/cms.api'

export const getServerSideProps: GetServerSideProps<{}> = async ({ locale = 'en' }) => {
  try {
    const articles = await getAllArticles(locale as Locale)
    return { props: { articles: articles } }
  } catch (e) {
    Sentry.captureException(e)
    return { props: { articles: [] } }
  }
}

export default function Blog ({ articles }: { articles: CmsArticleEntry[] }) {
  return (
    <Page subtitle="Articles" isWrapped>
      <Grid variant="contained">
        <Heading as="h1">Blog</Heading>

        <ArticlesList articles={ articles }/>
      </Grid>
    </Page>
  )
}
