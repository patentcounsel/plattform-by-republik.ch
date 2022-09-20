import { cloneElement, useRef, useEffect, useMemo, useContext } from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { renderMdast } from 'mdast-react-render'
import compose from 'lodash/flowRight'
import {
  graphql,
  withApollo,
  withMutation,
  withQuery,
  withSubscription,
} from '@apollo/client/react/hoc'
import { ApolloConsumer, ApolloProvider, gql, useQuery } from '@apollo/client'

import {
  Center,
  Breakout,
  colors,
  plainLinkRule,
  Interaction,
  mediaQueries,
  TitleBlock,
  Editorial,
  Flyer,
  TeaserEmbedComment,
  IconButton,
  SeriesNav,
  Loader as SmallLoader,
  createArticleSchema,
  createFormatSchema,
  createDossierSchema,
  createDiscussionSchema,
  createNewsletterWebSchema,
  createSectionSchema,
  createPageSchema,
  flyerSchema,
  SlateRender,
  RenderContextProvider,
  FlyerTile,
} from '@project-r/styleguide'
import { EditIcon } from '@project-r/styleguide'
import { createRequire } from '@project-r/styleguide'

import ActionBarOverlay from './ActionBarOverlay'
import SeriesNavBar from './SeriesNavBar'
import TrialPayNoteMini from './TrialPayNoteMini'
import Extract from './Extract'
import { FlyerWrapper, PayNote } from './PayNote'
import Progress from './Progress'
import PodcastButtons from './PodcastButtons'
import { getDocument } from './graphql/getDocument'
import withT from '../../lib/withT'
import { parseJSONObject } from '../../lib/safeJSON'
import { formatDate } from '../../lib/utils/format'
import withInNativeApp, { postMessage } from '../../lib/withInNativeApp'
import { splitByTitle } from '../../lib/utils/mdast'
import { PUBLIKATOR_BASE_URL } from '../../lib/constants'
import ShareImage from './ShareImage'
import FontSizeSync from '../FontSize/Sync'
import PageLoader from '../Loader'
import Frame from '../Frame'
import ActionBar from '../ActionBar'
import ReadAloudInline from './ReadAloudInline'
import { BrowserOnlyActionBar } from './BrowserOnly'
import { AudioContext } from '../Audio/AudioProvider'
import FormatFeed from '../Feed/Format'
import StatusError from '../StatusError'
import NewsletterSignUp from '../Auth/NewsletterSignUp'
import ArticleGallery from '../Gallery/ArticleGallery'
import SectionNav from '../Sections/SectionNav'
import SectionFeed from '../Sections/SectionFeed'
import HrefLink from '../Link/Href'
import { withMarkAsReadMutation } from '../Notifications/enhancers'
import { cleanAsPath } from '../../lib/utils/link'

// Identifier-based dynamic components mapping
import dynamic from 'next/dynamic'
import CommentLink from '../Discussion/shared/CommentLink'
import { Mutation, Query, Subscription } from '@apollo/client/react/components'
import { useMe } from '../../lib/context/MeContext'
import DiscussionContextProvider from '../Discussion/context/DiscussionContextProvider'
import Discussion from '../Discussion/Discussion'
import ArticleRecommendationsFeed from './ArticleRecommendationsFeed'
import { getMetaData, runMetaFromQuery } from './metadata'
import FlyerFooter from './FlyerFooter'

const LoadingComponent = () => <SmallLoader loading />

const MatomoOptOut = dynamic(() => import('../Matomo/OptOut'), {
  loading: LoadingComponent,
  ssr: false,
})

const Manifest = dynamic(() => import('../About/Manifest'), {
  ssr: true,
})
const TeamTeaser = dynamic(() => import('../About/TeamTeaser'), {
  loading: LoadingComponent,
  ssr: false,
})
const TestimonialList = dynamic(
  () => import('../Testimonial/List').then((m) => m.ListWithQuery),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)
