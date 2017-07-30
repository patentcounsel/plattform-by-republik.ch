import ENV from './env'

const colors = {
  primary: '#00508C',
  primaryBg: '#BFE1FF',
  secondary: '#00335A',
  secondaryBg: '#D8EEFF',
  disabled: '#B8BDC1',
  text: '#191919',
  error: '#9E0041',
  divider: '#DBDCDD',
  ...((ENV.COLORS && JSON.parse(ENV.COLORS)) || {})
}

export default colors
