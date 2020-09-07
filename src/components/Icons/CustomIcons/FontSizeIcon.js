import React from 'react'
import colors from '../../../theme/colors'

const Icon = ({ size = '1em', fill = colors.text, ...props }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' {...props}>
    <path
      fill={fill}
      d='M6.78666 17.1563H3.87349L3.20283 19H1.83008L4.59654 12H6.06361L8.83008 19H7.45732L6.78666 17.1563ZM6.43736 16.1901L5.56411 13.8239C5.47027 13.5799 5.3967 13.3294 5.34405 13.0746H5.32309C5.27044 13.3294 5.19687 13.5799 5.10303 13.8239L4.22978 16.1901H6.43736Z'
    />
    <path
      fill={fill}
      d='M18.7433 15.3127H12.9216L11.5756 19H8.83008L14.363 5H17.2971L22.8301 19H20.0846L18.7433 15.3127ZM18.0307 13.3803L16.2912 8.64789C16.1035 8.15981 15.9563 7.65878 15.851 7.1493H15.8091C15.7038 7.65878 15.5567 8.15981 15.369 8.64789L13.6295 13.3803H18.0307Z'
    />
  </svg>
)

export default Icon
