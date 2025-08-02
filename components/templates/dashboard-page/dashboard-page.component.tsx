import Link from 'next/link'
import React, { FC, PropsWithChildren, useMemo } from 'react'
import { Avatar, Flex, Grid, Text, NavLink } from 'theme-ui'

import { Page, PageProps } from '~/components/templates/page'
import { useUserContext } from '~/contexts/user'
import { PROFILE_THUMBNAILS } from '~/utils/config'

interface DashboardPageProps {
  subtitle?: PageProps['subtitle']
}

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Activity',
    href: '/dashboard/activity/weekly',
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
  },
]

export const DashboardPage: FC<PropsWithChildren<DashboardPageProps>> = ({
  children,
  subtitle,
}) => {
  const { profile, user } = useUserContext()

  const derivedState = useMemo(() => user ? {
    name: profile?.display_name || user.email,
    thumbnail: PROFILE_THUMBNAILS.find((pt) => pt.id === Number(profile?.thumbnail)) || PROFILE_THUMBNAILS[0],
  } : null, [profile, user])

  if (!derivedState) {
    return null
  }

  return (
    <Page subtitle={ subtitle }>
      <Flex variant="styles.contained" sx={ { alignItems: 'center', justifyContent: 'space-between' } }>
        <Flex as="nav">
          {
            MENU_ITEMS.map((item) => (
              <NavLink key={ item.href } as={ Link } href={ item.href } p={ 2 }>
                <Text variant="nav">
                  { item.label }
                </Text>
              </NavLink>
            ))
          }
        </Flex>
        {/* @ts-ignore */ }
        <Flex as={ Link } href="/dashboard/profile" sx={ { alignItems: 'center', gap: 3, textDecoration: 'none' } }>
          <Text variant="nav">{ derivedState.name }</Text>
          <Avatar src={ derivedState.thumbnail.src } sx={ { backgroundColor: 'white' } }/>
        </Flex>
      </Flex>
      <Grid variant="contained" sx={ { justifyItems: 'stretch', pb: 5 } }>
        { children }
      </Grid>
    </Page>
  )
}
