type Locale = 'en' | 'es'

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

type PageContentBlocks = Array<
  {
    '__component': 'shared.rich-text',
    id: number
    body: string
  }
>

type BasicPage = {
  id: string
  blocks: PageContentBlocks
}

type CmsArticleEntry = BasicPage & {
  title: string
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
