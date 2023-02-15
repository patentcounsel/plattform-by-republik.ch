import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import {
  Button,
  InlineSpinner,
  Interaction,
  Loader,
} from '@project-r/styleguide'

import { css } from 'glamor'

import { useInfiniteScroll } from '../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import PlainButton from './PlainButton'
// import { SortToggle } from '../../Search/Sort'

import {
  hasMoreData,
  loadMoreSubmissions,
  QUESTIONNAIRE_SUBMISSIONS_QUERY,
  // SORT_DIRECTION_PARAM,
  // SORT_KEY_PARAM,
  // SUPPORTED_SORT,
} from './graphql'
import AnswerText from './AnswerText'
import { AnswersChart, COLORS, getTargetedAnswers } from './QuestionFeatured'
import { ShareImageSplit } from './ShareImageSplit'
import Meta from '../../Frame/Meta'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { replaceText } from './utils'

/*const getSortParams = (query, sort) => {
  if (sort.key === 'random' || !sort.key) {
    const {
      [SORT_KEY_PARAM]: key,
      [SORT_DIRECTION_PARAM]: dir,
      ...restQuery
    } = query
    return restQuery
  }
  return {
    ...query,
    [SORT_KEY_PARAM]: sort.key,
    [SORT_DIRECTION_PARAM]: sort.direction,
  }
}*/

const QuestionViewMeta = ({ share, question }) => {
  const router = useRouter()
  const urlObj = new URL(router.asPath, PUBLIC_BASE_URL)
  const url = urlObj.toString()

  const shareImageUrlObj = urlObj
  shareImageUrlObj.searchParams.set('extract', share.extract)
  const shareImageUrl = shareImageUrlObj.toString()

  return (
    <Meta
      data={{
        url,
        title: replaceText(share.title, { questionText: question.text }),
        description: share.description,
        image: `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
          shareImageUrl,
        )}`,
      }}
    />
  )
}

const QuestionView = ({ slug, questionIds, extract, share = {} }) => {
  const { t } = useTranslation()
  const router = useRouter()
  // const { query } = router
  // const sortBy = query.skey || 'random'
  // const sortDirection = query.sdir || undefined
  const pathname = router.asPath.split('?')[0]
  const { loading, error, data, fetchMore } = useQuery(
    QUESTIONNAIRE_SUBMISSIONS_QUERY,
    {
      variables: {
        slug,
        first: 20,
        sortBy: 'random',
        // sortDirection,
        questionIds,
      },
    },
  )

  const hasMore = hasMoreData(data)
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore: loadMoreSubmissions(fetchMore, data),
  })

  const allQuestions = data?.questionnaire?.questions
  const currentQuestions =
    allQuestions?.filter((q) => questionIds.includes(q.id)) || []
  const [mainQuestion, addQuestion] = currentQuestions
  if (extract) {
    return <ShareImageSplit question={mainQuestion} {...share} />
  }

  return (
    <>
      <Button
        onClick={() => {
          router.replace({
            pathname,
          })
        }}
      >
        Zurück zur Übersicht
      </Button>
      {/* <div style={{ marginTop: 20 }}>
        <span style={{ marginRight: 20 }}>Sortierung:</span>
        {SUPPORTED_SORT.map((sort, key) => (
          <SortToggle
            key={key}
            sort={sort}
            urlSort={{ key: sortBy, direction: sortDirection }}
            getSearchParams={({ sort }) => getSortParams(query, sort)}
            pathname={pathname}
          />
        ))}
      </div> */}

      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { results },
          } = data

          const targetAnswers = getTargetedAnswers(questionIds, results)

          return (
            <>
              <QuestionViewMeta share={share} question={mainQuestion} />
              <div
                style={{
                  marginBottom: 20,
                  paddingTop: 50,
                }}
                ref={containerRef}
              >
                <Interaction.H2>{mainQuestion.text}</Interaction.H2>

                {mainQuestion?.__typename === 'QuestionTypeChoice' && (
                  <AnswersChart question={mainQuestion} skipTitle={true} />
                )}

                {!!addQuestion && (
                  <Interaction.H2 style={{ marginTop: 30 }}>
                    {addQuestion.text}
                  </Interaction.H2>
                )}

                <div
                  style={{
                    marginTop: 50,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  {targetAnswers.map(({ answers, displayAuthor }) => (
                    <div
                      key={answers[0].id}
                      style={{
                        padding: '10px',
                        marginBottom: '20px',
                        borderRadius: '10px',
                        backgroundColor: '#FFF',
                        color: '#000',
                        flex: '1 auto',
                      }}
                    >
                      <Interaction.P attributes={{}}>
                        {answers.map((answer, idx) => {
                          const colorIndex =
                            mainQuestion?.__typename === 'QuestionTypeChoice' &&
                            mainQuestion.options
                              .map((d) => d.value)
                              .indexOf(answer.payload.value[0])

                          return (
                            <div
                              style={{
                                position: 'relative',
                                color: '#000',
                              }}
                              key={answer.id}
                            >
                              {answer?.question?.__typename !==
                                'QuestionTypeChoice' && (
                                <div
                                  style={{
                                    paddingTop: colorIndex ? '20px' : 0,
                                  }}
                                >
                                  <AnswerText
                                    text={answer.payload.text}
                                    value={answer.payload.value}
                                    question={currentQuestions[idx]}
                                  />
                                  <br />
                                  <br />
                                </div>
                              )}

                              {mainQuestion?.__typename ===
                                'QuestionTypeChoice' &&
                                idx < 1 && (
                                  <div
                                    {...styles.colorBar}
                                    style={{
                                      backgroundColor:
                                        colorIndex !== -1
                                          ? COLORS[colorIndex]
                                          : undefined,
                                    }}
                                  />
                                )}
                            </div>
                          )
                        })}
                        <em
                          style={{
                            color: '#000',
                          }}
                        >
                          – {displayAuthor.name}
                        </em>
                      </Interaction.P>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  {loadingMoreError && (
                    <ErrorMessage error={loadingMoreError} />
                  )}
                  {loadingMore && <InlineSpinner />}
                  {!infiniteScroll && hasMore && (
                    <PlainButton
                      onClick={() => {
                        setInfiniteScroll(true)
                      }}
                    >
                      {t.pluralize('questionnaire/submissions/showAnswers', {
                        count: results.totalCount - results.nodes.length,
                      })}
                    </PlainButton>
                  )}
                </div>
              </div>
            </>
          )
        }}
      />
    </>
  )
}

export default QuestionView

const styles = {
  colorBar: css({
    position: 'absolute',
    left: -10,
    top: -10,
    height: '10px',
    width: '20%',
    borderTopLeftRadius: '2px',
  }),
}

const gridStyles = {
  container: css({
    maxWidth: '1600px',
    margin: '20px auto 0',
    padding: '0 60px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gridTemplateRows: 'auto',
    gridAutoFlow: 'row dense',
    gap: '1rem',
  }),
  card: css({
    background: 'transparent',
    width: '100%',
    height: '100%',
    gridRowEnd: 'span 1',
    gridColumnEnd: 'span 1',
    cursor: 'pointer',
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
    },
  }),
}
