import React from 'react'
import dynamic from 'next/dynamic'

import {
  Overlay,
  OverlayBody,
  OverlayToolbar,
  OverlayToolbarClose,
  Interaction,
  A
} from '@project-r/styleguide'

import Loader from '../Loader'
import { compose, graphql } from 'react-apollo'
import { getDocument } from '../Article/graphql/getDocument'
import { splitByTitle } from '../../lib/utils/mdast'
import { renderMdast } from 'mdast-react-render'
import createPageSchema from '@project-r/styleguide/lib/templates/Page'

const pages = [
  {
    href: '/agb',
    content: dynamic(
      () => import('../../pages/agb.js').then(mod => mod.Content),
      { loading: () => <Loader /> }
    )
  },
  {
    href: '/datenschutz',
    content: dynamic(
      () => import('../../pages/datenschutz.js').then(mod => mod.Content),
      { loading: () => <Loader /> }
    )
  },
  {
    href: '/statuten',
    content: false // loads from Publikator
  }
]

export const SUPPORTED_HREFS = pages.map(p => p.href)

const RenderArticle = ({ data }) => (
  <Loader
    loading={data.loading}
    error={data.error}
    render={() => {
      const { article } = data
      if (!article) {
        return null
      }
      const splitContent = article && splitByTitle(article.content)
      const schema = createPageSchema({
        skipContainer: true,
        skipCenter: true
      })
      const renderSchema = content =>
        renderMdast(
          {
            ...content,
            format: undefined,
            section: undefined,
            series: undefined,
            repoId: article.repoId
          },
          schema,
          { MissingNode: ({ children }) => children }
        )

      return renderSchema(splitContent.main)
    }}
  />
)

const LegalOverlay = ({ onClose, href, title, data }) => {
  const page = pages.find(p => p.href === href)

  return (
    <Overlay mUpStyle={{ maxWidth: 720, minHeight: 0 }} onClose={onClose}>
      <OverlayToolbar title={title} onClose={onClose} />
      <OverlayBody>
        {page && page.content ? (
          <page.content />
        ) : data ? (
          <RenderArticle data={data} />
        ) : (
          <Interaction.P>
            <A href={href} target='_blank'>
              Jetzt anzeigen
            </A>
          </Interaction.P>
        )}
      </OverlayBody>
    </Overlay>
  )
}

export default compose(
  graphql(getDocument, {
    skip: props => pages.find(p => p.href === props.href && p.content),
    options: props => ({
      variables: {
        path: props.href
      }
    })
  })
)(LegalOverlay)
