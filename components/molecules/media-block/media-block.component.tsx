import Image from 'next/image'
import React, { FC, useMemo } from 'react'
import { Card } from 'theme-ui'

interface Props {
  mediaBlock: CmsSharedMediaBlock
}

export const MediaBlock: FC<Props> = ({ mediaBlock }) => {
  const renderMediaContent = useMemo(() => {
    const { file } = mediaBlock

    if (file.mime === 'video/mp4') {
      return (
        <video controls style={ { width: '100%' } }>
          <source src={ file.url } type="video/mp4"/>
          Your browser does not support the video tag.
        </video>
      )
    } else if (file.mime.startsWith('image/')) {
      return (
        <Image src={ file.url } alt={ file.alternativeText || '' } style={ { width: '100%' } }/>
      )
    }
  }, [mediaBlock])

  return (
    <Card sx={ { my: 5 } }>
      { renderMediaContent }
    </Card>
  )
}
