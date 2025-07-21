import { User } from '@supabase/supabase-js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { SegmentType } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'
import { createSegment } from '~/utils/supabase/queries/segments.query'

export const UserContext = React.createContext<{
  user?: User | null
  reportSegment(type: SegmentType, duration?: number): void
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
  const context = useMemo(() => ({ supabase, user }), [supabase, user])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const reportSegment = useCallback(async (type: SegmentType, duration = 0) => {
    await createSegment(context, type, duration)
  }, [context])

  const value = {
    user,
    reportSegment,
  }

  return (
    <UserContext.Provider value={ value }>
      { children }
    </UserContext.Provider>
  )
}
