import { css } from 'glamor'
import { AutoTextSize } from 'auto-text-size'

import {
  fontFamilies,
  mediaQueries,
  useColorContext,
  RawHtml,
} from '@project-r/styleguide'
import AssetImage from '../../../lib/images/AssetImage'

import { postcardCredits } from '../config'

const styles = {
  postcard: css({
    position: 'relative',
    backgroundColor: '#F9FBFF',
    margin: '0 0 20px 0',
    width: '100%',
    height: '100%',
    aspectRatio: '16 / 9',
    display: 'flex',
    padding: '10px',
    borderRadius: '2px',
    fontFamily: fontFamilies.sansSerifRegular,
    color: '#282828',
    [mediaQueries.mUp]: {
      padding: '15px',
    },
  }),
  textArea: css({
    display: 'flex',
    flexWrap: 'wrap',
    flexFlow: 'column',
    maxHeight: '100%',
    lineHeight: '1.3',
    width: '67%',
    color: '#282828',
    paddingRight: '15px',
    '& span': {
      color: '#282828',
    },
  }),
  rightSide: css({
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: '33%',
    paddingLeft: '15px',
    borderLeft: 'solid 1px #DADDDC',
    justifyContent: 'sprace-between',
  }),
  image: css({
    borderImage: 'url(/static/climatelab/border-image.png) 32 round',
    borderWidth: '8px',
    borderStyle: 'solid',
    '> span': { display: 'block !important' },
  }),
  adressBlock: css({
    borderBottom: 'solid 1px #DADDDC',
    paddingBottom: '5px',
    lineHeight: '1.1',
  }),
  adressBlockContainer: css({
    width: '100%',
    paddingBottom: '3px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-around',
  }),
}

export const PostcardPreview = (props) => {
  const { postcard } = props
  const [colorScheme] = useColorContext()

  if (!postcard) return null

  const { text, imageUrl, imageSelection, author } = postcard

  const postcardText = author
    ? `${text} <br />${author.name === 'Unbenannt' ? '' : author.name}`
    : text

  return (
    <div
      {...styles.postcard}
      {...colorScheme.set('boxShadow', 'imageChoiceShadow')}
    >
      <div {...styles.textArea}>
        <AutoTextSize mode='box' maxFontSizePx={42}>
          <RawHtml
            dangerouslySetInnerHTML={{
              __html: postcardText,
            }}
          />
        </AutoTextSize>
      </div>

      <div {...styles.rightSide}>
        <PoststampComponent imageUrl={imageUrl} />
        <div {...styles.adressBlockContainer}>
          <div {...styles.adressBlock} />
          <div {...styles.adressBlock} />
          <div {...styles.adressBlock} />
        </div>
        <div style={{ width: '100%' }}>
          <AutoTextSize mode='multiline'>
            {'Illustration: ' + postcardCredits[imageSelection] || ' ...'}
          </AutoTextSize>
        </div>
      </div>
    </div>
  )
}

const PoststampComponent = ({ imageUrl }) => {
  return imageUrl ? (
    <div {...styles.image}>
      <AssetImage width={'200'} height={'133'} src={imageUrl} />
    </div>
  ) : (
    <div
      {...styles.image}
      style={{ height: '4rem', aspectRatio: '4 / 3' }}
    ></div>
  )
}
