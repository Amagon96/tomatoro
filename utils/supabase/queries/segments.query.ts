import { SupabaseClient, User } from '@supabase/supabase-js'
import { addDays, startOfWeek } from 'date-fns'

import { SegmentType } from '~/utils/config'

interface SupabaseContext {
  supabase: SupabaseClient
  user?: User | null
}

export async function createSegment (context: SupabaseContext, type: SegmentType) {
  if (!context.user) {
    return
  }

  const { error } = await context.supabase.from('segments').insert({
    type,
    user_id: context.user.id,
  })

  if (error) {
    throw error
  }
}

export type WeelyReport = Array<{ day: string, segments: any[] }>

export async function retrieveWeeklyReport (context: SupabaseContext) {
  if (!context.user) {
    return
  }

  const from = startOfWeek(new Date(), { weekStartsOn: 1 }) // monday
  const to = addDays(from, 7)

  const { data, error } = await context.supabase
    .from('segments')
    .select('*')
    .gte('created_at', from.toISOString())
    .lt('created_at', to.toISOString())

  const grouped = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(from, i).toISOString().slice(0, 10)
    return {
      day,
      segments: data?.filter(seg =>
        seg.created_at.startsWith(day)
      ) || [],
    }
  })

  if (error) {
    throw error
  }

  return grouped satisfies WeelyReport
}
