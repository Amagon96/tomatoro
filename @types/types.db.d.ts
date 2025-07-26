import { SegmentType } from '~/utils/config'

type BaseSupabaseModel = {
  created_at: string
}

export type Profile = BaseSupabaseModel & {
  display_name: string
  thumbnail: number
}

export type Segment = BaseSupabaseModel & {
  type: SegmentType
  duration: number
}
