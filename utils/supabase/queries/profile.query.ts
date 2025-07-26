import { SupabaseClient, User } from '@supabase/supabase-js'

import { Profile } from '~/@types/types.db'

export async function retrieveUser (supabase: SupabaseClient): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    console.info('[INFO] User not found')
    return null
  }

  return data.user
}

export async function retrieveProfile (supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select()
    .eq('user_id', userId)

  if (profileError) {
    throw profileError
  }

  return profileData.length > 0 ? profileData[0] : null
}
