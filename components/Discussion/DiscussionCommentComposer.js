import React, { PureComponent } from 'react'
import { compose } from 'react-apollo'
import timeahead from '../../lib/timeahead'
import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import { Link } from '../../lib/routes'

import { withDiscussionDisplayAuthor, withDiscussionPreferences, submitComment } from './enhancers'
import DiscussionPreferences from './DiscussionPreferences'
import SecondaryActions from './SecondaryActions'

import { Loader, CommentComposer, CommentComposerPlaceholder, Interaction, Editorial } from '@project-r/styleguide'

import Box from '../Frame/Box'

class DiscussionCommentComposer extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      state: props.state || 'idle', // idle | focused | submitting | error
      error: undefined, // If state == error then this is the error string.
      showPreferences: false
    }

    this.onFocus = () => {
      this.setState({
        state: 'focused',
        error: undefined
      })
    }

    this.onCancel = () => {
      this.setState({
        state: 'idle',
        error: undefined
      })
    }

    this.showPreferences = () => {
      this.setState({
        showPreferences: true
      })
    }

    this.closePreferences = () => {
      this.setState({
        showPreferences: false
      })
    }

    this.submitComment = (content, tags) => {
      this.setState({
        state: 'submitting'
      })

      this.props.submitComment(null, content, tags).then(
        () => {
          this.setState({
            state: 'idle',
            error: undefined
          })
          if (this.props.afterSubmit) {
            return this.props.afterSubmit()
          }
        },
        (e) => {
          this.setState({
            state: 'error',
            error: e
          })
        }
      )
    }
  }

  render () {
    const {
      t, discussionId, discussionDisplayAuthor: displayAuthor, me,
      discussionClosed,
      discussionUserCanComment,
      data: { loading, error, discussion },
      now,
      parentId
    } = this.props
    const { state, showPreferences } = this.state

    const timeAheadFromNow = (dateString) => {
      return timeahead(t, (now - Date.parse(dateString)) / 1000)
    }

    return (
      <Loader
        loading={loading}
        error={error || (discussion === null && t('discussion/missing'))}
        render={() => {
          const disableTopLevelComments = !!discussion.rules.disableTopLevelComments && parentId === null
          if (!me || disableTopLevelComments) {
            return null
          } else if (discussionClosed) {
            return (
              <Box style={{ padding: '15px 20px' }}>
                {t('discussion/closed')}
              </Box>
            )
          } else {
            if (!discussionUserCanComment) {
              return (
                <Box style={{ padding: '15px 20px' }}>
                  <Interaction.P>
                    {t.elements('submitComment/notEligible', {
                      pledgeLink: (
                        <Link route='pledge' key='pledge' passHref>
                          <Editorial.A>
                            {t('submitComment/notEligible/pledgeText')}
                          </Editorial.A>
                        </Link>
                      )
                    })}
                  </Interaction.P>
                </Box>
              )
            }

            const waitUntilDate = discussion.userWaitUntil && new Date(discussion.userWaitUntil)
            if (waitUntilDate && waitUntilDate > new Date()) {
              return (
                <Box style={{ padding: '15px 20px' }}>
                  <Interaction.P>
                    {t('styleguide/CommentComposer/wait', { time: timeAheadFromNow(waitUntilDate) })}
                  </Interaction.P>
                </Box>
              )
            }

            if (state === 'idle') {
              return (
                <CommentComposerPlaceholder
                  t={t}
                  profilePicture={displayAuthor ? displayAuthor.profilePicture : null}
                  onClick={this.onFocus}
                />
              )
            }

            return (
              <div>
                <CommentComposer
                  t={t}
                  displayAuthor={displayAuthor}
                  error={this.state.error}
                  onEditPreferences={this.showPreferences}
                  onCancel={this.onCancel}
                  submitComment={this.submitComment}
                  submitLabel={t('submitComment/rootSubmitLabel')}
                  secondaryActions={<SecondaryActions />}
                  maxLength={discussion && discussion.rules && discussion.rules.maxLength}
                  tags={discussion.tags}
                  tagRequired={discussion.tagRequired}
                />
                {showPreferences && (
                  <DiscussionPreferences
                    discussionId={discussionId}
                    onClose={this.closePreferences}
                  />
                )}
              </div>
            )
          }
        }}
      />
    )
  }
}

export default compose(
  withT,
  withMe,
  withDiscussionDisplayAuthor,
  withDiscussionPreferences,
  submitComment
)(DiscussionCommentComposer)
