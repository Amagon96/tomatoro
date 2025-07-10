import React, { FC } from 'react'

import { RichTextRenderer } from '~/components/organisms/rich-text-renderer'

interface CmsArticleProps {
  article: BasicPage
}

export const CmsArticle: FC<CmsArticleProps> = ({ article }) => {
  if (!article) {
    return null
  }

  return article.blocks?.map((block) => {
    if (block.__component === 'shared.rich-text') {
      return <RichTextRenderer key={ block.id } content={ block.body }/>
    }
    return null
  })
}
