import React from 'react'
import { colors, fontStyles } from '@project-r/styleguide'
import SubIcon from 'react-icons/lib/md/notifications'
import UnsubIcon from 'react-icons/lib/md/notifications-none'
import { css } from 'glamor'

export const containerStyle = css({
  display: 'inline-block',
  marginLeft: 'auto',
  position: 'relative',
  lineHeight: 'initial',
  '@media print': {
    display: 'none'
  }
})

const styles = {
  icon: css({
    opacity: 0,
    animation: `${css.keyframes({
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    })} 0.5s cubic-bezier(0.6, 0, 0.6, 1) forwards`
  }),
  legend: css({
    opacity: 0,
    ...fontStyles.sansSerifRegular11,
    lineHeight: 1
  }),
  legendAnimate: css({
    animation: `${css.keyframes({
      '0%': { opacity: 0 },
      '20%': { opacity: 1 },
      '80%': { opacity: 1 },
      '100%': { opacity: 0 }
    })} 2.5s cubic-bezier(0.6, 0, 0.6, 1) alternate`
  })
}

export const SubscribeIcon = ({ isSubscribed, animate }) => {
  const Icon = isSubscribed ? SubIcon : UnsubIcon
  return <Icon {...(animate && styles.icon)} size={24} fill={colors.text} />
}
