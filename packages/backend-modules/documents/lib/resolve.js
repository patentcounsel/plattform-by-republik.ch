const {
  getRepoId,
  extractUserUrl,
  metaFieldResolver,
  createResolver,
} = require('./common/resolve')

const resolve = {
  mdast: require('./mdast/resolve'),
  slate: require('./slate/resolve'),
}

const extractIdsFromNode = async (type, node, contextRepoId) => {
  const extractIdsFromNode = resolve[type || 'mdast']?.extractIdsFromNode

  if (!extractIdsFromNode) {
    console.warn(
      `resolve/extractIdsFromNode for type "${type}" not implemented`,
    )
    return
  }

  return extractIdsFromNode(node, contextRepoId)
}

const contentUrlResolver = (
  doc,
  _all = [],
  _usernames = [],
  errors,
  urlPrefix,
  searchString,
  user,
) => {
  const contentUrlResolver = resolve[doc.type || 'mdast']?.contentUrlResolver

  if (!contentUrlResolver) {
    console.warn(
      `resolve/contentUrlResolver for doc.type "${doc.type}" not implemented`,
    )
    return
  }

  return contentUrlResolver(
    doc,
    _all,
    _usernames,
    errors,
    urlPrefix,
    searchString,
    user,
  )
}

const metaUrlResolver = async (
  type,
  meta,
  _all = [],
  _usernames = [],
  errors,
  urlPrefix,
  searchString,
  user,
  apiKey,
) => {
  const metaUrlResolver = resolve[type || 'mdast']?.metaUrlResolver

  if (!metaUrlResolver) {
    console.warn(`resolve/metaUrlResolver for type "${type}" not implemented`)
    return
  }

  return metaUrlResolver(
    meta,
    _all,
    _usernames,
    errors,
    urlPrefix,
    searchString,
    user,
    apiKey,
  )
}

module.exports = {
  getRepoId,
  extractIdsFromNode,
  extractUserUrl,
  createResolver,
  contentUrlResolver,
  metaUrlResolver,
  metaFieldResolver,
}
