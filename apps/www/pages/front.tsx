import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Front from '../components/Front'
import createGetStaticProps from '../lib/helpers/createGetStaticProps'
import { FRONT_QUERY } from '../components/Front/graphql/getFrontQuery.graphql'
import { useMe } from '../lib/context/MeContext'
import {
  FRONT_FEED_QUERY,
  getFrontFeedOptions,
} from '../components/Front/withData'

const FRONT_PAGE_SSG_REVALIDATE = 60 // revalidate every minute
const FRONT_PATH = '/'

const FrontPage = () => {
  const router = useRouter()
  const { me, meLoading, hasActiveMembership } = useMe()

  useEffect(() => {
    if (meLoading) return
    // In case the user isn't logged in or has no active membership,
    // reload to re-trigger the middleware to rewrite to the marketing-page
    if (!me || !hasActiveMembership) {
      router.reload()
    }
  }, [me, meLoading, hasActiveMembership, router])

  return (
    <Front
      shouldAutoRefetch
      hasOverviewNav
      extractId={router.query.extractId}
      finite
      renderBefore={undefined}
      renderAfter={undefined}
      containerStyle={undefined}
      serverContext={undefined}
      isEditor={undefined}
      documentPath={FRONT_PATH}
    />
  )
}

export default FrontPage

export const getStaticProps = createGetStaticProps(
  async (client, params) => {
    // Throw error to fail build if the key is not defined
    if (!process.env.SSG_API_KEY) {
      throw new Error('Missing SSG_API_KEY environment variable')
    }

    const frontQueryResult = await client.query({
      query: FRONT_QUERY,
      variables: {
        path: FRONT_PATH,
        // first: finite ? 1000 : 15,
        first: 1000,
        // before: finite ? 'end' : undefined,
        before: 'end',
        only: params?.extractId,
      },
    })
    const front = frontQueryResult.data?.front
    const feedNode = front?.children?.nodes.find((c) => c.id === 'feed')

    if (feedNode) {
      // Start query options - (identical to code in www/components/Front/withData.js)
      const feedNodeIndex =
        frontQueryResult.data.front.children.nodes.indexOf(feedNode)

      const priorRepoIds = front.children.nodes
        .slice(0, feedNodeIndex)
        .map((node) => {
          console.log('Add to prior repo id', JSON.stringify(node.body.data))
          return node?.body?.data?.urlMeta?.repoId
        })
        .filter(Boolean)

      const options = getFrontFeedOptions({
        lastPublishedAt: frontQueryResult.data.front.lastPublishedAt,
        priorRepoIds,
        ...feedNode.body.data,
      })
      // End query options

      console.log(
        'Fetching front feed in SSG with options: ',
        JSON.stringify(options, null, 2),
      )
      await client.query({
        query: FRONT_FEED_QUERY,
        variables: options.variables,
      })
    }

    return {
      props: {},
      revalidate: FRONT_PAGE_SSG_REVALIDATE,
    }
  },
  {
    authorization: `DocumentApiKey ${process.env.SSG_API_KEY}`,
  },
)
