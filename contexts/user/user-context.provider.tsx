import { User } from '@supabase/supabase-js'
import React, { useCallback, useEffect, useState } from 'react'

import { SegmentType } from '~/utils/config'
import { createClient } from '~/utils/supabase/component'

export const UserContext = React.createContext<{
  user?: User | null
  reportSegment(type: SegmentType): void
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const reportSegment = useCallback(async (type: SegmentType) => {
    if (!user) {
      return
    }

    const { error } = await supabase.from('segments').insert({
      type,
      user_id: user?.id,
    })

    if (error) {
      throw error
    }
  }, [supabase, user])

  const value = {
    user,
    reportSegment,
  }

  return (
    <UserContext.Provider
      value={ value }
    >
      { children }
    </UserContext.Provider>
  )
}
