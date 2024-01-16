import { Metadata } from 'next'

import { ApolloWrapper } from 'src/lib/apollo/provider'

import './globals.css'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
}

type RootLayoutProps = { children: React.ReactNode }

function RootLayout(props: RootLayoutProps) {
  const { children } = props

  return (
    <html suppressHydrationWarning>
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  )
}

export default RootLayout
