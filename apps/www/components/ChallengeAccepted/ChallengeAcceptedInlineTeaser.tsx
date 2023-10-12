import { gql, useQuery } from '@apollo/client'
import { useMe } from 'lib/context/MeContext'
import withLocalColorScheme from './withColorScheme'
import { challengeAcceptedColors } from './colors'
import { css } from 'glamor'
import {
  Button,
  Center,
  fontStyles,
  plainLinkRule,
  mediaQueries,
} from '@project-r/styleguide'
import NewsletterSignUp from 'components/Auth/NewsletterSignUp'
import Link from 'next/link'
import Image from 'next/image'
import ChallengeAcceptedSVG from '../../public/static/challenge-accepted/challenge-accepted.svg'
import { useRouter } from 'next/router'

const styles = {
  p: css({
    ...fontStyles.sansSerifRegular18,
  }),
  a: css({
    color: 'var(--color-primary)',
    ...fontStyles.sansSerifRegular23,
  }),
  actionWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    '& *': {
      [mediaQueries.mUp]: {
        flexFlow: 'nowrap',
      },
    },
    '& button': {
      borderColor: 'var(--color-primary)',
    },
  }),
}

// TODO: ensure correct newslettername for challenge-accepted
const NEWSLETTER_NAME = 'CLIMATE'

const CAP = ({ children, ...props }) => (
  <p {...styles.p} {...props}>
    {children}
  </p>
)

const CAOverViewLink = () => (
  <Link {...plainLinkRule} {...styles.a} href='/challenge-accepted'>
    Zur Übersicht →
  </Link>
)

const CANewsLetterSignUp = () => (
  <div {...css({ width: '100%' })}>
    <NewsletterSignUp name={NEWSLETTER_NAME} free />
  </div>
)

type CAInlineTeaserProps = {
  isMember: boolean
  isNLSubscribed: boolean
}

function CATopInlineTeaser({ isMember, isNLSubscribed }: CAInlineTeaserProps) {
  if (isMember && isNLSubscribed) {
    return null
  }

  if (isMember) {
    return (
      <>
        <CAP>
          Die Klimakrise ist hier. Die Lage ist ernst. Challenge accepted. Wir
          richten den Blick auf Menschen, die in der Klimakrise einen
          Unterschied machen wollen. Und gehen gemeinsam der Frage nach: Wie
          kommen wir aus dieser Krise wieder raus? Neugierig, kritisch,
          konstruktiv. Mit Artikeln, Debatten, Veranstaltungen. Sind Sie dabei?
        </CAP>
        <div {...styles.actionWrapper}>
          <CANewsLetterSignUp />
          <CAOverViewLink />
        </div>
      </>
    )
  }

  return (
    <>
      <CAP>
        Die Klimakrise ist hier. Die Lage ist ernst. Challenge accepted. Wir
        richten den Blick auf Menschen, die in der Klimakrise einen Unterschied
        machen wollen. Und gehen gemeinsam der Frage nach: Wie kommen wir aus
        dieser Krise wieder raus? Neugierig, kritisch, konstruktiv. Mit
        Artikeln, Debatten, Veranstaltungen. Sind Sie dabei?
      </CAP>
      <div {...styles.actionWrapper}>
        <CANewsLetterSignUp />
        <CAOverViewLink />
      </div>
    </>
  )
}

function CABottomInlineTeaser({
  isMember,
  isNLSubscribed,
}: CAInlineTeaserProps) {
  const router = useRouter()
  if (isMember && isNLSubscribed) {
    return (
      <>
        <CAP>
          Wem würde ein frischer Blick auf die Klimakrise gut tun? Teilen Sie
          diesen Link mit Freunden, auf Social Media, im Gruppenchat.
        </CAP>
        <div {...styles.actionWrapper}>
          <p>TBD: Share Link</p>
          <CAOverViewLink />
        </div>
      </>
    )
  }

  if (isMember) {
    return (
      <>
        <div {...styles.actionWrapper}>
          <CANewsLetterSignUp />
          <CAOverViewLink />
        </div>
      </>
    )
  }

  return (
    <>
      <CAP>
        Dieser Artikel existiert, weil über 28&apos;000 Menschen die Republik
        mit einer Mitgliedschaft unterstützen. Wollen Sie mehr davon, und liegt
        Ihnen ein informierter, konstruktiver Austausch über die Klimakrise am
        Herzen?
      </CAP>
      <div {...styles.actionWrapper}>
        <Button primary onClick={() => router.push('/angebote')}>
          Werden Sie jetzt Mitglied
        </Button>
      </div>
    </>
  )
}

function ChallengeAcceptedInlineTeaser(props: { position?: 'top' | 'bottom' }) {
  const { hasActiveMembership, meLoading } = useMe()

  const { data: challengeAcceptedNLData, loading: challengeAcceptedNLLoading } =
    useQuery<CANewsterQueryResult, CANewsletterQueryVariables>(
      CA_NEWSLETTER_QUERY,
      {
        variables: {
          name: NEWSLETTER_NAME,
        },
      },
    )

  if (meLoading || challengeAcceptedNLLoading) {
    return null
  }

  const isSubscribedToNL =
    challengeAcceptedNLData?.me?.newsletterSettings?.subscriptions?.[0]
      ?.subscribed

  if (props.position === 'top' && isSubscribedToNL && hasActiveMembership) {
    return null
  }

  return (
    <div
      {...css({
        backgroundColor: 'var(--color-default)',
      })}
    >
      <Center>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            margin: '1rem 0',
          }}
        >
          <Image
            src={ChallengeAcceptedSVG}
            alt='Challenge Accepted'
            width={200}
          />
          {props.position === 'top' && (
            <CATopInlineTeaser
              isMember={hasActiveMembership}
              isNLSubscribed={isSubscribedToNL}
            />
          )}
          {props.position === 'bottom' && (
            <CABottomInlineTeaser
              isMember={hasActiveMembership}
              isNLSubscribed={isSubscribedToNL}
            />
          )}
        </div>
      </Center>
    </div>
  )
}

export default withLocalColorScheme(
  ChallengeAcceptedInlineTeaser,
  challengeAcceptedColors,
)

export const CA_NEWSLETTER_QUERY = gql(`
  query CANewsletterQuery(
    $name: NewsletterName!
  ) {
    me {
      newsletterSettings {
        id
        status
        subscriptions(name: $name) {
          id
          name
          subscribed
        }
      }
    }
  }
`)

export type CANewsterQueryResult = {
  me: null | {
    newsletterSettings: {
      id: string
      status: string
      subscriptions:
        | null
        | ({
            id: string
            name: string
            subscribed: boolean
          } | null)[]
    }
  }
}

export type CANewsletterQueryVariables = {
  name: string
}
