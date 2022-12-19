import { Fragment } from 'react'
import { css } from 'glamor'

import { Interaction, mediaQueries } from '@project-r/styleguide'

import Section from '../Section'

import withT from '../../../lib/withT'

const { P } = Interaction

const styles = {
  p: css({
    marginBottom: 20,
  }),
  actions: css({
    marginBottom: 20,
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    '& > button': {
      flexGrow: 1,
      margin: '5px 15px 0 0',
      minWidth: '120px',
      [mediaQueries.mUp]: {
        flexGrow: 0,
        margin: '5px 15px 0 0',
        minWidth: '160px',
      },
    },
  }),
}

const CallToAction = (props) => {
  const { t, user } = props
  const hasActiveMembership = user.activeMembership?.active

  /* 
  vor Link allg. text : Investieren Sie in Klimajournalismus
  - active member (hasActiveMembership): 
      link: /angebote?package=ABO_GIVE
      link text: Verschenken Sie eine Jahresmitgliedschaft. 
  - not active member (!hasActiveMembership): 
      link: /angebote?package=ABO
      link text: Werden Sie Verlegerin oder Verleger der Republik
  */

  // Is ticked when either???

  return (
    <Section
      heading={t('Onboarding/Sections/CallToAction/heading')}
      // isTicked={hasConsented}
      // showContinue={hasConsented}
      {...props}
    >
      <Fragment>
        <P {...styles.p}>
          {t('Onboarding/Sections/CallToAction/paragraph1', null, '')}
        </P>
      </Fragment>
    </Section>
  )
}

export default withT(CallToAction)
