type Locale = 'en' | 'es'

type Seo = {
  id: number
  metaTitle: string
  metaDescription: string
  canonicalURL: string
  structuredData: string
  keywords: string
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

type PageContentBlocks = Array<
  {
    '__component': 'shared.rich-text',
    id: number
    body: string
  }
>

// TODO merge with CmsArticleEntry
type BasicPage = {
  id: string
  title: string
  blocks: PageContentBlocks
  seo?: Seo
}

type CmsArticleEntry = BasicPage & {
  slug: string
  content: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  locale: Locale
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
  question: string
  blocks: PageContentBlocks
}
