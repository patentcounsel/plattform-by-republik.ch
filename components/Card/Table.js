import React, { Fragment } from 'react'
import { css, merge } from 'glamor'
import { nest } from 'd3-collection'
import { ascending, descending } from 'd3-array'

import IgnoreIcon from './IgnoreIcon'
import FollowIcon from 'react-icons/lib/md/notifications-active'
import RevertIcon from 'react-icons/lib/md/rotate-left'

import MdCheck from 'react-icons/lib/md/check'

import {
  fontStyles, Editorial, plainButtonRule, InlineSpinner, colors
} from '@project-r/styleguide'

import { Link } from '../../lib/routes'
import { countFormat } from '../../lib/utils/format'

import { cardColors } from './constants'

const PADDING = 10

const mdCheckProps = {
  style: { marginTop: -4, marginRight: 5 },
  fill: colors.primary
}

const td = css({
  textAlign: 'left',
  verticalAlign: 'top',
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: PADDING,
  paddingRight: PADDING
})

const num = merge(td, {
  textAlign: 'right',
  fontFeatureSettings: '"tnum" 1, "kern" 1'
})

const styles = {
  table: css({
    ...fontStyles.sansSerifRegular,
    borderSpacing: '0',
    paddingLeft: 0,
    paddingRight: 0,
    minWidth: '100%',
    '@media (max-width: 600px)': {
      fontSize: 14
    },
    '& th': {
      ...fontStyles.sansSerifMedium
    }
  }),
  td,
  num,
  titleTd: css(td, {
    paddingTop: 10,
    'tr:first-child > &': {
      paddingTop: 5
    }
  }),
  highlight: css({
    ...fontStyles.sansSerifMedium
  }),
  actionButton: css(plainButtonRule, {
    lineHeight: 0,
    borderRadius: '50%',
    padding: 4,
    '& + &': {
      marginLeft: 3
    }
  })
}

export const Table = ({ children }) => (
  <div style={{ overflowX: 'auto', overflowY: 'hidden', marginLeft: -PADDING, marginRight: -PADDING }}>
    <table {...styles.table}>
      <tbody>
        {children}
      </tbody>
    </table>
  </div>
)

export const TitleRow = ({ children, first }) => (
  <tr>
    <th colSpan='3' {...styles.titleTd}>
      {children}
    </th>
  </tr>
)

export const CardRows = ({ nodes, revertCard, ignoreCard, followCard, t }) => (
  <>
    {nest()
      .key(({ card: { payload } }) => payload.nationalCouncil.elected || payload.councilOfStates.elected
        ? 'Gewählt sind:'
        : (
          (payload.nationalCouncil.candidacy && payload.nationalCouncil.votes === null) ||
          (payload.councilOfStates.candidacy && payload.councilOfStates.votes === null) ||
          (payload.councilOfStates.candidacy && payload.councilOfStates.secondBallotNecessary)
        )
          ? 'Noch offen:'
          : 'Nicht gewählt sind:')
      .sortValues((a, b) =>
        descending(
          Math.max(a.card.payload.nationalCouncil.votes, a.card.payload.councilOfStates.votes),
          Math.max(b.card.payload.nationalCouncil.votes, b.card.payload.councilOfStates.votes)
        ) ||
        ascending(
          a.card.payload.nationalCouncil.listNumbers[0],
          b.card.payload.nationalCouncil.listNumbers[0]
        )
      )
      .entries(nodes)
      .map(({ key, values: cards }, listI) => (
        <Fragment key={key}>
          <tr>
            <th {...styles.td} style={{
              paddingTop: 10, paddingBottom: 5
            }}>
              {key}
            </th>
            <th {...styles.num} style={{
              paddingTop: 10, paddingBottom: 5
            }}>
              Stimmen
            </th>
            <th />
          </tr>
          {cards.map(({ card, sub, pending }, i) => {
            const dualCandidacy = !!card.payload.councilOfStates.candidacy && !!card.payload.nationalCouncil.candidacy
            return <tr key={`entity${i}`} style={{
              background: i % 2 ? colors.secondaryBg : undefined
            }}>
              <td {...styles.td}>
                <Link route='profile' params={{ slug: card.user.slug }} passHref>
                  <Editorial.A>
                    {card.user.name}
                    {card.payload.party && `, ${card.payload.party}`}
                  </Editorial.A>
                </Link>
              </td>
              <td {...styles.num}>
                {card.payload.councilOfStates.candidacy && card.payload.councilOfStates.votes !== null && <>
                  {'SR: '}
                  {card.payload.councilOfStates.elected && <MdCheck {...mdCheckProps} />}
                  {!!card.payload.councilOfStates.votes && countFormat(card.payload.councilOfStates.votes)}
                  {card.payload.councilOfStates.secondBallotNecessary && <>
                    <br />
                    noch offen
                  </>}
                </>}
                {dualCandidacy && <br />}
                {card.payload.nationalCouncil.candidacy && card.payload.nationalCouncil.votes !== null && <>
                  {dualCandidacy ? 'NR: ' : ''}
                  {card.payload.nationalCouncil.elected && <MdCheck {...mdCheckProps} />}
                  {!!card.payload.nationalCouncil.votes && countFormat(card.payload.nationalCouncil.votes)}
                </>}
              </td>
              <td {...styles.td} style={{
                whiteSpace: 'nowrap',
                width: 85,
                paddingTop: 3,
                paddingBottom: 3
              }}>
                {pending ? <InlineSpinner size={18} /> : <>
                  <button {...styles.actionButton}
                    title={t('components/Card/Group/revert')}
                    onClick={(e) => {
                      e.preventDefault()
                      revertCard(card)
                    }}
                    style={{
                      backgroundColor: cardColors.revert
                    }}
                  >
                    <RevertIcon fill='#fff' size={14} />
                  </button>
                  <button {...styles.actionButton}
                    title={t('components/Card/Group/ignore')}
                    onClick={(e) => {
                      e.preventDefault()
                      ignoreCard && ignoreCard(card)
                    }}
                    style={{
                      backgroundColor: ignoreCard ? cardColors.left : colors.disabled,
                      cursor: ignoreCard ? 'pointer' : 'default'
                    }}
                  >
                    <IgnoreIcon fill='#fff' size={14} />
                  </button>
                  <button {...styles.actionButton}
                    title={t('components/Card/Group/follow')}
                    onClick={(e) => {
                      e.preventDefault()
                      followCard && followCard(card)
                    }}
                    style={{
                      backgroundColor: followCard ? cardColors.right : colors.disabled,
                      cursor: followCard ? 'pointer' : 'default'
                    }}
                  >
                    <FollowIcon fill='#fff' size={14} />
                  </button>
                </>}
              </td>
            </tr>
          })}
        </Fragment>
      ))}
  </>
)
