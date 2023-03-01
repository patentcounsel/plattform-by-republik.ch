import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'

import NextLink from 'next/link'

import {
  InlineSpinner,
  Interaction,
  Loader,
  Editorial,
  fontStyles,
  ColorContextProvider,
  colors,
  NarrowContainer,
  mediaQueries,
  convertStyleToRem,
  inQuotes,
  Center,
} from '@project-r/styleguide'

import { css } from 'glamor'

import { useInfiniteScroll } from '../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import PlainButton from './PlainButton'

import {
  hasMoreData,
  loadMoreSubmissions,
  QUESTIONNAIRE_SUBMISSIONS_QUERY,
} from './graphql'
import AnswerText from './AnswerText'
import {
  AnswersChart,
  getTargetedAnswers,
  SubmissionLink,
} from './QuestionFeatured'
import { ShareImageSplit } from './ShareImageSplit'
import Meta from '../../Frame/Meta'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { replaceText } from './utils'
import { questionColor, QUESTIONS } from '../../Climatelab/Questionnaire/config'
import scrollIntoView from 'scroll-into-view'

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
  const pathname = router.asPath.split('?')[0]
  const { loading, error, data, fetchMore } = useQuery(
    QUESTIONNAIRE_SUBMISSIONS_QUERY,
    {
      variables: {
        slug,
        first: 20,
        sortBy: 'random',
        answers: questionIds.map((questionId) => ({ questionId })),
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

  const answerGridRef = useRef()
  useEffect(() => {
    if (extract) return
    scrollIntoView(answerGridRef.current)
  }, [])

  const allQuestions = data?.questionnaire?.questions
  const currentQuestions =
    allQuestions?.filter((q) => questionIds.includes(q.id)) ?? []
  const [mainQuestion, addQuestion] = currentQuestions
  if (extract) {
    return <ShareImageSplit question={mainQuestion} {...share} />
  }

  const isChoiceQuestion = mainQuestion?.__typename === 'QuestionTypeChoice'

  const questionGroupIdx = QUESTIONS.findIndex(
    (q) => allQuestions && allQuestions[q.ids[0]]?.id === questionIds[0],
  )

  return (
    <div ref={answerGridRef}>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { results },
          } = data

          const targetAnswers = getTargetedAnswers(questionIds, results)
          const twoTextQuestions = !isChoiceQuestion && !!addQuestion

          return (
            <>
              <QuestionViewMeta share={share} question={mainQuestion} />
              <div style={{ backgroundColor: questionColor(questionGroupIdx) }}>
                <div
                  style={{
                    marginTop: 48,
                    marginBottom: 20,
                    paddingTop: 24,
                  }}
                  ref={containerRef}
                >
                  <Center>
                    <div style={{ textAlign: 'center' }}>
                      <Interaction.P>
                        <NextLink
                          href={{
                            pathname,
                            query: {
                              focus: questionIds[0],
                            },
                          }}
                          shallow
                          passHref
                        >
                          <Editorial.A>Zurück zur Übersicht</Editorial.A>
                        </NextLink>
                      </Interaction.P>
                      <Editorial.Subhead>
                        {mainQuestion.text}
                        {twoTextQuestions && (
                          <>
                            <hr
                              style={{
                                opacity: 0.7,
                                margin: '1.2em 33%',
                                border: 0,
                                borderTop: '1px solid currentColor',
                              }}
                            />
                            <span>{addQuestion.text}</span>
                          </>
                        )}
                      </Editorial.Subhead>

                      {isChoiceQuestion && (
                        <>
                          <AnswersChart
                            question={mainQuestion}
                            skipTitle={true}
                          />
                          <br />
                          <Editorial.Subhead style={{ textAlign: 'center' }}>
                            {addQuestion.text}
                          </Editorial.Subhead>
                        </>
                      )}
                    </div>

                    <div {...styles.answerCardWrapper}>
                      {targetAnswers.map(({ answers, displayAuthor, id }) => (
                        <SubmissionLink id={id} key={id}>
                          <a style={{ textDecoration: 'none' }}>
                            <div {...styles.answerCard}>
                              <ColorContextProvider
                                localColorVariables={colors}
                                colorSchemeKey='light'
                              >
                                <Editorial.P
                                  attributes={{ style: { width: '100%' } }}
                                >
                                  <div
                                    {...(!isChoiceQuestion &&
                                      styles.answerCardContent)}
                                  >
                                    {answers.map((answer, idx) => {
                                      return (
                                        <div key={answer.id}>
                                          {isChoiceQuestion && !idx ? (
                                            <div {...styles.circleLabel}>
                                              <span {...styles.circle} />
                                              <AnswerText
                                                text={answer.payload.text}
                                                value={answer.payload.value}
                                                question={currentQuestions[idx]}
                                                isQuote
                                              />
                                            </div>
                                          ) : (
                                            <div
                                              {...(isChoiceQuestion &&
                                                styles.answerCardContent)}
                                            >
                                              <AnswerText
                                                text={answer.payload.text}
                                                value={answer.payload.value}
                                                question={currentQuestions[idx]}
                                                isQuote
                                              />

                                              {idx === 0 && twoTextQuestions && (
                                                <hr
                                                  style={{
                                                    opacity: 0.3,
                                                    margin: '1.2em 33%',
                                                    border: 0,
                                                    borderTop:
                                                      '1px solid currentColor',
                                                  }}
                                                />
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                    <Editorial.Credit>
                                      Von{' '}
                                      <span
                                        style={{ textDecoration: 'underline' }}
                                      >
                                        {displayAuthor.name}
                                      </span>
                                    </Editorial.Credit>
                                  </div>
                                </Editorial.P>
                              </ColorContextProvider>
                            </div>
                          </a>
                        </SubmissionLink>
                      ))}
                    </div>

                    <div style={{ paddingBottom: 24 }}>
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
                          {t.pluralize(
                            'questionnaire/submissions/showAnswers',
                            {
                              count: results.totalCount - results.nodes.length,
                            },
                          )}
                        </PlainButton>
                      )}
                    </div>
                  </Center>
                </div>
              </div>
            </>
          )
        }}
      />
    </div>
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
  answerCardWrapper: css({
    marginTop: 40,
  }),
  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 30,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 20,
    transition: 'transform .3s ease-in-out',
    ':hover': {
      transform: 'scale(1.03) !important',
    },
  }),
  answerCardContent: css({
    overflowWrap: 'break-word',
    hyphens: 'manual',
    ...convertStyleToRem(fontStyles.serifBold17),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.serifBold19),
    },
  }),
  circleLabel: css({
    ...fontStyles.sansSerifRegular16,
    marginBottom: 30,
  }),
  circle: css({
    display: 'inline-block',
    borderRadius: '50%',
    width: '10px',
    height: '10px',
    marginRight: 5,
    backgroundColor: `currentColor`,
    opacity: 0.7,
  }),
}
