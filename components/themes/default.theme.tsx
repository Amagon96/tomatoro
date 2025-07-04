import { darken } from '@theme-ui/color'
import { IBM_Plex_Mono, Open_Sans } from 'next/font/google'
import { rgba } from 'polished'
import type { Theme } from 'theme-ui'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
})

const openSans = Open_Sans({
  subsets: ['latin'],
})

const maxWidth = '800px'
const colorTransitionAnimationTime = 0.1

export const defaultTheme: Theme = {
  fonts: {
    body: openSans.style.fontFamily,
    heading: openSans.style.fontFamily,
    monospace: ibmPlexMono.style.fontFamily,
  },
  text: {
    default: {
      fontFamily: 'body',
    },
    heading: {
      marginBottom: '0.5em',
    },
    small: {
      fontSize: '0.8em',
      fontFamily: 'body',
    },
    display: {
      color: 'background',
      fontFamily: 'monospace',
      fontSize: '6em',
      fontWeight: 'bold',
    },
    title: {
      fontSize: '2em',
      fontFamily: 'heading',
    },
    paragraph: {
      color: 'textMediumEmphasis',
      textAlign: 'justify',
      lineHeight: '1.75em',
    },
    invertedParagraph: {
      color: 'contrastText',
      textAlign: 'justify',
      lineHeight: '1.75em',
    },
    popup: {
      color: 'textMediumEmphasis',
      textAlign: 'left',
      lineHeight: '1.5em',
    },
    muted: {
      color: 'muted',
      fontFamily: 'body',
    },
    nav: {
      color: 'textMediumEmphasis',
      fontWeight: 'normal',
      '&:hover': {
        color: 'primary',
      },
    },
  },
  colors: {
    contrastText: '#fff',
    textHighEmphasis: rgba('#000', 0.87),
    textMediumEmphasis: rgba('#000', 0.6),
    textLowEmphasis: rgba('#000', 0.38),
    muted: rgba('#000', 0.15),
    background: '#fff',
    primary: '#DA3B1B',
    yellow: '#eab440',
    green: '#647C46',
  },
  buttons: {
    primary: {
      color: 'white',
      fontFamily: 'body',
      minWidth: 'auto',
      height: 'max-content',
      transition: `background-color ${colorTransitionAnimationTime}s ease-in-out, opacity ${colorTransitionAnimationTime}s ease-in-out`,
      willChange: 'background-color, opacity',
      '&:hover, &:focus, &:active': {
        bg: darken('primary', 0.2),
      },
      '&:disabled': {
        opacity: 0.4,
        bg: 'primary',
      },
    },
    underlined: {
      color: 'textMediumEmphasis',
      bg: 'transparent',
      cursor: 'pointer',
      borderBottom: '1px solid',
      borderRadius: 0,
      padding: 1,
      fontFamily: 'body',
      transition: `background-color ${colorTransitionAnimationTime}s ease-in-out, opacity ${colorTransitionAnimationTime}s ease-in-out`,
      willChange: 'background-color, opacity',
      '&:hover, &:focus, &:active': {
        opacity: 0.4,
      },
      '&:disabled': {
        opacity: 0.3,
      },
    },
    rate: {
      px: 3,
      py: 1,
      fontSize: [5, 8],
      lineHeight: 'normal',
      cursor: 'pointer',
      '&:disabled': {
        opacity: 0.3,
        cursor: 'default',
      },
    },
    action: {
      color: 'primary',
      bg: 'background',
      cursor: 'pointer',
      border: 'background 2px solid',
      padding: 2,
      fontFamily: 'body',
      fontWeight: 'bold',
      transition: `background-color ${colorTransitionAnimationTime}s ease-in-out, opacity ${colorTransitionAnimationTime}s ease-in-out`,
      willChange: 'background-color, opacity',
      '&:hover, &:focus, &:active': {
        opacity: 0.6,
      },
      '&:disabled': {
        bg: 'transparent',
        color: 'background',
        fontWeight: 'normal',
        opacity: 1,
        cursor: 'not-allowed',
      },
    },
  },
  messages: {
    warn: {
      backgroundColor: '#fffced',
      borderColor: '#d98b6c',
    },
  },
  grids: {
    contained: {
      mx: 'auto',
      maxWidth,
      padding: '1em',
      width: '100%',
    },
  },
  forms: {
    input: {
      bg: 'background',
    },
    label: {
      color: 'textMediumEmphasis',
      fontFamily: 'body',
    },
    slider: {
      backgroundColor: rgba('#000', 0.15),
      color: 'primary',
      height: 8,
    },
    select: {
      borderColor: '#ccc',
    },
  },
  images: {
    hero: {
      backgroundSize: 'cover',
      height: '50vh',
      width: '100%',
    },
  },
  alerts: {
    primary: {
      color: 'background',
      bg: 'primary',
      margin: '1em auto 0',
      maxWidth,
    },
  },
  cards: {
    primary: {
      padding: 4,
      borderRadius: 2,
      border: '1px solid #ddd',
    },
    widget: {
      bg: rgba('#333', 0.03),
      padding: 4,
      borderRadius: 2,
      border: '1px solid #ddd',
    },
    question: {
      pt: 4,
      borderTop: '1px solid #ddd',
    },
    popup: {
      padding: 3,
      borderRadius: 2,
      border: '1px solid #ddd',
      backgroundColor: 'background',
      maxWidth: '240px',
    },
  },
  styles: {
    a: {
      borderBottom: '1px solid',
      color: 'primary',
      py: 1,
      textDecoration: 'none',
      transition: 'background-color 0.15s ease-in-out, color 0.1s ease-in-out',
      willChange: 'background-color, color',
      '&:hover, &:focus, &:active': {
        color: 'white',
        backgroundColor: 'primary',
      },
    },
    hr: {
      borderColor: '#eee',
      maxWidth,
      mx: 'auto',
    },
    contained: {
      mx: 'auto',
      maxWidth,
      padding: '1em',
      width: '100%',
    },
  },
}
