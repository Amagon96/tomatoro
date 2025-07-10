import * as Sentry from '@sentry/nextjs'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
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

const LOCALE_TO_PATH: Record<Locale, string> = {
  en: 'help',
  es: 'ayuda',
}

export default function HelpCenter ({ articles }: { articles: CmsArticleEntry[] }) {
  const { locale = 'en' } = useRouter()
  const { t } = useTranslation('pages')

  return (
    <Page subtitle="Articles" isWrapped>
      <Grid variant="contained">
        <Heading as="h1">{ t('help.title') }</Heading>

        <ArticlesList articles={ articles } path={ LOCALE_TO_PATH[locale as Locale] } />
      </Grid>
    </Page>
  )
}
