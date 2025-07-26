import { SupabaseClient } from '@supabase/supabase-js'
import { eachDayOfInterval, endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

import { Segment } from '~/@types/types.db'
import { SegmentType } from '~/utils/config'

export async function createSegment (supabase: SupabaseClient, type: SegmentType, duration: number = 0) {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    throw userError || new Error('User not found')
  }

  const { error } = await supabase
    .from('segments')
    .insert({
      type,
      user_id: userData.user.id,
      duration,
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
  supabase: SupabaseClient,
  year = new Date().getFullYear(),
  month = new Date().getMonth(), // zero-indexed (0 = January)
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone // e.g., 'America/Mexico_City'
) {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    throw userError || new Error('User not found')
  }

  const from = startOfMonth(new Date(year, month))
  const to = endOfMonth(from)

  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('user_id', userData.user.id)
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
