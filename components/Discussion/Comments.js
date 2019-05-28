import React from 'react'
import { css } from 'glamor'
import { compose } from 'react-apollo'
import { format, parse } from 'url'
import produce from 'immer'

import withT from '../../lib/withT'
import timeahead from '../../lib/timeahead'
import timeago from '../../lib/timeago'
import timeduration from '../../lib/timeduration'

import { isAdmin } from './graphql/enhancers/isAdmin'
import { withDiscussionDisplayAuthor } from './graphql/enhancers/withDiscussionDisplayAuthor'
import { withCommentActions } from './graphql/enhancers/withCommentActions'
import { withSubmitComment } from './graphql/enhancers/withSubmitComment'
import { withDiscussionComments } from './graphql/enhancers/withDiscussionComments'

import DiscussionPreferences from './DiscussionPreferences'
import SecondaryActions from './SecondaryActions'
import ShareOverlay from './ShareOverlay'

import {
  Loader,
  DiscussionContext,
  CommentList,
  DEFAULT_PROFILE_PICTURE,
  A,
  colors,
  fontStyles,
  mediaQueries,
  useMediaQuery
} from '@project-r/styleguide'

import { GENERAL_FEEDBACK_DISCUSSION_ID, PUBLIC_BASE_URL } from '../../lib/constants'
import { Link } from '../../lib/routes'
import Meta from '../Frame/Meta'
import { focusSelector } from '../../lib/utils/scroll'
import PathLink from '../Link/Path'

const styles = {
  orderByContainer: css({
    margin: '20px 0'
  }),
  orderBy: css({
    ...fontStyles.sansSerifRegular16,
    outline: 'none',
    color: colors.text,
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    marginRight: '20px',
    [mediaQueries.mUp]: {
      marginRight: '40px'
    }
  }),
  selectedOrderBy: css({
    textDecoration: 'underline'
  }),
  emptyDiscussion: css({
    margin: '20px 0'
  })
}

const getFocusUrl = (path, commentId) => {
  const documentPathObject = parse(path, true)
  const sharePath = format({
    pathname: documentPathObject.pathname,
    query: {
      ...documentPathObject.query,
      focus: commentId
    }
  })
  return PUBLIC_BASE_URL + sharePath
}

