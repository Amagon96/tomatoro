import { User } from '@supabase/supabase-js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Profile } from '~/@types/types.db'
import { SegmentType } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'
import { retrieveProfile } from '~/utils/supabase/queries/profile.query'
import { createSegment } from '~/utils/supabase/queries/segments.query'

export const UserContext = React.createContext<{
  user: User | null
  profile: Profile | null
  reportSegment(type: SegmentType, duration?: number): void
  refreshProfile(): Promise<void>
} | undefined>(undefined)

export const useUserContext = () => {
  const context = React.useContext(UserContext)

  if (context === undefined) {
    throw new Error(
      'useUserContext must be used within a UserContext.Provider',
    )
  }

  return context
}

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const reportSegment = useCallback(async (type: SegmentType, duration = 0) => {
    await createSegment(supabase, type, duration)
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    const { profile, user } = await retrieveProfile(supabase)
    setUser(user)
    setProfile(profile)
  }, [supabase])

  useEffect(() => {
    refreshProfile().then()
  }, [refreshProfile])

  const value = useMemo(() => ({
    user,
    profile,
    reportSegment,
    refreshProfile,
  }
  ), [profile, refreshProfile, reportSegment, user])

  return (
    <UserContext.Provider value={ value }>
      { children }
    </UserContext.Provider>
  )
}
