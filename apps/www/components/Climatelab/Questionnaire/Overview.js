import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { Loader, Editorial } from '@project-r/styleguide'

import { QUESTIONNAIRE_QUERY } from '../../Questionnaire/Submissions/graphql'
import {
  QuestionFeatured,
  QuestionLink,
} from '../../Questionnaire/Submissions/QuestionFeatured'
import QuestionView from '../../Questionnaire/Submissions/QuestionView'

const AllQuestionsView = ({ slug }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_QUERY, {
    variables: { slug },
  })

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { questions },
        } = data

        return (
          <div style={{ margin: '0 auto' }}>
            <QuestionFeatured question={questions[6]} slug={slug} />
            <QuestionFeatured
              question={questions[0]}
              additionalQuestion={questions[1]}
              slug={slug}
              bgColor={'#FFFFC8'}
            />
            <div style={{ marginTop: 60 }}>
              <Editorial.P>
                <Editorial.UL>
                  <Editorial.LI>
                    <QuestionLink
                      question={questions[2]}
                      additionalQuestion={questions[3]}
                    >
                      <Editorial.A>{questions[2].text}</Editorial.A>
                    </QuestionLink>{' '}
                    (psst: es gibt da noch eine Bonusfrage)
                  </Editorial.LI>
                  <Editorial.LI>
                    <QuestionLink question={questions[5]}>
                      <Editorial.A>{questions[5].text}</Editorial.A>
                    </QuestionLink>
                  </Editorial.LI>
                </Editorial.UL>
              </Editorial.P>
            </div>
            <QuestionFeatured
              question={questions[16]}
              slug={slug}
              bgColor={'#FFFFC8'}
            />
            <QuestionFeatured
              question={questions[31]}
              additionalQuestion={questions[32]}
              slug={slug}
            />
          </div>
        )
      }}
    />
  )
}

const SubmissionsOverview = ({ slug }) => {
  const router = useRouter()
  const { query } = router
  const questionIds = query.type === 'question' && query.share?.split(',')

  if (questionIds) {
    return <QuestionView slug={slug} questionIds={questionIds} />
  }
  return <AllQuestionsView slug={slug} />
}

export default SubmissionsOverview
