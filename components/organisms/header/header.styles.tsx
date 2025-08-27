import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { Box, Heading as _Heading } from 'theme-ui'

export const Container = styled(Box)`
    border-bottom: 1px solid;
    position: sticky;
    top: 0;
    z-index: 1000;
    background: transparent;
    overflow: visible;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(12px);
        pointer-events: none;
        z-index: 0;
    }

    > * {
        position: relative;
        z-index: 1;
        width: 100%;
    }
`

export const Heading = styled(_Heading)`
    display: none;
`

export const MotionNav = styled(motion.nav)`
`
