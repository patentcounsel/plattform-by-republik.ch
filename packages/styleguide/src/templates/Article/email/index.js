import { matchType } from '@republik/mdast-react-render'
import Container from '../../EditorialNewsletter/email/Container'
import { editorialParagraphRule } from '../../shared/email/rules/paragraphRule'
import centerRule from '../../shared/email/rules/centerRule'
import {
  coverRule,
  edgeToEdgeFigureRule,
} from '../../shared/email/rules/figureRule'

const articleEmailSchema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: Container,
      props: (node) => ({
        meta: node.meta || {},
        variableContext: {
          firstName: 'FNAME',
          lastName: 'LNAME',
          groups: {
            hasAccess: 'Customer:Member,Geteilter Zugriff',
          },
          _mergeTags: true,
        },
      }),
      rules: [
        editorialParagraphRule,
        // we do not render the title block
        // titleBlockRule,
        centerRule,
        coverRule,
        edgeToEdgeFigureRule,
      ],
    },
  ],
}

export default articleEmailSchema
