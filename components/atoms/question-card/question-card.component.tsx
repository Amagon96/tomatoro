import React, { FC } from 'react'
import { Card, Heading } from 'theme-ui'

import { CmsArticle } from '~/components/templates/cms-article'

interface Props {
  question: Question['question']
  answer: Question['blocks']
}

export const QuestionCard: FC<Props> = ({ answer, question }) => {
  return (
    <Card variant='question' sx={ { mt: 2, mb: 4 } }>
      <Heading as="h2">{ question }</Heading>
      <CmsArticle article={ { id: '', blocks: answer } }/>
    </Card>
  )
}
