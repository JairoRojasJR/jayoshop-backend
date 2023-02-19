const express = require('express');
require('dotenv').config();
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dbClient = require('./db/connection');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

// Main configs
const app = express();
const PORT = process.env.PORT || 4000;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 204,
};

const sessionOptions = {
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: dbClient,
    dbName: process.env.DB_NAME,
  }),
  cookie: {
    secure: process.env.MODE === 'prod',
    sameSite: 'lax',
  },
};
app.use(cors(corsOptions));

if (process.env.MODE === 'prod') {
  app.set('trust proxy', 1);
  sessionOptions.cookie.sameSite = 'none';
}
app.use(session(sessionOptions));
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, {
    rol: user.rol,
    isIpAdmin: user.isIpAdmin,
    authenticated: user.authenticated,
  });
});

passport.deserializeUser((user, done) => {
  return done(null, {
    rol: user.rol,
    isIpAdmin: user.isIpAdmin,
    authenticated: user.authenticated,
  });
});

// Validate frontend origin else redirect it to
app.use((req, res, next) => {
  // console.log('--- Peticion recibida ---');
  // const frontendUrl = process.env.FRONTEND_URL;
  // if (req.headers.origin !== frontendUrl) return res.redirect(frontendUrl);
  next();
});

// Routers
app.use('/api/auth', require('./routers/auth'));
app.use('/api/admin', require('./routers/admin'));
app.get('/', (req, res) => {
  res.send({ msg: 'Hola mundo' });
});

// Handler errors
app.use((req, res, next) => {
  res.status(404).send('Página no encontrada😥!');
});

// Server listening
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT} 🚀🚀🚀`);
});
