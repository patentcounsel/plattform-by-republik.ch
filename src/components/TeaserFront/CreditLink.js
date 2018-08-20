import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'
import { lab } from 'd3-color'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { tUp } from './mediaQueries'

const CreditLink = ({ children, color, collapsedColor, ...props }) => {
  const labColor = lab(color)
  const labCompactColor = lab(collapsedColor || color)

  const baseColorStyle = {
    color,
    ':hover': {
      color: labColor.b > 0.5 ? labColor.darker(0.6) : labColor.brighter(0.6)
    }
  }

  const colorStyle = collapsedColor ? {
    color: collapsedColor,
    ':hover': {
      color: labCompactColor.b > 0.5 ? labCompactColor.darker(0.6) : labCompactColor.brighter(0.6)
    },
    [tUp]: {
      ...baseColorStyle
    }
  } : baseColorStyle

  const style = css({
    ...colorStyle,
    cursor: 'pointer'
  })
  return (
    <Editorial.A {...props} {...style}>
      {children}
    </Editorial.A>
  )
}

CreditLink.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string
}

CreditLink.defaultProps = {
  color: colors.primary
}

export default CreditLink
