import * as Sentry from '@sentry/nextjs'
import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { Grid, Heading } from 'theme-ui'

import { ArticlesList } from '~/components/molecules/blogs-list'
import { Page } from '~/components/templates/page'
import { getAllHelpEntries } from '~/utils/cms.api'

export const getServerSideProps: GetServerSideProps<{}> = async ({ locale = 'en' }) => {
  try {
    const articles = await getAllHelpEntries(locale as Locale)
    return { props: { articles: articles } }
  } catch (e) {
    Sentry.captureException(e)
    return { props: { articles: [] } }
  }
}

export default function HelpCenter ({ articles }: { articles: CmsArticleEntry[] }) {
  const { t } = useTranslation('pages')

  return (
    <Page subtitle="Articles" isWrapped>
      <Grid variant="contained">
        <Heading as="h1">{ t('help.title') }</Heading>

        <ArticlesList articles={ articles }/>
      </Grid>
    </Page>
  )
}
