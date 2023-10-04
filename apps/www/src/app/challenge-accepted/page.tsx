import type { Metadata } from 'next'

import { css } from '@app/styled-system/css'
import {
  CHALLENGE_ACCEPTED_HUB_META_QUERY,
  CHALLENGE_ACCEPTED_HUB_QUERY,
} from '@app/graphql/cms/hub.query'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@app/components/container'
import CollectionRenderer from '@app/components/collection-render'
import { wrap } from '@app/styled-system/patterns'
import { getMe } from '@app/lib/auth/me'
import { CollectionFilter } from '@app/components/collection-filter'
import { StructuredText } from 'react-datocms'

export async function generateMetadata(): Promise<Metadata> {
  const client = getCMSClient()
  const { data } = await client.query({
    query: CHALLENGE_ACCEPTED_HUB_META_QUERY,
  })

  return {
    title: data.hub?.metadata?.title,
    description: data.hub?.metadata?.description,
    openGraph: {
      images: data.hub?.metadata?.image?.url,
    },
  }
}

export default async function Page({ searchParams }) {
  const client = getCMSClient()
  const { data } = await client.query({
    query: CHALLENGE_ACCEPTED_HUB_QUERY,
    context: {},
  })

  const me = await getMe()

  const isMember =
    me?.roles && Array.isArray(me.roles) && me.roles.includes('member')

  const hub: typeof data['hub'] = {
    ...data.hub,
    items: data.hub.items.map((item) => {
      if (item.__typename !== 'EventRecord') {
        return item
      }
      return {
        ...item,
        signUpLink: isMember || item.isPublic ? item.signUpLink : undefined,
      }
    }),
  }
  const { people } = data

  return (
    <>
      {}
      <h1
        className={css({
          mb: '8',
          _dark: {
            // @ts-expect-error non-token style value
            filter: 'invert(1)',
          },
        })}
      >
        <img
          src={hub.logo?.url}
          className={css({
            width: 'viewportWidth',
            height: 'auto',
          })}
          alt='Challenge Accepted Logo'
        ></img>
      </h1>
      <Container>
        <StructuredText data={hub.introduction.value} />
        <h2
          className={css({
            textStyle: 'h1Sans',
            mb: '4',
          })}
        >
          Personen
        </h2>
        <div className={wrap({ gap: '4', mb: '6' })}>
          {people.map((person) => (
            <div
              key={person.id}
              className={css({
                display: 'flex',
                flexDirection: 'row',
                // justifyContent: 'flex-end',
                gap: '4',
              })}
            >
              <Link href={`/challenge-accepted/person/${person.slug}`}>
                <h3
                  className={css({
                    display: 'block',
                    textStyle: 'h3Sans',
                    textAlign: 'center',
                    py: '1',
                  })}
                >
                  {person.portrait ? (
                    <Image
                      src={person.portrait?.url}
                      width={96 * 2}
                      height={96 * 2}
                      className={css({
                        borderRadius: 'full',
                        width: '24',
                        height: '24',
                        objectFit: 'cover',
                      })}
                      alt={person.name}
                    />
                  ) : (
                    <div
                      className={css({
                        borderRadius: 'full',
                        width: '24',
                        height: '24',
                        background: 'contrast',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'pageBackground',
                        fontSize: '3xl',
                      })}
                    >
                      {person.name.slice(0, 1)}
                    </div>
                  )}
                  {person.name}
                </h3>
              </Link>
            </div>
          ))}
        </div>
        <h2 className={css({ textStyle: 'h2Sans', my: '6' })}>Inhalte</h2>
        <div className={css({ mb: '6' })}>
          <CollectionFilter filter={searchParams.filter} />
        </div>
        <CollectionRenderer
          items={hub.items}
          filter={searchParams.filter}
          isMember={
            me?.roles && Array.isArray(me.roles) && me.roles.includes('member')
          }
        />
        <div className={css({ marginTop: '8' })}>
          <StructuredText data={hub.outro.value} />
        </div>
      </Container>
    </>
  )
}
