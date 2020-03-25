import { css, merge } from 'glamor'
import HasNotifications from 'react-icons/lib/md/notifications'
import NoNotifications from 'react-icons/lib/md/notifications-none'
import React, { useState, useEffect } from 'react'
import { menuIconStyle } from '../Frame/Header'
import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  ICON_BUTTON_WIDTH
} from '../constants'
import { colors, mediaQueries } from '@project-r/styleguide'
import withT from '../../lib/withT'
import { compose } from 'react-apollo'
import { notificationSubscription, withNotificationCount } from './enhancers'
import { containsUnread } from './index'

const styles = {
  notifications: css({
    right: HEADER_HEIGHT_MOBILE + ICON_BUTTON_WIDTH,
    [mediaQueries.mUp]: {
      right: HEADER_HEIGHT + ICON_BUTTON_WIDTH + 5
    }
  }),
  unreadNotifications: css({
    '&:after': {
      content: ' ',
      width: 8,
      height: 8,
      borderRadius: 8,
      border: `1px solid ${colors.containerBg}`,
      background: 'red',
      position: 'absolute',
      top: (HEADER_HEIGHT_MOBILE - ICON_BUTTON_WIDTH) / 2 + 1,
      right: 2,
      [mediaQueries.mUp]: {
        top: (HEADER_HEIGHT - ICON_BUTTON_WIDTH) / 2 + 2,
        right: 15
      }
    }
  })
}

export default compose(
  withT,
  withNotificationCount
)(({ t, countData: { notifications, subscribeToMore }, fill }) => {
  const [hasUnread, setUnread] = useState(false)

  const subscribe = () =>
    subscribeToMore({
      document: notificationSubscription,
      updateQuery: (prev = {}, { subscriptionData }) => {
        if (!subscriptionData.data || !subscriptionData.data.notification) {
          return prev
        }
        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            nodes: [subscriptionData.data.notification].concat(
              prev.notifications.nodes
            )
          }
        }
      }
    })

  useEffect(() => {
    setUnread(containsUnread(notifications))
    const unsubscribe = subscribe()
    return () => unsubscribe()
  }, [notifications])

  const Icon = hasUnread ? HasNotifications : NoNotifications

  return (
    <a
      {...merge(menuIconStyle, styles.notifications)}
      {...(hasUnread && styles.unreadNotifications)}
      title={t('header/nav/notifications/aria')}
      href='/benachrichtigungen'
    >
      <Icon fill={fill} size={ICON_BUTTON_WIDTH - 1} />
    </a>
  )
})
