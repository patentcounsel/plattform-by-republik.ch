import { scaleOrdinal } from 'd3-scale'

// TODO: use correct color palette
export const QUESTIONNAIRE_BG_COLOR = '#ffdc5e'
const COLORS = ['#ffdd5e', '#ce9fc7', '#67a9d9', '#f49787', '#75d69c']

export const questionColor = scaleOrdinal(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  COLORS,
)

type QuestionConfigType = {
  questionSlug: string[]
}

export const QUESTIONS: QuestionConfigType[] = [
  {
    questionSlug: ['welche-partei-musste-aus-ihrer-sicht-neu-gegrundet-werden'],
  },
  { questionSlug: ['ihr-grundsatz'] },
  { questionSlug: ['wo-geben-sie-gern-nach'] },
  {
    questionSlug: [
      'ab-welcher-ferien-destinations-distanz-ist-fliegen-erlaubt',
    ],
  },
  { questionSlug: ['ihr-verhaltnis-zu-sand'] },
  { questionSlug: ['es-ist-ein-tag-vor-ferienende-ihre-stimmung'] },
]

export const OVERVIEW_QUESTIONNAIRE_PATH = '/politikerfragebogen-2023'

export const QUESTIONNAIRE_SLUG = 'politiker-wahlen'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-klimafragebogen-uebersicht/files/034a0eca-8aaf-4511-90aa-504cca584981/final-art_questionnaire.png'
