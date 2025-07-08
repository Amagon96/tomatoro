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
  const { data: obj } = await axios.get<CmsResponse<CmsPageEntry>>(`${ CMS_URL }/articles?filters[slug][$eq]=${ slug }&populate[0]=blocks${ localeParam }`)

  return obj.data[0]
}

const localeToBlogCategoryId = {
  'en': 1,
  'es': 5,
}

export const getAllBlogs = async (locale: Locale) => {
  const { data: obj } = await axios.get<CmsResponse<CmsPageEntry>>(`${ CMS_URL }/posts?filters[category]=${ localeToBlogCategoryId[locale] }&locale=${ locale }`)
  return obj.data
}

const localeToHelpCategoryId = {
  'en': 2,
  'es': 3,
}

export const getAllHelpEntries = async (locale: Locale) => {
  const { data: obj } = await axios.get<CmsResponse<CmsPageEntry>>(`${ CMS_URL }/posts?filters[category]=${ localeToHelpCategoryId[locale] }&locale=${ locale }`)
  return obj.data
}

export const getUpdates = async (locale?: string) => {
  const localeParam = locale ? `?locale=${ locale }` : ''
  const { data: obj } = await axios.get<CmsResponse<Update>>(`${ CMS_URL }/updates${ localeParam }`)
  return obj.data
}

export const getBanners = async (location?: string, locale?: string) => {
  const additionalLocation = location ? `filters[location][$in][1]=${ location }&` : ''
  const query = `filters[location][$in][0]=all&${ additionalLocation }sort=createdAt:desc&pagination[start]=0&pagination[limit]=1`
  const localeParam = locale ? `&locale=${ locale }` : ''
  const { data: obj } = await axios.get<CmsResponse<Banner>>(`${ CMS_URL }/banners?${ query }${ localeParam }`)
  return obj.data
}

export const getQuestions = async (locale?: string) => {
  const localeParam = locale ? `?locale=${ locale }` : ''
  const { data: obj } = await axios.get<CmsResponse<Question>>(`${ CMS_URL }/questions${ localeParam }`)
  return obj.data
}

export const getSingleType = async <T>(apiId: string, extraParams?: string, locale?: string) => {
  const localeParam = locale ? `&locale=${ locale }` : ''
  const { data: obj } = await axios.get<CmsSingleEntryResponse<T>>(`${ CMS_URL }/${ apiId }?${ extraParams }${ localeParam }`)
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
  marketing: true
}

export const postSubscription = async <T>(subscription: SubscriptionBody) => {
  const { data: obj } = await axios.post<CmsSingleEntryResponse<T>>(
    `${ CMS_URL }/subscriptions`,
    { data: subscription },
  )
  return obj.data
}
