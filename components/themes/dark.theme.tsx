import { lighten } from '@theme-ui/color'
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

const maxWidth = '1000px'
const colorTransitionAnimationTime = 0.1

export const darkTheme: Theme = {
  fonts: {
    body: openSans.style.fontFamily,
    heading: openSans.style.fontFamily,
    monospace: ibmPlexMono.style.fontFamily,
  },
  colors: {
    contrastText: '#ffffff',
    textHighEmphasis: rgba('#fff', 0.87),
    textMediumEmphasis: rgba('#fff', 0.6),
    textLowEmphasis: rgba('#fff', 0.38),
    muted: rgba('#fff', 0.15),
    background: '#212121',
    primary: '#DA3B1B',
    yellow: '#eab440',
    green: '#647C46',
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
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '6em',
      fontWeight: 'bold',
    },
    invertedDisplay: {
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '4em',
      fontWeight: 'bold',
    },
    title: {
      fontSize: '2em',
      fontFamily: 'heading',
      color: 'textHighEmphasis',
    },
    paragraph: {
      color: 'textMediumEmphasis',
      lineHeight: '1.75em',
      '& > img': {
        maxWidth,
      },
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
      color: 'background',
      fontWeight: 'normal',
      '&:hover': {
        color: 'primary',
      },
    },
  },
  buttons: {
    primary: {
      color: 'textHighEmphasis',
      fontFamily: 'body',
      minWidth: 'auto',
      height: 'max-content',
      transition: `background-color ${colorTransitionAnimationTime}s ease-in-out, opacity ${colorTransitionAnimationTime}s ease-in-out`,
      willChange: 'background-color, opacity',
      '&:hover, &:focus, &:active': {
        bg: lighten('primary', 0.2),
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
        color: 'white',
        fontWeight: 'normal',
        opacity: 1,
        cursor: 'not-allowed',
      },
    },
  },
  messages: {
    warn: {
      backgroundColor: '#362a2aff',
      borderColor: '#d98b6c',
      color: '#f3dedeff',
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
      bg: '#1e1e1e',
      color: 'textHighEmphasis',
    },
    label: {
      color: 'textMediumEmphasis',
      fontFamily: 'body',
    },
    slider: {
      backgroundColor: rgba('#fff', 0.15),
      color: 'primary',
      height: 8,
    },
    select: {
      borderColor: '#555',
      color: 'textHighEmphasis',
      bg: '#1e1e1e',
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
      borderRadius: 16,
      border: '1px solid #444',
      bg: '#1e1e1e',
    },
    widget: {
      bg: rgba('#fff', 0.05),
      padding: 4,
      borderRadius: 2,
      border: '1px solid #444',
    },
    question: {
      pt: 4,
      borderTop: '1px solid #444',
    },
    popup: {
      padding: 3,
      borderRadius: 2,
      border: '1px solid #444',
      backgroundColor: '#1e1e1e',
      maxWidth: '240px',
    },
  },
  styles: {
    root: {
      color: 'textHighEmphasis',
    },
    a: {
      borderBottom: '1px solid',
      color: 'primary',
      py: 1,
      textDecoration: 'none',
      transition: 'background-color 0.15s ease-in-out, color 0.1s ease-in-out',
      willChange: 'background-color, color',
      '&:hover, &:focus, &:active': {
        color: 'black',
        backgroundColor: 'primary',
      },
    },
    hr: {
      borderColor: 'primary',
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
