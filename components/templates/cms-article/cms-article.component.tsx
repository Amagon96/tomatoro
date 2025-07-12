import React, { FC } from 'react'

import { Slider } from '~/components/molecules/quotes'
import { RichTextRenderer } from '~/components/organisms/rich-text-renderer'

interface CmsArticleProps {
  blocks: CmsArticleEntry['blocks']
}

export const RenderCmsArticleBlocks: FC<CmsArticleProps> = ({ blocks }) => {
  if (!blocks) {
    return null
  }

  return blocks.map((block) => {
    if (block.__component === 'shared.rich-text') {
      return <RichTextRenderer key={ block.id } content={ block.body }/>
    } else if (block.__component === 'shared.slider') {
      return <Slider key={ block.id } sliderBlock={ block }/>
    } else {
      return null
    }
  })
}
