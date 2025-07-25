// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import pkgJson from '/package.json'

import { NotificationPayload } from '~/contexts/notifications'

export const VERSION = pkgJson.version

export const NOTIFICATION: NotificationPayload = {
  title: 'Tomatoro',
  body: 'Time is up!',
  icon: 'https://tomatoro.com/svg/tomato.svg',
}

export const WORKER = {
  tick: 1000,
}

export type SegmentType = 'WORK' | 'SHORT' | 'LONG'

export interface Segment {
  name: string;
  time: number;
  type: SegmentType;
}

export const SEGMENTS: Record<SegmentType, Segment> = {
  WORK: { time: 25 * 60, type: 'WORK', name: 'segment.work' },
  SHORT: { time: 5 * 60, type: 'SHORT', name: 'segment.shortBreak' },
  LONG: { time: 15 * 60, type: 'LONG', name: 'segment.longBreak' },
}

/**
 * SEO STUFF
 */
export const SEO = {
  title: 'Tomatoro',
  subtitle: 'Unleash Productivity, One Tomatoro at a Time! 🍅🎯',
  // eslint-disable-next-line max-len
  description: 'Tomatoro will help you power through distractions, hyper-focus, and get things done in short bursts, while taking frequent breaks to get some air and relax.',
  // eslint-disable-next-line max-len
  keywords: 'tomatoro, unleash productivity, avoid distractions, focus, get things done, break, time management, avoid burnout, productivity, pomodoro, timer, tomato, work-life balance, efficiency, breaks, work intervals, study, task management',
  image: 'https://tomatoro.com/tomatoro-social-cover.jpg',
  url: 'https://tomatoro.com',
}

export const PAGES = {
  en: {
    TERMS: '/terms-of-service',
    PRIVACY: '/privacy-notice',
    FAQ: '/faq',
    HOW_IT_WORKS: '/how-it-works',
    CONTACT: '/contact',
    DASHBOARD: '/dashboard',
    BLOG: '/blog',
    HELP: '/help',
  },
  es: {
    TERMS: '/es/terminos-servicio',
    PRIVACY: '/es/aviso-privacidad',
    FAQ: '/es/preguntas-frecuentes',
    HOW_IT_WORKS: '/es/como-funciona',
    CONTACT: '/es/contacto',
    DASHBOARD: '/es/panel',
    PRICING: '/es/precios',
    BLOG: '/es/blog',
    HELP: '/es/ayuda',
  },
}

export const LINKS = {
  HOME: '/',
  SUPPORT: 'mailto:hello@tomatoro.com',
  GITHUB: 'https://github.com/tonymtz/tomatoro',
  FEEDBACK: 'https://goo.gl/forms/T9BxmGcn38dlZz2w1',
  STATUS: 'https://statuspage.freshping.io/65694-Tomatoro',
  TOMATORO: 'https://tomatoro.com?utm_source=footer&utm_medium=link&utm_campaign=tomatoro',
  DOLAR: 'https://dolarenbancos.com?utm_source=footer&utm_medium=link&utm_campaign=tomatoro',
  MITRABAJO: 'https://eslegalmitrabajo.com?utm_source=footer&utm_medium=link&utm_campaign=tomatoro',
  REGISTER: '/register',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  LOGOUT: '/api/auth/logout',
}

export const CMS_URL = 'https://cms.tomatoro.com/api'

export const PROFILE_THUMBNAILS = [
  { id: 1, url: 'https://placehold.co/100/DA3B1B/FFF' },
  { id: 2, url: 'https://placehold.co/100/EAB440/000' },
  { id: 3, url: 'https://placehold.co/100/647C46/FFF' },
  { id: 4, url: 'https://placehold.co/100/FFF/666' },
]
