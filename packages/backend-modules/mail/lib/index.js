const handlers = {
  deleteEmail: require('./deleteEmail'),
  getNewsletterSettings: require('./getNewsletterSettings'),
  mailLog: require('./mailLog'),
  moveNewsletterSubscriptions: require('./moveNewsletterSubscriptions'),
  sendMailTemplate: require('./sendMailTemplate'),
  unsubscribeEmail: require('./unsubscribeEmail'),
  updateMergeFields: require('./updateMergeFields'),
  updateNewsletterSubscription: require('./updateNewsletterSubscription'),
  updateNewsletterSubscriptions: require('./updateNewsletterSubscriptions'),
  addUserToAudience: require('./updateAudience.js'),

  // MailChimp batch operations types
  operations: {
    covidAccessToken: require('./operations/covidAccessTokens'),
    nameAndEmailBase64u: require('./operations/nameAndEmailBase64u'),
  },
}
const { withConfiguration } = require('../NewsletterSubscription')
const errors = require('../errors')

module.exports = {
  ...handlers,
  createMail: (interestConfiguration, audienceConfiguration) => {
    if (!interestConfiguration)
      throw new errors.SubscriptionConfigurationMissingMailError()
    if (!audienceConfiguration)
      throw new errors.AudienceConfigurationMissingMailError() // TODO add error
    // TODO add audienceConfiguration here too?
    return Object.keys(handlers).reduce(
      (result, handlerName) => {
        return {
          ...result,
          [handlerName]: withConfiguration(
            interestConfiguration,
            handlers[handlerName],
          ),
        }
      },
      { ...errors },
    )
  },
}
