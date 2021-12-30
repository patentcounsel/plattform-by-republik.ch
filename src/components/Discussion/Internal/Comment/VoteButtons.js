import React, { useMemo } from 'react'
import { css } from 'glamor'
import IconButton from '../../../IconButton'
import { ArrowDownIcon, ArrowUpIcon } from '../../../Icons'
import { useColorContext } from '../../../Colors/ColorContext'
import { fontStyles } from '../../../Typography'

const styles = {
  votes: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto'
  }),
  vote: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  voteNumber: css({
    ...fontStyles.sansSerifMedium14,
    fontFeatureSettings: '"tnum" 1'
  }),
  voteDivider: css({
    padding: '0 2px'
  }),
  voteButton: css({
    margin: 0
  })
}

export const VoteButtons = ({
  t,
  comment,
  disabled = false,
  handleUpVote,
  handleDownVote,
  handleUnVote
}) => {
  const [colorScheme] = useColorContext()

  const upVoteHandler = useMemo(() => {
    return comment?.userVote !== 'UP' ? handleUpVote : handleUnVote
  }, [comment])

  const downVoteHandler = useMemo(() => {
    return comment?.userVote !== 'DOWN' ? handleDownVote : handleUnVote
  }, [comment])

  return (
    <div {...styles.votes}>
      <div {...styles.vote}>
        <IconButton
          size={24}
          fill={comment.userVote === 'UP' && colorScheme.getCSSColor('primary')}
          Icon={ArrowUpIcon}
          disabled={disabled}
          onClick={() => upVoteHandler(comment.id)}
          title={t('styleguide/CommentActions/upvote')}
          noMargin
        />
        <span
          {...styles.voteNumber}
          title={t.pluralize('styleguide/CommentActions/upvote/count', {
            count: comment.upVotes
          })}
        >
          {comment.upVotes}
        </span>
      </div>
      <div {...styles.voteDivider} {...colorScheme.set('color', 'text')}>
        /
      </div>
      <div {...styles.vote}>
        <span
          {...styles.voteNumber}
          title={t.pluralize('styleguide/CommentActions/downvote/count', {
            count: comment.downVotes
          })}
        >
          {comment.downVotes}
        </span>
        <IconButton
          size={24}
          fill={
            comment.userVote === 'DOWN' && colorScheme.getCSSColor('primary')
          }
          Icon={ArrowDownIcon}
          disabled={disabled}
          onClick={() => downVoteHandler(comment.id)}
          title={t('styleguide/CommentActions/downvote')}
          noMargin
        />
      </div>
    </div>
  )
}
