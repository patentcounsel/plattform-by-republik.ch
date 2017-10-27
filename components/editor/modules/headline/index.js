import React from 'react'

import MarkdownSerializer from '../../../../lib/serializer'
import Placeholder from '../../Placeholder'
import addValidation from '../../utils/serializationValidation'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'

export default ({rule, subModules, TYPE}) => {
  const {
    depth,
    placeholder,
    formatButtonText
  } = rule.options

  const title = {
    match: matchBlock(TYPE),
    matchMdast: (node) => node.type === 'heading' && node.depth === depth,
    fromMdast: (node, index, parent, visitChildren) => ({
      kind: 'block',
      type: TYPE,
      nodes: visitChildren(node)
    }),
    toMdast: (object, index, parent, visitChildren) => ({
      type: 'heading',
      depth,
      children: visitChildren(object)
    }),
    placeholder: placeholder && (({node}) => {
      if (node.text.length) return null

      return <Placeholder>{placeholder}</Placeholder>
    }),
    render: rule.component
  }

  const serializer = new MarkdownSerializer({
    rules: [
      title
    ]
  })

  addValidation(title, serializer, TYPE)

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      blockFormatButtons: [
        formatButtonText && createBlockButton({
          type: TYPE
        })(
          ({ active, disabled, visible, ...props }) =>
            <span
              {...buttonStyles.block}
              {...props}
              data-active={active}
              data-disabled={disabled}
              data-visible={visible}
              >
              {formatButtonText}
            </span>
        )
      ]
    },
    plugins: [
      {
        schema: {
          rules: [
            title
          ]
        }
      }
    ]
  }
}
