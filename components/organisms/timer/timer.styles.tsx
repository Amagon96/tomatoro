import styled from '@emotion/styled'
import _Image from 'next/image'
import { Button as _Button, Flex } from 'theme-ui'

export const Image = styled(_Image)`
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: -1;
`

export const Controls = styled(Flex)`
  gap: 1em;
`

export const Button = styled(_Button)`
  width: 100px;
`
