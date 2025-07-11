type Locale = 'en' | 'es'

type CmsEntry = {
  id: number,
  createdAt: string
  updatedAt: string
}

type LocalizedCmsEntry = CmsEntry & {
  locale: Locale
}

type Seo = LocalizedCmsEntry & {
  metaTitle: string
  metaDescription: string
  canonicalURL: string
  structuredData: string
  keywords: string
}

type PageContentBlocks = Array<
  {
    '__component': 'shared.rich-text',
    id: number
    body: string
  }
>

type CmsArticleEntry = LocalizedCmsEntry & {
  title: string
  blocks: PageContentBlocks
  seo?: Seo
  slug: string
  publishedAt: string
}

type Banner = LocalizedCmsEntry & {
  id: number
  content: string
}

type Question = LocalizedCmsEntry & {
  question: string
  blocks: PageContentBlocks
}
