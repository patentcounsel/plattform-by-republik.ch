import React from 'react'
import { SchemaConfig } from '../custom-types'
import { FigureByline, FigureCaption } from '../../Figure'
import { FigureContainer } from '../config/elements/figure/container'
import { FigureImage } from '../config/elements/figure/image'
import { List } from '../config/elements/list/container'
import { ListItem } from '../../List'
import { PullQuoteSource } from '../../PullQuote'
import { Break } from '../config/elements/break'
import { Editorial, Sub, Sup, Interaction } from '../../Typography'
import { NoRefA } from '../config/elements/link'
import { FlyerTile } from '../config/elements/flyerTile'
import { FlyerAuthor } from '../config/elements/flyerTile/elements/author'
import { FlyerMetaP } from '../config/elements/flyerTile/elements/metaP'
import { FlyerTitle } from '../config/elements/flyerTile/elements/title'
import { FlyerTopic } from '../config/elements/flyerTile/elements/topic'
import { ArticlePreview } from '../config/elements/articlePreview'
import { useColorContext } from '../../Colors/ColorContext'
import { FlyerSignature } from '../config/elements/flyerTile/elements/signature'

const container = ({ children, attributes }) => (
  <div {...attributes} style={{ backgroundColor: '#FFE501' }}>
    {children}
  </div>
)

const Headline = ({ children, attributes, ...props }) => (
  <h1
    style={{
      fontFamily: 'Druk Text Wide Trial',
      fontStyle: 'Medium',
      fontSize: 60,
      textAlign: 'center',
      marginBottom: 50,
    }}
    {...attributes}
    {...props}
  >
    {children}
  </h1>
)

const Paragraph = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...props}
      style={{
        fontFamily: 'GT America',
        fontWeight: 400,
        fontSize: 24,
        marginBottom: 20,
      }}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </p>
  )
}

const PullQuote = ({ children, attributes }) => (
  <blockquote {...attributes}>{children}</blockquote>
)

const PullQuoteText = ({ children, attributes }) => (
  <div
    {...attributes}
    style={{
      backgroundColor: '#0E755A',
      color: 'white',
      fontFamily: 'GT America',
      fontWeight: 700,
      fontSize: 40,
      textAlign: 'center',
      padding: 20,
    }}
  >
    {children}
  </div>
)

const schema: SchemaConfig = {
  container,
  flyerTile: FlyerTile,
  flyerAuthor: FlyerAuthor,
  flyerMetaP: FlyerMetaP,
  flyerPunchline: FigureCaption,
  flyerSignature: FlyerSignature,
  flyerTitle: FlyerTitle,
  flyerTopic: FlyerTopic,
  articlePreview: ArticlePreview,
  figureByline: FigureByline,
  figureCaption: FigureCaption,
  figure: FigureContainer,
  figureImage: FigureImage,
  list: List,
  listItem: ListItem,
  pullQuote: PullQuote,
  pullQuoteSource: PullQuoteSource,
  pullQuoteText: PullQuoteText,
  break: Break,
  headline: Headline,
  link: NoRefA,
  paragraph: Paragraph,
  bold: Interaction.Emphasis,
  italic: Interaction.Cursive,
  strikethrough: Editorial.StrikeThrough,
  sub: Sub,
  sup: Sup,
}

export default schema
