import * as Sentry from '@sentry/nextjs'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { BackCta } from '~/components/atoms/back-cta'
import { RenderCmsArticleBlocks } from '~/components/templates/cms-article'
import { Page } from '~/components/templates/page'
import graphicTakeBreak from '~/public/svg/graphic-take-break.svg'
import { getArticleBySlug } from '~/utils/cms.api'

const today = new Date().toISOString()
const fallbackPage: CmsArticleEntry = {
  id: -1,
  title: 'Oops! 🍅 Time\'s Up!',
  blocks: [
    {
      __component: 'shared.rich-text',
      id: -1,
      body: '# Oops! 🍅 Time\'s Up!\nWe couldn\'t find the page you\'re looking for.\n\nLet\'s get you back on track!\n',
    },
  ],
  slug: 'error-404',
  createdAt: today,
  updatedAt: today,
  publishedAt: today,
  locale: 'en',
}

export const getStaticProps: GetStaticProps<
  { article: CmsArticleEntry },
  {}
> = async ({ locale }) => {
  try {
    let article: CmsArticleEntry = await getArticleBySlug('error-404', locale)

    if (!article) {
      article = fallbackPage
    }

    return { props: { article } }
  } catch (e) {
    Sentry.captureException(e)
    return { props: { article: fallbackPage } }
  }
}

export default function Custom404 ({ article }: { article: CmsArticleEntry }) {
  return (
    <Page subtitle="404" isWrapped>
      <Grid variant="contained" columns={ 2 }>
        <Grid gap={ 3 } sx={ { justifyItems: 'start' } }>
          <RenderCmsArticleBlocks blocks={ article.blocks }/>
          <BackCta/>
        </Grid>
        <Flex sx={ { justifyContent: 'center' } }>
          <Image
            src={ graphicTakeBreak }
            alt="Tomato taking a break"
            width={ 180 }
            height={ 180 }
          />
        </Flex>
      </Grid>
    </Page>
  )
}
