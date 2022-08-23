import React, { useMemo } from 'react'
import {
  AddIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  DeleteIcon,
  MoreIcon,
} from '../../../../Icons'
import IconButton from '../../../../IconButton'
import { css } from 'glamor'
import { insertAfter, moveElement, removeElement } from '../helpers/structure'
import { useSlate } from 'slate-react'
import { useFormContext } from './Forms'
import { CustomElement, TemplateType } from '../../../custom-types'
import { config as elConfig } from '../../../config/elements'
import CalloutMenu from '../../../../Callout/CalloutMenu'
import colors from '../../../../../theme/colors'

const DEFAULT_POSITION = {
  top: 0,
  left: -40,
}

const styles = {
  container: css({
    userSelect: 'none',
    position: 'absolute',
    background: 'white',
    padding: 3,
    zIndex: 10,
    borderRadius: 1,
  }),
  padded: css({
    marginBottom: 8,
  }),
}

const iconStyle = { marginRight: 0 }

const MoveUp: React.FC<{
  path: number[]
}> = ({ path }) => {
  const editor = useSlate()
  const isDisabled = useMemo(
    () => !moveElement(editor, path, 'up', true),
    [path],
  )
  return (
    <IconButton
      Icon={ArrowUpIcon}
      onClick={() => moveElement(editor, path, 'up')}
      disabled={isDisabled}
      title='move element up'
      style={iconStyle}
    />
  )
}

const MoveDown: React.FC<{
  path: number[]
}> = ({ path }) => {
  const editor = useSlate()
  const isDisabled = useMemo(
    () => !moveElement(editor, path, 'down', true),
    [path],
  )
  return (
    <IconButton
      Icon={ArrowDownIcon}
      onClick={() => moveElement(editor, path, 'down')}
      disabled={isDisabled}
      title='move element down'
      style={iconStyle}
    />
  )
}

const Remove: React.FC<{
  path: number[]
}> = ({ path }) => {
  const editor = useSlate()
  const isDisabled = useMemo(() => !removeElement(editor, path, true), [path])
  return (
    <IconButton
      Icon={DeleteIcon}
      fill={colors.error}
      onClick={() => removeElement(editor, path)}
      disabled={isDisabled}
      title='remove element'
      style={iconStyle}
    />
  )
}

const Insert: React.FC<{
  path: number[]
  templates: TemplateType | TemplateType[]
}> = ({ path, templates }) => {
  const editor = useSlate()
  const setFormPath = useFormContext()[1]
  const template = Array.isArray(templates) ? templates[0] : templates

  return (
    <IconButton
      Icon={AddIcon}
      onClick={() => {
        const insertPath = insertAfter(editor, template, path)
        setTimeout(() => {
          setFormPath(insertPath)
        })
      }}
      title='insert new element'
      style={iconStyle}
    />
  )
}

const Edit: React.FC<{
  path: number[]
}> = ({ path }) => {
  const setFormPath = useFormContext()[1]
  return (
    <IconButton
      Icon={EditIcon}
      onClick={() => setFormPath(path)}
      title='edit element'
      style={{ ...iconStyle, padding: 3 }}
      size={18}
    />
  )
}

const BlockUi: React.FC<{
  path: number[]
  element: CustomElement
}> = ({ path, element }) => {
  const template = element.template
  const blockUi = elConfig[element.type].attrs?.blockUi
  const showEdit = !!elConfig[element.type].Form
  const showMoveUi = !!template?.repeat

  const editButton = (
    <div {...(showMoveUi && styles.padded)}>
      <Edit path={path} />
    </div>
  )

  return (
    <div
      className='ui-element'
      {...styles.container}
      style={blockUi?.position || DEFAULT_POSITION}
      contentEditable={false}
    >
      {showMoveUi ? (
        <CalloutMenu
          Element={(props) => <MoreIcon size={24} {...props} />}
          elementProps={{ style: { display: 'flex' } }}
        >
          {showEdit && editButton}
          {showMoveUi && [
            <div {...styles.padded} key='move'>
              <MoveUp path={path} />
              <MoveDown path={path} />
            </div>,
            <div {...styles.padded} key='insert'>
              <Insert path={path} templates={template.type} />
            </div>,
            <Remove path={path} key='remove' />,
          ]}
        </CalloutMenu>
      ) : (
        editButton
      )}
    </div>
  )
}

export default BlockUi
