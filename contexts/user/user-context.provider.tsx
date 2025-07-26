import { User } from '@supabase/supabase-js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Profile } from '~/@types/types.db'
import { SegmentType } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'
import { retrieveProfile, retrieveUser } from '~/utils/supabase/queries/profile.query'
import { createSegment } from '~/utils/supabase/queries/segments.query'

export const UserContext = React.createContext<{
  user: User | null
  profile: Profile | null
  reportSegment(type: SegmentType, duration?: number): void
  refreshUser(): Promise<void>
  refreshProfile(userId: string): Promise<void>
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

  const refreshProfile = useCallback(async (userId: string) => {
    const profile = await retrieveProfile(supabase, userId)
    setProfile(profile)
  }, [supabase])

  const refreshUser = useCallback(async () => {
    const user = await retrieveUser(supabase)
    setUser(user)
    user && await refreshProfile(user.id)
  }, [refreshProfile, supabase])

  useEffect(() => {
    console.info('[INFO] Bootstrapping user context')
    refreshUser().then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({
    user,
    profile,
    reportSegment,
    refreshProfile,
    refreshUser,
  }
  ), [profile, refreshProfile, refreshUser, reportSegment, user])

  return (
    <UserContext.Provider value={ value }>
      { children }
    </UserContext.Provider>
  )
}
