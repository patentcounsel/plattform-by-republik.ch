import CollectionRenderer from '@app/components/collection-render'
import type { PersonDetailQuery } from '@app/graphql/gql/graphql'
import { css } from '@app/styled-system/css'
import Image from 'next/image'
import { StructuredText } from 'react-datocms'

type PersonDetailProps = {
  person: PersonDetailQuery['person']
  isMember?: boolean
}

export function PersonDetail({ person, isMember = false }: PersonDetailProps) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '2',
        mb: '16',
        alignItems: 'center',
      })}
    >
      {person.portrait && (
        <Image
          alt={person.name}
          src={person.portrait.url}
          width={500}
          height={500}
        />
      )}
      <h1
        className={css({
          textStyle: 'h1Sans',
        })}
      >
        Sali, ich bin {person.name}
      </h1>
      <StructuredText data={person.bio.value} />
      <h2 className={css({ textStyle: 'h2Sans', my: '6' })}>Inhalte</h2>
      <CollectionRenderer items={person.items} isMember={isMember} />
    </div>
  )
}