const Comments = props => {
  const {
    t,
    now,
    isAdmin,
    focusId,
    orderBy,
    discussionComments: { loading, error, discussion, fetchMore },
    meta,
    sharePath,
    setOrderBy
  } = props

  /*
   * Subscribe to GraphQL updates of the dicsussion query.
   */
  React.useEffect(() => props.discussionComments.subscribe(), [props.discussionComments.subscribe])

  /*
   * Local state: share overlay and discussion preferences.
   */
  const [shareUrl, setShareUrl] = React.useState()
  const [showPreferences, setShowPreferences] = React.useState(false)

  /*
   * Fetching comment that is in focus.
   */
  const [{ currentFocus, focusLoading, focusError }, setFocusState] = React.useState({})
  const fetchFocus = () => {
    /*
     * If we're still loading, or not trying to focus a comment, there is nothing
     * to do for us.
     *
     * If the discussion doesn't exist, someone else will hopefully render a nice
     * 404 / not found message.
     */
    if (loading || !focusId || !discussion) {
      return
    }

    /*
     * If we're loading the focused comment or encountered an error during the loading
     * process, return.
     */
    if (focusLoading || focusError) {
      return
    }

    /*
     * 'focusInfo' is of type Comment, but we only use it to for its parentIds.
     * To get to the content we look up the comment in the nodes list.
     */
    const focusInfo = discussion.comments.focus
    if (!focusInfo) {
      setFocusState({
        focusError: t('discussion/focus/notFound'),
        focusLoading: false
      })
      return
    }

    /*
     * Try to locate the comment in the discussion. If we find it, we can scroll
     * it into the viewport.
     *
     * If we don't find the comment, we attempt to load it. We do it by finding
     * the closests ancestor that we have, and then use the 'fetchMore()' function
     * to load more comments beneath that ancestor. We may have to repeat that
     * process multiple times until we make the comment we want available.
     */
    const focus = discussion.comments.nodes.find(comment => comment.id === focusId)
    if (focus) {
      /*
       * To make sure we don't run 'focusSelector()' multiple times, we store
       * the focused comment in the component state.
       */
      if (currentFocus !== focus) {
        setFocusState(p => ({ ...p, currentFocus: focus }))

        /*
         * Wrap 'focusSelector()' in a timeout to work around a bug. See
         * https://github.com/orbiting/republik-frontend/issues/243 for more
         * details
         */
        setTimeout(() => {
          focusSelector(`[data-comment-id='${focusInfo.id}']`)
        }, 50)
      }
    } else {
      const parentIds = focusInfo.parentIds

      /*
       * Look up the closest parent that is available.
       */
      const closestParentId = []
        .concat(parentIds)
        .reverse()
        .find(id => discussion.comments.nodes.find(node => node.id === id))

      /*
       * We could try to 'fetchMore()' comments at the root level before giving up
       * completely.
       *
       * But hopefully the server will return at least the top-level comment when
       * we include the focusId during the GraphQL request.
       */
      if (!closestParentId) {
        setFocusState({ focusError: t('discussion/focus/missing') })
        return
      }

      /*
       * Fetch missing comments. Calculate the depth to cover just what we need
       * to reach the focused comment.
       */
      const depth = parentIds.length - parentIds.indexOf(closestParentId)
      setFocusState({ focusLoading: true })
      fetchMore(closestParentId, undefined, { depth })
        .then(() => {
          setFocusState({ focusLoading: false })
        })
        .catch(() => {
          setFocusState({ focusError: t('discussion/focus/loadError') })
        })
    }
  }

  React.useEffect(() => {
    fetchFocus()
  })

  const onReload = e => {
    e.preventDefault()
    props.discussionComments.refetch()
  }

  const isDesktop = useMediaQuery(mediaQueries.mUp)

  return (
    <Loader
      loading={loading || (focusId && focusLoading)}
      error={error || (focusId && focusError) || (discussion === null && t('discussion/missing'))}
      render={() => {
        const { focus } = discussion

        if (discussion.comments.totalCount === 0) {
          return <EmptyDiscussion t={t} />
        }

        /*
         * Convert the flat comments list into a tree.
         */
        const comments = asTree(discussion.comments)

        /*
         * Construct the value for the DiscussionContext.
         */
        const discussionContextValue = {
          isAdmin,
          highlightedCommentId: focusId,

          discussion: produce(discussion, draft => {
            if (draft.displayAuthor && !draft.displayAuthor.profilePicture) {
              draft.displayAuthor.profilePicture = DEFAULT_PROFILE_PICTURE
            }
          }),

          actions: {
            submitComment: (parentComment, content, tags) =>
              props.submitComment(parentComment, content, tags).then(() => ({ ok: true }), error => ({ error })),
            editComment: (comment, text, tags) =>
              props.editComment(comment, text, tags).then(() => ({ ok: true }), error => ({ error })),
            upvoteComment: props.upvoteComment,
            downvoteComment: props.downvoteComment,
            unvoteComment: props.unvoteComment,
            unpublishComment: comment => {
              const message = t(`styleguide/CommentActions/unpublish/confirm${comment.userCanEdit ? '' : '/admin'}`, {
                name: comment.displayAuthor.name
              })
              if (!window.confirm(message)) {
                return Promise.reject(new Error())
              } else {
                return props.unpublishComment(comment)
              }
            },
            fetchMoreComments: ({ parentId, after, appendAfter }) => {
              return fetchMore({ parentId, after, appendAfter })
            },
            shareComment: comment => {
              setShareUrl(getFocusUrl(sharePath || discussion.path, comment.id))
              return Promise.resolve({ ok: true })
            },
            openDiscussionPreferences: () => {
              setShowPreferences(true)
              return Promise.resolve({ ok: true })
            }
          },

          clock: {
            now,
            formatTimeRelative: (date, options = {}) => {
              const td = (+date - now) / 1000
              const direction = options.direction || (td > 0 ? 'future' : 'past')

              switch (direction) {
                case 'future': {
                  return timeahead(t, Math.max(0, td))
                }
                case 'past': {
                  /*
                   * On large screens we use the full timeago string. On smaller screens
                   * we abreviate it to just '5h' instead of the full '5 hours ago'.
                   */
                  if (isDesktop) {
                    return timeago(t, Math.max(0, -td))
                  } else {
                    return timeduration(t, Math.max(0, -td))
                  }
                }
              }
            }
          },

          links: {
            Profile: ({ displayAuthor, ...props }) => {
              /*
               * If the username is not available, it means the profile is not public.
               */
              if (displayAuthor.username) {
                return <Link route='profile' params={{ slug: displayAuthor.username }} {...props} />
              } else {
                return <React.Fragment children={props.children} />
              }
            },
            Comment: ({ comment, ...props }) => {
              if (discussion.id === GENERAL_FEEDBACK_DISCUSSION_ID) {
                return <Link route='discussion' params={{ t: 'general', focus: comment.id }} {...props} />
              } else if (
                discussion.document &&
                discussion.document.meta &&
                discussion.document.meta.template === 'article' &&
                discussion.document.meta.ownDiscussion &&
                discussion.document.meta.ownDiscussion.id === discussion.id
              ) {
                return (
                  <Link route='discussion' params={{ t: 'article', id: discussion.id, focus: comment.id }} {...props} />
                )
              } else if (discussion.path) {
                const documentPathObject = parse(discussion.path, true)
                return (
                  <PathLink
                    path={documentPathObject.pathname}
                    query={{ ...documentPathObject.query, focus: comment.id }}
                    replace
                    scroll={false}
                    {...props}
                  />
                )
              } else {
                /* XXX: When does this happen? */
                return <React.Fragment children={props.children} />
              }
            }
          },
          composerSecondaryActions: <SecondaryActions />
        }

        return (
          <>
            <div {...styles.orderByContainer}>
              <OrderBy t={t} orderBy={orderBy} setOrderBy={setOrderBy} value='DATE' />
              <OrderBy t={t} orderBy={orderBy} setOrderBy={setOrderBy} value='VOTES' />
              <OrderBy t={t} orderBy={orderBy} setOrderBy={setOrderBy} value='REPLIES' />
              <A style={{ float: 'right', lineHeight: '25px', cursor: 'pointer' }} href='' onClick={onReload}>
                {t('components/Discussion/reload')}
              </A>
              <br style={{ clear: 'both' }} />
            </div>

            <DiscussionContext.Provider value={discussionContextValue}>
              {focus && meta && (
                <Meta
                  data={{
                    ...meta,
                    title: t('discussion/meta/focus/title', {
                      authorName: focus.displayAuthor.name,
                      discussionTitle: meta.title
                    }),
                    description: focus.preview ? focus.preview.string : undefined,
                    url: getFocusUrl(meta.url, focus.id)
                  }}
                />
              )}

              <CommentList t={t} comments={comments} />

              {showPreferences && (
                <DiscussionPreferences
                  key='discussionPreferenes'
                  discussionId={discussion.id}
                  onClose={() => {
                    setShowPreferences(false)
                  }}
                />
              )}

              {!!shareUrl && (
                <ShareOverlay
                  discussionId={discussion.id}
                  onClose={() => {
                    setShareUrl()
                  }}
                  url={shareUrl}
                  title={discussion.title}
                />
              )}
            </DiscussionContext.Provider>
          </>
        )
      }}
    />
  )
}

export default compose(
  withT,
  withDiscussionDisplayAuthor,
  withCommentActions,
  isAdmin,
  withSubmitComment,
  withDiscussionComments
)(Comments)

const asTree = ({ totalCount, directTotalCount, pageInfo, nodes }) => {
  const convertComment = node => ({
    ...node,
    comments: {
      ...node.comments,
      nodes: childrenOfComment(node.id)
    }
  })

  const childrenOfComment = id => nodes.filter(n => n.parentIds[n.parentIds.length - 1] === id).map(convertComment)

  return {
    totalCount,
    directTotalCount,
    pageInfo,
    nodes: nodes.filter(n => n.parentIds.length === 0).map(convertComment)
  }
}

const EmptyDiscussion = ({ t }) => <div {...styles.emptyDiscussion}>{t('components/Discussion/empty')}</div>

const OrderBy = ({ t, orderBy, setOrderBy, value }) => (
  <button
    {...styles.orderBy}
    {...(orderBy === value ? styles.selectedOrderBy : {})}
    onClick={() => {
      setOrderBy(value)
    }}
  >
    {t(`components/Discussion/OrderBy/${value}`)}
  </button>
)
