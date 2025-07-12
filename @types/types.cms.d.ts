type Locale = 'en' | 'es'

type CmsEntry = {
  id: number,
  createdAt: string
  updatedAt: string
}

type LocalizedCmsEntry = CmsEntry & {
  locale: Locale
}

type CloudinaryImage = {
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/jpg'
  height: number
  width: number
  url: string
  alternativeText: string | null
}

type CloudinaryVideo = {
  mime: 'video/mp4'
  height: number
  width: number
  url: string
}

type Seo = LocalizedCmsEntry & {
  metaTitle: string
  metaDescription: string
  canonicalURL: string
  structuredData: string
  keywords: string
  shareImage: CloudinaryImage & {
    formats: {
      thumbnail: CloudinaryImage
      small: CloudinaryImage
      medium: CloudinaryImage
      large: CloudinaryImage
    }
  }
}

type CmsSharedRichTextBlock = {
  '__component': 'shared.rich-text',
  id: number
  body: string
}

type CmsSharedSliderBlock = {
  '__component': 'shared.slider',
  id: number
  title: string
  quotes: Array<{
    id: number
    title: string
    body: string
  }>
}

type CmsSharedMediaBlock = {
  '__component': 'shared.media',
  id: number
  file: CloudinaryImage | CloudinaryVideo
}

type PageContentBlocks = Array<CmsSharedRichTextBlock | CmsSharedSliderBlock | CmsSharedMediaBlock>

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
