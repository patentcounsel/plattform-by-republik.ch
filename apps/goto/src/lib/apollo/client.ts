import { headers } from 'next/headers'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    name: '@orbiting/goto-app',
    cache: new InMemoryCache(),
    link: new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: process.env.NEXT_PUBLIC_API_URL,
      // you can disable result caching here if you want to
      // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
      // fetchOptions: { cache: "no-store" },
      headers: {
        cookie: headers().get('cookie') ?? '',
        accept: headers().get('accept') ?? '',
        Authorization: headers().get('Authorization') ?? '',
      },
      fetchOptions: {
        next: {
          // By default we disable Next.js 13 fetch caching
          // since the requests are user based
          cache: 'no-store',
        },
      },
    }),
  })
})
