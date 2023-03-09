import { matchMark, createMarkButton, buttonStyles } from '../../utils'

import {
  FormatBoldIcon as BoldIcon,
  FormatItalicIcon as ItalicIcon,
  StrikethroughIcon,
  SuperscriptIcon as SupIcon,
  SubscriptIcon as SubIcon,
} from '@republik/icons'

import MarkdownSerializer from 'slate-mdast-serializer'

const icons = {
  strong: BoldIcon,
  emphasis: ItalicIcon,
  delete: StrikethroughIcon,
  sub: SubIcon,
  sup: SupIcon,
}

const MarkComponent = ({ rule, subModules, TYPE }) => {
  const { type, mdastType: mdastTypeOption } = rule.editorOptions
  const mdastType = mdastTypeOption || type
  if (!mdastType) {
    throw new Error(`Missing Mdast Type ${mdastType}`)
  }

  const Icon = icons[mdastType]
  if (!Icon) {
    throw new Error(`Unsupported Mdast Type ${mdastType}`)
  }

  const markRule = {
    match: matchMark(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren }) => ({
      kind: 'mark',
      type: TYPE,
      nodes: visitChildren(node),
    }),
    toMdast: (mark, index, parent, { visitChildren }) => ({
      type: mdastType,
      children: visitChildren(mark),
    }),
  }

  const serializer = new MarkdownSerializer({
    rules: [markRule],
  })

  const Mark = rule.component

  return {
    TYPE,
    helpers: {
      serializer,
    },
    changes: {},
    ui: {
      textFormatButtons: [
        createMarkButton({
          type: TYPE,
        })(({ active, disabled, visible, ...props }) => (
          <span
            {...buttonStyles.mark}
            {...props}
            data-active={active}
            data-disabled={disabled}
            data-visible={visible}
          >
            <Icon size={24} />
          </span>
        )),
      ],
    },
    plugins: [
      {
        renderMark({ mark, children, attributes }) {
          if (!markRule.match(mark)) return

          return <Mark attributes={attributes}>{children}</Mark>
        },
      },
    ],
  }
}

export default MarkComponent
