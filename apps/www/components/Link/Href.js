import Link from 'next/link'

const HrefLink = ({ href, passHref, legacyBehavior = true, children }) => {
  if (!href) {
    return children
  }

  return (
    <Link
      href={href}
      passHref={passHref}
      prefetch={false}
      legacyBehavior={legacyBehavior}
    >
      {children}
    </Link>
  )
}
export default HrefLink
