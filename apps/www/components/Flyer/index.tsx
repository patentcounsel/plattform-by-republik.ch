import React from 'react'

import {
  Flyer,
  RenderContextProvider,
  SlateRender,
  flyerSchema,
  CustomDescendant,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'

import HrefLink from '../Link/Href'

import { getTileActionBar } from './ActionBar'
import Footer from './Footer'
import Meta from './Meta'
import Nav from './Nav'

export type MetaProps = {
  path: string
  publishDate: string
  title: string
  description: string
  facebookTitle: string
  facebookDescription: string
  twitterTitle: string
  twitterDescription: string
  [x: string]: unknown
}

const Page: React.FC<{
  meta: MetaProps
  repoId: string
  documentId: string
  inNativeApp: boolean
  tileId?: string
  value: CustomDescendant[]
  actionBar: JSX.Element
}> = ({ meta, repoId, documentId, inNativeApp, tileId, value, actionBar }) => {
  const { t } = useTranslation()
  return (
    <Flyer.Layout>
      <RenderContextProvider
        t={t}
        Link={HrefLink}
        nav={<Nav repoId={repoId} publishDate={meta.publishDate} />}
        ShareTile={getTileActionBar(documentId, meta, inNativeApp)}
      >
        <SlateRender
          value={value}
          schema={flyerSchema}
          raw
          skip={['flyerOpeningP']}
        />
      </RenderContextProvider>
      <Footer>{actionBar}</Footer>
      <Meta documentId={documentId} meta={meta} tileId={tileId} value={value} />
    </Flyer.Layout>
  )
}

export default Page
