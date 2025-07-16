import { SegmentType } from '~/utils/config'

export type Segment = {
  type: SegmentType
  created_at: string
  duration: number
}
