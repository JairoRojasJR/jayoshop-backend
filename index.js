require('dotenv').config()
// GlobalsVariables
globalThis.FRONTEND_URL = process.env.FRONTEND_URL
globalThis.PROD_MODE_ENABLE = process.env.MODE === 'prod'
globalThis.ADMIN_MODE_FORCED = process.env.FORCE_ADMIN_MODE === 'force'
globalThis.DB_OPTIONS = 'retryWrites=true&w=majority'
const frontendUrl = process.env.FRONTEND_URL

const express = require('express')
const cors = require('cors')
const MongoStore = require('connect-mongo')
const dbClient = require('./db/connection')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')

// Main configs
const app = express()
const PORT = process.env.PORT || 5000

const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  optionsSuccessStatus: 204
}

const sessionOptions = {
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: dbClient,
    dbName: process.env.DB_NAME
  }),
  cookie: {
    secure: globalThis.PROD_MODE_ENABLE,
    sameSite: 'lax',
    expires: new Date(Date.UTC(new Date().getUTCFullYear() + 100))
  }
}

app.use(cors(corsOptions))

if (globalThis.PROD_MODE_ENABLE) {
  app.set('trust proxy', true)
  sessionOptions.cookie.sameSite = 'none'
}
app.use(session(sessionOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(passport.initialize())
app.use(passport.session())

// Passport config
passport.serializeUser((user, done) => {
  const authData = {
    rol: user.rol,
    isIpAdmin: user.isIpAdmin,
    isAuthenticated: user.isAuthenticated,
    ip: user.ip,
    isAdminModeForce: user.isAdminModeForce,
    isAdminAuthenticated: user.isAdminAuthenticated
  }

  done(null, authData)
})

passport.deserializeUser((user, done) => {
  const authData = {
    rol: user.rol,
    isIpAdmin: user.isIpAdmin,
    isAuthenticated: user.isAuthenticated,
    ip: user.ip,
    isAdminModeForce: user.isAdminModeForce,
    isAdminAuthenticated: user.isAdminAuthenticated
  }

  return done(null, authData)
})

// Validate frontend origin else redirect it to
app.use((req, res, next) => {
  if (process.env.PROD_STATUS === 'public') {
    const isNotFronted = req.headers.referer !== `${frontendUrl}/`
    if (isNotFronted) return res.redirect(frontendUrl)
  }
  next()
})

// Routers
app.use('/api/stream', require('./routers/public/stream'))
app.use('/api/auth', require('./routers/public/auth'))
app.use('/api/inventory', require('./routers/public/inventory'))
app.use('/api/admin', require('./routers/admin/inventory'))
app.get('/', (req, res) => res.redirect(frontendUrl))

// 404 Not found
app.use((req, res) => {
  return res.status(404).send('Página no encontrada😥!')
})

// Server listening
app.listen(PORT, () => {
  const startupLog = `Servidor escuchando en el puerto ${PORT} 🚀🚀🚀  -> Go to http://localhost:${PORT}`
  console.log(startupLog)
})
