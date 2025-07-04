import { differenceInCalendarDays } from 'date-fns'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { ThemeUIProvider } from 'theme-ui'
import { useLocalStorage } from 'usehooks-ts'

import { getTheme, globalStyles } from '~/components/themes'
import {
  NotificationsProvider,
} from '~/contexts/notifications/notifications-context.provider'
import { TimerProvider } from '~/contexts/timer'
import { UsersProvider } from '~/contexts/user'
import { useIntervalsStore } from '~/stores/intervals'
import { init, trackEvent } from '~/utils/analytics'

init()

export default function App ({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { lastReset, resetIntervals } = useIntervalsStore()
  const [theme] = useLocalStorage('theme', 'light')

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => trackEvent('PAGE_VIEW')
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  })

  useEffect((() => {
    // Temporal fix for uninstalling previous worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.unregister()
        console.log('unregistered!')
        trackEvent('LEGACY_WORKER_UNINSTALLED')
      })
    }
  }))

  useEffect(() => {
    const query = router.query
    const { slug, ...currentQuery } = query

    if (Object.keys(currentQuery).length === 0) {
      return
    }

    const url = slug ? { query: { slug } } : {}

    if (router.isReady) {
      router.push(url, undefined, { shallow: true }).then()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  /*
   * Restores the intervals store if lastReset was a day ago
   */
  useEffect(() => {
    if (!lastReset) {
      resetIntervals()
      return
    }

    const shouldResetIntervals = differenceInCalendarDays(new Date(), new Date(lastReset!)) > 0

    if (shouldResetIntervals) {
      resetIntervals()
      trackEvent('INTERVALS_RESET')
    }
  }, [lastReset, resetIntervals])

  return (
    <PostHogProvider client={ Posthog }>
      <ThemeUIProvider theme={ getTheme(theme) }>
        <UsersProvider>
          <NotificationsProvider>
            <TimerProvider>
              { globalStyles }
              {/* @ts-ignore */ }
              <Component { ...pageProps } />
            </TimerProvider>
          </NotificationsProvider>
        </UsersProvider>
      </ThemeUIProvider>
    </PostHogProvider>
  )
}
