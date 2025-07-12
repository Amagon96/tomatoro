import React, { FC } from 'react'
import { Box, Card, Flex, Heading, Paragraph } from 'theme-ui'

import { RichTextRenderer } from '~/components/organisms/rich-text-renderer'

interface Props {
  sliderBlock: CmsSharedSliderBlock
}

export const Slider: FC<Props> = ({ sliderBlock }) => {
  return (
    <Box sx={ { py: 5 } }>
      <Heading as="h2">{ sliderBlock.title }</Heading>
      <Flex sx={ { gap: 4 } }>
        { sliderBlock.quotes.map((quote) => (
          <Card key={ quote.id } sx={ { p: 4, flex: '1 1 auto' } }>
            <Box mb={ 3 }>
              <RichTextRenderer content={ quote.body }/>
            </Box>
            <Paragraph>{ quote.title }</Paragraph>
          </Card>
        )) }
      </Flex>
    </Box>
  )
}
