import { SupabaseClient, User } from '@supabase/supabase-js'
import { eachDayOfInterval, endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

import { Segment } from '~/@types/types.db'
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

export type WeeklyReport = Array<{
  day: string,
  segments: Array<Segment>
}>

export async function retrieveMonthlyReport (
  context: SupabaseContext,
  year = new Date().getFullYear(),
  month = new Date().getMonth(), // zero-indexed (0 = January)
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone // e.g., 'America/Mexico_City'
) {
  if (!context.user) {
    return
  }

  const from = startOfMonth(new Date(year, month))
  const to = endOfMonth(from)

  const { data, error } = await context.supabase
    .from('segments')
    .select('*')
    .eq('user_id', context.user.id)
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())

  if (error) {
    throw error
  }

  return eachDayOfInterval({ start: from, end: to }).map(localDate => {
    const segments = (data ?? []).filter(seg => {
      const utc = parseISO(seg.created_at)
      const local = toZonedTime(utc, timezone)
      return isSameDay(local, localDate)
    })

    return {
      day: format(localDate, 'yyyy-MM-dd'),
      segments,
    }
  })
}
