import React from 'react'
import { matchBlock } from '../../utils'
import { findOrCreate } from '../../utils/serializationValidation'
import { gray2x1 } from '../../utils/placeholder'
import { createCoverForm } from './ui'
import MarkdownSerializer from '../../../../lib/serializer'

export default ({rule, subModules, TYPE}) => {
  const titleModule = subModules.find(m => m.name === 'headline')
  if (!titleModule) {
    throw new Error('Missing headline submodule')
  }
  const titleSerializer = titleModule.helpers.serializer

  const leadModule = subModules.find(m => m.name === 'paragraph')
  if (!leadModule) {
    throw new Error('Missing paragraph submodule')
  }
  const leadSerializer = leadModule.helpers.serializer

  const isCover = matchBlock(TYPE)

  const Cover = rule.component

  const cover = {
    match: isCover,
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, visitChildren) => {
      // fault tolerant because markdown could have been edited outside
      const deepNodes = node.children.reduce(
        (children, child) => children
          .concat(child)
          .concat(child.children),
        []
      )
      const image = findOrCreate(deepNodes, {type: 'image'})
      const imageParagraph = node.children.find(
        child => child.children && child.children.indexOf(image) !== -1
      )
      const title = findOrCreate(
        node.children,
        {type: 'heading', depth: 1},
        {children: []}
      )

      const lead = (
        node.children.find(child => child.type === 'paragraph' && child !== imageParagraph) ||
        findOrCreate(
          node.children,
          {type: 'blockquote'},
          {children: []}
        ).children[0] ||
        ({
          type: 'paragraph',
          children: []
        })
      )

      return {
        kind: 'block',
        type: TYPE,
        data: {
          src: image.url,
          alt: image.alt
        },
        nodes: [
          titleSerializer.fromMdast(title),
          leadSerializer.fromMdast(lead)
        ]
      }
    },
    toMdast: (object, index, parent, visitChildren, context) => {
      return {
        type: 'zone',
        identifier: TYPE,
        children: [
          {
            type: 'image',
            alt: object.data.alt,
            url: object.data.src
          },
          titleSerializer.toMdast(
            findOrCreate(object.nodes, {
              kind: 'block',
              type: titleModule.TYPE
            }, {nodes: []}), context
          ),
          leadSerializer.toMdast(
            findOrCreate(object.nodes, {
              kind: 'block',
              type: leadModule.TYPE
            }, {nodes: []}), context
          )
        ]
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [
      cover
    ]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    changes: {},
    ui: {
      forms: [
        createCoverForm(TYPE)
      ]
    },
    plugins: [
      {
        renderNode ({node, children, attributes}) {
          if (!cover.match(node)) return
          return (
            <Cover data={{
              src: node.data.get('src') || gray2x1,
              alt: node.data.get('alt')
            }} attributes={attributes}>
              {children}
            </Cover>
          )
        },
        schema: {
          blocks: {
            [TYPE]: {
              nodes: [
                {
                  types: [titleModule.TYPE],
                  min: 1,
                  max: 1
                },
                {
                  types: [leadModule.TYPE],
                  min: 1,
                  max: 1
                }
              ],
              normalize: (change, reason, {node, index, child}) => {
                if (reason === 'child_required') {
                  change.insertNodeByKey(
                    node.key,
                    index,
                    {
                      kind: 'block',
                      type: index === 0
                        ? titleModule.TYPE
                        : leadModule.TYPE
                    }
                  )
                }
                if (reason === 'child_type_invalid') {
                  change.setNodeByKey(
                    child.key,
                    {
                      type: index === 0
                        ? titleModule.TYPE
                        : leadModule.TYPE
                    }
                  )
                }
                if (reason === 'child_unknown') {
                  if (index > 1) {
                    change.mergeNodeByKey(child.key)
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
}
