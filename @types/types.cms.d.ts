type Locale = 'en' | 'es'

type Category = {
  id: number
  attributes: {
    title: string
    createdAt: string
    updatedAt: string
    locale: Locale
  }
}

type Seo = {
  id: number
  metaTitle: string
  metaDescription: string
  keywords: string
  metaRobots: string
  structuredData: string
  metaViewport: string
  canonicalURL: string
  metaImage: {
    data: Image | null
  }
}

type Format = {
  url: string
  width: number
  height: number
  mime: number
}

type Image = {
  id: number
  attributes: {
    name: string
    alternativeText: string
    caption: string
    width: number
    height: number
    url: string
    formats: {
      thumbnail?: Format
      small?: Format
      medium?: Format
      large?: Format
    }
  }
}

type CmsPageEntry = {
  id: number
  title: string
  slug: string
  content: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: Locale
  blocks: Array<{
    '__component': 'shared.rich-text',
    id: number
    body
  }>
}

type Update = {
  id: number
  attributes: {
    title: string
    locale: string
    publishedAt: string
    createdAt: string
    updatedAt: string
    date: string
  }
}

type Banner = {
  id: number
  attributes: {
    content: string
    start: string
    end: string
    location: string
    locale: string
    publishedAt: string
    createdAt: string
    updatedAt: string
  }
}

type Question = {
  id: number
  attributes: {
    question: string
    locale: string
    publishedAt: string
    createdAt: string
    updatedAt: string
    content: string
  }
}

type BasicPage = {
  id: string
  attributes: {
    title: string
    content: string
    locale: Locale
    publishedAt: string
    createdAt: string
    updatedAt: string
    hero: {
      data: Image | null
    }
    seo: Seo | null
  }
}
