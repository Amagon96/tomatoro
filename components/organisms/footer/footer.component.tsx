import Link from 'next/link'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import React, { FC, useMemo } from 'react'
import { Flex, Heading, NavLink, Text } from 'theme-ui'

import { LanguageSelector } from '~/components/molecules/language-selector'
import { LINKS, PAGES } from '~/utils/config'

import { Container, section, Section } from './footer.styles'
import { FooterLink } from './footer.types'

interface Props {
  version?: string
}

export const Footer: FC<Props> = ({ version }) => {
  const { locale = 'en' } = useRouter()
  const { t } = useTranslation('common')

  const footerData = useMemo(() => {
    const pagesForLocale = PAGES[locale as keyof typeof PAGES]

    const siteItems: FooterLink[] = [
      { key: 'blog', href: pagesForLocale.BLOG },
      { key: 'terms', href: pagesForLocale.TERMS },
      { key: 'privacy', href: pagesForLocale.PRIVACY },
      { key: 'github', href: LINKS.GITHUB },
    ]

    const supportItems: FooterLink[] = [
      { key: 'help', href: pagesForLocale.HELP },
      { key: 'faq', href: pagesForLocale.FAQ },
      { key: 'status', href: LINKS.STATUS },
      { key: 'contact', href: pagesForLocale.CONTACT },
    ]

    const toolItems: FooterLink[] = [
      { key: 'tomatoro', href: LINKS.TOMATORO },
      { key: 'dolar', href: LINKS.DOLAR },
      { key: 'mitrabajo', href: LINKS.MITRABAJO },
    ]

    return {
      links: [
        { key: 'site', items: siteItems },
        { key: 'support', items: supportItems },
        { key: 'moreTools', items: toolItems },
      ],
      currentYear: new Date().getFullYear(),
    }
  }, [locale])

  return (
    <Container as="footer">
      <Flex sx={ section }>
        <Section>
          <NavLink href="/">
            <Heading as="h3">Tomatoro</Heading>
          </NavLink>
          <Text variant="small">
            { t('footer.lineOne') }
            <br/>
            { t('footer.lineTwo') }
          </Text>
        </Section>

        { footerData.links.map((linkGroup) => (
          <Section key={ linkGroup.key }>
            <Heading as="h4">{ t(`footer.groups.${ linkGroup.key }.title`) }</Heading>
            { linkGroup.items.map((item) => (
              <NavLink key={ item.key } as={ Link } href={ item.href } variant="footer">
                <Text variant="small">{ t(`footer.groups.${ linkGroup.key }.items.${ item.key }`) }</Text>
              </NavLink>
            )) }
          </Section>
        )) }
      </Flex>
      <Flex sx={ { ...section, color: 'textMediumEmphasis', justifyContent: 'flex-end' } }>
        <LanguageSelector />
      </Flex>
      <Flex sx={ section }>
        <Flex sx={ { flexDirection: 'column' } }>
          <Text variant="small" as="span">
            { t('footer.copyright', { currentYear: footerData.currentYear }) }
          </Text>

          <Text variant="small" as="span">
            { t('footer.disclaimer') }
          </Text>
        </Flex>

        { version && (
          <Text variant="small" sx={ { textAlign: ['left', 'right'] } }>
            v{ version }
          </Text>
        ) }
      </Flex>
    </Container>
  )
}
