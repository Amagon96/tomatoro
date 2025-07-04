import * as Sentry from '@sentry/nextjs'
import { GetServerSideProps } from 'next'
import React from 'react'
import { Box, Grid, Heading } from 'theme-ui'
import { useIsClient } from 'usehooks-ts'

import { BackCta } from '~/components/atoms/back-cta'
import { QuestionCard } from '~/components/atoms/question-card'
import { PageRating } from '~/components/organisms/page-rating'
import { RichTextRenderer } from '~/components/organisms/rich-text-renderer'
import { SubscribeWidget } from '~/components/organisms/subscribe-widget'
import { Page } from '~/components/templates/page'
import { getQuestions, getSingleType } from '~/utils/cms.api'
import { createFaqStructuredData } from '~/utils/structured-data.utils'

const slug = 'faq'

export const getServerSideProps: GetServerSideProps<{}> = async ({ locale }) => {
  try {
    const fieldParameters = ['seo', 'seo.metaImage', 'hero'].join('&populate[]=')
    const [page, questions] = await Promise.all([
      getSingleType<BasicPage>(slug, fieldParameters, locale),
      getQuestions(locale),
    ])
    return { props: { questions, page } }
  } catch (e) {
    Sentry.captureException(e)
    return { props: { questions: [], page: null } }
  }
}

interface RouteProps {
  questions: Question[]
  page: BasicPage | null
}

export default function Faq ({ page, questions }: RouteProps) {
  const isClient = useIsClient()

  if (!page) {
    return null
  }

  const showHero = !!page.attributes.hero?.data?.attributes.url

  return (
    <Page
      hero={ {
        imageUrl: page.attributes.hero?.data?.attributes.url,
        caption: page.attributes.hero?.data?.attributes.caption,
      } }
      subtitle={ page.attributes.title }
      //@ts-ignore
      seo={ {
        ...page.attributes.seo,
        structuredData: JSON.stringify(createFaqStructuredData(questions)),
      } }
      isWrapped
    >
      <Grid
        variant="contained"
        sx={ {
          gap: 3,
          lineHeight: 2,
          justifyItems: 'start',
          paddingTop: showHero && 5,
        } }>
        <Heading as="h1">{ page.attributes.title }</Heading>
        <RichTextRenderer content={ page.attributes.content }/>

        { questions.map((question) => (
          <QuestionCard key={ question.attributes.question }
            question={ question.attributes.question }
            answer={ question.attributes.content }/>
        )) }

        { isClient && (
          <Box sx={ { my: 5 } }>
            <PageRating pageId={ slug }/>
          </Box>
        ) }

        <BackCta/>

        { isClient && (
          <Box sx={ { my: 5 } }>
            <SubscribeWidget/>
          </Box>
        ) }
      </Grid>
    </Page>
  )
}
