import { User } from '@supabase/supabase-js'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { SegmentType } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'
import { createSegment, retrieveWeeklyReport, WeelyReport } from '~/utils/supabase/queries/segments.query'

export const UserContext = React.createContext<{
  user?: User | null
  reportSegment(type: SegmentType): void
  getWeeklyReport(): Promise<WeelyReport | undefined>
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

  const reportSegment = useCallback(async (type: SegmentType) => {
    await createSegment(context, type)
  }, [context])

  const getWeeklyReport = useCallback(async () => {
    return await retrieveWeeklyReport(context)
  }, [context])

  const value = {
    user,
    reportSegment,
    getWeeklyReport,
  }

  return (
    <UserContext.Provider value={ value }>
      { children }
    </UserContext.Provider>
  )
}
