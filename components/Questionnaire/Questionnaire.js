import React, { Component } from 'react'
import Loader from '../Loader'

import { css } from 'glamor'
import { compose } from 'react-apollo'
import CheckCircle from 'react-icons/lib/md/check-circle'

import {
  colors,
  Interaction,
  mediaQueries,
  InlineSpinner,
  fontFamilies,
  RawHtml
} from '@project-r/styleguide'

import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE } from '../constants'
import withT from '../../lib/withT'
import withAuthorization from '../Auth/withAuthorization'
import { errorToString } from '../../lib/utils/errors'
import { Router } from '../../lib/routes'
import StatusError from '../StatusError'
import { withQuestionnaireMutation, withQuestionnaireReset } from './enhancers'
import Questions from './Questions'
import QuestionnaireClosed from './QuestionnaireClosed'
import QuestionnaireActions from './QuestionnaireActions'
import { withRouter } from 'next/router'

const { Headline, P } = Interaction

const styles = {
  intro: css({
    marginTop: 35
  }),
  count: css({
    background: '#fff',
    zIndex: 10,
    position: 'sticky',
    padding: '10px 0',
    borderBottom: `0.5px solid ${colors.divider}`,
    display: 'flex',
    minHeight: 55,
    top: HEADER_HEIGHT - 1,
    [mediaQueries.onlyS]: {
      top: HEADER_HEIGHT_MOBILE - 1
    }
  }),
  strong: css({
    fontFamily: fontFamilies.sansSerifMedium
  }),
  error: css({
    color: colors.error,
    fontFamily: fontFamilies.sansSerifMedium
  }),
  closed: css({
    marginTop: 35,
    background: colors.primaryBg,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    textAlign: 'center',
    marginBottom: 30
  }),
  progressIcon: css({
    marginLeft: 5,
    marginTop: 3,
    minHeight: 30
  })
}

export const actionStyles = css({
  textAlign: 'center',
  margin: '20px auto 20px auto'
})

class Questionnaire extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  processSubmit = (fn, ...args) => {
    this.setState({ updating: true })
    return fn(...args)
      .then(() =>
        this.setState(() => ({
          updating: false,
          error: null
        }))
      )
      .catch(error => {
        this.setState(() => ({
          updating: false,
          submitting: false,
          error
        }))
      })
  }

  handleSubmit = () => {
    this.setState({ submitting: true })
    const {
      submitQuestionnaire,
      questionnaireData: {
        questionnaire: { id }
      }
    } = this.props
    this.processSubmit(submitQuestionnaire, id).then(() =>
      Router.pushRoute('/verlag').then(() => window.scrollTo(0, 0))
    )
  }

  handleReset = e => {
    const {
      resetQuestionnaire,
      questionnaireData: {
        questionnaire: { id }
      }
    } = this.props
    e.preventDefault()
    this.processSubmit(resetQuestionnaire, id).then(() => window.scrollTo(0, 0))
  }

  render() {
    const {
      questionnaireData,
      t,
      showResults,
      pageClosed,
      questionnaireName,
      externalSubmit,
      hideCount
    } = this.props

    return (
      <Loader
        loading={questionnaireData.loading}
        error={questionnaireData.error}
        render={() => {
          const now = new Date()
          // handle not found or not started
          if (
            !questionnaireData.questionnaire ||
            new Date(questionnaireData.questionnaire.beginDate) > now
          ) {
            return (
              <StatusError
                statusCode={404}
                serverContext={this.props.serverContext}
              />
            )
          }

          const hasEnded =
            now > new Date(questionnaireData.questionnaire.endDate)

          // handle already submitted
          const {
            questionnaire: { userHasSubmitted, questions }
          } = questionnaireData
          const error = this.state.error || this.props.error
          const submitting = this.state.submitting || this.props.submitting
          const updating = this.state.updating || this.props.updating

          if (!submitting && (hasEnded || userHasSubmitted)) {
            return pageClosed ? (
              pageClosed
            ) : (
              <QuestionnaireClosed
                submitted={userHasSubmitted}
                showResults={showResults}
              />
            )
          }

          // handle questions
          const questionCount = questions.filter(Boolean).length
          const userAnswerCount = questions
            .map(q => q.userAnswer)
            .filter(Boolean).length
          const questionnairePath = questionnaireName
            ? `/${questionnaireName}/`
            : '/'
          return (
            <div>
              <Headline>{t(`questionnaire${questionnairePath}title`)}</Headline>
              <div {...styles.intro}>
                <RawHtml
                  type={P}
                  dangerouslySetInnerHTML={{
                    __html: t(`questionnaire${questionnairePath}intro`)
                  }}
                />
                <br />
              </div>
              {!hideCount && (
                <div {...styles.count}>
                  {error ? (
                    <P {...styles.error}>{errorToString(error)}</P>
                  ) : (
                    <>
                      <P {...styles.strong}>
                        {t('questionnaire/header', {
                          questionCount,
                          userAnswerCount
                        })}
                      </P>
                      {questionCount === userAnswerCount ? (
                        <div {...styles.progressIcon}>
                          <CheckCircle size={22} color={colors.primary} />
                        </div>
                      ) : updating || submitting ? (
                        <div style={{ marginLeft: 5, marginTop: 3 }}>
                          <InlineSpinner size={24} />
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
              <Questions
                questions={questions}
                disabled={userHasSubmitted}
                processSubmit={this.processSubmit}
              />
              {!externalSubmit && (
                <QuestionnaireActions
                  onSubmit={this.handleSubmit}
                  onReset={this.handleReset}
                  updating={updating}
                  submitting={submitting}
                  invalid={userAnswerCount < 1}
                />
              )}
            </div>
          )
        }}
      />
    )
  }
}

export default compose(
  withT,
  withRouter,
  withAuthorization(['supporter', 'editor'], 'showResults'),
  withQuestionnaireMutation,
  withQuestionnaireReset
)(Questionnaire)
