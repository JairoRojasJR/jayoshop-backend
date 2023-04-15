require('dotenv').config()
const express = require('express')
const cors = require('cors')
const MongoStore = require('connect-mongo')
const dbClient = require('./db/connection')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')

// GlobalsVariables
globalThis.isProdMode = process.env.MODE === 'prod'
globalThis.adminModeForced = process.env.FORCE_ADMIN_MODE === 'force'

// Useful variables
const frontendUrl = process.env.FRONTEND_URL
const frontendUrlDev = process.env.FRONTEND_URL_DEV
const isProdMode = process.env.MODE === 'prod'
const isPreProdMode = process.env.MODE === 'preprod'

// Main configs
const app = express()
const PORT = process.env.PORT || 5000

const corsOptions = {
  origin: [frontendUrl, frontendUrlDev],
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
    secure: isProdMode || isPreProdMode,
    sameSite: 'lax',
    expires: new Date(Date.UTC(new Date().getUTCFullYear() + 100))
  }
}
app.use(cors(corsOptions))

if (isProdMode || isPreProdMode) {
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
// app.use((req, res, next) => {
//   const isFrontendOrigin = req.headers.origin === frontendUrl
//   if (isProdMode && !isFrontendOrigin) return res.redirect(frontendUrl)
//   next()
// })

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
  console.log(`Servidor escuchando en el puerto ${PORT} 🚀🚀🚀`)
})
