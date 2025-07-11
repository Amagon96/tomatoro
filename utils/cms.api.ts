import axios from 'axios'

import { isCleanInput } from '~/utils/clean-input'
import { CMS_URL } from '~/utils/config'

interface CmsResponse<T> {
  data: T[];
  meta: never;
}

interface CmsSingleEntryResponse<T> {
  data: T;
  meta: never;
}

axios.interceptors.request.use(
  config => {
    config.headers['Authorization'] = `Bearer ${ process.env.NEXT_PUBLIC_CMS_API_KEY }`
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

export const getArticleBySlug = async (slug: string, locale?: string) => {
  if (!isCleanInput(slug)) {
    throw new Error('Invalid slug')
  }

  const localeParam = locale ? `&locale=${ locale }` : ''
  const { data: obj } = await axios.get<CmsResponse<CmsArticleEntry>>(`${ CMS_URL }/articles?filters[slug][$eq]=${ slug }&populate[]=blocks&populate[]=seo&populate[]=seo.shareImage${ localeParam }`)

  return obj.data[0]
}

const blogCategoryId = 1

export const getAllArticles = async (locale: Locale) => {
  const { data: obj } = await axios.get<CmsResponse<CmsArticleEntry>>(`${ CMS_URL }/articles?filters[category][$eq]=${ blogCategoryId }&locale=${ locale }`)
  return obj.data
}

const helpCategoryId = 2

export const getAllHelpEntries = async (locale: Locale) => {
  const { data: obj } = await axios.get<CmsResponse<CmsArticleEntry>>(`${ CMS_URL }/articles?filters[category][$eq]=${ helpCategoryId }&locale=${ locale }`)
  return obj.data
}

export const getSingleType = async <T>(apiId: string, extraParams?: string, locale?: string) => {
  const localeParam = locale ? `&locale=${ locale }` : ''
  const { data: obj } = await axios.get<CmsSingleEntryResponse<T>>(`${ CMS_URL }/${ apiId }?${ extraParams }${ localeParam }`)
  return obj.data
}

export const getQuestions = async (locale?: string) => {
  const localeParam = locale ? `&locale=${ locale }` : ''
  const { data: obj } = await axios.get<CmsResponse<Question>>(`${ CMS_URL }/faqs?populate[0]=blocks${ localeParam }`)
  return obj.data
}

export interface RatingBody {
  slug: string
  rate: 'great' | 'good' | 'bad'
}

export const postRating = async <T>(rating: RatingBody) => {
  const { data: obj } = await axios.post<CmsSingleEntryResponse<T>>(
    `${ CMS_URL }/page-ratings`,
    { data: rating },
  )
  return obj.data
}

export interface SubscriptionBody {
  email: string
}

export const postSubscription = async <T>(subscription: SubscriptionBody) => {
  const { data: obj } = await axios.post<CmsSingleEntryResponse<T>>(
    `${ CMS_URL }/subscriptions`,
    { data: subscription },
  )
  return obj.data
}
