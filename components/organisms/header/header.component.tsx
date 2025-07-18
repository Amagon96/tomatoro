import { AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { usePostHog } from 'posthog-js/react'
import { FC } from 'react'
import { Box, Flex, Button, MenuButton, Close, Text, NavLink } from 'theme-ui'
import { useBoolean } from 'usehooks-ts'

import { useUserContext } from '~/contexts/user'
import logoTomatoro from '~/public/svg/logo-tomatoro.svg'
import { LINKS, PAGES } from '~/utils/config'

import { Container, Heading, MotionNav } from './header.styles'

export const Header = () => {
  const { locale = 'en' } = useRouter()
  const { t } = useTranslation('common')
  const { setFalse, setTrue, value } = useBoolean(false)
  const { user } = useUserContext()
  const posthog = usePostHog()
  const isUserActivityEnabled = posthog.isFeatureEnabled('user-activity') || true

  // @ts-ignore
  const pagesForLocale = PAGES[locale]

  const menuItems = [
    { key: 'home', href: LINKS.HOME },
    { key: 'howItWorks', href: pagesForLocale.HOW_IT_WORKS },
    { key: 'contact', href: pagesForLocale.CONTACT },
  ]

  function NavItems ({ direction = 'row' }: { direction?: 'row' | 'column' }) {
    return (
      <Flex sx={ { flexDirection: direction, gap: 3 } }>
        { menuItems.map((item) => (
          <NavLink key={ item.key } as={ Link } href={ item.href } onClick={ () => setFalse() }>
            <Text variant="nav">
              { t(`header.items.${ item.key }`) }
            </Text>
          </NavLink>
        )) }
      </Flex>
    )
  }

  function DesktopOtherActions () {
    return user ? (
      <>
        <Box sx={ { display: ['none', 'block'] } }>
          <NavLink as={ Link } href={ LINKS.LOGOUT } onClick={ () => setFalse() }>
            <Text variant="nav">
              { t('header.items.logout') }
            </Text>
          </NavLink>
        </Box>
        <Box sx={ { display: ['none', 'block'] } }>
          {/* @ts-ignore */ }
          <Button as={ Link } href={ LINKS.DASHBOARD }>
            { t('header.items.dashboard') }
          </Button>
        </Box>
      </>
    ) : (
      <>
        <Box sx={ { display: ['none', 'block'] } }>
          <NavLink as={ Link } href={ LINKS.LOGIN } onClick={ () => setFalse() }>
            <Text variant="nav">
              { t('header.items.login') }
            </Text>
          </NavLink>
        </Box>
        <Box sx={ { display: ['none', 'block'] } }>
          {/* @ts-ignore */ }
          <Button as={ Link } href={ LINKS.REGISTER }>
            { t('header.items.register') }
          </Button>
        </Box>
      </>
    )
  }

  function MobileOtherActions () {
    return user ? (
      <>
        <NavLink as={ Link } href={ LINKS.LOGOUT } onClick={ () => setFalse() }>
          <Text variant="nav">
            { t('header.items.logout') }
          </Text>
        </NavLink>
        {/* @ts-ignore */ }
        <Button as={ Link } href={ LINKS.DASHBOARD }>
          { t('header.items.dashboard') }
        </Button>
      </>
    ) : (
      <>
        <NavLink as={ Link } href={ LINKS.LOGIN } onClick={ () => setFalse() }>
          <Text variant="nav">
            { t('header.items.login') }
          </Text>
        </NavLink>
        {/* @ts-ignore */ }
        <Button as={ Link } href={ LINKS.REGISTER }>
          { t('header.items.register') }
        </Button>
      </>
    )
  }

  return (
    <Container as="header" sx={ { borderColor: 'muted' } }>
      <Flex variant="styles.contained" sx={ { justifyContent: 'space-between', alignItems: 'center' } }>
        {/* Left: logo + links (desktop only) */ }
        <Flex sx={ { alignItems: 'center', gap: 3 } }>
          <TomatoroLogo/>
          <Box sx={ { display: ['none', 'flex'] } }>
            <NavItems/>
          </Box>
        </Flex>

        {/* Right: auth links */ }
        <Flex sx={ { alignItems: 'center', gap: 3 } }>
          { isUserActivityEnabled && <DesktopOtherActions/> }

          {/* Burger icon (mobile only) */ }
          <Box sx={ { display: ['block', 'none'] } }>
            {
              value ? (
                <Close onClick={ () => setFalse() }/>
              ) : (
                <MenuButton
                  aria-label={ t('header.toggle') }
                  onClick={ () => setTrue() }
                />
              )
            }
          </Box>
        </Flex>
      </Flex>

      {/* Mobile nav menu */ }
      <AnimatePresence>
        { value && (
          <MotionNav
            initial={ { height: 0, opacity: 0 } }
            animate={ { height: 'auto', opacity: 1 } }
            exit={ { height: 0, opacity: 0 } }
            transition={ { duration: 0.2 } }
          >
            <Flex
              sx={ {
                flexDirection: 'column',
                gap: 3,
                p: 3,
                pb: 4,
                display: ['flex', 'none'],
              } }
            >
              <NavItems direction="column"/>
              { isUserActivityEnabled && <MobileOtherActions/> }
            </Flex>
          </MotionNav>
        ) }
      </AnimatePresence>
    </Container>
  )
}

const TomatoroLogo: FC = () => {
  const { t } = useTranslation('common')

  return (
    <Link href="/" title="Go to Tomatoro Home">
      <Image
        src={ logoTomatoro }
        alt={ t('header.logoAlt') }
        width={ 150 }
        height={ 30 }
        aria-hidden
        loading="lazy"
      />
      <Heading as="h1">{ t('header.title') }</Heading>
    </Link>
  )
}
