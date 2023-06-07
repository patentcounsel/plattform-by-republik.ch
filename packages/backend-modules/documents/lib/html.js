const {
  newsletterEmailSchema,
  createNewsletterEmailSchema,
} = require('@orbiting/backend-modules-styleguide')
const { renderEmail } = require('@republik/mdast-react-render')

const get = (doc) => {
  const emailSchema =
    doc.content.meta.template === 'editorialNewsletter'
      ? createNewsletterEmailSchema() // Because styleguide currently doesn't support module.exports
      : newsletterEmailSchema
  return renderEmail(doc.content, emailSchema)
}

module.exports = {
  get,
}
