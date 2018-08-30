import React from 'react'
import { compose, graphql } from 'react-apollo'
import { css } from 'glamor'

import { linkRule } from '@project-r/styleguide'

import { APP_OPTIONS } from '../../lib/constants'
import { Router } from '../../lib/routes'
import query from './belongingsQuery'
import withT from '../../lib/withT'

const styles = {
  anchorList: css({
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    paddingBottom: 80,
    overflow: 'hidden'
  }),
  anchorListItem: css({
    float: 'left',
    marginRight: 20,
    lineHeight: '2em'
  })
}

const AnchorLink = ({children, id}) => (
  <a
    {...linkRule}
    href={'#' + id}
    onClick={(e) => {
      if (e.currentTarget.nodeName === 'A' &&
      (e.metaKey || e.ctrlKey || e.shiftKey || (e.nativeEvent && e.nativeEvent.which === 2))) {
        // ignore click for new tab / new window behavior
        return
      }

      e.preventDefault()
      Router.pushRoute('/konto#' + id)
    }}>
    {children}
  </a>
)

const Anchors = ({ me, t }) => (
  <ul {...styles.anchorList}>
    {me.memberships.length > 0 &&
      <li {...styles.anchorListItem}>
        <AnchorLink id='abos'>
          {t.pluralize('memberships/title', { count: me.memberships.length })}
        </AnchorLink>
      </li>}
    {me.accessCampaigns.length > 0 &&
      <li {...styles.anchorListItem}>
        <AnchorLink id='teilen'>
          {t('Account/Access/Campaigns/title')}
        </AnchorLink>
      </li>}
    <li {...styles.anchorListItem}>
      <AnchorLink id='email'>{t('Account/Update/email/label')}</AnchorLink>
    </li>
    <li {...styles.anchorListItem}>
      <AnchorLink id='account'>{t('Account/Update/title')}</AnchorLink>
    </li>
    <li {...styles.anchorListItem}>
      <AnchorLink id='pledges'>{t('account/pledges/title')}</AnchorLink>
    </li>
    <li {...styles.anchorListItem}>
      <AnchorLink id='newsletter'>
        {t('account/newsletterSubscriptions/title')}
      </AnchorLink>
    </li>
    <li {...styles.anchorListItem}>
      <AnchorLink id='benachrichtigungen'>
        {t('account/notificationOptions/title')}
      </AnchorLink>
    </li>
    {APP_OPTIONS &&
      <li {...styles.anchorListItem}>
        <AnchorLink id='anmeldung'>
          {t('account/authSettings/title')}
        </AnchorLink>
      </li>}
  </ul>
)

export default compose(
  graphql(query, {
    props: ({ data }) => ({
      loading: data.loading || !data.me,
      error: data.error,
      me: data.loading ? undefined : data.me
    })
  }),
  withT
)(Anchors)
