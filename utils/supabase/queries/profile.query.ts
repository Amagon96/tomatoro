import { SupabaseClient, User } from '@supabase/supabase-js'

import { Profile } from '~/@types/types.db'

interface RetrieveProfileResult {
  user: User,
  profile: Profile | null
}

export async function retrieveProfile (supabase: SupabaseClient): Promise<RetrieveProfileResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    throw userError || new Error('User not found')
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select()
    .eq('user_id', userData.user.id)

  if (profileError) {
    throw profileError
  }

  return {
    user: userData.user,
    profile: profileData.length > 0 ? profileData[0] : null,
  } satisfies RetrieveProfileResult
}
