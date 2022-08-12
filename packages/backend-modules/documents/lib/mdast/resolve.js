const checkEnv = require('check-env')
const visit = require('unist-util-visit')
const { v4: isUuid } = require('is-uuid')

const { hasFullDocumentAccess } = require('../restrictions')
const {
  createResolver,
  createUrlReplacer,
  getRepoId,
  extractUserUrl,
} = require('../common/resolve')

checkEnv(['FRONTEND_BASE_URL'])

const { DOCUMENTS_LINKS_RESTRICTED } = process.env

const contentUrlResolver = (
  doc,
  _all = [],
  _usernames = [],
  errors,
  urlPrefix,
  searchString,
  user,
) => {
  const docResolver = createResolver(_all, _usernames, errors)
  const externalBaseUrl = docResolver(doc.meta?.format)?.meta?.externalBaseUrl

  const urlReplacer = createUrlReplacer(
    _all,
    _usernames,
    errors,
    urlPrefix,
    searchString,
    externalBaseUrl,
  )

  const stripDocLinks =
    DOCUMENTS_LINKS_RESTRICTED &&
    DOCUMENTS_LINKS_RESTRICTED.split(',').includes(doc.meta?.path) &&
    // user is undefined during publish -> no stripping
    // null during document delivery -> strip unless authorized
    user !== undefined &&
    !hasFullDocumentAccess(user, doc._apiKey)

  visit(doc.content, 'link', (node) => {
    node.url = urlReplacer(node.url, stripDocLinks)
  })
  visit(doc.content, 'zone', (node) => {
    if (node.data) {
      const linkedDoc = docResolver(node.data.url)
      if (linkedDoc) {
        // this is used for the overview page
        // - assigns a publishDate to an teaser
        // - highlights all teasers of a format or series
        node.data.urlMeta = {
          repoId: linkedDoc.meta.repoId,
          publishDate: linkedDoc.meta.publishDate,
          section:
            linkedDoc.meta.template === 'section'
              ? linkedDoc.meta.repoId
              : getRepoId(linkedDoc.meta.section).repoId,
          format:
            linkedDoc.meta.template === 'format'
              ? linkedDoc.meta.repoId
              : getRepoId(linkedDoc.meta.format).repoId,
          series: linkedDoc.meta.series
            ? typeof linkedDoc.meta.series === 'string'
              ? getRepoId(linkedDoc.meta.series).repoId
              : linkedDoc.meta.repoId
            : undefined,
        }
      }
      node.data.url = urlReplacer(node.data.url, stripDocLinks)
      node.data.formatUrl = urlReplacer(node.data.formatUrl, stripDocLinks)
    }
  })

  // Prevent memo node to be exposed
  visit(doc.content, 'span', (node, index, parent) => {
    if (node.data?.type === 'MEMO') {
      // Unwrap node.children into parent.children
      const { children = [] } = node
      parent.children = [
        ...parent.children.slice(0, index),
        ...children,
        ...parent.children.slice(index + 1),
      ]
    }
  })
}

const metaUrlResolver = (
  meta,
  _all,
  _usernames,
  errors,
  urlPrefix,
  searchString,
  user,
  apiKey,
) => {
  const urlReplacer = createUrlReplacer(
    _all,
    _usernames,
    errors,
    urlPrefix,
    searchString,
  )

  meta.series?.episodes?.forEach((episode, index) => {
    if (
      index <= 1 ||
      !episode.document?.meta?.path ||
      episode.document.meta.path === meta.path ||
      user === undefined ||
      hasFullDocumentAccess(user, apiKey)
    ) {
      return
    }

    episode.document = undefined
  })

  meta?.credits?.children
    ?.filter((child) => child.type === 'link')
    .forEach((child) => {
      child.url = urlReplacer(child.url)
    })

  if (user === undefined || !hasFullDocumentAccess(user, apiKey)) {
    meta.recommendations = null
  }
}

const extractIdsFromNode = (node, contextRepoId) => {
  const repos = []
  const users = []
  visit(node, 'zone', (node) => {
    if (node.data) {
      repos.push(getRepoId(node.data.url).repoId)
      repos.push(getRepoId(node.data.formatUrl).repoId)
    }
  })
  visit(node, 'link', (node) => {
    const info = extractUserUrl(node.url)
    if (info) {
      if (isUuid(info.id)) {
        users.push(info.id)
      }
    }
    const { repoId } = getRepoId(node.url, 'autoSlug')
    if (repoId) {
      repos.push(repoId)
    }
  })
  return {
    repos: repos.filter(Boolean),
    users: users.filter(Boolean),
  }
}

module.exports = {
  contentUrlResolver,
  metaUrlResolver,
  extractIdsFromNode,
}
