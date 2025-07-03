import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { Close, Flex, Grid, MenuButton, NavLink, Text } from 'theme-ui'
import { useBoolean } from 'usehooks-ts'

import { LanguageSelector } from '~/components/molecules/language-selector'
import logoTomatoro from '~/public/svg/logo-tomatoro.svg'
import { LINKS, PAGES } from '~/utils/config'

import { Container, Heading, MotionNav } from './header.styles'

const menuVariants = {
  opened: {
    top: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.5,
    },
  },
  closed: {
    top: '-90vh',
  },
}

interface HeaderProps {
  user?: User | null
}

export const Header = ({user}: HeaderProps) => {
  const { locale = 'en' } = useRouter()
  const { t } = useTranslation('common')
  const { setFalse, setTrue, value } = useBoolean(false)

  // @ts-ignore
  const pagesForLocale = PAGES[locale]

  const anonItems = [
    { key: 'register', href: LINKS.REGISTER },
    { key: 'login', href: LINKS.LOGIN },
  ]

  const userItems = [
    { key: 'dashboard', href: LINKS.DASHBOARD },
    { key: 'logout', href: LINKS.LOGOUT },
  ]

  const menuItems = [
    { key: 'home', href: LINKS.HOME },
    { key: 'howItWorks', href: pagesForLocale.HOW_IT_WORKS },
    { key: 'contact', href: pagesForLocale.CONTACT },
    ...(user ? userItems : anonItems),
  ]

  return (
    <Container as="header">
      <Flex sx={ {
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        margin: '0 auto',
        maxWidth: '768px',
        width: '100%',
      } }>
        <Grid sx={ { gridTemplateColumns: ['1fr auto', '1fr auto'], width: '100%' } }>
          <TomatoroLogo/>
          <MenuButton
            aria-label={ t('header.toggle') }
            onClick={ () => setTrue() }
          />
        </Grid>
      </Flex>

      <MotionNav
        initial={ false }
        variants={ menuVariants }
        animate={ value ? 'opened' : 'closed' }
      >
        <Flex sx={ {
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          margin: '0 auto',
          maxWidth: '768px',
          width: '100%',
        } }>
          <Grid sx={ { gridTemplateColumns: ['1fr auto', '1fr auto'], width: '100%' } }>
            <TomatoroLogo/>
            <Close onClick={ () => setFalse() }/>
          </Grid>
        </Flex>
        <Flex sx={ {
          alignItems: 'center',
          backgroundColor: 'white',
          gap: '1rem',
          flexDirection: 'column',
          padding: '1.5rem 0',
          borderBottom: '1px solid #eee',
          borderTop: '1px solid #eee',
        } }>
          { menuItems.map((item) => (
            <NavLink key={ item.key } as={ Link } href={ item.href } onClick={ () => setFalse() }>
              <Text>
                { t(`header.items.${ item.key }`) }
              </Text>
            </NavLink>
          )) }
          <Text sx={ { cursor: 'pointer', fontWeight: 'bold' } } onClick={ () => setFalse() }>
            { t('header.items.close') }
          </Text>
          <LanguageSelector/>
        </Flex>
      </MotionNav>
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
