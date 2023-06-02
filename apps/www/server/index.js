const path = require('path')
const express = require('express')
const basicAuth = require('express-basic-auth')
const dotenv = require('dotenv')
const next = require('next')
const compression = require('compression')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { COOKIE_NAME } = require('../lib/auth/constants')

const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true
if (DEV || process.env.DOTENV) {
  dotenv.config()
}

const PORT = process.env.PORT || 3005

const { CURTAIN_MESSAGE, PUBLIC_BASE_URL, MASTODON_BASE_URL } = process.env

if (!PUBLIC_BASE_URL) {
  throw new Error(
    'missing PUBLIC_BASE_URL environment variable, but is required by next-js middleware.',
  )
}

const app = next({
  dev: DEV,
  port: PORT,
  hostname: new URL(PUBLIC_BASE_URL).hostname,
})

const handler = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  server.use(
    helmet({
      hsts: {
        maxAge: 60 * 60 * 24 * 365, // 1 year to get preload approval
        preload: true,
        includeSubDomains: true,
      },
      referrerPolicy: {
        policy: 'no-referrer',
      },
    }),
  )

  server.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    if (ip === '107.173.210.245') {
      return res
        .status(429)
        .json({ message: 'Too many requests. Try again later.' })
    }

    next()
  })

  // Disable FLoC
  // @see https://twitter.com/natfriedman/status/1387159870667849731
  server.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'interest-cohort=()')
    next()
  })

  server.use(compression())

  /**
   * WebFinger
   * @see https://www.rfc-editor.org/rfc/rfc7033
   *
   * in use for Mastodon WebFinger redirect
   * "Translate `user@domain` mentions to actor profile URIs."
   * @see https://docs.joinmastodon.org/spec/webfinger/
   *
   */
  if (MASTODON_BASE_URL) {
    server.use('/.well-known/webfinger', (req, res) => {
      res.redirect(process.env.MASTODON_BASE_URL + req.originalUrl)
    })
  }

  // iOS app universal links setup
  // - manual mapping needed to set content type json
  server.use('/.well-known/apple-app-site-association', (req, res) => {
    res.set('Content-Type', 'application/json')
    res.sendFile(
      path.join(
        __dirname,
        '../public',
        '.well-known',
        'apple-app-site-association',
      ),
    )
  })

  // Other .well-known assets as static files
  server.use('/.well-known', express.static('public/.well-known'))

  if (!DEV) {
    server.enable('trust proxy')
    server.use((req, res, next) => {
      if (
        `${req.protocol}://${req.get('Host')}` !== process.env.PUBLIC_BASE_URL
      ) {
        return res.redirect(process.env.PUBLIC_BASE_URL + req.url)
      }
      return next()
    })
  }

  // only attach middle-ware if we're not already past it
  if (CURTAIN_MESSAGE) {
    const ALLOWED_PATHS = [
      '/_next',
      '/_webpack/',
      '/__webpack_hmr',
      '/static/',
      '/manifest',
      '/mitteilung',
    ]
    const ALLOWED_UAS = (process.env.CURTAIN_UA_ALLOW_LIST || '')
      .split(',')
      .filter(Boolean)

    server.use((req, res, next) => {
      const BACKDOOR_URL = process.env.CURTAIN_BACKDOOR_URL || ''
      const cookieOptions = { maxAge: 1000 * 60 * 60 * 24 * 3, httpOnly: true }
      if (req.url === BACKDOOR_URL) {
        res.cookie('OpenSesame', BACKDOOR_URL, cookieOptions)
        return res.redirect('/')
      }

      const cookies =
        (req.headers.cookie && require('cookie').parse(req.headers.cookie)) ||
        {}
      const hasCookie = cookies['OpenSesame'] === BACKDOOR_URL
      if (hasCookie) {
        // content behind backdoor should not be indexed
        // even if a bot ends up with a cookie somehow
        res.set('X-Robots-Tag', 'noindex')
        res.cookie('OpenSesame', BACKDOOR_URL, cookieOptions)
      }
      const reqUa = String(req.get('User-Agent'))
      if (
        hasCookie ||
        ALLOWED_PATHS.some((path) => req.url.startsWith(path)) ||
        ALLOWED_UAS.some((ua) => reqUa.includes(ua))
      ) {
        return next()
      }

      if (req.url !== '/') {
        res.statusCode = 503
      }
      return app.render(req, res, '/curtain', {})
    })
  }

  if (process.env.BASIC_AUTH_PASS) {
    server.use(
      basicAuth({
        users: { [process.env.BASIC_AUTH_USER]: process.env.BASIC_AUTH_PASS },
        challenge: true,
        realm: process.env.BASIC_AUTH_REALM,
      }),
    )
  }

  // tmp unavailable
  server.get('/vote', (req, res) => {
    res.statusCode = 503
    return app.render(req, res, '/503', req.query)
  })
  server.get('/updates/wer-sind-sie', (req, res) => {
    res.statusCode = 503
    return app.render(req, res, '/503', req.query)
  })

  // PayPal donate return url can be posted to
  server.post('/en', (req, res) => {
    return app.render(req, res, '/en', req.query)
  })

  // Catch OPTIONS * requests
  server.options('*', (req, res, next) => {
    if (req.url === '*') {
      return res.sendStatus(400)
    }

    next()
  })

  const ROUTES_WITH_RATE_LIMIT = (process.env.ROUTES_WITH_RATE_LIMIT || '')
    .split(';')
    .filter(Boolean)
  if (ROUTES_WITH_RATE_LIMIT.length) {
    // Rate limiting added on 26.11.2021 to prevent
    // page failing for to many requests
    const rateLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: function (req) {
        const {
          headers: { cookie },
        } = req

        // If user is logged in, 50 requests per minute are allowed. Otherwise, only 5 requests/min allowed.
        if (cookie && cookie.includes(COOKIE_NAME)) {
          return 50
        }
        return 5
      },
      message: 'Too many requests. Try again later.',
    })
    console.log('ROUTES_WITH_RATE_LIMIT', ROUTES_WITH_RATE_LIMIT)
    server.use(ROUTES_WITH_RATE_LIMIT, rateLimiter)
  }

  // Public static files
  // Check .well-known assets as static files before PUBLIC_BASE_URL redirect
  server.use(express.static('public'))

  server.all('*', (req, res) => {
    return handler(req, res)
  })

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${PORT}`)
  })
})