const ReasonsVideo = dynamic(() => import('../About/ReasonsVideo'), {
  ssr: true,
})
const NewsletterSignUpDynamic = dynamic(
  () => import('../Auth/NewsletterSignUp'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)
const Votebox = dynamic(() => import('../Vote/Voting'), {
  loading: LoadingComponent,
  ssr: false,
})
const VoteCounter = dynamic(() => import('../Vote/VoteCounter'), {
  loading: LoadingComponent,
  ssr: false,
})
const VoteResult = dynamic(() => import('../Vote/VoteResult'), {
  loading: LoadingComponent,
  ssr: false,
})
const ElectionCandidacy = dynamic(() => import('../Vote/ElectionCandidacy'), {
  loading: LoadingComponent,
  ssr: false,
})
const Election = dynamic(() => import('../Vote/Election'), {
  loading: LoadingComponent,
  ssr: false,
})
const ElectionResult = dynamic(() => import('../Vote/ElectionResult'), {
  loading: LoadingComponent,
  ssr: false,
})
const ElectionResultDiversity = dynamic(
  () => import('../Vote/ElectionDiversity'),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)
const Questionnaire = dynamic(
  () =>
    import('../Questionnaire/Questionnaire').then(
      (m) => m.QuestionnaireWithData,
    ),
  {
    loading: LoadingComponent,
    ssr: false,
  },
)

const QuestionnaireSubmissions = dynamic(
  () => import('../Questionnaire/Submissions'),
  {
    loading: LoadingComponent,
  },
)

const schemaCreators = {
  editorial: createArticleSchema,
  meta: createArticleSchema,
  article: createArticleSchema,
  format: createFormatSchema,
  dossier: createDossierSchema,
  discussion: createDiscussionSchema,
  editorialNewsletter: createNewsletterWebSchema,
  section: createSectionSchema,
  page: createPageSchema,
  flyer: () => {
    return flyerSchema
  },
}

export const withCommentData = graphql(
  gql`
    ${TeaserEmbedComment.data.query}
  `,
  TeaserEmbedComment.data.config,
)

const dynamicComponentRequire = createRequire().alias({
  'react-apollo': {
    // Reexport react-apollo
    // (work around until all dynamic components are updated)
    // ApolloContext is no longer available but is exported in old versions of react-apollo
    ApolloConsumer,
    ApolloProvider,
    Query,
    Mutation,
    Subscription,
    graphql,
    withQuery,
    withMutation,
    withSubscription,
    withApollo,
    compose,
  },
  // Reexport graphql-tag to be used by dynamic-components
  'graphql-tag': gql,
})

const getSchemaCreator = (template) => {
  const key = template || Object.keys(schemaCreators)[0]
  const schema = schemaCreators[key]

  if (!schema) {
    try {
      console.error(`Unkown Schema ${key}`)
    } catch (e) {}

    return () => {
      return
    }
  }
  return schema
}

const EmptyComponent = ({ children }) => children

const ArticlePage = ({
  t,
  inNativeApp,
  inNativeIOSApp,
  payNoteSeed,
  payNoteTryOrBuy,
  isPreview,
  markAsReadMutation,
  serverContext,
  clientRedirection,
}) => {
  const actionBarRef = useRef()
  const bottomActionBarRef = useRef()
  const galleryRef = useRef()

  const router = useRouter()

  const { me, meLoading, hasAccess, hasActiveMembership, isEditor } = useMe()

  const cleanedPath = cleanAsPath(router.asPath)

  const {
    data: articleData,
    loading: articleLoading,
    error: articleError,
    refetch: articleRefetch,
  } = useQuery(getDocument, {
    variables: {
      path: cleanedPath,
    },
    skip: clientRedirection,
  })

  const article = articleData?.article
  const documentId = article?.id
  const repoId = article?.repoId
  const treeType = article?.type

  const articleMeta = article?.meta
  const articleContent = article?.content
  const articleUnreadNotifications = article?.unreadNotifications
  const routerQuery = router.query

  // Refetch when cached article is not issued for current user
  // - SSG always provides issuedForUserId: null
  // Things that can change
  // - content member only parts like «also read»
  // - personalized data for action bar
  const needsRefetch =
    !articleLoading &&
    !meLoading &&
    (article?.issuedForUserId || null) !== (me?.id || null)
  useEffect(() => {
    if (needsRefetch) {
      articleRefetch()
    }
  }, [
    needsRefetch,
    // ensure effect is run when article or me changes
    me?.id,
    documentId,
  ])

  if (isPreview && !articleLoading && !article && serverContext) {
    serverContext.res.redirect(302, router.asPath.replace(/^\/vorschau\//, '/'))
    throw new Error('redirect')
  }

  const { toggleAudioPlayer, audioPlayerVisible } = useContext(AudioContext)

  const markNotificationsAsRead = () => {
    const unreadNotifications = articleUnreadNotifications?.nodes?.filter(
      (n) => !n.readAt,
    )
    if (unreadNotifications && unreadNotifications.length) {
      unreadNotifications.forEach((n) => markAsReadMutation(n.id))
    }
  }

  useEffect(() => {
    markNotificationsAsRead()
  }, [articleUnreadNotifications])

  const metaJSONStringFromQuery = useMemo(() => {
    return (
      articleContent &&
      JSON.stringify(
        runMetaFromQuery(articleContent.meta.fromQuery, routerQuery),
      )
    )
  }, [routerQuery, articleContent])
  const meta = useMemo(
    () =>
      articleMeta &&
      articleContent && {
        ...getMetaData(documentId, articleMeta),
        ...(metaJSONStringFromQuery
          ? JSON.parse(metaJSONStringFromQuery)
          : undefined),
      },
    [articleMeta, articleContent, metaJSONStringFromQuery],
  )

  const hasMeta = !!meta
  const podcast =
    hasMeta &&
    (meta.podcast || (meta.audioSource && meta.format?.meta?.podcast))
  const isSyntheticReadAloud =
    hasMeta &&
    meta.audioSource &&
    meta.audioSource.kind === 'syntheticReadAloud'
  const isReadAloud =
    hasMeta && meta.audioSource && meta.audioSource.kind === 'readAloud'
  const newsletterMeta =
    hasMeta && (meta.newsletter || meta.format?.meta?.newsletter)

  const isSeriesOverview = hasMeta && meta.series?.overview?.id === documentId
  const showSeriesNav = hasMeta && !!meta.series && !isSeriesOverview
  const titleBreakout = isSeriesOverview

  const { trialSignup } = routerQuery
  const showInlinePaynote = !hasAccess || !!trialSignup
  useEffect(() => {
    if (trialSignup === 'success') {
      articleRefetch()
    }
  }, [trialSignup])

  const template = meta?.template
  const schema = useMemo(
    () =>
      template &&
      getSchemaCreator(template)({
        t,
        Link: HrefLink,
        plattformUnauthorizedZoneText: inNativeIOSApp
          ? t('plattformUnauthorizedZoneText/ios')
          : undefined,
        dynamicComponentRequire,
        dynamicComponentIdentifiers: {
          MATOMO_OPT_OUT: MatomoOptOut,
          MANIFEST: Manifest,
          TEAM_TEASER: TeamTeaser,
          REASONS_VIDEO: ReasonsVideo,
          VOTEBOX: Votebox,
          VOTE_COUNTER: VoteCounter,
          VOTE_RESULT: VoteResult,
          TESTIMONIAL_LIST: TestimonialList,
          ELECTION_CANDIDACY: ElectionCandidacy,
          ELECTION: Election,
          ELECTION_RESULT: ElectionResult,
          ELECTION_RESULT_DIVERSITY: ElectionResultDiversity,
          QUESTIONNAIRE: Questionnaire,
          QUESTIONNAIRE_SUBMISSIONS: QuestionnaireSubmissions,
          NEWSLETTER_SIGNUP: NewsletterSignUpDynamic,
        },
        titleMargin: false,
        titleBreakout,
        onAudioCoverClick: toggleAudioPlayer,
        getVideoPlayerProps:
          inNativeApp && !inNativeIOSApp
            ? (props) => ({
                ...props,
                fullWindow: true,
                onFull: (isFull) => {
                  postMessage({
                    type: isFull ? 'fullscreen-enter' : 'fullscreen-exit',
                  })
                },
              })
            : undefined,
        withCommentData,
        CommentLink,
        ActionBar: BrowserOnlyActionBar,
        PayNote: showInlinePaynote ? TrialPayNoteMini : undefined,
      }),
    [template, inNativeIOSApp, inNativeApp, showInlinePaynote, titleBreakout],
  )

  const isEditorialNewsletter = template === 'editorialNewsletter'
  const disableActionBar = meta?.disableActionBar
  const actionBar = article && !disableActionBar && (
    <ActionBar
      mode='articleTop'
      document={article}
      documentLoading={articleLoading || needsRefetch}
    />
  )
  const actionBarEnd = actionBar
    ? cloneElement(actionBar, {
        mode: isSeriesOverview ? 'seriesOverviewBottom' : 'articleBottom',
      })
    : undefined

  const actionBarOverlay = actionBar
    ? cloneElement(actionBar, {
        mode: 'articleOverlay',
      })
    : undefined

  const actionBarFlyer = actionBar
    ? cloneElement(actionBar, {
        mode: 'flyer',
      })
    : undefined

  const series = meta?.series
  const episodes = series?.episodes
  const darkMode = article?.content?.meta?.darkMode

  const seriesSecondaryNav = showSeriesNav && (
    <SeriesNavBar
      showInlinePaynote={showInlinePaynote}
      me={me}
      series={series}
      repoId={repoId}
    />
  )

  const colorMeta =
    meta &&
    (meta.template === 'format' || meta.template === 'section'
      ? meta
      : meta.format && meta.format.meta)
  const formatColor = colorMeta && (colorMeta.color || colors[colorMeta.kind])
  const sectionColor = meta && meta.template === 'section' && meta.color
  const MissingNode = isEditor ? undefined : ({ children }) => children

  const extract = router.query.extract
  if (extract) {
    return (
      <PageLoader
        loading={articleLoading && !articleData}
        error={articleError}
        render={() => {
          if (!article) {
            return (
              <StatusError
                statusCode={404}
                clientRedirection={clientRedirection}
                serverContext={serverContext}
              />
            )
          }
          return extract === 'share' ? (
            <ShareImage meta={meta} />
          ) : (
            <Extract
              ranges={extract}
              schema={schema}
              meta={meta}
              unpack={router.query.unpack}
              mdast={{
                ...article.content,
                format: meta.format,
                section: meta.section,
                series: meta.series,
                repoId: article.repoId,
              }}
            />
          )
        }}
      />
    )
  }

  const splitContent = article && splitByTitle(article.content)
  const renderSchema = (content) =>
    renderMdast(
      {
        ...content,
        format: meta.format,
        section: meta.section,
        series: meta.series,
        repoId: article.repoId,
      },
      schema,
      { MissingNode },
    )

  const hasOverviewNav = meta
    ? meta.template === 'section' || meta.template === 'flyer'
    : true // show/keep around while loading meta
  const colorSchemeKey = darkMode ? 'dark' : 'auto'

  const delegateMetaDown =
    !!meta?.delegateDown ||
    !!(meta?.ownDiscussion?.id && router.query.focus) ||
    !!(meta?.ownDiscussion?.isBoard && router.query.parent)

  return (
    <Frame
      raw
      // Meta tags for a focus comment are rendered in Discussion/Commments.js
      meta={!delegateMetaDown && meta}
      secondaryNav={seriesSecondaryNav}
      formatColor={formatColor}
      hasOverviewNav={hasOverviewNav}
      stickySecondaryNav={hasOverviewNav}
      pageColorSchemeKey={colorSchemeKey}
    >
      <PageLoader
        loading={articleLoading && !articleData}
        error={articleError}
        render={() => {
          if (!article || !schema) {
            return (
              <StatusError
                statusCode={404}
                clientRedirection={clientRedirection}
                serverContext={serverContext}
              />
            )
          }

          const isFormat = meta.template === 'format'
          const isSection = meta.template === 'section'
          const isPage = meta.template === 'page'
          const isFlyer = treeType === 'slate'

          const hasNewsletterUtms =
            router.query.utm_source && router.query.utm_source === 'newsletter'

          const suppressPayNotes =
            isSection || (!!episodes && showInlinePaynote)
          const suppressFirstPayNote =
            suppressPayNotes ||
            podcast ||
            isEditorialNewsletter ||
            meta.path === '/top-storys' ||
            hasNewsletterUtms ||
            (router.query.utm_source && router.query.utm_source === 'flyer-v1')

          const payNote = (
            <PayNote
              seed={payNoteSeed}
              tryOrBuy={payNoteTryOrBuy}
              documentId={documentId}
              repoId={repoId}
              customPayNotes={meta.paynotes ?? []}
              customMode={meta.paynoteMode}
              customOnly={isPage || isFormat}
              position='before'
              Wrapper={isFlyer ? FlyerWrapper : undefined}
            />
          )
          const payNoteAfter =
            payNote && cloneElement(payNote, { position: 'after' })

          const ownDiscussion = meta.ownDiscussion

          const ProgressComponent =
            hasAccess &&
            !isSection &&
            !isFormat &&
            !isPage &&
            meta.template !== 'discussion'
              ? Progress
              : EmptyComponent

          const titleNode =
            splitContent.title &&
            splitContent.title.children[splitContent.title.children.length - 1]
          const titleAlign =
            titleNode?.data?.center || isFormat || isSection
              ? 'center'
              : undefined

          const breakout = titleNode?.data?.breakout || titleBreakout

          const format = meta.format

          const isFreeNewsletter = !!newsletterMeta && newsletterMeta.free
          const showNewsletterSignupTop = isFreeNewsletter && !me && isFormat
          const showNewsletterSignupBottom =
            isFreeNewsletter && !showNewsletterSignupTop

          const rawContentMeta = articleContent.meta
          const feedQueryVariables = rawContentMeta.feedQueryVariables
            ? parseJSONObject(rawContentMeta.feedQueryVariables)
            : undefined
          const hideFeed = !!rawContentMeta.hideFeed
          const hideSectionNav = !!rawContentMeta.hideSectionNav

          return (
            <>
              <FontSizeSync />
              {meta.prepublication && (
                <div {...styles.prepublicationNotice}>
                  <Center breakout={breakout}>
                    <Interaction.P>
                      {t('article/prepublication/notice')}
                    </Interaction.P>
                  </Center>
                </div>
              )}
              {isFlyer ? (
                <Flyer.Layout schema={schema}>
                  <RenderContextProvider t={t} Link={HrefLink}>
                    <SlateRender
                      value={article.content.children}
                      schema={schema}
                      raw
                      skip={['flyerOpeningP']}
                    />
                  </RenderContextProvider>
                  <FlyerTile>
                    <FlyerFooter
                      actionBar={actionBarFlyer}
                      repoId={repoId}
                      publishDate={meta.publishDate}
                    />
                  </FlyerTile>
                </Flyer.Layout>
              ) : (
                <ArticleGallery
                  article={article}
                  show={!!router.query.gallery}
                  ref={galleryRef}
                >
                  <ProgressComponent article={article}>
                    <article style={{ display: 'block' }}>
                      {splitContent.title && (
                        <div {...styles.titleBlock}>
                          {renderSchema(splitContent.title)}
                          {isEditorialNewsletter && (
                            <TitleBlock margin={false}>
                              {format && format.meta && (
                                <Editorial.Format
                                  color={
                                    format.meta.color ||
                                    colors[format.meta.kind]
                                  }
                                >
                                  <Link href={format.meta.path} passHref>
                                    <a
                                      {...plainLinkRule}
                                      href={format.meta.path}
                                    >
                                      {format.meta.title}
                                    </a>
                                  </Link>
                                </Editorial.Format>
                              )}
                              <Interaction.Headline>
                                {meta.title}
                              </Interaction.Headline>
                              <Editorial.Credit>
                                {formatDate(new Date(meta.publishDate))}
                              </Editorial.Credit>
                            </TitleBlock>
                          )}
                          {isEditor && repoId && disableActionBar ? (
                            <Center
                              breakout={breakout}
                              style={{ paddingBottom: 0, paddingTop: 30 }}
                            >
                              <div
                                {...(titleAlign === 'center'
                                  ? styles.flexCenter
                                  : {})}
                              >
                                <IconButton
                                  Icon={EditIcon}
                                  href={`${PUBLIKATOR_BASE_URL}/repo/${repoId}/tree`}
                                  target='_blank'
                                  title={t('feed/actionbar/edit')}
                                  label={t('feed/actionbar/edit')}
                                  labelShort={t('feed/actionbar/edit')}
                                  fill={'#E9A733'}
                                />
                              </div>
                            </Center>
                          ) : null}
                          {actionBar ||
                          isSection ||
                          showNewsletterSignupTop ||
                          isSyntheticReadAloud ||
                          isReadAloud ? (
                            <Center breakout={breakout}>
                              {actionBar && (
                                <div
                                  ref={actionBarRef}
                                  {...styles.actionBarContainer}
                                  style={{
                                    textAlign: titleAlign,
                                    marginBottom: isEditorialNewsletter
                                      ? 0
                                      : undefined,
                                  }}
                                >
                                  {actionBar}
                                </div>
                              )}
                              {(isSyntheticReadAloud || isReadAloud) && (
                                <ReadAloudInline meta={meta} t={t} />
                              )}
                              {isSection && !hideSectionNav && (
                                <Breakout size='breakout'>
                                  <SectionNav
                                    color={sectionColor}
                                    linkedDocuments={article.linkedDocuments}
                                  />
                                </Breakout>
                              )}
                              {showNewsletterSignupTop && (
                                <div style={{ marginTop: 10 }}>
                                  <NewsletterSignUp {...newsletterMeta} />
                                </div>
                              )}
                            </Center>
                          ) : (
                            <div {...styles.actionBarContainer}>
                              {/* space before paynote */}
                            </div>
                          )}

                          {!suppressFirstPayNote && payNote}
                        </div>
                      )}
                      {renderSchema(splitContent.main)}
                    </article>
                    <ActionBarOverlay
                      audioPlayerVisible={audioPlayerVisible}
                      inNativeApp={inNativeApp}
                    >
                      {actionBarOverlay}
                    </ActionBarOverlay>
                  </ProgressComponent>
                </ArticleGallery>
              )}
              {meta.template === 'discussion' && ownDiscussion && (
                <Center breakout={breakout}>
                  <DiscussionContextProvider
                    discussionId={ownDiscussion.id}
                    isBoardRoot={ownDiscussion.isBoard}
                  >
                    <Discussion documentMeta={rawContentMeta} showPayNotes />
                  </DiscussionContextProvider>
                </Center>
              )}
              {showNewsletterSignupBottom && (
                <Center breakout={breakout}>
                  {format && !me && (
                    <Interaction.P>
                      <strong>{format.meta.title}</strong>
                    </Interaction.P>
                  )}
                  <NewsletterSignUp {...newsletterMeta} />
                </Center>
              )}
              {((hasAccess && meta.template === 'article') ||
                (isEditorialNewsletter &&
                  newsletterMeta &&
                  newsletterMeta.free)) && (
                <Center breakout={breakout}>
                  <div ref={bottomActionBarRef}>{actionBarEnd}</div>
                </Center>
              )}
              {!!podcast && meta.template !== 'article' && (
                <Center breakout={breakout}>
                  <Interaction.H3>{t(`PodcastButtons/title`)}</Interaction.H3>
                  <PodcastButtons {...podcast} />
                </Center>
              )}
              {episodes && !isSeriesOverview && (
                <SeriesNav
                  inline
                  repoId={repoId}
                  series={series}
                  context='after'
                  PayNote={showInlinePaynote ? TrialPayNoteMini : undefined}
                  ActionBar={me && ActionBar}
                  Link={Link}
                  t={t}
                  seriesDescription={false}
                />
              )}
              {isSection && !hideFeed && (
                <SectionFeed
                  key={`sectionFeed${article?.issuedForUserId}`}
                  formats={article.linkedDocuments.nodes.map((n) => n.id)}
                  variables={feedQueryVariables}
                />
              )}
              {isFormat && !hideFeed && (
                <FormatFeed
                  key={`formatFeed${article?.issuedForUserId}`}
                  formatId={article.repoId}
                  variables={feedQueryVariables}
                />
              )}
              {me && hasActiveMembership && (
                <ArticleRecommendationsFeed path={cleanedPath} />
              )}
              {hasActiveMembership &&
                (isEditorialNewsletter ||
                  meta.template === 'article' ||
                  meta.template === 'page') && <div style={{ height: 60 }} />}
              {!suppressPayNotes && payNoteAfter}
            </>
          )
        }}
      />
    </Frame>
  )
}

const styles = {
  prepublicationNotice: css({
    backgroundColor: colors.social,
  }),
  titleBlock: css({
    marginBottom: 20,
  }),
  actionBarContainer: css({
    marginTop: 16,
    marginBottom: 24,
    [mediaQueries.mUp]: {
      marginBottom: 36,
    },
  }),
  flexCenter: css({
    display: 'flex',
    justifyContent: 'center',
  }),
}

const ComposedPage = compose(
  withT,
  withInNativeApp,
  withMarkAsReadMutation,
)(ArticlePage)

export default ComposedPage
