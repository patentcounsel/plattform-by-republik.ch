import { createGetServerSideProps } from '../../lib/apollo/helpers'
import SubmissionsOverview from '../../components/PoliticsQuestionnaire/Overview'
import fs from 'node:fs/promises'
import path from 'node:path'
import { csvParse, nest } from 'd3'

import {
  QUESTION_TYPES,
  leftJoin,
} from '../../../www/components/PoliticsQuestionnaire/config'

export default ({ submissionData }) => (
  <SubmissionsOverview submissionData={submissionData} />
)

export const getServerSideProps = createGetServerSideProps(
  async ({
    ctx: {
      query: { canton, party },
    },
  }) => {
    const data = await fs.readFile(
      path.join(
        process.cwd(),
        'public/static/politicsquestionnaire2023/submissions_data.csv',
      ),
      'utf-8',
    )

    const responses = csvParse(data)

    const joinedData = leftJoin(responses, QUESTION_TYPES, 'questionSlug')

    const filteredData =
      canton && party
        ? joinedData.filter(
            (response) =>
              response.canton === canton && response.party === party,
          )
        : party
        ? joinedData.filter((response) => response.party === party)
        : canton
        ? joinedData.filter((response) => response.canton === canton)
        : joinedData

    const groupedData = nest()
      .key((d) => d.questionSlug)
      .entries(filteredData.length > 0 ? filteredData : joinedData)

    return {
      props: {
        submissionData: groupedData,
      },
    }
  },
)
