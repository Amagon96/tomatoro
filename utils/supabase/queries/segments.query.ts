import { SupabaseClient, User } from '@supabase/supabase-js'

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
