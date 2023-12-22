import { nest } from 'd3-collection'
import FAQEntry from './faq-entry'
import { FaqEntryRecord, FaqRecord } from '@app/graphql/cms/gql/graphql'
import { css } from '@app/styled-system/css'
import { StructuredText } from 'react-datocms'

type FAQListProps = {
  entries: FaqEntryRecord[]
  title: FaqRecord['title']
  introduction: FaqRecord['introduction']
}

export default function FAQList({
  entries,
  title,
  introduction,
}: FAQListProps) {
  const entriesByCategory: [{ key: string; values: FaqEntryRecord[] }] = nest()
    .key((d) => d.category)
    .entries(entries)

  return (
    <>
      <h1 className={css({ textStyle: 'h1Sans', marginY: '8-16' })}>{title}</h1>
      <p className={css({ textStyle: 'sans' })}>
        <StructuredText data={introduction.value} />{' '}
      </p>
      {entriesByCategory.map(({ key: categoryTitle, values: entries }) => (
        <div key={categoryTitle}>
          <h2 className={css({ textStyle: 'h2Sans', marginY: '4-8' })}>
            {categoryTitle}
          </h2>
          {entries.map((entry) => (
            <FAQEntry key={entry.question} entry={entry} />
          ))}
        </div>
      ))}
    </>
  )
}
