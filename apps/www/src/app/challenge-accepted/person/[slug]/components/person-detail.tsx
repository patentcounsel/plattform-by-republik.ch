import CollectionRenderer from '@app/components/collection-render'
import { PersonDetailQuery } from '@app/graphql/cms/gql/graphql'
import { css } from '@app/styled-system/css'
import Image from 'next/image'

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

      <h2 className={css({ textStyle: 'h2Sans', my: '6' })}>Inhalte</h2>

      <CollectionRenderer items={person.items} isMember={isMember} />
      <div className={css({ mt: '6' })}>
        <details>
          <summary>person data</summary>
          <pre>{JSON.stringify(person, null, 2)}</pre>
        </details>
      </div>
    </div>
  )
}
