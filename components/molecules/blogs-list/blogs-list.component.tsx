import Link from 'next/link'
import React, { FC } from 'react'
import { Heading, Link as TuiLink } from 'theme-ui'

import { Date } from '~/components/atoms/date'

import { List, ListItem } from './blogs-list.styles'

interface Props {
  articles: CmsArticleEntry[]
  path?: string
}

export const ArticlesList: FC<Props> = ({ articles, path = 'blog' }) => {
  return (
    <List>
      { articles.map((post) => (
        <ListItem key={ post.id }>
          <Heading as="h4" mr={ 3 }>
            <Date dateString={ post.publishedAt }/>
          </Heading>
          <TuiLink as={ Link } href={ `/${ path }/${ post.slug }` }>
            { post.title }
          </TuiLink>
        </ListItem>
      )) }
    </List>
  )
}
