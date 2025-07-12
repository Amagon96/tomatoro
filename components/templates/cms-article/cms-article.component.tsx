import React, { FC } from 'react'

import { MediaBlock } from '~/components/molecules/media-block'
import { Slider } from '~/components/molecules/slider'
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
    } else if (block.__component === 'shared.media') {
      return <MediaBlock key={ block.id } mediaBlock={ block }/>
    } else {
      return null
    }
  })
}
