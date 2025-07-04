import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { Box, Heading as _Heading } from 'theme-ui'

export const Container = styled(Box)`
    background-color: white;
    border-bottom: 1px solid;
    position: sticky;
    top: 0;
    z-index: 1;
`

export const Heading = styled(_Heading)`
    display: none;
`

export const MotionNav = styled(motion.nav)`
`
