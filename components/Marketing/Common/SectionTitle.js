import React from 'react'
import { css } from 'glamor'
import { fontStyles, Editorial } from '@project-r/styleguide'

export default function SectionTitle({ title, lead }) {
  return (
    <div {...styles.container}>
      <h2 {...styles.title}>{title}</h2>
      {lead ? <Editorial.Lead>{lead}</Editorial.Lead> : null}
    </div>
  )
}

const styles = {
  container: css({
    textAlign: 'center',
    marginBottom: '2em'
  }),
  title: css({
    ...fontStyles.sansSerifMedium30
  })
}
