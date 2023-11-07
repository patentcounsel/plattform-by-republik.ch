import { gql } from '@apollo/client'

export const ARTICLE_QUERY = gql`
  query articleTeaser($path: String!) {
    article: document(path: $path) {
      meta {
        title
        description
        image
        credits
      }
    }
  }
`

export type ArticleQueryResult = {
  article?: {
    meta: {
      title?: string
      description?: string
      image?: string
      credits?: any
    }
  }
}
